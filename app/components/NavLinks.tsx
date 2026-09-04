"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/work", label: "work" },
  { href: "/#about", label: "about" },
  { href: "/#contact", label: "contact" },
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
                className="mono relative block px-2.5 py-3.5 text-muted transition-colors duration-200 hover:text-ink aria-[current=page]:text-ink sm:px-3"
              >
                {label}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-2.5 bottom-2.5 h-px origin-left bg-current transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] sm:inset-x-3 ${
                    current ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
