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
    assert.match(hubHtml, /href=["']partnersuche\/[a-z0-9-]+["']/i);

    const previewBase = `https://alleinerziehende-singles.vercel.app/${market}/partnersuche`;
    const relativeCityLinks = [...hubHtml.matchAll(/href=["'](partnersuche\/[a-z0-9-]+)["']/gi)]
      .map((match) => match[1]);
    assert.ok(relativeCityLinks.length > 0);
    for (const href of relativeCityLinks) {
      assert.equal(new URL(href, previewBase).pathname, `/${market}/${href}`);
    }
  }

  for (const market of ["at", "ch"]) {
    const marketHtml = [getMarketPartnersucheHub(market), ...getMarketCityPages(market)]
      .map((page) => page.contentHtml)
      .join("\n");
    const linkedHosts = [...marketHtml.matchAll(/href=["']https?:\/\/([^/"']+)/gi)]
      .map((match) => match[1].toLowerCase());
    assert.deepEqual([...new Set(linkedHosts)], [`alleinerziehende-singles.${market}`]);
  }
});

test("wires market hubs and city pages to market shells, canonicals and ICONY frames", async () => {
  const hubSource = await readFile(new URL("../app/market-partnersuche/[market]/page.tsx", import.meta.url), "utf8").catch(() => "");
  const citySource = await readFile(new URL("../app/market-partnersuche/[market]/[slug]/page.tsx", import.meta.url), "utf8").catch(() => "");
  const sitemapSource = await readFile(new URL("../app/market-sitemap/[market]/route.ts", import.meta.url), "utf8").catch(() => "");
  const marketHomeSource = await readFile(new URL("../app/market-home/[market]/page.tsx", import.meta.url), "utf8").catch(() => "");

  assert.match(hubSource, /SiteShell market=\{market\}/);
  assert.match(hubSource, /publicUrl\(market, "\/partnersuche"\)/);
  assert.match(citySource, /page\.icony\.frameUrl/);
  assert.match(citySource, /Wer ist gerade online in \{page\.cityLabel\}\?/);
  assert.match(citySource, /className=\{styles\.sidebarWidgetFrame\}/);
  assert.doesNotMatch(citySource, /bestehende ICONY-Plattform bereitgestellt/);
  assert.match(citySource, /sourceAttributionUrl/);
  assert.match(citySource, /robots:\s*\{\s*index:\s*true/);
  assert.match(sitemapSource, /getMarketCityPages/);
  assert.match(sitemapSource, /publicUrl\(market, page\.path\)/);
  assert.match(marketHomeSource, /Wichtige Einstiegsseiten/);
  assert.match(marketHomeSource, /previewPath\(market, entry\.href\)/);
  assert.match(marketHomeSource, /Partnersuche in Österreich/);
  assert.match(marketHomeSource, /Wien kennenlernen/);
});
