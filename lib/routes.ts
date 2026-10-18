import { projects } from "./data/projects";

export const pagePaths = ["/", "/work", ...projects.map((project) => `/work/${project.slug}`)];
const knownPages = new Set(pagePaths);

// Preserve URLs published in the previous sitemap and any existing search results.
export const legacyProjectRedirects: Readonly<Record<string, string>> = {
  "/work/container-deployment-engine": "/work/halvo",
  "/work/self-hosted-mail-infrastructure": "/work/nubmail",
  "/work/fast-media-extraction-service": "/work/ytube-api",
  "/work/distributed-client-runner": "/work/userbot-deployer",
  "/work/in-memory-key-value-database": "/work/nubdb",
  "/work/android-boot-image-patcher": "/work/magisk-flasher",
};

export function getCanonicalPagePath(pathname: string): string | undefined {
  const normalized = pathname.replace(/\/index\.html$/, "").replace(/\/+$/, "") || "/";
  if (knownPages.has(normalized)) return normalized;
  return Object.hasOwn(legacyProjectRedirects, normalized)
    ? legacyProjectRedirects[normalized]
    : undefined;
}
