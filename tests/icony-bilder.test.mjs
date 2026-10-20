import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { access, readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";

// Regel Christian (2026-10-20): Bilder liegen im Repo, nie zur Laufzeit aus dem ICONY-CMS (static-cms, static2,
// cdn3, dynamic-cdn … .icony-hosting.de) – weder als <img>, CSS, og:image/JSON-LD noch über Proxy oder remotePatterns.
// Reine Herkunftsvermerke (Felder "sourceUrl", data/icony-bilder.json, Importskripte) dürfen die Adresse nennen.
const ICONY_HOST = /icony-hosting\.(?:de|com)/i;
const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

async function filesBelow(dir, extensions) {
  const entries = await readdir(new URL(dir, root), { withFileTypes: true, recursive: true });
  return entries
    .filter((entry) => entry.isFile() && extensions.some((ext) => entry.name.endsWith(ext)))
    .map((entry) => `${entry.parentPath ?? entry.path}/${entry.name}`.replace(/\\/g, "/"));
}

test("Quelltext und next.config nennen keinen ICONY-Bildhost", async () => {
  const files = [
    ...(await filesBelow("app", [".ts", ".tsx", ".css", ".mjs"])),
    ...(await filesBelow("components", [".ts", ".tsx", ".css", ".mjs"])),
    ...(await filesBelow("lib", [".ts", ".tsx", ".mjs"])),
    ...(await filesBelow("content", [".md", ".mdx", ".json"])),
  ];
  for (const file of files) {
    assert.doesNotMatch(await readFile(file, "utf8"), ICONY_HOST, file);
  }
  for (const file of ["next.config.ts", "proxy.ts", "vercel.json"]) {
    const source = await read(file).catch(() => "");
    assert.doesNotMatch(source, ICONY_HOST, file);
  }
});

test("Daten führen ICONY-Bilder nur als Herkunft (sourceUrl) oder in nicht gerenderten ICONY-Infoseiten", async () => {
  const { isPlatformOwnedSlug } = await import("../lib/icony-import.ts");
  const hits = [];
  const walk = (value, path) => {
    if (typeof value === "string") {
      if (ICONY_HOST.test(value)) hits.push(path);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => walk(item, `${path}[${index}]`));
    } else if (value && typeof value === "object") {
      // ICONY-eigene Infoseiten (dating-tipps, …html) filtert lib/icony-import.ts heraus, sie werden nie gerendert.
      const platformPage = typeof value.slug === "string" && isPlatformOwnedSlug(value.slug);
      for (const [key, item] of Object.entries(value)) {
        if (key === "sourceUrl" || (platformPage && key === "contentHtml")) continue;
        walk(item, `${path}.${key}`);
      }
    }
  };
  const dataFiles = (await readdir(new URL("data/", root))).filter((name) => name.endsWith(".json") && name !== "icony-bilder.json");
  for (const name of dataFiles) {
    walk(JSON.parse(await read(`data/${name}`)), name);
  }
  assert.deepEqual(hits, []);
});

