import type { ContactLink } from "./types";

export const site = {
  name: "Ankit Kumar",
  handle: "deblomperr",
  domain: "deblomper.dev",
  url: "https://deblomper.dev",
  role: "Full-stack developer",
  /** Verbatim from the GitHub profile that sources this site. */
  bio: "Full-stack developer • TypeScript, Python, Docker • Building Telegram bots, deployment platforms, and self-hosted services",
  email: "contact@deblomper.dev",
  workAccount: "https://github.com/nub-coders",
  /** GitHub account created 2020-10-16. */
  publishingSince: "2020",
  /** Mirrors `hireable: true` on the GitHub profile. */
  openToWork: true,
  auditedOn: "2026-09-04",
} as const;

export const hero = {
  headline: "Full-stack developer building backend systems, deployment platforms, and self-hosted infrastructure.",
  subhead: "I build and operate production services under nub-coders — including container deployment engines, self-hosted mail stacks, media extraction APIs, and low-level key-value engines.",
  tagline: "Focused on reliable operations, defensive boundary validation, and pragmatic systems engineering.",
} as const;

/** Services that are up right now. Checked against the live hosts, not asserted. */
export const liveServices = [
  { label: "Deployment platform", host: "halvo.nubcoders.com", href: "https://halvo.nubcoders.com", description: "Container provisioning & log streaming" },
  { label: "Mail stack", host: "mails.nubcoders.com", href: "https://mails.nubcoders.com", description: "Self-hosted Postfix + Dovecot infrastructure" },
  { label: "Media API", host: "api.nubcoders.com", href: "https://api.nubcoders.com", description: "Async stream & metadata extraction service" },
] as const;

/** Core engineering practices derived from running live production code. */
export const principles = [
  {
    label: "Operate what you build",
    body: "I maintain the services I build — Halvo, NubMail, and Ytube API run live 24/7 on my own infrastructure. Real operational feedback (container leaks, SMTP quirks, upstream API breaking changes) drives reliable design far better than local mocks.",
  },
  {
    label: "Strict input validation at the boundary",
    body: "Validate against real attack vectors: resolve IP addresses to block SSRF before fetching remote URLs, enforce byte-and-entry quotas during live archive extraction, and verify DNS records (SPF, DKIM, DMARC) before sending mail.",
  },
  {
    label: "Automate rules where code runs",
    body: "If an error is easy to introduce and silent at runtime — like un-awaited async database queries in MongoDB — enforce it via static AST checks in CI. Don't rely on human review to catch silent failure modes.",
  },
  {
    label: "Understand the layer beneath",
    body: "Building a key-value store in Zig or TDLib bindings in C++20 isn't about reinventing wheels — it's about knowing exactly how memory allocators, hash tables, and event loops behave when high-level abstractions fail.",
  },
] as const;

export const stack = [
  {
    label: "Languages",
    items: ["TypeScript", "Python", "Zig", "C++20", "Go", "Rust"],
  },
  {
    label: "Runtime & infra",
    items: ["Docker", "Compose", "Traefik", "Kubernetes", "Postfix", "Dovecot", "nginx"],
  },
  {
    label: "Data",
    items: ["PostgreSQL", "MongoDB", "Redis", "Prisma"],
  },
  {
    label: "Interfaces",
    items: ["React", "Next.js", "Tailwind", "FastAPI", "Express", "Pyrogram", "TDLib"],
  },
] as const;

export const about = [
  "I am a full-stack developer working mostly on backend systems and the infrastructure underneath them. TypeScript and Python are where most of the work lives; Zig and C++20 are where I went when I wanted to understand a layer instead of consume it.",
  "The through-line is operational. Almost everything here is a long-running process talking to something it does not control — the Docker daemon, an SMTP peer, Telegram's calling layer, an upstream that rewrites its JavaScript without notice. Most of what I know came from those seams rather than the application code on either side.",
  "Published under nub-coders since 2020. This site shows nine of twenty-six repositories; forks, experiments and early code are left out on purpose.",
] as const;

export const contactLinks: ContactLink[] = [
  { label: "Email", value: "contact@deblomper.dev", href: "mailto:contact@deblomper.dev" },
  { label: "GitHub", value: "github.com/deblomperr", href: "https://github.com/deblomperr" },
  { label: "Work account", value: "github.com/nub-coders", href: "https://github.com/nub-coders" },
  { label: "Telegram", value: "@nub_coder_s", href: "https://t.me/nub_coder_s" },
];
