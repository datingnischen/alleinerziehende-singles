# Codex-Auftrag: alleinerziehende-singles.de – eigene Titelbilder für sechs Magazinbeiträge

Stand 14.11.2026. Trello-Karte der Gesamtaufgabe: https://trello.com/c/9bu7d79l (#1273 „Optimierung Alleinerziehende Singles“).
Repo: `datingnischen/alleinerziehende-singles`, lokal `reference-alleinerziehende`, Branch `main` (vorher `git pull`).

## Ausgangslage

Fünf Titelbilder aus dem Zeitraum Mai bis Juli 2026 sahen deutlich nach KI aus (wächserne Haut, teils quadratisch oder
hochkant). Sie wurden am 14.11.2026 als Sofortmaßnahme durch **vorhandene** Stockfotos aus anderen Beiträgen ersetzt und
die KI-Dateien gelöscht. Dadurch teilen sich jetzt mehrere Beiträge dasselbe Titelbild:

- `Partnersuche-mit-Kind-1024x682-jpg.webp` → `partnersuche-mit-kind`, `dating-nach-scheidung`, `zurueckschreiben-dating-kind`
- `Finanzielle-Hilfe-nach-der-Trennung-2-1024x683-jpg.webp` → `finanzielle-hilfe`, `getrennt-zusammenwohnen-eltern`
- `Finanzielle-Hilfe-nach-der-Trennung-1-1024x683-jpg.webp` → `stalking-dating-alleinerziehende`
- `date-ideen-fuer-wenig-geld-fahradtour-zu-zweit-1024x683-jpg.webp` → `date-ideen-fuer-wenig-geld`, `one-night-stand-beziehung`

Das ist in Teasern und Magazinübersicht nebeneinander sichtbar. Diese sechs Beiträge brauchen ein eigenes Bild. Die
jeweils erstgenannten Beiträge behalten ihr Bild, sie sind der ursprüngliche Ort.

Wichtig: Die Startseite von alleinerziehende-singles.de wird von ICONY ausgeliefert und holt ihre drei Magazin-Teaser
über `https://alleinerziehende-singles.de/magazin/wp-json/wp/v2/posts?per_page=3&_embed`. Seit dem 14.11.2026 liefert
dieser Knoten ohne Auswahlparameter nur noch redaktionelle Artikel – genau die hier genannten stehen also in den
Teasern.

## Regeln für alle Bilder

- **WebP, 1024 × 683 px (3:2), unter 200 KB**, kein Text im Bild, keine Logos oder Markenzeichen.
- **Natürlich wirkende Fotografie** im Stil der bestehenden Stockfotos des Magazins (Vergleich:
  `public/magazin/wp-content/uploads/2025/12/vatersein-2-1024x683-jpg.webp` und `.../getrennt-erziehend-1-1024x683-jpg.webp`).
  Keine wächserne Haut, keine überglatten Gesichter, kein überzogenes Abendlicht, kein quadratischer oder hochkanter
  Zuschnitt. Menschen dürfen und sollen zu sehen sein – es ist ein Magazin für Mütter und Väter.
- Ruhige Motive: keine Gewaltdarstellung, keine Angstszenen, keine weinenden Kinder, nichts Anzügliches.
- Jedes Motiv nur einmal verwenden; kein Bild, das schon an anderer Stelle im Magazin steht.
- Zielpfad jeweils `public/magazin/wp-content/uploads/2026/11/<slug>.webp`.
- Im Frontmatter `image` und `imageAlt` setzen. Der Alt-Text beschreibt **das tatsächlich gezeigte Bild**, er wiederholt
  nicht den Artikeltitel – genau das war der alte Fehler.

## Die sechs Beiträge

