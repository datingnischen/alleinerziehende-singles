import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";
import matter from "gray-matter";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const exists = (path) => access(new URL(path, root)).then(() => true, () => false);

const files = (await readdir(new URL("content/magazin/", root))).filter((f) => f.endsWith(".md") && !f.startsWith("_"));
const entries = await Promise.all(
  files.map(async (file) => {
    const { data, content } = matter(await read(`content/magazin/${file}`));
    return { slug: file.replace(/\.md$/, ""), data, content };
  }),
);
const slugs = new Set(entries.map((e) => e.slug));

test("alle WordPress-Slugs sind als Datei da (Inventar vor der Migration)", async () => {
  const inventory = JSON.parse(await read("data/magazin-slugs-wordpress.json"));
  assert.equal(inventory.posts.length, 162);
  assert.equal(inventory.pages.length, 57);
  // ein Slug (kindergeld-auszahlungstermine-mai-2021) war Beitrag und Seite zugleich
  const expected = new Set([...inventory.posts, ...inventory.pages]);
  assert.equal(expected.size, 218);
  assert.deepEqual([...expected].filter((slug) => !slugs.has(slug)), []);
  assert.equal(entries.length, expected.size);
  assert.equal(entries.filter((e) => e.data.kind === "post").length, 162);
});

