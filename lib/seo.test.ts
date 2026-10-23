import assert from "node:assert/strict";
import { test } from "node:test";
import { projects } from "./data/projects";
import { site } from "./data/site";
import { getPageMetadata, renderPageMetadata } from "./seo";

function readStructuredData(markup: string) {
  const match = markup.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
  assert.ok(match, "indexable pages need structured identity data");
  return JSON.parse(match[1]) as { "@graph": Record<string, unknown>[] };
}

test("the home page names Ankit Kumar and connects his aliases and real social accounts", () => {
  const metadata = getPageMetadata("/");
  assert.equal(metadata.title, "Ankit Kumar (deblomper) — Full-stack Developer");
  assert.match(metadata.description, /deblomper/);
  assert.equal(metadata.canonical, "https://deblomper.dev/");
  assert.equal(metadata.robots, "index, follow");

  const graph = readStructuredData(renderPageMetadata("/"))["@graph"];
  const person = graph.find((node) => node["@type"] === "Person");
  assert.ok(person);
  assert.equal(person.name, "Ankit Kumar");
  assert.deepEqual(person.alternateName, ["deblomper", "deblomperr", "deblomperrr", "deblomper-dev"]);
  assert.ok((person.sameAs as string[]).includes("https://github.com/deblomper-dev"));
  const website = graph.find((node) => node["@type"] === "WebSite");
  assert.equal(website?.name, "Ankit Kumar");
  assert.deepEqual(website?.alternateName, ["deblomper", "deblomper.dev"]);
});

test("each current project has a unique canonical, description and project schema", () => {
  const titles = new Set<string>();
  for (const project of projects) {
    const pathname = `/work/${project.slug}`;
    const metadata = getPageMetadata(pathname);
    assert.equal(metadata.canonical, `${site.url}${pathname}`);
    assert.equal(metadata.description, project.summary);
    assert.ok(metadata.title.includes(project.name));
    assert.ok(metadata.title.endsWith("| Ankit Kumar"));
    assert.equal(metadata.robots, "index, follow");
    titles.add(metadata.title);

    const graph = readStructuredData(renderPageMetadata(pathname))["@graph"];
    const software = graph.find((node) => node["@type"] === "SoftwareSourceCode");
    assert.equal(software?.name, project.name);
    assert.equal(software?.codeRepository, project.codeUrl);
  }
  assert.equal(titles.size, projects.length);
});

test("work listing metadata includes current project URLs", () => {
  const metadata = getPageMetadata("/work");
  assert.equal(metadata.title, "Projects — Ankit Kumar");
  assert.equal(metadata.canonical, `${site.url}/work`);
  assert.notEqual(metadata.title, getPageMetadata("/").title);
  const markup = renderPageMetadata("/work");
  for (const project of projects) {
    assert.ok(markup.includes(`${site.url}/work/${project.slug}`));
  }
});

test("query strings and trailing slashes do not produce duplicate canonical URLs", () => {
  assert.deepEqual(getPageMetadata("/work/halvo/?ref=github#story"), getPageMetadata("/work/halvo"));
});

test("missing and legacy project paths cannot inherit indexable home metadata", () => {
  for (const pathname of ["/missing", "/work/missing", "/work/container-deployment-engine", "/work/halvo/extra"]) {
    const metadata = getPageMetadata(pathname);
    assert.equal(metadata.title, "Page not found — Ankit Kumar");
    assert.equal(metadata.robots, "noindex, follow");
    assert.equal(metadata.canonical, undefined);
    const markup = renderPageMetadata(pathname);
    assert.ok(!markup.includes('rel="canonical"'));
    assert.ok(!markup.includes('property="og:url"'));
    assert.ok(!markup.includes('type="application/ld+json"'));
  }
});

test("all managed head elements are replaceable and use working textual sharing metadata", () => {
  const markup = renderPageMetadata("/");
  const openingTags = markup.match(/<(?:title|meta|link|script)\b[^>]*>/g) ?? [];
  assert.ok(openingTags.length > 0);
  assert.ok(openingTags.every((tag) => tag.includes("data-page-meta")));
  assert.match(markup, /property="og:title"/);
  assert.match(markup, /name="application-name" content="Ankit Kumar"/);
  assert.match(markup, /property="og:site_name" content="Ankit Kumar"/);
  assert.match(markup, /name="twitter:card" content="summary"/);
  assert.ok(!markup.includes("opengraph-image"));
});

test("editable project text cannot break out of head attributes or JSON-LD scripts", () => {
  const project = projects[0];
  const previousName = project.name;
  const previousSummary = project.summary;
  try {
    project.name = 'A "quoted" & <test> project';
    project.summary = '</script><script>alert("bad")</script>';
    const markup = renderPageMetadata(`/work/${project.slug}`);
    assert.ok(!markup.includes('<script>alert("bad")</script>'));
    assert.ok(markup.includes("&quot;quoted&quot; &amp; &lt;test&gt;"));
    const graph = readStructuredData(markup)["@graph"];
    const software = graph.find((node) => node["@type"] === "SoftwareSourceCode");
    assert.equal(software?.description, project.summary);
  } finally {
    project.name = previousName;
    project.summary = previousSummary;
  }
});
