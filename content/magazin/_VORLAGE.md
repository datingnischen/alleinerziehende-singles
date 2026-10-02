---
# Vorlage für einen neuen Magazin-Artikel. Datei kopieren nach content/magazin/<slug>.md (Dateiname = URL: /magazin/<slug>/).
# Dateien, die mit "_" beginnen, werden nicht veröffentlicht.
title: "Überschrift des Artikels"
# SEO-Titel: höchstens 60 Zeichen, ohne Seitennamen (die Marke "| Alleinerziehende-Singles.de" kommt dazu, wenn sie noch passt)
seoTitle: "Kurzer SEO-Titel"
# Meta-Description: 70 bis 160 Zeichen, sachlich, ohne Werbeversprechen
description: "Ein bis zwei Sätze, die den Artikel zusammenfassen und zum Lesen einladen. Zwischen 70 und 160 Zeichen lang."
# post = Artikel (zeigt "Aktualisiert am …" aus updated), page = feste Seite (ohne Datum)
kind: "post"
published: "2026-10-02T09:00:00"
updated: "2026-10-02T09:00:00"
author: "redaktion"
# Themenwelten: singleboersen (Partnersuche), singleleben (Singleleben), kindergeld (Kindergeld) – oder keine
categories: ["singleleben"]
# Auszug für Karten und Lead (ein bis zwei vollständige Sätze)
excerpt: "Kurzer Auszug, der auf den Karten im Magazin und als Einleitung im Artikelkopf erscheint."
# Titelbild (optional): Datei unter public/magazin/wp-content/uploads/<Jahr>/<Monat>/ ablegen; imageAlt ist dann Pflicht
# image: "/magazin/wp-content/uploads/2026/10/beispiel-jpg.webp"
# imageAlt: "Beschreibung des Bildes"
---

Einleitungsabsatz. Der erste Absatz darf dem Auszug entsprechen, er wird dann nicht doppelt angezeigt.

## Zwischenüberschrift

Fließtext mit **Hervorhebung**, einem [Link auf einen anderen Artikel](/magazin/finanzielle-hilfe/) und einem
[Link auf die Partnersuche](/partnersuche/). Plattformseiten (Registrierung, Login …) immer absolut auf die
Live-Domain verlinken, bei der Registrierung nur mit `?AID=magazin`.

- Aufzählungspunkt
- noch ein Punkt

![Beschreibender Alt-Text, nie leer](/magazin/wp-content/uploads/2026/10/beispiel-jpg.webp)

### Unterabschnitt

| Spalte A | Spalte B |
|---|---|
| Wert | Wert |