### 1. `content/magazin/stalking-dating-alleinerziehende.md`
„Stalking nach dem Date: Warum Alleinerziehende ihre Privatsphäre besonders schützen sollten“. Der Beitrag enthält seit
dem 14.11.2026 auch das frühere AirTag-Thema (der Artikel `airtags-stalking-dating` wurde zusammengelegt, 301 steht in
`data/weiterleitungen.json`).
**Motiv:** Eine Frau am Küchentisch, die bei Tageslicht die Privatsphäre-Einstellungen auf ihrem Smartphone prüft.
Selbstbestimmt statt bedroht wirkend, aufgeräumt, keine Thriller-Stimmung.
Alt-Text: „Frau prüft am Küchentisch bei Tageslicht die Einstellungen auf ihrem Smartphone“.

### 2. `content/magazin/one-night-stand-beziehung.md`
„Vom One-Night-Stand zur Familie: Wenn aus lockerem Dating plötzlich Ernst wird“.
**Motiv:** Zwei Erwachsene in einer Küche oder einem Wohnzimmer im Gespräch, etwas Abstand zwischen ihnen, offener
Ausgang. Keine Intimszene.
Alt-Text: „Zwei Erwachsene stehen in einer Küche und unterhalten sich mit etwas Abstand zueinander“.

### 3. `content/magazin/zurueckschreiben-dating-kind.md`
„Nicht sofort zurückschreiben: Was Funkstille beim Dating mit Kind wirklich bedeuten kann“.
**Motiv:** Eine Mutter mit dem Handy in der Hand, daneben ein spielendes Kind, heller Wohnraum. Nachdenklich, nicht
traurig.
Alt-Text: „Mutter hält ihr Handy in der Hand, daneben spielt ihr Kind in einem hellen Wohnzimmer“.

### 4. `content/magazin/dating-nach-scheidung.md`
„Dating nach der Scheidung: Wie Alleinerziehende ihren Neuanfang gestalten“.
**Motiv:** Eine Frau oder ein Mann allein unterwegs im Freien, offener Blick nach vorn; Neuanfang nach der Trennung.
Alt-Text: „Frau geht an einem hellen Tag allein über einen Weg im Freien und blickt nach vorn“.

### 5. `content/magazin/getrennt-zusammenwohnen-eltern.md`
„Getrennt, aber noch zusammenwohnend: Wie Eltern nach der Trennung Grenzen setzen“. Dieser Beitrag hatte bis zum
14.11.2026 ein passendes eigenes Motiv (Vater am Küchentisch mit Notizbuch, Spielecke im Hintergrund), das beim
Bildtausch mit verloren ging.
**Motiv:** Ein Elternteil am Küchentisch mit Notizbuch oder Unterlagen, im Hintergrund die Spielecke des Kindes; wirkt
wie geteilter Wohnraum, in dem gerade etwas geklärt wird.
Alt-Text: „Vater macht sich am Küchentisch Notizen, im Hintergrund die Spielecke des Kindes“.

### 6. `content/magazin/wir-sind-alleinerziehend-de.md`
„Das Portal wir-sind-alleinerziehend.de“ – hat bisher **gar kein** Titelbild und zeigt in Magazinübersicht und Teasern
nur das Platzhalter-Icon.
**Motiv:** Alleinerziehende Mutter oder alleinerziehender Vater mit Kind am Laptop oder Tablet, häusliche Szene,
freundlich. Kein Screenshot, keine fremden Logos.
Alt-Text: „Alleinerziehende Mutter sitzt mit ihrem Kind vor einem Laptop am Küchentisch“.

## Nach dem Einbinden

1. `node scripts/build-magazine-image-sizes.mjs` – schreibt Breite, Höhe und Dateigröße nach `data/magazin-bilder.json`.
   Ohne diesen Schritt liefert der WP-REST-Knoten für ICONY falsche `media_details`.
2. `npm test && npm run lint && npm run build`.
3. Commit und Push auf `main` mit der Git-E-Mail `christian@datingnischen.de`.
4. Ergebnis als Kommentar in die Trello-Karte #1273, mit den Prüf-URLs der sechs Artikel und einem Hinweis, ob
   `https://alleinerziehende-singles.de/magazin/wp-json/wp/v2/posts?per_page=3&_embed` jetzt für jeden Teaser ein
   eigenes Bild im 3:2-Format liefert.
