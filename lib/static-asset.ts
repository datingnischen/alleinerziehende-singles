// nginx vor den Live-Domains reicht nur Seitenrouten weiter, Assets kommen vom Vercel-Host.
const DEFAULT_ASSET_HOST = "https://alleinerziehende-singles.vercel.app";
const DEFAULT_ASSET_PATH_PREFIX = "/app-assets";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function normalizeAssetPathPrefix(value: string) {
  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  const trimmed = trimTrailingSlash(withLeadingSlash);
  return trimmed || DEFAULT_ASSET_PATH_PREFIX;
}

export const assetHost = trimTrailingSlash(
  process.env.NEXT_PUBLIC_ASSET_HOST || DEFAULT_ASSET_HOST,
);

export const assetPathPrefix = normalizeAssetPathPrefix(
  process.env.NEXT_PUBLIC_ASSET_PATH_PREFIX || DEFAULT_ASSET_PATH_PREFIX,
);

export const assetBaseUrl = assetHost
  ? `${assetHost}${assetPathPrefix}`
  : assetPathPrefix;

export function staticAsset(path: string) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  return `${assetBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Bilder aus dem ICONY-CMS liegen als Kopie im Repo (public/city-images, public/site-images; Herkunft in
 * data/icony-bilder.json). Die Importdaten führen sie als Root-Pfad, ausgeliefert werden sie vom Asset-Host.
 */
const LOCAL_IMAGE_SRC = /\bsrc=(['"])(\/(?:city-images|site-images)\/[^'"]+)\1/gi;

export function assetifyLocalImages(html: string) {
  return html.replace(LOCAL_IMAGE_SRC, (_match, quote: string, path: string) => `src=${quote}${staticAsset(path)}${quote}`);
}
