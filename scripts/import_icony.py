#!/usr/bin/env python3
"""Importiert die öffentlichen ICONY-Seiten von alleinerziehende-singles.de/.at/.ch nach data/.

Pro Markt entsteht eine JSON-Datei, die lib/icony-import.ts (DE) bzw. lib/market-icony-import.ts
(AT/CH) einlesen:

  de -> data/icony-import.json     Städte-Hub, 15 Stadtseiten, Root-Seiten (FAQ, Über uns, ICONY-Infoseiten)
  at -> data/icony-import-at.json  Städte-Hub und 15 Stadtseiten inkl. ICONY-Widget-Konfiguration
  ch -> data/icony-import-ch.json  wie AT

Die Texte werden 1:1 übernommen. Die drei Dateien stammen historisch aus zwei Importläufen mit
unterschiedlicher HTML-Aufbereitung (DE: Quelltext-nah; AT/CH: neu serialisiert, Attribute sortiert).
Das Skript bildet beide Varianten exakt nach, damit ein Re-Import nur echte Textänderungen zeigt.
Seitenreihenfolge und Stadtnamen sind unten fest hinterlegt; neue Städte auf dem Live-Hub meldet
das Skript als Warnung, statt sie stillschweigend aufzunehmen.

Aufruf:
  python scripts/import_icony.py --market de            # schreibt data/icony-import.json
  python scripts/import_icony.py --market at --out /tmp/at.json
  python scripts/import_icony.py --market ch --check    # nur vergleichen, nichts schreiben
  python scripts/import_icony.py --assets               # data/asset-catalog.json gegen Live prüfen
  npm run import:icony -- --market de

Nur Python-Standardbibliothek.
"""

from __future__ import annotations

import argparse
import difflib
import hashlib
import html
import json
import re
import sys
import time
import urllib.request
from datetime import datetime, timezone
from html.entities import codepoint2name
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
UA = {"User-Agent": "Mozilla/5.0 (alleinerziehende-singles icony import)"}
LF = "\n"

DE_CITIES = [
    ("berlin", "Berlin"),
    ("hamburg", "Hamburg"),
    ("stuttgart", "Stuttgart"),
    ("frankfurt-am-main", "Frankfurt am Main"),
    ("duesseldorf", "Düsseldorf"),
    ("muenchen", "München"),
    ("koeln", "Köln"),
    ("dortmund", "Dortmund"),
    ("nuernberg", "Nürnberg"),
    ("bochum", "Bochum"),
    ("hannover", "Hannover"),
    ("essen", "Essen"),
    ("bremen", "Bremen"),
    ("dresden", "Dresden"),
    ("leipzig", "Leipzig"),
]

# Root-Seiten der DE-Domain. Die ICONY-eigenen Infoseiten (…html, dating-tipps) werden mit importiert,
# lib/icony-import.ts filtert sie aber heraus und verlinkt absolut auf die Live-Domain.
DE_ROOT_PAGES = [
    "/faq/",
    "/bewertungen-und-erfahrungen/",
    "/social-media/",
    "/dating-tipps/",
    "/unsere-erfolgsgeschichten.html",
    "/videodating.html",
    "/kostenlose-basis-mitgliedschaft.html",
    "/sicherheit-und-datenschutz.html",
    "/redaktionelle-kontrolle.html",
    "/premium-mitgliedschaft.html",
]

AT_CITIES = [
    ("wien", "Wien"),
    ("graz", "Graz"),
    ("salzburg", "Salzburg"),
    ("innsbruck", "Innsbruck"),
    ("dornbirn", "Dornbirn"),
    ("klagenfurt", "Klagenfurt"),
    ("linz", "Linz"),
    ("bregenz", "Bregenz"),
    ("villach", "Villach"),
    ("wels", "Wels"),
    ("st-poelten", "St. Pölten"),
    ("amstetten", "Amstetten"),
    ("leoben", "Leoben"),
    ("steyr", "Steyr"),
    ("eisenstadt", "Eisenstadt"),
]

