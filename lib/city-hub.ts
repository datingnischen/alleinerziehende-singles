import maps from "../data/country-maps.json" with { type: "json" };
import { buildCityGuide, leadImage, nearestCities, type GuideTopic } from "./city-guide.ts";
import { getCityHub, getCityPages } from "./city-pages.ts";
import type { MarketCode } from "./markets.ts";

type CountryMap = {
  width: number;
  height: number;
  path: string;
  projection: { k: number; minX: number; minY: number; scale: number; pad: number };
};

export type HubCity = {
  slug: string;
  name: string;
  path: string;
  imageUrl: string | null;
  region: string;
  chapters: number;
  minutes: number;
  topics: GuideTopic[];
  nearest: { name: string; km: number } | null;
  x: number;
  y: number;
  label: { x: number; y: number; anchor: "start" | "end" | "middle" } | null;
};

export type CityHubData = {
  map: { width: number; height: number; path: string };
  cities: HubCity[];
  regions: string[];
  totals: { cities: number; regions: number; chapters: number; topicCounts: Partial<Record<GuideTopic, number>> };
  editorial: { imageUrl: string | null; imageAlt: string; html: string };
};

const LABEL_SIZE = 38;

export function projectPoint(map: CountryMap, lat: number, lon: number) {
  const { k, minX, minY, scale, pad } = map.projection;
  return { x: (lon * k - minX) * scale + pad, y: (-lat - minY) * scale + pad };
}

type Box = { x1: number; y1: number; x2: number; y2: number };
const overlaps = (a: Box, b: Box) => a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;

/** Beschriftungen gierig platzieren: rechts, links, oben, unten – sonst weglassen (Pin bleibt klickbar). */
function placeLabels(cities: Omit<HubCity, "label">[], width: number, height: number): HubCity[] {
  const pins: Box[] = cities.map((city) => ({ x1: city.x - 21, y1: city.y - 21, x2: city.x + 21, y2: city.y + 21 }));
  const placed: Box[] = [];
  return cities.map((city) => {
    const w = city.name.length * LABEL_SIZE * 0.58;
    const h = LABEL_SIZE;
    const options: { box: Box; label: NonNullable<HubCity["label"]> }[] = [
      { box: { x1: city.x + 26, y1: city.y - h / 2, x2: city.x + 26 + w, y2: city.y + h / 2 }, label: { x: city.x + 26, y: city.y + 13, anchor: "start" } },
      { box: { x1: city.x - 26 - w, y1: city.y - h / 2, x2: city.x - 26, y2: city.y + h / 2 }, label: { x: city.x - 26, y: city.y + 13, anchor: "end" } },
      { box: { x1: city.x - w / 2, y1: city.y - 22 - h, x2: city.x + w / 2, y2: city.y - 22 }, label: { x: city.x, y: city.y - 28, anchor: "middle" } },
      { box: { x1: city.x - w / 2, y1: city.y + 22, x2: city.x + w / 2, y2: city.y + 22 + h }, label: { x: city.x, y: city.y + 52, anchor: "middle" } },
    ];
    const fit = options.find(({ box }) =>
      box.x1 >= -10 && box.x2 <= width + 10 && box.y1 >= -10 && box.y2 <= height + 10
      && !placed.some((other) => overlaps(box, other))
      && !pins.some((pin, index) => cities[index].slug !== city.slug && overlaps(box, pin)));
    if (fit) placed.push(fit.box);
    return { ...city, label: fit?.label ?? null };
  });
}

/** ICONY-Übersichtstext ohne Titelbild, Stadtlisten und leere Absätze – die Städte zeigt die Kartenansicht. */
function editorialHtml(html: string, imageUrl: string | null) {
  let result = html;
  if (imageUrl) {
    result = result.replace(/<p>\s*<img\b[^>]*>\s*(?:&nbsp;|&#160;| )?\s*<\/p>/i, "");
  }
  return result
    .replace(/<div class="ic-row">[\s\S]*?<\/ul>\s*<\/div>\s*<\/div>/gi, "")
    .replace(/<ul class="list-unstyled">[\s\S]*?<\/ul>/gi, "")
    .replace(/<\/?div\b[^>]*>/gi, "")
    // Bildschirmfoto einer Bilddatenbank am Textende (kein Motiv, unklare Lizenz) nicht übernehmen
    .replace(/<p>\s*<img\b[^>]*freepik[^>]*>\s*<\/p>/gi, "")
    .replace(/<p>(?:\s|&nbsp;|&#160;| |<br\s*\/?>)*<\/p>/gi, "")
    .replace(/\s+data-(?:start|end)="\d+"/g, "")
    .trim();
}

export function getCityHubData(market: MarketCode): CityHubData {
  const map = (maps as Record<MarketCode, CountryMap>)[market];
  const pages = getCityPages(market);
  const raw = pages.map((page) => {
    const guide = buildCityGuide({ contentHtml: page.contentHtml, imageUrl: page.imageUrl, creditUrl: page.creditUrl });
    const point = page.geo ? projectPoint(map, page.geo.lat, page.geo.lon) : { x: -100, y: -100 };
    const near = nearestCities(market, page.slug, pages, 1)[0];
    return {
      slug: page.slug,
      name: page.name,
      path: page.path,
      imageUrl: page.imageUrl,
      region: page.geo?.region ?? "",
      chapters: Math.max(guide.sections.length, 1),
      minutes: guide.readingMinutes,
      topics: guide.topics.slice(0, 4),
      allTopics: guide.topics,
      nearest: near ? { name: near.name, km: near.km } : null,
      x: Math.round(point.x),
      y: Math.round(point.y),
    };
  });
  const cities = placeLabels(raw.map(({ allTopics: _topics, ...city }) => city), map.width, map.height);
  const regions = [...new Set(cities.map((city) => city.region).filter(Boolean))].sort((a, b) => a.localeCompare(b, "de"));
  const topicCounts: Partial<Record<GuideTopic, number>> = {};
  for (const city of raw) for (const topic of city.allTopics) topicCounts[topic] = (topicCounts[topic] ?? 0) + 1;

  const hub = getCityHub(market);
  const image = leadImage(hub.contentHtml);

  return {
    map: { width: map.width, height: map.height, path: map.path },
    cities,
    regions,
    totals: {
      cities: cities.length,
      regions: regions.length,
      chapters: cities.reduce((sum, city) => sum + city.chapters, 0),
      topicCounts,
    },
    editorial: { imageUrl: image?.url ?? null, imageAlt: image?.alt ?? "", html: editorialHtml(hub.contentHtml, image?.url ?? null) },
  };
}
