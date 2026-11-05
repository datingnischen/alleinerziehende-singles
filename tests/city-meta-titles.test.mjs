import assert from "node:assert/strict";
import test from "node:test";

// Regel 2026-11-04: jede Stadtseite hat einen individuellen <title> (keine Schablone, in der nur die Stadt wechselt).
test("gives every city page an individual meta title and description", async () => {
  const { getCityPages } = await import("../lib/city-pages.ts");
  const seo = (await import("../data/partnersuche-seo.json", { with: { type: "json" } })).default;
  const titles = new Set();
  const descriptions = new Set();
  for (const market of ["de", "at", "ch"]) {
    const pages = getCityPages(market);
    assert.ok(pages.length > 0, `${market}: keine Stadtseiten`);
    for (const page of pages) {
      const id = `${market}/${page.slug}`;
      const entry = seo[market]?.[page.slug];
      assert.ok(entry?.metaTitle, `${id}: metaTitle fehlt in data/partnersuche-seo.json`);
      assert.equal(page.metaTitle, entry.metaTitle);
      assert.ok(page.metaTitle.length <= 60, `${id}: metaTitle ${page.metaTitle.length} > 60`);
      assert.ok(page.metaTitle.includes(page.name.replace(/ am Main$/, "")), `${id}: Stadt fehlt im Titel`);
      assert.doesNotMatch(page.metaTitle, /^Partnersuche in /, `${id}: Schablonen-Titel`);
      assert.ok(!titles.has(page.metaTitle), `${id}: Titel doppelt`);
      titles.add(page.metaTitle);
      const length = page.metaDescription.length;
      assert.ok(length >= 110 && length <= 155, `${id}: Description ${length} Zeichen`);
      assert.doesNotMatch(page.metaDescription, /…|\.\.\./, `${id}: Description mit Auslassungszeichen`);
      assert.ok(!descriptions.has(page.metaDescription), `${id}: Description doppelt`);
      descriptions.add(page.metaDescription);
      if (market === "ch") assert.doesNotMatch(page.metaTitle + page.metaDescription, /ß/, `${id}: ß im Schweizer Text`);
    }
  }
});
