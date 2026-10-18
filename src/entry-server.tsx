import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import App from "./App";
import { pagePaths } from "../lib/routes";
import { renderPageMetadata } from "../lib/seo";
import { site } from "../lib/data/site";

export { pagePaths };

export function render(pathname: string) {
  return {
    head: renderPageMetadata(pathname),
    html: renderToString(
      <StrictMode>
        <StaticRouter location={pathname}>
          <App />
        </StaticRouter>
      </StrictMode>,
    ),
  };
}

export function renderSitemap() {
  const urls = pagePaths.map((pathname) => `  <url><loc>${site.url}${pathname === "/" ? "/" : pathname}</loc></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}
