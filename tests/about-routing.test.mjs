import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("exposes the verified elFlirt-style about route hierarchy", async () => {
  const [overview, detail, shell] = await Promise.all([
    read("../app/ueber-uns/page.tsx"),
    read("../app/ueber-uns/[slug]/page.tsx"),
    read("../components/site-shell.tsx"),
  ]);

  for (const path of [
    "/ueber-uns",
    "/ueber-uns/social-media",
    "/ueber-uns/bewertungen",
    "/ueber-uns/kooperationen",
  ]) {
    assert.match(`${overview}\n${detail}\n${shell}`, new RegExp(path.replaceAll("/", "\\/")));
  }

  assert.match(detail, /getImportedRootPageBySlug\("social-media"\)/);
  assert.match(detail, /getImportedRootPageBySlug\("bewertungen-und-erfahrungen"\)/);
  const views = await read("../components/info/about-views.tsx");
  assert.match(views, /mailto:christian@datingnischen\.de/);
  assert.match(shell, /label: "Über uns", path: "\/ueber-uns\/"/);
});

test("permanently redirects the moved legacy pages", async () => {
  const rootPage = await read("../app/[slug]/page.tsx");

  assert.match(rootPage, /slug === "social-media"/);
  assert.match(rootPage, /permanentRedirect\("\/ueber-uns\/social-media\/"\)/);
  // Alt-Pfad /bewertungen-und-erfahrungen wird nicht mehr bedient (404).
  assert.doesNotMatch(rootPage, /bewertungen-und-erfahrungen/);
  assert.doesNotMatch(rootPage, /permanentRedirect\("\/ueber-uns\/bewertungen\/"\)/);
});

test("does not link internally through moved legacy URLs", async () => {
  const [home, partnersuche] = await Promise.all([
    read("../app/page.tsx"),
    read("../app/partnersuche/page.tsx"),
  ]);
  const source = `${home}\n${partnersuche}`;

  assert.doesNotMatch(source, /href="\/social-media"/);
  assert.doesNotMatch(source, /href="\/bewertungen-und-erfahrungen"/);

  // Die ICONY-Startseitentexte verlinken nach dem Import auf die Über-uns-Pfade, nie auf Altadressen.
  const startseiten = await read("../data/startseiten.json");
  assert.doesNotMatch(startseiten, /bewertungen-und-erfahrungen|alleinerziehende-singles\.de\/social-media|ab50\.de/);
  assert.match(startseiten, /\/ueber-uns\/bewertungen\//);
  assert.match(startseiten, /\/ueber-uns\/social-media\//);
});

test("publishes only canonical about URLs in the DE sitemap", async () => {
  const sitemap = await read("../app/sitemap.ts");

  assert.match(sitemap, /ABOUT_PATHS/);
  assert.match(sitemap, /\/ueber-uns\/social-media/);
  assert.match(sitemap, /\/ueber-uns\/bewertungen/);
  assert.match(sitemap, /\/ueber-uns\/kooperationen/);
  assert.match(sitemap, /MOVED_ROOT_SLUGS/);
});

// Autorenseite liegt seit 17.11.2026 unter „Über uns“ (Christian), die alte Magazin-URL leitet dauerhaft dorthin.
test("Autorenseite liegt unter /ueber-uns/christian-m-haas/ und die Magazin-URL leitet dorthin", async () => {
  const [page, author, config, sitemap, overview] = await Promise.all([
    read("../app/ueber-uns/christian-m-haas/page.tsx"),
    read("../components/magazine/author-page.tsx"),
    read("../next.config.ts"),
    read("../app/sitemap.ts"),
    read("../components/magazine/magazine-overview.tsx"),
  ]);
  assert.match(page, /AuthorPage/);
  assert.match(author, /AUTHOR_PATH = "\/ueber-uns\/christian-m-haas\/"/);
  assert.doesNotMatch(author, /AUTHOR_PATH = "\/magazin\/christian-m-haas\/"/);
  assert.match(config, /source: `\$\{prefix\}\/magazin\/christian-m-haas\/`/);
  assert.match(config, /destination: `\$\{prefix\}\/ueber-uns\/christian-m-haas\/`/);
  assert.match(sitemap, /ueber-uns\/christian-m-haas/);
  assert.doesNotMatch(sitemap, /magazin\/christian-m-haas/);
  assert.match(overview, /path="\/ueber-uns\/christian-m-haas\/"/);
});
