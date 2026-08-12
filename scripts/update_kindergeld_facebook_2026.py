#!/usr/bin/env python3
import json
import re
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "data" / "kindergeld-facebook-2026.json"
GOOGLE_API = Path.home() / "AppData/Local/hermes/profiles/christian/skills/productivity/google-workspace/scripts/google_api.py"
SHEET_ID = "1SjkfjuZIyMNPZXKBPEEBxWF3Sd1XTnic8pIm9Fq9aSo"
PAGE_NAME = "Wir wollen mehr Kindergeld"
PAGE_LINK = "https://www.facebook.com/wirwollenmehrkindergeld/"
PAGE_ID = "1596456913977259"
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
POST_PATTERN = re.compile(r"Kindergeld Auszahlungstermine für ([A-Za-zÄÖÜäöüß]+) 2026", re.I)


def run_google_api(*args: str):
    import subprocess

    cmd = [sys.executable, str(GOOGLE_API), *args]
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return json.loads(result.stdout)


def load_token_from_sheet() -> str:
    rows = run_google_api("sheets", "get", SHEET_ID, "A1:K50")
    header = rows[0]
    rows = [dict(zip(header, row)) for row in rows[1:] if row]
    for row in rows:
        if row.get("Name") == PAGE_NAME:
            token = row.get("PAGE_ACCESS_TOKEN", "").strip()
            page_id = row.get("ID", "").strip()
            if page_id and page_id != PAGE_ID:
                raise RuntimeError(f"Unexpected page id in sheet: {page_id}")
            if not token:
                raise RuntimeError("PAGE_ACCESS_TOKEN missing in Facebook sheet")
            return token
    raise RuntimeError(f"Page '{PAGE_NAME}' not found in Facebook sheet")


def fetch_posts(token: str):
    fields = "id,message,created_time,permalink_url,attachments{media_type,title,url,description},full_picture"
    params = urllib.parse.urlencode({"fields": fields, "limit": "100", "access_token": token})
    url = f"https://graph.facebook.com/v23.0/{PAGE_ID}/posts?{params}"
    with urllib.request.urlopen(url, timeout=30) as response:
        payload = json.loads(response.read().decode("utf-8"))
    return payload.get("data", [])


def extract_months(posts):
    items = {}
    for post in posts:
        message = post.get("message", "")
        match = POST_PATTERN.search(message)
        if not match:
            continue
        month = match.group(1)
        if month not in MONTH_ORDER:
            continue
        items[month] = {
            "month": month,
            "publishedAt": post.get("created_time"),
            "postUrl": post.get("permalink_url"),
            "imageUrl": post.get("full_picture", ""),
        }
    return [items[name] for name in sorted(items, key=lambda key: MONTH_ORDER[key])]


def build_payload(months):
    updated_at = months[-1]["publishedAt"] if months else datetime.now(timezone.utc).isoformat()
    return {
        "slug": "kindergeld-auszahlungstermine-2026",
        "title": "Kindergeld Auszahlungstermine 2026",
        "intro": "Hier findest du die bisher veröffentlichten Kindergeld-Auszahlungstermine 2026 gesammelt in einer Jahresübersicht.",
        "sourceLabel": PAGE_NAME,
        "sourceUrl": PAGE_LINK,
        "updatedAt": updated_at,
        "months": months,
    }


def main():
    token = load_token_from_sheet()
    posts = fetch_posts(token)
    months = extract_months(posts)
    payload = build_payload(months)
    DATA_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "updated": str(DATA_FILE),
        "month_count": len(months),
        "months": [item["month"] for item in months],
        "updatedAt": payload["updatedAt"],
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
