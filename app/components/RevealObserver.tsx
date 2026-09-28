"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * One observer for section reveals and artwork entrances, mounted once in the
 * root layout. Cheaper than a wrapper component per element, and it keeps the
 * whole tree renderable as Server Components.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal:not(.is-visible), [data-motion-reveal]:not(.is-visible)")
    );
    if (targets.length === 0) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) {
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

    for (const el of targets) {
      // Only animate content below the fold; never hide content awaiting JS.
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add("is-visible");
      } else {
        el.classList.add(el.hasAttribute("data-motion-reveal") ? "motion-ready" : "reveal-ready");
        observer.observe(el);
      }
    }

    const showFocusedContent = (event: FocusEvent) => {
      if (!(event.target instanceof Node)) return;
      for (const el of targets) {
        if (!el.contains(event.target)) continue;
        el.classList.remove("reveal-ready", "motion-ready");
        el.classList.add("is-visible");
        observer.unobserve(el);
      }
    };
    const reduceMotion = () => {
      if (!reducedMotion.matches) return;
      for (const el of targets) {
        el.classList.remove("reveal-ready", "motion-ready");
        el.classList.add("is-visible");
      }
      observer.disconnect();
    };
    document.addEventListener("focusin", showFocusedContent);
    reducedMotion.addEventListener("change", reduceMotion);
    return () => {
      observer.disconnect();
      document.removeEventListener("focusin", showFocusedContent);
      reducedMotion.removeEventListener("change", reduceMotion);
      for (const el of targets) el.classList.remove("reveal-ready", "motion-ready");
    };
  }, [pathname]);

  return null;
}
