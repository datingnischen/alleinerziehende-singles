import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function loadWordpressHelpers() {
  return import("../lib/wordpress.ts");
}

test("humanizes the public magazine landing copy and keeps categories clickable", async () => {
  const source = await readFile(new URL("../app/magazin/page.tsx", import.meta.url), "utf8");

  assert.match(source, /Magazin für Alleinerziehende/);
  assert.match(source, /Themen, die dich gerade interessieren/);
  assert.match(source, /Kindergeld & Finanzen/);
  assert.match(source, /Dating mit Kind/);
  assert.match(source, /Wichtige Magazin-Seiten/);
  assert.match(source, /Kindergeld-Auszahlungstermine/);
  assert.match(source, /Service & Termine/);
  assert.match(source, /Jahresübersichten schnell griffbereit/);
  assert.match(source, /visiblePosts =/);
  assert.match(source, /generalPages = pages\.filter/);
  assert.match(source, /href=\{`\/magazin\?thema=/);
  assert.doesNotMatch(source, /Artikel zum Stöbern|hilfreiche Sonderseiten|Themenbereiche/);
  assert.doesNotMatch(source, /Headless-Migration|WordPress|REST-Anbindung|Slice|Taxonomien/);
});

test("turns the yearly kindergeld overview into scannable month cards and year chips", async () => {
  const { normalizeMagazineHtml } = await loadWordpressHelpers();
  const input = `
    <p>Intro</p>
    <h2>Praktische Hinweise zur Kindergeldauszahlung</h2>
    <p>Bitte prüfe deine Auszahlung regelmäßig.</p>
    <h3>Januar</h3><p><a href="https://alleinerziehende-singles.de/magazin/kindergeld-auszahlungstermine-januar-2022/">Kindergeld Auszahlung Januar 2022</a></p>
    <h3>Februar</h3><p><a href="https://alleinerziehende-singles.de/magazin/kindergeld-auszahlungstermine-februar-2022/">Kindergeld Auszahlung Februar 2022</a></p>
    <h3>März</h3><p><a href="https://alleinerziehende-singles.de/magazin/kindergeld-auszahlungstermine-maerz-2022/">Kindergeld Auszahlung März 2022</a></p>
    <h3>April</h3><p><a href="https://alleinerziehende-singles.de/magazin/kindergeld-auszahlungstermine-april-2022/">Kindergeld Auszahlung April 2022</a></p>
    <h3>Mai</h3><p><a href="https://alleinerziehende-singles.de/magazin/kindergeld-auszahlungstermine-mai-2022/">Kindergeld Auszahlung Mai 2022</a></p>
    <h3>Juni</h3><p><a href="https://alleinerziehende-singles.de/magazin/kindergeld-auszahlungstermine-juni-2022/">Kindergeld Auszahlung Juni 2022</a></p>
    <h3>Juli</h3><p><a href="https://alleinerziehende-singles.de/magazin/kindergeld-auszahlungstermine-juli-2022/">Kindergeld Auszahlung Juli 2022</a></p>
    <h3>August</h3><p><a href="https://alleinerziehende-singles.de/magazin/kindergeld-auszahlungstermine-august-2022/">Kindergeld Auszahlung August 2022</a></p>
    <h3>September</h3><p><a href="https://alleinerziehende-singles.de/magazin/kindergeld-auszahlungstermine-september-2022/">Kindergeld Auszahlung September 2022</a></p>
    <h3>Oktober</h3><p><a href="https://alleinerziehende-singles.de/magazin/kindergeld-auszahlungstermine-oktober-2022/">Kindergeld Auszahlung Oktober 2022</a></p>
    <h3>November</h3><p><a href="https://alleinerziehende-singles.de/magazin/kindergeld-auszahlungstermine-november-2022/">Kindergeld Auszahlung November 2022</a></p>
    <h3>Dezember</h3><p><a href="https://alleinerziehende-singles.de/magazin/kindergeld-auszahlungstermine-dezember-2022/">Kindergeld Auszahlung Dezember 2022</a></p>
    <h2>Häufige Fragen (FAQ) zur Kindergeldauszahlung</h2>
    <ul><li>Wann?</li><li>Was tun?</li></ul>
    <p><strong>Hier findest du die Auszahlungstermine für</strong><br />
    <ul><li><a href="https://alleinerziehende-singles.de/magazin/kindergeld-auszahlungstermine-2025/">2025</a></li></ul>
  `;

  const output = normalizeMagazineHtml("kindergeld-auszahlungstermine-2022", input);

  assert.match(output, /class="kindergeld-month-grid"/);
  assert.match(output, /class="kindergeld-month-card" href="\/magazin\/kindergeld-auszahlungstermine-januar-2022\//);
  assert.match(output, /Termine ansehen/);
  assert.match(output, /class="kindergeld-note"/);
  assert.match(output, /class="kindergeld-faq-box"/);
  assert.match(output, /class="kindergeld-year-list"/);
  assert.doesNotMatch(output, /https:\/\/alleinerziehende-singles\.de\/magazin\//);
});

test("removes a duplicated lead paragraph when excerpt and article intro say the same thing", async () => {
  const { removeDuplicateLeadParagraph } = await loadWordpressHelpers();
  const excerpt =
    "<p>Hier findest du alle Kindergeld Auszahlungstermine für das Jahr 2022 übersichtlich zusammengestellt. Zusätzlich geben wir Hinweise, wie du die Termine</p>";
  const content =
    "<p>Hier findest du alle Kindergeld Auszahlungstermine für das Jahr 2022 übersichtlich zusammengestellt. Zusätzlich geben wir Hinweise, wie du die Termine prüfen kannst und welche Punkte bei der Auszahlung zu beachten sind.</p><h2>Praktische Hinweise</h2><p>Restinhalt</p>";

  const output = removeDuplicateLeadParagraph(content, excerpt);

  assert.doesNotMatch(output, /Hier findest du alle Kindergeld Auszahlungstermine/);
  assert.match(output, /<h2>Praktische Hinweise<\/h2>/);
});

test("keeps relative magazine links even for non-kindergeld pages", async () => {
  const { normalizeMagazineHtml } = await loadWordpressHelpers();
  const output = normalizeMagazineHtml(
    "alltag-mit-kind",
    '<p><a href="https://alleinerziehende-singles.de/magazin/beispiel-artikel/">Mehr lesen</a></p>',
  );

  assert.equal(output, '<p><a href="/magazin/beispiel-artikel/">Mehr lesen</a></p>');
});
