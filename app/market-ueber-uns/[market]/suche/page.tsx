import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SearchView } from "@/components/info/search-view";
import { SiteShell } from "@/components/site-shell";
import type { RegionalMarket } from "@/lib/market-icony-import";
import { getMarket, isMarketCode, publicUrl } from "@/lib/markets";
import { SEARCH_PATH, searchQuery } from "@/lib/site-search";

type Props = {
  params: Promise<{ market: string }>;
  searchParams: Promise<{ q?: string | string[] }>;
};

function activeMarket(value: string): RegionalMarket {
  if (!isMarketCode(value) || value === "de") notFound();
  return value;
}

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const market = activeMarket((await params).market);
  const config = getMarket(market);

  // Suchergebnisse nicht indexieren, Links aber verfolgen. Nicht in der Sitemap.
  return {
    title: { absolute: `Suche | ${config.domain}` },
    description: `Durchsuche Magazin, Städteseiten und FAQ von ${config.domain}.`,
    robots: { index: false, follow: true },
    alternates: { canonical: publicUrl(market, SEARCH_PATH) },
  };
}

/** Seitensuche der Landesdomains (/ueber-uns/suche/?q= auf .at/.ch), eigene dynamische Route neben den statischen Unterseiten. */
export default async function MarketSearchPage({ params, searchParams }: Props) {
  const market = activeMarket((await params).market);
  const query = searchQuery((await searchParams).q);

  return (
    <SiteShell market={market} registrationContext="location">
      <SearchView market={market} query={query} />
    </SiteShell>
  );
}
