"""Importiert die Startseitentexte (ICONY-CMS) von alleinerziehende-singles.de/.at/.ch nach data/startseiten.json.

Übernommen werden Titel, Meta-Description, H1 und der Textblock unter den Plattform-Kacheln (section#cms-content),
Wort für Wort. Bewusste Korrekturen stehen in FIXES und werden bei jedem Import wieder angewendet.

    python scripts/import_startseiten.py            # schreibt data/startseiten.json
    python scripts/import_startseiten.py --check    # zeigt nur, ob sich die Live-Texte geändert haben
"""

import html
import json
import pathlib
import re
import sys
import urllib.request

MARKETS = ["de", "at", "ch"]
OUT = pathlib.Path(__file__).resolve().parent.parent / "data" / "startseiten.json"

# (Markt, alt, neu, Grund) – gezielte Korrekturen am ICONY-Text
FIXES = [
    ("de", 'href="https://ab50.de/faq/"', 'href="/faq/"', "FAQ-Link zeigte auf die Schwesterplattform ab50.de"),
    ("de", "Kennenlernenwom&ouml;glich", "Kennenlernen wom&ouml;glich", "fehlendes Leerzeichen"),
    ("de", 'href="https://alleinerziehende-singles.de/bewertungen-und-erfahrungen/"', 'href="/ueber-uns/bewertungen/"', "Bewertungen liegen unter Über uns"),
    ("de", 'href="https://alleinerziehende-singles.de/social-media/"', 'href="/ueber-uns/social-media/"', "Social Media liegt unter Über uns"),
    ("de", 'href="../../partnersuche/"', 'href="/partnersuche/"', "relativer Altlink"),
]


def fetch(url: str) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (datingnischen import)"})
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read().decode("utf-8")


def meta(page: str, name: str) -> str:
    match = re.search(rf'<meta[^>]+name="{name}"[^>]+content="([^"]*)"', page) or re.search(rf'<meta[^>]+content="([^"]*)"[^>]+name="{name}"', page)
    return html.unescape(match.group(1)).strip() if match else ""


def clean(fragment: str) -> str:
    fragment = re.sub(r"<(script|style|iframe|form)\b[\s\S]*?</\1>", "", fragment, flags=re.I)
    fragment = re.sub(r'\s(?:class|data-[a-z-]+|style)="[^"]*"', "", fragment)
    fragment = re.sub(r"<p>(?:\s|&nbsp;| )*</p>", "", fragment)
    fragment = re.sub(r"</?div\b[^>]*>", "\n", fragment)
    fragment = re.sub(r"\n\s*\n+", "\n", fragment)
    return fragment.strip()


def blocks(fragment: str) -> list[dict]:
    """Zerlegt den Text an h2/h4 in Abschnitte {title, imageUrl, imageAlt, html}."""
    parts = re.split(r"(<h[24]>[\s\S]*?</h[24]>)", fragment)
    result: list[dict] = []
    intro = parts[0]
    pending_image = None
    for index in range(1, len(parts), 2):
        title = html.unescape(re.sub(r"<[^>]+>", "", parts[index])).strip()
        body = parts[index + 1] if index + 1 < len(parts) else ""
        image = pending_image or re.search(r'<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"', parts[index - 1] if index > 1 else intro)
        pending_image = None
        next_image = re.search(r'<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>\s*$', body)
        if next_image:
            pending_image = next_image
            body = body[: next_image.start()]
        body = re.sub(r"<img\b[^>]*>", "", body).strip()
        result.append({
            "title": title,
            "imageUrl": image.group(1) if image else None,
            "imageAlt": html.unescape(image.group(2)) if image else "",
            "html": body,
        })
    intro_html = re.sub(r"<img\b[^>]*>", "", intro).strip()
    if intro_html:
        result.insert(0, {"title": "", "imageUrl": None, "imageAlt": "", "html": intro_html})
    return result


def import_market(market: str) -> dict:
    url = f"https://alleinerziehende-singles.{market}/"
    page = fetch(url)
    title = html.unescape(re.search(r"<title>([\s\S]*?)</title>", page).group(1)).strip()
    h1 = html.unescape(re.sub(r"<[^>]+>", "", re.search(r"<h1\b[^>]*>([\s\S]*?)</h1>", page).group(1))).strip()
    section = re.search(r'<section id="cms-content"[^>]*>([\s\S]*?)</section>', page)
    fragment = clean(section.group(1)) if section else ""
    for fix_market, old, new, _reason in FIXES:
        if fix_market == market:
            fragment = fragment.replace(old, new)
    return {
        "sourceUrl": url,
        "title": title,
        "description": meta(page, "description"),
        "h1": h1,
        "sections": blocks(fragment),
    }


def main() -> None:
    data = {market: import_market(market) for market in MARKETS}
    if "--check" in sys.argv:
        old = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {}
        for market in MARKETS:
            state = "unverändert" if old.get(market) == data[market] else "GEÄNDERT"
            print(f"{market}: {state}")
        return
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    for market in MARKETS:
        print(market, data[market]["h1"], "–", len(data[market]["sections"]), "Abschnitte")


if __name__ == "__main__":
    main()
