import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { buildIndividualSearchUrl } from "../lib/city-search-postcodes.mjs";

test("individual search links point to the live ICONY search with AID=location", () => {
  for (const market of ["de", "at", "ch"]) {
    const url = new URL(buildIndividualSearchUrl(market));
    assert.equal(url.protocol, "https:");
    assert.equal(url.hostname, `alleinerziehende-singles.${market}`);
    assert.equal(url.pathname, "/suche/");
    assert.equal(url.searchParams.get("AID"), "location");
    assert.equal(url.searchParams.has("plz"), false);
  }
});

test("all city overview pages render the individual search fallback", async () => {
  const component = await readFile(new URL("../components/city-search-fallback.tsx", import.meta.url), "utf8");
  assert.match(component, /buildIndividualSearchUrl\(market\)/);
  assert.match(component, /Zur individuellen Suche/);
  assert.doesNotMatch(component, /vercel\.app/);

  const dePage = await readFile(new URL("../app/partnersuche/page.tsx", import.meta.url), "utf8");
  assert.match(dePage, /<CitySearchFallback market="de" \/>/);

  const marketPage = await readFile(new URL("../app/market-partnersuche/[market]/page.tsx", import.meta.url), "utf8");
  assert.match(marketPage, /<CitySearchFallback market=\{market\} \/>/);
});
