import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { FaqPageView } from "@/components/info/faq-page";
import { getFaqData } from "@/lib/faq";
import {
  getImportedRootPageBySlug,
  getPlatformOwnedUrlBySlug,
  importedRootPages,
  isPlatformOwnedSlug,
} from "@/lib/icony-import";
import { publicUrl } from "@/lib/markets";

type Props = {
  params: Promise<{ slug: string }>;
};

function redirectMovedAboutPage(slug: string) {
  if (slug === "social-media") {
    permanentRedirect("/ueber-uns/social-media/");
  }
  if (slug === "bewertungen-und-erfahrungen") {
    permanentRedirect("/ueber-uns/bewertungen/");
  }
}

export async function generateStaticParams() {
  return importedRootPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  if (slug === "social-media" || slug === "bewertungen-und-erfahrungen") {
    return {
      title: "Weiterleitung zu Über uns",
      robots: { index: false, follow: true },
    };
  }

  if (isPlatformOwnedSlug(slug)) {
    return {
      title: "Weiterleitung zur Plattform",
      robots: { index: false, follow: true },
    };
  }

  const page = getImportedRootPageBySlug(slug);

  if (!page) {
    return { title: "Alleinerziehende-Singles.de" };
  }

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: publicUrl("de", page.path) },
  };
}

export default async function ImportedRootPage({ params }: Props) {
  const { slug } = await params;

  redirectMovedAboutPage(slug);

  if (isPlatformOwnedSlug(slug)) {
    const targetUrl = getPlatformOwnedUrlBySlug(slug);
    if (targetUrl) {
      permanentRedirect(targetUrl);
    }
  }

  // Einzige importierte Root-Seite, die Next.js selbst rendert, ist die FAQ.
  const faq = slug === "faq" ? getFaqData() : null;
  if (!faq) {
    notFound();
  }

  return <FaqPageView faq={faq} />;
}
