import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = "C:/Christian/p-work/alleinerziehende-singles";

async function loadRegistrationHelpers() {
  return import("../lib/registration-links.ts");
}

test("uses market-specific footer registration labels and context-aware registration URLs", async () => {
  const { footerRegistrationLabel, registrationUrlForContext } = await loadRegistrationHelpers();

  assert.equal(
    footerRegistrationLabel("de"),
    "Jetzt kostenlos auf alleinerziehende-singles.de registrieren",
  );
  assert.equal(
    footerRegistrationLabel("ch", "magazin"),
    "Jetzt kostenlos bei alleinerziehende-singles.ch registrieren",
  );
  assert.equal(
    footerRegistrationLabel("at", "location"),
    "Jetzt Singles in deiner Region auf alleinerziehende-singles.at kennenlernen",
  );

  assert.equal(
    registrationUrlForContext("de", "default"),
    "https://alleinerziehende-singles.de/registration",
  );
  assert.equal(
    registrationUrlForContext("de", "magazin"),
    "https://alleinerziehende-singles.de/registration/?AID=magazin",
  );
  assert.equal(
    registrationUrlForContext("ch", "location"),
    "https://alleinerziehende-singles.ch/registration/?AID=location",
  );
});

test("homepage and magazine layout avoid technical public copy and wire the magazine footer CTA", async () => {
  const homeSource = await readFile(`${root}/app/page.tsx`, "utf8");
  const magazineLayoutSource = await readFile(`${root}/app/magazin/layout.tsx`, "utf8");
  const helperSource = await readFile(`${root}/lib/registration-links.ts`, "utf8");

  assert.match(homeSource, /Frische Tipps, ehrliche Geschichten und hilfreiche Impulse/);
  assert.doesNotMatch(homeSource, /Live-WordPress/);
  assert.match(magazineLayoutSource, /registrationContext="magazin"/);
  assert.match(helperSource, /Jetzt kostenlos auf \$\{domain\} registrieren/);
  assert.match(helperSource, /Jetzt kostenlos bei \$\{domain\} registrieren/);
});
