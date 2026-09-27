import type { MarketCode } from "./markets.ts";

/**
 * Zerlegt den importierten ICONY-Stadttext in Kapitel, ohne ein Wort zu ändern: leere Absätze, das
 * Titelbild, die Bildquelle und die Linkliste („Diese Städte könnten auch interessant …“ bzw.
 * „Nicht aus Wien?“) werden herausgelöst und separat gestaltet.
 */

export type GuideTopic =
  | "support"
  | "kids"
  | "money"
  | "home"
  | "leisure"
  | "meet"
  | "work"
  | "law"
  | "health"
  | "love"
  | "summary"
  | "city";

export type GuideSection = {
  id: string;
  heading: string;
  topic: GuideTopic;
  html: string;
};

export type RelatedCityLink = { name: string; href: string };

export type CityGuide = {
  introHtml: string;
  sections: GuideSection[];
  related: RelatedCityLink[];
  imageCreditUrl: string | null;
  readingMinutes: number;
  topics: GuideTopic[];
};

export const TOPIC_LABELS: Record<GuideTopic, string> = {
  support: "Hilfe & Beratung",
  kids: "Kinderbetreuung & Bildung",
  money: "Finanzielle Hilfen",
  home: "Wohnen mit Kind",
  leisure: "Freizeit mit Kind",
  meet: "Treffpunkte & Austausch",
  work: "Familie & Beruf",
  law: "Recht & Alltag",
  health: "Gesundheit",
  love: "Liebe & Dating",
  summary: "Fazit",
  city: "Familienleben",
};

// Reihenfolge zählt: spezielle Themen zuerst, „Liebe“ erst nach Freizeit (Glück/Ausflug), Rest = Stadtleben.
const TOPIC_RULES: [GuideTopic, RegExp][] = [
  ["city", /^alleinerziehende?(?:\s+singles)?\s+in\b|^alleinerziehend in\b/],
  ["summary", /fazit|schlussfolg/],
  ["money", /finanz|geld|kindergeld|unterhalt/],
  ["home", /wohn/],
  ["kids", /kinderbetreu|betreuung|kita|bildung|schul|schlauberger/],
  ["work", /beruf|weiterbild|\bjob/],
  ["law", /recht/],
  ["health", /gesund|präven/],
  ["meet", /treff|gruppe|gleichgesinn|kontakt|integrier|austausch/],
  ["support", /beratung|hilfe|unterstütz|anlaufst|netzwerk|jugendamt|koordinier|gleichstell|frauenförder|netz, das|dienstleist|einricht|familienpolitik|programm|tut was|basics/],
  ["leisure", /freizeit|ausfl|spaß|kultur|erleb|sport|aktivit|card|ausgehen|kinderfreundlich|orte\b|kids|familienzeit|möglichkeiten|angebot/],
  ["love", /dating|date\b|partner|liebe|verlieb|single|flirt|romant|match|patchwork|herz|glück|kennenlern|kennenzuler/],
];

const EMPTY_PARAGRAPH = /<p>(?:\s|&nbsp;|&#160;| |<br\s*\/?>)*<\/p>/gi;
const CREDIT = /(?:<hr\s*\/?>\s*)?<p>\s*<small>\s*(?:Bildquelle:?\s*)?(https?:\/\/[^<\s]+)\s*<\/small>\s*<\/p>/i;
const RELATED_HEADING = /<h[23]\b[^>]*>(?:(?!<\/h[23]>)[\s\S])*?(?:könnten auch interessant|k&ouml;nnten auch interessant|Nicht aus )(?:(?!<\/h[23]>)[\s\S])*<\/h[23]>/i;

export function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&auml;/g, "ä").replace(/&ouml;/g, "ö").replace(/&uuml;/g, "ü")
    .replace(/&Auml;/g, "Ä").replace(/&Ouml;/g, "Ö").replace(/&Uuml;/g, "Ü")
    .replace(/&szlig;/g, "ß").replace(/&ndash;/g, "–").replace(/&mdash;/g, "—")
    .replace(/&bdquo;/g, "„").replace(/&ldquo;/g, "“").replace(/&rdquo;/g, "”")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)));
}

export function plainText(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, " ")).replace(/ /g, " ").replace(/\s+/g, " ").trim();
}

