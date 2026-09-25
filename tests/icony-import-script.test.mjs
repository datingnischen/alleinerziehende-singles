import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";

const scriptPath = fileURLToPath(new URL("../scripts/import_icony.py", import.meta.url));
const python = ["python", "python3"].find((cmd) => spawnSync(cmd, ["--version"]).status === 0);

function runPython(code) {
  const result = spawnSync(python, ["-c", code, scriptPath], { encoding: "utf8", env: { ...process.env, PYTHONIOENCODING: "utf-8", PYTHONDONTWRITEBYTECODE: "1" } });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

const loadModule = `
import importlib.util, json, sys
spec = importlib.util.spec_from_file_location("import_icony", sys.argv[1])
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
`;

test("import script covers all three market files and the package script", async () => {
  const source = await readFile(scriptPath, "utf8");
  const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  for (const file of ["icony-import.json", "icony-import-at.json", "icony-import-ch.json", "asset-catalog.json"]) {
    assert.match(source, new RegExp(file.replace(/\./g, "\\.")));
  }
  assert.match(pkg.scripts["import:icony"], /scripts\/import_icony\.py/);
});

test("DE cleanup keeps source HTML but drops editor leftovers and own-domain hosts", { skip: !python }, () => {
  const out = runPython(`${loadModule}
html = '<h1><img src="x.jpg" alt="a"></h1>\\n<h1>&nbsp;</h1>\\n<h1>Titel</h1>\\n<p>&nbsp;</p>\\n<p>&nbsp;</p>\\n<p>Text <a href="https://alleinerziehende-singles.de/partnersuche/berlin/">Berlin</a></p>'
print(json.dumps({"clean": m.clean_de(html, "https://alleinerziehende-singles.de"), "hero": m.content_heading_de(html)}))
`);
  assert.equal(out.hero, "Titel");
  assert.equal(
    out.clean,
    '<figure class="cms-inline-figure"><img src="x.jpg" alt="a"></figure>\n\n<h1>Titel</h1>\n\n<p>Text <a href="/partnersuche/berlin/">Berlin</a></p>',
  );
});

test("AT/CH serialisation sorts attributes and differs only in entity style", { skip: !python }, () => {
  const out = runPython(`${loadModule}
html = '<p><img src="x.jpg" alt="Zürich" data-media-id="7" class="img-responsive">Text</p>\\n  <p>&nbsp;</p>\\n<p><a target="_blank" href="https://alleinerziehende-singles.ch/partnersuche/">Alle St&auml;dte</a></p>\\n<hr>\\n<p><small>https://pixabay.com/de/photos/x-1/</small></p>'
site = "https://alleinerziehende-singles.ch"
root = m.parse(m.relative_own_links(html, site))
image = m.first_image(root)
attribution = m.take_attribution(root, remove=True)
print(json.dumps({"at": m.clean_market(html, site, False), "ch": m.serialize(root, True).strip(), "image": image, "attribution": attribution}))
`);
  assert.equal(
    out.at,
    '<p><img alt="Zürich" class="img-responsive" data-media-id="7" src="x.jpg"/>Text</p>\n<p> </p>\n<p><a href="/partnersuche/" target="_blank">Alle Städte</a></p>\n<hr/>\n<p><small>https://pixabay.com/de/photos/x-1/</small></p>',
  );
  assert.equal(
    out.ch,
    '<p><img alt="Z&uuml;rich" class="img-responsive" data-media-id="7" src="x.jpg"/>Text</p>\n<p>&nbsp;</p>\n<p><a href="/partnersuche/" target="_blank">Alle St&auml;dte</a></p>\n<hr/>',
  );
  assert.deepEqual(out.image, { url: "x.jpg", alt: "Zürich", mediaId: "7" });
  assert.equal(out.attribution, "https://pixabay.com/de/photos/x-1/");
});
