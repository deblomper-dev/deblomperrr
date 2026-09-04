const GRAPHQL = "https://api.github.com/graphql";
const TIMEOUT_MS = 15_000;

export interface ContributionDay {
  contributionCount: number;
  date: string;
}

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const cacheMap = new Map<string, { data: ContributionDay[]; at: number }>();
const inflightMap = new Map<string, Promise<ContributionDay[]>>();

async function fetchContributionsFromAPI(token: string, username: string): Promise<ContributionDay[]> {
  const now = new Date();
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const query = `query {
    user(login: "${username}") {
      contributionsCollection(from: "${oneYearAgo.toISOString()}", to: "${now.toISOString()}") {
        contributionCalendar {
          totalContributions
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

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(GRAPHQL, {
      method: "POST",
      headers: {
        Authorization: `bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "deblomperr-portfolio",
      },
      body: JSON.stringify({ query }),
      signal: controller.signal,
    });
  } catch (err: unknown) {
    const error = err as Error;
    if (error?.name === "AbortError") {
      throw new Error(`GitHub GraphQL API timeout after ${TIMEOUT_MS}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }

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
}

export async function fetchContributions(token?: string, username?: string, force = false): Promise<ContributionDay[]> {
  const effectiveToken = token || process.env.GITHUB_TOKEN;
  const effectiveUsername = username || process.env.GITHUB_USERNAME || "nub-coders";

  const cached = cacheMap.get(effectiveUsername);

  if (!effectiveToken) {
    if (cached?.data) {
      return cached.data;
    }
    throw new Error("GITHUB_TOKEN environment variable is not set.");
  }

  // Fresh cache hit
  if (!force && cached && Date.now() - cached.at < CACHE_TTL_MS) {
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

  // Stale-While-Revalidate
  if (!force && cached?.data) {
    const promise = fetchContributionsFromAPI(effectiveToken, effectiveUsername)
      .then((days) => {
        cacheMap.set(effectiveUsername, { data: days, at: Date.now() });
        return days;
      })
      .catch((err) => {
        console.error("[GitHub Contributions Background Refresh Error]", err?.message ?? err);
        return cached.data;
      })
      .finally(() => {
        inflightMap.delete(effectiveUsername);
      });
    inflightMap.set(effectiveUsername, promise);
    return cached.data;
  }

  // Cold fetch
  const promise = (async () => {
    try {
      const days = await fetchContributionsFromAPI(effectiveToken, effectiveUsername);
      cacheMap.set(effectiveUsername, { data: days, at: Date.now() });
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
  return promise;
}
