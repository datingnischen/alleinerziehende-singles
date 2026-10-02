#!/usr/bin/env python3
"""
Einmaliger Import des Magazins aus WordPress (alleinerziehende-singles.de/magazin, öffentliche REST-API, AIOSEO).

Schreibt:
  content/magazin/<slug>.md          162 Beiträge (kind: post) + 56 Seiten (kind: page), Frontmatter + Markdown
  data/magazin-kategorien.json       3 WordPress-Kategorien (id, slug, name, description)
  data/weiterleitungen.json          alte WordPress-Slugs und Archivpfade -> aktuelle Pfade (next.config.ts)
  data/magazin-slugs-wordpress.json  Slug-Inventar vor der Migration (Vergleich im Test)
  public/magazin/wp-content/uploads/…  Titelbilder und Bilder im Text (JPG/PNG als WebP), 5 MP3-Zusammenfassungen

Beim Import bereinigt:
  - Links auf Magazinseiten werden relativ; alle anderen Links auf die eigene Domain (Plattformseiten, /?AID=magazin)
    bleiben absolut auf der Live-Domain (ICONY-Seiten gehören ICONY)
  - alte Slugs mit Tippfehlern ("auszahlungsterminen", "saeetze") zeigen auf den aktuellen Beitrag (ALTE_SLUGS)
  - datingxperten.de (Seite nicht mehr erreichbar) ohne Link
  - Amazon-Widgets (iframe, Partner-ID elflirt-21) werden zu Textlinks mit derselben Partner-ID
  - <audio> bleibt als HTML im Markdown (Datei liegt jetzt unter public/magazin/wp-content/uploads/)
  - Alt-Texte nie leer (Titelbild: Medien-Alt oder Titel; Bilder im Text: Alt oder Titel des Beitrags)
  - seoTitle ohne das WordPress-Anhängsel " | Magazin"
  - Duplikat-Slug kindergeld-auszahlungstermine-mai-2021: Seite (2022) und Beitrag (2021) – der Beitrag gewinnt wie bisher

Aufruf im Projektordner:  python scripts/import_wordpress.py [--offline]
Überschreibt content/magazin – nach redaktionellen Änderungen im Repo nicht mehr laufen lassen.
"""
from __future__ import annotations

import argparse
import html as htmllib
import io
import json
import re
import shutil
import sys
import urllib.parse
from pathlib import Path

APP = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(APP / "scripts"))

from bs4 import BeautifulSoup, NavigableString, Tag  # noqa: E402
from PIL import Image  # noqa: E402

import wpimport as wp  # noqa: E402

LIVE = "https://alleinerziehende-singles.de"
SITE = f"{LIVE}/magazin"
UPLOAD_PREFIX = "/magazin/wp-content/uploads/"

# Alte Pfade (WordPress leitete sie per _wp_old_slug um) -> aktueller Beitrag. Gefunden in Links der Artikel.
ALTE_SLUGS = {
    "kindergeld-auszahlungsterminen-dezember-2023": "kindergeld-auszahlungstermine-dezember-2023",
    "kindergeld-auszahlungsterminen-juli-2021": "kindergeld-auszahlungstermine-juli-2021",
    "kindergeld-auszahlungsterminen-januar-2021": "kindergeld-auszahlungstermine-januar-2021",
    "kindergeld-auszahlungsterminen-august-2020": "kindergeld-auszahlungstermine-august-2020",
    "kindergeld-auszahlungstermine-januar-2022-2": "kindergeld-auszahlungstermine-januar-2022",
    "urlaub-zu-hause-die-besten-tipps": "urlaub-zu-hause-tipps",
    "8-saeetze-die-du-als-alleinerziehende-mutter-nicht-hoeren-moechtest": "8-saetze-die-du-als-alleinerziehende-mutter-nicht-hoeren-moechtest",
    "kindergeld-auszahlungstermine-februar-2019": "kindergeld-auszahlungstermine-februar-2019-2",
}

