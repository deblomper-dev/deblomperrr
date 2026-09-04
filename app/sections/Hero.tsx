import { CopyButton } from "@/app/components/CopyButton";
import { hero, liveServices, site } from "@/lib/data/site";

export function Hero() {
  return (
    <section aria-label="Introduction" className="pt-10 sm:pt-14 pb-10">
      <div className="container">
        {/* Top metadata badge bar */}
        <div className="animate-slide-up stagger-1 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="mono text-ink-muted font-medium">{site.role}</span>
            <span className="text-ink-faint">·</span>
            <span className="mono text-ink-faint">nub-coders</span>
          </div>

          {site.openToWork ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-rule bg-bone-2/60 px-3 py-1 transition-transform hover:scale-105">
              <span aria-hidden="true" className="dot" />
              <span className="mono text-xs font-medium text-ink">Open to work</span>
            </div>
          ) : null}
        </div>

        <div className="animate-slide-up stagger-2 mt-4 rule" />

        {/* Hero Title & Subheading */}
        <div className="mt-8 sm:mt-10">
          <h1 className="animate-slide-up stagger-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Ankit Kumar
          </h1>
          <p className="animate-slide-up stagger-4 mt-3 text-lg font-medium text-ink-muted sm:text-xl measure">
            {hero.headline}
          </p>
          <p className="animate-slide-up stagger-5 mt-4 text-sm leading-relaxed text-ink-muted sm:text-base measure">
            {hero.subhead}
          </p>

          <div className="animate-slide-up stagger-6 mt-6 flex flex-wrap items-center gap-3 text-sm font-medium">
            <a
              href="#work-heading"
              className="btn-press inline-flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-xs font-medium text-bone transition-opacity hover:opacity-90"
            >
              View Projects ↓
            </a>
            <CopyButton text={site.email} label="Copy Email" />
            <a
              href={`https://github.com/${site.handle}`}
              target="_blank"
              rel="noreferrer noopener"
              className="btn-press mono text-xs text-ink-faint transition-colors hover:text-ink inline-flex items-center gap-1"
            >
              <span>github.com/{site.handle}</span>
              <span aria-hidden="true" className="arrow">↗</span>
            </a>
          </div>
        </div>

        {/* Live Operational Services Box */}
        <div className="animate-slide-up stagger-6 mt-12 rounded-lg border border-rule bg-bone-2/30 p-5 sm:p-6 card-hover">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rule pb-3">
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="dot" />
              <h2 className="mono text-xs font-medium tracking-wide text-ink uppercase">
                Live Production Services
              </h2>
            </div>
            <span className="mono text-xs text-ink-faint">Self-hosted infrastructure</span>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {liveServices.map(({ label, host, href, description }) => (
              <a
                key={host}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                className="group flex flex-col justify-between rounded-md border border-rule/80 bg-surface p-4 card-hover"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="mono text-xs font-medium text-ink-muted">{label}</span>
                    <span className="text-xs text-ink-faint arrow">
                      ↗
                    </span>
                  </div>
                  <p className="mono mt-2 text-sm font-medium text-ink transition-colors group-hover:underline">
                    {host}
                  </p>
                </div>
                <p className="mt-2 text-xs text-ink-faint leading-normal">
                  {description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
