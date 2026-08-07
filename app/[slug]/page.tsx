import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import {
  getImportedRootPageBySlug,
  getPlatformOwnedUrlBySlug,
  importedRootPages,
  isPlatformOwnedSlug,
} from "@/lib/icony-import";
import styles from "../imported-page.module.css";

type Props = {
  params: Promise<{ slug: string }>;
};

const sidebarRouteOrder = ["partnersuche", "faq"];

function redirectMovedAboutPage(slug: string) {
  if (slug === "social-media") {
    permanentRedirect("/ueber-uns/social-media");
  }
  if (slug === "bewertungen-und-erfahrungen") {
    permanentRedirect("/ueber-uns/bewertungen");
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

  const page = getImportedRootPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const relatedLinks = sidebarRouteOrder
    .filter((item) => item !== slug)
    .map((item) => {
      if (item === "partnersuche") {
        return { href: "/partnersuche", label: "Regionale Partnersuche" };
      }

      const importedPage = getImportedRootPageBySlug(item);
      return importedPage ? { href: `/${importedPage.slug}`, label: importedPage.heroTitle } : null;
    })
    .filter((entry): entry is { href: string; label: string } => entry !== null);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Antworten, Tipps & Orientierung</p>
        <h1>{page.heroTitle}</h1>
        <p className={styles.lead}>{page.description}</p>
      </section>

      <section className={styles.layout}>
        <article className={styles.article}>
          <div dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
        </article>

        <aside className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <h2>Weitere hilfreiche Einstiege</h2>
            <div className={styles.linkList}>
              {relatedLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className={styles.ctaCard}>
            <h2>Direkt ins Kennenlernen starten</h2>
            <p>
              Du willst nicht nur lesen, sondern sofort passende Mütter oder Väter in Deiner Nähe
              kennenlernen? Dann starte direkt mit Deinem Profil.
            </p>
            <a href="https://alleinerziehende-singles.de/registration/" target="_blank" rel="noreferrer">
              Kostenlos registrieren
            </a>
          </div>
        </aside>
      </section>
    </main>
  );
}
