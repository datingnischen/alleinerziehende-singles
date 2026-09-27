import { buildCitySearchUrl } from "./city-search-postcodes.mjs";
import { cityGeo, leadImage, type Geo } from "./city-guide.ts";
import { importedCityPages, importedPartnersucheHub } from "./icony-import.ts";
import { getIconyWidgetConfig } from "./icony-widget-config.ts";
import { getMarketCityPages, getMarketPartnersucheHub } from "./market-icony-import.ts";
import type { MarketCode } from "./markets.ts";
import { registrationUrlForContext } from "./registration-links.ts";

/** Eine Stadtseite, egal aus welchem Markt – Grundlage für Stadtseite, Übersicht und Startseite. */
export type CityPage = {
  market: MarketCode;
  slug: string;
  name: string;
  path: string;
  title: string;
  heroTitle: string;
  description: string;
  contentHtml: string;
  imageUrl: string | null;
  imageAlt: string;
  creditUrl: string | null;
  geo: Geo | null;
  widget: { zip: string; country: number; platformId: string };
  searchUrl: string;
  registrationUrl: string;
};

const COUNTRY_CODE: Record<MarketCode, number> = { de: 49, at: 43, ch: 41 };
const PLATFORM_ID = "alleinerziehende";

function deCities(): CityPage[] {
  return importedCityPages.map((page) => {
    const image = leadImage(page.contentHtml);
    const widget = getIconyWidgetConfig(page.slug);
    return {
      market: "de",
      slug: page.slug,
      name: page.cityLabel,
      path: page.path,
      title: page.title,
      heroTitle: page.heroTitle,
      description: page.description,
      contentHtml: page.contentHtml,
      imageUrl: image?.url ?? null,
      imageAlt: image?.alt ?? "",
      creditUrl: null,
      geo: cityGeo("de", page.slug),
      widget: { zip: widget?.zip ?? "", country: COUNTRY_CODE.de, platformId: widget?.platformId ?? PLATFORM_ID },
      searchUrl: buildCitySearchUrl("de", page.slug),
      registrationUrl: registrationUrlForContext("de", "location"),
    };
  });
}

function regionalCities(market: "at" | "ch"): CityPage[] {
  return getMarketCityPages(market).map((page) => {
    const zip = page.icony.locationValue.match(/^(\d{4})/)?.[1] ?? "";
    return {
      market,
      slug: page.slug,
      name: page.cityLabel,
      path: page.path,
      title: page.title,
      heroTitle: page.heroTitle,
      description: page.description,
      contentHtml: page.contentHtml,
      imageUrl: page.image?.url ?? leadImage(page.contentHtml)?.url ?? null,
      imageAlt: page.image?.alt ?? "",
      creditUrl: page.image?.sourceAttributionUrl ?? null,
      geo: cityGeo(market, page.slug),
      widget: { zip, country: COUNTRY_CODE[market], platformId: PLATFORM_ID },
      searchUrl: page.searchUrl,
      registrationUrl: registrationUrlForContext(market, "location"),
    };
  });
}

const cache = new Map<MarketCode, CityPage[]>();

export function getCityPages(market: MarketCode): CityPage[] {
  if (!cache.has(market)) cache.set(market, market === "de" ? deCities() : regionalCities(market));
  return cache.get(market)!;
}

export function getCityPage(market: MarketCode, slug: string): CityPage | null {
  return getCityPages(market).find((page) => page.slug === slug) ?? null;
}

export function getCityHub(market: MarketCode) {
  const hub = market === "de" ? importedPartnersucheHub : getMarketPartnersucheHub(market);
  return { title: hub.title, heroTitle: hub.heroTitle, description: hub.description, contentHtml: hub.contentHtml };
}

/** Slug aus einem Stadtlink im importierten Text (/partnersuche/graz/, ../graz/, https://…/partnersuche/graz/). */
export function citySlugFromHref(href: string): string | null {
  const match = href.match(/partnersuche\/([a-z0-9-]+)\/?(?:[?#].*)?$/i) ?? href.match(/^\.\.\/([a-z0-9-]+)\/?$/i) ?? href.match(/^([a-z0-9-]+)\/$/i);
  return match ? match[1].toLowerCase() : null;
}
