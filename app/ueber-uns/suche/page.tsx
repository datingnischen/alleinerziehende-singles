import type { Metadata } from "next";
import { SearchView } from "@/components/info/search-view";
import { publicUrl } from "@/lib/markets";
import { SEARCH_PATH, searchQuery } from "@/lib/site-search";

type Props = { searchParams: Promise<{ q?: string | string[] }> };

// Suchergebnisse nicht indexieren, Links aber verfolgen. Nicht in der Sitemap.
export const metadata: Metadata = {
  title: "Suche",
  description: "Durchsuche Magazin, Städteseiten und FAQ von alleinerziehende-singles.de.",
  robots: { index: false, follow: true },
  alternates: { canonical: publicUrl("de", SEARCH_PATH) },
};

// Suchindex und Ansicht: lib/search-index.ts + components/info/search-view.tsx (auch für AT/CH).
export default async function AboutSearchPage({ searchParams }: Props) {
  const query = searchQuery((await searchParams).q);
  return <SearchView market="de" query={query} />;
}
