# alleinerziehende-singles – Next.js-Frontend (DE/AT/CH)

Next.js-Frontend für alleinerziehende-singles.de, .at und .ch. Es übernimmt die öffentlichen
SEO-Seiten (Städteseiten, FAQ, Über uns, Magazin). Alles rund um Mitgliedschaft und Plattform
bleibt auf ICONY.

- GitHub: `datingnischen/alleinerziehende-singles`, Deploy auf Vercel aus `main`
- Vorschau: https://alleinerziehende-singles.vercel.app (AT/CH unter `/at/…` und `/ch/…`)

## Routen

**DE** (`alleinerziehende-singles.de`, Vorschau ohne Präfix oder mit `/de`)

| Pfad | Quelle |
| --- | --- |
| `/` | Startseite (`app/page.tsx`) |
| `/partnersuche/`, `/partnersuche/<stadt>/` | `data/icony-import.json` (Hub + 15 Städte) |
| `/faq/` | `data/icony-import.json`, mit FAQPage-JSON-LD |
| `/ueber-uns/`, `/ueber-uns/social-media/`, `/ueber-uns/bewertungen/`, `/ueber-uns/kooperationen/` | Über-uns-Bereich; `/social-media/` und `/bewertungen-und-erfahrungen/` leiten per 301 dorthin |
| `/magazin/`, `/magazin/<slug>/` | WordPress-REST unter `alleinerziehende-singles.de/magazin/wp-json` (Revalidate 300 s), Kindergeld-2026-Übersicht aus `data/kindergeld-facebook-2026.json` |
| `/ueber-uns/suche/?q=` | Seitensuche (Magazin per gecachter WP-Liste, Städte, Partnersuche-Hub, FAQ, Über uns), `noindex, follow`, nicht in der Sitemap. `/suche` gehört ICONY |

**AT/CH** (`alleinerziehende-singles.at` / `.ch`, Host-Routing in `proxy.ts` + `lib/markets.ts`)

| Pfad | Quelle |
| --- | --- |
| `/` | Marktstartseite (`app/market-home/[market]`) |
| `/partnersuche/`, `/partnersuche/<stadt>/` | `data/icony-import-at.json` / `-ch.json` (Hub + je 15 Städte mit ICONY-Widget) |
| `/robots.txt`, `/sitemap.xml` | je Markt eigene Route |
| alles andere | Platzhalter bzw. Übergabe an die ICONY-Plattform |

## Was auf ICONY bleibt

Login, Registrierung, Suche, Hilfe, Kontakt/Kündigung, Premium, Sicherheit & Datenschutz,
Redaktionelle Kontrolle, Basis-Mitgliedschaft, Erfolgsgeschichten, Video-Dating, Datenschutz,
Impressum, AGB, Barrierefreiheit (in AT/CH zusätzlich die FAQ). Diese Seiten werden **immer
absolut auf die Live-Domain** verlinkt, nie auf die Vercel-Vorschau (`lib/icony-import.ts`,
`lib/markets.ts`, `lib/registration-links.ts`).

Registrierungslinks tragen als AID nur `location` (Städteseiten) oder `magazin` (Magazin),
sonst keinen Parameter.

## Daten und Importe

| Datei | Inhalt | Aktualisieren |
| --- | --- | --- |
| `data/icony-import.json` | DE: Städte-Hub, Städte, Root-Seiten (FAQ, Bewertungen, Social Media, ICONY-Infoseiten) | `npm run import:icony -- --market de` |
| `data/icony-import-at.json` | AT: Städte-Hub, Städte, ICONY-Widget-Daten | `npm run import:icony -- --market at` |
| `data/icony-import-ch.json` | CH: wie AT | `npm run import:icony -- --market ch` |
| `data/asset-catalog.json` | Herkunft und sha256 von Logos/Hero-Bild in `public/brand/` | `npm run import:icony -- --assets` (prüfen), `--assets --update` (neu laden) |
| `data/kindergeld-facebook-2026.json` | Kindergeld-Termine 2026 von der Facebook-Seite | `python scripts/update_kindergeld_facebook_2026.py` |
| `data/startseiten.json` | Startseitentexte DE/AT/CH (ICONY-CMS, Abschnitt unter den Plattform-Kacheln) | `npm run import:startseiten` bzw. `python scripts/import_startseiten.py [--check]` |
| `data/country-maps.json` | Landesumrisse DE/AT/CH für die Karten (Natural Earth, gemeinfrei) | `python scripts/build_country_maps.py` |

Der ICONY-Import (`scripts/import_icony.py`, nur Python-Standardbibliothek) liest die Live-Seiten
und übernimmt Titel, Meta-Description, H1 und Text 1:1. Vor dem Schreiben lohnt ein Vergleich:

```bash
npm run import:icony -- --market de --check   # zeigt Textänderungen auf ICONY, schreibt nichts
npm run import:icony -- --market de           # schreibt data/icony-import.json
```

Gezielte Textkorrekturen (z. B. die von einer Schwesterplattform übernommenen Sätze auf der
Bewertungsseite) stehen als `(alt, neu)`-Paare in `REPLACEMENTS`; fehlt ein alter Text, warnt das Skript.

Stadtliste, Reihenfolge und Stadtnamen stehen im Skript. Neue Städte auf dem Live-Hub meldet es als
Warnung. Bewusste Korrekturen gegenüber der Live-Seite stehen in `OVERRIDES` im Skript, sonst
gehen sie beim nächsten Import verloren.

## Entwicklung

```bash
npm install
npm run dev      # http://localhost:3000, AT/CH unter /at und /ch
npm test         # node --test tests/*.test.mjs
npm run lint
npm run build
```

Hintergrund zum Projektstart: `docs/archive/MIGRATION_KICKOFF-2026-07-30.md`,
Quelleninventur: `SOURCE_INVENTORY.md`.

## Gestaltung

Familien-Look aus den Logofarben (Grün `#58ad47`, Sonnengelb `#f8ae14`), Überschriften Bricolage Grotesque,
Fließtext Open Sans. Gemeinsame Bausteine (`ae-*`) in `app/globals.css`, je Seitentyp eigenes CSS:

| Seitentyp | Komponente |
| --- | --- |
| Kopf-/Fußzeile, Sticky-CTA | `components/site-shell.tsx`, `site-header.tsx`, `sticky-cta.tsx` |
| Stadtseite DE/AT/CH („Familien-Kompass“) | `components/city/city-page.tsx`, Daten `lib/city-pages.ts`, Kapitel `lib/city-guide.ts` |
| Städteübersicht mit Karte | `components/city/city-hub.tsx`, `lib/city-hub.ts` |
| Startseite DE/AT/CH | `components/home/home-page.tsx`, `lib/startseite.ts` |
| FAQ, Über uns, Bewertungen, Social Media, Kooperationen, Suche | `components/info/*`, `lib/faq.ts`, `lib/about.ts` |
| Magazin-Start, Themenwelten, Artikel | `app/magazin/*`, `components/magazine/*`, `lib/magazine.ts` |
| 404 / AT-CH-Platzhalter | `components/not-found-view.tsx` |
