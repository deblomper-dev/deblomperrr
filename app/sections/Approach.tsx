import { SectionHeader } from "@/app/components/SectionHeader";
import { principles } from "@/lib/data/site";

export function Approach() {
  return (
    <section id="principles" aria-labelledby="approach-heading" className="section pt-4">
      <div className="container">
        <SectionHeader
          id="approach-heading"
          label="Engineering Practices"
          aside="Operational rules"
        />

        <div className="grid gap-6 sm:grid-cols-2 mt-6">
          {principles.map(({ label, body }, i) => (
            <div
              key={label}
              className={`reveal reveal-delay-${(i % 2) + 1} card-hover rounded-lg border border-rule bg-bone-2/20 p-5 sm:p-6`}
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-base font-semibold text-ink">{label}</h3>
                <span className="mono text-xs text-ink-faint">0{i + 1}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
