"use client";

import { useCallback, useRef, useState } from "react";
import Turnstile, { type TurnstileHandle } from "./Turnstile";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
  hp_field: string;
};

const initialForm: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
  hp_field: "",
};

const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

export function ContactForm() {
  const [formData, setFormData] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileHandle>(null);

  const handleTurnstileToken = useCallback((token: string | null) => {
    setTurnstileToken(token);
    if (token) setErrorMessage(null);
  }, []);

  const handleTurnstileError = useCallback(() => {
    setErrorMessage("Security verification failed to load. Please refresh and try again.");
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim();
    const message = formData.message.trim();

    if (!name || !email || !message) {
      setErrorMessage("Please fill in your name, email, and message.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setErrorMessage("Please complete the security challenge verification below.");
      return;
    }

    setStatus("submitting");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          name,
          email,
          message,
          turnstileToken,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send message. Please try again.");
      }

      setStatus("success");
      setFormData(initialForm);
      setTurnstileToken(null);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      turnstileRef.current?.reset();
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-6 text-center animate-slide-up">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="mt-3 text-sm font-semibold text-ink">Message Sent Successfully</h3>
        <p className="mt-1.5 text-xs text-ink-muted leading-relaxed">
          Thanks for reaching out! Your message was delivered directly to my inbox and I will get back to you soon.
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setTurnstileToken(null);
          }}
          className="btn-press mt-5 inline-flex items-center gap-1.5 rounded-md border border-rule bg-surface px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-rule-strong"
        >
          <span>Send another message</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Honeypot field for spam prevention */}
      <input
        type="text"
        name="hp_field"
        value={formData.hp_field}
        onChange={handleChange}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className="mono block text-[11px] font-medium text-ink-faint uppercase tracking-wider mb-1.5">
            Your Name <span className="text-emerald-500">*</span>
          </label>
          <input
            id="cf-name"
            type="text"
            name="name"
            required
            maxLength={100}
            placeholder="Jane Doe"
            value={formData.name}
            onChange={handleChange}
            disabled={status === "submitting"}
            className="w-full rounded-md border border-rule bg-bone px-3 py-2 text-xs text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none transition-colors disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="cf-email" className="mono block text-[11px] font-medium text-ink-faint uppercase tracking-wider mb-1.5">
            Email Address <span className="text-emerald-500">*</span>
          </label>
          <input
            id="cf-email"
            type="email"
            name="email"
            required
            maxLength={200}
            placeholder="jane@example.com"
            value={formData.email}
            onChange={handleChange}
            disabled={status === "submitting"}
            className="w-full rounded-md border border-rule bg-bone px-3 py-2 text-xs text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none transition-colors disabled:opacity-50"
          />
        </div>
      </div>

      <div>
        <label htmlFor="cf-subject" className="mono block text-[11px] font-medium text-ink-faint uppercase tracking-wider mb-1.5">
          Subject
        </label>
        <input
          id="cf-subject"
          type="text"
          name="subject"
          maxLength={200}
          placeholder="Deployment infrastructure, project inquiry..."
          value={formData.subject}
          onChange={handleChange}
          disabled={status === "submitting"}
          className="w-full rounded-md border border-rule bg-bone px-3 py-2 text-xs text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none transition-colors disabled:opacity-50"
        />
      </div>

      <div>
        <label htmlFor="cf-message" className="mono block text-[11px] font-medium text-ink-faint uppercase tracking-wider mb-1.5">
          Message <span className="text-emerald-500">*</span>
        </label>
        <textarea
          id="cf-message"
          name="message"
          required
          rows={4}
          maxLength={5000}
          placeholder="Tell me about what you are building or looking to collaborate on..."
          value={formData.message}
          onChange={handleChange}
          disabled={status === "submitting"}
          className="w-full rounded-md border border-rule bg-bone px-3 py-2 text-xs text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none transition-colors disabled:opacity-50 resize-y"
        />
      </div>

      {/* Cloudflare Turnstile Verification */}
      {TURNSTILE_SITE_KEY && (
        <div className="pt-1">
          <Turnstile
            ref={turnstileRef}
            siteKey={TURNSTILE_SITE_KEY}
            action="contact"
            onToken={handleTurnstileToken}
            onError={handleTurnstileError}
          />
        </div>
      )}

      {errorMessage && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-600 dark:text-red-400">
          <p>{errorMessage}</p>
          <p className="mt-1 text-ink-muted">
            Or reach out directly at{" "}
            <a
              href="mailto:contact@deblomper.dev"
              className="font-medium text-ink underline transition-opacity hover:opacity-80"
            >
              contact@deblomper.dev
            </a>
          </p>
        </div>
      )}

      <div className="pt-1 flex items-center justify-between">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="btn-press inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-xs font-medium text-bone transition-all disabled:opacity-60"
        >
          {status === "submitting" ? (
            <>
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-bone border-t-transparent" />
              <span>Sending message…</span>
            </>
          ) : (
            <>
              <span>Send Message</span>
              <span aria-hidden="true" className="arrow">→</span>
            </>
          )}
        </button>

        <span className="mono text-[11px] text-ink-faint">
          Powered by NubMail API
        </span>
      </div>
    </form>
  );
}
