"use client";

import { useEffect, useRef, useState } from "react";

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export function CopyButton({ text, label, className = "" }: CopyButtonProps) {
  const [status, setCopied] = useState<"idle" | "copied" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function handleCopy() {
    if (timer.current) clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(text);
      setCopied("copied");
    } catch {
      setCopied("error");
    }
    timer.current = setTimeout(() => setCopied("idle"), 2500);
  }

  return (
    <button type="button" onClick={handleCopy} aria-label={`Copy ${text}`} data-status={status} className={`copy-button btn-press ${className}`}>
      <span className="copy-icon" aria-hidden="true">
        <span className="copy-icon-default"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 1 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg></span>
        <span className="copy-icon-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 5 10-11" /></svg></span>
      </span>
      <span aria-live="polite">{status === "copied" ? "Copied!" : status === "error" ? "Couldn’t copy. Try again." : label || text}</span>
    </button>
  );
}
