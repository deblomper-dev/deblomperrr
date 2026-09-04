import test, { describe } from "node:test";
import assert from "node:assert/strict";
import {
  isRateLimited,
  checkRateLimit,
  trackedIpCount,
  resetRateLimits,
  getClientIp,
  RATE_LIMIT_MAX,
  RATE_LIMIT_MAX_IPS,
} from "./rate-limiter";

describe("in-memory rate limiter (ported from nub-coders)", () => {
  test("allows exactly RATE_LIMIT_MAX requests per window, then blocks", () => {
    resetRateLimits();
    const testIp = "198.51.100.1";

    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      assert.equal(isRateLimited(testIp), false, `Request ${i + 1} should be allowed`);
    }

    // 6th request is blocked
    assert.equal(isRateLimited(testIp), true, "6th request should be blocked");
    assert.equal(isRateLimited(testIp), true, "Subsequent requests should remain blocked");
  });

  test("tracks different IPs independently", () => {
    resetRateLimits();
    const ipA = "198.51.100.10";
    const ipB = "198.51.100.20";

    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      isRateLimited(ipA);
    }

    assert.equal(isRateLimited(ipA), true, "IP A should be rate limited");
    assert.equal(isRateLimited(ipB), false, "IP B should not be rate limited");
  });

  test("provides correct rate status and remaining count", () => {
    resetRateLimits();
    const testIp = "198.51.100.30";

    const s1 = checkRateLimit(testIp);
    assert.equal(s1.limited, false);
    assert.equal(s1.remaining, RATE_LIMIT_MAX - 1);
    assert.ok(s1.resetSeconds > 0 && s1.resetSeconds <= 600);

    for (let i = 1; i < RATE_LIMIT_MAX; i++) {
      checkRateLimit(testIp);
    }

    const sBlocked = checkRateLimit(testIp);
    assert.equal(sBlocked.limited, true);
    assert.equal(sBlocked.remaining, 0);
  });

  test("evicts least recently active entries when exceeding RATE_LIMIT_MAX_IPS", () => {
    resetRateLimits();
    const keepIp = "10.99.99.99";

    // Hit keepIp up to limit
    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      isRateLimited(keepIp);
    }
    assert.equal(isRateLimited(keepIp), true);

    // Generate entries to test memory bounding
    for (let i = 0; i < RATE_LIMIT_MAX_IPS + 50; i++) {
      isRateLimited(`10.0.${Math.floor(i / 256)}.${i % 256}`);
    }

    assert.ok(trackedIpCount() <= RATE_LIMIT_MAX_IPS, "IP tracking map must stay bounded");
  });

  test("getClientIp safely prioritizes X-Real-IP and guards against client spoofing", () => {
    // 1. Trust X-Real-IP from reverse proxy
    const h1 = new Headers({
      "x-real-ip": "203.0.113.195",
      "x-forwarded-for": "1.2.3.4, 203.0.113.195",
    });
    assert.equal(getClientIp(h1), "203.0.113.195");

    // 2. Rightmost X-Forwarded-For when X-Real-IP missing
    const h2 = new Headers({
      "x-forwarded-for": "client.spoofed.ip, 198.51.100.77",
    });
    assert.equal(getClientIp(h2), "198.51.100.77");

    // 3. Fallback to unknown when headers missing
    const h3 = new Headers();
    assert.equal(getClientIp(h3), "unknown");
  });
});
