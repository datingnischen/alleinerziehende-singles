import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  getIconyWidgetConfig,
  iconyWidgetConfigs,
} from "../lib/icony-widget-config.ts";
import { buildCitySearchUrl, centralCityPostcodes } from "../lib/city-search-postcodes.mjs";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const deImport = JSON.parse(await read("../data/icony-import.json"));

test("keeps the verified legacy ICONY location contract for every DE city", () => {
  assert.equal(iconyWidgetConfigs.length, 15);

  const duesseldorf = getIconyWidgetConfig("duesseldorf");
  assert.deepEqual(duesseldorf, {
    slug: "duesseldorf",
    city: "Düsseldorf",
    zip: "40210",
    country: 49,
    platformId: "alleinerziehende",
  });

  for (const config of iconyWidgetConfigs) {
    assert.match(config.zip, /^\d{5}$/);
    assert.equal(config.country, 49);
    assert.equal(config.platformId, "alleinerziehende");
  }
});

test("keeps one central search postcode for every DE city independently from widget zips", () => {
  const inventorySlugs = deImport.cityPages.map((page) => page.slug).sort();
  assert.deepEqual(iconyWidgetConfigs.map((config) => config.slug).sort(), inventorySlugs);
  assert.deepEqual(Object.keys(centralCityPostcodes.de).sort(), inventorySlugs);
  for (const slug of inventorySlugs) {
    const postcode = centralCityPostcodes.de[slug];
    assert.equal(buildCitySearchUrl("de", slug), `https://alleinerziehende-singles.de/suche/?plz=${postcode}&AID=location`);
  }
  assert.equal(buildCitySearchUrl("de", "berlin"), "https://alleinerziehende-singles.de/suche/?plz=10117&AID=location");
  assert.equal(buildCitySearchUrl("de", "leipzig"), "https://alleinerziehende-singles.de/suche/?plz=04109&AID=location");
  assert.notEqual(centralCityPostcodes.de.berlin, getIconyWidgetConfig("berlin").zip);
  assert.throws(() => buildCitySearchUrl("de", "unknown"), /Missing central postcode/);
});

test("implements the elFlirt-style dynamic singles contract safely", async () => {
  const component = await read("../components/icony-singles-widget.tsx");

  assert.match(component, /gender === "women" \? 2 : 1/);
  assert.match(component, /icony\("get", "activities", "json"/);
  assert.match(component, /Gerade keine Schnelltreffer/);
  assert.match(component, /Wer in \{city\} gerade sucht/);
  assert.match(component, /Ausführlicher in \{city\} suchen/);
  assert.match(component, /href=\{searchUrl\}/);
  assert.match(component, /profileClickUrl: profileUrl/);
  assert.match(component, /sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"/);
  assert.match(component, /referrerPolicy="no-referrer"/);
  assert.match(component, /Für Profilvorschauen bitte JavaScript aktivieren/);
  assert.match(component, /--brand:#57ad46/);
  assert.doesNotMatch(component, /allow-same-origin/);
});

test("renders the local singles widget on every city page with market-specific location data", async () => {
  const view = await read("../components/city/city-page.tsx");
  assert.match(view, /<IconySinglesWidget/);
  assert.match(view, /zip=\{city\.widget\.zip\}/);
  assert.match(view, /country=\{city\.widget\.country\}/);
  assert.match(view, /searchUrl=\{city\.searchUrl\}/);
  assert.match(view, /profileUrl=\{publicUrl\(market, "\/\?AID=location"\)\}/);

  const { getCityPages } = await import("../lib/city-pages.ts");
  const expected = { de: [49, /^\d{5}$/], at: [43, /^\d{4}$/], ch: [41, /^\d{4}$/] };
  for (const market of ["de", "at", "ch"]) {
    const pages = getCityPages(market);
    assert.equal(pages.length, 15);
    for (const page of pages) {
      assert.equal(page.widget.country, expected[market][0], `${market}/${page.slug}`);
      assert.match(page.widget.zip, expected[market][1], `${market}/${page.slug}`);
      assert.equal(page.widget.platformId, "alleinerziehende");
      assert.equal(new URL(page.registrationUrl).searchParams.get("AID"), "location");
      assert.equal(new URL(page.searchUrl).hostname, `alleinerziehende-singles.${market}`);
      assert.ok(page.imageUrl, `${market}/${page.slug} braucht ein Titelbild`);
      assert.ok(page.geo, `${market}/${page.slug} braucht Koordinaten`);
    }
  }
});
