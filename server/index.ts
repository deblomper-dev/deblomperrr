import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { checkRateLimit, getClientIp, RATE_LIMIT_MAX } from "../lib/rate-limiter";
import { isTurnstileEnabled, verifyTurnstile } from "../lib/turnstile";
import { getStreakCapsulesSVG } from "../lib/github/streak-stats";
import { getContributionGraphSVG } from "../lib/github/contribution-graph";
import { GitHubRequestLimitError, normalizeGitHubUsername } from "../lib/github/contributions";
import { getCanonicalPagePath } from "../lib/routes";

const PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = process.env.HOST || "0.0.0.0";
const DIST_DIR = path.resolve(process.cwd(), "dist/client");
const NOT_FOUND_HTML = path.join(DIST_DIR, "404.html");

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

// ── Contact Form Sanitization ────────────────────────────────────────────────
const MAX_LEN = { name: 100, email: 200, subject: 200, message: 5000 };
const CONTROL_CHARS = /[\u0000-\u001F\u007F]+/g;
const CONTROL_CHARS_KEEP_BREAKS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]+/g;

function clean(value: unknown, max: number, multiline = false): string {
  if (typeof value !== "string") return "";
  const stripped = multiline
    ? value.replace(CONTROL_CHARS_KEEP_BREAKS, "")
    : value.replace(CONTROL_CHARS, " ");
  return stripped.trim().slice(0, max);
}

const SVG_CACHE_CONTROL = "public, max-age=300, s-maxage=300, stale-while-revalidate=86400";
const EMAIL_TIMEOUT_MS = 15_000;

// Read JSON request body with max size cap
function readJsonBody(req: http.IncomingMessage, maxBytes = 64 * 1024): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    let bytes = 0;
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => {
      bytes += chunk.length;
      if (bytes > maxBytes) {
        req.destroy();
        resolve({});
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf-8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}

function sendJson(
  res: http.ServerResponse,
  statusCode: number,
  data: Record<string, unknown>,
  extraHeaders: Record<string, string> = {}
) {
  const payload = JSON.stringify(data);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
    ...extraHeaders,
  });
  res.end(payload);
}