export function topicFor(heading: string): GuideTopic {
  const value = heading.toLowerCase();
  return TOPIC_RULES.find(([, rule]) => rule.test(value))?.[0] ?? "city";
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Erstes Bild des Textes (Titelbild), falls der Import kein eigenes Bildfeld hat. */
export function leadImage(html: string): { url: string; alt: string } | null {
  const tag = html.match(/<img\b[^>]*>/i)?.[0];
  if (!tag) return null;
  const url = tag.match(/\bsrc=["']([^"']+)["']/i)?.[1];
  if (!url) return null;
  return { url: decodeEntities(url), alt: decodeEntities(tag.match(/\balt=["']([^"']*)["']/i)?.[1] ?? "") };
}

function stripImage(html: string, imageUrl?: string | null): string {
  if (!imageUrl) return html;
  const tags = [...html.matchAll(/<img\b[^>]*>/gi)];
  const hit = tags.find((match) => decodeEntities(match[0].match(/\bsrc=["']([^"']+)["']/i)?.[1] ?? "") === imageUrl);
  if (!hit) return html;
  const without = html.replace(hit[0], "");
  // leere Hüllen (figure/p) des entfernten Bildes wegräumen
  return without.replace(/<figure\b[^>]*>\s*<\/figure>/gi, "").replace(/<p>\s*<\/p>/gi, "");
}

function relatedLinks(html: string): RelatedCityLink[] {
  const links: RelatedCityLink[] = [];
  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const name = plainText(match[2]);
    if (!name || /alle st(ä|&auml;)dte/i.test(name)) continue;
    links.push({ name, href: match[1] });
  }
  return links;
}

export function buildCityGuide(input: { contentHtml: string; imageUrl?: string | null; creditUrl?: string | null }): CityGuide {
  let html = stripImage(input.contentHtml, input.imageUrl);
  const credit = html.match(CREDIT);
  html = html.replace(CREDIT, "").replace(EMPTY_PARAGRAPH, "").replace(/<hr\s*\/?>\s*$/i, "").trim();

  let related: RelatedCityLink[] = [];
  const relatedMatch = html.match(RELATED_HEADING);
  if (relatedMatch?.index !== undefined) {
    related = relatedLinks(html.slice(relatedMatch.index));
    html = html.slice(0, relatedMatch.index).replace(/<hr\s*\/?>\s*$/i, "").trim();
  }

  const parts: { heading: string | null; html: string }[] = [{ heading: null, html: "" }];
  let cursor = 0;
  const headingPattern = /<h2\b[^>]*>([\s\S]*?)<\/h2>/gi;
  const hasH2 = [...html.matchAll(headingPattern)].some((match) => plainText(match[1]));
  for (const match of html.matchAll(hasH2 ? headingPattern : /<h3\b[^>]*>([\s\S]*?)<\/h3>/gi)) {
    parts[parts.length - 1].html += html.slice(cursor, match.index);
    cursor = (match.index ?? 0) + match[0].length;
    const inner = match[1];
    if (plainText(inner)) {
      parts.push({ heading: inner, html: "" });
    } else if (/<img\b/i.test(inner)) {
      parts[parts.length - 1].html += `<p>${inner}</p>`;
    }
  }
  parts[parts.length - 1].html += html.slice(cursor);

  const sections: GuideSection[] = [];
  const usedIds = new Set<string>();
  for (const part of parts.slice(1)) {
    const heading = plainText(part.heading ?? "");
    let id = slugify(heading) || `abschnitt-${sections.length + 1}`;
    while (usedIds.has(id)) id = `${id}-${sections.length + 1}`;
    usedIds.add(id);
    sections.push({ id, heading, topic: topicFor(heading), html: part.html.replace(/<h3\b[^>]*>\s*<\/h3>/gi, "").trim() });
  }

  const introHtml = parts[0].html.trim();
  const fullText = plainText(introHtml + sections.map((section) => `${section.heading} ${section.html}`).join(" "));
  const topics = [...new Set(sections.map((section) => section.topic))].filter((topic) => topic !== "city" && topic !== "summary");

  return {
    introHtml,
    sections,
    related,
    imageCreditUrl: credit?.[1] ?? input.creditUrl ?? null,
    readingMinutes: Math.max(1, Math.round(fullText.split(" ").length / 200)),
    topics,
  };
}

/* ---------- Geografie: nur für Entfernungen, Karte und Regionsangabe ---------- */

export type Geo = { lat: number; lon: number; region: string };

