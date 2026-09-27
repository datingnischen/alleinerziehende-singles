import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomePage } from "@/components/home/home-page";
import { SiteShell } from "@/components/site-shell";
import { isMarketCode, publicUrl } from "@/lib/markets";
import { getHomeContent } from "@/lib/startseite";

type PageProps = { params: Promise<{ market: string }> };

function activeMarket(value: string): "at" | "ch" {
  if (!isMarketCode(value) || value === "de") notFound();
  return value;
}

export function generateStaticParams() {
  return [{ market: "at" }, { market: "ch" }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const market = activeMarket((await params).market);
  const content = getHomeContent(market);

  return {
    title: { absolute: content.title },
    description: content.description,
    alternates: { canonical: publicUrl(market) },
    robots: { index: true, follow: true },
  };
}

export default async function MarketHomePage({ params }: PageProps) {
  const market = activeMarket((await params).market);

  return (
    <SiteShell market={market} registrationContext="location">
      <HomePage market={market} />
    </SiteShell>
  );
}
