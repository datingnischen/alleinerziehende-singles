"""
Gemeinsame Bausteine für den Umzug von WordPress-Seiten in dateibasierte Next.js-Apps.

Genutzt von apps/<app>/scripts/import_wordpress.py. Liest ausschließlich die öffentliche REST-API
(kein Login nötig), cacht alles in apps/<app>/.wp-cache/ und schreibt Markdown mit Frontmatter.

Regeln, die für alle Tierseiten gelten:
  - Plugin- und Editor-Reste fliegen raus: Inhaltsverzeichnis-Plugins, Formulare, SVGs, Lazyload-Platzhalter,
    Divi-Shortcodes, ins Backend kopiertes Chat-Oberflächen-HTML.
  - Eingebettete Videos werden zu Links (keine Inhalte von Dritten nachladen, siehe Datenschutzerklärung).
  - Interne Links werden relativ; externe Links bleiben erhalten.
  - Bilder behalten ihren Pfad unter /wp-content/uploads/…
"""
from __future__ import annotations

import html
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

from bs4 import BeautifulSoup, Comment, NavigableString, Tag

UA = {"User-Agent": "Mozilla/5.0 (datingnischen import)"}

# Die Firmen-Firewall bricht TLS zu manchen Seiten auf (Zertifikatsfehler). Nur für das Lesen öffentlicher Inhalte
# darf die Prüfung per WPIMPORT_INSECURE=1 abgeschaltet werden – niemals für Anfragen mit Zugangsdaten.
import os
import ssl

SSL_CTX = None
if os.environ.get("WPIMPORT_INSECURE") == "1":
    SSL_CTX = ssl.create_default_context()
    SSL_CTX.check_hostname = False
    SSL_CTX.verify_mode = ssl.CERT_NONE


def _open(url: str, timeout: int = 120):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout, context=SSL_CTX)
BR = "\u0001"


# ------------------------------------------------------------------ Laden


def fetch_all(site: str, kind: str) -> list:
    out, page = [], 1
    while True:
        url = f"{site}/wp-json/wp/v2/{kind}?per_page=100&page={page}"
        with _open(url) as r:
            out += json.load(r)
            pages = int(r.headers.get("X-WP-TotalPages", "1"))
        if page >= pages:
            return out
        page += 1


def load(site: str, cache: Path, kinds=("posts", "pages", "categories", "tags", "media"), offline=False) -> dict:
    cache.mkdir(parents=True, exist_ok=True)
    data = {}
    for kind in kinds:
        f = cache / f"{kind}.json"
        if offline or f.exists():
            data[kind] = json.loads(f.read_text("utf-8")) if f.exists() else []
        else:
            print(f"lade {kind} …")
            data[kind] = fetch_all(site, kind)
            f.write_text(json.dumps(data[kind], ensure_ascii=False, indent=1), "utf-8")
    return data


def upload_rel(url: str) -> str | None:
    if "/wp-content/uploads/" not in url:
        return None
    return urllib.parse.unquote(url.split("/wp-content/uploads/", 1)[1].split("?")[0])


def download_uploads(site: str, rels: set[str], cache: Path, public: Path, offline=False) -> int:
    """Lädt die genannten Upload-Dateien (Pfad unter wp-content/uploads) in den Cache und kopiert sie nach public/."""
    n = 0
    for rel in sorted(rels):
        src = cache / "uploads" / rel
        if not src.exists() and not offline:
            src.parent.mkdir(parents=True, exist_ok=True)
            url = f"{site}/wp-content/uploads/" + urllib.parse.quote(rel)
            try:
                with _open(url) as r:
                    src.write_bytes(r.read())
            except Exception as e:  # noqa: BLE001
                print(f"  WARNUNG Bild {rel}: {e}", file=sys.stderr)
                continue
        if src.exists():
            dest = public / "wp-content" / "uploads" / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(src.read_bytes())
            n += 1
    return n


def featured_rel(media_item: dict | None, max_width: int = 1200) -> str | None:
    """Beste Bildgröße ≤ max_width (sonst Original) als Upload-Pfad."""
    if not media_item:
        return None
    sizes = (media_item.get("media_details") or {}).get("sizes") or {}
    best = None
    for s in sizes.values():
        w = s.get("width") or 0
        if w <= max_width and (best is None or w > best[0]):
            best = (w, s.get("source_url"))
    full_w = (media_item.get("media_details") or {}).get("width") or 0
    if full_w and full_w <= max_width:
        return upload_rel(media_item["source_url"])
    return upload_rel(best[1]) if best and best[1] else upload_rel(media_item["source_url"])


