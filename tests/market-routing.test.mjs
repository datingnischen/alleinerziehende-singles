import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function loadMarkets() {
  try {
    return await import("../lib/markets.ts");
  } catch (error) {
    assert.fail(`lib/markets.ts must provide the multi-market contract: ${error.message}`);
  }
}

test("supports DE, AT and CH with their public domains and branded assets", async () => {
  const { MARKET_CODES, getMarket, publicUrl } = await loadMarkets();

  assert.deepEqual(MARKET_CODES, ["de", "at", "ch"]);
  assert.equal(getMarket("de").domain, "alleinerziehende-singles.de");
  assert.equal(getMarket("at").domain, "alleinerziehende-singles.at");
  assert.equal(getMarket("ch").domain, "alleinerziehende-singles.ch");
  assert.equal(getMarket("at").logoPath, "/brand/alleinerziehende-singles-at.svg");
  assert.equal(getMarket("ch").heroPath, "/brand/frontpage-visual-alleinerziehende.webp");
  assert.equal(publicUrl("ch", "/faq"), "https://alleinerziehende-singles.ch/faq");
});

test("keeps the Vercel root prefix-free and exposes market previews under hidden prefixes", async () => {
  const { resolveMarketRequest } = await loadMarkets();

  assert.deepEqual(resolveMarketRequest("/"), { action: "rewrite", market: "de", pathname: "/" });
  assert.deepEqual(resolveMarketRequest("/magazin"), {
    action: "rewrite",
    market: "de",
    pathname: "/magazin",
  });
  assert.deepEqual(resolveMarketRequest("/de"), { action: "rewrite", market: "de", pathname: "/" });
  assert.deepEqual(resolveMarketRequest("/at"), {
    action: "market-home",
    market: "at",
    pathname: "/market-home/at",
  });
  assert.deepEqual(resolveMarketRequest("/at/partnersuche"), {
    action: "market-partnersuche",
    market: "at",
    pathname: "/market-partnersuche/at",
  });
  assert.deepEqual(resolveMarketRequest("/ch/"), {
    action: "market-home",
    market: "ch",
    pathname: "/market-home/ch",
  });
});

test("resolves prefix-free production hosts to the correct country market", async () => {
  const { resolveMarketRequest } = await loadMarkets();

  assert.deepEqual(resolveMarketRequest("/", "alleinerziehende-singles.at"), {
    action: "market-home",
    market: "at",
    pathname: "/market-home/at",
  });
  assert.deepEqual(resolveMarketRequest("/partnersuche/zuerich", "alleinerziehende-singles.ch"), {
    action: "market-partnersuche-city",
    market: "ch",
    pathname: "/market-partnersuche/ch/zuerich",
    slug: "zuerich",
  });
  assert.deepEqual(resolveMarketRequest("/magazin", "alleinerziehende-singles.de"), {
    action: "rewrite",
    market: "de",
    pathname: "/magazin",
  });
});

test("keeps production hosts authoritative over explicit country prefixes", async () => {
  const { resolveMarketRequest } = await loadMarkets();

  assert.deepEqual(resolveMarketRequest("/de", "alleinerziehende-singles.at"), {
    action: "market-home",
    market: "at",
    pathname: "/market-home/at",
  });
  assert.deepEqual(resolveMarketRequest("/ch", "alleinerziehende-singles.at"), {
    action: "market-home",
    market: "at",
    pathname: "/market-home/at",
  });
  assert.deepEqual(resolveMarketRequest("/at", "alleinerziehende-singles.ch"), {
    action: "market-home",
    market: "ch",
    pathname: "/market-home/ch",
  });
});

test("gates unfinished market routes and protects implementation paths", async () => {
  const { resolveMarketRequest } = await loadMarkets();

  assert.deepEqual(resolveMarketRequest("/at/magazin"), {
    action: "placeholder",
    market: "at",
    pathname: "/market-placeholder/at",
    requestedPath: "/magazin",
  });
  assert.deepEqual(resolveMarketRequest("/ch/partnersuche/zuerich"), {
    action: "market-partnersuche-city",
    market: "ch",
    pathname: "/market-partnersuche/ch/zuerich",
    slug: "zuerich",
  });
  assert.deepEqual(resolveMarketRequest("/de/market-home/at"), { action: "not-found" });
  assert.deepEqual(resolveMarketRequest("/market-home/at"), { action: "not-found" });
  assert.deepEqual(resolveMarketRequest("/market-placeholder/ch"), { action: "not-found" });
  assert.deepEqual(resolveMarketRequest("/market-robots/at"), { action: "not-found" });
  assert.deepEqual(resolveMarketRequest("/market-sitemap/ch"), { action: "not-found" });
  assert.deepEqual(resolveMarketRequest("/_next/image"), { action: "pass" });
  assert.deepEqual(resolveMarketRequest("/app-assets/_next/static/app.js"), { action: "pass" });
  assert.deepEqual(resolveMarketRequest("/brand/logo.svg"), { action: "pass" });
});