const GEO: Record<MarketCode, Record<string, Geo>> = {
  de: {
    berlin: { lat: 52.52, lon: 13.405, region: "Berlin" },
    hamburg: { lat: 53.5511, lon: 9.9937, region: "Hamburg" },
    stuttgart: { lat: 48.7758, lon: 9.1829, region: "Baden-Württemberg" },
    "frankfurt-am-main": { lat: 50.1109, lon: 8.6821, region: "Hessen" },
    duesseldorf: { lat: 51.2277, lon: 6.7735, region: "Nordrhein-Westfalen" },
    muenchen: { lat: 48.1351, lon: 11.582, region: "Bayern" },
    koeln: { lat: 50.9375, lon: 6.9603, region: "Nordrhein-Westfalen" },
    dortmund: { lat: 51.5136, lon: 7.4653, region: "Nordrhein-Westfalen" },
    nuernberg: { lat: 49.4521, lon: 11.0767, region: "Bayern" },
    bochum: { lat: 51.4818, lon: 7.2162, region: "Nordrhein-Westfalen" },
    hannover: { lat: 52.3759, lon: 9.732, region: "Niedersachsen" },
    essen: { lat: 51.4556, lon: 7.0116, region: "Nordrhein-Westfalen" },
    bremen: { lat: 53.0793, lon: 8.8017, region: "Bremen" },
    dresden: { lat: 51.0504, lon: 13.7373, region: "Sachsen" },
    leipzig: { lat: 51.3397, lon: 12.3731, region: "Sachsen" },
  },
  at: {
    wien: { lat: 48.2082, lon: 16.3738, region: "Wien" },
    graz: { lat: 47.0707, lon: 15.4395, region: "Steiermark" },
    salzburg: { lat: 47.8095, lon: 13.055, region: "Salzburg" },
    innsbruck: { lat: 47.2692, lon: 11.4041, region: "Tirol" },
    dornbirn: { lat: 47.4125, lon: 9.7417, region: "Vorarlberg" },
    klagenfurt: { lat: 46.6247, lon: 14.3053, region: "Kärnten" },
    linz: { lat: 48.3069, lon: 14.2858, region: "Oberösterreich" },
    bregenz: { lat: 47.5031, lon: 9.7471, region: "Vorarlberg" },
    villach: { lat: 46.6103, lon: 13.8558, region: "Kärnten" },
    wels: { lat: 48.1575, lon: 14.0289, region: "Oberösterreich" },
    "st-poelten": { lat: 48.2047, lon: 15.6256, region: "Niederösterreich" },
    amstetten: { lat: 48.1229, lon: 14.8721, region: "Niederösterreich" },
    leoben: { lat: 47.3765, lon: 15.0914, region: "Steiermark" },
    steyr: { lat: 48.0427, lon: 14.4213, region: "Oberösterreich" },
    eisenstadt: { lat: 47.8456, lon: 16.5233, region: "Burgenland" },
  },
  ch: {
    bern: { lat: 46.948, lon: 7.4474, region: "Kanton Bern" },
    basel: { lat: 47.5596, lon: 7.5886, region: "Basel-Stadt" },
    fribourg: { lat: 46.8065, lon: 7.1619, region: "Kanton Freiburg" },
    thun: { lat: 46.758, lon: 7.628, region: "Kanton Bern" },
    luzern: { lat: 47.0502, lon: 8.3093, region: "Kanton Luzern" },
    genf: { lat: 46.2044, lon: 6.1432, region: "Kanton Genf" },
    stgallen: { lat: 47.4245, lon: 9.3767, region: "Kanton St. Gallen" },
    biel: { lat: 47.1368, lon: 7.2468, region: "Kanton Bern" },
    chur: { lat: 46.8508, lon: 9.532, region: "Kanton Graubünden" },
    aarau: { lat: 47.3925, lon: 8.0444, region: "Kanton Aargau" },
    lausanne: { lat: 46.5197, lon: 6.6323, region: "Kanton Waadt" },
    winterthur: { lat: 47.4988, lon: 8.7237, region: "Kanton Zürich" },
    zug: { lat: 47.1662, lon: 8.5155, region: "Kanton Zug" },
    zuerich: { lat: 47.3769, lon: 8.5417, region: "Kanton Zürich" },
    schaffhausen: { lat: 47.6973, lon: 8.6349, region: "Kanton Schaffhausen" },
  },
};

export function cityGeo(market: MarketCode, slug: string): Geo | null {
  return GEO[market][slug] ?? null;
}

export function distanceKm(a: Geo, b: Geo): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * 6371 * Math.asin(Math.sqrt(h)));
}

export function nearestCities<T extends { slug: string }>(market: MarketCode, slug: string, pages: T[], count = 5): (T & { km: number })[] {
  const origin = cityGeo(market, slug);
  if (!origin) return [];
  return pages
    .filter((page) => page.slug !== slug && cityGeo(market, page.slug))
    .map((page) => ({ ...page, km: distanceKm(origin, cityGeo(market, page.slug)!) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, count);
}
