import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  getIconyWidgetConfig,
  iconyWidgetConfigs,
} from "../lib/icony-widget-config.ts";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

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

test("implements the elFlirt-style dynamic singles contract safely", async () => {
  const component = await read("../components/icony-singles-widget.tsx");
  const styles = await read("../components/icony-singles-widget.module.css");

  assert.match(component, /gender === "women" \? 2 : 1/);
  assert.match(component, /icony\("get", "activities", "json"/);
  assert.match(component, /Gerade keine Schnelltreffer/);
  assert.match(component, /Alleinstehende Singles aus \{city\}/);
  assert.match(component, /Ausführlicher in \{city\} suchen/);
  assert.match(component, /https:\/\/alleinerziehende-singles\.de\/suche\/\?AID=location/);
  assert.match(component, /sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"/);
  assert.match(component, /referrerPolicy="no-referrer"/);
  assert.match(component, /Für Profilvorschauen bitte JavaScript aktivieren/);
  assert.match(component, /--brand:#57ad46/);
  assert.doesNotMatch(component, /allow-same-origin/);

  assert.match(styles, /linear-gradient\(135deg, var\(--brand-primary\), var\(--brand-accent\)\)/);
  assert.match(styles, /border: 1px solid var\(--brand-card-border\)/);
});

test("renders the local singles widget on every DE city page", async () => {
  const cityPage = await read("../app/partnersuche/[slug]/page.tsx");
  const hubPage = await read("../app/partnersuche/page.tsx");
  const sharedStyles = await read("../app/imported-page.module.css");

  assert.match(cityPage, /getIconyWidgetConfig\(slug\)/);
  assert.match(cityPage, /<IconySinglesWidget/);
  assert.match(cityPage, /city=\{widgetConfig\.city\}/);
  assert.match(cityPage, /zip=\{widgetConfig\.zip\}/);
  assert.match(cityPage, /country=\{widgetConfig\.country\}/);
  assert.match(cityPage, /platformId=\{widgetConfig\.platformId\}/);

  assert.match(hubPage, /HUB_ONLINE_WIDGET_URL/);
  assert.match(hubPage, /Wer ist gerade online\?/);
  assert.match(hubPage, /className=\{styles\.sidebarWidgetFrame\}/);
  assert.match(hubPage, /title="Wer ist gerade online auf alleinerziehende-singles\.de"/);
  assert.match(hubPage, /stripLegacyCityLists/);
  assert.match(hubPage, /cityCardExcerpt/);
  assert.match(hubPage, /Singles in \{city\.cityLabel\}/);
  assert.match(hubPage, /Singles aus \{city\.cityLabel\} entdecken/);
  assert.match(hubPage, /replace\(/);
  assert.match(hubPage, /<div className=\{styles\.gridSection\}>/);
  assert.match(sharedStyles, /\.cityCardMedia/);
  assert.match(sharedStyles, /\.cityCardEyebrow/);
  assert.match(sharedStyles, /width: calc\(100% - 44px\)/);
});