CH_CITIES = [
    ("bern", "Bern"),
    ("basel", "Basel"),
    ("fribourg", "Fribourg"),
    ("thun", "Thun"),
    ("luzern", "Luzern"),
    ("genf", "Genf"),
    ("stgallen", "St. Gallen"),
    ("biel", "Biel"),
    ("chur", "Chur"),
    ("aarau", "Aarau"),
    ("lausanne", "Lausanne"),
    ("winterthur", "Winterthur"),
    ("zug", "Zug"),
    ("zuerich", "Zürich"),
    ("schaffhausen", "Schaffhausen"),
]

MARKETS = {
    "de": {"site": "https://alleinerziehende-singles.de", "out": "icony-import.json", "cities": DE_CITIES},
    "at": {"site": "https://alleinerziehende-singles.at", "out": "icony-import-at.json", "cities": AT_CITIES},
    "ch": {"site": "https://alleinerziehende-singles.ch", "out": "icony-import-ch.json", "cities": CH_CITIES},
}

# Redaktionelle Korrekturen, die bewusst von der Live-Seite abweichen (Pfad -> Felder).
# Nur für Fehler, die auf ICONY (noch) nicht behoben sind – sonst gehen sie beim Re-Import verloren.
OVERRIDES: dict[str, dict[str, dict[str, str]]] = {
    "de": {
        # Live: "zur  Partnersuche bei alleinerziehende-signeles.de" (Commit af0b0b4)
        "/faq/": {
            "description": "Antworten auf häufige Fragen zur Partnersuche bei alleinerziehende-singles.de. "
            "Jetzt alles zu Kosten, Sicherheit & Ablauf erfahren.",
        },
    },
}


# --------------------------------------------------------------------------- Laden


class Fetcher:
    def __init__(self, cache_dir: Path | None) -> None:
        self.cache_dir = cache_dir

    def __call__(self, url: str) -> str:
        cache_file = None
        if self.cache_dir:
            cache_file = self.cache_dir / re.sub(r"[^A-Za-z0-9.-]+", "_", url.split("://", 1)[1])
            if cache_file.exists():
                return cache_file.read_text(encoding="utf-8")
        for attempt in range(3):
            try:
                request = urllib.request.Request(url, headers=UA)
                with urllib.request.urlopen(request, timeout=30) as response:
                    if response.geturl().rstrip("/") != url.rstrip("/"):
                        raise SystemExit(f"{url}: Weiterleitung auf {response.geturl()} – Seite prüfen")
                    body = response.read().decode("utf-8")
                break
            except (OSError, TimeoutError) as error:
                if attempt == 2:
                    raise SystemExit(f"{url}: {error}") from error
                time.sleep(2)
        if cache_file:
            cache_file.parent.mkdir(parents=True, exist_ok=True)
            cache_file.write_text(body, encoding="utf-8")
        return body


# --------------------------------------------------------------------------- Seitenteile


