"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * One observer for every `.reveal` and `.rule-tick` element on the page, mounted once in the
 * root layout. Cheaper than a wrapper component per element, and it keeps the
 * whole tree renderable as Server Components.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal:not(.is-visible), .rule-tick:not(.is-visible)")
    );
    if (targets.length === 0) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (const el of targets) el.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.04 }
    );

    for (const el of targets) observer.observe(el);
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
