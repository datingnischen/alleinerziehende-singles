export const MARKET_CODES = ["de", "at", "ch"] as const;

export type MarketCode = (typeof MARKET_CODES)[number];

export type MarketConfig = {
  code: MarketCode;
  countryName: string;
  domain: string;
  locale: "de-DE" | "de-AT" | "de-CH";
  logoPath: string;
  heroPath: string;
  heading: string;
  registrationLabel: string;
};

const SHARED_HERO_PATH = "/brand/frontpage-visual-alleinerziehende.webp";

const MARKETS: Record<MarketCode, MarketConfig> = {
  de: {
    code: "de",
    countryName: "Deutschland",
    domain: "alleinerziehende-singles.de",
    locale: "de-DE",
    logoPath: "/brand/alleinerziehende-singles-de.svg",
    heroPath: SHARED_HERO_PATH,
    heading: "Die Partnersuche für alleinerziehende Singles",
    registrationLabel: "Kostenlos registrieren",
  },
  at: {
    code: "at",
    countryName: "Österreich",
    domain: "alleinerziehende-singles.at",
    locale: "de-AT",
    logoPath: "/brand/alleinerziehende-singles-at.svg",
    heroPath: SHARED_HERO_PATH,
    heading: "Alleinerziehende Singles in Österreich finden",
    registrationLabel: "Kostenlos registrieren",
  },
  ch: {
    code: "ch",
    countryName: "Schweiz",
    domain: "alleinerziehende-singles.ch",
    locale: "de-CH",
    logoPath: "/brand/alleinerziehende-singles-ch.svg",
    heroPath: SHARED_HERO_PATH,
    heading: "Alleinerziehende Singles in der Schweiz",
    registrationLabel: "Kostenlos registrieren",
  },
};

export function isMarketCode(value: string): value is MarketCode {
  return MARKET_CODES.includes(value as MarketCode);
}

export function getMarket(code: MarketCode): MarketConfig {
  return MARKETS[code];
}

export function publicUrl(market: MarketCode, pathname = "/"): string {
  const normalizedPath = pathname === "/" ? "/" : `/${pathname.replace(/^\/+|\/+$/g, "")}`;
  return `https://${getMarket(market).domain}${normalizedPath}`;
}

export function previewPath(market: MarketCode, pathname = "/"): string {
  const normalizedPath = pathname === "/" ? "" : `/${pathname.replace(/^\/+|\/+$/g, "")}`;
  return `/${market}${normalizedPath}`;
}

type MarketRequestResolution =
  | { action: "pass" }
  | { action: "not-found" }
  | { action: "redirect-platform"; market: "at" | "ch"; url: string }
  | { action: "rewrite"; market: "de"; pathname: string }
  | { action: "market-home"; market: "at" | "ch"; pathname: string }
  | { action: "market-partnersuche"; market: "at" | "ch"; pathname: string }
  | {
      action: "market-partnersuche-city";
      market: "at" | "ch";
      pathname: string;
      slug: string;
    }
  | { action: "market-robots"; market: "at" | "ch"; pathname: string }
  | { action: "market-sitemap"; market: "at" | "ch"; pathname: string }
  | {
      action: "placeholder";
      market: "at" | "ch";
      pathname: string;
      requestedPath: string;
    };

const PASS_PATHS = new Set(["/favicon.ico"]);
const PASS_PREFIXES = ["/_next/", "/app-assets/", "/brand/", "/api/"];
const STATIC_FILE_PATTERN = /\.(?:avif|css|gif|ico|jpe?g|js|json|map|png|svg|webp|woff2?)$/i;
const INTERNAL_PATH_PATTERN = /^\/market-(?:home|placeholder|partnersuche|robots|sitemap)(?:\/|$)/;
const PLATFORM_PATH_PATTERN =
  /^\/(?:login|registration|faq|hilfe|kontakt|suche|gutschein)(?:\/|$)|^\/(?:sicherheit-und-datenschutz|redaktionelle-kontrolle|kostenlose-basis-mitgliedschaft|fragenflirt|fotoflirt|videodate|videodating|unsere-erfolgsgeschichten|premium-mitgliedschaft|datenschutz|impressum|agb|barrierefreiheit)\.html\/?$/;
