import { ArrowIcon, BookIcon, CalendarIcon, ClockIcon, FamilyHeartIcon, HeartIcon, PinIcon } from "@/components/icons";
import { ArticleLink } from "@/components/magazine/article-link";
import { MarketLink } from "@/components/market-link";
import { PostCard } from "@/components/magazine/post-card";
import { breadcrumbJsonLd, serializeJsonLd } from "@/lib/json-ld";
import { excerptText, groupMagazinePages, readingMinutes, stripTags, themeForCategories, withHeadingAnchors } from "@/lib/magazine";
import { publicUrl, type MarketCode } from "@/lib/markets";
import { registrationUrlForContext } from "@/lib/registration-links";
import { staticAsset } from "@/lib/static-asset";
import {
  formatArticleUpdated,
  getMagazinePageLinks,
  getRelatedPosts,
  type MagazineEntry,
  type MagazinePageLink,
} from "@/lib/magazine-content";
import "@/components/magazine/magazine.css";

/** SEO-Titel steht ohne Markenanhängsel im Frontmatter; die Marke kommt dazu, wenn der Titel dann noch ≤ 60 Zeichen hat. */
export function articleMetaTitle(entry: MagazineEntry, market: MarketCode = "de"): string {
  const base = entry.seoTitle || stripTags(entry.titleHtml);
  const withBrand = `${base} | Alleinerziehende-Singles.${market}`;
  return withBrand.length <= 60 ? withBrand : base;
}

export function articleMetaDescription(entry: MagazineEntry): string {
  return entry.seoDescription || excerptText(entry.excerptHtml).replace(/…$/, "").slice(0, 160);
}

/** Schwangerschaftswochen: vorige/nächste Woche als Blätter-Navigation. */
function pregnancyNeighbours(slug: string, pages: MagazinePageLink[]) {
  const weeks = groupMagazinePages(pages).pregnancy;
  const index = weeks.findIndex((entry) => entry.slug === slug);
  if (index < 0) return null;
  return { weeks, index, prev: weeks[index - 1] ?? null, next: weeks[index + 1] ?? null };
}

/** Artikel-Markup: Artikel gibt es nur auf alleinerziehende-singles.de (AT/CH leiten dorthin um). */
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

export function MagazineArticle({ market, entry }: { market: MarketCode; entry: MagazineEntry }) {
  const isPost = entry.kind === "post";
  const theme = themeForCategories(entry.categoryIds);
  const related = isPost ? getRelatedPosts(entry, 3) : [];
  const pageLinks = isPost ? [] : getMagazinePageLinks();
  const pregnancy = isPost ? null : pregnancyNeighbours(entry.slug, pageLinks);
  const { html, toc } = withHeadingAnchors(entry.contentHtml);
  const minutes = readingMinutes(entry.contentHtml);
  const registrationHref = registrationUrlForContext(market, "magazin");
  const url = publicUrl("de", `/magazin/${entry.slug}/`);
  const title = stripTags(entry.titleHtml);
  // Facebook-Bild-URLs laufen ab bzw. werden blockiert: dann lieber ohne Titelbild
  const heroImage = entry.featuredImageUrl && !/fbcdn\.net|facebook\.com/.test(entry.featuredImageUrl) ? entry.featuredImageUrl : null;
  const pageTheme = !theme && /^kindergeld/.test(entry.slug) ? "Kindergeld & Finanzen" : null;
  const crumbs = breadcrumbJsonLd(market, [
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
            <MarketLink market={market} path="/">Start</MarketLink>
            <span aria-hidden="true">›</span>
            <MarketLink market={market} path="/magazin/">Magazin</MarketLink>
            {theme ? (
              <>
                <span aria-hidden="true">›</span>
                <MarketLink market={market} path={`/magazin/?thema=${theme.slug}`}>{theme.short}</MarketLink>
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
          <img src={heroImage} alt={entry.featuredImageAlt || title} fetchPriority="high" decoding="async" />
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
              {pregnancy.prev ? <ArticleLink market={market} slug={pregnancy.prev.slug}>← SSW {pregnancy.prev.week}</ArticleLink> : <span />}
              <MarketLink market={market} path="/magazin/#schwangerschaft">Alle Wochen</MarketLink>
              {pregnancy.next ? <ArticleLink market={market} slug={pregnancy.next.slug}>SSW {pregnancy.next.week} →</ArticleLink> : <span />}
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
              <MarketLink market={market} path="/ueber-uns/">Mehr über uns <ArrowIcon /></MarketLink>
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
              <MarketLink className="ae-btn ae-btn-ghost" market={market} path="/partnersuche/">Singles nach Stadt</MarketLink>
            </div>
          </div>
          <a className="aemag-radar-card" href={registrationHref} tabIndex={-1} aria-hidden="true">
            <img src={staticAsset("/brand/umkreissuche-radar.svg")} alt="Radar-Grafik der Umkreissuche" width={320} height={480} loading="lazy" decoding="async" />
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
            <MarketLink className="ae-btn ae-btn-outline" market={market} path={theme ? `/magazin/?thema=${theme.slug}` : "/magazin/"}>Alle Artikel <ArrowIcon /></MarketLink>
          </div>
          <div className="aemag-grid">
            {related.map((post) => <PostCard key={post.id} post={post} market={market} />)}
          </div>
        </section>
      ) : (
        <section className="ae-wrap ae-section aemag-back">
          <MarketLink className="ae-btn ae-btn-outline" market={market} path="/magazin/">← Zurück zum Magazin</MarketLink>
        </section>
      )}
    </main>
  );
}
