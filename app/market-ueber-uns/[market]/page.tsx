import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutHub } from "@/components/info/about-views";
import { SiteShell } from "@/components/site-shell";
import { getReviewsData, getSocialData } from "@/lib/about";
import type { RegionalMarket } from "@/lib/market-icony-import";
import { getMarket, isMarketCode, publicUrl } from "@/lib/markets";

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
  const config = getMarket(market);

  return {
    title: { absolute: `Über uns | ${config.domain}` },
    description: `Erfahre mehr über ${config.domain}, unsere Social-Media-Kanäle, Bewertungen und Kooperationsmöglichkeiten für Alleinerziehende in ${config.countryName}.`,
    alternates: { canonical: publicUrl(market, "/ueber-uns/") },
    robots: { index: true, follow: true },
  };
}

/** Über uns der Landesdomains (/ueber-uns/ auf .at/.ch) inkl. Seitensuche im Hub. */
export default async function MarketAboutPage({ params }: Props) {
  const market = activeMarket((await params).market);

  return (
    <SiteShell market={market} registrationContext="location">
      <AboutHub market={market} reviews={getReviewsData()} social={getSocialData()} />
    </SiteShell>
  );
}
