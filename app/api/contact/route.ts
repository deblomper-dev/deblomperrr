import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, RATE_LIMIT_MAX } from "@/lib/rate-limiter";
import { isTurnstileEnabled, verifyTurnstile } from "@/lib/turnstile";

// ── Sanitization (ported from nub-coders) ────────────────────────────────────
const MAX_LEN = { name: 100, email: 200, subject: 200, message: 5000 };

// C0 controls plus DEL. CR and LF are the ones that matter: `subject` is
// interpolated into the outbound mail subject, so if the mail API ever writes
// that value into a raw header, an embedded CRLF could inject headers of its own
// (Bcc, Reply-To, a second body). Stripping here means that can't reach it.
// eslint-disable-next-line no-control-regex -- matching control characters is the point
const CONTROL_CHARS = /[\u0000-\u001F\u007F]+/g;
// The same set minus tab, CR and LF — whitespace a multi-line body legitimately contains.
// eslint-disable-next-line no-control-regex -- matching control characters is the point
const CONTROL_CHARS_KEEP_BREAKS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]+/g;

function clean(value: unknown, max: number, multiline = false): string {
  if (typeof value !== "string") return "";
  const stripped = multiline
    ? value.replace(CONTROL_CHARS_KEEP_BREAKS, "")
    : value.replace(CONTROL_CHARS, " ");
  return stripped.trim().slice(0, max);
}

// Mail API budget. Without this a stalled upstream would hold the connection open.
const EMAIL_TIMEOUT_MS = 15_000;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);

    // Rate limiter: 5 requests per 10-minute sliding window per IP
    const rateStatus = checkRateLimit(ip);

    if (rateStatus.limited) {
      return NextResponse.json(
        { success: false, error: "Too many messages. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateStatus.resetSeconds),
            "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rateStatus.resetAt),
          },
        }
      );
    }

    const body = await req.json().catch(() => ({}));

    // Honeypot field check (anti-spam bot trap)
    if (body?.hp_field) {
      // Silently accept bots without forwarding or costing an API call
      return NextResponse.json(
        { success: true, message: "Your message has been sent successfully!" },
        {
          headers: {
            "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
            "X-RateLimit-Remaining": String(rateStatus.remaining),
            "X-RateLimit-Reset": String(rateStatus.resetAt),
          },
        }
      );
    }

    const name = clean(body?.name, MAX_LEN.name);
    const email = clean(body?.email, MAX_LEN.email);
    const subject = clean(body?.subject, MAX_LEN.subject) || "Portfolio Contact Form";
    const message = clean(body?.message, MAX_LEN.message, true);

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Cloudflare Turnstile challenge verification
    // Runs after cheap local validation but before any outbound email call
    if (isTurnstileEnabled()) {
      const captcha = await verifyTurnstile(body?.turnstileToken, ip);
      if (!captcha.ok) {
        console.warn("[Contact] Turnstile failed:", captcha.reason, captcha.codes?.join(",") ?? "");
        const serverFault =
          captcha.reason === "timeout" ||
          captcha.reason === "network-error" ||
          captcha.reason === "not-configured";
        return NextResponse.json(
          {
            success: false,
            error: serverFault
              ? "Verification is temporarily unavailable. Please try again shortly or reach out via email directly."
              : "Verification failed. Please complete the security challenge.",
          },
          {
            status: serverFault ? 503 : 403,
            headers: {
              "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
              "X-RateLimit-Remaining": String(rateStatus.remaining),
              "X-RateLimit-Reset": String(rateStatus.resetAt),
            },
          }
        );
      }
    }

    const EMAIL_API_URL = process.env.EMAIL_API_URL || "https://mails.nubcoders.com/api/emails/send-api";
    const EMAIL_API_KEY = process.env.EMAIL_API_KEY || "";
    const EMAIL_FROM = process.env.EMAIL_FROM || "contact@deblomper.dev";
    const EMAIL_TO = process.env.EMAIL_TO || "contact@deblomper.dev";

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), EMAIL_TIMEOUT_MS);

    try {
      // Only notify the site owner. We deliberately do NOT send an auto-reply
      // to the submitted email to prevent arbitrary spam relay abuse.
      const emailPayload = {
        from: EMAIL_FROM,
        to: EMAIL_TO,
        subject: `Contact Form: ${subject} (${name})`,
        text: `New contact form submission from debloomer.dev\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}\n\nClient IP: ${ip}\nTimestamp: ${new Date().toISOString()}`,
      };

      const mailRes = await fetch(EMAIL_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": EMAIL_API_KEY,
        },
        body: JSON.stringify(emailPayload),
        signal: controller.signal,
      });

      if (!mailRes.ok) {
        const errText = await mailRes.text().catch(() => "");
        console.error("[Contact API Error]", mailRes.status, errText);
        return NextResponse.json(
          { success: false, error: "Failed to send message via mail service. Please reach out directly." },
          { status: 502 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: "Your message has been sent successfully! I will get back to you soon.",
        },
        {
          headers: {
            "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
            "X-RateLimit-Remaining": String(rateStatus.remaining),
            "X-RateLimit-Reset": String(rateStatus.resetAt),
          },
        }
      );
    } finally {
      clearTimeout(timer);
    }
  } catch (error) {
    const isAbort = error instanceof Error && error.name === "AbortError";
    console.error("[Contact Route Exception]", error);
    return NextResponse.json(
      {
        success: false,
        error: isAbort
          ? "Sending timed out. Please try again or reach out via email directly."
          : "An unexpected error occurred. Please try again later.",
      },
      { status: isAbort ? 504 : 500 }
    );
  }
}