const AUTH_PLATFORM_PATH_PATTERN = /^\/(?:login|registration)(?:\/|$)/;

function shouldPass(pathname: string): boolean {
  return (
    PASS_PATHS.has(pathname) ||
    PASS_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    STATIC_FILE_PATTERN.test(pathname)
  );
}

function marketForHostname(hostname = ""): MarketCode | null {
  const normalizedHostname = hostname.toLowerCase().replace(/:\d+$/, "");
  return MARKET_CODES.find((market) => getMarket(market).domain === normalizedHostname) ?? null;
}

function resolveRegionalMarket(
  market: "at" | "ch",
  requestedPath: string,
  productionHost: boolean,
): MarketRequestResolution {
  if (INTERNAL_PATH_PATTERN.test(requestedPath)) {
    return { action: "not-found" };
  }

  if (requestedPath === "/" || requestedPath === "") {
    return { action: "market-home", market, pathname: `/market-home/${market}` };
  }

  if (productionHost && PLATFORM_PATH_PATTERN.test(requestedPath)) {
    return {
      action: "placeholder",
      market,
      pathname: `/market-placeholder/${market}`,
      requestedPath,
    };
  }

  if (AUTH_PLATFORM_PATH_PATTERN.test(requestedPath)) {
    return { action: "redirect-platform", market, url: publicUrl(market, requestedPath) };
  }

  if (PLATFORM_PATH_PATTERN.test(requestedPath)) {
    return { action: "redirect-platform", market, url: publicUrl(market, requestedPath) };
  }

  const contentPath = requestedPath.length > 1 ? requestedPath.replace(/\/+$/, "") : requestedPath;
  if (contentPath === "/partnersuche") {
    return { action: "market-partnersuche", market, pathname: `/market-partnersuche/${market}` };
  }

  const cityMatch = contentPath.match(/^\/partnersuche\/([a-z0-9-]+)$/);
  if (cityMatch) {
    const slug = cityMatch[1];
    return {
      action: "market-partnersuche-city",
      market,
      pathname: `/market-partnersuche/${market}/${slug}`,
      slug,
    };
  }

  if (requestedPath === "/robots.txt") {
    return { action: "market-robots", market, pathname: `/market-robots/${market}` };
  }

  if (requestedPath === "/sitemap.xml") {
    return { action: "market-sitemap", market, pathname: `/market-sitemap/${market}` };
  }

  return {
    action: "placeholder",
    market,
    pathname: `/market-placeholder/${market}`,
    requestedPath,
  };
}

export function resolveMarketRequest(pathname: string, hostname = ""): MarketRequestResolution {
  const normalizedPathname = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (shouldPass(normalizedPathname)) return { action: "pass" };
  if (INTERNAL_PATH_PATTERN.test(normalizedPathname)) return { action: "not-found" };

  const hostMarket = marketForHostname(hostname);
  if (hostMarket) {
    const prefixedPath = normalizedPathname.match(/^\/(?:de|at|ch)(\/.*)?$/);
    const hostPath = prefixedPath ? prefixedPath[1] || "/" : normalizedPathname;

    if (hostMarket === "de") {
      return { action: "rewrite", market: "de", pathname: hostPath };
    }

    return resolveRegionalMarket(hostMarket, hostPath, true);
  }

  const marketMatch = normalizedPathname.match(/^\/(de|at|ch)(\/.*)?$/);
  if (!marketMatch) {
    return { action: "rewrite", market: "de", pathname: normalizedPathname };
  }

  const market = marketMatch[1] as MarketCode;
  const requestedPath = marketMatch[2] || "/";

  if (INTERNAL_PATH_PATTERN.test(requestedPath)) {
    return { action: "not-found" };
  }

  if (market === "de") {
    return { action: "rewrite", market, pathname: requestedPath };
  }

  return resolveRegionalMarket(market, requestedPath, false);
}