def plain(value: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", value)).strip()


def meta(page: str, url: str) -> tuple[str, str]:
    title = re.search(r"<title>(.*?)</title>", page, re.S)
    description = re.search(r'<meta name="description" content="([^"]*)"', page)
    if not title or not description:
        raise SystemExit(f"{url}: <title> oder Meta-Description fehlt")
    return plain(title.group(1)), html.unescape(description.group(1)).strip()


def div_inner(page: str, marker: str, url: str) -> str:
    """Inhalt des ersten <div>, dessen class-Attribut mit marker beginnt (verschachtelte divs gezählt)."""
    start = page.find(f'<div class="{marker}')
    if start < 0:
        raise SystemExit(f"{url}: Block '{marker}' nicht gefunden – hat ICONY das Template geändert?")
    start = page.index(">", start) + 1
    depth = 1
    for match in re.finditer(r"<(/?)div\b[^>]*>", page[start:]):
        depth += -1 if match.group(1) else 1
        if depth == 0:
            return page[start : start + match.start()]
    raise SystemExit(f"{url}: Block '{marker}' ist nicht geschlossen")


def panel_parts(page: str, url: str) -> tuple[str, str, str]:
    """Hub/Root-Seiten: (H1-Text, Panel-Inhalt ohne die H1, Registrierungsbutton-Zeile)."""
    panel = div_inner(page, "panel bg-box-greyscale-weight-100 p-xs-20", url)
    h1 = re.search(r"<h1[^>]*>(.*?)</h1>", panel, re.S)
    if not h1:
        raise SystemExit(f"{url}: H1 im Inhaltsbereich fehlt")
    body = panel[: h1.start()] + panel[h1.end() :]
    cta = ""
    cta_start = body.find('<div class="ic-row m-t-40">')
    if cta_start >= 0:
        body, cta = body[:cta_start], body[cta_start:]
    return plain(h1.group(1)), body, cta


def city_parts(page: str, url: str) -> tuple[str, str]:
    """Stadtseiten: (H1 der Seite, Redaktionstext aus .text-content)."""
    h1 = re.search(r"<h1[^>]*>(.*?)</h1>", page, re.S)
    if not h1:
        raise SystemExit(f"{url}: H1 fehlt")
    return plain(h1.group(1)), div_inner(page, "text-content", url)


def icony_widget(page: str, url: str) -> dict[str, str]:
    location = re.search(r"<location-input\b[^>]*>", page)
    frame = re.search(r'<iframe src="(https://js\.icony\.com/frame/[^"]+)"', page)
    if not location or not frame:
        raise SystemExit(f"{url}: ICONY-Ortsfeld oder Singles-Widget fehlt")
    attrs = dict(re.findall(r'([\w-]+)="([^"]*)"', location.group(0)))
    frame_url = html.unescape(frame.group(1))
    return {
        "locationId": attrs.get("location", ""),
        "locationValue": html.unescape(attrs.get("value", "")),
        "frameId": parse_qs(urlparse(frame_url).query).get("id", [""])[0],
        "frameUrl": frame_url,
    }


def hub_city_slugs(content: str) -> list[str]:
    return re.findall(r'href="(?:https://[^"/]+)?/partnersuche/([a-z0-9-]+)/"', content)


def relative_own_links(content: str, site: str) -> str:
    return re.sub(rf'href="{re.escape(site)}(/[^"]*)"', r'href="\1"', content)


# --------------------------------------------------------------------------- DE: quelltext-nah


EMPTY_BLOCK = r"(?:\s|&nbsp;|&#160;|\xa0)*"


def clean_de(content: str, site: str) -> str:
    # Bild in einer H1 (ICONY-Editor-Artefakt) wird zur Figur, leere Absätze/Überschriften entfallen
    content = re.sub(r"<h1>\s*(<img\b[^>]*>)\s*</h1>", r'<figure class="cms-inline-figure">\1</figure>', content)
    content = re.sub(rf"<h1>{EMPTY_BLOCK}</h1>", "", content)
    content = re.sub(rf"<p>{EMPTY_BLOCK}</p>", "", content)
    content = relative_own_links(content, site)
    content = re.sub(r"\n{3,}", "\n\n", content)
    return content.strip()


# Stadtseiten, deren Text-H1 der historische Import aus dem Inhalt entfernt hat (sie steht nur in heroTitle).
# Für die Darstellung egal – lib/icony-import.ts entfernt H1 im Inhalt ohnehin –, hält aber den Re-Import diff-frei.
DE_DROP_CONTENT_H1 = {"hamburg"}


def drop_text_h1(content: str) -> str:
    for match in re.finditer(r"<h1[^>]*>(.*?)</h1>\n?", content, re.S):
        if plain(match.group(1)):
            return content[: match.start()] + content[match.end() :]
    return content


def content_heading_de(content: str) -> str | None:
    """Stadtseiten mit eigener Text-H1: diese ist die Hero-Überschrift, nicht die Template-H1."""
    for heading in re.findall(r"<h1[^>]*>(.*?)</h1>", content, re.S):
        text = plain(heading)
        if text:
            return text
    return None


# --------------------------------------------------------------------------- AT/CH: neu serialisiert


VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}


class Node:
    def __init__(self, tag: str | None, attrs: list[tuple[str, str | None]] | None = None, text: str = "") -> None:
        self.tag = tag
        self.attrs = attrs or []
        self.text = text
        self.children: list[Node] = []


class TreeBuilder(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.root = Node("#root")
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs)
        self.stack[-1].children.append(node)
        if tag not in VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.stack[-1].children.append(Node(tag, attrs))

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                return

    def handle_data(self, data):
        self.stack[-1].children.append(Node(None, text=data))


