import { afterEach, beforeEach, mock, test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST } from "../app/api/contact/route";
import { resetRateLimits } from "./rate-limiter";

const originalEnv = process.env;

beforeEach(() => {
  process.env = {
    ...originalEnv,
    NODE_ENV: "production",
    TURNSTILE_SECRET_KEY: "",
    EMAIL_API_URL: "https://mail.example.invalid/send",
    EMAIL_API_KEY: "test-mail-key",
    EMAIL_FROM: "owner@example.invalid",
    EMAIL_TO: "owner@example.invalid",
  };
  resetRateLimits();
  mock.method(console, "error", () => {});
  mock.method(console, "warn", () => {});
  mock.method(globalThis, "fetch", async () => {
    throw new Error("Unexpected external request in contact test.");
  });
});

afterEach(() => {
  process.env = originalEnv;
  resetRateLimits();
  mock.restoreAll();
});

function request(extra: Record<string, unknown> = {}) {
  return new NextRequest("http://localhost/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-real-ip": "192.0.2.10" },
    body: JSON.stringify({
      name: "Test Sender",
      email: "sender@example.invalid",
      message: "A locally mocked contact request.",
      ...extra,
    }),
  });
}

test("production without a Turnstile secret fails closed before sending mail", async () => {
  const fetchMock = mock.method(globalThis, "fetch", async () => Response.json({}));
  const response = await POST(request());
  assert.equal(response.status, 503);
  assert.equal((await response.json()).success, false);
  assert.equal(fetchMock.mock.callCount(), 0);
});

test("configured Turnstile rejects missing or failed challenges without sending mail", async () => {
  process.env.TURNSTILE_SECRET_KEY = "test-turnstile-secret";
  const fetchMock = mock.method(globalThis, "fetch", async (url: Parameters<typeof fetch>[0]) => {
    assert.equal(String(url), "https://challenges.cloudflare.com/turnstile/v0/siteverify");
    return Response.json({ success: false, "error-codes": ["invalid-input-response"] });
  });
  assert.equal((await POST(request())).status, 403);
  assert.equal(fetchMock.mock.callCount(), 0);
  assert.equal((await POST(request({ turnstileToken: "failed-token" }))).status, 403);
  assert.equal(fetchMock.mock.callCount(), 1);
});

test("a verified request sends one notification to the configured owner", async () => {
  process.env.TURNSTILE_SECRET_KEY = "test-turnstile-secret";
  const fetchMock = mock.method(globalThis, "fetch", async (url: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
    if (String(url).includes("/siteverify")) {
      const verification = new URLSearchParams(String(init?.body));
      assert.equal(verification.get("response"), "valid-token");
      assert.equal(verification.get("remoteip"), "192.0.2.10");
      return Response.json({ success: true, action: "contact" });
    }
    assert.equal(String(url), "https://mail.example.invalid/send");
    const mail = JSON.parse(String(init?.body));
    assert.equal(mail.to, "owner@example.invalid");
    assert.equal(mail.from, "owner@example.invalid");
    assert.match(mail.text, /sender@example\.invalid/);
    assert.ok(!/[\r\n]/.test(mail.subject));
    return Response.json({ success: true });
  });
  const response = await POST(request({ turnstileToken: "valid-token", subject: "Hello\r\nBcc: nobody" }));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).success, true);
  assert.equal(fetchMock.mock.callCount(), 2);
});

test("local development still permits contact requests without Turnstile configuration", async () => {
  process.env = { ...process.env, NODE_ENV: "development" };
  const fetchMock = mock.method(globalThis, "fetch", async (url: Parameters<typeof fetch>[0]) => {
    assert.equal(String(url), "https://mail.example.invalid/send");
    return Response.json({ success: true });
  });
  assert.equal((await POST(request())).status, 200);
  assert.equal(fetchMock.mock.callCount(), 1);
});

test("honeypot submissions never send mail, including when production is misconfigured", async () => {
  const fetchMock = mock.method(globalThis, "fetch", async () => Response.json({}));
  assert.equal((await POST(request({ hp_field: "filled-by-a-bot" }))).status, 200);
  assert.equal(fetchMock.mock.callCount(), 0);
});
