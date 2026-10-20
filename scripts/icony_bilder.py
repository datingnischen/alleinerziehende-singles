"""Bilder aus dem ICONY-CMS laufen nie zur Laufzeit von ICONY (Regel Christian, 2026-10-20).

Jedes Bild, das eine eigene Seite zeigt, liegt als Kopie unter public/ (city-images, site-images). Die Herkunft steht
in data/icony-bilder.json. Die Importskripte ersetzen ICONY-Bild-URLs über den Hash im Pfad durch den lokalen
Root-Pfad; ausgeliefert wird er von lib/static-asset.ts über den Asset-Host.

Neues Bild im ICONY-CMS: herunterladen, unter public/ ablegen, in data/icony-bilder.json eintragen, Import erneut.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

MANIFEST = Path(__file__).resolve().parent.parent / "data" / "icony-bilder.json"
ICONY_IMAGE_URL = re.compile(r"https?://static-cms\.icony-hosting\.de/cms/([0-9A-F]{64})/[^\"'\s<>\\]*")


def load_paths() -> dict[str, str]:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    paths: dict[str, str] = {}
    for image in manifest["images"]:
        match = ICONY_IMAGE_URL.match(image["sourceUrl"])
        if not match:
            raise SystemExit(f"{MANIFEST.name}: keine ICONY-Bild-URL: {image['sourceUrl']}")
        paths[match.group(1)] = image["path"]
    return paths


def localize(text: str, paths: dict[str, str], where: str) -> str:
    """Ersetzt ICONY-Bild-URLs durch die lokale Kopie; unbekannte Bilder brechen den Import ab."""

    def replace(match: re.Match[str]) -> str:
        path = paths.get(match.group(1))
        if not path:
            raise SystemExit(
                f"{where}: ICONY-Bild ohne lokale Kopie: {match.group(0)}\n"
                f"Bild nach public/ holen und in data/{MANIFEST.name} eintragen."
            )
        return path

    return ICONY_IMAGE_URL.sub(replace, text)
