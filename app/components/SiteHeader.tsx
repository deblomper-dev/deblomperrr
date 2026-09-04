import Link from "next/link";

import { NavLinks } from "./NavLinks";
import { ThemeToggle } from "./ThemeToggle";
import { site } from "@/lib/data/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-bone/95 backdrop-blur-xs">
      <div className="container">
        <div className="flex h-14 items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 py-2 text-sm font-medium text-ink transition-colors hover:text-ink-muted"
          >
            <span>{site.name}</span>
            <span className="text-xs text-ink-faint">/</span>
            <span className="mono text-xs text-ink-faint">{site.handle}</span>
          </Link>
          <div className="flex items-center gap-3">
            <NavLinks />
            <ThemeToggle />
          </div>
        </div>
      </div>
      <div className="rule" />
    </header>
  );
}
