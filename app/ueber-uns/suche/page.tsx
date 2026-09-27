import type { Metadata } from "next";
import Link from "next/link";
import { AboutSearchForm } from "@/components/about-search-form";
import { getImportedRootPageBySlug, importedCityPages, importedPartnersucheHub } from "@/lib/icony-import";
import { publicUrl } from "@/lib/markets";
import {
  htmlToText,
  MAX_SEARCH_RESULTS,
  SEARCH_PATH,
  searchDocuments,
  shortExcerpt,
  type SearchDocument,
} from "@/lib/site-search";
import { getMagazineSearchIndex, getStaticMagazinePages } from "@/lib/wordpress";
import pageStyles from "../../imported-page.module.css";
import styles from "./page.module.css";

type Props = { searchParams: Promise<{ q?: string | string[] }> };

// Suchergebnisse nicht indexieren, Links aber verfolgen. Nicht in der Sitemap.
export const metadata: Metadata = {
  title: "Suche",
  description: "Durchsuche Magazin, Städteseiten und FAQ von alleinerziehende-singles.de.",
  robots: { index: false, follow: true },
  alternates: { canonical: publicUrl("de", SEARCH_PATH) },
};

const ABOUT_DOCUMENTS: SearchDocument[] = [
  {
    area: "Über uns",
    title: "Über uns",
    href: "/ueber-uns/",
    excerpt: "Hintergründe, offizielle Kanäle und unabhängige Bewertungen von alleinerziehende-singles.de.",
  },
  {
    area: "Über uns",
    title: "Bewertungen & Erfahrungen",
    href: "/ueber-uns/bewertungen/",
    excerpt: "Externe Bewertungen und Erfahrungen mit alleinerziehende-singles.de im Überblick.",
  },
  {
    area: "Über uns",
    title: "Social Media",
    href: "/ueber-uns/social-media/",
    excerpt: "Unsere verifizierten Kanäle für Austausch, Videos und Themen aus dem Alltag Alleinerziehender.",
  },
  {
    area: "Über uns",
    title: "Kooperationen",
    href: "/ueber-uns/kooperationen/",
    excerpt: "Informationen für Medien, Communities, Portale und mögliche Kooperationspartner.",
  },
];

function staticDocuments(): SearchDocument[] {
  const faq = getImportedRootPageBySlug("faq");
  return [
    ...importedCityPages.map((page) => ({
      area: "Stadt",
      title: page.title,
      href: page.path,
      excerpt: page.description,
      text: `${page.cityLabel} ${page.heroTitle} ${htmlToText(page.contentHtml)}`,
    })),
    {
      area: "Partnersuche",
      title: importedPartnersucheHub.title,
      href: importedPartnersucheHub.path,
      excerpt: importedPartnersucheHub.description,
      text: htmlToText(importedPartnersucheHub.contentHtml),
    },
    ...(faq
      ? [{ area: "FAQ", title: faq.title, href: faq.path, excerpt: faq.description, text: htmlToText(faq.contentHtml) }]
      : []),
    ...ABOUT_DOCUMENTS,
  ];
}

async function magazineDocuments(): Promise<SearchDocument[]> {
  // Gecachte WordPress-Liste (Revalidate 300 s); fällt WordPress aus, bleiben die statischen Magazinseiten.
  const entries = await getMagazineSearchIndex().catch(() => getStaticMagazinePages());
  return entries.map((entry) => ({
    area: "Magazin",
    title: htmlToText(entry.titleHtml),
    href: `/magazin/${entry.slug}/`,
    excerpt: htmlToText(entry.excerptHtml),
  }));
}

export default async function AboutSearchPage({ searchParams }: Props) {
  const rawQuery = (await searchParams).q;
  const query = (Array.isArray(rawQuery) ? rawQuery[0] : rawQuery ?? "").trim().slice(0, 100);
  const results = query
    ? searchDocuments([...(await magazineDocuments()), ...staticDocuments()], query, MAX_SEARCH_RESULTS)
    : [];

  return (
    <main className={pageStyles.page}>
      <section className={pageStyles.hero}>
        <p className={pageStyles.eyebrow}>Über uns · Suche</p>
        <h1>{query ? `Suchergebnisse für „${query}“` : "Was suchst Du?"}</h1>
        <p className={pageStyles.lead}>
          Durchsuche unser Magazin, die Städteseiten zur Partnersuche und die häufigen Fragen.
        </p>
        <AboutSearchForm defaultValue={query} autoFocus={!query} />
      </section>

      {query ? (
        <section className={pageStyles.gridSection} aria-live="polite">
          {results.length > 0 ? (
            <>
              <p className={styles.count}>
                {results.length === 1 ? "1 Treffer" : `${results.length} Treffer`}
                {results.length >= MAX_SEARCH_RESULTS ? " – die besten Ergebnisse zuerst" : ""}
              </p>
              <ol className={styles.results}>
                {results.map((result) => (
                  <li key={result.href} className={styles.result}>
                    <span className={styles.area}>{result.area}</span>
                    <h2><Link href={result.href}>{result.title}</Link></h2>
                    {result.excerpt ? <p>{shortExcerpt(result.excerpt)}</p> : null}
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <div className={pageStyles.sectionHeader}>
              <h2>Dazu haben wir leider nichts gefunden</h2>
              <p>
                Probier es mit einem anderen oder kürzeren Suchbegriff, zum Beispiel einer Stadt oder
                einem Thema wie „Kindergeld“. Oder stöbere direkt im Magazin und in der Partnersuche.
              </p>
            </div>
          )}
        </section>
      ) : (
        <section className={pageStyles.gridSection}>
          <div className={pageStyles.sectionHeader}>
            <h2>Tipp</h2>
            <p>
              Gib eine Stadt, ein Thema oder eine Frage ein – etwa „Hamburg“, „Unterhalt“ oder
              „Schwangerschaftswoche“. Umlaute kannst Du auch als ae, oe oder ue schreiben.
            </p>
          </div>
        </section>
      )}

      <section className={pageStyles.ctaCard}>
        <h2>Lieber direkt stöbern?</h2>
        <div className={pageStyles.linkList}>
          <Link href="/magazin/">Zum Magazin</Link>
          <Link href="/partnersuche/">Singles nach Stadt entdecken</Link>
          <Link href="/ueber-uns/">Zurück zu Über uns</Link>
        </div>
      </section>
    </main>
  );
}
