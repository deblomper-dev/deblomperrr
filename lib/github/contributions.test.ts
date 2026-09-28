import { afterEach, beforeEach, mock, test } from "node:test";
import assert from "node:assert/strict";
import { setImmediate } from "node:timers/promises";
import { NextRequest } from "next/server";
import { GET } from "../../app/api/github/[slug]/route";
import {
  fetchContributions,
  resetContributionState,
  GITHUB_CACHE_MAX_AGE_MS,
  GITHUB_CACHE_MAX_USERS,
  GITHUB_CACHE_TTL_MS,
  GITHUB_PUBLIC_CONCURRENCY,
  GITHUB_PUBLIC_REQUEST_LIMIT,
  GITHUB_REQUEST_WINDOW_MS,
  GITHUB_TIMEOUT_MS,
} from "./contributions";

const originalEnv = process.env;
const NOW = Date.parse("2026-09-23T12:00:00Z");

beforeEach(() => {
  process.env = { ...originalEnv, GITHUB_TOKEN: "test-github-token", GITHUB_USERNAME: "portfolio-owner" };
  resetContributionState();
  mock.method(console, "error", () => {});
  mock.method(console, "warn", () => {});
  mock.method(globalThis, "fetch", async () => {
    throw new Error("Unexpected external request in GitHub test.");
  });
});

afterEach(() => {
  process.env = originalEnv;
  resetContributionState();
  mock.restoreAll();
  mock.timers.reset();
});

function apiResponse(count = 3) {
  return Response.json({
    data: {
      user: {
        contributionsCollection: {
          contributionCalendar: {
            weeks: [{ contributionDays: [{ contributionCount: count, date: "2026-09-23" }] }],
          },
        },
      },
    },
  });
}

function getSvg(params: Record<string, string> = {}, slug = "streak-capsules.svg") {
  const search = new URLSearchParams(params);
  return GET(new NextRequest(`http://localhost/api/github/${slug}?${search}`), { params: Promise.resolve({ slug }) });
}

test("both SVG routes reject malformed usernames and GraphQL injection before fetching", async () => {
  const fetchMock = mock.method(globalThis, "fetch", async () => apiResponse());
  const invalid = [
    'nub-coders") { login } injected: viewer { login } user(login:"nub-coders',
    "-leading", "trailing-", "two--hyphens", "a/b", "white space", "x".repeat(40),
  ];
  for (const slug of ["streak-capsules.svg", "contribution-graph.svg"]) {
    for (const username of invalid) {
      const response = await getSvg({ username }, slug);
      assert.equal(response.status, 400);
      assert.equal(response.headers.get("Cache-Control"), "no-store");
    }
  }
  assert.equal(fetchMock.mock.callCount(), 0);
});

test("GitHub usernames and date ranges are passed as variables to one fixed query", async () => {
  const bodies: { query: string; variables: { username: string; from: string; to: string } }[] = [];
  mock.method(globalThis, "fetch", async (url: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
    assert.equal(String(url), "https://api.github.com/graphql");
    assert.equal(new Headers(init?.headers).get("Authorization"), "bearer test-github-token");
    bodies.push(JSON.parse(String(init?.body)));
    return apiResponse();
  });
  assert.equal((await getSvg({ user: "MiXeD-Case" })).status, 200);
  assert.equal((await getSvg({ user: "OtherUser" })).status, 200);
  assert.equal(bodies[0].query, bodies[1].query);
  assert.match(bodies[0].query, /user\(login: \$username\)/);
  assert.equal(bodies[0].variables.username, "mixed-case");
  assert.equal(bodies[1].variables.username, "otheruser");
  assert.ok(Date.parse(bodies[0].variables.from) < Date.parse(bodies[0].variables.to));
  assert.ok(!bodies[0].query.includes("mixed-case"));
});

test("public force parameters and username casing cannot bypass the shared SVG cache", async () => {
  const fetchMock = mock.method(globalThis, "fetch", async () => apiResponse());
  for (let i = 0; i < 7; i++) {
    const response = await getSvg(
      { user: i % 2 ? "MiXeD-Case" : "mixed-case", force: "true", v: String(i) },
      i % 2 ? "contribution-graph.svg" : "streak-capsules.svg",
    );
    assert.equal(response.status, 200);
    assert.match(response.headers.get("Content-Type") ?? "", /image\/svg\+xml/);
  }
  assert.equal(fetchMock.mock.callCount(), 1);
});

test("public request budget stops distinct usernames but preserves cached stats and profile refreshes", async () => {
  mock.timers.enable({ apis: ["Date"], now: NOW });
  const fetchMock = mock.method(globalThis, "fetch", async () => apiResponse());
  for (let i = 0; i < GITHUB_PUBLIC_REQUEST_LIMIT; i++) {
    assert.equal((await getSvg({ user: `public-${i}` })).status, 200);
  }
  const blocked = await getSvg({ user: "over-budget" });
  assert.equal(blocked.status, 429);
  assert.equal(blocked.headers.get("Retry-After"), String(GITHUB_REQUEST_WINDOW_MS / 1000));
  assert.equal(blocked.headers.get("Cache-Control"), "no-store");
  assert.equal(fetchMock.mock.callCount(), GITHUB_PUBLIC_REQUEST_LIMIT);
  assert.equal((await getSvg({ user: "PUBLIC-0" })).status, 200);
  assert.equal((await getSvg()).status, 200);
  assert.equal(fetchMock.mock.callCount(), GITHUB_PUBLIC_REQUEST_LIMIT + 1);
  mock.timers.tick(GITHUB_REQUEST_WINDOW_MS);
  assert.equal((await getSvg({ user: "over-budget" })).status, 200);
  assert.equal(fetchMock.mock.callCount(), GITHUB_PUBLIC_REQUEST_LIMIT + 2);
});

