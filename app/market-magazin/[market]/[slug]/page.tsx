import { notFound, permanentRedirect } from "next/navigation";
import { getMagazineEntryBySlug } from "@/lib/magazine-content";
import type { RegionalMarket } from "@/lib/market-icony-import";
import { isMarketCode, publicUrl } from "@/lib/markets";

type Props = {
  params: Promise<{ market: string; slug: string }>;
};

function activeMarket(value: string): RegionalMarket {
  if (!isMarketCode(value) || value === "de") notFound();
  return value;
}

/**
 * Artikel gibt es nur einmal, auf alleinerziehende-singles.de (kein Duplicate Content auf .at/.ch, Christian
 * 2026-10-14). Die Landesdomains zeigen Übersicht und Teaser und verlinken den DE-Artikel; alte oder geratene
 * Adressen /magazin/<slug>/ auf .at/.ch landen per 308 dort.
 */
export default async function MarketMagazineEntryPage({ params }: Props) {
  const { market: marketValue, slug } = await params;
  activeMarket(marketValue);
  if (!getMagazineEntryBySlug(slug)) notFound();
  permanentRedirect(publicUrl("de", `/magazin/${slug}/`));
}
