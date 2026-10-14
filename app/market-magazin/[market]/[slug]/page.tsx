import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MagazineArticle, articleMetaDescription, articleMetaTitle } from "@/components/magazine/magazine-article";
import { SiteShell } from "@/components/site-shell";
import { getMagazineEntryBySlug } from "@/lib/magazine-content";
import { entryAvailableInMarket, marketMagazineSlugs } from "@/lib/magazine-market";
import type { RegionalMarket } from "@/lib/market-icony-import";
import { isMarketCode, publicUrl } from "@/lib/markets";

type Props = {
  params: Promise<{ market: string; slug: string }>;
};

function activeMarket(value: string): RegionalMarket {
  if (!isMarketCode(value) || value === "de") notFound();
  return value;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return (["at", "ch"] as const).flatMap((market) => marketMagazineSlugs(market).map((slug) => ({ market, slug })));
}

function marketEntry(market: RegionalMarket, slug: string) {
  const entry = getMagazineEntryBySlug(slug);
  return entry && entryAvailableInMarket(market, entry) ? entry : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { market: marketValue, slug } = await params;
  const market = activeMarket(marketValue);
  const entry = marketEntry(market, slug);

  if (!entry) {
    return { title: "Magazin" };
  }

  return {
    title: { absolute: articleMetaTitle(entry, market) },
    description: articleMetaDescription(entry),
    // Gleicher Text wie auf .de: die deutsche URL ist die kanonische Adresse.
    alternates: { canonical: publicUrl("de", `/magazin/${entry.slug}/`) },
    openGraph: entry.featuredImageUrl ? { images: [{ url: entry.featuredImageUrl }], type: "article" } : undefined,
  };
}

/** Artikel auf den Landesdomains (/magazin/<slug>/ auf .at/.ch), Kindergeld-Inhalte nur auf .de. */
export default async function MarketMagazineEntryPage({ params }: Props) {
  const { market: marketValue, slug } = await params;
  const market = activeMarket(marketValue);
  const entry = marketEntry(market, slug);

  if (!entry) {
    notFound();
  }

  return (
    <SiteShell market={market} registrationContext="magazin">
      <MagazineArticle market={market} entry={entry} />
    </SiteShell>
  );
}
