import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MagazineOverview } from "@/components/magazine/magazine-overview";
import { SiteShell } from "@/components/site-shell";
import type { RegionalMarket } from "@/lib/market-icony-import";
import { getMarket, isMarketCode, publicUrl } from "@/lib/markets";

type Props = {
  params: Promise<{ market: string }>;
  searchParams?: Promise<{ thema?: string; seite?: string }>;
};

function activeMarket(value: string): RegionalMarket {
  if (!isMarketCode(value) || value === "de") notFound();
  return value;
}

export function generateStaticParams() {
  return [{ market: "at" }, { market: "ch" }];
}

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const market = activeMarket((await params).market);
  const config = getMarket(market);

  return {
    title: { absolute: `Magazin für Alleinerziehende | ${config.domain}` },
    description: `Magazin für alleinerziehende Mütter und Väter in ${config.countryName}: Dating mit Kind, Familienalltag und Schwangerschaft Woche für Woche – ehrlich und alltagsnah.`,
    alternates: { canonical: publicUrl(market, "/magazin/") },
    robots: { index: true, follow: true },
  };
}

/** Magazin-Übersicht der Landesdomains (/magazin/ auf .at/.ch): gemeinsamer Artikelbestand ohne deutsches Kindergeld. */
export default async function MarketMagazinePage({ params, searchParams }: Props) {
  const market = activeMarket((await params).market);
  const query = searchParams ? await searchParams : {};

  return (
    <SiteShell market={market} registrationContext="magazin">
      <MagazineOverview market={market} thema={query.thema} seite={query.seite} />
    </SiteShell>
  );
}
