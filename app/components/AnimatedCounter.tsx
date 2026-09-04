interface AnimatedCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({
  end,
  prefix = "",
  suffix = "",
  className = "",
}: AnimatedCounterProps) {
  return (
    <span className={className}>
      {prefix}
      {end}
      {suffix}
    </span>
  );
}
