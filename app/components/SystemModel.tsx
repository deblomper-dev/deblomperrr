"use client";

import { useEffect, useRef, type ReactNode } from "react";

const initialView = { x: 58, z: -34 };

function Block({ className, children }: { className: string; children?: ReactNode }) {
  return (
    <div className={`model-block ${className}`}>
      <div className="block-face block-top">{children}</div>
      <div className="block-face block-bottom" />
      <div className="block-face block-front"><span className="block-ports"><i /><i /><i /></span></div>
      <div className="block-face block-back" />
      <div className="block-face block-left" />
      <div className="block-face block-right" />
    </div>
  );
}

/** The model is ordinary prerendered HTML; only its viewing angle needs JavaScript. */
export function SystemModel({ label }: { label: string }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef<HTMLDivElement>(null);
  const resetRef = useRef<(immediate: boolean) => void>(() => {});

  useEffect(() => {
    const viewport = viewportRef.current;
    const rotation = rotationRef.current;
    if (!viewport || !rotation) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    let target = { ...initialView };
    let current = { ...initialView };
    let velocity = { x: 0, z: 0 };
    let frame = 0;
    let lastTime = 0;
    let visible = false;
    let drag: { id: number; x: number; y: number; view: typeof initialView } | null = null;

    const draw = () => {
      rotation.style.transform = `rotateX(${current.x}deg) rotateZ(${current.z}deg)`;
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
    };
    const snap = () => {
      stop();
      current = { ...target };
      velocity = { x: 0, z: 0 };
      draw();
    };
    // A small damped spring carries velocity when a drag changes direction.
    const tick = (time: number) => {
      const dt = lastTime ? Math.min((time - lastTime) / 1000, 1 / 30) : 1 / 60;
      lastTime = time;
      for (const axis of ["x", "z"] as const) {
        velocity[axis] += ((target[axis] - current[axis]) * 100 - velocity[axis] * 10) * dt;
        current[axis] += velocity[axis] * dt;
      }
      draw();
      const settled = Math.abs(target.x - current.x) + Math.abs(target.z - current.z) + Math.abs(velocity.x) + Math.abs(velocity.z) < 0.02;
      if (settled) snap();
      else frame = requestAnimationFrame(tick);
    };
    const update = (immediate = false) => {
      if (immediate || reduced.matches || !visible || document.hidden) snap();
      else if (!frame) frame = requestAnimationFrame(tick);
    };
    const reset = (immediate: boolean) => {
      target = { ...initialView };
      update(immediate);
    };
    resetRef.current = reset;

    const endDrag = () => {
      if (drag && viewport.hasPointerCapture(drag.id)) viewport.releasePointerCapture(drag.id);
      drag = null;
      delete viewport.dataset.dragging;
    };
    const pointerDown = (event: PointerEvent) => {
      if (!fine.matches || reduced.matches || event.pointerType === "touch" || event.button !== 0) return;
      event.preventDefault();
      viewport.focus({ preventScroll: true });
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, view: { ...target } };
      viewport.setPointerCapture(event.pointerId);
      viewport.dataset.dragging = "true";
    };
    const pointerMove = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      target = {
        x: Math.max(38, Math.min(74, drag.view.x - (event.clientY - drag.y) * 0.2)),
        z: drag.view.z + (event.clientX - drag.x) * 0.35,
      };
      update();
    };
    const keyDown = (event: KeyboardEvent) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home"].includes(event.key)) return;
      event.preventDefault();
      endDrag();
      if (event.key === "Home") reset(true);
      else {
        if (event.key === "ArrowLeft") target.z -= 12;
        if (event.key === "ArrowRight") target.z += 12;
        if (event.key === "ArrowUp") target.x = Math.max(38, target.x - 8);
        if (event.key === "ArrowDown") target.x = Math.min(74, target.x + 8);
        update(true);
      }
    };
    const syncVisibility = () => {
      if (document.hidden || !visible) {
        endDrag();
        snap();
      }
    };
    const syncPreferences = () => { endDrag(); reset(true); };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncVisibility();
    });
    observer.observe(viewport);
    viewport.addEventListener("pointerdown", pointerDown);
    viewport.addEventListener("pointermove", pointerMove);
    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);
    viewport.addEventListener("lostpointercapture", endDrag);
    viewport.addEventListener("keydown", keyDown);
    viewport.addEventListener("blur", endDrag);
    document.addEventListener("visibilitychange", syncVisibility);
    reduced.addEventListener("change", syncPreferences);
    fine.addEventListener("change", syncPreferences);
    window.addEventListener("blur", syncPreferences);
    return () => {
      endDrag();
      stop();
      observer.disconnect();
      resetRef.current = () => {};
      viewport.removeEventListener("pointerdown", pointerDown);
      viewport.removeEventListener("pointermove", pointerMove);
      viewport.removeEventListener("pointerup", endDrag);
      viewport.removeEventListener("pointercancel", endDrag);
      viewport.removeEventListener("lostpointercapture", endDrag);
      viewport.removeEventListener("keydown", keyDown);
      viewport.removeEventListener("blur", endDrag);
      document.removeEventListener("visibilitychange", syncVisibility);
      reduced.removeEventListener("change", syncPreferences);
      fine.removeEventListener("change", syncPreferences);
      window.removeEventListener("blur", syncPreferences);
    };
  }, []);

  return (
    <div className="system-model">
      <div ref={viewportRef} className="model-viewport" tabIndex={0} role="group" aria-label={`${label}, shown as a 3D system model. Use arrow keys to rotate, or Home to reset the view.`}>
        <div className="model-scale" aria-hidden="true">
          <div ref={rotationRef} className="model-rotation">
            <div className="model-floor"><span /><span /></div>
            <div className="model-float">
              <div className="model-guide guide-one" /><div className="model-guide guide-two" />
              <div className="model-guide guide-three" /><div className="model-guide guide-four" />
              <Block className="model-foundation">
                <span className="foundation-outline" />
                <span className="board-label">FOUNDATION</span>
                <span className="board-pins"><i /><i /><i /><i /><i /><i /></span>
              </Block>
              <Block className="model-board">
                <svg className="board-circuits" viewBox="0 0 216 216" fill="none">
                  <path d="M20 35h38l22 22v45m116-67h-38l-22 22v45M20 181h38l22-22v-45m116 67h-38l-22-22v-45M20 108h176M108 20v176" stroke="currentColor" strokeWidth="2" />
                  {[ [20, 35], [196, 35], [20, 181], [196, 181], [20, 108], [196, 108], [108, 20], [108, 196] ].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill="currentColor" />)}
                </svg>
                <span className="board-label">CONNECT</span>
              </Block>
              <div className="model-core-float">
                <Block className="model-core">
                  <span className="core-surface" />
                  <svg className="model-glyph glyph-deploy" viewBox="0 0 64 64" fill="none"><path d="m10 23 22-12 22 12-22 12-22-12Zm0 10 22 12 22-12M10 43l22 12 22-12" /></svg>
                  <svg className="model-glyph glyph-mail" viewBox="0 0 64 64" fill="none"><rect x="10" y="16" width="44" height="33" rx="5" /><path d="m12 19 20 16 20-16" /></svg>
                  <svg className="model-glyph glyph-media" viewBox="0 0 64 64" fill="none"><path d="M12 27v10m10-19v28M32 10v44m10-36v28m10-19v10" /></svg>
                  <span className="core-status"><i />PROCESS</span>
                </Block>
              </div>
              <span className="model-packet packet-one" /><span className="model-packet packet-two" />
            </div>
          </div>
        </div>
      </div>
      <div className="model-tools">
        <span className="model-drag-hint"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 10h14M10 3v14M6 7l-3 3 3 3m8-6 3 3-3 3M7 6l3-3 3 3m-6 8 3 3 3-3" /></svg>Drag to rotate</span>
        <span className="model-static-hint">Built layer by layer</span>
        <button type="button" onClick={(event) => resetRef.current(event.detail === 0)} aria-label="Reset 3D model view">Reset view <span aria-hidden="true">↺</span></button>
      </div>
    </div>
  );
}
