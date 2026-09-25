import atImport from "../data/icony-import-at.json" with { type: "json" };
import chImport from "../data/icony-import-ch.json" with { type: "json" };
import { buildCitySearchUrl } from "./city-search-postcodes.mjs";
import { withTrailingSlash } from "#markets";

export type RegionalMarket = "at" | "ch";

export type MarketImportedPage = {
  slug: string;
  path: string;
  sourceUrl: string;
  title: string;
  description: string;
  heroTitle: string;
  contentHtml: string;
  image?: {
    url: string;
    alt: string;
    mediaId?: string;
    sourceAttributionUrl?: string;
  };
};

export type MarketImportedCityPage = MarketImportedPage & {
  cityLabel: string;
  searchUrl: string;
  icony: {
    locationId: string;
    locationValue: string;
    frameId: string;
    frameUrl: string;
  };
};

type RawCityPage = MarketImportedPage & {
  cityLabel: string;
  icony?: MarketImportedCityPage["icony"];
  iconyLocationId?: string;
  iconyLocationValue?: string;
  iconyFrameId?: string;
  iconyFrameUrl?: string;
};

type RawMarketImport = {
  market: RegionalMarket;
  site: string;
  partnersucheHub: MarketImportedPage;
  cityPages: RawCityPage[];
};

const rawImports = {
  at: atImport as RawMarketImport,
  ch: chImport as RawMarketImport,
} as const;

