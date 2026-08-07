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
  assert.match(detail, /christian@datingnischen\.de/);
  assert.match(shell, /label: "Über uns", href: "\/ueber-uns", internal: true/);
});

test("permanently redirects the moved legacy pages", async () => {
  const rootPage = await read("../app/[slug]/page.tsx");

  assert.match(rootPage, /slug === "social-media"/);
  assert.match(rootPage, /permanentRedirect\("\/ueber-uns\/social-media"\)/);
  assert.match(rootPage, /slug === "bewertungen-und-erfahrungen"/);
  assert.match(rootPage, /permanentRedirect\("\/ueber-uns\/bewertungen"\)/);
});

test("does not link internally through moved legacy URLs", async () => {
  const [home, partnersuche] = await Promise.all([
    read("../app/page.tsx"),
    read("../app/partnersuche/page.tsx"),
  ]);
  const source = `${home}\n${partnersuche}`;

  assert.doesNotMatch(source, /href="\/social-media"/);
  assert.doesNotMatch(source, /href="\/bewertungen-und-erfahrungen"/);
  assert.match(home, /ABOUT_PAGE_PATHS/);
  assert.match(home, /\/ueber-uns\/social-media/);
  assert.match(home, /\/ueber-uns\/bewertungen/);
});

test("publishes only canonical about URLs in the DE sitemap", async () => {
  const sitemap = await read("../app/sitemap.ts");

  assert.match(sitemap, /ABOUT_PATHS/);
  assert.match(sitemap, /\/ueber-uns\/social-media/);
  assert.match(sitemap, /\/ueber-uns\/bewertungen/);
  assert.match(sitemap, /\/ueber-uns\/kooperationen/);
  assert.match(sitemap, /MOVED_ROOT_SLUGS/);
});
