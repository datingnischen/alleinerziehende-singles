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
  assert.equal(publicUrl("ch", "/faq"), "https://alleinerziehende-singles.ch/faq/");
  assert.equal(publicUrl("ch", "/"), "https://alleinerziehende-singles.ch/");
  assert.equal(publicUrl("at", "/partnersuche/wien"), "https://alleinerziehende-singles.at/partnersuche/wien/");
  assert.equal(publicUrl("de", "/sitemap.xml"), "https://alleinerziehende-singles.de/sitemap.xml");
  assert.equal(publicUrl("de", "/impressum.html"), "https://alleinerziehende-singles.de/impressum.html");
  assert.equal(publicUrl("de", "/registration/?AID=magazin"), "https://alleinerziehende-singles.de/registration/?AID=magazin");
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
    action: "market-magazin",
    market: "at",
    pathname: "/market-magazin/at",
    slug: null,
  });
  assert.deepEqual(resolveMarketRequest("/at/dating-tipps"), {
    action: "placeholder",
    market: "at",
    pathname: "/market-placeholder/at",
    requestedPath: "/dating-tipps",
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
    url: "https://alleinerziehende-singles.at/registration/",
  });
  assert.deepEqual(resolveMarketRequest("/ch/login/", "alleinerziehende-singles.vercel.app"), {
    action: "redirect-platform",
    market: "ch",
    url: "https://alleinerziehende-singles.ch/login/",
  });
});