# ------------------------------------------------------------------ HTML → Markdown


class Converter:
    def __init__(self, site: str, internal_map=None, rel_for_external=None):
        self.site = site.rstrip("/")
        self.host = urllib.parse.urlparse(self.site).hostname.removeprefix("www.")
        self.internal_map = internal_map or (lambda path: path)
        self.images: set[str] = set()
        self.videos: list[str] = []

    # --- Links

    def href(self, raw: str) -> str:
        raw = html.unescape(raw.strip())
        u = urllib.parse.urlparse(raw)
        host = (u.hostname or "").removeprefix("www.")
        if raw.startswith("#"):
            return ""
        if not u.scheme and raw.startswith("/"):
            return self.internal_map(u.path) + (f"#{u.fragment}" if u.fragment else "")
        if host == self.host:
            return self.internal_map(u.path or "/") + (f"#{u.fragment}" if u.fragment else "")
        return raw

    def img_src(self, tag: Tag) -> str | None:
        src = tag.get("data-src") or tag.get("src") or ""
        if not src or src.startswith("data:"):
            return None
        rel = upload_rel(src) if (self.host in src or src.startswith("/wp-content/")) else None
        if rel:
            self.images.add(rel)
            return "/wp-content/uploads/" + rel
        return None  # fremde Bilder nicht einbinden

    # --- Inline

    def inline(self, node) -> str:
        if isinstance(node, Comment):
            return ""
        if isinstance(node, NavigableString):
            return re.sub(r"\s+", " ", str(node).replace("\xa0", " "))
        if not isinstance(node, Tag):
            return ""
        name = node.name
        if name in ("script", "style", "svg", "form", "button", "nav", "noscript", "textarea", "input"):
            return ""
        if name == "br":
            return BR
        if name == "img":
            src = self.img_src(node)
            if not src:
                return ""
            alt = (node.get("alt") or "").replace("[", "(").replace("]", ")").strip()
            return f"![{alt}]({src})"
        inner = "".join(self.inline(c) for c in node.children)
        if name in ("strong", "b", "em", "i"):
            t = inner.strip()
            if not t:
                return inner
            mark = "**" if name in ("strong", "b") else "*"
            lead = " " if inner[:1].isspace() else ""
            trail = " " if inner[-1:].isspace() else ""
            return f"{lead}{mark}{t}{mark}{trail}"
        if name == "a":
            text = inner.strip()
            raw_href = node.get("href") or ""
            # Bild, das nur auf seine eigene Großansicht verlinkt: Link weglassen
            if text.startswith("![") and "/wp-content/uploads/" in raw_href:
                return text
            href = self.href(raw_href)
            if not text:
                return inner
            if not href:
                return text
            return f"[{text}]({href})"
        if name == "code":
            return f"`{inner.strip()}`"
        return inner

    # --- Blöcke

    def clean(self, soup: BeautifulSoup) -> None:
        for c in soup.find_all(string=lambda s: isinstance(s, Comment)):
            c.extract()
        # Inhaltsverzeichnis-Plugins (Easy Table of Contents u. a.)
        for sel in ("#ez-toc-container", ".ez-toc-container", "#toc_container", ".lwptoc"):
            for el in soup.select(sel):
                el.decompose()
        for el in soup.find_all(["form", "svg", "button", "script", "style", "noscript", "textarea"]):
            el.decompose()
        # WordPress-Einbettungen anderer Beiträge
        for el in soup.find_all(["blockquote", "iframe"], class_=re.compile("wp-embedded-content")):
            el.decompose()
        # Videos → Link
        for el in soup.find_all("iframe"):
            src = el.get("data-src") or el.get("src") or ""
            m = re.search(r"youtube(?:-nocookie)?\.com/embed/([\w-]+)", src)
            if m:
                url = f"https://www.youtube.com/watch?v={m.group(1)}"
                self.videos.append(url)
                p = soup.new_tag("p")
                a = soup.new_tag("a", href=url)
                a.string = "Video auf YouTube ansehen"
                p.append(a)
                el.replace_with(p)
            else:
                el.decompose()

    def blocks(self, container: Tag) -> list[str]:
        out: list[str] = []
        for node in list(container.children):
            if isinstance(node, Comment):
                continue
            if isinstance(node, NavigableString):
                t = str(node).strip()
                if t:
                    out.append(t)
                continue
            if not isinstance(node, Tag):
                continue
            name = node.name
            if name in ("h1", "h2", "h3", "h4", "h5", "h6"):
                level = min(4, max(2, int(name[1])))
                text = " ".join(self.inline(node).replace(BR, " ").split())
                text = text.strip("*").strip() if text.startswith("**") and text.endswith("**") else text
                if text:
                    out.append("#" * level + " " + text)
            elif name == "p":
                t = self.inline(node)
                t = re.sub(r"[ \t]*" + BR + r"[ \t]*", "  \n", t).strip()
                t = re.sub(r"^(  \n)+|(  \n)+$", "", t).strip()
                if t:
                    out.append(t)
            elif name in ("ul", "ol"):
                items = []
                for i, li in enumerate(node.find_all("li", recursive=False), 1):
                    text = " ".join(self.inline(li).replace(BR, " ").split())
                    if text:
                        items.append((f"{i}. " if name == "ol" else "- ") + text)
                if items:
                    out.append("\n".join(items))
            elif name == "table":
                rows = [[" ".join(self.inline(c).replace(BR, " ").split()).replace("|", "/") for c in tr.find_all(["th", "td"])] for tr in node.find_all("tr")]
                rows = [r for r in rows if any(r)]
                if rows:
                    width = max(len(r) for r in rows)
                    rows = [r + [""] * (width - len(r)) for r in rows]
                    md = ["| " + " | ".join(rows[0]) + " |", "|" + "---|" * width] + ["| " + " | ".join(r) + " |" for r in rows[1:]]
                    out.append("\n".join(md))
            elif name == "blockquote":
                inner = "\n\n".join(self.blocks(node))
                if inner.strip():
                    out.append("\n".join("> " + line if line else ">" for line in inner.split("\n")))
            elif name == "pre":
                out.append("```\n" + node.get_text() + "\n```")
            elif name == "hr":
                out.append("---")
            elif name in ("figure",):
                img = node.find("img")
                cap = node.find("figcaption")
                if img:
                    s = self.inline(img)
                    if s:
                        out.append(s + (f"  \n*{' '.join(self.inline(cap).split())}*" if cap else ""))
            elif name in ("img", "a", "strong", "em", "b", "i", "span"):
                t = self.inline(node).replace(BR, "  \n").strip()
                if t:
                    out.append(t)
            else:
                out += self.blocks(node)
        return out

    def to_markdown(self, rendered_html: str) -> str:
        soup = BeautifulSoup(rendered_html, "html.parser")
        self.clean(soup)
        md = "\n\n".join(b for b in self.blocks(soup) if b.strip())
        md = re.sub(r"\n{3,}", "\n\n", md)
        md = re.sub(r"(?m)^\s*(&nbsp;| )\s*$", "", md)
        return re.sub(r"\n{3,}", "\n\n", md).strip() + "\n"


