"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Turnstile, { type TurnstileHandle } from "./Turnstile";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
  hp_field: string;
};

type FieldErrors = Partial<Record<"name" | "email" | "message", string>>;

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileHandle>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
    if (status === "error") errorRef.current?.focus();
  }, [status]);

  const handleTurnstileToken = useCallback((token: string | null) => {
    setTurnstileToken(token);
    if (token) setErrorMessage(null);
  }, []);

  const handleTurnstileError = useCallback(() => {
    setErrorMessage("Security verification failed. Please try again.");
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "name" || name === "email" || name === "message") {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (errorMessage) setErrorMessage(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim();
    const message = formData.message.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nextErrors: FieldErrors = {};
    if (!name) nextErrors.name = "Name is required.";
    if (!email) nextErrors.email = "Email is required.";
    else if (!emailRegex.test(email)) nextErrors.email = "Enter a valid email address.";
    if (!message) nextErrors.message = "Message is required.";
    setFieldErrors(nextErrors);

    const firstInvalid = nextErrors.name
      ? nameRef.current
      : nextErrors.email
        ? emailRef.current
        : nextErrors.message
          ? messageRef.current
          : null;

    if (firstInvalid) {
      setErrorMessage(
        !name || !email || !message
          ? "Please fill in your name, email, and message."
          : "Please enter a valid email address.",
      );
      requestAnimationFrame(() => firstInvalid.focus());
      return;
    }

    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setErrorMessage("Please complete the security check before sending.");
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
        throw new Error(data.error || "Your message could not be sent. Please try again.");
      }

      setStatus("success");
      setFormData(initialForm);
      setTurnstileToken(null);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again or send me an email.");
    } finally {
      turnstileRef.current?.reset();
    }
  }

  return (
    <>
      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {status === "submitting"
          ? "Sending your message."
          : status === "success"
            ? "Message delivered successfully."
            : ""}
      </p>
      {status === "success" ? (
        <div className="rounded border border-emerald-500/30 bg-surface p-5 text-center animate-slide-up">
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded bg-emerald-500/10 text-success mb-3">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 ref={successRef} tabIndex={-1} className="text-2xl font-semibold text-ink">Message sent.</h3>
          <p className="mt-2 text-base text-ink-muted">
            Thanks for reaching out. I’ll get back to you by email.
          </p>
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setTurnstileToken(null);
              requestAnimationFrame(() => nameRef.current?.focus());
            }}
            className="btn-press mt-5 font-mono inline-flex items-center gap-1.5 rounded border border-rule bg-bone px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-rule-strong"
          >
            <span>Send another message</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" aria-busy={status === "submitting"} noValidate>
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

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="cf-name" className="font-mono block text-[11px] font-semibold text-ink-faint uppercase tracking-wider mb-1.5">
                Your name <span className="text-success">*</span>
              </label>
              <input
                id="cf-name"
                ref={nameRef}
                type="text"
                name="name"
                required
                autoComplete="name"
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? "cf-name-error" : undefined}
                maxLength={100}
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                disabled={status === "submitting"}
                className="w-full font-mono rounded border border-rule bg-surface p-2 text-xs text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none transition-colors disabled:opacity-50"
              />
              {fieldErrors.name && (
                <p id="cf-name-error" className="mt-1 text-xs text-danger">{fieldErrors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="cf-email" className="font-mono block text-[11px] font-semibold text-ink-faint uppercase tracking-wider mb-1.5">
                Email address <span className="text-success">*</span>
              </label>
              <input
                id="cf-email"
                ref={emailRef}
                type="email"
                name="email"
                required
                autoComplete="email"
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "cf-email-error" : undefined}
                maxLength={200}
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={status === "submitting"}
                className="w-full font-mono rounded border border-rule bg-surface p-2 text-xs text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none transition-colors disabled:opacity-50"
              />
              {fieldErrors.email && (
                <p id="cf-email-error" className="mt-1 text-xs text-danger">{fieldErrors.email}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="cf-subject" className="font-mono block text-[11px] font-semibold text-ink-faint uppercase tracking-wider mb-1.5">
              Subject (optional)
            </label>
            <input
              id="cf-subject"
              type="text"
              name="subject"
              maxLength={200}
              placeholder="What’s on your mind?"
              value={formData.subject}
              onChange={handleChange}
              disabled={status === "submitting"}
              className="w-full font-mono rounded border border-rule bg-surface p-2 text-xs text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none transition-colors disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="cf-message" className="font-mono block text-[11px] font-semibold text-ink-faint uppercase tracking-wider mb-1.5">
              Your message <span className="text-success">*</span>
            </label>
            <textarea
              id="cf-message"
              ref={messageRef}
              name="message"
              required
              aria-invalid={Boolean(fieldErrors.message)}
              aria-describedby={fieldErrors.message ? "cf-message-error" : undefined}
              rows={4}
              maxLength={5000}
              placeholder="Tell me a little about your idea or project."
              value={formData.message}
              onChange={handleChange}
              disabled={status === "submitting"}
              className="w-full font-mono rounded border border-rule bg-surface p-2 text-xs text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none transition-colors disabled:opacity-50 resize-y leading-relaxed"
            />
            {fieldErrors.message && (
              <p id="cf-message-error" className="mt-1 text-xs text-danger">{fieldErrors.message}</p>
            )}
          </div>

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

      <div role="alert" aria-atomic="true" className={errorMessage ? undefined : "sr-only"}>
        {errorMessage && (
          <div ref={errorRef} tabIndex={-1} className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-danger">
            <p>{errorMessage}</p>
          </div>
        )}
      </div>

      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-rule mt-4">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="btn-press inline-flex items-center gap-2 rounded border border-rule bg-bone px-3 py-1.5 font-mono text-xs font-semibold text-ink transition-colors hover:border-rule-strong disabled:opacity-50"
        >
          {status === "submitting" ? (
            <>
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-ink-muted border-t-transparent" />
              <span>Sending…</span>
            </>
          ) : (
            <>
              <span>Send message</span>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </>
          )}
        </button>

        <span className="font-mono text-[10px] text-ink-faint uppercase">
          Sent with NubMail
        </span>
      </div>
    </form>
      )}
    </>
  );
}
