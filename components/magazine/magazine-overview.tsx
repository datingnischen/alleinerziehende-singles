import {
  ArrowIcon,
  BookIcon,
  CalendarIcon,
  CoinIcon,
  FamilyHeartIcon,
  HeartIcon,
  SparkIcon,
  UsersIcon,
} from "@/components/icons";
import { ArticleLink } from "@/components/magazine/article-link";
import { MarketLink } from "@/components/market-link";
import { PostCard } from "@/components/magazine/post-card";
import { EDITORIAL_CATEGORY_IDS, groupMagazinePages, stripTags, type MagazineTheme } from "@/lib/magazine";
import { KINDERGELD_CATEGORY_ID, entryAvailableInMarket, marketThemeBySlug, marketThemes } from "@/lib/magazine-market";
import { getMagazinePageLinks, getMagazinePosts, getMagazinePostsByCategories } from "@/lib/magazine-content";
import { getMarket, type MarketCode } from "@/lib/markets";
import { registrationUrlForContext } from "@/lib/registration-links";
import "@/components/magazine/magazine.css";

const PAGE_SIZE = 18;
const THEME_ICONS = { partnersuche: HeartIcon, singleleben: UsersIcon, kindergeld: CoinIcon } as const;

/**
 * Magazin-Übersicht für DE, AT und CH: derselbe Artikelbestand, Themen- und Übersichtslinks auf die jeweilige
 * Landesdomain, Artikel-Links immer auf alleinerziehende-singles.de (Artikel gibt es nur dort, kein Duplicate Content).
 * Die deutschen Kindergeld-Inhalte (Themenwelt, Auszahlungstermine, Ratgeber) erscheinen nur auf .de.
 */
export type MagazineOverviewProps = { market: MarketCode; thema?: string; seite?: string };

function MagazineBand({ market }: { market: MarketCode }) {
  const config = getMarket(market);
  return (
    <section className="ae-wrap ae-section">
      <div className="ae-band">
        <div>
          <span className="ae-eyebrow"><HeartIcon />Vom Lesen zum Kennenlernen</span>
          <h2>Mütter und Väter {market === "de" ? "in Deiner Nähe" : `in ${market === "ch" ? "der Schweiz" : config.countryName}`}, die Deinen Alltag kennen</h2>
          <p>Profil kostenlos anlegen, Umkreis wählen und in Ruhe schauen, wer zu Dir und Deiner Familie passt.</p>
        </div>
        <div className="ae-band-actions">
          <a className="ae-btn ae-btn-primary" href={registrationUrlForContext(market, "magazin")}>Kostenlos registrieren</a>
          <MarketLink className="ae-btn ae-btn-ghost" market={market} path="/partnersuche/">Singles nach Stadt</MarketLink>
        </div>
      </div>
    </section>
  );
}

function ThemeNav({ market, current }: { market: MarketCode; current: MagazineTheme | null }) {
  return (
    <nav className="ae-wrap aemag-themenav" aria-label="Themen">
      <MarketLink market={market} path="/magazin/" className={!current ? "aemag-themenav-active" : undefined}>Alle Themen</MarketLink>
      {marketThemes(market).map((theme) => (
        <MarketLink key={theme.slug} market={market} path={`/magazin/?thema=${encodeURIComponent(theme.slug)}`} className={current?.slug === theme.slug ? "aemag-themenav-active" : undefined}>
          {theme.short}
        </MarketLink>
      ))}
      <MarketLink market={market} path="/magazin/#schwangerschaft">Schwangerschaft</MarketLink>
      <MarketLink market={market} path="/magazin/#ratgeber">Ratgeber</MarketLink>
    </nav>
  );
}

