import { getCityPage } from "./city-pages.ts";
import { publicUrl } from "./markets.ts";
import { teaserImageUrl } from "./teaser-image.ts";
import type { WpSource } from "./wp-rest-compat.ts";

/**
 * AT/CH-Knoten der WordPress-kompatiblen Schnittstelle (https://alleinerziehende-singles.at|ch/magazin/wp-json/wp/v2/posts).
 *
 * Hintergrund (Heiko, 2026-10-20): Die .at/.ch-Startseiten holten ihre drei Teaser von der .de-Schnittstelle. Die
 * Bilder kamen dann von alleinerziehende-singles.de, die CSP der ICONY-Startseiten (`img-src 'self'`) blockte sie, und
 * die Links führten ins .de-Magazin. Artikel gibt es nur auf .de (kein Duplicate Content). Der Länderknoten liefert
 * darum die drei größten Städteseiten des Landes als „Beiträge“: Link, Bild und Text auf der Landesdomain.
 */

export type MarketTeaserCode = "at" | "ch";

// Größte Städte mit Stadtseite nach Einwohnern. Die Bilder sind Kopien der Stadtseiten-Bilder (ICONY-CMS) in
// public/city-images/<land>/<slug>.jpg, damit sie über die Landesdomain laufen; Maße der Dateien.
const TEASER_CITIES: Record<MarketTeaserCode, { slug: string; width: number; height: number; bytes: number }[]> = {
  at: [
    { slug: "wien", width: 1000, height: 666, bytes: 199554 },
    { slug: "graz", width: 1000, height: 563, bytes: 207226 },
    { slug: "linz", width: 1000, height: 656, bytes: 296574 },
  ],
  ch: [
    { slug: "zuerich", width: 1000, height: 679, bytes: 149910 },
    { slug: "genf", width: 1000, height: 666, bytes: 113075 },
    { slug: "basel", width: 1000, height: 714, bytes: 206717 },
  ],
};

// Feste Datumswerte: Reihenfolge = Einwohnerzahl (neuester „Beitrag“ zuerst).
const DATES = ["2026-10-20T12:00:00", "2026-10-20T11:00:00", "2026-10-20T10:00:00"];
const DATES_GMT = ["2026-10-20T10:00:00", "2026-10-20T09:00:00", "2026-10-20T08:00:00"];
const ID_BASE: Record<MarketTeaserCode, number> = { at: 910_000, ch: 920_000 };
const MEDIA_ID_OFFSET = 1_000_000;

export function isMarketTeaserCode(value: unknown): value is MarketTeaserCode {
  return value === "at" || value === "ch";
}

const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function buildMarketSource(market: MarketTeaserCode): WpSource {
  const restRoot = publicUrl(market, "/magazin/wp-json");
  const media: WpSource["media"] = [];
  const posts = TEASER_CITIES[market].map((teaser, index): WpSource["posts"][number] => {
    const city = getCityPage(market, teaser.slug);
    if (!city) throw new Error(`Stadtseite ${market}/${teaser.slug} fehlt`);
    const id = ID_BASE[market] + index + 1;
    const title = escapeHtml(city.title);
    const excerpt = `<p>${escapeHtml(city.description)}</p>\n`;
    const imagePath = `/city-images/${market}/${teaser.slug}.jpg`;
    const featured = {
      id: MEDIA_ID_OFFSET + id,
      postId: id,
      slug: `${market}-${teaser.slug}`,
      sourceUrl: teaserImageUrl(restRoot, imagePath),
      alt: title,
      title,
      date: DATES[index],
      dateGmt: DATES_GMT[index],
      modified: DATES[index],
      modifiedGmt: DATES_GMT[index],
      width: teaser.width,
      height: teaser.height,
      bytes: teaser.bytes,
      file: imagePath.slice(1),
      mime: "image/jpeg",
    };
    media.push(featured);
    return {
      id,
      slug: teaser.slug,
      link: publicUrl(market, city.path),
      date: DATES[index],
      dateGmt: DATES_GMT[index],
      modified: DATES[index],
      modifiedGmt: DATES_GMT[index],
      title,
      titlePlain: city.title.toLowerCase(),
      excerpt,
      content: excerpt,
      author: 1,
      categories: [],
      featuredMedia: featured,
      haystack: `${city.title} ${city.description}`.toLowerCase(),
    };
  });
  return { posts, media, categories: [] };
}

const cached = new Map<MarketTeaserCode, WpSource>();

export function loadMarketTeaserSource(market: MarketTeaserCode): WpSource {
  const hit = cached.get(market);
  if (hit) return hit;
  const source = buildMarketSource(market);
  if (process.env.NODE_ENV === "production") cached.set(market, source);
  return source;
}
