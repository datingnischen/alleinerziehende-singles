import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function loadMarketContent() {
  try {
    return await import("../lib/market-icony-import.ts");
  } catch (error) {
    assert.fail(`lib/market-icony-import.ts must expose AT/CH regional content: ${error.message}`);
  }
}

test("imports the complete AT and CH regional inventories", async () => {
  const { getMarketCityPage, getMarketCityPages, getMarketPartnersucheHub } = await loadMarketContent();

  assert.equal(getMarketCityPages("at").length, 15);
  assert.equal(getMarketCityPages("ch").length, 15);
  assert.equal(getMarketPartnersucheHub("at").heroTitle, "Partnersuche für Alleinerziehende in Österreich – Tipps für jede Stadt");
  assert.equal(getMarketCityPage("at", "wien").icony.locationId, "21432");
  assert.equal(getMarketCityPage("ch", "zuerich").icony.frameId, "alleinerziehendech");

  for (const market of ["at", "ch"]) {
    for (const page of getMarketCityPages(market)) {
      const postcode = page.icony.locationValue.match(/^(\d{4})(?:,|\s|$)/)?.[1];
      assert.ok(postcode, `${market}/${page.slug} has no postcode in locationValue`);
      assert.equal(new URL(page.icony.frameUrl).searchParams.get("z"), postcode);
      const searchUrl = new URL(page.searchUrl);
      assert.equal(searchUrl.hostname, `alleinerziehende-singles.${market}`);
      assert.equal(searchUrl.pathname, "/suche/");
      assert.match(searchUrl.searchParams.get("plz"), /^\d{4}$/);
      assert.equal(searchUrl.searchParams.get("AID"), "location");
      assert.deepEqual([...searchUrl.searchParams.keys()], ["plz", "AID"]);
    }
  }
});

test("uses explicit central postcodes rather than broader AT/CH widget locations", async () => {
  const { getMarketCityPage } = await loadMarketContent();
  assert.equal(getMarketCityPage("at", "wien").searchUrl, "https://alleinerziehende-singles.at/suche/?plz=1010&AID=location");
  assert.equal(getMarketCityPage("ch", "bern").searchUrl, "https://alleinerziehende-singles.ch/suche/?plz=3011&AID=location");
  assert.equal(getMarketCityPage("ch", "zuerich").searchUrl, "https://alleinerziehende-singles.ch/suche/?plz=8001&AID=location");
});

test("rejects crossed market identity, country suffix, site, and frame country", async () => {
  const { validateMarketCityIdentity } = await loadMarketContent();
  const validFrame = "https://js.icony.com/frame/?z=1010&ctr=43";
  assert.equal(validateMarketCityIdentity("at", "at", "https://alleinerziehende-singles.at", "1010, Wien, AT", validFrame), "1010");
  assert.throws(() => validateMarketCityIdentity("at", "ch", "https://alleinerziehende-singles.at", "1010, Wien, AT", validFrame), /Invalid market identity/);
  assert.throws(() => validateMarketCityIdentity("at", "at", "https://alleinerziehende-singles.ch", "1010, Wien, AT", validFrame), /Invalid market identity/);
  assert.throws(() => validateMarketCityIdentity("at", "at", "https://alleinerziehende-singles.at", "1010, Wien, CH", validFrame), /Invalid market location/);
  assert.throws(() => validateMarketCityIdentity("at", "at", "https://alleinerziehende-singles.at", "1010, Wien, AT", "https://js.icony.com/frame/?z=1010&ctr=41"), /Invalid market location/);
  assert.throws(() => validateMarketCityIdentity("at", "at", "https://alleinerziehende-singles.at", "1010, Wien, AT", "https://js.icony.com/frame/?ctr=43"), /Invalid market location/);
  assert.throws(() => validateMarketCityIdentity("at", "at", "https://alleinerziehende-singles.at", "1010, Wien, AT", "https://js.icony.com/frame/?z=1010&z=9999&ctr=43"), /Invalid market location/);
  assert.throws(() => validateMarketCityIdentity("at", "at", "https://alleinerziehende-singles.at", "1010, Wien, AT", "https://js.icony.com/frame/?z=1010&ctr=43&ctr=41"), /Invalid market location/);
  assert.throws(() => validateMarketCityIdentity("at", "at", "https://alleinerziehende-singles.at", "1010, Wien, AT", "https://example.com/frame/?z=1010&ctr=43"), /Invalid market location/);
});

