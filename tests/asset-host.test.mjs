import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Assets kommen absolut vom Vercel-Host, weil nginx nur Seitenrouten durchreicht", async () => {
  const config = await read("next.config.ts");
  assert.match(config, /DEFAULT_ASSET_HOST = "https:\/\/alleinerziehende-singles\.vercel\.app"/);
  assert.match(config, /assetPrefix: isDev \? undefined : assetPrefix/);
  assert.match(config, /`\$\{assetHost\}\/_next\/image`/);
  assert.match(config, /source: `\$\{assetPathPrefix\}\/:path\*`/);

  const { staticAsset } = await import("../lib/static-asset.ts");
  assert.equal(
    staticAsset("/brand/icon.png"),
    "https://alleinerziehende-singles.vercel.app/app-assets/brand/icon.png",
  );
});

test("WordPress-Dateien im Magazin bleiben absolut, Seitenlinks werden relativ", async () => {
  const { normalizeMagazineHtml } = await import("../lib/wordpress.ts");
  const html = normalizeMagazineHtml(
    "beispiel",
    '<a href="https://alleinerziehende-singles.de/magazin/dating-mit-kind">x</a>'
      + '<audio src="https://alleinerziehende-singles.de/magazin/wp-content/uploads/2026/06/a.mp3"></audio>',
  );
  assert.match(html, /href="\/magazin\/dating-mit-kind"/);
  assert.match(html, /src="https:\/\/alleinerziehende-singles\.de\/magazin\/wp-content\/uploads\/2026\/06\/a\.mp3"/);
});

test("Icons liegen in public/brand und werden absolut verlinkt", async () => {
  await access(new URL("../public/brand/icon.png", import.meta.url));
  await access(new URL("../public/brand/apple-icon.png", import.meta.url));
  for (const file of ["app/icon.png", "app/apple-icon.png"]) {
    await assert.rejects(access(new URL(`../${file}`, import.meta.url)), `${file} überschreibt metadata.icons`);
  }
  const layout = await read("app/layout.tsx");
  assert.match(layout, /icon: staticAsset\("\/brand\/icon\.png"\)/);
  assert.match(layout, /apple: staticAsset\("\/brand\/apple-icon\.png"\)/);
  for (const file of ["components/site-shell.tsx", "app/magazin/[slug]/page.tsx"]) {
    assert.doesNotMatch(await read(file), /src="\/brand\//, `${file} lädt public/ relativ`);
  }
});
