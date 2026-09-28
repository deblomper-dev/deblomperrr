const GRAPHQL = "https://api.github.com/graphql";
export const GITHUB_TIMEOUT_MS = 15_000;

const CONTRIBUTIONS_QUERY = `query Contributions($username: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $username) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        weeks {
          contributionDays {
            contributionCount
            date
          }
        }
      }
    }
  }
}`;

export interface ContributionDay {
  contributionCount: number;
  date: string;
}

export const GITHUB_CACHE_TTL_MS = 10 * 60 * 1000;
export const GITHUB_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
export const GITHUB_CACHE_MAX_USERS = 100;
export const GITHUB_REQUEST_WINDOW_MS = 10 * 60 * 1000;
export const GITHUB_PUBLIC_REQUEST_LIMIT = 60;
export const GITHUB_PUBLIC_CONCURRENCY = 4;

const cacheMap = new Map<string, { data: ContributionDay[]; at: number }>();
const inflightMap = new Map<string, Promise<ContributionDay[]>>();

// The configured profile has its own small allowance so arbitrary usernames
// cannot consume the requests needed by the portfolio's own graphs.
const publicBudget = { timestamps: [] as number[], active: 0, limit: GITHUB_PUBLIC_REQUEST_LIMIT, concurrency: GITHUB_PUBLIC_CONCURRENCY };
const profileBudget = { timestamps: [] as number[], active: 0, limit: 6, concurrency: 1 };

export class GitHubRequestLimitError extends Error {
  constructor(public readonly retryAfter: number) {
    super("GitHub contribution request budget exhausted.");
    this.name = "GitHubRequestLimitError";
  }
}

export function normalizeGitHubUsername(username: string): string {
  if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username) || username.includes("--")) {
    throw new Error("Invalid GitHub username.");
  }
  return username.toLowerCase();
}

function defaultUsername(): string {
  return normalizeGitHubUsername(process.env.GITHUB_USERNAME || "nub-coders");
}

function reserveRequest(username: string): () => void {
  const budget = username === defaultUsername() ? profileBudget : publicBudget;
  const now = Date.now();
  budget.timestamps = budget.timestamps.filter((at) => now - at < GITHUB_REQUEST_WINDOW_MS);
  if (budget.timestamps.length >= budget.limit) {
    throw new GitHubRequestLimitError(Math.max(1, Math.ceil((budget.timestamps[0] + GITHUB_REQUEST_WINDOW_MS - now) / 1000)));
  }
  if (budget.active >= budget.concurrency) {
    throw new GitHubRequestLimitError(Math.ceil(GITHUB_TIMEOUT_MS / 1000));
  }
  budget.timestamps.push(now);
  budget.active++;
  return () => { budget.active--; };
}

function readCache(username: string) {
  const now = Date.now();
  for (const [key, entry] of cacheMap) {
    if (now - entry.at >= GITHUB_CACHE_MAX_AGE_MS) cacheMap.delete(key);
  }
  const cached = cacheMap.get(username);
  if (cached) {
    cacheMap.delete(username);
    cacheMap.set(username, cached);
  }
  return cached;
}

function writeCache(username: string, data: ContributionDay[]) {
  cacheMap.delete(username);
  cacheMap.set(username, { data, at: Date.now() });
  while (cacheMap.size > GITHUB_CACHE_MAX_USERS) {
    const oldest = cacheMap.keys().next().value;
    if (oldest === undefined) break;
    cacheMap.delete(oldest);
  }
}

/** Reset settled state between isolated tests; callers must await active requests first. */
export function resetContributionState(): void {
  cacheMap.clear();
  inflightMap.clear();
  for (const budget of [publicBudget, profileBudget]) {
    budget.timestamps = [];
    budget.active = 0;
  }
}

async function fetchContributionsFromAPI(token: string, username: string): Promise<ContributionDay[]> {
  const releaseRequest = reserveRequest(username);
  const now = new Date();
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GITHUB_TIMEOUT_MS);

  try {
    const res = await fetch(GRAPHQL, {
      method: "POST",
      headers: {
        Authorization: `bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "deblomperr-portfolio",
      },
      body: JSON.stringify({
        query: CONTRIBUTIONS_QUERY,
        variables: { username, from: oneYearAgo.toISOString(), to: now.toISOString() },
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`GitHub GraphQL API error: ${res.status}`);
    }

    interface ContributionsResponse {
      data?: {
        user: {
          contributionsCollection: {
            contributionCalendar: {
              weeks: { contributionDays: ContributionDay[] }[];
            };
          };
        };
      };
      errors?: { message: string }[];
    }

    const json = (await res.json()) as ContributionsResponse;
    if (json.errors) {
      throw new Error(`GraphQL error: ${json.errors[0]?.message}`);
    }

    const weeks = json.data?.user?.contributionsCollection?.contributionCalendar?.weeks;
    if (!weeks) {
      throw new Error("Invalid GraphQL contributions response structure");
    }

    const days: ContributionDay[] = [];
    for (const week of weeks) {
      for (const day of week.contributionDays) {
        days.push(day);
      }
    }
    return days;
  } catch (err: unknown) {
    if (controller.signal.aborted) {
      throw new Error(`GitHub GraphQL API timeout after ${GITHUB_TIMEOUT_MS}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
    releaseRequest();
  }
}

export async function fetchContributions(token?: string, username?: string, force = false): Promise<ContributionDay[]> {
  const effectiveToken = token || process.env.GITHUB_TOKEN;
  const effectiveUsername = username ? normalizeGitHubUsername(username) : defaultUsername();

  const cached = readCache(effectiveUsername);

  if (!effectiveToken) {
    if (cached?.data) {
      return cached.data;
    }
    throw new Error("GITHUB_TOKEN environment variable is not set.");
  }

  // Fresh cache hit
  if (!force && cached && Date.now() - cached.at < GITHUB_CACHE_TTL_MS) {
    return cached.data;
  }

  // In-flight coalescing
  const inflight = inflightMap.get(effectiveUsername);
  if (inflight) {
    if (!force && cached?.data) {
      return cached.data;
    }
    return inflight;
  }

  // A stale hit returns immediately while one shared refresh updates the cache.
  // Errors retain that stale data only until its bounded maximum age.
  const promise = (async () => {
    try {
      const days = await fetchContributionsFromAPI(effectiveToken, effectiveUsername);
      writeCache(effectiveUsername, days);
      return days;
    } catch (err: unknown) {
      if (cached?.data) {
        console.warn("[GitHub Contributions] Fetch failed, serving stale cache:", (err as Error)?.message ?? err);
        return cached.data;
      }
      throw err;
    } finally {
      inflightMap.delete(effectiveUsername);
    }
  })();

  inflightMap.set(effectiveUsername, promise);
  return !force && cached ? cached.data : promise;
}
