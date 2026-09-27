import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowIcon, BookIcon, CalendarIcon, ClockIcon, FamilyHeartIcon, HeartIcon, PinIcon } from "@/components/icons";
import { PostCard } from "@/components/magazine/post-card";
import { breadcrumbJsonLd, serializeJsonLd } from "@/lib/json-ld";
import { excerptText, groupMagazinePages, readingMinutes, stripTags, themeForCategories, withHeadingAnchors } from "@/lib/magazine";
import { publicUrl } from "@/lib/markets";
import { registrationUrlForContext } from "@/lib/registration-links";
import { staticAsset } from "@/lib/static-asset";
import {
  formatArticleUpdated,
  getMagazineEntryBySlug,
  getMagazinePageLinks,
  getRelatedPosts,
  type MagazineEntry,
  type MagazinePageLink,
} from "@/lib/wordpress";
import "@/components/magazine/magazine.css";

type Props = {
  params: Promise<{ slug: string }>;
};

async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = await safe(getMagazineEntryBySlug(slug), null);

  if (!entry) {
    return {
      title: "Magazin",
    };
  }

  const description = entry.seoDescription || excerptText(entry.excerptHtml).replace(/…$/, "").slice(0, 160);
  return {
    title: entry.seoTitle ? { absolute: entry.seoTitle } : stripTags(entry.titleHtml),
    description,
    alternates: { canonical: publicUrl("de", `/magazin/${entry.slug}/`) },
    openGraph: entry.featuredImageUrl ? { images: [{ url: entry.featuredImageUrl }], type: "article" } : undefined,
  };
}

/** Schwangerschaftswochen: vorige/nächste Woche als Blätter-Navigation. */
function pregnancyNeighbours(slug: string, pages: MagazinePageLink[]) {
  const weeks = groupMagazinePages(pages).pregnancy;
  const index = weeks.findIndex((entry) => entry.slug === slug);
  if (index < 0) return null;
  return { weeks, index, prev: weeks[index - 1] ?? null, next: weeks[index + 1] ?? null };
}

function articleJsonLd(entry: MagazineEntry, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": entry.kind === "post" ? "BlogPosting" : "Article",
    headline: stripTags(entry.titleHtml),
    description: excerptText(entry.excerptHtml).slice(0, 300),
    url,
    mainEntityOfPage: url,
    datePublished: entry.date,
    dateModified: entry.modified || entry.date,
    image: entry.featuredImageUrl ? [entry.featuredImageUrl] : undefined,
    author: { "@type": "Organization", name: "Redaktion alleinerziehende-singles.de", url: publicUrl("de", "/ueber-uns/") },
    publisher: { "@type": "Organization", name: "alleinerziehende-singles.de", url: publicUrl("de", "/") },
    inLanguage: "de-DE",
  };
}