def escape_text(value: str, named_entities: bool) -> str:
    value = value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    if named_entities:
        value = "".join(
            f"&{codepoint2name[ord(char)]};" if ord(char) > 127 and ord(char) in codepoint2name else char
            for char in value
        )
    return value


def serialize(node: Node, named_entities: bool) -> str:
    if node.tag is None:
        return "\n" if not node.text.strip(" \t\r\n\f") else escape_text(node.text, named_entities)
    inner = "".join(serialize(child, named_entities) for child in node.children)
    if node.tag == "#root":
        return inner
    attrs = ""
    for name, value in sorted(node.attrs, key=lambda item: item[0]):
        if value is None:
            attrs += f" {name}"
        else:
            attrs += f' {name}="{escape_text(value, named_entities).replace(chr(34), "&quot;")}"'
    if node.tag in VOID:
        return f"<{node.tag}{attrs}/>"
    return f"<{node.tag}{attrs}>{inner}</{node.tag}>"


def parse(content: str) -> Node:
    builder = TreeBuilder()
    builder.feed(content)
    builder.close()
    return builder.root


def first_image(root: Node) -> dict[str, str] | None:
    def walk(node: Node):
        for child in node.children:
            if child.tag == "img":
                return child
            found = walk(child)
            if found:
                return found
        return None

    image = walk(root)
    if not image:
        return None
    attrs = dict(image.attrs)
    result = {"url": attrs.get("src") or "", "alt": attrs.get("alt") or ""}
    if attrs.get("data-media-id"):
        result["mediaId"] = attrs["data-media-id"]
    return result


def take_attribution(root: Node, remove: bool) -> str | None:
    """Letzter Absatz <p><small>…pixabay-URL…</small></p> = Bildquelle."""
    blocks = [child for child in root.children if child.tag is not None]
    if not blocks:
        return None
    last = blocks[-1]
    smalls = [child for child in last.children if child.tag == "small"]
    if last.tag != "p" or len(smalls) != 1:
        return None
    text = "".join(child.text for child in smalls[0].children if child.tag is None)
    url = re.search(r"https?://\S+", text)
    if not url:
        return None
    if remove:
        index = root.children.index(last)
        del root.children[index:]
    return url.group(0)


def clean_market(content: str, site: str, named_entities: bool) -> str:
    content = relative_own_links(content, site)
    return serialize(parse(content), named_entities).strip()


# --------------------------------------------------------------------------- Import


def import_de(fetch: Fetcher, site: str, cities: list[tuple[str, str]]) -> dict:
    hub_url = f"{site}/partnersuche/"
    hub_page = fetch(hub_url)
    hub_h1, hub_body, _cta = panel_parts(hub_page, hub_url)
    title, description = meta(hub_page, hub_url)
    hub = {
        "slug": "partnersuche",
        "path": "/partnersuche/",
        "sourceUrl": hub_url,
        "title": title,
        "description": description,
        "heroTitle": hub_h1,
        "contentHtml": clean_de(hub_body, site),
    }
    warn_unknown_cities(hub_body, cities, "de")

    city_pages = []
    for slug, label in cities:
        url = f"{site}/partnersuche/{slug}/"
        page = fetch(url)
        title, description = meta(page, url)
        h1, body = city_parts(page, url)
        content = clean_de(body, site)
        hero = content_heading_de(body)
        if hero and slug in DE_DROP_CONTENT_H1:
            content = drop_text_h1(content)
        city_pages.append(
            {
                "slug": slug,
                "path": f"/partnersuche/{slug}/",
                "sourceUrl": url,
                "title": title,
                "description": description,
                "heroTitle": hero or h1,
                "cityLabel": label,
                "contentHtml": content,
            }
        )

    root_pages = []
    for path in DE_ROOT_PAGES:
        url = f"{site}{path}"
        page = fetch(url)
        title, description = meta(page, url)
        h1, body, _cta = panel_parts(page, url)
        root_pages.append(
            {
                "slug": path.strip("/"),
                "path": path,
                "sourceUrl": url,
                "title": title,
                "description": description,
                "heroTitle": h1,
                "contentHtml": clean_de(body, site),
            }
        )

    return {
        "generatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "site": site,
        "partnersucheHub": hub,
        "cityPages": city_pages,
        "rootPages": root_pages,
    }


