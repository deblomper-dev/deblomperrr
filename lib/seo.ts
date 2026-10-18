import { getProject, projects } from "./data/projects";
import { site } from "./data/site";
import type { Project } from "./data/types";

type StructuredNode = Record<string, unknown>;

export interface PageMetadata {
  title: string;
  description: string;
  canonical?: string;
  robots: "index, follow" | "noindex, follow";
  structuredData?: { "@context": string; "@graph": StructuredNode[] };
}

const homeUrl = `${site.url}/`;
const personId = `${homeUrl}#person`;
const websiteId = `${homeUrl}#website`;
const homeDescription =
  "Ankit Kumar, known as deblomper, is a full-stack developer building backend systems, deployment platforms, Telegram bots, and self-hosted infrastructure.";

function createStructuredData(
  pathname: string,
  title: string,
  description: string,
  project?: Project,
): NonNullable<PageMetadata["structuredData"]> {
  const canonical = new URL(pathname, homeUrl).href;
  const graph: StructuredNode[] = [
    {
      "@type": "Person",
      "@id": personId,
      name: site.name,
      alternateName: site.aliases,
      url: homeUrl,
      jobTitle: site.role,
      description: homeDescription,
      sameAs: [`https://github.com/${site.handle}`, "https://t.me/nub_coder_s"],
      worksFor: {
        "@type": "Organization",
        name: "Nub Coders",
        url: "https://nubcoders.com",
        sameAs: [site.workAccount],
      },
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      name: `${site.alias} — ${site.name}`,
      alternateName: site.domain,
      url: homeUrl,
      inLanguage: "en",
      publisher: { "@id": personId },
    },
    {
      "@type": pathname === "/" ? "ProfilePage" : pathname === "/work" ? "CollectionPage" : "WebPage",
      "@id": `${canonical}#webpage`,
      url: canonical,
      name: title,
      description,
      isPartOf: { "@id": websiteId },
      author: { "@id": personId },
      mainEntity: project
        ? { "@id": `${canonical}#project` }
        : pathname === "/work"
          ? {
              "@type": "ItemList",
              itemListElement: projects.map((entry, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: entry.name,
                url: `${site.url}/work/${entry.slug}`,
              })),
            }
          : { "@id": personId },
    },
  ];

  if (project) {
    graph.push({
      "@type": "SoftwareSourceCode",
      "@id": `${canonical}#project`,
      name: project.name,
      description: project.summary,
      programmingLanguage: project.lang,
      creator: { "@id": personId },
      url: project.liveUrl ?? project.codeUrl ?? canonical,
      ...(project.codeUrl ? { codeRepository: project.codeUrl } : {}),
      mainEntityOfPage: { "@id": `${canonical}#webpage` },
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

/** Shared by prerendered HTML and client navigation; unknown pages stay unindexable. */
export function getPageMetadata(pathname: string): PageMetadata {
  const path = pathname.split(/[?#]/, 1)[0].replace(/\/+$/, "") || "/";
  const projectMatch = /^\/work\/([^/]+)$/.exec(path);
  const project = projectMatch ? getProject(projectMatch[1]) : undefined;

  if (path !== "/" && path !== "/work" && !project) {
    return {
      title: `Page not found — ${site.alias} (${site.name})`,
      description: "This page could not be found. Explore Ankit Kumar’s software projects or return to the deblomper homepage.",
      robots: "noindex, follow",
    };
  }

  const title = project
    ? `${project.name} — ${project.kind} | ${site.alias}`
    : path === "/work"
      ? `Projects — ${site.alias} (${site.name})`
      : `${site.alias} — ${site.name} | Full-stack Developer`;
  const description = project
    ? project.summary
    : path === "/work"
      ? "Software projects by Ankit Kumar (deblomper): deployment platforms, mail infrastructure, media services, databases, and developer tools."
      : homeDescription;

  return {
    title,
    description,
    canonical: new URL(path, homeUrl).href,
    robots: "index, follow",
    structuredData: createStructuredData(path, title, description, project),
  };
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      default: return "&#39;";
    }
  });
}

/** Every generated node is marked so navigation replaces the entire previous page head. */
export function renderPageMetadata(pathname: string): string {
  const metadata = getPageMetadata(pathname);
  const meta = (attribute: "name" | "property", key: string, value: string) =>
    `<meta data-page-meta ${attribute}="${key}" content="${escapeHtml(value)}" />`;
  const tags = [
    `<title data-page-meta>${escapeHtml(metadata.title)}</title>`,
    meta("name", "description", metadata.description),
    meta("name", "robots", metadata.robots),
    meta("name", "author", site.name),
    meta("name", "application-name", site.alias),
    meta("property", "og:type", "website"),
    meta("property", "og:site_name", `${site.alias} — ${site.name}`),
    meta("property", "og:title", metadata.title),
    meta("property", "og:description", metadata.description),
    meta("property", "og:locale", "en_US"),
    meta("name", "twitter:card", "summary"),
    meta("name", "twitter:title", metadata.title),
    meta("name", "twitter:description", metadata.description),
  ];

  if (metadata.canonical) {
    tags.push(
      `<link data-page-meta rel="canonical" href="${escapeHtml(metadata.canonical)}" />`,
      meta("property", "og:url", metadata.canonical),
    );
  }

  if (metadata.structuredData) {
    // A literal '<' could close the script element before JSON parsing occurs.
    const json = JSON.stringify(metadata.structuredData).replace(/</g, "\\u003c");
    tags.push(`<script data-page-meta type="application/ld+json">${json}</script>`);
  }

  return tags.join("\n");
}
