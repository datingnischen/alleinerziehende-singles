import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon, BookIcon, PinIcon, QuestionIcon, SearchIcon } from "@/components/icons";
import { AboutSubnav } from "@/components/info/about-views";
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
import "@/components/info/info.css";

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
    <main className="aei aea">
      <section className="aei-hero">
        <div className="ae-wrap aei-hero-grid aei-hero-solo">
          <div>
            <nav className="aei-crumbs" aria-label="Brotkrumen">
              <Link href="/">Start</Link>
              <span aria-hidden="true">›</span>
              <Link href="/ueber-uns/">Über uns</Link>
              <span aria-hidden="true">›</span>
              <span aria-current="page">Suche</span>
            </nav>
            <span className="ae-eyebrow"><SearchIcon />Seitensuche</span>
            <h1>{query ? `Suchergebnisse für „${query}“` : "Was suchst Du?"}</h1>
            <p className="aei-lead">
              Durchsuche unser Magazin, die Städteseiten zur Partnersuche und die häufigen Fragen.
            </p>
            <div className="aea-search">
              <AboutSearchForm defaultValue={query} autoFocus={!query} />
            </div>
          </div>
        </div>
      </section>

      <AboutSubnav current="/ueber-uns/suche/" />

      {query ? (
        <section className="ae-wrap ae-section aes-results" aria-live="polite">
          {results.length > 0 ? (
            <>
              <p className="aes-count">
                {results.length === 1 ? "1 Treffer" : `${results.length} Treffer`}
                {results.length >= MAX_SEARCH_RESULTS ? " – die besten Ergebnisse zuerst" : ""}
              </p>
              <ol>
                {results.map((result) => (
                  <li key={result.href}>
                    <Link className="aes-result" href={result.href}>
                      <span className={`aes-area aes-area-${result.area === "Magazin" ? "mag" : result.area === "Stadt" ? "city" : "info"}`}>
                        {result.area === "Magazin" ? <BookIcon /> : result.area === "Stadt" ? <PinIcon /> : <QuestionIcon />}
                        {result.area}
                      </span>
                      <strong>{result.title}</strong>
                      {result.excerpt ? <span>{shortExcerpt(result.excerpt)}</span> : null}
                      <em>Öffnen <ArrowIcon /></em>
                    </Link>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <div className="aes-empty">
              <h2>Dazu haben wir leider nichts gefunden</h2>
              <p>
                Probier es mit einem anderen oder kürzeren Suchbegriff, zum Beispiel einer Stadt oder
                einem Thema wie „Kindergeld“. Oder stöbere direkt im Magazin und in der Partnersuche.
              </p>
            </div>
          )}
        </section>
      ) : (
        <section className="ae-wrap ae-section">
          <div className="aes-empty">
            <h2>Tipp</h2>
            <p>
              Gib eine Stadt, ein Thema oder eine Frage ein – etwa „Hamburg“, „Unterhalt“ oder
              „Schwangerschaftswoche“. Umlaute kannst Du auch als ae, oe oder ue schreiben.
            </p>
          </div>
        </section>
      )}

      <section className="ae-wrap ae-section" aria-labelledby="aes-browse">
        <div className="ae-head">
          <h2 id="aes-browse">Lieber direkt stöbern?</h2>
        </div>
        <div className="aei-tiles">
          <Link className="aei-tile" href="/magazin/"><BookIcon /><strong>Magazin</strong><span>Tipps und Geschichten für den Alltag als alleinerziehender Single.</span><em>Zum Magazin <ArrowIcon /></em></Link>
          <Link className="aei-tile" href="/partnersuche/"><PinIcon /><strong>Singles nach Stadt</strong><span>Stadtseiten mit Profilvorschau und Tipps für Alleinerziehende.</span><em>Städte ansehen <ArrowIcon /></em></Link>
          <Link className="aei-tile" href="/faq/"><QuestionIcon /><strong>Häufige Fragen</strong><span>Kosten, Sicherheit, Profil und Ablauf auf einen Blick.</span><em>Zur FAQ <ArrowIcon /></em></Link>
        </div>
      </section>
    </main>
  );
}
