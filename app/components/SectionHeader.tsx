interface SectionHeaderProps {
  id: string;
  label: string;
  aside?: string;
}

export function SectionHeader({ id, label, aside }: SectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-2 font-mono text-xs">
      <h2 id={id} className="font-semibold text-ink uppercase tracking-wider">
        {"// "}{label}
      </h2>
      {aside && <span className="text-ink-faint uppercase">{aside}</span>}
    </div>
  );
}
