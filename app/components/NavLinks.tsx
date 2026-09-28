"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/work", label: "Work" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Let’s talk" },
] as const;

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary">
      <ul className="flex items-center">
        {items.map(({ href, label }) => {
          const current = href === "/work" && pathname.startsWith("/work");
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                className={`nav-link${href === "/#contact" ? " nav-contact" : ""}`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
