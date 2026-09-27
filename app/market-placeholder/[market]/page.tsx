import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NotFoundView } from "@/components/not-found-view";
import { SiteShell } from "@/components/site-shell";
import { getMarket, isMarketCode } from "@/lib/markets";

type PageProps = {
  params: Promise<{ market: string }>;
  searchParams: Promise<{ requestedPath?: string }>;
};

function unavailableRouteMarket(value: string): "at" | "ch" {
  if (!isMarketCode(value) || value === "de") notFound();
  return value;
}

export async function generateMetadata({ params }: Pick<PageProps, "params">): Promise<Metadata> {
  const market = unavailableRouteMarket((await params).market);
  const config = getMarket(market);

  return {
    title: { absolute: `Seite nicht gefunden | ${config.domain}` },
    description: `Diese Seite gibt es auf ${config.domain} nicht. Hier geht es weiter zur Partnersuche für Alleinerziehende.`,
    robots: { index: false, follow: false },
  };
}

export default async function MarketPlaceholderPage({ params, searchParams }: PageProps) {
  const market = unavailableRouteMarket((await params).market);
  const requestedPath = (await searchParams).requestedPath || undefined;

  return (
    <SiteShell market={market} registrationContext="location">
      <NotFoundView market={market} requestedPath={requestedPath} />
    </SiteShell>
  );
}