# Archivseiten von WordPress, die es als Seite nie gab -> Themenwelten des Magazins
ARCHIV_LINKS = {
    "/magazin/thema/singleboersen/": "/magazin/?thema=singleboersen",
    "/magazin/stichwort/auszahlungstermine/": "/magazin/?thema=kindergeld",
}

# Hosts, die nicht mehr verlinkt werden (Seite nicht erreichbar bzw. eingestellt)
TOTE_HOSTS = {"datingxperten.de"}

# gezielte Korrekturen im Text (alt, neu) – bei Bedarf ergänzen, die Anzahl der Treffer wird gemeldet
TEXT_KORREKTUR: list[tuple[str, str]] = [
    # Alt-Text der Plattform-Kachel stammte von einer Schwesterseite (FlirtMoms)
    ('singleboerese-alleinerziehende-singles.jpg" alt="Flirt Moms"', 'singleboerese-alleinerziehende-singles.jpg" alt="Alleinerziehende-Singles.de"'),
    ("Schwangerschftswoche", "Schwangerschaftswoche"),
    ("Kindergerd Auszahlungstermine", "Kindergeld Auszahlungstermine"),
    ("Herausforderung für Alleinerziehende Elterne", "Herausforderung für Alleinerziehende Eltern"),
    # SSW16/SSW17: die Bilder im Text (2021/07, ...-1024x54x.png) gibt es auf dem Server nicht mehr, die Originale liegen unter 2021/11
    ("uploads/2021/07/SSW16-1024x546.png", "uploads/2021/11/SSW16.png"),
    ("uploads/2021/07/SSW17-1024x547.png", "uploads/2021/11/SSW17.png"),
    # Jahresübersicht 2025: April, Mai und Juni verlinkten auf die Beiträge von 2024
    ('termine-april-2024/">Kindergeld Auszahlung April 2025', 'termine-april-2025/">Kindergeld Auszahlung April 2025'),
    ('termine-mai-2024/">Kindergeld Auszahlung Mai 2025', 'termine-mai-2025/">Kindergeld Auszahlung Mai 2025'),
    ('termine-juni-2024/">Kindergeld Auszahlung Juni 2025', 'termine-juni-2025/">Kindergeld Auszahlung Juni 2025'),
]

# Kaputtes Markup in WordPress (Anführungszeichen und Autolink mitten im <img>-Tag) -> sauberer Tag
IMG_REPARATUR = [
    (
        re.compile(r'<img[^>]*Politiker-2-Euro-<a href[^>]*>Kindergeld</a>erhöhung-2016\.jpg[^>]*/>'),
        '<img src="https://alleinerziehende-singles.de/magazin/wp-content/uploads/2016/01/Politiker-2-Euro-Kindergelderhöhung-2016.jpg" alt="Politiker 2 Euro Kindergelderhöhung 2016" />',
    ),
]

# Beschreibungen für Einträge ohne AIOSEO-Description (sonst aus Auszug/Textanfang)
BESCHREIBUNGEN: dict[str, str] = {}

BILD_ENDUNG = re.compile(r"\.(png|jpe?g)$", re.I)
MAX_BREITE = 1024


def korrigiert(s: str) -> str:
    for alt, neu in TEXT_KORREKTUR:
        s = s.replace(alt, neu)
    return s


def host(url: str) -> str:
    return (urllib.parse.urlparse(url).hostname or "").lower().removeprefix("www.")


def safe_rel(rel: str) -> str:
    """Upload-Pfad ohne Zeichen, die in Markdown-URLs stören (Leerzeichen, Klammern, Umlaute)."""
    parts = []
    for part in rel.split("/"):
        part = part.replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss").replace("Ä", "Ae").replace("Ö", "Oe").replace("Ü", "Ue")
        parts.append(re.sub(r"[^A-Za-z0-9._-]+", "-", part))
    return "/".join(parts)


def pfad(rel: str) -> str:
    """Neuer Pfad in public/ (JPG/PNG werden WebP mit kollisionsfreier Endung)."""
    rel = safe_rel(rel)
    return UPLOAD_PREFIX + BILD_ENDUNG.sub(lambda m: f"-{m.group(1).lower()}.webp", rel)


