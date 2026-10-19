"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Keep the reading surface level while the project illustration responds to the pointer. */
export function ProjectCardDepth({ children }: { children: ReactNode }) {
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const cover = card?.querySelector<HTMLElement>(".project-card-cover");
    const preview = cover?.querySelector<HTMLElement>(".project-card-preview");
    const diagram = preview?.querySelector<SVGElement>(".project-card-diagram");
    if (!card || !cover || !preview || !diagram) return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let inView = false;

    const syncPlayback = () => card.classList.toggle("diagram-in-view", inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncPlayback();
    }, { threshold: 0.05 });
    observer.observe(cover);
    document.addEventListener("visibilitychange", syncPlayback);

    const canAnimate = () => finePointer.matches && !reducedMotion.matches && !document.hidden;

    function reset() {
      cancelAnimationFrame(frame);
      frame = 0;
      card!.removeAttribute("data-depth-active");
      for (const element of [preview!, diagram!]) {
        element.style.removeProperty("transform");
        element.style.removeProperty("will-change");
      }
    }

    function update() {
      frame = 0;
      if (!canAnimate()) return reset();
      const bounds = cover!.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return reset();
      const x = Math.max(-1, Math.min(1, ((pointerX - bounds.left) / bounds.width - 0.5) * 2));
      const y = Math.max(-1, Math.min(1, ((pointerY - bounds.top) / bounds.height - 0.5) * 2));

      card!.dataset.depthActive = "true";
      preview!.style.transform = `translate3d(0, -3px, 0) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg)`;
      diagram!.style.transform = `translate3d(${(x * 3).toFixed(2)}px, ${(y * 2).toFixed(2)}px, 24px)`;
      for (const element of [preview!, diagram!]) {
        element.style.willChange = "transform";
      }
    }

    function track(event: PointerEvent) {
      if (event.pointerType === "touch" || !canAnimate()) return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!frame) frame = requestAnimationFrame(update);
    }

    function resetWhenUnavailable() {
      if (!canAnimate()) reset();
    }

    cover.addEventListener("pointerenter", track);
    cover.addEventListener("pointermove", track);
    cover.addEventListener("pointerleave", reset);
    cover.addEventListener("pointercancel", reset);
    cover.addEventListener("blur", reset);
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", resetWhenUnavailable);
    finePointer.addEventListener("change", resetWhenUnavailable);
    reducedMotion.addEventListener("change", resetWhenUnavailable);

    return () => {
      reset();
      observer.disconnect();
      card.classList.remove("diagram-in-view");
      document.removeEventListener("visibilitychange", syncPlayback);
      cover.removeEventListener("pointerenter", track);
      cover.removeEventListener("pointermove", track);
      cover.removeEventListener("pointerleave", reset);
      cover.removeEventListener("pointercancel", reset);
      cover.removeEventListener("blur", reset);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", resetWhenUnavailable);
      finePointer.removeEventListener("change", resetWhenUnavailable);
      reducedMotion.removeEventListener("change", resetWhenUnavailable);
    };
  }, []);

  return (
    <article ref={cardRef} className="project-card">
      {children}
    </article>
  );
}