function ThemeView({ market, theme, page }: { market: MarketCode; theme: MagazineTheme; page: number }) {
  const posts = getMagazinePostsByCategories([theme.categoryId], PAGE_SIZE, page);
  // Ältere Artikel der Themenwelt direkt als Titelliste: Über das Blättern lagen sie bis zu 9 Klicks tief (Seobility).
  const olderPosts = page === 1 ? getMagazinePostsByCategories([theme.categoryId], 10000, 1).slice(PAGE_SIZE) : [];
  const Icon = THEME_ICONS[theme.key];

  return (
    <main className="aemag">
      <section className="ae-hero aemag-hero aemag-hero-theme">
        <div className="ae-wrap">
          <nav className="ae-crumbs" aria-label="Brotkrumen">
            <MarketLink market={market} path="/">Start</MarketLink>
            <span aria-hidden="true">›</span>
            <MarketLink market={market} path="/magazin/">Magazin</MarketLink>
            <span aria-hidden="true">›</span>
            <span aria-current="page">{theme.short}</span>
          </nav>
          <span className="ae-badge"><Icon />Themenwelt</span>
          <h1>{theme.title}</h1>
          <p className="ae-lead">{theme.text}</p>
        </div>
      </section>

      <ThemeNav market={market} current={theme} />

      <section className="ae-wrap ae-section" aria-label={`Artikel zu ${theme.title}`}>
        {posts.length ? (
          <div className="aemag-grid">
            {posts.map((post) => <PostCard key={post.id} post={post} market={market} />)}
          </div>
        ) : (
          <p className="aemag-empty">Hier sind gerade keine weiteren Artikel. <MarketLink market={market} path={`/magazin/?thema=${theme.slug}`}>Zurück zum Anfang</MarketLink></p>
        )}
        <div className="aemag-pager">
          {page > 1 ? <MarketLink className="ae-btn ae-btn-outline" market={market} path={`/magazin/?thema=${theme.slug}${page > 2 ? `&seite=${page - 1}` : ""}`}>← Neuere Artikel</MarketLink> : <span />}
          {posts.length === PAGE_SIZE ? <MarketLink className="ae-btn ae-btn-green" market={market} path={`/magazin/?thema=${theme.slug}&seite=${page + 1}`}>Ältere Artikel <ArrowIcon /></MarketLink> : null}
        </div>
      </section>

      {olderPosts.length ? (
        <section className="ae-wrap ae-section aemag-older" aria-labelledby="aemag-older-title">
          <h2 id="aemag-older-title">Alle älteren Artikel zu {theme.short}</h2>
          <ul className="aemag-older-list">
            {olderPosts.map((post) => (
              <li key={post.id}><ArticleLink market={market} slug={post.slug}>{stripTags(post.titleHtml)}</ArticleLink></li>
            ))}
          </ul>
        </section>
      ) : null}

      <MagazineBand market={market} />
    </main>
  );
}

