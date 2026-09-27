import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CityPageView } from "@/components/city/city-page";
import { getCityPage, getCityPages } from "@/lib/city-pages";
import { breadcrumbJsonLd, serializeJsonLd } from "@/lib/json-ld";
import { publicUrl } from "@/lib/markets";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getCityPages("de").map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getCityPage("de", slug);

  if (!page) {
    return { title: "Partnersuche | Alleinerziehende-Singles.de" };
  }

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: publicUrl("de", page.path) },
    openGraph: page.imageUrl ? { images: [{ url: page.imageUrl }] } : undefined,
  };
}

export default async function PartnersucheCityPage({ params }: Props) {
  const { slug } = await params;
  const page = getCityPage("de", slug);

  if (!page) {
    notFound();
  }

  const crumbs = breadcrumbJsonLd("de", [
    { name: "Start", path: "/" },
    { name: "Partnersuche", path: "/partnersuche/" },
    { name: page.name, path: page.path },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(crumbs) }} />
      <CityPageView city={page} />
    </>
  );
}