def import_market(fetch: Fetcher, market: str, site: str, cities: list[tuple[str, str]]) -> dict:
    # AT: Umlaute als Zeichen, Bildquelle bleibt im Text, ICONY-Felder flach, Hub mit Registrierungsbutton.
    # CH: Umlaute als benannte Entities, Bildquelle nur im image-Feld, ICONY-Felder als Objekt.
    # lib/market-icony-import.ts versteht beide Formen.
    named_entities = market == "ch"

    hub_url = f"{site}/partnersuche/"
    hub_page = fetch(hub_url)
    hub_h1, hub_body, cta = panel_parts(hub_page, hub_url)
    title, description = meta(hub_page, hub_url)
    hub_root = parse(hub_body)
    hub = {
        "slug": "partnersuche",
        "path": "/partnersuche/",
        "sourceUrl": hub_url,
        "title": title,
        "description": description,
        "heroTitle": hub_h1,
        # Nur AT hat den Registrierungsbutton des Hubs im Inhalt behalten
        "contentHtml": clean_market(hub_body + (cta if market == "at" else ""), site, named_entities),
    }
    image = first_image(hub_root)
    if image:
        hub["image"] = image
    warn_unknown_cities(hub_body, cities, market)

    city_pages = []
    for slug, label in cities:
        url = f"{site}/partnersuche/{slug}/"
        page = fetch(url)
        title, description = meta(page, url)
        h1, body = city_parts(page, url)
        root = parse(relative_own_links(body, site))
        image = first_image(root)
        attribution = take_attribution(root, remove=market == "ch")
        if image and attribution:
            image["sourceAttributionUrl"] = attribution
        entry = {
            "slug": slug,
            "path": f"/partnersuche/{slug}/",
            "sourceUrl": url,
            "title": title,
            "description": description,
            "heroTitle": h1,
            "cityLabel": label,
            "contentHtml": serialize(root, named_entities).strip(),
        }
        if image:
            entry["image"] = image
        widget = icony_widget(page, url)
        if market == "ch":
            entry["icony"] = widget
        else:
            entry.update({f"icony{key[0].upper()}{key[1:]}": value for key, value in widget.items()})
        city_pages.append(entry)

    return {"market": market, "site": site, "partnersucheHub": hub, "cityPages": city_pages}


def warn_unknown_cities(hub_body: str, cities: list[tuple[str, str]], market: str) -> None:
    known = {slug for slug, _label in cities}
    for slug in hub_city_slugs(hub_body):
        if slug not in known:
            print(f"WARNUNG [{market}]: Live-Hub verlinkt /partnersuche/{slug}/ – nicht in der Stadtliste des Skripts", file=sys.stderr)


def apply_overrides(data: dict, market: str) -> None:
    pages = [data["partnersucheHub"], *data["cityPages"], *data.get("rootPages", [])]
    for path, fields in OVERRIDES.get(market, {}).items():
        page = next((entry for entry in pages if entry["path"] == path), None)
        if page is None:
            raise SystemExit(f"Override für unbekannten Pfad {path}")
        page.update(fields)


def dump(data: dict) -> str:
    return json.dumps(data, ensure_ascii=False, indent=2) + "\n"


def comparable(data: dict) -> str:
    return json.dumps({key: value for key, value in data.items() if key != "generatedAt"}, ensure_ascii=False, indent=2)


