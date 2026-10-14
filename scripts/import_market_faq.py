#!/usr/bin/env python3
"""Übernimmt die ICONY-FAQ von alleinerziehende-singles.at/.ch als Root-Seite nach data/icony-import-<markt>.json.

Hintergrund: Seit dem Reverse-Proxy-Livegang (Oktober 2026) reicht nginx /faq/ der Landesdomains an Vercel
durch, die ICONY-Originalseite ist live nicht mehr erreichbar. Die Texte stammen deshalb aus einer gespeicherten
Kopie der Seite (z. B. Wayback Machine, Abruf mit dem Suffix "id_" für den unveränderten Quelltext) und werden
Wort für Wort übernommen. lib/market-icony-import.ts liest sie als rootPages, lib/faq.ts zerlegt sie in Themen.

Aufruf:
  python scripts/import_market_faq.py --market ch --html /pfad/zur/kopie.html --source-note "Wayback 2026-07-11"
  python scripts/import_market_faq.py --market at --html /pfad/zur/kopie.html --check   # nur vergleichen

Nutzt die Hilfsfunktionen aus scripts/import_icony.py (gleiche HTML-Aufbereitung wie Hub und Stadtseiten).
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from import_icony import DATA_DIR, meta, panel_parts, parse, serialize  # noqa: E402

SITES = {"at": "https://alleinerziehende-singles.at", "ch": "https://alleinerziehende-singles.ch"}

# Redaktionelle Korrekturen wie OVERRIDES/REPLACEMENTS in import_icony.py: Tippfehler der ICONY-Metadaten
# („signeles“, „die Helfen“) und ein falsch gesetzter Hilfe-Link. Der FAQ-Wortlaut selbst bleibt unverändert.
OVERRIDES = {
    "at": {
        "title": "Häufig gestellte Fragen (FAQ), die helfen",
        "heroTitle": "Häufig gestellte Fragen (FAQ)",
        "description": "Antworten auf häufige Fragen zur Partnersuche bei alleinerziehende-singles.at. Jetzt alles zu Kosten, Sicherheit & Ablauf erfahren.",
    },
    "ch": {
        "title": "Häufig gestellte Fragen (FAQ), die helfen",
        "heroTitle": "Häufig gestellte Fragen (FAQ)",
        "description": "Antworten auf häufige Fragen zur Partnersuche bei alleinerziehende-singles.ch. Jetzt alles zu Kosten, Sicherheit & Ablauf erfahren.",
    },
}
REPLACEMENTS = {
    "at": [
        # Der Ausklang verlinkt „Hilfe & Support“ auf die Partnersuche statt auf das Hilfe-Center.
        ('<a href="https://alleinerziehende-singles.at/partnersuche/" rel="noopener" target="_blank">Hilfe &amp; Support</a>',
         '<a href="https://alleinerziehende-singles.at/hilfe/" rel="noopener" target="_blank">Hilfe &amp; Support</a>'),
    ],
    "ch": [],
}


def build_faq(market: str, page: str, source_note: str) -> dict:
    site = SITES[market]
    url = f"{site}/faq/"
    title, description = meta(page, url)
    h1, body, _cta = panel_parts(page, url)
    # Wie import_market: AT mit Umlauten als Zeichen, CH mit benannten Entities. Links bleiben absolut auf der
    # Landesdomain (Hilfe, Impressum, Erfolgsgeschichten gehören der ICONY-Plattform).
    content = serialize(parse(body), named_entities=market == "ch").strip()
    if "<details" not in content:
        raise SystemExit(f"{url}: keine FAQ-Blöcke (<details>) im Inhalt gefunden")
    entry = {
        "slug": "faq",
        "path": "/faq/",
        "sourceUrl": url,
        "title": title,
        "description": description,
        "heroTitle": h1,
        "contentHtml": content,
    }
    entry.update(OVERRIDES.get(market, {}))
    for old, new in REPLACEMENTS.get(market, []):
        if old not in entry["contentHtml"]:
            print(f"WARNUNG [{market}]: Korrekturtext nicht gefunden: {old[:70]}", file=sys.stderr)
        entry["contentHtml"] = entry["contentHtml"].replace(old, new)
    if source_note:
        entry["sourceNote"] = source_note
    return entry


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--market", choices=sorted(SITES), required=True)
    parser.add_argument("--html", type=Path, required=True, help="gespeicherter Quelltext der FAQ-Seite")
    parser.add_argument("--source-note", default="", help="Herkunft der Kopie, z. B. 'Wayback Machine, 2026-07-11'")
    parser.add_argument("--check", action="store_true", help="nur mit data/ vergleichen, nichts schreiben")
    args = parser.parse_args()

    page = args.html.read_text(encoding="utf-8", errors="replace")
    faq = build_faq(args.market, page, args.source_note)

    target = DATA_DIR / f"icony-import-{args.market}.json"
    data = json.loads(target.read_text(encoding="utf-8"))
    root_pages = [entry for entry in data.get("rootPages", []) if entry.get("slug") != "faq"]
    root_pages.append(faq)
    new_data = {**data, "rootPages": root_pages}

    questions = faq["contentHtml"].count("<summary")
    print(f"[{args.market}] FAQ: {questions} Fragen, Titel „{faq['title']}“, H1 „{faq['heroTitle']}“")
    if new_data == data:
        print(f"{target.name}: unverändert")
        return
    if args.check:
        print(f"{target.name}: würde geändert (--check, nichts geschrieben)")
        return
    target.write_text(json.dumps(new_data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{target.name}: rootPages/faq geschrieben")


if __name__ == "__main__":
    main()