test("preview platform routes leave Vercel for the existing market platform", async () => {
  const { resolveMarketRequest } = await loadMarkets();

  assert.deepEqual(resolveMarketRequest("/at/registration/", "alleinerziehende-singles.vercel.app"), {
    action: "redirect-platform",
    market: "at",
    url: "https://alleinerziehende-singles.at/registration",
  });
  assert.deepEqual(resolveMarketRequest("/ch/login/", "alleinerziehende-singles.vercel.app"), {
    action: "redirect-platform",
    market: "ch",
    url: "https://alleinerziehende-singles.ch/login",
  });
});

test("keeps non-migrated content market-specific on production hosts", async () => {
  const { resolveMarketRequest } = await loadMarkets();

  assert.deepEqual(resolveMarketRequest("/faq", "alleinerziehende-singles.at"), {
    action: "placeholder",
    market: "at",
    pathname: "/market-placeholder/at",
    requestedPath: "/faq",
  });
  assert.deepEqual(resolveMarketRequest("/fragenflirt.html", "alleinerziehende-singles.ch"), {
    action: "placeholder",
    market: "ch",
    pathname: "/market-placeholder/ch",
    requestedPath: "/fragenflirt.html",
  });
  assert.deepEqual(resolveMarketRequest("/login", "alleinerziehende-singles.at"), {
    action: "placeholder",
    market: "at",
    pathname: "/market-placeholder/at",
    requestedPath: "/login",
  });
});

test("routes market SEO endpoints without exposing internal implementation paths", async () => {
  const { resolveMarketRequest } = await loadMarkets();

  assert.deepEqual(resolveMarketRequest("/at/robots.txt"), {
    action: "market-robots",
    market: "at",
    pathname: "/market-robots/at",
  });
  assert.deepEqual(resolveMarketRequest("/ch/sitemap.xml"), {
    action: "market-sitemap",
    market: "ch",
    pathname: "/market-sitemap/ch",
  });
});

test("proxy, canonical helpers and market-specific rendered copy are wired", async () => {
  const proxySource = await readFile(new URL("../proxy.ts", import.meta.url), "utf8").catch(() => "");
  const marketHomeSource = await readFile(
    new URL("../app/market-home/[market]/page.tsx", import.meta.url),
    "utf8",
  ).catch(() => "");
  const placeholderSource = await readFile(
    new URL("../app/market-placeholder/[market]/page.tsx", import.meta.url),
    "utf8",
  ).catch(() => "");

  assert.match(proxySource, /resolveMarketRequest/);
  assert.match(proxySource, /x-forwarded-host/);
  assert.match(proxySource, /http-equiv="refresh"/);
  assert.match(proxySource, /location\.replace/);
  assert.match(proxySource, /NextResponse\.rewrite/);
  assert.match(marketHomeSource, /publicUrl\(market\)/);
  assert.match(marketHomeSource, /Alleinerziehende Singles in Österreich finden/);
  assert.match(marketHomeSource, /Alleinerziehende Singles in der Schweiz/);
  assert.match(marketHomeSource, /publicUrl\(market, "\/partnersuche"\)/);
  assert.match(marketHomeSource, /Partnersuche in der Schweiz/);
  assert.match(marketHomeSource, /Christian M\. Haas/);
  assert.match(marketHomeSource, /robots:\s*\{\s*index:\s*true/);
  assert.match(marketHomeSource, /title:\s*\{\s*absolute:/);
  assert.match(placeholderSource, /generateMetadata/);
  assert.match(placeholderSource, /description:/);
  assert.match(placeholderSource, /title:\s*\{\s*absolute:/);
  assert.doesNotMatch(marketHomeSource, /vercel\.app/);
});