function relativeHubCityLinks(html: string, site: string) {
  const escapedSite = site.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return html
    .replace(
      new RegExp(`href=(['"])${escapedSite}/partnersuche/([a-z0-9-]+)/?\\1`, "gi"),
      (_match, quote, slug) => `href=${quote}${slug}/${quote}`,
    )
    .replace(
      /href=(['"])\/partnersuche\/([a-z0-9-]+)\/?\1/gi,
      (_match, quote, slug) => `href=${quote}${slug}/${quote}`,
    );
}

function relativeDetailCityLinks(html: string, site: string) {
  const escapedSite = site.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return html
    .replace(
      new RegExp(`href=(['"])${escapedSite}/partnersuche/([a-z0-9-]+)/?\\1`, "gi"),
      (_match, quote, slug) => `href=${quote}../${slug}/${quote}`,
    )
    .replace(
      new RegExp(`href=(['"])${escapedSite}/partnersuche/?\\1`, "gi"),
      (_match, quote) => `href=${quote}../${quote}`,
    )
    .replace(
      /href=(['"])\/partnersuche\/([a-z0-9-]+)\/?\1/gi,
      (_match, quote, slug) => `href=${quote}../${slug}/${quote}`,
    )
    .replace(/href=(['"])\/partnersuche\/?\1/gi, (_match, quote) => `href=${quote}../${quote}`);
}

function normalizeHtml(html: string, site: string, hub = false, cityDetail = false) {
  const marketHtml = html.replace(
    /https?:\/\/(?:www\.)?christlich-verliebt\.at(?=\/partnersuche(?:\/|["']))/gi,
    site,
  );
  const linkedHtml = hub
    ? relativeHubCityLinks(marketHtml, site)
    : cityDetail
      ? relativeDetailCityLinks(marketHtml, site)
      : marketHtml;

  return linkedHtml
    .replace(/<(script|iframe|form|button|input)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<\/?(?:script|iframe|form|button|input)\b[^>]*\/?>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s+(?:href|src)\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*'|javascript:[^\s>]+)/gi, "")

    .replace(/<h([2-6])([^>]*)>\s*(<img\b[^>]*\/?>)\s*([\s\S]*?)<\/h\1>/gi, (_match, level, attributes, image, heading) => {
      const trimmedHeading = heading.trim();
      return `<p>${image}</p>${trimmedHeading ? `<h${level}${attributes}>${trimmedHeading}</h${level}>` : ""}`;
    })
    .replace(/<h[2-6]\b[^>]*>\s*(?:&nbsp;|&#160;|\s)*\s*<\/h[2-6]>/gi, "")
    .replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi, "")
    .replace(/<p>\s*(?:&nbsp;|&#160;|\s)*\s*<\/p>/gi, "")
    .replace(/href=(['"])(\/[^'"#?]*)\1/gi, (_match, quote, path) => {
      return `href=${quote}${site}${withTrailingSlash(`/${path.replace(/^\/+/, "")}`)}${quote}`;
    })
    .trim();
}

function preparePage<T extends MarketImportedPage>(page: T, site: string, hub = false, cityDetail = false): T {
  return { ...page, contentHtml: normalizeHtml(page.contentHtml, site, hub, cityDetail) };
}

export function validateMarketCityIdentity(
  market: RegionalMarket,
  sourceMarket: RegionalMarket,
  site: string,
  locationValue: string,
  frameUrl: string,
) {
  const expectedSite = `https://alleinerziehende-singles.${market}`;
  const expectedCountry = market === "at" ? "AT" : "CH";
  const expectedCtr = market === "at" ? "43" : "41";
  if (sourceMarket !== market || site !== expectedSite) {
    throw new Error(`Invalid market identity for ${market}`);
  }
  const postcode = locationValue.match(new RegExp(`^(\\d{4}),\\s*[^,]+,\\s*${expectedCountry}$`))?.[1];
  if (!/^https:\/\/js\.icony\.com\/frame\/\?/.test(frameUrl)) {
    throw new Error(`Invalid market location for ${market}`);
  }
  let frame: URL;
  try {
    frame = new URL(frameUrl);
  } catch {
    throw new Error(`Invalid market location for ${market}`);
  }
  const framePostcodes = frame.searchParams.getAll("z");
  const frameCountries = frame.searchParams.getAll("ctr");
  if (
    !postcode ||
    frame.hash ||
    framePostcodes.length !== 1 ||
    framePostcodes[0] !== postcode ||
    frameCountries.length !== 1 ||
    frameCountries[0] !== expectedCtr
  ) {
    throw new Error(`Invalid market location for ${market}`);
  }
  return postcode;
}

function normalizeCity(page: RawCityPage, site: string, market: RegionalMarket, sourceMarket: RegionalMarket): MarketImportedCityPage {
  const icony = page.icony ?? {
    locationId: page.iconyLocationId ?? "",
    locationValue: page.iconyLocationValue ?? "",
    frameId: page.iconyFrameId ?? "",
    frameUrl: page.iconyFrameUrl ?? "",
  };

  if (!icony.locationId || !icony.locationValue || !icony.frameId || !icony.frameUrl) {
    throw new Error(`Incomplete ICONY configuration for ${page.slug}`);
  }

  validateMarketCityIdentity(market, sourceMarket, site, icony.locationValue, icony.frameUrl);
  const searchUrl = buildCitySearchUrl(market, page.slug);

  return preparePage({
    slug: page.slug,
    path: page.path,
    sourceUrl: page.sourceUrl,
    title: page.title,
    description: page.description,
    heroTitle: page.heroTitle,
    contentHtml: page.contentHtml,
    image: page.image,
    cityLabel: page.cityLabel,
    searchUrl,
    icony,
  }, site, false, true);
}

const imports = Object.fromEntries(
  Object.entries(rawImports).map(([market, data]) => [
    market,
    {
      hub: preparePage(data.partnersucheHub, data.site, true),
      cities: data.cityPages.map((page) => normalizeCity(page, data.site, market as RegionalMarket, data.market)),
    },
  ]),
) as Record<RegionalMarket, { hub: MarketImportedPage; cities: MarketImportedCityPage[] }>;

export function getMarketPartnersucheHub(market: RegionalMarket) {
  return imports[market].hub;
}

export function getMarketCityPages(market: RegionalMarket) {
  return imports[market].cities;
}

export function getMarketCityPage(market: RegionalMarket, slug: string) {
  return imports[market].cities.find((page) => page.slug === slug) ?? null;
}
