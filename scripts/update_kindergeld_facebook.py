#!/usr/bin/env python3
"""Kindergeld-Auszahlungstermine von der Facebook-Seite "Wir wollen mehr Kindergeld" holen.

Schreibt je Jahr data/kindergeld-facebook-<Jahr>.json (Jahresübersicht /magazin/kindergeld-auszahlungstermine-<Jahr>/).
Ohne --year: laufendes und folgendes Jahr (der Januar-Post erscheint Ende Dezember). Ein Jahr ohne Posts wird nicht angelegt.

Je Monat:
- Tabellenbild nach public/magazin/wp-content/uploads/<Jahr>/kindergeld/<monat>.jpg (fbcdn-Links laufen ab).
- Zahltage je Endziffer 0–9 ("paymentDays") liest ein Mensch oder Agent vom Bild ab und übergibt sie mit
  --days Juli=3,6,7,9,10,13,14,17,20,21. Bereits erfasste Zahltage bleiben bei jedem Lauf erhalten.
- Sobald Zahltage vorliegen, entsteht content/magazin/kindergeld-auszahlungstermine-<monat>-<Jahr>.md
  (gleicher Aufbau wie die Monatsbeiträge bis 2025). Ohne Zahltage verlinkt die Jahresübersicht auf den Facebook-Post.

Token: FACEBOOK_PAGES_SYSTEM_TOKEN (Systemnutzer, läuft nicht ab) aus der Umgebung, der Windows-User-Variable
oder .env.local. Der Seiten-Token wird daraus per /me/accounts geholt. Tokens nie ausgeben.
"""
import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
import urllib.parse
import urllib.request
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
CONTENT_DIR = ROOT / "content" / "magazin"
UPLOADS_DIR = ROOT / "public" / "magazin" / "wp-content" / "uploads"
GRAPH = "https://graph.facebook.com/v23.0"
PAGE_NAME = "Wir wollen mehr Kindergeld"
PAGE_LINK = "https://www.facebook.com/wirwollenmehrkindergeld/"
PAGE_ID = "1596456913977259"
MAX_POSTS = 400
MONTH_ORDER = {
    "Januar": 1,
    "Februar": 2,
    "März": 3,
    "April": 4,
    "Mai": 5,
    "Juni": 6,
    "Juli": 7,
    "August": 8,
    "September": 9,
    "Oktober": 10,
    "November": 11,
    "Dezember": 12,
}
WEEKDAYS = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]
# Ohne "Kindergeld" davor: der November-2026-Post hieß "… heute schon die Auszahlungstermine für November 2026"
POST_PATTERN = re.compile(r"Auszahlungstermine für ([A-Za-zÄÖÜäöüß]+) (\d{4})", re.I)


def month_slug(month: str) -> str:
    return month.lower().replace("ä", "ae").replace("ö", "oe").replace("ü", "ue")


def load_system_token() -> str:
    token = os.environ.get("FACEBOOK_PAGES_SYSTEM_TOKEN", "").strip()
    if not token and sys.platform == "win32":
        result = subprocess.run(
            [
                "powershell",
                "-NoProfile",
                "-Command",
                "[Environment]::GetEnvironmentVariable('FACEBOOK_PAGES_SYSTEM_TOKEN','User')",
            ],
            capture_output=True,
            text=True,
        )
        token = result.stdout.strip()
    env_file = ROOT / ".env.local"
    if not token and env_file.exists():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            if line.startswith("FACEBOOK_PAGES_SYSTEM_TOKEN="):
                token = line.split("=", 1)[1].strip().strip('"')
    if not token:
        raise RuntimeError("FACEBOOK_PAGES_SYSTEM_TOKEN fehlt (Umgebung, User-Variable oder .env.local)")
    return token


