import importData from "@/data/icony-import.json";

const SITE_URL = "https://alleinerziehende-singles.de";

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

const ownedExactPaths = new Set([
  "/",
  "/partnersuche",
  "/partnersuche/",
  "/faq",
  "/faq/",
  "/bewertungen-und-erfahrungen",
  "/bewertungen-und-erfahrungen/",
  "/social-media",
  "/social-media/",
  "/dating-tipps",
  "/dating-tipps/",
  "/unsere-erfolgsgeschichten.html",
  "/videodating.html",
  "/kostenlose-basis-mitgliedschaft.html",
  "/sicherheit-und-datenschutz.html",
  "/redaktionelle-kontrolle.html",
  "/premium-mitgliedschaft.html",
]);

const ownedPathPrefixes = ["/partnersuche/"];

function isOwnedPath(path: string) {
  return ownedExactPaths.has(path) || ownedPathPrefixes.some((prefix) => path.startsWith(prefix));
}

function absolutizeSameDomainFallbackRoutes(html: string) {
  return html.replace(/(href|src)=(['"])(\/[^'"#?][^'"]*)\2/gi, (_match, attr, quote, path) => {
    if (isOwnedPath(path)) {
      return `${attr}=${quote}${path}${quote}`;
    }

    return `${attr}=${quote}${SITE_URL}${path}${quote}`;
  });
}

function normalizeImportedHtml(contentHtml: string) {
  return absolutizeSameDomainFallbackRoutes(contentHtml)
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

export const importedRootPages = data.rootPages.map((page) => preparePage(page));
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
