import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CooperationView, ReviewsView, SocialView } from "@/components/info/about-views";
import { SiteShell } from "@/components/site-shell";
import { getReviewsData, getSocialData } from "@/lib/about";
import { getImportedRootPageBySlug } from "@/lib/icony-import";
import type { RegionalMarket } from "@/lib/market-icony-import";
import { getMarket, isMarketCode, publicUrl } from "@/lib/markets";

type Props = {
  params: Promise<{ market: string; slug: string }>;
};
type AboutSlug = "social-media" | "bewertungen" | "kooperationen";

function activeMarket(value: string): RegionalMarket {
  if (!isMarketCode(value) || value === "de") notFound();
  return value;
}

function isAboutSlug(value: string): value is AboutSlug {
  return value === "social-media" || value === "bewertungen" || value === "kooperationen";
}

export function generateStaticParams() {
  return (["at", "ch"] as const).flatMap((market) =>
    (["social-media", "bewertungen", "kooperationen"] as const).map((slug) => ({ market, slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { market: marketValue, slug } = await params;
  const market = activeMarket(marketValue);
  if (!isAboutSlug(slug)) return {};
  const config = getMarket(market);

  // Bewertungen und Social Media sind ICONY-Seiten der DE-Domain, Kooperationen gelten projektweit:
  // kanonisch bleibt die DE-Adresse, die Landesdomain zeigt denselben Inhalt mit eigener Navigation.
  const imported = slug === "social-media" ? getImportedRootPageBySlug("social-media") : slug === "bewertungen" ? getImportedRootPageBySlug("bewertungen-und-erfahrungen") : null;
  const title = imported?.title ?? `Kooperationen mit ${config.domain}`;
  const description =
    imported?.description ??
    `Kooperationsmöglichkeiten für Portale, Medien, Communities und Projekte rund um Alleinerziehende, Dating und Partnersuche in ${config.countryName}.`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: publicUrl("de", `/ueber-uns/${slug}/`) },
    robots: { index: true, follow: true },
  };
}

/** Unterseiten von Über uns auf den Landesdomains: Bewertungen, Social Media, Kooperationen (Suche: ./suche, dynamisch). */
export default async function MarketAboutDetailPage({ params }: Props) {
  const { market: marketValue, slug } = await params;
  const market = activeMarket(marketValue);
  if (!isAboutSlug(slug)) notFound();

  let view: React.ReactNode;
  if (slug === "bewertungen") {
    const reviews = getReviewsData();
    if (!reviews) notFound();
    view = <ReviewsView market={market} reviews={reviews} />;
  } else if (slug === "social-media") {
    const social = getSocialData();
    if (!social) notFound();
    view = <SocialView market={market} social={social} />;
  } else {
    view = <CooperationView market={market} />;
  }

  return (
    <SiteShell market={market} registrationContext="location">
      {view}
    </SiteShell>
  );
}
