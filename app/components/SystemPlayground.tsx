"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SystemModel } from "./SystemModel";
import "./system-motion.css";

const systems = [
  { name: "Halvo", slug: "halvo", input: "Your code", output: "Deployed", detail: "From a repository to a running container.", label: "Deployment platforms", mark: "deploy" },
  { name: "NubMail", slug: "nubmail", input: "Your message", output: "Delivered", detail: "Self-hosted email, from ingress to inbox.", label: "Mail infrastructure", mark: "mail" },
  { name: "Ytube API", slug: "ytube-api", input: "Your request", output: "Resolved", detail: "Search, metadata, and direct media streams.", label: "Media services", mark: "media" },
] as const;

export function SystemPlayground() {
  const [active, setActive] = useState(0);
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
    <div ref={playgroundRef} className="system-playground" data-system={system.mark} data-keyboard-selection={keyboardSelection}>
      <div className="playground-top">
        <span>How the pieces fit</span>
      </div>
      <div className="system-stage">
        <SystemModel label={system.label} />
        <div className="model-input" aria-hidden="true"><span className="node-dot" />{system.input}</div>
        <div className="model-output" aria-hidden="true"><svg viewBox="0 0 20 20" fill="none"><path d="m5 10 3 4 7-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>{system.output}</div>
      </div>
      <div className="playground-bottom">
        <div className="system-select" role="group" aria-label="Explore a system">
          <span className="system-selection" aria-hidden="true" />
          {systems.map((item, i) => <button key={item.slug} type="button" aria-pressed={active === i} onClick={(event) => { setKeyboardSelection(event.detail === 0); setActive(i); }}>{item.name}</button>)}
        </div>
        <div className="system-description" aria-live="polite" aria-atomic="true"><p>{system.detail}</p><Link href={`/work/${system.slug}`}><span>Explore {system.name}</span><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></Link></div>
      </div>
    </div>
  );
}