export function MagazineOverview({ market, thema, seite }: MagazineOverviewProps) {
  const theme = marketThemeBySlug(market, thema);
  if (theme) {
    return <ThemeView market={market} theme={theme} page={Math.max(1, Number.parseInt(seite ?? "1", 10) || 1)} />;
  }

  const de = market === "de";
  const themes = marketThemes(market);
  const editorial = getMagazinePostsByCategories(EDITORIAL_CATEGORY_IDS, 10);
  const kindergeldPosts = de ? getMagazinePosts(4, KINDERGELD_CATEGORY_ID) : [];
  const pageLinks = getMagazinePageLinks().filter((page) => entryAvailableInMarket(market, { slug: page.slug, categoryIds: [] }));
  const [featured, ...latest] = editorial;
  const groups = groupMagazinePages(pageLinks);

  return (
    <main className="aemag">
      <section className="ae-hero aemag-hero">
        <div className="ae-wrap aemag-hero-grid">
          <div>
            <nav className="ae-crumbs" aria-label="Brotkrumen">
              <MarketLink market={market} path="/">Start</MarketLink>
              <span aria-hidden="true">›</span>
              <span aria-current="page">Magazin</span>
            </nav>
            <span className="ae-badge"><BookIcon />Magazin für Alleinerziehende</span>
            <h1>Liebe, Alltag und {de ? "Finanzen" : "Familie"} – <em>ehrlich erzählt</em></h1>
            <p className="ae-lead">
              Hier findest du hilfreiche Artikel für den Alltag als alleinerziehender Single: von Familie und Finanzen bis zu
              neuen Chancen in Liebe, Freizeit und Beruf.
            </p>
            <ul className="ae-stats">
              <li><strong>{themes.length}</strong> Themenwelten</li>
              {groups.pregnancy.length ? <li><strong>{groups.pregnancy.length}</strong> Schwangerschaftswochen</li> : null}
              {de && groups.kindergeldYears.length ? <li>Kindergeld seit <strong>{groups.kindergeldYears.at(-1)?.year}</strong></li> : null}
            </ul>
          </div>
          {featured ? (
            <div className="aemag-hero-feature">
              <span className="aemag-hero-kicker"><SparkIcon />Neu im Magazin</span>
              <PostCard post={featured} large market={market} />
            </div>
          ) : null}
        </div>
      </section>

      <ThemeNav market={market} current={null} />

      <section className="ae-wrap ae-section" aria-labelledby="aemag-themes-title">
        <div className="ae-head">
          <span className="ae-eyebrow"><FamilyHeartIcon />Themenwelten</span>
          <h2 id="aemag-themes-title">Worüber möchtest Du lesen?</h2>
        </div>
        <div className="aemag-themes">
          {themes.map((entry) => {
            const Icon = THEME_ICONS[entry.key];
            return (
              // Nur der Titel ist verlinkt (kurzer Linktext); die Kachel bleibt über die gestreckte Klickfläche klickbar.
              <div key={entry.slug} className={`aemag-theme aemag-theme-${entry.key}`}>
                <Icon />
                <strong><MarketLink className="aemag-card-link" market={market} path={`/magazin/?thema=${entry.slug}`}>{entry.title}</MarketLink></strong>
                <span>{entry.text}</span>
                <em aria-hidden="true">Artikel ansehen <ArrowIcon /></em>
              </div>
            );
          })}
          {groups.pregnancy.length ? (
            <div className="aemag-theme aemag-theme-ssw">
              <CalendarIcon />
              <strong><a className="aemag-card-link" href="#schwangerschaft">Schwangerschaft Woche für Woche</a></strong>
              <span>Was sich in jeder Schwangerschaftswoche tut – von der ersten bis zur 40. Woche.</span>
              <em aria-hidden="true">Woche wählen <ArrowIcon /></em>
            </div>
          ) : null}
        </div>
      </section>

      {latest.length ? (
        <section className="ae-wrap ae-section" aria-labelledby="aemag-latest-title">
          <div className="aemag-head-row">
            <div className="ae-head">
              <span className="ae-eyebrow"><HeartIcon />Neueste Artikel</span>
              <h2 id="aemag-latest-title">Frisch aus der Redaktion</h2>
              <p>Neue Artikel, Tipps und Geschichten für alleinerziehende Singles.</p>
            </div>
          </div>
          <div className="aemag-grid">
            {latest.map((post) => <PostCard key={post.id} post={post} market={market} />)}
          </div>
          <div className="aemag-more">
            {themes.filter((entry) => entry.key !== "kindergeld").map((entry) => (
              <MarketLink key={entry.slug} className="ae-btn ae-btn-outline" market={market} path={`/magazin/?thema=${entry.slug}`}>Alle Artikel: {entry.short} <ArrowIcon /></MarketLink>
            ))}
          </div>
        </section>
      ) : null}

      {de ? (
        <section id="kindergeld" className="ae-section aemag-service" aria-labelledby="aemag-kg-title">
          <div className="ae-wrap aemag-service-grid">
            <div>
              <span className="ae-eyebrow"><CoinIcon />Service &amp; Termine</span>
              <h2 id="aemag-kg-title">Kindergeld-Auszahlungstermine</h2>
              <p>Alle Jahresübersichten zu den Auszahlungsterminen findest du hier gesammelt an einem Ort – Monat für Monat im Überblick.</p>
              <ul className="aemag-years">
                {groups.kindergeldYears.map((entry) => (
                  <li key={entry.slug}><ArticleLink market={market} slug={entry.slug}>{entry.year}</ArticleLink></li>
                ))}
              </ul>
              <MarketLink className="ae-btn ae-btn-primary" market={market} path="/magazin/?thema=kindergeld">Alle Monatstermine <ArrowIcon /></MarketLink>
            </div>
            {kindergeldPosts.length ? (
              <ul className="aemag-kg-list">
                {kindergeldPosts.map((post) => (
                  <li key={post.id}>
                    <ArticleLink market={market} slug={post.slug}>
                      <CalendarIcon />
                      <span>{stripTags(post.titleHtml)}</span>
                      <ArrowIcon />
                    </ArticleLink>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      ) : null}

      {groups.pregnancy.length ? (
        <section id="schwangerschaft" className="ae-wrap ae-section" aria-labelledby="aemag-ssw-title">
          <div className="ae-head">
            <span className="ae-eyebrow"><CalendarIcon />Schwangerschaft</span>
            <h2 id="aemag-ssw-title">Schwangerschaft Woche für Woche</h2>
            <p>Wähle Deine Schwangerschaftswoche und lies, was sich bei Dir und Deinem Baby gerade tut.</p>
          </div>
          <ol className="aemag-weeks">
            {groups.pregnancy.map((entry) => (
              <li key={entry.slug}>
                <ArticleLink market={market} slug={entry.slug}><small>SSW</small><strong>{entry.week}</strong></ArticleLink>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {groups.guides.length ? (
        <section id="ratgeber" className="ae-wrap ae-section" aria-labelledby="aemag-guides-title">
          <div className="ae-head">
            <span className="ae-eyebrow"><BookIcon />Ratgeber</span>
            <h2 id="aemag-guides-title">Wichtige Magazin-Seiten</h2>
            <p>Übersichten und Ratgeber, die Du schnell wiederfinden möchtest.</p>
          </div>
          <ul className="aemag-guides">
            {groups.guides.map((entry) => (
              <li key={entry.slug}>
                <ArticleLink market={market} slug={entry.slug}><BookIcon /><span>{stripTags(entry.title)}</span><ArrowIcon /></ArticleLink>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <MagazineBand market={market} />
    </main>
  );
}
