import Link from "next/link";

import { NavLinks } from "./NavLinks";
import { ThemeToggle } from "./ThemeToggle";
import { site } from "@/lib/data/site";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container">
        <div className="header-inner">
          <Link
            href="/"
            className="site-brand"
            aria-label={`${site.name} — home`}
          >
            <svg className="brand-mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path d="M16 3v26M3 16h26M7 7l18 18M7 25 25 7" stroke="currentColor" strokeWidth="6" />
            </svg>
            <span>{site.name}<span className="brand-dot" aria-hidden="true">.</span></span>
          </Link>
          <div className="header-actions">
            <NavLinks />
            <ThemeToggle />
          </div>
        </div>
      </div>
      <div className="scroll-progress" aria-hidden="true" />
    </header>
  );
}