test("normalizes every imported page without executable markup or country leakage", async () => {
  const { getMarketCityPage, getMarketCityPages, getMarketPartnersucheHub } = await loadMarketContent();
  const pages = [
    getMarketPartnersucheHub("at"),
    getMarketPartnersucheHub("ch"),
    ...getMarketCityPages("at"),
    ...getMarketCityPages("ch"),
  ];
  const allHtml = pages.map((page) => page.contentHtml).join("\n");

  assert.doesNotMatch(allHtml, /<(?:script|iframe|form|input|button)\b/i);
  assert.doesNotMatch(allHtml, /\son[a-z]+\s*=/i);
  assert.doesNotMatch(allHtml, /(?:href|src)\s*=\s*["']\s*javascript:/i);
  assert.doesNotMatch(getMarketCityPage("ch", "zuerich").contentHtml, /<h[2-6]\b[^>]*>\s*(?:&nbsp;|<img)/i);
  assert.doesNotMatch(allHtml, /alleinerziehende-singles\.de/i);
  assert.doesNotMatch(allHtml, /christlich-verliebt\.at/i);

  for (const market of ["at", "ch"]) {
    const hubHtml = getMarketPartnersucheHub(market).contentHtml;
    assert.doesNotMatch(
      hubHtml,
      new RegExp(`href=["']https://alleinerziehende-singles\\.${market}/partnersuche/`, "i"),
    );
    assert.match(hubHtml, /href=["'][a-z0-9-]+\/["']/i);

    // Der Hub liegt unter /partnersuche/ (mit Schrägstrich), relative Stadtlinks enden ebenfalls auf "/".
    const previewBase = `https://alleinerziehende-singles.vercel.app/${market}/partnersuche/`;
    const publicBase = `https://alleinerziehende-singles.${market}/partnersuche/`;
    const relativeCityLinks = [...hubHtml.matchAll(/href=["']([a-z0-9-]+\/)["']/gi)]
      .map((match) => match[1]);
    assert.ok(relativeCityLinks.length > 0);
    for (const href of relativeCityLinks) {
      assert.equal(new URL(href, previewBase).pathname, `/${market}/partnersuche/${href}`);
      assert.equal(new URL(href, publicBase).pathname, `/partnersuche/${href}`);
    }
  }

  for (const market of ["at", "ch"]) {
    const marketHtml = [getMarketPartnersucheHub(market), ...getMarketCityPages(market)]
      .map((page) => page.contentHtml)
      .join("\n");
    const linkedHosts = [...marketHtml.matchAll(/href=["']https?:\/\/([^/"']+)/gi)]
      .map((match) => match[1].toLowerCase());
    const uniqueHosts = [...new Set(linkedHosts)];
    assert.ok(
      uniqueHosts.length === 0 ||
        (uniqueHosts.length === 1 && uniqueHosts[0] === `alleinerziehende-singles.${market}`),
    );
  }

  const klagenfurtHtml = getMarketCityPage("at", "klagenfurt").contentHtml;
  assert.match(klagenfurtHtml, /href=["']\.\.\/innsbruck\/["']/i);
  assert.match(klagenfurtHtml, /href=["']\.\.\/graz\/["']/i);
  assert.match(klagenfurtHtml, /href=["']\.\.\/["']/i);
  assert.doesNotMatch(klagenfurtHtml, /href=["']\/partnersuche\//i);
  assert.doesNotMatch(klagenfurtHtml, /href=["']https:\/\/alleinerziehende-singles\.at\/partnersuche\//i);
});

test("wires market hubs and city pages to market shells, canonicals and the shared city views", async () => {
  const hubSource = await readFile(new URL("../app/market-partnersuche/[market]/page.tsx", import.meta.url), "utf8");
  const citySource = await readFile(new URL("../app/market-partnersuche/[market]/[slug]/page.tsx", import.meta.url), "utf8");
  const sitemapSource = await readFile(new URL("../app/market-sitemap/[market]/route.ts", import.meta.url), "utf8");

  assert.match(hubSource, /SiteShell market=\{market\}/);
  assert.match(hubSource, /publicUrl\(market, "\/partnersuche\/"\)/);
  assert.match(hubSource, /<CityHub market=\{market\} \/>/);
  assert.match(citySource, /SiteShell market=\{market\} registrationContext="location"/);
  assert.match(citySource, /<CityPageView city=\{page\} \/>/);
  assert.match(citySource, /canonical: publicUrl\(market, page\.path\)/);
  assert.match(citySource, /robots:\s*\{\s*index:\s*true/);
  assert.match(sitemapSource, /getMarketCityPages/);
  assert.match(sitemapSource, /publicUrl\(market, page\.path\)/);
});

test("splits every city text into chapters and keeps the related city links", async () => {
  const { buildCityGuide } = await import("../lib/city-guide.ts");
  const { getCityPages } = await import("../lib/city-pages.ts");
  for (const market of ["de", "at", "ch"]) {
    for (const page of getCityPages(market)) {
      const guide = buildCityGuide({ contentHtml: page.contentHtml, imageUrl: page.imageUrl, creditUrl: page.creditUrl });
      assert.ok(guide.sections.length >= 1, `${market}/${page.slug} ohne Kapitel`);
      const text = guide.introHtml + guide.sections.map((section) => section.html).join("");
      assert.doesNotMatch(text, /Bildquelle|pixabay\.com/i, `${market}/${page.slug} Bildquelle im Text`);
      assert.doesNotMatch(text, /könnten auch interessant|k&ouml;nnten auch interessant|Nicht aus /, `${market}/${page.slug} Linkliste im Text`);
      assert.ok(!page.imageUrl || !text.includes(page.imageUrl), `${market}/${page.slug} Titelbild doppelt`);
    }
  }
});
