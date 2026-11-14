import type { Metadata } from "next";
import { AUTHOR_META_DESCRIPTION, AUTHOR_META_TITLE, AUTHOR_URL, AuthorPage } from "@/components/magazine/author-page";

export const metadata: Metadata = {
  title: { absolute: `${AUTHOR_META_TITLE} | Alleinerziehende-Singles.de` },
  description: AUTHOR_META_DESCRIPTION,
  alternates: { canonical: AUTHOR_URL },
};

// Autorenseite des Magazins: components/magazine/author-page.tsx. Nur DE, wie die Artikel selbst.
export default function MagazineAuthorPage() {
  return <AuthorPage />;
}