test("keeps non-migrated content market-specific on production hosts", async () => {
  const { resolveMarketRequest } = await loadMarkets();

  assert.deepEqual(resolveMarketRequest("/faq", "alleinerziehende-singles.at"), {
    action: "market-faq",
    market: "at",
    pathname: "/market-faq/at",
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
  assert.match(marketHomeSource, /<HomePage market=\{market\} posts=\{posts\} \/>/);
  assert.match(marketHomeSource, /getMagazinePostsByCategories\(EDITORIAL_CATEGORY_IDS, 3\)/);
  assert.match(marketHomeSource, /getHomeContent\(market\)/);
  const startseiten = JSON.parse(await readFile(new URL("../data/startseiten.json", import.meta.url), "utf8"));
  assert.equal(startseiten.at.h1, "Alleinerziehende Singles in Österreich finden");
  assert.equal(startseiten.ch.h1, "Alleinerziehende Singles in der Schweiz");
  for (const market of ["at", "ch"]) {
    const text = JSON.stringify(startseiten[market]);
    assert.match(text, /Christian M\. Haas/);
    assert.doesNotMatch(text, /alleinerziehende-singles\.(?!de|at|ch)|ab50|christlich-verliebt/);
  }
  assert.match(marketHomeSource, /robots:\s*\{\s*index:\s*true/);
  assert.match(marketHomeSource, /title:\s*\{\s*absolute:/);
  assert.match(placeholderSource, /generateMetadata/);
  assert.match(placeholderSource, /description:/);
  assert.match(placeholderSource, /title:\s*\{\s*absolute:/);
  assert.doesNotMatch(marketHomeSource, /vercel\.app/);
});

test("serves magazine, FAQ and about pages on the AT/CH domains instead of placeholders or platform loops", async () => {
  const { resolveMarketRequest } = await loadMarkets();

  assert.deepEqual(resolveMarketRequest("/ch/magazin/erstes-date-mit-kind/"), {
    action: "market-magazin",
    market: "ch",
    pathname: "/market-magazin/ch/erstes-date-mit-kind",
    slug: "erstes-date-mit-kind",
  });
  assert.deepEqual(resolveMarketRequest("/faq/", "alleinerziehende-singles.ch"), {
    action: "market-faq",
    market: "ch",
    pathname: "/market-faq/ch",
  });
  assert.deepEqual(resolveMarketRequest("/ueber-uns/", "alleinerziehende-singles.at"), {
    action: "market-about",
    market: "at",
    pathname: "/market-ueber-uns/at",
    slug: null,
  });
  assert.deepEqual(resolveMarketRequest("/at/ueber-uns/suche/"), {
    action: "market-about",
    market: "at",
    pathname: "/market-ueber-uns/at/suche",
    slug: "suche",
  });
  assert.deepEqual(resolveMarketRequest("/at/ueber-uns/irgendwas/"), {
    action: "placeholder",
    market: "at",
    pathname: "/market-placeholder/at",
    requestedPath: "/ueber-uns/irgendwas/",
  });
  // Login, Hilfe und Kontakt bleiben bei der ICONY-Plattform
  assert.deepEqual(resolveMarketRequest("/at/hilfe/"), {
    action: "redirect-platform",
    market: "at",
    url: "https://alleinerziehende-singles.at/hilfe/",
  });
  for (const internal of ["/market-magazin/at", "/market-faq/ch", "/market-ueber-uns/at/suche", "/at/market-magazin/at"]) {
    assert.deepEqual(resolveMarketRequest(internal), { action: "not-found" }, internal);
  }
});

test("market magazine, FAQ and about routes exist with market shells and the agreed canonicals", async () => {
  const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
  const [overview, article, faq, about, aboutDetail, sitemap, proxySource] = await Promise.all([
    read("../app/market-magazin/[market]/page.tsx"),
    read("../app/market-magazin/[market]/[slug]/page.tsx"),
    read("../app/market-faq/[market]/page.tsx"),
    read("../app/market-ueber-uns/[market]/page.tsx"),
    read("../app/market-ueber-uns/[market]/[slug]/page.tsx"),
    read("../app/market-sitemap/[market]/route.ts"),
    read("../proxy.ts"),
  ]);
  for (const source of [overview, faq, about, aboutDetail]) {
    assert.match(source, /<SiteShell market=\{market\}/);
  }
  for (const source of [overview, article, faq, about, aboutDetail]) {
    assert.match(source, /if \(!isMarketCode\(value\) \|\| value === "de"\) notFound\(\);/);
    assert.doesNotMatch(source, /vercel\.app/);
  }
  // Übersicht, FAQ und Über-uns-Hub sind eigene kanonische Seiten der Landesdomain …
  assert.match(overview, /canonical: publicUrl\(market, "\/magazin\/"\)/);
  assert.match(faq, /canonical: publicUrl\(market, faq\.path\)/);
  assert.match(about, /canonical: publicUrl\(market, "\/ueber-uns\/"\)/);
  // … Artikel gibt es nur auf .de: AT/CH leiten per 308 dorthin (kein Duplicate Content, Christian 2026-10-14)
  assert.match(article, /permanentRedirect\(publicUrl\("de", `\/magazin\/\$\{slug\}\/`\)\)/);
  assert.doesNotMatch(article, /<MagazineArticle/);
  assert.doesNotMatch(article, /canonical/);
  // Die ICONY-Unterseiten von Über uns zeigen auf die DE-Adresse (gleicher Text)
  assert.match(aboutDetail, /canonical: publicUrl\("de", `\/ueber-uns\/\$\{slug\}\/`\)/);
  const postCard = await read("../components/magazine/post-card.tsx");
  const articleLink = await read("../components/magazine/article-link.tsx");
  assert.match(postCard, /<ArticleLink/);
  assert.match(articleLink, /publicUrl\("de", path\)/);
  for (const path of ["/magazin/", "/faq/", "/ueber-uns/", "/ueber-uns/bewertungen/", "/ueber-uns/social-media/", "/ueber-uns/kooperationen/"]) {
    assert.ok(sitemap.includes(`publicUrl(market, "${path}")`), path);
  }
  assert.doesNotMatch(sitemap, /ueber-uns\/suche/);
  assert.match(proxySource, /market-\(\?:home\|placeholder\|partnersuche\|robots\|sitemap\|magazin\|faq\|ueber-uns\)/);
});

test("keeps the German Kindergeld content off the AT/CH domains", async () => {
  const { marketThemes, entryAvailableInMarket } = await import("../lib/magazine-market.ts");

  assert.deepEqual(marketThemes("de").map((theme) => theme.key), ["partnersuche", "singleleben", "kindergeld"]);
  assert.deepEqual(marketThemes("at").map((theme) => theme.key), ["partnersuche", "singleleben"]);
  assert.equal(entryAvailableInMarket("ch", { slug: "kindergeld-auszahlungstermine-2025", categoryIds: [] }), false);
  assert.equal(entryAvailableInMarket("ch", { slug: "unterhalt", categoryIds: [8] }), false);
  assert.equal(entryAvailableInMarket("ch", { slug: "unterhalt", categoryIds: [1] }), true);
  assert.equal(entryAvailableInMarket("de", { slug: "kindergeld", categoryIds: [8] }), true);
  const { buildSearchDocuments } = await import("../lib/search-index.ts");
  const atMagazine = buildSearchDocuments("at").filter((doc) => doc.area === "Magazin");
  assert.ok(atMagazine.length > 60);
  assert.ok(atMagazine.every((doc) => doc.href.startsWith("https://alleinerziehende-singles.de/magazin/")), "AT-Suche verlinkt Artikel auf .de");
  assert.ok(atMagazine.every((doc) => !/\/magazin\/kindergeld/.test(doc.href)));
  assert.ok(buildSearchDocuments("de").filter((doc) => doc.area === "Magazin").every((doc) => doc.href.startsWith("/magazin/")));
});