test("jede lokale Kopie aus data/icony-bilder.json liegt in public/ und wird referenziert", async () => {
  const manifest = JSON.parse(await read("data/icony-bilder.json"));
  assert.ok(manifest.images.length >= 60);
  const data = (await Promise.all(["icony-import.json", "icony-import-at.json", "icony-import-ch.json", "startseiten.json"].map((name) => read(`data/${name}`)))).join("\n");
  for (const image of manifest.images) {
    assert.match(image.path, /^\/(?:city-images|site-images)\/[a-z0-9/-]+\.(?:jpg|png)$/, image.path);
    assert.match(image.sourceUrl, /^https:\/\/static-cms\.icony-hosting\.de\/cms\/[0-9A-F]{64}\//);
    await access(new URL(`public${image.path}`, root));
    assert.ok(data.includes(image.path), `${image.path} wird nicht verwendet`);
  }
  for (const path of new Set(data.match(/\/(?:city-images|site-images)\/[^"'\\\s)]+/g))) {
    await access(new URL(`public${path}`, root));
  }
});

test("gerenderte Seitendaten laden Bilder nur vom Asset-Host und mit Alt-Text", async () => {
  const { getCityPages, getCityHub } = await import("../lib/city-pages.ts");
  const { getHomeContent } = await import("../lib/startseite.ts");
  const { importedRootPages, importedPartnersucheHub } = await import("../lib/icony-import.ts");
  const { getMarketRootPage, getMarketPartnersucheHub } = await import("../lib/market-icony-import.ts");
  const { getFaqData } = await import("../lib/faq.ts");
  const { getReviewsData, getSocialData } = await import("../lib/about.ts");
  const assetBase = "https://alleinerziehende-singles.vercel.app/app-assets/";

  const rendered = [importedRootPages, importedPartnersucheHub, getReviewsData(), getSocialData()];
  for (const market of ["de", "at", "ch"]) {
    rendered.push(getCityPages(market), getCityHub(market), getHomeContent(market), getFaqData(market));
    if (market !== "de") rendered.push(getMarketRootPage(market, "faq"), getMarketPartnersucheHub(market));
  }
  const json = JSON.stringify(rendered);
  assert.doesNotMatch(json, ICONY_HOST);

  const strings = [];
  const collect = (value) => {
    if (typeof value === "string") strings.push(value);
    else if (value && typeof value === "object") Object.values(value).forEach(collect);
  };
  collect(rendered);
  const images = strings.flatMap((value) => value.match(/<img\b[^>]*>/gi) ?? []);
  assert.ok(images.length > 0);
  for (const tag of images) {
    const src = tag.match(/\bsrc=["']([^"']+)/i)?.[1] ?? "";
    if (/\/(?:city-images|site-images)\//.test(src)) assert.ok(src.startsWith(assetBase), src);
  }

  for (const market of ["de", "at", "ch"]) {
    for (const city of getCityPages(market)) {
      assert.ok(city.imageUrl?.startsWith(`${assetBase}city-images/${market}/`), `${market}/${city.slug}: ${city.imageUrl}`);
    }
  }
  for (const section of getHomeContent("de").sections.filter((entry) => entry.imageUrl)) {
    assert.ok(section.imageUrl.startsWith(`${assetBase}site-images/startseite/`), section.imageUrl);
    assert.ok(section.imageAlt.trim(), section.imageUrl);
  }
});

test("Importskripte setzen die lokalen Kopien statt der ICONY-Adressen ein", async () => {
  for (const script of ["scripts/import_icony.py", "scripts/import_startseiten.py"]) {
    assert.match(await read(script), /from icony_bilder import/, script);
  }
  assert.match(await read("scripts/import_icony.py"), /localize_images\(data, args\.market\)/);

  const python = ["python", "python3"].find((cmd) => spawnSync(cmd, ["--version"]).status === 0);
  if (!python) return;
  const code = [
    "import sys; sys.path.insert(0, sys.argv[1]); import icony_bilder as b",
    "p = b.load_paths()",
    "u = 'https://static-cms.icony-hosting.de/cms/0C4184EC89A14038DCD77AED54A0CCF638EAA15CB1811CEF8A5E2104675680AA/1000/Wien2.jpg'",
    "print(b.localize('<img src=\"' + u + '\" alt=\"Wien\">', p, 'test'))",
    "b.localize(u.replace('0C41', 'FFFF'), p, 'test')",
  ].join("\n");
  const result = spawnSync(python, ["-c", code, fileURLToPath(new URL("scripts/", root))], { encoding: "utf8", env: { ...process.env, PYTHONIOENCODING: "utf-8", PYTHONDONTWRITEBYTECODE: "1" } });
  assert.equal(result.stdout.trim(), '<img src="/city-images/at/wien.jpg" alt="Wien">');
  assert.notEqual(result.status, 0, "unbekanntes ICONY-Bild muss den Import abbrechen");
  assert.match(result.stderr, /ohne lokale Kopie/);
});
