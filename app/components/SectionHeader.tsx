import type { ReactNode } from "react";

interface SectionHeaderProps {
  /** Used by the section's `aria-labelledby`. */
  id: string;
  label: string;
  /** Right-aligned counterpart — a count, a range, a status. */
  aside?: ReactNode;
}

export function SectionHeader({ id, label, aside }: SectionHeaderProps) {
  return (
    <div className="pb-2">
      <div className="flex items-baseline justify-between gap-6 pb-2.5">
        <h2 id={id} className="mono text-xs font-semibold uppercase tracking-wider text-ink">
          {label}
        </h2>
        {aside ? <span className="mono text-xs text-ink-faint">{aside}</span> : null}
      </div>
      <div className="rule" />
    </div>
  );
}
