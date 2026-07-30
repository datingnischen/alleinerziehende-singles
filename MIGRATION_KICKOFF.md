# Alleinerziehende-Singles.de → Vercel Migration Kickoff

Stand: 2026-07-30

## Ziel

`alleinerziehende-singles.de` nach Vercel migrieren.

Vorgabe von Christian:
- Magazin und ICONY/CMS in eine saubere Vercel-Frontend-Schicht ziehen
- Qualitätsniveau an `elflirt-nextjs.vercel.app` anlehnen
- vorhandene Playbooks wiederverwenden

Repo:
- `git@github.com:datingnischen/alleinerziehende-singles.git`

## Live verifiziert

Startseite:
- `https://alleinerziehende-singles.de/`
- Titel: `Alleinerziehende Singles - Suchen, Finden, Verlieben`

Magazin:
- `https://alleinerziehende-singles.de/magazin/`
- Titel: `Singlebörsen für Alleinerziehende | Magazin`
- WordPress REST ist erreichbar

Verifizierte Magazine-REST-Endpunkte:
- `/magazin/wp-json/wp/v2/posts`
- `/magazin/wp-json/wp/v2/pages`
- `/magazin/wp-json/wp/v2/categories`

Verifizierte WordPress-Bestände:
- Posts: 162
- Pages: 57
- Kategorien: 3

Nicht-WordPress auf Root:
- `https://alleinerziehende-singles.de/wp-json/...` liefert kein nutzbares Root-WP
- Root ist also aktuell kein direkt sichtbares WordPress wie das Magazin

## Verifizierte Root-/Service-Routen

- `/login/`
- `/registration/`
- `/sicherheit-und-datenschutz.html`
- `/redaktionelle-kontrolle.html`
- `/kostenlose-basis-mitgliedschaft.html`
- `/fragenflirt.html`
- `/fotoflirt.html`
- `/videodate.html`
- `/unsere-erfolgsgeschichten.html`
- `/bewertungen-und-erfahrungen/`
- `/social-media/`
- `/premium-mitgliedschaft.html`
- `/hilfe/`
- `/kontakt/kündigen/`
- `/kontakt/widerruf/`
- `/datenschutz.html`
- `/impressum.html`
- `/agb.html`
- `/sitemap/`
- `/barrierefreiheit.html`

## Erste Einschätzung der Architektur

Wahrscheinlich gleiche Grundlogik wie bei elFlirt:
- Magazin unter `/magazin/` = WordPress-Quelle
- Hauptseite + Service-/Marketingseiten = bestehender ICONY-/Alt-Stack
- Vercel-Zielbild = ein gemeinsames Frontend mit klarer Shell und späteren Spezialrouten

## Nächste kleinen Schritte

1. Repo-Basis aufbauen
2. Root-/Service-Routen priorisieren
3. Magazin-Quelle in Vercel-Schicht anbinden
4. prüfen, welche Root-/CMS-Seiten zuerst in den ersten Migrationsschnitt gehören
5. danach erster echter Frontend-Slice mit Build- und Live-Nachweis