test("concurrent cold requests coalesce across username casing and SVG types", async () => {
  let finish!: (response: Response) => void;
  const fetchMock = mock.method(globalThis, "fetch", () => new Promise<Response>((resolve) => { finish = resolve; }));
  const first = getSvg({ user: "Coalesced" });
  const second = getSvg({ user: "COALESCED" }, "contribution-graph.svg");
  await setImmediate();
  assert.equal(fetchMock.mock.callCount(), 1);
  finish(apiResponse());
  assert.equal((await first).status, 200);
  assert.equal((await second).status, 200);
});

test("public concurrent requests are bounded while the configured profile retains a slot", async () => {
  const finish: ((response: Response) => void)[] = [];
  const fetchMock = mock.method(globalThis, "fetch", async (_url: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
    if (JSON.parse(String(init?.body)).variables.username === "portfolio-owner") return apiResponse();
    return new Promise<Response>((resolve) => { finish.push(resolve); });
  });
  const requests = Array.from({ length: GITHUB_PUBLIC_CONCURRENCY }, (_, i) => getSvg({ user: `pending-${i}` }));
  await setImmediate();
  try {
    assert.equal((await getSvg({ user: "excess-concurrency" })).status, 429);
    assert.equal(fetchMock.mock.callCount(), GITHUB_PUBLIC_CONCURRENCY);
    assert.equal((await getSvg()).status, 200);
  } finally {
    for (const resolve of finish) resolve(apiResponse());
    for (const response of await Promise.all(requests)) assert.equal(response.status, 200);
  }
});

test("stale data returns immediately while one shared refresh updates it", async () => {
  mock.timers.enable({ apis: ["Date"], now: NOW });
  mock.method(globalThis, "fetch", async () => apiResponse(3));
  const initial = await fetchContributions(undefined, "stale-user");
  mock.timers.tick(GITHUB_CACHE_TTL_MS);
  let finish!: (response: Response) => void;
  const refresh = mock.method(globalThis, "fetch", () => new Promise<Response>((resolve) => { finish = resolve; }));
  assert.deepEqual(await fetchContributions(undefined, "stale-user"), initial);
  assert.deepEqual(await fetchContributions(undefined, "STALE-USER"), initial);
  assert.equal(refresh.mock.callCount(), 1);
  const waiting = fetchContributions(undefined, "stale-user", true);
  finish(apiResponse(9));
  assert.equal((await waiting)[0].contributionCount, 9);
  assert.equal((await fetchContributions(undefined, "stale-user"))[0].contributionCount, 9);
  assert.equal(refresh.mock.callCount(), 1);
});

test("upstream failures use stale data only within its maximum retention age", async () => {
  mock.timers.enable({ apis: ["Date"], now: NOW });
  mock.method(globalThis, "fetch", async () => apiResponse());
  const initial = await fetchContributions(undefined, "fallback-user");
  mock.timers.tick(GITHUB_CACHE_TTL_MS);
  mock.method(globalThis, "fetch", async () => { throw new Error("Mock upstream unavailable"); });
  assert.deepEqual(await fetchContributions(undefined, "fallback-user", true), initial);
  mock.timers.tick(GITHUB_CACHE_MAX_AGE_MS - GITHUB_CACHE_TTL_MS);
  await assert.rejects(fetchContributions(undefined, "fallback-user"), /Mock upstream unavailable/);
});

test("retained calendars use a bounded least-recently-used cache", async () => {
  mock.timers.enable({ apis: ["Date"], now: NOW });
  const fetchMock = mock.method(globalThis, "fetch", async () => apiResponse());
  for (let i = 0; i < GITHUB_CACHE_MAX_USERS; i++) {
    if (i > 0 && i % GITHUB_PUBLIC_REQUEST_LIMIT === 0) mock.timers.tick(GITHUB_REQUEST_WINDOW_MS);
    await fetchContributions(undefined, `cached-${i}`);
  }
  delete process.env.GITHUB_TOKEN;
  assert.equal((await fetchContributions(undefined, "cached-0"))[0].contributionCount, 3);
  await fetchContributions("test-github-token", "new-user");
  assert.equal((await fetchContributions(undefined, "cached-0"))[0].contributionCount, 3);
  await assert.rejects(fetchContributions(undefined, "cached-1"), /GITHUB_TOKEN/);
  assert.equal(fetchMock.mock.callCount(), GITHUB_CACHE_MAX_USERS + 1);
});

test("the request deadline covers a stalled JSON body and releases the in-flight request", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  let signal!: AbortSignal;
  let bodyController!: ReadableStreamDefaultController<Uint8Array>;
  mock.method(globalThis, "fetch", async (_url: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
    signal = init?.signal as AbortSignal;
    return new Response(new ReadableStream<Uint8Array>({
      start(controller) {
        bodyController = controller;
        controller.enqueue(new TextEncoder().encode('{"data":'));
        signal.addEventListener("abort", () => controller.error(new DOMException("Aborted", "AbortError")), { once: true });
      },
    }));
  });
  const pending = getSvg({ user: "stalled-body" });
  await setImmediate();
  try {
    mock.timers.tick(GITHUB_TIMEOUT_MS);
    assert.equal(signal.aborted, true);
    assert.equal((await pending).status, 503);
  } finally {
    if (!signal.aborted) bodyController.error(new Error("Test cleanup"));
    await pending;
  }
  mock.method(globalThis, "fetch", async () => apiResponse());
  assert.equal((await getSvg({ user: "stalled-body" })).status, 200);
});
