import type { NextConfig } from "next";
import { readFileSync } from "node:fs";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

// nginx vor den Live-Domains reicht nur Seitenrouten weiter: /_next/*, /_next/image und public/
// liefert der Vercel-Host aus. Überschreibbar per NEXT_PUBLIC_ASSET_HOST.
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

// Alte WordPress-Pfade des Magazins (data/weiterleitungen.json, vom Import geschrieben)
const WEITERLEITUNGEN = JSON.parse(readFileSync(new URL("./data/weiterleitungen.json", import.meta.url), "utf8")) as {
  slugs: Record<string, string>;
  archive: Record<string, string>;
};

export default function nextConfig(phase: string): NextConfig {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;
  const assetHost = trimTrailingSlash(process.env.NEXT_PUBLIC_ASSET_HOST || DEFAULT_ASSET_HOST);
  const assetPathPrefix = normalizeAssetPathPrefix(
    process.env.NEXT_PUBLIC_ASSET_PATH_PREFIX || DEFAULT_ASSET_PATH_PREFIX,
  );
  const assetPrefix = assetHost ? `${assetHost}${assetPathPrefix}` : assetPathPrefix;

  return {
    // Seitenpfade enden auf "/" (wie ICONY /login/). Die Umleitung macht proxy.ts, weil nur dort der
    // interne Marktpräfix (/at/..., /ch/..., /de/...) bekannt ist.
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
    assetPrefix: isDev ? undefined : assetPrefix,
    images: {
      path: isDev || !assetHost ? "/_next/image" : `${assetHost}/_next/image`,
      remotePatterns: assetHost
        ? [{ protocol: "https", hostname: new URL(assetHost).hostname, pathname: `${assetPathPrefix}/**` }]
        : [],
    },
    // Das Magazin liest content/magazin zur Laufzeit (seitenweise Listen, Suche): Dateien in die Functions packen.
    outputFileTracingIncludes: {
      "/": ["./content/magazin/**/*", "./data/magazin-kategorien.json"],
      "/magazin": ["./content/magazin/**/*", "./data/magazin-kategorien.json"],
      "/magazin/[slug]": ["./content/magazin/**/*", "./data/magazin-kategorien.json"],
      "/ueber-uns/suche": ["./content/magazin/**/*", "./data/magazin-kategorien.json"],
    },
    async redirects() {
      return [
        ...Object.entries(WEITERLEITUNGEN.slugs).map(([alt, neu]) => ({
          source: `/magazin/${alt}/`,
          destination: `/magazin/${neu}/`,
          permanent: true,
        })),
        // WordPress-Archive: Kategorien sind die Themenwelten, alles andere geht auf die Übersicht
        { source: "/magazin/category/:slug(kindergeld|singleboersen|singleleben)/", destination: "/magazin/?thema=:slug", permanent: true },
        { source: "/magazin/category/:path*", destination: "/magazin/", permanent: true },
        { source: "/magazin/tag/:path*", destination: "/magazin/", permanent: true },
        { source: "/magazin/page/:n(\\d+)/", destination: "/magazin/", permanent: true },
        { source: "/magazin/author/:path*", destination: "/ueber-uns/", permanent: true },
        { source: "/magazin/feed/", destination: "/magazin/", permanent: true },
        { source: "/magazin/comments/feed/", destination: "/magazin/", permanent: true },
        { source: "/magazin/:slug/feed/", destination: "/magazin/:slug/", permanent: true },
        { source: "/magazin/wp-sitemap.xml", destination: "/sitemap.xml", permanent: true },
        { source: "/magazin/sitemap.xml", destination: "/sitemap.xml", permanent: true },
        { source: "/magazin/wp-login.php", destination: "/magazin/", permanent: true },
        { source: "/magazin/wp-admin/:path*", destination: "/magazin/", permanent: true },
        ...Object.entries(WEITERLEITUNGEN.archive).map(([alt, neu]) => ({ source: alt, destination: neu, permanent: true })),
      ];
    },
    async rewrites() {
      return [
        {
          source: `${assetPathPrefix}/:path*`,
          destination: "/:path*",
        },
      ];
    },
  };
}
