import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const exists = (path) => access(new URL(path, import.meta.url)).then(() => true, () => false);

test("serves the site search under /ueber-uns/suche/ and never at the ICONY-owned /suche", async () => {
  assert.equal(await exists("../app/ueber-uns/suche/page.tsx"), true);
  assert.equal(await exists("../app/suche"), false);
  assert.equal(await exists("../app/suche/page.tsx"), false);

  const detail = await read("../app/ueber-uns/[slug]/page.tsx");
  assert.doesNotMatch(detail, /slug: "suche"/);

  const { SEARCH_PATH } = await import("../lib/site-search.ts");
  assert.equal(SEARCH_PATH, "/ueber-uns/suche/");
});

test("keeps the search page out of the index and the sitemap", async () => {
  const [page, index, sitemap] = await Promise.all([read("../app/ueber-uns/suche/page.tsx"), read("../lib/search-index.ts"), read("../app/sitemap.ts")]);

  assert.match(page, /robots: \{ index: false, follow: true \}/);
  assert.match(page, /canonical: publicUrl\("de", SEARCH_PATH\)/);
  // Suchindex pro Markt (lib/search-index.ts): Magazin, Städte, Hub, FAQ, Über uns
  assert.match(index, /getMagazineSearchIndex/);
  assert.match(index, /getCityPages\(market\)/);
  assert.match(index, /getFaqData\(market\)/);
  assert.doesNotMatch(sitemap, /ueber-uns\/suche|SEARCH_PATH|"\/suche/);
});

test("links the search from the header and the about hub", async () => {
  const [shell, hub] = await Promise.all([read("../components/site-shell.tsx"), read("../app/ueber-uns/page.tsx")]);

  // Die Suche gibt es seit Oktober 2026 in allen Märkten (AT/CH unter /ueber-uns/suche/ der Landesdomain).
  assert.match(shell, /searchPath=\{SEARCH_PATH\}/);
  assert.match(hub, /<AboutHub /);
  const views = await read("../components/info/about-views.tsx");
  assert.match(views, /<AboutSearchForm market=\{market\} \/>/);
  const marketSearch = await read("../app/market-ueber-uns/[market]/suche/page.tsx");
  assert.match(marketSearch, /<SearchView market=\{market\} query=\{query\} \/>/);
  assert.match(marketSearch, /robots: \{ index: false, follow: true \}/);
  const marketDetail = await read("../app/market-ueber-uns/[market]/[slug]/page.tsx");
  assert.doesNotMatch(marketDetail, /slug === "suche"|searchParams/);
});

test("normalizes umlauts and ranks title hits before excerpt hits", async () => {
  const { normalizeSearchText, searchDocuments, htmlToText } = await import("../lib/site-search.ts");

  assert.equal(normalizeSearchText("Düsseldorf Straße Café"), "duesseldorf strasse cafe");
  assert.equal(htmlToText("<p>K&ouml;ln &amp; Umgebung</p>"), "Köln & Umgebung");

  const documents = [
    { area: "Magazin", title: "Unterhalt berechnen", href: "/magazin/a/", excerpt: "Tipps für Köln" },
    { area: "Stadt", title: "Alleinerziehende Singles in Köln", href: "/partnersuche/koeln/", excerpt: "Partnersuche" },
    { area: "Magazin", title: "Urlaub", href: "/magazin/b/", excerpt: "Nichts" },
  ];
  const results = searchDocuments(documents, "koeln");
  assert.deepEqual(results.map((result) => result.href), ["/partnersuche/koeln/", "/magazin/a/"]);
  assert.deepEqual(searchDocuments(documents, "   "), []);
  assert.equal(searchDocuments(documents, "a", 1).length, 1);
});
