"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import "./system-motion.css";

const systems = [
  { name: "Halvo", slug: "halvo", input: "Your code", output: "Deployed", detail: "From a repository to a running container.", label: "Deployment platforms", mark: "deploy" },
  { name: "NubMail", slug: "nubmail", input: "Your message", output: "Delivered", detail: "Self-hosted email, from ingress to inbox.", label: "Mail infrastructure", mark: "mail" },
  { name: "Ytube API", slug: "ytube-api", input: "Your request", output: "Resolved", detail: "Search, metadata, and direct media streams.", label: "Media services", mark: "media" },
] as const;

export function SystemPlayground() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [keyboardSelection, setKeyboardSelection] = useState(false);
  const playgroundRef = useRef<HTMLDivElement>(null);
  const system = systems[active];

  useEffect(() => {
    const element = playgroundRef.current;
    if (!element) return;
    let inView = false;
    const syncPlayback = () => element.classList.toggle("motion-in-view", inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncPlayback();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", syncPlayback);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
    };
  }, []);

  return (
    <div ref={playgroundRef} className="system-playground" data-system={system.mark} data-paused={paused} data-keyboard-selection={keyboardSelection}>
      <div className="playground-top">
        <span>A few things I build</span>
        <button type="button" className="motion-toggle" onClick={() => setPaused(!paused)} aria-label={paused ? "Play illustration animation" : "Pause illustration animation"}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {paused ? <path d="m9 5 10 7-10 7V5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /> : <path d="M9 6v12M15 6v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
          </svg>
        </button>
      </div>
      <div className="system-art" aria-hidden="true">
        <div className="art-orbit art-orbit-one" />
        <div className="art-orbit art-orbit-two" />
        <div className="orbit-track orbit-track-one"><span className="orbit-rotor"><span className="orbit-satellite" /></span></div>
        <div className="orbit-track orbit-track-two"><span className="orbit-rotor"><span className="orbit-satellite" /></span></div>
        <div className="art-input"><svg viewBox="0 0 24 24" fill="none"><path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-12-2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg><span>{system.input}</span></div>
        <div className="art-core">
          <div className="core-blade blade-one" /><div className="core-blade blade-two" /><div className="core-blade blade-three" /><div className="core-blade blade-four" />
          <div className="core-center">
            <svg className="core-glyph glyph-deploy" viewBox="0 0 64 64" fill="none"><path d="m10 23 22-12 22 12-22 12-22-12Zm0 10 22 12 22-12M10 43l22 12 22-12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <svg className="core-glyph glyph-mail" viewBox="0 0 64 64" fill="none"><rect x="10" y="16" width="44" height="33" rx="5" stroke="currentColor" strokeWidth="3" /><path d="m12 19 20 16 20-16" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" /></svg>
            <svg className="core-glyph glyph-media" viewBox="0 0 64 64" fill="none"><path d="M12 27v10m10-19v28M32 10v44m10-36v28m10-19v10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg>
          </div>
        </div>
        <div className="art-output"><span className="output-check"><svg viewBox="0 0 24 24" fill="none"><path d="m6 12 4 5 8-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span><span>{system.output}</span></div>
        <span className="art-caption">{system.label}</span>
      </div>
      <div className="playground-bottom">
        <div className="system-select" role="group" aria-label="Explore a system">
          <span className="system-selection" aria-hidden="true" />
          {systems.map((item, i) => <button key={item.slug} type="button" aria-pressed={active === i} onClick={(event) => { setKeyboardSelection(event.detail === 0); setActive(i); }}>{item.name}</button>)}
        </div>
        <div className="system-description" aria-live="polite" aria-atomic="true"><p>{system.detail}</p><Link href={`/work/${system.slug}`} aria-label={`Explore ${system.name}`}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></Link></div>
      </div>
    </div>
  );
}
