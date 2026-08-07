import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server.js";

async function loadProxy() {
  try {
    return await import("../proxy.ts");
  } catch (error) {
    assert.fail(`proxy.ts must be directly testable: ${error.message}`);
  }
}

function request(pathname, headers = {}) {
  return new NextRequest(`https://internal.vercel.app${pathname}`, { headers });
}

test("rejects spoofed internal rewrite headers and public implementation paths", async () => {
  const { proxy } = await loadProxy();
  const response = proxy(request("/market-home/at", {
    host: "alleinerziehende-singles.vercel.app",
    "x-aes-rewrite-destination": "/market-home/at",
  }));

  assert.equal(response.status, 404);
});

test("uses a forwarded public market host only behind a non-market origin host", async () => {
  const { proxy } = await loadProxy();
  const forwarded = proxy(request("/", {
    host: "alleinerziehende-singles.vercel.app",
    "x-forwarded-host": "alleinerziehende-singles.at",
  }));
  assert.match(forwarded.headers.get("x-middleware-rewrite") ?? "", /\/market-home\/at$/);

  const direct = proxy(request("/", {
    host: "alleinerziehende-singles.at",
    "x-forwarded-host": "alleinerziehende-singles.ch",
  }));
  assert.match(direct.headers.get("x-middleware-rewrite") ?? "", /\/market-home\/at$/);
});

test("keeps production hosts authoritative over prefixes and legacy content routes", async () => {
  const { proxy } = await loadProxy();

  const prefixed = proxy(request("/de", { host: "alleinerziehende-singles.at" }));
  assert.match(prefixed.headers.get("x-middleware-rewrite") ?? "", /\/market-home\/at$/);

  const faq = proxy(request("/faq", { host: "alleinerziehende-singles.at" }));
  assert.match(faq.headers.get("x-middleware-rewrite") ?? "", /\/market-placeholder\/at\?requestedPath=%2Ffaq$/);

  const legacyFeature = proxy(request("/fragenflirt.html", { host: "alleinerziehende-singles.ch" }));
  assert.match(legacyFeature.headers.get("x-middleware-rewrite") ?? "", /\/market-placeholder\/ch\?requestedPath=%2Ffragenflirt\.html$/);

  const login = proxy(request("/login", { host: "alleinerziehende-singles.at" }));
  assert.match(login.headers.get("x-middleware-rewrite") ?? "", /\/market-placeholder\/at\?requestedPath=%2Flogin$/);
});

test("creates a noindex platform handoff with an absolute market URL", async () => {
  const { proxy } = await loadProxy();
  const response = proxy(request("/ch/login", { host: "alleinerziehende-singles.vercel.app" }));
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.match(body, /noindex,nofollow/);
  assert.match(body, /https:\/\/alleinerziehende-singles\.ch\/login/);
});
