import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CooperationView, ReviewsView, SocialView } from "@/components/info/about-views";
import { getReviewsData, getSocialData } from "@/lib/about";
import { getImportedRootPageBySlug } from "@/lib/icony-import";

type Props = { params: Promise<{ slug: string }> };
type AboutSlug = "social-media" | "bewertungen" | "kooperationen";

function isAboutSlug(value: string): value is AboutSlug {
  return value === "social-media" || value === "bewertungen" || value === "kooperationen";
}

// Importierte ICONY-Seiten, die unter Über uns liegen
function importedPage(slug: AboutSlug) {
  if (slug === "social-media") return getImportedRootPageBySlug("social-media");
  if (slug === "bewertungen") return getImportedRootPageBySlug("bewertungen-und-erfahrungen");
  return null;
}

export function generateStaticParams() {
  return [{ slug: "social-media" }, { slug: "bewertungen" }, { slug: "kooperationen" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isAboutSlug(slug)) return {};

  const imported = importedPage(slug);
  const title = imported?.title ?? "Kooperationen mit alleinerziehende-singles.de";
  const description =
    imported?.description ??
    "Kooperationsmöglichkeiten für Portale, Medien, Communities und Projekte rund um Alleinerziehende, Dating und Partnersuche.";

  return {
    title,
    description,
    alternates: { canonical: `https://alleinerziehende-singles.de/ueber-uns/${slug}/` },
  };
}

export default async function AboutDetailPage({ params }: Props) {
  const { slug } = await params;
  if (!isAboutSlug(slug)) notFound();

  if (slug === "bewertungen") {
    const reviews = getReviewsData();
    if (!reviews) notFound();
    return <ReviewsView reviews={reviews} />;
  }

  if (slug === "social-media") {
    const social = getSocialData();
    if (!social) notFound();
    return <SocialView social={social} />;
  }

  // Kooperationsanfragen an christian@datingnischen.de (CooperationView)
  return <CooperationView />;
}
