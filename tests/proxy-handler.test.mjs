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

  const prefixed = proxy(request("/de/", { host: "alleinerziehende-singles.at" }));
  assert.match(prefixed.headers.get("x-middleware-rewrite") ?? "", /\/market-home\/at\/?$/);

  const faq = proxy(request("/faq/", { host: "alleinerziehende-singles.at" }));
  assert.match(faq.headers.get("x-middleware-rewrite") ?? "", /\/market-placeholder\/at\/?\?requestedPath=%2Ffaq%2F$/);

  const legacyFeature = proxy(request("/fragenflirt.html", { host: "alleinerziehende-singles.ch" }));
  assert.match(legacyFeature.headers.get("x-middleware-rewrite") ?? "", /\/market-placeholder\/ch\?requestedPath=%2Ffragenflirt\.html$/);

  const login = proxy(request("/login/", { host: "alleinerziehende-singles.at" }));
  assert.match(login.headers.get("x-middleware-rewrite") ?? "", /\/market-placeholder\/at\/?\?requestedPath=%2Flogin%2F$/);
});

test("creates a noindex platform handoff with an absolute market URL", async () => {
  const { proxy } = await loadProxy();
  const response = proxy(request("/ch/login/", { host: "alleinerziehende-singles.vercel.app" }));
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.match(body, /noindex,nofollow/);
  assert.match(body, /https:\/\/alleinerziehende-singles\.ch\/login/);
});

test("redirects page paths without trailing slash with 308", async () => {
  const { proxy } = await loadProxy();
  const vercel = { host: "alleinerziehende-singles.vercel.app" };
  const location = (pathname, headers = vercel) => {
    const response = proxy(request(pathname, headers));
    assert.equal(response.status, 308, pathname);
    return response.headers.get("location");
  };

  // Ohne Marktpräfix relativ auf denselben Host, Query bleibt erhalten.
  assert.equal(location("/magazin"), "https://internal.vercel.app/magazin/");
  assert.equal(location("/magazin?thema=kindergeld"), "https://internal.vercel.app/magazin/?thema=kindergeld");
  assert.equal(location("/ueber-uns/bewertungen"), "https://internal.vercel.app/ueber-uns/bewertungen/");

  // Internes Marktpräfix: absolut auf die öffentliche Landesdomain ohne Präfix.
  assert.equal(location("/at/partnersuche/wien"), "https://alleinerziehende-singles.at/partnersuche/wien/");
  assert.equal(location("/ch/partnersuche?x=1"), "https://alleinerziehende-singles.ch/partnersuche/?x=1");
  assert.equal(location("/at"), "https://alleinerziehende-singles.at/");
  assert.equal(location("/de/magazin"), "https://alleinerziehende-singles.de/magazin/");
  assert.equal(location("/ch/login"), "https://alleinerziehende-singles.ch/login/");

  // nginx ruft upstream mit Präfix auf: die Landesdomain gewinnt, wie im Router.
  assert.equal(location("/at/partnersuche", { host: "alleinerziehende-singles.at" }), "https://alleinerziehende-singles.at/partnersuche/");
  assert.equal(location("/faq", { host: "alleinerziehende-singles.at" }), "https://internal.vercel.app/faq/");
});

test("never redirects slashed paths, the root, files, assets or internal rewrites", async () => {
  const { proxy } = await loadProxy();
  const vercel = { host: "alleinerziehende-singles.vercel.app" };
  for (const pathname of ["/", "/magazin/", "/at/partnersuche/wien/", "/sitemap.xml", "/robots.txt", "/impressum.html", "/brand/logo.svg", "/app-assets/x", "/api/x", "/.well-known/x"]) {
    const response = proxy(request(pathname, vercel));
    assert.notEqual(response.status, 308, pathname);
  }
  const internal = proxy(request("/market-home/at", vercel));
  assert.equal(internal.status, 404);
});
