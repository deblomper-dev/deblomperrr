import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pagePaths, render, renderSitemap } from "../dist/prerender/entry-server.js";

const outputDir = path.resolve("dist/client");
const template = await readFile(path.join(outputDir, "index.html"), "utf8");
const headMarker = "<!--app-head-->";
const rootMarker = '<div id="root"></div>';
if (!template.includes(headMarker) || !template.includes(rootMarker)) {
  throw new Error("The Vite HTML template is missing its prerender placeholders.");
}

for (const pathname of [...pagePaths, "/404.html"]) {
  const { head, html } = render(pathname);
  const notFound = pathname === "/404.html";
  const filename = notFound ? "404.html" : path.join(pathname.slice(1), "index.html");
  const destination = path.join(outputDir, filename);
  const document = template
    .replace(headMarker, () => head)
    .replace(rootMarker, () => `<div id="root" data-prerendered="${!notFound}">${html}</div>`);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, document);
}

await writeFile(path.join(outputDir, "sitemap.xml"), renderSitemap());
// Only the client assets and bundled HTTP server are needed in production.
await rm(path.resolve("dist/prerender"), { recursive: true, force: true });
console.log(`Prerendered ${pagePaths.length} pages, a 404 page, and sitemap.xml.`);
