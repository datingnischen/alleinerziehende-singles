#!/usr/bin/env python3
"""Kindergeld-Auszahlungstermine von der Facebook-Seite "Wir wollen mehr Kindergeld" holen.

Schreibt je Jahr data/kindergeld-facebook-<Jahr>.json (Jahresübersicht /magazin/kindergeld-auszahlungstermine-<Jahr>/).
Ohne --year: laufendes und folgendes Jahr (der Januar-Post erscheint Ende Dezember). Ein Jahr ohne Posts wird nicht angelegt.

Token: FACEBOOK_PAGES_SYSTEM_TOKEN (Systemnutzer, läuft nicht ab) aus der Umgebung, der Windows-User-Variable
oder .env.local. Der Seiten-Token wird daraus per /me/accounts geholt. Tokens nie ausgeben.
"""
import argparse
import json
import os
import re
import subprocess
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
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
# Ohne "Kindergeld" davor: der November-2026-Post hieß "… heute schon die Auszahlungstermine für November 2026"
POST_PATTERN = re.compile(r"Auszahlungstermine für ([A-Za-zÄÖÜäöüß]+) (\d{4})", re.I)


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
    args = parser.parse_args()
    this_year = datetime.now().year
    years = args.year or [this_year, this_year + 1]

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
        payload = build_payload(months, year)
        data_file.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        report.append({
            "year": year,
            "months": [item["month"] for item in months],
            "new": [item["month"] for item in months if item["month"] not in {m["month"] for m in previous["months"]}],
            "written": True,
        })
    print(json.dumps(report, ensure_ascii=False))


if __name__ == "__main__":
    main()
