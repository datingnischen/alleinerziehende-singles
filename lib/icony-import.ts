import importData from "@/data/icony-import.json";

export const SITE_URL = "https://alleinerziehende-singles.de";

export type ImportedPage = {
  slug: string;
  path: string;
  sourceUrl: string;
  title: string;
  description: string;
  heroTitle: string;
  contentHtml: string;
};

export type ImportedCityPage = ImportedPage & {
  cityLabel: string;
};

type ImportedData = {
  generatedAt: string;
  site: string;
  partnersucheHub: ImportedPage;
  cityPages: ImportedCityPage[];
  rootPages: ImportedPage[];
};

const data = importData as ImportedData;

const platformOwnedPageSlugs = [
  "dating-tipps",
  "unsere-erfolgsgeschichten.html",
  "videodating.html",
  "kostenlose-basis-mitgliedschaft.html",
  "sicherheit-und-datenschutz.html",
  "redaktionelle-kontrolle.html",
  "premium-mitgliedschaft.html",
] as const;

const appOwnedExactPaths = new Set([
  "/",
  "/partnersuche",
  "/partnersuche/",
  "/faq",
  "/faq/",
  "/bewertungen-und-erfahrungen",
  "/bewertungen-und-erfahrungen/",
  "/social-media",
  "/social-media/",
]);

const appOwnedPathPrefixes = ["/partnersuche/"];

const platformOwnedPaths = new Map<string, string>(
  platformOwnedPageSlugs.map((slug) => [`/${slug}`, `${SITE_URL}/${slug}`]),
);

function isAppOwnedPath(path: string) {
  return appOwnedExactPaths.has(path) || appOwnedPathPrefixes.some((prefix) => path.startsWith(prefix));
}

function absolutizePlatformFallbackRoutes(html: string) {
  return html.replace(/(href|src)=(['"])(\/[^'"#?][^'"]*)\2/gi, (_match, attr, quote, path) => {
    if (isAppOwnedPath(path)) {
      return `${attr}=${quote}${path}${quote}`;
    }

    const platformUrl = platformOwnedPaths.get(path);
    if (platformUrl) {
      return `${attr}=${quote}${platformUrl}${quote}`;
    }

    return `${attr}=${quote}${SITE_URL}${path}${quote}`;
  });
}

function normalizeImportedHtml(contentHtml: string) {
  return absolutizePlatformFallbackRoutes(contentHtml)
    .replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi, "")
    .replace(/<p>\s*(?:&nbsp;|&#160;|\s)*\s*<\/p>/gi, "")
    .trim();
}

function preparePage<T extends ImportedPage>(page: T): T {
  return {
    ...page,
    contentHtml: normalizeImportedHtml(page.contentHtml),
  };
}

export const platformOwnedSlugs = new Set<string>(platformOwnedPageSlugs);

export function isPlatformOwnedSlug(slug: string) {
  return platformOwnedSlugs.has(slug);
}

export function getPlatformOwnedUrlBySlug(slug: string) {
  return platformOwnedPaths.get(`/${slug}`) ?? null;
}

export const importedRootPages = data.rootPages
  .filter((page) => !platformOwnedSlugs.has(page.slug))
  .map((page) => preparePage(page));

export const importedCityPages = data.cityPages.map((page) => preparePage(page));
export const importedPartnersucheHub = preparePage(data.partnersucheHub);
export const importGeneratedAt = data.generatedAt;

export function getImportedRootPageBySlug(slug: string) {
  const page = importedRootPages.find((entry) => entry.slug === slug);
  return page ?? null;
}

export function getImportedCityPageBySlug(slug: string) {
  const page = importedCityPages.find((entry) => entry.slug === slug);
  return page ?? null;
}
