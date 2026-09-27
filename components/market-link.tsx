"use client";

import NextLink from "next/link";
import { useSyncExternalStore, type ReactNode } from "react";
import { isPreviewHost, previewPath, publicUrl, withTrailingSlash, type MarketCode } from "@/lib/markets";

type Props = { market: MarketCode; path?: string; children: ReactNode; className?: string; "aria-current"?: "page" };

const noSubscribe = () => () => {};

/** true auf localhost und *.vercel.app – dort verlinken wir die Vorschau statt der Live-Domain. */
export function usePreviewHost() {
  return useSyncExternalStore(noSubscribe, () => isPreviewHost(window.location.hostname), () => false);
}

/**
 * Link auf eine Next.js-Seite eines Markts. DE liegt ohne Präfix im Root und nutzt next/link.
 * AT/CH: Im HTML steht die Live-URL (SEO, Landesdomains hinter nginx); auf Vorschau-Hosts zeigt das
 * href nach der Hydration auf den Vercel-Pfad (/at/partnersuche/…), damit Klicks in der Vorschau bleiben.
 */
export function MarketLink({ market, path = "/", children, className, ...rest }: Props) {
  const preview = usePreviewHost();
  if (market === "de") {
    return <NextLink className={className} href={withTrailingSlash(path)} {...rest}>{children}</NextLink>;
  }
  if (preview) return <NextLink className={className} href={previewPath(market, path)} {...rest}>{children}</NextLink>;
  return <a className={className} href={publicUrl(market, path)} {...rest}>{children}</a>;
}
