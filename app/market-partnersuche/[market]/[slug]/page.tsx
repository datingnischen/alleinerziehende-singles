import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CityPageView } from "@/components/city/city-page";
import { SiteShell } from "@/components/site-shell";
import { getCityPage, getCityPages } from "@/lib/city-pages";
import { breadcrumbJsonLd, serializeJsonLd } from "@/lib/json-ld";
import type { RegionalMarket } from "@/lib/market-icony-import";
import { isMarketCode, publicUrl } from "@/lib/markets";

type Props = { params: Promise<{ market: string; slug: string }> };

function activeMarket(value: string): RegionalMarket {
  if (!isMarketCode(value) || value === "de") notFound();
  return value;
}

export function generateStaticParams() {
  return (["at", "ch"] as const).flatMap((market) =>
    getCityPages(market).map((page) => ({ market, slug: page.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const values = await params;
  const market = activeMarket(values.market);
  const page = getCityPage(market, values.slug);
  if (!page) return { title: { absolute: "Regionale Partnersuche" }, robots: { index: false, follow: false } };

  return {
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical: publicUrl(market, page.path) },
    robots: { index: true, follow: true },
    openGraph: page.imageUrl ? { images: [{ url: page.imageUrl }] } : undefined,
  };
}

export default async function MarketCityPage({ params }: Props) {
  const values = await params;
  const market = activeMarket(values.market);
  const page = getCityPage(market, values.slug);
  if (!page) notFound();

  const crumbs = breadcrumbJsonLd(market, [
    { name: "Start", path: "/" },
    { name: "Partnersuche", path: "/partnersuche/" },
    { name: page.name, path: page.path },
  ]);

  return (
    <SiteShell market={market} registrationContext="location">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(crumbs) }} />
      <CityPageView city={page} />
    </SiteShell>
  );
}