test("Weiterleitungen alter Slugs zeigen auf vorhandene Beiträge und stehen in der next.config", async () => {
  const redirects = JSON.parse(await read("data/weiterleitungen.json"));
  for (const [alt, neu] of Object.entries(redirects.slugs)) {
    assert.ok(slugs.has(neu), `${alt} -> ${neu} fehlt`);
    assert.ok(!slugs.has(alt), `${alt} ist ein echter Beitrag`);
  }
  const config = await read("next.config.ts");
  assert.match(config, /weiterleitungen\.json/);
  assert.match(config, /\/magazin\/category\/:slug\(kindergeld\|singleboersen\|singleleben\)\//);
  assert.match(config, /\/magazin\/wp-sitemap\.xml/);
  assert.match(config, /outputFileTracingIncludes/);
});

test("kein WordPress-Zugriff mehr im Code und in der Konfiguration", async () => {
  assert.equal(await exists("lib/wordpress.ts"), false);
  const sources = [];
  for (const dir of ["app", "lib", "components"]) {
    const walk = async (path) => {
      for (const entry of await readdir(new URL(path, root), { withFileTypes: true })) {
        const child = `${path}${entry.name}`;
        if (entry.isDirectory()) await walk(`${child}/`);
        else if (/\.(ts|tsx|mjs)$/.test(entry.name)) sources.push(child);
      }
    };
    await walk(`${dir}/`);
  }
  // Ausnahme: der WP-kompatible Ausgabe-Endpunkt für ICONY (liefert nur, ruft kein WordPress auf), siehe tests/wp-rest-compat.test.mjs
  const compat = new Set(["lib/wp-rest-compat.ts", "app/magazin/wp-json/[[...route]]/route.ts"]);
  for (const file of sources.filter((item) => !compat.has(item))) {
    const source = await read(file);
    assert.doesNotMatch(source, /wp-json|wp\/v2|WORDPRESS_|process\.env\.WP_/, `${file} spricht WordPress an`);
  }
  assert.doesNotMatch(await read("next.config.ts"), /wp-json(?!\/\[\[)|WORDPRESS/);
  const readme = await read("README.md");
  assert.doesNotMatch(readme, /WORDPRESS_[A-Z_]+=/);
  assert.match(readme, /content\/magazin/);
  assert.equal(await exists(".env.example"), false);
});

test("SEO: Titel höchstens 60 Zeichen ohne WordPress-Anhängsel, Description 70 bis 160 Zeichen", () => {
  for (const { slug, data } of entries) {
    assert.ok(data.seoTitle && data.seoTitle.length <= 60, `${slug}: seoTitle ${data.seoTitle?.length}`);
    assert.doesNotMatch(data.seoTitle, /\|\s*Magazin\s*$/, `${slug}: Anhängsel`);
    const length = (data.description ?? "").length;
    assert.ok(length >= 70 && length <= 160, `${slug}: description ${length} Zeichen`);
    assert.ok(data.title && data.published && data.updated, `${slug}: Frontmatter unvollständig`);
    assert.ok(["post", "page"].includes(data.kind), `${slug}: kind`);
  }
});

test("Bilder und Audio existieren, Alt-Texte fehlen nie", async () => {
  for (const { slug, data, content } of entries) {
    if (data.image) {
      assert.ok(data.imageAlt && data.imageAlt.trim().length >= 3, `${slug}: imageAlt fehlt`);
      assert.ok(await exists(`public${data.image}`), `${slug}: ${data.image} fehlt`);
    }
    assert.doesNotMatch(content, /!\[\s*\]\(/, `${slug}: Bild ohne Alt-Text`);
    assert.doesNotMatch(content, /alt=""/, `${slug}: alt=""`);
    for (const match of content.matchAll(/!\[[^\]]*\]\((\/magazin\/wp-content\/[^)\s]+)\)/g)) {
      assert.ok(await exists(`public${match[1]}`), `${slug}: ${match[1]} fehlt`);
    }
    for (const match of content.matchAll(/<audio[^>]*src="([^"]+)"/g)) {
      assert.match(match[1], /^\/magazin\/wp-content\/uploads\//, `${slug}: Audio-Pfad`);
      assert.ok(await exists(`public${match[1]}`), `${slug}: ${match[1]} fehlt`);
    }
    assert.doesNotMatch(content, /<img\b(?![^>]*\balt=)/, `${slug}: <img> ohne alt`);
  }
});

test("Links: relativ zu vorhandenen Seiten, keine toten oder alten Domains, Plattformseiten absolut", () => {
  for (const { slug, content } of entries) {
    for (const match of content.matchAll(/\]\((\/magazin\/([^/)#?]+)\/?[^)]*)\)/g)) {
      if (match[2] === "wp-content" || match[2].startsWith("?")) continue;
      assert.ok(slugs.has(match[2]), `${slug}: Link auf unbekannte Seite ${match[1]}`);
    }
    for (const match of content.matchAll(/\]\((\/magazin\/\?thema=([a-z]+))\)/g)) {
      assert.ok(["singleboersen", "singleleben", "kindergeld"].includes(match[2]), `${slug}: ${match[1]}`);
    }
    // eigene Domain nur für Plattformseiten, nie für Magazinseiten (die sind relativ)
    assert.doesNotMatch(content, /https?:\/\/(?:www\.)?alleinerziehende-singles\.de\/magazin\//, `${slug}: absoluter Magazinlink`);
    assert.doesNotMatch(content, /datingxperten\.de|vercel\.app|plesk\.page|elbaby\.de/, `${slug}: tote/alte Domain`);
    assert.doesNotMatch(content, /preview=true|\(\/magazin\/\?p=/, `${slug}: Vorschau-Link`);
    assert.doesNotMatch(content, /<!--|\[…\]|<iframe|§§/, `${slug}: WordPress-Rest`);
    // Registrierungs-AID: nur magazin oder location
    for (const match of content.matchAll(/AID=([A-Za-z0-9_-]+)/g)) {
      assert.ok(["magazin", "location"].includes(match[1]), `${slug}: AID=${match[1]}`);
    }
  }
});

test("die Magazin-Plattformkachel führt absolut auf die Live-Domain und trägt AID=magazin", async () => {
  const { content } = entries.find((e) => e.slug === "alleinerziehende-singles-de");
  assert.match(content, /\]\(https:\/\/alleinerziehende-singles\.de\/\?AID=magazin\)/);
});

test("korrigierte Tippfehler kommen nicht wieder, Amazon-Widgets sind Textlinks mit Partner-ID", () => {
  for (const { slug, data, content } of entries) {
    const text = `${data.title} ${data.imageAlt ?? ""} ${content}`;
    assert.doesNotMatch(text, /Kindergerd|Elterne\b|Schwangerschftswoche/, slug);
  }
  const deals = entries.find((e) => e.slug === "family-deals").content;
  assert.equal([...deals.matchAll(/https:\/\/www\.amazon\.de\/dp\/[A-Z0-9]{10}\?tag=elflirt-21/g)].length, 6);
  const year = entries.find((e) => e.slug === "kindergeld-auszahlungstermine-2025").content;
  assert.match(year, /kindergeld-auszahlungstermine-april-2025\//);
  assert.doesNotMatch(year, /-(april|mai|juni)-2024\//);
});

test("Artikel zeigen das Änderungsdatum, feste Seiten und Texte kein Datum", async () => {
  const detail = await read("app/magazin/[slug]/page.tsx");
  assert.match(detail, /entry\.kind === "post" && formatArticleUpdated\(entry\)/);
  for (const { slug, content } of entries) assert.doesNotMatch(content, /Aktualisiert am/, slug);
});

test("Inhalte werden aus den Dateien gelesen: Einträge, Kategorien, Reihenfolge, Suche, Kindergeld-Übersicht", async () => {
  const lib = await import("../lib/magazine-content.ts");
  const posts = lib.getMagazinePosts(1000);
  assert.equal(posts.length, 162);
  const dates = posts.map((p) => p.date);
  assert.deepEqual([...dates].sort().reverse(), dates);

  const categories = lib.getMagazineCategories();
  assert.deepEqual(categories.map((c) => [c.id, c.slug]), [[1, "singleleben"], [8, "kindergeld"], [26, "singleboersen"]]);
  assert.equal(lib.getMagazinePosts(1000, 8).length, 124);
  assert.equal(lib.getMagazinePostsByCategories([26, 1], 1000).length, 38);

  const page = lib.getMagazineEntryBySlug("kindergeld-auszahlungstermine-2025");
  assert.equal(page.kind, "page");
  assert.match(page.contentHtml, /class="kindergeld-month-grid"/);
  assert.match(page.contentHtml, /<p>Hier findest du alle Kindergeld Auszahlungstermine/);

  const related = lib.getRelatedPosts(lib.getMagazineEntryBySlug("finanzielle-hilfe"), 3);
  assert.equal(related.length, 3);
  assert.ok(related.every((post) => post.slug !== "finanzielle-hilfe"));

  const search = lib.getMagazineSearchIndex();
  assert.equal(search.length, 219); // 218 Dateien + Kindergeld 2026 (Facebook-Daten)
  assert.equal(lib.getMagazineSlugs().length, 219);

  const audio = lib.getMagazineEntryBySlug("finanzielle-hilfe");
  assert.match(audio.contentHtml, /<audio controls preload="none" src="https:\/\/alleinerziehende-singles\.vercel\.app\/app-assets\/magazin\/wp-content\/uploads\/2026\/05\/finanzielle-hilfe-audio-zusammenfassung\.mp3"/);
  assert.match(audio.featuredImageUrl, /^https:\/\/alleinerziehende-singles\.vercel\.app\/app-assets\/magazin\/wp-content\/uploads\//);

  const anchors = lib.getMagazineEntryBySlug("kindergeld");
  assert.match(anchors.contentHtml, /<h2 id="K1">/);
  assert.match(anchors.contentHtml, /href="#K1"/);
});

test("Sitemap führt das Magazin, die Detailseite ist statisch erzeugt", async () => {
  const sitemap = await read("app/sitemap.ts");
  assert.match(sitemap, /getMagazineSlugs/);
  const detail = await read("app/magazin/[slug]/page.tsx");
  assert.match(detail, /export const dynamicParams = false/);
  assert.match(detail, /generateStaticParams/);
});
