export interface ContactLink {
  label: string;
  value: string;
  href: string;
}

/** A single spec-sheet row on a project detail page. */
export interface ArchitectureFact {
  label: string;
  detail: string;
}

export interface Project {
  /** URL segment under /work. */
  slug: string;
  name: string;
  /** What kind of system this is — used as mono metadata. */
  kind: string;
  /** Primary implementation language, per GitHub's language stats. */
  lang: string;
  /** Month the repository was created, as YYYY-MM. */
  since: string;
  /** Whether the source repository is publicly readable. */
  source: "public" | "private";
  /** One or two sentences. Shown in listings. */
  summary: string;
  tags: string[];
  liveUrl?: string;
  codeUrl?: string;
  /** Shown on the homepage. */
  featured?: boolean;
  architecture: ArchitectureFact[];
  /** Body paragraphs for the detail page. */
  body: string[];
}
