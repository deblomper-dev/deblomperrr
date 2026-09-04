import Link from "next/link";
import type { Project } from "@/lib/data/types";

/** Derives the honest status from what the project actually exposes. */
export function status(project: Project) {
  if (project.liveUrl) return { text: "Live", live: true };
  if (project.source === "public") return { text: "Open source", live: false };
  return { text: "Private", live: false };
}

export function host(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function Dot({ live }: { live: boolean }) {
  return <span aria-hidden="true" className={`dot${live ? "" : " dot-idle"}`} />;
}

/** Homepage treatment: scannable modern project card. */
export function FeatureRow({ project }: { project: Project }) {
  const { text, live } = status(project);

  return (
    <article className="reveal row py-7 sm:py-8 group">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <span className="mono text-xs font-medium text-ink inline-flex items-center gap-2">
          <Dot live={live} />
          {text}
        </span>
        <span className="mono text-xs text-ink-faint">
          {project.kind} <span className="text-rule-strong">/</span> {project.lang}{" "}
          <span className="text-rule-strong">/</span> {project.since.slice(0, 4)}
        </span>
      </div>

      <div className="mt-4 grid gap-x-10 gap-y-4 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
        <div>
          <h3 className="text-lg font-semibold text-ink">
            <Link
              href={`/work/${project.slug}`}
              className="inline-flex items-baseline gap-2 transition-colors hover:text-ink-muted"
            >
              {project.name}
              <span aria-hidden="true" className="mono text-sm arrow">
                →
              </span>
            </Link>
          </h3>
          <p className="mono text-xs text-ink-faint mt-1">
            {project.tags.slice(0, 3).join(" · ")}
          </p>
        </div>

        <div>
          <p className="text-sm leading-relaxed text-ink-muted measure">{project.summary}</p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href={`/work/${project.slug}`}
              className="mono text-xs font-medium text-ink underline underline-offset-4 decoration-rule-strong hover:decoration-ink inline-flex items-center gap-1"
            >
              <span>Case study & architecture</span>
              <span aria-hidden="true" className="arrow">→</span>
            </Link>

            {project.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="row-aside mono text-xs text-ink-faint inline-flex items-center gap-1 hover:text-ink transition-colors"
              >
                <span>{host(project.liveUrl)}</span>
                <span aria-hidden="true" className="arrow">↗</span>
              </a>
            ) : null}

            {project.codeUrl ? (
              <a
                href={project.codeUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="row-aside mono text-xs text-ink-faint inline-flex items-center gap-1 hover:text-ink transition-colors"
              >
                <span>source</span>
                <span aria-hidden="true" className="arrow">↗</span>
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

/** Work index treatment: a clean catalogue line. */
export function IndexRow({ project, n }: { project: Project; n: number }) {
  const { text, live } = status(project);

  return (
    <article className="reveal row py-6 transition-all duration-200 hover:bg-bone-2/50 group">
      <div className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-4 sm:grid-cols-[2.25rem_minmax(0,1fr)_auto] sm:gap-x-6">
        <span className="mono text-xs text-ink-faint pt-1">{String(n).padStart(2, "0")}</span>

        <div>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="text-base font-semibold text-ink">
              <Link
                href={`/work/${project.slug}`}
                className="inline-flex items-baseline gap-1.5 hover:text-ink-muted transition-colors"
              >
                {project.name}
                <span aria-hidden="true" className="mono text-xs arrow">
                  →
                </span>
              </Link>
            </h2>
            <span className="mono text-xs text-ink-faint sm:hidden">
              {project.lang} · {project.kind}
            </span>
          </div>

          <p className="mt-1.5 text-sm text-ink-muted measure">{project.summary}</p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <ul className="flex flex-wrap gap-x-2 gap-y-1">
              {project.tags.slice(0, 4).map((tag) => (
                <li
                  key={tag}
                  className="tag-hover mono text-[11px] rounded border border-rule/60 bg-bone-2 px-1.5 py-0.5 text-ink-muted"
                >
                  {tag}
                </li>
              ))}
            </ul>

            {project.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="mono text-xs text-ink-faint hover:text-ink inline-flex items-center gap-0.5 transition-colors"
              >
                <span>demo</span>
                <span className="arrow">↗</span>
              </a>
            ) : null}

            {project.codeUrl ? (
              <a
                href={project.codeUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="mono text-xs text-ink-faint hover:text-ink inline-flex items-center gap-0.5 transition-colors"
              >
                <span>code</span>
                <span className="arrow">↗</span>
              </a>
            ) : null}
          </div>
        </div>

        <div className="col-start-3 hidden shrink-0 text-right sm:block">
          <span className="mono text-xs font-medium text-ink inline-flex items-center gap-1.5 pt-1">
            <Dot live={live} />
            {text}
          </span>
          <p className="mono text-xs text-ink-faint mt-1">{project.kind}</p>
          <p className="mono text-xs text-ink-faint">
            {project.lang} <span className="text-rule-strong">/</span> {project.since.slice(0, 4)}
          </p>
        </div>
      </div>
    </article>
  );
}