# ------------------------------------------------------------------ Schreiben


def text(value: str) -> str:
    return " ".join(html.unescape(BeautifulSoup(value or "", "html.parser").get_text(" ")).split())


def kuerzen(text_: str | None, limit: int = 155) -> str | None:
    """Description auf ≤ limit Zeichen: am Satzende (nicht nach „31.“ o. Ä.), sonst an einer Wortgrenze mit „…“."""
    if not text_:
        return None
    t = " ".join(text_.split())
    if len(t) <= limit:
        return t
    enden = [m.end() - 1 for m in re.finditer(r"(?<=[a-zäöüß)“\"])[.!?] (?=[A-ZÄÖÜ])", t) if m.end() - 1 <= limit]
    if enden and enden[-1] >= 70:
        return t[: enden[-1]]
    return t[: limit - 2].rsplit(" ", 1)[0].rstrip(",;:–-") + " …"


def seo(item: dict) -> tuple[str | None, str | None]:
    head = item.get("aioseo_head_json") or {}
    return (html.unescape(head["title"]) if head.get("title") else None, kuerzen(html.unescape(head["description"])) if head.get("description") else None)


def write_md(path: Path, front: list[tuple[str, object]], body: str) -> None:
    lines = ["---"]
    for key, value in front:
        if value in (None, "", [], {}):
            continue
        if isinstance(value, str) and re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
            lines.append(f"{key}: {value}")
        elif isinstance(value, list) and value and isinstance(value[0], dict):
            lines.append(f"{key}:")
            for entry in value:
                first = True
                for k, v in entry.items():
                    lines.append(f"  {'- ' if first else '  '}{k}: {json.dumps(v, ensure_ascii=False)}")
                    first = False
        else:
            lines.append(f"{key}: {json.dumps(value, ensure_ascii=False)}")
    lines.append("---")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines) + "\n\n" + body, "utf-8", newline="\n")