def graph_get(url: str):
    with urllib.request.urlopen(url, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def load_page_token(system_token: str) -> str:
    params = urllib.parse.urlencode({"fields": "id,name,access_token", "limit": "100", "access_token": system_token})
    for page in graph_get(f"{GRAPH}/me/accounts?{params}").get("data", []):
        if page.get("id") == PAGE_ID:
            return page["access_token"]
    raise RuntimeError(f"Seite '{PAGE_NAME}' ({PAGE_ID}) ist dem Systemnutzer nicht zugewiesen")


def fetch_posts(token: str):
    fields = "id,message,created_time,permalink_url,full_picture"
    params = urllib.parse.urlencode({"fields": fields, "limit": "100", "access_token": token})
    url = f"{GRAPH}/{PAGE_ID}/posts?{params}"
    posts = []
    while url and len(posts) < MAX_POSTS:
        payload = graph_get(url)
        posts.extend(payload.get("data", []))
        url = payload.get("paging", {}).get("next")
    return posts


def extract_months(posts, year: int):
    items = {}
    # Chronologisch: bei Korrektur-Posts gewinnt der zuletzt veröffentlichte
    for post in sorted(posts, key=lambda item: item.get("created_time", "")):
        match = POST_PATTERN.search(post.get("message", ""))
        if not match or int(match.group(2)) != year:
            continue
        month = match.group(1).capitalize()
        if month not in MONTH_ORDER:
            continue
        items[month] = {
            "month": month,
            "publishedAt": post.get("created_time"),
            "postUrl": post.get("permalink_url"),
            "imageUrl": post.get("full_picture", ""),
        }
    return [items[name] for name in sorted(items, key=lambda key: MONTH_ORDER[key])]


def parse_days_args(values):
    """--days Juli=3,6,7,… → {"Juli": [3, 6, 7, …]} (Zahltag je Endziffer 0–9)."""
    result = {}
    for value in values or []:
        month, _, days = value.partition("=")
        month = month.strip().capitalize()
        if month not in MONTH_ORDER:
            raise RuntimeError(f"--days: unbekannter Monat '{month}'")
        parsed = [int(day) for day in days.split(",") if day.strip()]
        if len(parsed) != 10 or parsed != sorted(parsed):
            raise RuntimeError(f"--days {month}: genau 10 aufsteigende Tage (Endziffer 0–9) erwartet")
        result[month] = parsed
    return result


def validate_days(year: int, month: str, days):
    for day in days:
        weekday = date(year, MONTH_ORDER[month], day).weekday()
        if weekday > 4:
            raise RuntimeError(f"{month} {year}: Zahltag {day}. fällt auf {WEEKDAYS[weekday]} – bitte Bild prüfen")


def save_image(item, year: int) -> str:
    relative = f"/magazin/wp-content/uploads/{year}/kindergeld/{month_slug(item['month'])}.jpg"
    target = ROOT / "public" / relative.lstrip("/")
    if not target.exists() and item.get("imageUrl"):
        target.parent.mkdir(parents=True, exist_ok=True)
        with urllib.request.urlopen(item["imageUrl"], timeout=30) as response:
            target.write_bytes(response.read())
    return relative if target.exists() else ""


def berlin_offset_hours(utc: datetime) -> int:
    """UTC-Offset Europe/Berlin (Sommerzeit: letzter So. März 01:00 UTC bis letzter So. Oktober 01:00 UTC)."""
    def last_sunday(year: int, month: int) -> date:
        d = date(year, month + 1, 1) - timedelta(days=1)
        return d - timedelta(days=(d.weekday() + 1) % 7)
    start = datetime.combine(last_sunday(utc.year, 3), datetime.min.time()) + timedelta(hours=1)
    end = datetime.combine(last_sunday(utc.year, 10), datetime.min.time()) + timedelta(hours=1)
    return 2 if start <= utc.replace(tzinfo=None) < end else 1


def natural_publish_time(slug: str, facebook_time: str) -> str:
    """Ortszeit für published/updated eines neuen Monatsbeitrags.

    Tag = Tag des Facebook-Posts (Europe/Berlin). Uhrzeit deterministisch je Slug, aber unregelmäßig
    (tagsüber, keine runden Zeiten, nie gleich), damit keine Serie mit immer derselben Uhrzeit entsteht.
    Nie in der Zukunft: liegt die Zeit noch vor uns, wird sie kurz vor den Lauf gelegt.
    """
    utc = datetime.strptime(facebook_time, "%Y-%m-%dT%H:%M:%S%z").astimezone(timezone.utc)
    local_post = utc.replace(tzinfo=None) + timedelta(hours=berlin_offset_hours(utc))
    x = int(hashlib.sha256(f"{slug}|date".encode("utf-8")).hexdigest(), 16)
    hours = [h for h, w in {8: 4, 9: 7, 10: 9, 11: 8, 12: 5, 13: 5, 14: 8, 15: 8, 16: 7, 17: 6,
                            18: 5, 19: 6, 20: 7, 21: 5}.items() for _ in range(w)]
    minute, second = (x >> 16) % 60, (x >> 32) % 60 or 7 + (x >> 40) % 50
    if minute in (0, 30) and second < 10:
        minute += 3
    result = datetime(local_post.year, local_post.month, local_post.day, hours[x % len(hours)], minute, second)
    now_local = datetime.now()
    if result > now_local:
        result = now_local - timedelta(minutes=11 + x % 37, seconds=(x >> 8) % 60)
    return result.strftime("%Y-%m-%dT%H:%M:%S")


def existing_times(path: Path):
    """published/updated eines bereits vorhandenen Monatsbeitrags (bleiben bei jedem Lauf stabil)."""
    if not path.exists():
        return None
    text = path.read_text(encoding="utf-8")
    published = re.search(r'^published: "([^"]+)"', text, re.M)
    updated = re.search(r'^updated: "([^"]+)"', text, re.M)
    if not published:
        return None
    return published.group(1), (updated.group(1) if updated else published.group(1))


def render_month_markdown(item, year: int, times=None) -> str:
    month = item["month"]
    number = MONTH_ORDER[month]
    days = item["paymentDays"]
    example = date(year, number, days[2]).strftime("%d.%m.%Y")
    title = f"Kindergeld Auszahlungstermine {month} {year}"
    description = (
        f"Kindergeld im {month} {year}: alle Auszahlungstermine nach der Endziffer der Kindergeldnummer, "
        f"von 0 bis 9 übersichtlich mit Datum und Wochentag."
    )
    excerpt = (
        f"Die Auszahlungstermine für das Kindergeld im {month} {year} richten sich nach der Endziffer der "
        "Kindergeldnummer. Die Kindergeldnummer findet man auf dem Kontoauszug oder auf dem Schreiben der Familienkasse."
    )
    rows = "\n".join(
        f"| {digit} | {WEEKDAYS[date(year, number, day).weekday()]}, {date(year, number, day).strftime('%d.%m.%Y')} |"
        for digit, day in enumerate(days)
    )
    published, updated = times or (natural_publish_time(item["slug"], item["publishedAt"]),) * 2
    lines = [
        "---",
        f'title: "{title}"',
        f'seoTitle: "{title}"',
        f'description: "{description}"',
        'kind: "post"',
        f"wpId: {year * 100 + number}",
        f'published: "{published}"',
        f'updated: "{updated}"',
        'author: "redaktion"',
        'categories: ["kindergeld"]',
        f'excerpt: "{excerpt}"',
        f'image: "{item["image"]}"',
        f'imageAlt: "Kalender {month} {year} mit den Kindergeld-Zahltagen, farbig markiert je Endziffer der Kindergeldnummer"',
        "---",
        "",
        f"Die Auszahlungstermine für das Kindergeld im {month} {year} richten sich nach der Endziffer der Kindergeldnummer.  ",
        "Die Kindergeldnummer findet man auf dem Kontoauszug oder auf dem Schreiben der Familienkasse.  ",
        f"**Beispiel**: Kindergeldnummer 129FK12476**2** ist die Auszahlung am **{example}**  ",
        "Hier muss man nur die Farbe zuordnen. Weitere Informationen zu staatlichen Leistungen für Eltern findest du im "
        "Beitrag [Finanzielle Hilfe nach der Trennung](/magazin/finanzielle-hilfe/).",
        "",
        f"## Alle Termine im {month} {year} nach Endziffer",
        "",
        "| Endziffer | Auszahlung |",
        "| --- | --- |",
        rows,
        "",
        f"Die Termine stammen aus dem Kalender der Facebook-Seite „{PAGE_NAME}“.",
        "",
        f"Alle Monate im Überblick: [Kindergeld Auszahlungstermine {year}](/magazin/kindergeld-auszahlungstermine-{year}/)",
        "",
    ]
    return "\n".join(lines)


def build_payload(months, year: int):
    updated_at = max(item["publishedAt"] for item in months) if months else datetime.now(timezone.utc).isoformat()
    return {
        "slug": f"kindergeld-auszahlungstermine-{year}",
        "title": f"Kindergeld Auszahlungstermine {year}",
        "intro": f"Hier findest du die bisher veröffentlichten Kindergeld-Auszahlungstermine {year} gesammelt in einer Jahresübersicht.",
        "sourceLabel": PAGE_NAME,
        "sourceUrl": PAGE_LINK,
        "updatedAt": updated_at,
        "months": months,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--year", type=int, action="append", help="Jahr (mehrfach möglich); Standard: laufendes + folgendes")
    parser.add_argument("--days", action="append", help="Zahltage je Endziffer 0–9, z. B. Juli=3,6,7,9,10,13,14,17,20,21")
    args = parser.parse_args()
    this_year = datetime.now().year
    years = args.year or [this_year, this_year + 1]
    new_days = parse_days_args(args.days)
    if new_days and len(years) != 1:
        raise RuntimeError("--days nur zusammen mit genau einem --year")

    posts = fetch_posts(load_page_token(load_system_token()))
    report = []
    for year in years:
        months = extract_months(posts, year)
        data_file = DATA_DIR / f"kindergeld-facebook-{year}.json"
        if not months:
            report.append({"year": year, "months": [], "written": False})
            continue
        previous = json.loads(data_file.read_text(encoding="utf-8")) if data_file.exists() else {"months": []}
        if len(months) < len(previous["months"]):
            raise RuntimeError(f"{year}: nur {len(months)} statt bisher {len(previous['months'])} Monate gefunden – nichts überschrieben")
        previous_by_month = {item["month"]: item for item in previous["months"]}

        for item in months:
            item["slug"] = f"kindergeld-auszahlungstermine-{month_slug(item['month'])}-{year}"
            item["image"] = save_image(item, year)
            days = new_days.get(item["month"]) or previous_by_month.get(item["month"], {}).get("paymentDays")
            item["paymentDays"] = days
            if days:
                validate_days(year, item["month"], days)
                if not item["image"]:
                    raise RuntimeError(f"{item['month']} {year}: Bild fehlt")
                target = CONTENT_DIR / f"{item['slug']}.md"
                target.write_text(render_month_markdown(item, year, existing_times(target)), encoding="utf-8")

        payload = build_payload(months, year)
        data_file.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        report.append({
            "year": year,
            "months": [item["month"] for item in months],
            "new": [item["month"] for item in months if item["month"] not in previous_by_month],
            # Diese Monate brauchen noch Zahltage: Bild ansehen und mit --days nachreichen
            "missingDays": [item["month"] for item in months if not item["paymentDays"]],
            "written": True,
        })
    print(json.dumps(report, ensure_ascii=False))


if __name__ == "__main__":
    main()
