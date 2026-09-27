import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CityHub } from "@/components/city/city-hub";
import { SiteShell } from "@/components/site-shell";
import { getCityHub } from "@/lib/city-pages";
import type { RegionalMarket } from "@/lib/market-icony-import";
import { isMarketCode, publicUrl } from "@/lib/markets";

type Props = { params: Promise<{ market: string }> };

function activeMarket(value: string): RegionalMarket {
  if (!isMarketCode(value) || value === "de") notFound();
  return value;
}

export function generateStaticParams() {
  return [{ market: "at" }, { market: "ch" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const market = activeMarket((await params).market);
  const page = getCityHub(market);

  return {
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical: publicUrl(market, "/partnersuche/") },
    robots: { index: true, follow: true },
  };
}

export default async function MarketPartnersuchePage({ params }: Props) {
  const market = activeMarket((await params).market);

  return (
    <SiteShell market={market} registrationContext="location">
      <CityHub market={market} />
    </SiteShell>
  );
}
