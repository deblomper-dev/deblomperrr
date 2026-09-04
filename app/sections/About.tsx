import { SectionHeader } from "@/app/components/SectionHeader";
import { about, site, stack } from "@/lib/data/site";

export function About() {
  return (
    <section id="about" aria-labelledby="about-heading" className="section pt-4">
      <div className="container">
        <SectionHeader
          id="about-heading"
          label="About & Background"
          aside={`Publishing since ${site.publishingSince}`}
        />

        {/* Honest overview indicators */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="reveal reveal-delay-1 card-hover rounded-lg border border-rule bg-bone-2/20 p-4">
            <span className="mono text-xs text-ink-faint">Timeline</span>
            <p className="mt-1 text-lg font-semibold text-ink">Since 2020</p>
            <p className="mt-0.5 text-xs text-ink-muted">6+ years publishing</p>
          </div>
          <div className="reveal reveal-delay-2 card-hover rounded-lg border border-rule bg-bone-2/20 p-4">
            <span className="mono text-xs text-ink-faint">Open Source</span>
            <p className="mt-1 text-lg font-semibold text-ink">26 Repos</p>
            <p className="mt-0.5 text-xs text-ink-muted">On nub-coders org</p>
          </div>
          <div className="reveal reveal-delay-3 card-hover rounded-lg border border-rule bg-bone-2/20 p-4">
            <span className="mono text-xs text-ink-faint">Operations</span>
            <p className="mt-1 text-lg font-semibold text-ink flex items-center gap-2">
              <span className="dot" />
              3 Services
            </p>
            <p className="mt-0.5 text-xs text-ink-muted">Running 24/7 live</p>
          </div>
          <div className="reveal reveal-delay-4 card-hover rounded-lg border border-rule bg-bone-2/20 p-4">
            <span className="mono text-xs text-ink-faint">Focus</span>
            <p className="mt-1 text-lg font-semibold text-ink">Systems & APIs</p>
            <p className="mt-0.5 text-xs text-ink-muted">Backend & Infra</p>
          </div>
        </div>

        {/* Narrative & Stack Grid */}
        <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="reveal space-y-4 text-sm leading-relaxed text-ink-muted measure">
            {about.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}

            <div className="pt-2">
              <a
                href={site.workAccount}
                target="_blank"
                rel="noreferrer noopener"
                className="btn-press mono text-xs font-medium text-ink underline underline-offset-4 decoration-rule-strong hover:decoration-ink inline-flex items-center gap-1.5"
              >
                <span>github.com/nub-coders</span>
                <span aria-hidden="true" className="arrow">↗</span>
              </a>
            </div>
          </div>

          <div className="reveal card-hover rounded-lg border border-rule bg-bone-2/10 p-5 sm:p-6">
            <h3 className="mono text-xs font-semibold uppercase tracking-wider text-ink">
              Technical Stack
            </h3>
            <div className="mt-4 space-y-4">
              {stack.map(({ label, items }) => (
                <div key={label}>
                  <p className="mono text-xs text-ink-faint">{label}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {items.map((item) => (
                      <span
                        key={item}
                        className="tag-hover mono text-xs rounded border border-rule bg-surface px-2 py-0.5 text-ink"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