export default async function MagazineEntryPage({ params }: Props) {
  const { slug } = await params;
  const entry = await safe(getMagazineEntryBySlug(slug), null);

  if (!entry) {
    notFound();
  }

  const isPost = entry.kind === "post";
  const theme = themeForCategories(entry.categoryIds);
  const [related, pageLinks] = await Promise.all([
    isPost ? safe(getRelatedPosts(entry, 3), [] as MagazineEntry[]) : Promise.resolve([] as MagazineEntry[]),
    isPost ? Promise.resolve([] as MagazinePageLink[]) : safe(getMagazinePageLinks(), [] as MagazinePageLink[]),
  ]);
  const pregnancy = isPost ? null : pregnancyNeighbours(entry.slug, pageLinks);
  const { html, toc } = withHeadingAnchors(entry.contentHtml);
  const minutes = readingMinutes(entry.contentHtml);
  const registrationHref = registrationUrlForContext("de", "magazin");
  const url = publicUrl("de", `/magazin/${entry.slug}/`);
  const title = stripTags(entry.titleHtml);
  // Facebook-Bild-URLs laufen ab bzw. werden blockiert: dann lieber ohne Titelbild
  const heroImage = entry.featuredImageUrl && !/fbcdn\.net|facebook\.com/.test(entry.featuredImageUrl) ? entry.featuredImageUrl : null;
  const pageTheme = !theme && /^kindergeld/.test(entry.slug) ? "Kindergeld & Finanzen" : null;
  const crumbs = breadcrumbJsonLd("de", [
    { name: "Start", path: "/" },
    { name: "Magazin", path: "/magazin/" },
    { name: title, path: `/magazin/${entry.slug}/` },
  ]);

  return (
    <main className="aemag aemag-article">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleJsonLd(entry, url)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(crumbs) }} />

      <header className="aemag-ahero">
        <div className="ae-wrap aemag-ahero-inner">
          <nav className="aei-crumbs" aria-label="Brotkrumen">
            <Link href="/">Start</Link>
            <span aria-hidden="true">›</span>
            <Link href="/magazin/">Magazin</Link>
            {theme ? (
              <>
                <span aria-hidden="true">›</span>
                <Link href={`/magazin/?thema=${theme.slug}`}>{theme.short}</Link>
              </>
            ) : null}
          </nav>
          {theme ? <span className={`aemag-chip aemag-chip-${theme.key}`}>{theme.title}</span> : pregnancy ? <span className="aemag-chip aemag-chip-ssw">Schwangerschaft Woche für Woche</span> : <span className={`aemag-chip${pageTheme ? " aemag-chip-kindergeld" : ""}`}>{pageTheme ?? "Ratgeber"}</span>}
          <h1 dangerouslySetInnerHTML={{ __html: entry.titleHtml }} />
          {isPost && excerptText(entry.excerptHtml) ? <p className="aemag-lead">{excerptText(entry.excerptHtml)}</p> : null}
          <div className="aemag-meta">
            <span className="aemag-author"><span aria-hidden="true"><FamilyHeartIcon /></span>Redaktion alleinerziehende-singles.de</span>
            {entry.kind === "post" && formatArticleUpdated(entry) ? <span><CalendarIcon />{formatArticleUpdated(entry)}</span> : null}
            <span><ClockIcon />{minutes} Min. Lesezeit</span>
          </div>
        </div>
      </header>

      {heroImage ? (
        <figure className="ae-wrap aemag-figure">
          <img src={heroImage} alt={entry.featuredImageAlt || ""} fetchPriority="high" decoding="async" />
        </figure>
      ) : null}

      <div className={`ae-wrap aemag-layout${toc.length >= 3 ? "" : " aemag-layout-solo"}`}>
        <article className="aemag-body">
          {toc.length >= 3 ? (
            <details className="aemag-toc-mobile">
              <summary><BookIcon />In diesem Artikel</summary>
              <ol>{toc.map((item) => <li key={item.id}><a href={`#${item.id}`}>{item.title}</a></li>)}</ol>
            </details>
          ) : null}
          <div className="ae-rich aemag-rich" dangerouslySetInnerHTML={{ __html: html }} />

          {pregnancy ? (
            <nav className="aemag-weeknav" aria-label="Schwangerschaftswochen">
              {pregnancy.prev ? <Link href={`/magazin/${pregnancy.prev.slug}/`}>← SSW {pregnancy.prev.week}</Link> : <span />}
              <Link href="/magazin/#schwangerschaft">Alle Wochen</Link>
              {pregnancy.next ? <Link href={`/magazin/${pregnancy.next.slug}/`}>SSW {pregnancy.next.week} →</Link> : <span />}
            </nav>
          ) : null}

          <aside className="aemag-byline">
            <span className="aemag-byline-icon" aria-hidden="true"><FamilyHeartIcon /></span>
            <div>
              <strong>Redaktion alleinerziehende-singles.de</strong>
              <p>
                Wir schreiben für Mütter und Väter, die Familie, Alltag und Liebe unter einen Hut bringen. Das Projekt wird
                begleitet von Christian M. Haas, unabhängiger Datingexperte.
              </p>
              <Link href="/ueber-uns/">Mehr über uns <ArrowIcon /></Link>
            </div>
          </aside>
        </article>

        {toc.length >= 3 ? (
          <aside className="aemag-side">
            <nav className="aemag-toc" aria-label="Inhaltsverzeichnis">
              <span><BookIcon />In diesem Artikel</span>
              <ol>{toc.map((item) => <li key={item.id}><a href={`#${item.id}`}>{item.title}</a></li>)}</ol>
            </nav>
            <a className="aemag-side-cta" href={registrationHref}>
              <HeartIcon />
              <strong>Singles mit Kind in Deiner Nähe</strong>
              <span>Kostenlos registrieren und Mütter und Väter aus Deiner Region kennenlernen.</span>
              <em>Jetzt starten <ArrowIcon /></em>
            </a>
          </aside>
        ) : null}
      </div>

      <section className="ae-wrap ae-section">
        <aside className="aemag-radar" aria-labelledby="radar-cta-title">
          <div>
            <span className="ae-eyebrow"><PinIcon />Umkreissuche</span>
            <h2 id="radar-cta-title">Alleinerziehende Singles in Deiner Nähe</h2>
            <p>Lerne Mütter und Väter kennen, die Deinen Alltag verstehen – kostenlos und direkt in Deiner Region.</p>
            <div className="ae-actions">
              <a className="ae-btn ae-btn-primary" href={registrationHref}>Kostenlos registrieren</a>
              <Link className="ae-btn ae-btn-ghost" href="/partnersuche/">Singles nach Stadt</Link>
            </div>
          </div>
          <a className="aemag-radar-card" href={registrationHref} tabIndex={-1} aria-hidden="true">
            <img src={staticAsset("/brand/umkreissuche-radar.svg")} alt="" width={320} height={480} loading="lazy" decoding="async" />
          </a>
        </aside>
      </section>

      {related.length ? (
        <section className="ae-wrap ae-section" aria-labelledby="aemag-related-title">
          <div className="aemag-head-row">
            <div className="ae-head">
              <span className="ae-eyebrow"><HeartIcon />Weiterlesen</span>
              <h2 id="aemag-related-title">{theme ? `Mehr zu ${theme.short}` : "Mehr aus dem Magazin"}</h2>
            </div>
            <Link className="ae-btn ae-btn-outline" href={theme ? `/magazin/?thema=${theme.slug}` : "/magazin/"}>Alle Artikel <ArrowIcon /></Link>
          </div>
          <div className="aemag-grid">
            {related.map((post) => <PostCard key={post.id} post={post} />)}
          </div>
        </section>
      ) : (
        <section className="ae-wrap ae-section aemag-back">
          <Link className="ae-btn ae-btn-outline" href="/magazin/">← Zurück zum Magazin</Link>
        </section>
      )}
    </main>
  );
}
