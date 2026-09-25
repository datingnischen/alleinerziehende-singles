import type { NextConfig } from "next";
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

export default function nextConfig(phase: string): NextConfig {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;
  const assetHost = trimTrailingSlash(process.env.NEXT_PUBLIC_ASSET_HOST || DEFAULT_ASSET_HOST);
  const assetPathPrefix = normalizeAssetPathPrefix(
    process.env.NEXT_PUBLIC_ASSET_PATH_PREFIX || DEFAULT_ASSET_PATH_PREFIX,
  );
  const assetPrefix = assetHost ? `${assetHost}${assetPathPrefix}` : assetPathPrefix;

  return {
    assetPrefix: isDev ? undefined : assetPrefix,
    images: {
      path: isDev || !assetHost ? "/_next/image" : `${assetHost}/_next/image`,
      remotePatterns: assetHost
        ? [{ protocol: "https", hostname: new URL(assetHost).hostname, pathname: `${assetPathPrefix}/**` }]
        : [],
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
