import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const siteOrigin = "https://deblomper.dev";
const verificationPath = "/googleb8840d98f92f85af.html";
const legacyProjects = {
  "container-deployment-engine": "halvo",
  "self-hosted-mail-infrastructure": "nubmail",
  "fast-media-extraction-service": "ytube-api",
  "distributed-client-runner": "userbot-deployer",
  "in-memory-key-value-database": "nubdb",
  "android-boot-image-patcher": "magisk-flasher",
};

let server;
let serverError;
let serverOutput = "";
let origin;
let sitemap;
let pageUrls;
const pages = new Map();

function decodeHtml(value) {
  return value.replace(/&(?:amp|quot|apos|lt|gt|#\d+|#x[\da-f]+);/gi, (entity) => {
    const named = { "&amp;": "&", "&quot;": '"', "&apos;": "'", "&lt;": "<", "&gt;": ">" };
    if (named[entity]) return named[entity];
    const hex = entity.toLowerCase().startsWith("&#x");
    return String.fromCodePoint(parseInt(entity.slice(hex ? 3 : 2, -1), hex ? 16 : 10));
  });
}

function attributes(tag) {
  return Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map((match) => [
      match[1].toLowerCase(),
      decodeHtml(match[2] ?? match[3]),
    ]),
  );
}

function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map(([tag]) => attributes(tag));
}

function visibleText(html) {
  return decodeHtml(
    html
      .replace(/<(script|style|svg)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]*>/g, " "),
  ).replace(/\s+/g, " ").trim();
}

function metadata(html) {
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1];
  assert.ok(head, "Initial HTML must contain a head");
  const titleTags = [...head.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)];
  const descriptions = tags(head, "meta").filter((tag) => tag.name === "description");
  const canonicals = tags(head, "link").filter((tag) => tag.rel === "canonical");
  assert.equal(titleTags.length, 1, "Exactly one initial title");
  assert.equal(descriptions.length, 1, "Exactly one initial description");
  assert.equal(canonicals.length, 1, "Exactly one canonical");
  const structuredData = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter(([, attrs]) => attributes(attrs).type === "application/ld+json")
    .map(([, , payload]) => JSON.parse(payload));
  assert.ok(structuredData.length, "Structured data must arrive before JavaScript runs");
  return {
    title: visibleText(titleTags[0][1]),
    description: descriptions[0].content,
    canonical: canonicals[0].href,
    robots: tags(head, "meta").find((tag) => tag.name === "robots")?.content ?? "",
    structuredData,
  };
}

function schemaObjects(value) {
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value)) return value.flatMap(schemaObjects);
  return [value, ...Object.values(value).flatMap(schemaObjects)];
}

async function request(route, method = "GET") {
  const response = await fetch(new URL(route, origin), {
    method,
    redirect: "manual",
    signal: AbortSignal.timeout(5_000),
  });
  const body = await response.text();
  return { response, body };
}

async function assertHeadParity(route, getResult) {
  const get = getResult ?? await request(route);
  const head = await request(route, "HEAD");
  assert.equal(head.response.status, get.response.status, `HEAD status for ${route}`);
  assert.equal(head.body, "", `HEAD body for ${route}`);
  for (const header of ["content-type", "content-length", "cache-control", "location", "x-robots-tag"]) {
    assert.equal(head.response.headers.get(header), get.response.headers.get(header), `${header} for HEAD ${route}`);
  }
}

before(async () => {
  sitemap = await readFile(path.join(projectRoot, "dist/client/sitemap.xml"), "utf8");
  pageUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, value]) => new URL(decodeHtml(value)));
  assert.ok(pageUrls.length > 2, "Build must include project URLs in its sitemap");

  const reservation = net.createServer();
  reservation.listen(0, "127.0.0.1");
  await once(reservation, "listening");
  const port = reservation.address().port;
  await new Promise((resolve, reject) => reservation.close((error) => error ? reject(error) : resolve()));
  origin = `http://127.0.0.1:${port}`;
  server = spawn(process.execPath, ["dist/server.js"], {
    cwd: projectRoot,
    env: { ...process.env, HOST: "127.0.0.1", PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.once("error", (error) => { serverError = error; });
  for (const stream of [server.stdout, server.stderr]) {
    stream.on("data", (chunk) => { serverOutput = (serverOutput + chunk.toString()).slice(-10_000); });
  }

  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (serverError) throw serverError;
    assert.equal(server.exitCode, null, `Built server exited during startup:\n${serverOutput}`);
    try {
      await request("/robots.txt");
      return;
    } catch {
      await delay(50);
    }
  }
  assert.fail(`Built server did not become ready:\n${serverOutput}`);
});

