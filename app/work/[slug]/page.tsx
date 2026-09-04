import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { host, status } from "@/app/components/ProjectRow";
import { getProject, projects } from "@/lib/data/projects";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  return {
    title: project.name,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      type: "article",
      title: `${project.name} — ${project.kind}`,
      description: project.summary,
      url: `/work/${project.slug}`,
    },
  };
}

export default async function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const at = projects.findIndex((entry) => entry.slug === project.slug);
  const previous = at > 0 ? projects[at - 1] : undefined;
  const next = at < projects.length - 1 ? projects[at + 1] : undefined;
  const { text, live } = status(project);

  return (
    <article className="pt-8 sm:pt-12 pb-16">
      <div className="container">
        <Link
          href="/work"
          className="mono text-xs text-ink-faint hover:text-ink inline-flex items-center gap-1.5"
        >
          <span aria-hidden="true">←</span>
          <span>Back to all projects</span>
        </Link>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-x-8 gap-y-1">
          <p className="mono text-xs font-medium text-ink inline-flex items-center gap-2">
            <span aria-hidden="true" className={`dot${live ? "" : " dot-idle"}`} />
            {text}
          </p>
          <p className="mono text-xs text-ink-faint">
            {project.kind} <span className="text-rule-strong">/</span> {project.lang}{" "}
            <span className="text-rule-strong">/</span> {project.since.slice(0, 4)}
          </p>
        </div>
        <div className="mt-3 rule" />

        <h1 className="text-3xl font-semibold text-ink sm:text-4xl mt-6">{project.name}</h1>

        <p className="mt-4 text-base leading-relaxed text-ink-muted measure">
          {project.summary}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-xs font-medium text-bone transition-opacity hover:opacity-90"
            >
              <span>Live Deployment ({host(project.liveUrl)})</span>
              <span aria-hidden="true">↗</span>
            </a>
          ) : null}
          {project.codeUrl ? (
            <a
              href={project.codeUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 rounded-md border border-rule px-4 py-2 text-xs font-medium text-ink transition-colors hover:border-rule-strong hover:bg-bone-2"
            >
              <span>GitHub Repository</span>
              <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <span className="mono text-xs text-ink-faint">Source code is private</span>
          )}
        </div>

        <div className="mt-12">
          <div className="rule" />
          <div className="mt-8 space-y-4 text-sm leading-relaxed text-ink-muted measure">
            {project.body.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
        </div>

        <section aria-labelledby="architecture-heading" className="mt-12">
          <h2 id="architecture-heading" className="mono text-xs font-semibold uppercase tracking-wider text-ink">
            Architecture & Components
          </h2>
          <div className="mt-4 divide-y divide-rule border-y border-rule">
            {project.architecture.map(({ label, detail }) => (
              <div
                key={label}
                className="grid gap-x-8 gap-y-2 py-4 md:grid-cols-[minmax(0,0.4fr)_minmax(0,1fr)]"
              >
                <dt className="mono text-xs font-semibold text-ink">{label}</dt>
                <dd className="text-xs leading-relaxed text-ink-muted">{detail}</dd>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="stack-heading" className="mt-10">
          <h2 id="stack-heading" className="mono text-xs font-semibold uppercase tracking-wider text-ink">
            Technologies Used
          </h2>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <li
                key={tag}
                className="mono text-xs rounded border border-rule bg-surface px-2.5 py-1 text-ink"
              >
                {tag}
              </li>
            ))}
          </ul>
        </section>

        <nav aria-label="Other projects" className="mt-16">
          <div className="rule" />
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-xs">
            {previous ? (
              <Link href={`/work/${previous.slug}`} className="group flex items-center gap-2 text-ink-muted hover:text-ink">
                <span aria-hidden="true">←</span>
                <span className="mono">Previous: {previous.name}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/work/${next.slug}`} className="group ml-auto flex items-center gap-2 text-ink-muted hover:text-ink">
                <span className="mono">Next: {next.name}</span>
                <span aria-hidden="true">→</span>
              </Link>
            ) : null}
          </div>
        </nav>
      </div>
    </article>
  );
}
