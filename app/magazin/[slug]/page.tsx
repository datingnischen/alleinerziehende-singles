import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MagazineArticle, articleMetaDescription, articleMetaTitle } from "@/components/magazine/magazine-article";
import { publicUrl } from "@/lib/markets";
import { getMagazineEntryBySlug, getMagazineSlugs } from "@/lib/magazine-content";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getMagazineSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = getMagazineEntryBySlug(slug);

  if (!entry) {
    return {
      title: "Magazin",
    };
  }

  return {
    title: { absolute: articleMetaTitle(entry, "de") },
    description: articleMetaDescription(entry),
    alternates: { canonical: publicUrl("de", `/magazin/${entry.slug}/`) },
    openGraph: entry.featuredImageUrl ? { images: [{ url: entry.featuredImageUrl }], type: "article" } : undefined,
  };
}

// Artikelansicht: components/magazine/magazine-article.tsx (auch für AT/CH, dort mit Canonical auf diese DE-URL).
export default async function MagazineEntryPage({ params }: Props) {
  const { slug } = await params;
  const entry = getMagazineEntryBySlug(slug);

  if (!entry) {
    notFound();
  }

  return <MagazineArticle market="de" entry={entry} />;
}