after(async () => {
  if (!server || server.exitCode !== null || server.signalCode !== null) return;
  const exited = once(server, "exit");
  server.kill("SIGTERM");
  const forceKill = setTimeout(() => server.kill("SIGKILL"), 2_000);
  try {
    await exited;
  } finally {
    clearTimeout(forceKill);
  }
});

test("sitemap pages ship distinct crawlable content and metadata in initial HTML", async (t) => {
  const titles = new Set();
  const descriptions = new Set();
  const canonicals = new Set();
  for (const url of pageUrls) {
    await t.test(url.pathname, async () => {
      assert.equal(url.origin, siteOrigin, "Sitemap uses the production HTTPS origin");
      const result = await request(url.pathname);
      const { response, body } = result;
      assert.equal(response.status, 200, `Sitemap URL ${url.pathname} must resolve without redirects`);
      assert.match(response.headers.get("content-type"), /^text\/html/);
      const headings = [...body.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
      assert.equal(headings.length, 1, "Page heading must exist before JavaScript runs");
      assert.ok(visibleText(headings[0][1]).length > 3);
      const pageText = visibleText(body.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? "");
      assert.ok(pageText.length > 200, "Initial body contains actual page content");

      const meta = metadata(body);
      assert.ok(meta.title.length > 5);
      assert.ok(meta.description?.length > 40, "Description contains meaningful copy");
      assert.equal(new URL(meta.canonical).href, url.href);
      assert.doesNotMatch(`${meta.robots} ${response.headers.get("x-robots-tag") ?? ""}`, /noindex/i);
      assert.equal(titles.has(meta.title), false, "Title is unique to this page");
      assert.equal(descriptions.has(meta.description), false, "Description is unique to this page");
      assert.equal(canonicals.has(meta.canonical), false, "Canonical is unique to this page");
      titles.add(meta.title);
      descriptions.add(meta.description);
      canonicals.add(meta.canonical);

      const schema = schemaObjects(meta.structuredData);
      assert.ok(schema.some((entry) => entry["@context"] === "https://schema.org"));
      assert.ok(schema.some((entry) => [entry.url, entry["@id"]].some((value) => (
        typeof value === "string" && value.split("#")[0].replace(/\/$/, "") === url.href.replace(/\/$/, "")
      ))), "Structured data identifies this page");
      if (url.pathname.startsWith("/work/")) {
        assert.ok(meta.title.includes(visibleText(headings[0][1])), "Project title describes the rendered project");
      }
      pages.set(url.pathname, { ...result, meta, pageText });
      await assertHeadParity(url.pathname, result);
    });
  }
});

test("homepage explicitly associates deblomper with Ankit Kumar", () => {
  const home = pages.get("/");
  assert.ok(home, "Homepage is in the sitemap");
  assert.match(home.meta.title, /\bdeblomper\b/i);
  assert.match(home.meta.description, /\bdeblomper\b/i);
  assert.match(home.pageText, /\bdeblomper\b/i);
  assert.match(home.pageText, /Ankit Kumar/i);
  const person = schemaObjects(home.meta.structuredData).find((entry) => (
    [].concat(entry["@type"] ?? []).includes("Person")
  ));
  assert.ok(person, "Profile has Person structured data");
  assert.equal(person.name, "Ankit Kumar");
  assert.ok([].concat(person.alternateName ?? []).some((name) => /^deblomper$/i.test(name)));
  assert.ok([].concat(person.sameAs ?? []).includes("https://github.com/deblomper-dev"));
});

test("sitemap includes the full linked project collection and robots advertises it", async () => {
  const work = pages.get("/work");
  assert.ok(work, "Work index is in the sitemap");
  const linkedProjects = new Set(tags(work.body, "a")
    .map((tag) => tag.href)
    .filter((href) => href && new URL(href, siteOrigin).pathname.startsWith("/work/"))
    .map((href) => new URL(href, siteOrigin).pathname));
  const sitemapProjects = new Set(pageUrls.filter((url) => url.pathname.startsWith("/work/")).map((url) => url.pathname));
  assert.deepEqual(sitemapProjects, linkedProjects);
  assert.equal(new Set(pageUrls.map((url) => url.href)).size, pageUrls.length, "Sitemap has no duplicate URLs");
  const servedSitemap = await request("/sitemap.xml");
  assert.equal(servedSitemap.response.status, 200);
  assert.match(servedSitemap.response.headers.get("content-type"), /xml/);
  assert.equal(servedSitemap.body, sitemap);
  const robots = await request("/robots.txt");
  assert.equal(robots.response.status, 200);
  assert.match(robots.body, /Sitemap:\s*https:\/\/deblomper\.dev\/sitemap\.xml/i);
  assert.doesNotMatch(robots.body, /^Disallow:\s*\/\s*$/mi);
  await assertHeadParity("/sitemap.xml", servedSitemap);
  await assertHeadParity("/robots.txt", robots);
});

test("legacy project URLs permanently redirect to their current project", async () => {
  for (const [legacy, current] of Object.entries(legacyProjects)) {
    const route = `/work/${legacy}?ref=old-link`;
    const result = await request(route);
    assert.ok([301, 308].includes(result.response.status), `${route} needs a permanent redirect`);
    assert.equal(new URL(result.response.headers.get("location"), origin).pathname, `/work/${current}`);
    assert.equal(new URL(result.response.headers.get("location"), origin).search, "?ref=old-link");
    assert.ok(pages.has(`/work/${current}`), "Redirect target is a crawlable current project");
    await assertHeadParity(route, result);
  }
});

test("index files and trailing slashes redirect to canonical routes", async () => {
  for (const url of pageUrls) {
    const aliases = url.pathname === "/" ? ["/index.html"] : [`${url.pathname}/`, `${url.pathname}/index.html`];
    for (const alias of aliases) {
      const route = `${alias}?ref=canonical`;
      const result = await request(route);
      assert.ok([301, 308].includes(result.response.status), `${alias} needs a permanent redirect`);
      const destination = new URL(result.response.headers.get("location"), origin);
      assert.equal(destination.pathname, url.pathname);
      assert.equal(destination.search, "?ref=canonical");
      await assertHeadParity(route, result);
    }
  }
});

test("unknown pages return a genuine noindex 404 instead of the homepage", async () => {
  for (const route of ["/not-a-real-page", "/work/not-a-real-project", "/404.html"]) {
    const result = await request(route);
    assert.equal(result.response.status, 404, route);
    assert.match(result.response.headers.get("content-type"), /^text\/html/);
    const robots = tags(result.body, "meta").find((tag) => tag.name === "robots")?.content ?? "";
    assert.match(`${robots} ${result.response.headers.get("x-robots-tag") ?? ""}`, /noindex/i);
    assert.match(result.body, /<h1\b/i);
    assert.notEqual(result.body, pages.get("/")?.body);
    await assertHeadParity(route, result);
  }
  for (const route of ["/assets/not-a-real-file.js", "/api/not-a-real-route", "/api/github/not-a-real-file.svg", "/server.js"]) {
    const result = await request(route);
    assert.equal(result.response.status, 404, route);
    assert.doesNotMatch(result.body, /<html\b|<div\b[^>]*id=["']root["']/i, "Missing files and APIs must not fall back to the app");
    await assertHeadParity(route, result);
  }
});

test("Google verification remains available as the original static file", async () => {
  const expected = await readFile(path.join(projectRoot, "public", verificationPath.slice(1)), "utf8");
  const result = await request(verificationPath);
  assert.equal(result.response.status, 200);
  assert.equal(result.body, expected);
  assert.match(result.body, /^google-site-verification:/);
  await assertHeadParity(verificationPath, result);
});