// ── Contact Route Handler ────────────────────────────────────────────────────
async function handleContact(req: http.IncomingMessage, res: http.ServerResponse) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { success: false, error: "Method Not Allowed" });
  }

  // Convert Node headers to web Headers for rate limiter
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (typeof v === "string") headers.set(k, v);
    else if (Array.isArray(v)) headers.set(k, v.join(", "));
  }

  const ip = getClientIp(headers);
  const rateStatus = checkRateLimit(ip);

  if (rateStatus.limited) {
    return sendJson(
      res,
      429,
      { success: false, error: "Too many messages. Please try again later." },
      {
        "Retry-After": String(rateStatus.resetSeconds),
        "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(rateStatus.resetAt),
      }
    );
  }

  const body = await readJsonBody(req);

  // Honeypot check
  if (body?.hp_field) {
    return sendJson(
      res,
      200,
      { success: true, message: "Your message has been sent successfully!" },
      {
        "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
        "X-RateLimit-Remaining": String(rateStatus.remaining),
        "X-RateLimit-Reset": String(rateStatus.resetAt),
      }
    );
  }

  const name = clean(body?.name, MAX_LEN.name);
  const email = clean(body?.email, MAX_LEN.email);
  const subject = clean(body?.subject, MAX_LEN.subject) || "Portfolio Contact Form";
  const message = clean(body?.message, MAX_LEN.message, true);

  if (!name || !email || !message) {
    return sendJson(res, 400, { success: false, error: "Name, email, and message are required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return sendJson(res, 400, { success: false, error: "Please enter a valid email address." });
  }

  if (isTurnstileEnabled()) {
    const captcha = await verifyTurnstile(body?.turnstileToken, ip);
    if (!captcha.ok) {
      console.warn("[Contact] Turnstile failed:", captcha.reason, captcha.codes?.join(",") ?? "");
      const serverFault =
        captcha.reason === "timeout" ||
        captcha.reason === "network-error" ||
        captcha.reason === "not-configured";
      return sendJson(
        res,
        serverFault ? 503 : 403,
        {
          success: false,
          error: serverFault
            ? "Verification is temporarily unavailable. Please try again shortly or reach out via email directly."
            : "Verification failed. Please complete the security challenge.",
        },
        {
          "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
          "X-RateLimit-Remaining": String(rateStatus.remaining),
          "X-RateLimit-Reset": String(rateStatus.resetAt),
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
      return sendJson(res, 502, {
        success: false,
        error: "Failed to send message via mail service. Please reach out directly.",
      });
    }

    return sendJson(
      res,
      200,
      {
        success: true,
        message: "Your message has been sent successfully! I will get back to you soon.",
      },
      {
        "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
        "X-RateLimit-Remaining": String(rateStatus.remaining),
        "X-RateLimit-Reset": String(rateStatus.resetAt),
      }
    );
  } catch (error) {
    const isAbort = error instanceof Error && error.name === "AbortError";
    console.error("[Contact Route Exception]", error);
    return sendJson(
      res,
      isAbort ? 504 : 500,
      {
        success: false,
        error: isAbort
          ? "Sending timed out. Please try again or reach out via email directly."
          : "An unexpected error occurred. Please try again later.",
      }
    );
  } finally {
    clearTimeout(timer);
  }
}

// ── GitHub SVG Route Handler ────────────────────────────────────────────────
async function handleGitHub(slug: string, url: URL, res: http.ServerResponse) {
  if (!["streak-capsules.svg", "streak-capsules", "contribution-graph.svg", "contribution-graph"].includes(slug)) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    return res.end("Not Found");
  }

  const requestedUsername = url.searchParams.get("user") || url.searchParams.get("username") || undefined;
  let username: string | undefined;
  try {
    username = requestedUsername ? normalizeGitHubUsername(requestedUsername) : undefined;
  } catch {
    res.writeHead(400, {
      "Content-Type": "text/plain",
      "Cache-Control": "no-store",
    });
    return res.end("Invalid GitHub username.");
  }

  const showArea = url.searchParams.get("area") === "true";
  const explicitTheme = url.searchParams.get("theme");
  const theme = explicitTheme === "light" ? "light" : "dark";

  if (slug === "streak-capsules.svg" || slug === "streak-capsules") {
    try {
      const svg = await getStreakCapsulesSVG(username);
      res.writeHead(200, {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": SVG_CACHE_CONTROL,
      });
      return res.end(svg);
    } catch (err: unknown) {
      console.error("[Streak Capsules Error]", (err as Error)?.message ?? err);
      const fallback = `<svg xmlns="http://www.w3.org/2000/svg" width="620" height="28" viewBox="0 0 620 28">
  <rect x="0.5" y="0.5" width="619" height="27" fill="#1a1a1f" stroke="#2a2a3a"/>
  <text x="310" y="14.5" text-anchor="middle" dominant-baseline="middle" fill="#c9c9d4" font-family="ui-monospace, monospace" font-size="11">Streak stats temporarily unavailable</text>
</svg>`;
      res.writeHead(err instanceof GitHubRequestLimitError ? 429 : 503, {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "no-store",
        ...(err instanceof GitHubRequestLimitError ? { "Retry-After": String(err.retryAfter) } : {}),
      });
      return res.end(fallback);
    }
  }

  if (slug === "contribution-graph.svg" || slug === "contribution-graph") {
    try {
      const svg = await getContributionGraphSVG(username, false, showArea, theme);
      res.writeHead(200, {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": SVG_CACHE_CONTROL,
      });
      return res.end(svg);
    } catch (err: unknown) {
      console.error("[Contribution Graph Error]", (err as Error)?.message ?? err);
      const fallback = `<svg xmlns="http://www.w3.org/2000/svg" width="850" height="320" viewBox="0 0 850 320">
  <text x="425" y="165" text-anchor="middle" fill="#8b949e" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="14">Contribution graph temporarily unavailable</text>
</svg>`;
      res.writeHead(err instanceof GitHubRequestLimitError ? 429 : 503, {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "no-store",
        ...(err instanceof GitHubRequestLimitError ? { "Retry-After": String(err.retryAfter) } : {}),
      });
      return res.end(fallback);
    }
  }
}

// ── Static File Server with Path Traversal Protection ─────────────────────────
function serveStaticFile(
  filePath: string,
  req: http.IncomingMessage,
  res: http.ServerResponse,
  statusCode = 200,
): boolean {
  try {
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) return false;

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const isImmutable = filePath.includes(`${path.sep}assets${path.sep}`);

    res.writeHead(statusCode, {
      "Content-Type": contentType,
      "Content-Length": stat.size,
      "Cache-Control": isImmutable
        ? "public, max-age=31536000, immutable"
        : ext === ".html"
        ? "no-cache"
        : "public, max-age=3600",
      ...(statusCode === 404 ? { "X-Robots-Tag": "noindex" } : {}),
    });

    if (req.method === "HEAD") {
      res.end();
    } else {
      fs.createReadStream(filePath).on("error", () => res.destroy()).pipe(res);
    }
    return true;
  } catch {
    return false;
  }
}

// ── Main Server ──────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  let url: URL;
  let pathname: string;
  try {
    url = new URL(req.url || "/", "http://localhost");
    pathname = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end(req.method === "HEAD" ? undefined : "Bad Request");
  }

  // 1. API: Contact Form
  if (pathname === "/api/contact") {
    return handleContact(req, res);
  }

  // 2. API: GitHub SVG routes (/api/github/:slug)
  if (pathname.startsWith("/api/github/")) {
    const slug = pathname.slice("/api/github/".length);
    return handleGitHub(slug, url, res);
  }

  // Only GET & HEAD for static files and prerendered pages.
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { "Content-Type": "text/plain" });
    return res.end("Method Not Allowed");
  }

  // 3. Canonical page URLs and permanent redirects for published legacy URLs.
  const canonicalPath = getCanonicalPagePath(pathname);
  if (canonicalPath) {
    if (url.pathname !== canonicalPath) {
      res.writeHead(308, { Location: `${canonicalPath}${url.search}` });
      return res.end();
    }
    const pageFile = path.join(DIST_DIR, canonicalPath.slice(1), "index.html");
    if (serveStaticFile(pageFile, req, res)) return;
    res.writeHead(503, { "Content-Type": "text/plain; charset=utf-8", "Retry-After": "60" });
    return res.end(req.method === "HEAD" ? undefined : "Page temporarily unavailable");
  }

  // 4. Static Files
  // Resolve path safely inside DIST_DIR
  const sanitizedPath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, "");
  const targetFile = path.resolve(DIST_DIR, sanitizedPath.replace(/^\//, ""));

  // Enforce boundary check to prevent directory traversal
  if (targetFile.startsWith(DIST_DIR + path.sep) || targetFile === DIST_DIR) {
    if (serveStaticFile(targetFile, req, res, pathname === "/404.html" ? 404 : 200)) {
      return;
    }
  }

  // 5. Unknown pages must be actual 404s, not successful copies of the homepage.
  if (!pathname.startsWith("/api/") && (!path.extname(pathname) || path.extname(pathname) === ".html")) {
    if (serveStaticFile(NOT_FOUND_HTML, req, res, 404)) {
      return;
    }
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex" });
  res.end(req.method === "HEAD" ? undefined : "Not Found");
});

server.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});