def report_diff(old: dict, new: dict, label: str) -> bool:
    a, b = comparable(old).splitlines(), comparable(new).splitlines()
    if a == b:
        print(f"{label}: identisch (ohne generatedAt)")
        return False
    print(f"{label}: Unterschiede (ohne generatedAt):")

    def pages(data: dict) -> dict[str, dict]:
        entries = [data.get("partnersucheHub", {}), *data.get("cityPages", []), *data.get("rootPages", [])]
        return {entry.get("path", "?"): entry for entry in entries}

    old_pages, new_pages = pages(old), pages(new)
    for path in dict.fromkeys([*old_pages, *new_pages]):
        if path not in new_pages or path not in old_pages:
            print(f"  {path}: {'fehlt live' if path not in new_pages else 'neu'}")
            continue
        for field in dict.fromkeys([*old_pages[path], *new_pages[path]]):
            before, after = old_pages[path].get(field), new_pages[path].get(field)
            if before == after:
                continue
            print(f"  {path} · {field}:")
            if not isinstance(before, str) or not isinstance(after, str):
                print(f"    - {json.dumps(before, ensure_ascii=False)[:300]}\n    + {json.dumps(after, ensure_ascii=False)[:300]}")
                continue
            matcher = difflib.SequenceMatcher(None, before, after, autojunk=False)
            for op, i1, i2, j1, j2 in matcher.get_opcodes():
                if op != "equal":
                    context = before[max(0, i1 - 60) : i1]
                    print(f"    …{context!r} {op}: {before[i1:i2][:300]!r} -> {after[j1:j2][:300]!r}")
    if [key for key in old if key not in ("generatedAt",)] != [key for key in new if key not in ("generatedAt",)]:
        print("  Schlüssel der Datei unterscheiden sich")
    return True


def check_assets(update: bool) -> int:
    """data/asset-catalog.json: Logos/Hero-Bild mit der Live-Quelle abgleichen (sha256)."""
    catalog_path = DATA_DIR / "asset-catalog.json"
    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    changed = 0
    for asset in catalog["assets"]:
        local = ROOT / asset["file"]
        local_hash = hashlib.sha256(local.read_bytes()).hexdigest() if local.exists() else None
        request = urllib.request.Request(asset["sourceUrl"], headers={**UA, "Accept": "image/webp,image/svg+xml,*/*"})
        with urllib.request.urlopen(request, timeout=30) as response:
            remote = response.read()
        remote_hash = hashlib.sha256(remote).hexdigest()
        if local_hash == remote_hash == asset["sha256"]:
            print(f"ok       {asset['file']}")
            continue
        changed += 1
        print(f"GEÄNDERT {asset['file']} (Katalog {asset['sha256'][:12]}, lokal {str(local_hash)[:12]}, live {remote_hash[:12]})")
        if update:
            local.write_bytes(remote)
            asset["sha256"] = remote_hash
    if changed and update:
        catalog["generatedAt"] = datetime.now(timezone.utc).date().isoformat()
        catalog_path.write_text(dump(catalog), encoding="utf-8", newline=LF)
        print(f"{changed} Asset(s) aktualisiert -> {catalog_path}")
    return 1 if changed and not update else 0


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__.split(LF + LF)[0])
    parser.add_argument("--market", choices=sorted(MARKETS), help="Markt, dessen Seiten importiert werden")
    parser.add_argument("--out", type=Path, help="Zieldatei (Standard: data/<markt-datei>)")
    parser.add_argument("--check", action="store_true", help="nur mit der Zieldatei vergleichen, nichts schreiben; Exit 1 bei Unterschieden")
    parser.add_argument("--cache", type=Path, help="Verzeichnis für Roh-HTML (spart Abrufe beim Nachjustieren)")
    parser.add_argument("--assets", action="store_true", help="statt Seiten: data/asset-catalog.json gegen die Live-Assets prüfen")
    parser.add_argument("--update", action="store_true", help="mit --assets: geänderte Assets herunterladen und Katalog aktualisieren")
    args = parser.parse_args()

    if args.assets:
        return check_assets(args.update)
    if not args.market:
        parser.error("--market de|at|ch oder --assets angeben")

    config = MARKETS[args.market]
    fetch = Fetcher(args.cache)
    if args.market == "de":
        data = import_de(fetch, config["site"], config["cities"])
    else:
        data = import_market(fetch, args.market, config["site"], config["cities"])
    apply_overrides(data, args.market)

    committed_path = DATA_DIR / config["out"]
    if args.check:
        committed = json.loads(committed_path.read_text(encoding="utf-8"))
        return 1 if report_diff(committed, data, config["out"]) else 0

    out = args.out or committed_path
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(dump(data), encoding="utf-8", newline=LF)
    pages = len(data["cityPages"]) + len(data.get("rootPages", [])) + 1
    print(f"{args.market}: {pages} Seiten -> {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