def als_webp(src: Path, dest: Path, max_width: int) -> None:
    img = Image.open(io.BytesIO(src.read_bytes()))
    if img.width > max_width:
        img = img.resize((max_width, round(img.height * max_width / img.width)), Image.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    img = img.convert("RGBA") if img.mode in ("P", "LA", "RGBA") else img.convert("RGB")
    img.save(dest, "WEBP", quality=82, method=6)


class MagazinConverter(wp.Converter):
    """Wie wp.Converter, aber mit Query-Parametern an internen Links, Magazin-Pfaden und Markdown-Maskierung."""

    def __init__(self, slugs: set[str], titel: str, dropped: list[str], by_id: dict[int, str]):
        super().__init__(SITE)
        self.slugs = slugs
        self.by_id = by_id
        self.titel = titel
        self.dropped = dropped
        self.unwrapped: list[str] = []
        self.ids: set[str] = set()  # Überschriften-IDs des Beitrags (Ziele für #-Links)

    def internal(self, path: str, query: str, fragment: str) -> str:
        frag = f"#{fragment}" if fragment else ""
        if "preview=true" in query:
            # Vorschau-Link eines Entwurfs (?p=<id> oder Slug mit ?preview=true) -> der veröffentlichte Beitrag
            q = urllib.parse.parse_qs(query)
            slug = self.by_id.get(int(q["p"][0])) if q.get("p", [""])[0].isdigit() else None
            slug = slug or (re.fullmatch(r"/magazin/([^/]+)/?", path) or [None, None])[1]
            if slug in self.slugs:
                return f"/magazin/{slug}/{frag}"
            self.unwrapped.append(path + "?" + query)
            return ""
        if path in ARCHIV_LINKS:
            return ARCHIV_LINKS[path]
        m = re.fullmatch(r"/magazin/([^/]+)/?", path)
        if m:
            slug = ALTE_SLUGS.get(m.group(1), m.group(1))
            if slug in self.slugs:
                return f"/magazin/{slug}/{frag}"
            self.unwrapped.append(path)
            return ""
        if path.rstrip("/") == "/magazin":
            return "/magazin/" + frag
        if path.startswith("/partnersuche/"):
            return path + frag
        # alles andere gehört der Plattform: absolut auf die Live-Domain, mit Query (AID)
        return f"{LIVE}{path}" + (f"?{query}" if query else "") + frag

    def href(self, raw: str) -> str:
        raw = htmllib.unescape(raw.strip())
        u = urllib.parse.urlparse(raw)
        h = (u.hostname or "").removeprefix("www.")
        if raw.startswith("#"):
            return raw if raw[1:] in self.ids else ""
        if not u.scheme and raw.startswith("/"):
            return self.internal(u.path, u.query, u.fragment)
        if h == self.host:
            return self.internal(u.path or "/", u.query, u.fragment)
        if h in TOTE_HOSTS:
            return ""
        return raw

    def img_src(self, tag: Tag) -> str | None:
        src = tag.get("data-src") or tag.get("src") or ""
        if not src or src.startswith("data:"):
            return None
        rel = wp.upload_rel(src) if (self.host in src or src.startswith(("/wp-content/", "/magazin/wp-content/"))) else None
        if not rel:
            self.dropped.append(src)
            return None
        self.images.add(rel)
        return pfad(rel)

    @staticmethod
    def zeilenanfang(node) -> bool:
        """Textknoten am Anfang eines Absatzes oder direkt nach <br>: dort würde „1. “ oder „- “ zur Liste."""
        prev = node.previous_sibling
        if prev is None:
            return node.parent is not None and node.parent.name in ("p", "li")
        return isinstance(prev, Tag) and prev.name == "br" and node.parent is not None and node.parent.name in ("p", "li")

    @staticmethod
    def rand_zeichen(node, ende: bool) -> str:
        """Erstes bzw. letztes Zeichen des Nachbar-Textknotens (für die Markdown-Betonung)."""
        nb = node.next_sibling if not ende else node.previous_sibling
        if isinstance(nb, NavigableString) and not isinstance(nb, wp.Comment):
            t = str(nb).replace("\xa0", " ")
            return t[-1:] if ende else t[:1]
        return ""

    def inline(self, node) -> str:
        if isinstance(node, NavigableString) and not isinstance(node, wp.Comment):
            t = re.sub(r"\s+", " ", str(node).replace("\xa0", " "))
            t = t.replace("\\", "\\\\")
            t = re.sub(r"([*`\[\]])", r"\\\1", t)
            # Unterstrich nur an Wortgrenzen maskieren (in URLs wie at_medium=… bleibt er stehen)
            t = re.sub(r"(?<![A-Za-z0-9])_|_(?![A-Za-z0-9])", r"\\_", t)
            t = t.replace("<", "&lt;").replace(">", "&gt;")
            if self.zeilenanfang(node):
                t = re.sub(r"^(\s*)(\d+)([.)])(?=\s)", r"\1\2\\\3", t)
                t = re.sub(r"^(\s*)([-+#>])(?=\s)", r"\1\\\2", t)
            return t
        if isinstance(node, Tag) and node.name == "img":
            src = self.img_src(node)
            if not src:
                return ""
            alt = " ".join((node.get("alt") or "").replace("[", "(").replace("]", ")").split())
            return f"![{alt or self.titel}]({src})"
        if isinstance(node, Tag) and node.name in ("strong", "b", "em", "i"):
            inner = "".join(self.inline(c) for c in node.children)
            # <br> am Rand gehört nicht in die Betonung
            rand = " \t\r\n" + wp.BR
            t = inner.strip(rand)
            vorn, hinten = inner[: len(inner) - len(inner.lstrip(rand))], inner[len(inner.rstrip(rand)) :]
            lead_br, trail_br = vorn.count(wp.BR), hinten.count(wp.BR)
            if not t:
                return inner
            lead = " " if vorn.strip(wp.BR) else ""
            trail = " " if hinten.strip(wp.BR) else ""
            fett = node.name in ("strong", "b")
            nxt = self.rand_zeichen(node, ende=False)
            prv = self.rand_zeichen(node, ende=True)
            # CommonMark erkennt „**2.**In“ bzw. „x**(2)**“ nicht als Betonung: dann HTML-Tag
            schlecht = (not trail and not t[-1].isalnum() and nxt.isalnum()) or (not lead and not t[0].isalnum() and prv.isalnum())
            if schlecht:
                tag = "strong" if fett else "em"
                body = f"<{tag}>{t}</{tag}>"
            else:
                mark = "**" if fett else "*"
                body = f"{mark}{t}{mark}"
            return wp.BR * lead_br + lead + body + trail + wp.BR * trail_br
        return super().inline(node)


def vorbereiten(html: str, audio: list[str]) -> BeautifulSoup:
    """WordPress-HTML vor der Umwandlung: Audio und Amazon-Widgets sichern, Leerabsätze entfernen."""
    for muster, neu in IMG_REPARATUR:
        html = muster.sub(neu, html)
    soup = BeautifulSoup(korrigiert(html), "html.parser")
    for el in soup.find_all("audio"):
        src = (el.find("source") or el).get("src") or ""
        rel = wp.upload_rel(src)
        if not rel:
            sys.exit(f"Audio ohne Upload-Pfad: {src}")
        audio.append(rel)
        p = soup.new_tag("p")
        p.string = f"§§AUDIO:{pfad(rel)}§§"
        el.replace_with(p)
    # <ul><ul><li>…</li></ul></ul> (äußere Liste ohne eigene Einträge): äußere auflösen
    for liste in soup.find_all("ul"):
        kinder = [c for c in liste.children if isinstance(c, Tag)]
        if kinder and all(c.name == "ul" for c in kinder):
            liste.unwrap()
    # Listen, deren Einträge Überschrift + Absätze enthalten („14 Date-Ideen“, „8 Sätze“): in Blöcke auflösen.
    # Bei <ol> bekommt die Überschrift die Nummer, die der Browser sonst vor den Eintrag setzte.
    for liste in soup.find_all(["ol", "ul"]):
        eintraege = liste.find_all("li", recursive=False)
        if not eintraege or not all(li.find(["h1", "h2", "h3", "h4", "h5", "h6"], recursive=False) for li in eintraege):
            continue
        for nr, li in enumerate(eintraege, 1):
            kopf = li.find(["h1", "h2", "h3", "h4", "h5", "h6"], recursive=False)
            if liste.name == "ol" and not re.match(r"\s*\d+[.)]", kopf.get_text()):
                kopf.insert(0, f"{nr}. ")
            li.unwrap()
        liste.unwrap()
    # Definitionslisten (FAQ-Blöcke): Frage fett, Antwort als Absatz
    for dt in soup.find_all("dt"):
        strong = soup.new_tag("strong")
        strong.extend(list(dt.contents))
        dt.clear()
        dt.append(strong)
        dt.name = "p"
    for dd in soup.find_all("dd"):
        dd.name = "p"
    for dl in soup.find_all("dl"):
        dl.unwrap()
    # Tabellenüberschrift (<caption>) geht in der Umwandlung verloren: als fetten Absatz davor setzen
    for cap in soup.find_all("caption"):
        tabelle = cap.find_parent("table")
        p = soup.new_tag("p")
        strong = soup.new_tag("strong")
        strong.string = cap.get_text(" ", strip=True)
        p.append(strong)
        tabelle.insert_before(p)
        cap.decompose()
    # Bild von einem Fremd-/Altserver (elbaby.de), das in einem Link steckt: der Link behält den Alt-Text als Text
    for img in soup.find_all("img"):
        src = img.get("src") or ""
        if "/wp-content/" in src and ("alleinerziehende-singles.de" in src or src.startswith("/")):
            continue
        if img.find_parent("a") and (img.get("alt") or "").strip():
            img.replace_with(img["alt"].strip())
    for el in soup.find_all("iframe"):
        src = el.get("src") or ""
        m = re.search(r"amazon-adsystem\.com/.*[?&]asins=([A-Z0-9]{10}).*tracking_id=([\w-]+)", src) or re.search(
            r"amazon-adsystem\.com/.*tracking_id=([\w-]+).*[?&]asins=([A-Z0-9]{10})", src
        )
        if m:
            asin, tag = (m.group(1), m.group(2)) if re.fullmatch(r"[A-Z0-9]{10}", m.group(1)) else (m.group(2), m.group(1))
            a = soup.new_tag("a", href=f"https://www.amazon.de/dp/{asin}?tag={tag}")
            a.string = "Produkt bei Amazon ansehen"
            el.replace_with(a)
    return soup


def satz_kuerzen(text_: str, limit: int = 155) -> str:
    """Wie wp.kuerzen, aber das Satzende darf auch nach einer Zahl stehen („… für das Jahr 2025.“)."""
    t = " ".join(text_.split())
    if len(t) <= limit:
        return t
    enden = [m.end() for m in re.finditer(r"(?<=[\wäöüß)“\"])[.!?](?= [A-ZÄÖÜ])", t) if m.end() <= limit]
    if enden and enden[-1] >= 70:
        return t[: enden[-1]]
    return wp.kuerzen(t, limit) or t


def erster_absatz(body: str) -> str:
    """Erster Textabsatz des Markdown-Körpers (ohne Überschriften, Audio, Bilder, Tabellen) als Klartext."""
    for block in re.split(r"\n{2,}", body):
        b = block.strip()
        if not b or b[0] in "#|>-" or b.startswith(("<", "![", "§")) or re.match(r"\d+\.\s", b):
            continue
        t = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", b)
        t = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", t)
        t = re.sub(r"\\([\\*_`\[\]])", r"\1", t).replace("**", "").replace("&lt;", "<").replace("&gt;", ">")
        t = " ".join(t.split())
        if len(t) >= 40 and not t.startswith("Die wichtigsten Punkte kurz und verständlich zusammengefasst"):
            return t
    return ""


def beschreibung(post: dict, erster: str, excerpt: str) -> str:
    slug = post["slug"]
    if slug in BESCHREIBUNGEN:
        return BESCHREIBUNGEN[slug]
    head = post.get("aioseo_head_json") or {}
    kandidaten = [head.get("description") or "", erster, excerpt]
    for k in kandidaten:
        k = satz_kuerzen(htmllib.unescape(k)) if k else ""
        if k and len(k) >= 70:
            return k
    return next((satz_kuerzen(htmllib.unescape(k)) for k in kandidaten if k), "")


def seo_titel(post: dict, titel: str) -> str:
    head = post.get("aioseo_head_json") or {}
    t = htmllib.unescape(head.get("title") or "")
    t = re.sub(r"\s*\|\s*Magazin\s*$", "", t).strip()
    for kandidat in (t, titel):
        if kandidat and len(kandidat) <= 60:
            return kandidat
    # zu lang: am Wortende kürzen
    basis = t or titel
    return basis[:59].rsplit(" ", 1)[0].rstrip(",;:–-") + " …"


def auszug(post: dict) -> str:
    t = wp.text((post.get("excerpt") or {}).get("rendered", ""))
    t = re.sub(r"^Artikel kurz anhören.*?Audio-Element nicht\.?\s*", "", t)
    t = re.sub(r"\s*\[(?:…|\.\.\.)\]\s*$", " …", t).strip()
    return t


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--offline", action="store_true")
    args = ap.parse_args()
    cache = APP / ".wp-cache"
    data = wp.load(SITE, cache, offline=args.offline)
    media = {m["id"]: m for m in data["media"]}
    kategorien = {c["id"]: c for c in data["categories"]}
    posts = [p for p in data["posts"] if p["status"] == "publish"]
    pages = [p for p in data["pages"] if p["status"] == "publish"]
    post_slugs = {p["slug"] for p in posts}
    # Doppelter Slug: der Beitrag gewinnt (so lieferte es auch die bisherige App aus)
    pages = [p for p in pages if p["slug"] not in post_slugs]
    eintraege = [(p, "post") for p in posts] + [(p, "page") for p in pages]
    slugs = {p["slug"] for p, _ in eintraege}
    by_id = {p["id"]: p["slug"] for p, _ in eintraege}
    fehlend = sorted(set(ALTE_SLUGS.values()) - slugs)
    if fehlend:
        sys.exit(f"ALTE_SLUGS zeigt auf unbekannte Slugs: {fehlend}")

    out = APP / "content" / "magazin"
    shutil.rmtree(out, ignore_errors=True)
    shutil.rmtree(APP / "public" / "magazin" / "wp-content", ignore_errors=True)

    bilder: set[str] = set()
    audio: list[str] = []
    dropped: list[str] = []
    unwrapped: list[tuple[str, str]] = []
    stats = {"post": 0, "page": 0, "ohne_bild": 0}

    for post, kind in eintraege:
        slug = post["slug"]
        titel = wp.text(post["title"]["rendered"])
        soup = vorbereiten(post["content"]["rendered"], audio)
        conv = MagazinConverter(slugs, titel, dropped, by_id)
        conv.ids = {h["id"] for h in soup.find_all(["h2", "h3", "h4"], id=True)}
        for h in soup.find_all(["h2", "h3", "h4"], id=True):
            h.append(f" §§ID:{h['id']}§§")
        body = conv.to_markdown(str(soup))
        # Überschriften mit eigener ID (Inhaltsverzeichnis per #-Link) bleiben als HTML-Zeile
        body = re.sub(
            r"(?m)^(#{2,4}) (.*?) §§ID:([\w-]+)§§$",
            lambda m: f'<h{len(m.group(1))} id="{m.group(3)}">{m.group(2)}</h{len(m.group(1))}>',
            body,
        )
        body = re.sub(r"(\]\([^)\s]+\))(?=[A-Za-zÄÖÜäöüß])", r"\1 ", body)
        body = re.sub(
            r"§§AUDIO:([^§]+)§§",
            lambda m: f'<audio controls preload="none" src="{m.group(1)}">Dein Browser unterstützt das Audio-Element nicht.</audio>',
            body,
        )
        body = re.sub(r"\n{3,}", "\n\n", body).strip() + "\n"
        bilder |= conv.images
        unwrapped += [(slug, u) for u in conv.unwrapped]

        fm = media.get(post.get("featured_media") or 0)
        image = image_alt = None
        if fm:
            rel = wp.featured_rel(fm, max_width=MAX_BREITE)
            bilder.add(rel)
            image = pfad(rel)
            image_alt = " ".join(htmllib.unescape(fm.get("alt_text") or "").split()) or titel
        else:
            stats["ohne_bild"] += 1

        erster = erster_absatz(body)
        ex = korrigiert(auszug(post))
        # WordPress kürzt Auszüge nach 55 Wörtern mitten im Satz (und lässt „Artikel kurz anhören“ stehen):
        # Wirkt der Auszug abgeschnitten, dient der erste Absatz am Satzende als Auszug.
        if erster and (len(ex) < 80 or not re.search(r"[.!?…\"“)]$", ex)):
            ex = satz_kuerzen(erster, 220) or ex
        cats = [kategorien[c]["slug"] for c in post.get("categories", []) if c in kategorien]
        front = [
            ("title", titel),
            ("seoTitle", seo_titel(post, titel)),
            ("description", korrigiert(beschreibung(post, erster, ex))),
            ("kind", kind),
            ("wpId", post["id"]),
            ("published", post["date"]),
            ("updated", post["modified"]),
            ("author", "redaktion"),
            ("categories", cats),
            ("excerpt", ex),
            ("image", image),
            ("imageAlt", image_alt),
        ]
        wp.write_md(out / f"{slug}.md", front, body)
        stats[kind] += 1

    # Kategorien und Weiterleitungen
    (APP / "data").mkdir(exist_ok=True)
    kat = [
        {"id": c["id"], "slug": c["slug"], "name": c["name"], "description": c.get("description", "")}
        for c in sorted(kategorien.values(), key=lambda c: c["id"])
    ]
    (APP / "data" / "magazin-kategorien.json").write_text(json.dumps(kat, ensure_ascii=False, indent=2) + "\n", "utf-8", newline="\n")
    (APP / "data" / "weiterleitungen.json").write_text(
        json.dumps({"slugs": ALTE_SLUGS, "archive": ARCHIV_LINKS}, ensure_ascii=False, indent=2) + "\n", "utf-8", newline="\n"
    )
    (APP / "data" / "magazin-slugs-wordpress.json").write_text(
        json.dumps({"posts": sorted(post_slugs), "pages": sorted(p["slug"] for p in data["pages"] if p["status"] == "publish")}, indent=1) + "\n",
        "utf-8",
        newline="\n",
    )

    # Bilder: PNG/JPG -> WebP (max. 1024 px), alles andere unverändert; MP3 dazu
    tmp = cache / "public"
    alle = bilder | set(audio)
    wp.download_uploads(SITE, alle, cache, tmp, offline=args.offline)
    n = 0
    for rel in sorted(alle):
        src = tmp / "wp-content" / "uploads" / rel
        if not src.exists():
            print(f"  FEHLT: {rel}", file=sys.stderr)
            continue
        dest = APP / "public" / pfad(rel).lstrip("/")
        if BILD_ENDUNG.search(rel):
            als_webp(src, dest, MAX_BREITE)
        else:
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(src, dest)
        n += 1
    shutil.rmtree(tmp, ignore_errors=True)
    print(stats, "Dateien:", n, "Audio:", len(audio))
    print("verworfene fremde Bilder:", sorted(set(dropped)))
    print("Links ohne Ziel entfernt:", unwrapped)


if __name__ == "__main__":
    main()
