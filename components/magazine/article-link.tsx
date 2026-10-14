import NextLink from "next/link";
import type { ReactNode } from "react";
import { publicUrl, withTrailingSlash, type MarketCode } from "@/lib/markets";

/**
 * Link auf einen Magazin-Eintrag. Artikel liegen nur auf alleinerziehende-singles.de (kein Duplicate Content):
 * DE verlinkt relativ (next/link), AT/CH absolut auf die DE-Adresse – auch in der Vercel-Vorschau, denn der
 * Artikel existiert dort nur unter dem DE-Pfad.
 */
export function ArticleLink({ market, slug, children, className }: { market: MarketCode; slug: string; children: ReactNode; className?: string }) {
  const path = withTrailingSlash(`/magazin/${slug}`);
  if (market === "de") return <NextLink className={className} href={path}>{children}</NextLink>;
  return <a className={className} href={publicUrl("de", path)}>{children}</a>;
}
