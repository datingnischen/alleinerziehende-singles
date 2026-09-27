import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function loadWordpressHelpers() {
  return import("../lib/wordpress.ts");
}

test("magazine landing: theme worlds, kindergeld service, pregnancy weeks and clickable themes", async () => {
  const source = await readFile(new URL("../app/magazin/page.tsx", import.meta.url), "utf8");
  const wordpressSource = await readFile(new URL("../lib/wordpress.ts", import.meta.url), "utf8");
  const { MAGAZINE_THEMES, groupMagazinePages, excerptText, withHeadingAnchors } = await import("../lib/magazine.ts");

  assert.match(source, /Magazin für Alleinerziehende/);
  assert.match(source, /Kindergeld-Auszahlungstermine/);
  assert.match(source, /Service &amp; Termine/);
  assert.match(source, /Schwangerschaft Woche für Woche/);
  assert.match(source, /Wichtige Magazin-Seiten/);
  assert.match(source, /href=\{`\/magazin\/\?thema=/);
  assert.match(source, /registrationUrlForContext\("de", "magazin"\)/);
  assert.deepEqual(MAGAZINE_THEMES.map((theme) => theme.categoryId), [26, 1, 8]);
  assert.match(wordpressSource, /const KINDERGELD_2026 =/);
  assert.match(wordpressSource, /getStaticMagazinePages/);
  assert.match(wordpressSource, /kindergeld-facebook-2026\.json/);
  assert.doesNotMatch(source, /Headless-Migration|WordPress|REST-Anbindung|Slice|Taxonomien/);

  const groups = groupMagazinePages([
    { slug: "ssw-schwangerschaftswoche-12", title: "SSW 12" },
    { slug: "ssw-schwangerschaftswoche-1-4", title: "SSW 1–4" },
    { slug: "kindergeld-auszahlungstermine-2024", title: "2024" },
    { slug: "kindergeld-auszahlungstermine-2026", title: "2026" },
    { slug: "kindergeld-auszahlungstermine-mai-2021", title: "Mai 2021" },
    { slug: "duesseldorfer-tabelle", title: "Die Düsseldorfer Tabelle" },
  ]);
  assert.deepEqual(groups.pregnancy.map((entry) => entry.week), ["1–4", "12"]);
  assert.deepEqual(groups.kindergeldYears.map((entry) => entry.year), ["2026", "2024"]);
  assert.deepEqual(groups.guides.map((entry) => entry.slug), ["duesseldorfer-tabelle"]);

  assert.equal(excerptText("<p>Artikel kurz anhören Die wichtigsten Punkte. Dein Browser unterstützt das Audio-Element nicht. Echter Text [&hellip;]</p>"), "Echter Text…");
  const anchored = withHeadingAnchors("<h2>Erste Frage</h2><p>x</p><h2>Zweite</h2>");
  assert.deepEqual(anchored.toc.map((item) => item.id), ["erste-frage", "zweite"]);
  assert.match(anchored.html, /<h2 id="erste-frage">/);
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

test("exposes the 2026 kindergeld overview as a static magazine page", async () => {
  const { getStaticMagazinePageBySlug, getStaticMagazinePages } = await loadWordpressHelpers();

  const page = getStaticMagazinePageBySlug("kindergeld-auszahlungstermine-2026");
  assert.ok(page);
  assert.equal(page.slug, "kindergeld-auszahlungstermine-2026");
  assert.match(page.contentHtml, /Auszahlungstermine 2026 nach Monat/);
  assert.match(page.contentHtml, /Facebook-Beitrag öffnen/);
  assert.match(page.contentHtml, /Januar/);
  assert.match(page.contentHtml, /August/);
  assert.match(page.contentHtml, /Wir wollen mehr Kindergeld/);
  assert.ok(getStaticMagazinePages().some((entry) => entry.slug === "kindergeld-auszahlungstermine-2026"));
});

test("keeps the automatic 2026 kindergeld data in a dedicated JSON source", async () => {
  const dataSource = JSON.parse(
    await readFile(new URL("../data/kindergeld-facebook-2026.json", import.meta.url), "utf8"),
  );
  const scriptSource = await readFile(
    new URL("../scripts/update_kindergeld_facebook_2026.py", import.meta.url),
    "utf8",
  );

  assert.equal(dataSource.slug, "kindergeld-auszahlungstermine-2026");
  assert.equal(dataSource.sourceLabel, "Wir wollen mehr Kindergeld");
  assert.ok(Array.isArray(dataSource.months));
  assert.ok(dataSource.months.length >= 8);
  assert.equal(dataSource.months[0].month, "Januar");
  assert.equal(dataSource.months.at(-1).month, "August");
  assert.match(scriptSource, /PAGE_NAME = "Wir wollen mehr Kindergeld"/);
  assert.match(scriptSource, /graph\.facebook\.com/);
  assert.match(scriptSource, /kindergeld-facebook-2026\.json/);
});

test("articles show the modified date, fixed pages show none", async () => {
  const { formatArticleUpdated } = await loadWordpressHelpers();
  const detailSource = await readFile(new URL("../app/magazin/[slug]/page.tsx", import.meta.url), "utf8");

  assert.equal(formatArticleUpdated({ date: "2025-01-10T10:00:00", modified: "2025-11-12T10:00:00" }), "Aktualisiert am 12. November 2025");
  assert.equal(formatArticleUpdated({ date: "2025-11-12T10:00:00" }), "Aktualisiert am 12. November 2025");
  assert.equal(formatArticleUpdated({}), "");
  assert.match(detailSource, /entry\.kind === "post" && formatArticleUpdated\(entry\)/);
});
