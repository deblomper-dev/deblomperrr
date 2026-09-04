// ── Minimal in-memory per-IP rate limiter (ported from nub-coders) ───────────
// Sliding window over accepted requests: 5 per 10-minute window per IP.
// Memory bound with lazy inline sweeps and LRU eviction.

export const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
export const RATE_LIMIT_MAX = 5;
// Ceiling on tracked IPs. This map is the only structure here that grows with
// traffic rather than with the window, and a scanner walking a /16 would
// otherwise expand it without bound inside a 512 MB container.
export const RATE_LIMIT_MAX_IPS = 10_000;
export const SWEEP_INTERVAL_MS = 60 * 1000;

const hits = new Map<string, number[]>();
let lastSweepAt = 0;

/**
 * Drop IPs whose newest hit has aged out of the window. Runs inline, at most
 * once a minute: a setInterval would have to be unref'd and torn down on
 * shutdown, and this map only changes when a request arrives anyway.
 */
function sweep(now: number) {
  if (now - lastSweepAt < SWEEP_INTERVAL_MS) return;
  lastSweepAt = now;
  // Collect first, delete after: mutating a Map mid-iteration is asking for it.
  const stale: string[] = [];
  hits.forEach((timestamps, key) => {
    const newest = timestamps[timestamps.length - 1] ?? 0;
    if (now - newest >= RATE_LIMIT_WINDOW_MS) stale.push(key);
  });
  for (const key of stale) hits.delete(key);
}

export type RateLimitStatus = {
  limited: boolean;
  remaining: number;
  resetSeconds: number;
  resetAt: number;
};

/**
 * Sliding window over *accepted* requests: `RATE_LIMIT_MAX` per window per IP.
 *
 * Exported for tests — matching the exact implementation in nub-coders.
 */
export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  sweep(now);

  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  const limited = recent.length >= RATE_LIMIT_MAX;

  // Rejected attempts are counted but not recorded. Appending them would let a
  // flood grow one array without bound and pay an O(n) filter on every hit.
  if (!limited) recent.push(now);

  // delete-then-set re-appends the key, so the Map's insertion order doubles as
  // a recency order and the eviction below is a true LRU.
  hits.delete(ip);
  hits.set(ip, recent);

  if (hits.size > RATE_LIMIT_MAX_IPS) {
    const overflow = hits.size - RATE_LIMIT_MAX_IPS;
    // forEach visits in insertion order, so the first entries are the least
    // recently active. Only `overflow` keys are collected, never the whole map.
    const evict: string[] = [];
    hits.forEach((_timestamps, key) => {
      if (evict.length < overflow) evict.push(key);
    });
    for (const key of evict) hits.delete(key);
  }

  return limited;
}

/**
 * Detailed status for rate limit response headers (Retry-After, X-RateLimit-*)
 */
export function checkRateLimit(ip: string): RateLimitStatus {
  const now = Date.now();
  const limited = isRateLimited(ip);
  const timestamps = hits.get(ip) ?? [];
  const oldest = timestamps[0] ?? now;
  const resetMs = oldest + RATE_LIMIT_WINDOW_MS;
  const resetSeconds = Math.max(1, Math.ceil((resetMs - now) / 1000));
  const resetAt = Math.ceil(resetMs / 1000);
  const remaining = Math.max(0, RATE_LIMIT_MAX - timestamps.length);

  return { limited, remaining, resetSeconds, resetAt };
}

/** Number of IPs currently tracked. Exported so tests can pin the memory bound. */
export function trackedIpCount(): number {
  return hits.size;
}

/** Reset map state for testing. */
export function resetRateLimits(): void {
  hits.clear();
  lastSweepAt = 0;
}

/**
 * Resolves the genuine client IP address behind Traefik reverse proxy.
 *
 * Traefik sets `X-Real-IP` to the connecting client address and appends to
 * `X-Forwarded-For`. We NEVER take the leftmost entry of `X-Forwarded-For`
 * directly because clients can spoof it. We trust `X-Real-IP` first, then
 * fallback to the rightmost proxy hop or 'unknown'.
 */
export function getClientIp(headers: Headers): string {
  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp && realIp !== "unknown") return realIp;

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded.split(",").map((h) => h.trim()).filter(Boolean);
    if (hops.length > 0) {
      // Rightmost entry is appended by the closest trusted reverse proxy
      return hops[hops.length - 1];
    }
  }

  return "unknown";
}
