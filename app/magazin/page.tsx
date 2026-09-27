import type { Metadata } from "next";
import Link from "next/link";
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
import { PostCard } from "@/components/magazine/post-card";
import { EDITORIAL_CATEGORY_IDS, MAGAZINE_THEMES, groupMagazinePages, stripTags, themeBySlug, type MagazineTheme } from "@/lib/magazine";
import { registrationUrlForContext } from "@/lib/registration-links";
import { getMagazinePageLinks, getMagazinePosts, getMagazinePostsByCategories, type MagazineEntry, type MagazinePageLink } from "@/lib/wordpress";
import "@/components/magazine/magazine.css";

export const metadata: Metadata = {
  title: "Magazin",
  description:
    "Magazin für Alleinerziehende: Dating mit Kind, Familienalltag, Kindergeld-Termine und Schwangerschaft Woche für Woche – ehrlich und alltagsnah.",
  alternates: { canonical: "https://alleinerziehende-singles.de/magazin/" },
};

type Props = {
  searchParams?: Promise<{ thema?: string; seite?: string }>;
};

const PAGE_SIZE = 18;
const THEME_ICONS = { partnersuche: HeartIcon, singleleben: UsersIcon, kindergeld: CoinIcon } as const;

async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

function MagazineBand() {
  return (
    <section className="ae-wrap ae-section">
      <div className="ae-band">
        <div>
          <span className="ae-eyebrow"><HeartIcon />Vom Lesen zum Kennenlernen</span>
          <h2>Mütter und Väter in Deiner Nähe, die Deinen Alltag kennen</h2>
          <p>Profil kostenlos anlegen, Umkreis wählen und in Ruhe schauen, wer zu Dir und Deiner Familie passt.</p>
        </div>
        <div className="ae-band-actions">
          <a className="ae-btn ae-btn-primary" href={registrationUrlForContext("de", "magazin")}>Kostenlos registrieren</a>
          <Link className="ae-btn ae-btn-ghost" href="/partnersuche/">Singles nach Stadt</Link>
        </div>
      </div>
    </section>
  );
}

function ThemeNav({ current }: { current: MagazineTheme | null }) {
  return (
    <nav className="ae-wrap aemag-themenav" aria-label="Themen">
      <Link href="/magazin/" className={!current ? "aemag-themenav-active" : undefined}>Alle Themen</Link>
      {MAGAZINE_THEMES.map((theme) => (
        <Link key={theme.slug} href={`/magazin/?thema=${encodeURIComponent(theme.slug)}`} className={current?.slug === theme.slug ? "aemag-themenav-active" : undefined}>
          {theme.short}
        </Link>
      ))}
      <Link href="/magazin/#schwangerschaft">Schwangerschaft</Link>
      <Link href="/magazin/#ratgeber">Ratgeber</Link>
    </nav>
  );
}

async function ThemeView({ theme, page }: { theme: MagazineTheme; page: number }) {
  const posts = await safe(getMagazinePostsByCategories([theme.categoryId], PAGE_SIZE, page), []);
  const Icon = THEME_ICONS[theme.key];

  return (
    <main className="aemag">
      <section className="ae-hero aemag-hero aemag-hero-theme">
        <div className="ae-wrap">
          <nav className="ae-crumbs" aria-label="Brotkrumen">
            <Link href="/">Start</Link>
            <span aria-hidden="true">›</span>
            <Link href="/magazin/">Magazin</Link>
            <span aria-hidden="true">›</span>
            <span aria-current="page">{theme.short}</span>
          </nav>
          <span className="ae-badge"><Icon />Themenwelt</span>
          <h1>{theme.title}</h1>
          <p className="ae-lead">{theme.text}</p>
        </div>
      </section>

      <ThemeNav current={theme} />

      <section className="ae-wrap ae-section" aria-label={`Artikel zu ${theme.title}`}>
        {posts.length ? (
          <div className="aemag-grid">
            {posts.map((post) => <PostCard key={post.id} post={post} />)}
          </div>
        ) : (
          <p className="aemag-empty">Hier sind gerade keine weiteren Artikel. <Link href={`/magazin/?thema=${theme.slug}`}>Zurück zum Anfang</Link></p>
        )}
        <div className="aemag-pager">
          {page > 1 ? <Link className="ae-btn ae-btn-outline" href={`/magazin/?thema=${theme.slug}${page > 2 ? `&seite=${page - 1}` : ""}`}>← Neuere Artikel</Link> : <span />}
          {posts.length === PAGE_SIZE ? <Link className="ae-btn ae-btn-green" href={`/magazin/?thema=${theme.slug}&seite=${page + 1}`}>Ältere Artikel <ArrowIcon /></Link> : null}
        </div>
      </section>

      <MagazineBand />
    </main>
  );
}

export default async function MagazinePage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};
  const theme = themeBySlug(params.thema);
  if (theme) {
    return <ThemeView theme={theme} page={Math.max(1, Number.parseInt(params.seite ?? "1", 10) || 1)} />;
  }

  const [editorial, kindergeldPosts, pageLinks] = await Promise.all([
    safe(getMagazinePostsByCategories(EDITORIAL_CATEGORY_IDS, 10), [] as MagazineEntry[]),
    safe(getMagazinePosts(4, 8), [] as MagazineEntry[]),
    safe(getMagazinePageLinks(), [] as MagazinePageLink[]),
  ]);
  const [featured, ...latest] = editorial;
  const groups = groupMagazinePages(pageLinks);

  return (
    <main className="aemag">
      <section className="ae-hero aemag-hero">
        <div className="ae-wrap aemag-hero-grid">
          <div>
            <nav className="ae-crumbs" aria-label="Brotkrumen">
              <Link href="/">Start</Link>
              <span aria-hidden="true">›</span>
              <span aria-current="page">Magazin</span>
            </nav>
            <span className="ae-badge"><BookIcon />Magazin für Alleinerziehende</span>
            <h1>Liebe, Alltag und Finanzen – <em>ehrlich erzählt</em></h1>
            <p className="ae-lead">
              Hier findest du hilfreiche Artikel für den Alltag als alleinerziehender Single: von Familie und Finanzen bis zu
              neuen Chancen in Liebe, Freizeit und Beruf.
            </p>
            <ul className="ae-stats">
              <li><strong>{MAGAZINE_THEMES.length}</strong> Themenwelten</li>
              {groups.pregnancy.length ? <li><strong>{groups.pregnancy.length}</strong> Schwangerschaftswochen</li> : null}
              {groups.kindergeldYears.length ? <li>Kindergeld seit <strong>{groups.kindergeldYears.at(-1)?.year}</strong></li> : null}
            </ul>
          </div>
          {featured ? (
            <div className="aemag-hero-feature">
              <span className="aemag-hero-kicker"><SparkIcon />Neu im Magazin</span>
              <PostCard post={featured} large />
            </div>
          ) : null}
        </div>
      </section>

      <ThemeNav current={null} />

      <section className="ae-wrap ae-section" aria-labelledby="aemag-themes-title">
        <div className="ae-head">
          <span className="ae-eyebrow"><FamilyHeartIcon />Themenwelten</span>
          <h2 id="aemag-themes-title">Worüber möchtest Du lesen?</h2>
        </div>
        <div className="aemag-themes">
          {MAGAZINE_THEMES.map((entry) => {
            const Icon = THEME_ICONS[entry.key];
            return (
              <Link key={entry.slug} className={`aemag-theme aemag-theme-${entry.key}`} href={`/magazin/?thema=${entry.slug}`}>
                <Icon />
                <strong>{entry.title}</strong>
                <span>{entry.text}</span>
                <em>Artikel ansehen <ArrowIcon /></em>
              </Link>
            );
          })}
          {groups.pregnancy.length ? (
            <a className="aemag-theme aemag-theme-ssw" href="#schwangerschaft">
              <CalendarIcon />
              <strong>Schwangerschaft Woche für Woche</strong>
              <span>Was sich in jeder Schwangerschaftswoche tut – von der ersten bis zur 40. Woche.</span>
              <em>Woche wählen <ArrowIcon /></em>
            </a>
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
            {latest.map((post) => <PostCard key={post.id} post={post} />)}
          </div>
          <div className="aemag-more">
            {MAGAZINE_THEMES.filter((entry) => entry.key !== "kindergeld").map((entry) => (
              <Link key={entry.slug} className="ae-btn ae-btn-outline" href={`/magazin/?thema=${entry.slug}`}>Alle Artikel: {entry.short} <ArrowIcon /></Link>
            ))}
          </div>
        </section>
      ) : null}

      <section id="kindergeld" className="ae-section aemag-service" aria-labelledby="aemag-kg-title">
        <div className="ae-wrap aemag-service-grid">
          <div>
            <span className="ae-eyebrow"><CoinIcon />Service &amp; Termine</span>
            <h2 id="aemag-kg-title">Kindergeld-Auszahlungstermine</h2>
            <p>Alle Jahresübersichten zu den Auszahlungsterminen findest du hier gesammelt an einem Ort – Monat für Monat im Überblick.</p>
            <ul className="aemag-years">
              {groups.kindergeldYears.map((entry) => (
                <li key={entry.slug}><Link href={`/magazin/${entry.slug}/`}>{entry.year}</Link></li>
              ))}
            </ul>
            <Link className="ae-btn ae-btn-primary" href="/magazin/?thema=kindergeld">Alle Monatstermine <ArrowIcon /></Link>
          </div>
          {kindergeldPosts.length ? (
            <ul className="aemag-kg-list">
              {kindergeldPosts.map((post) => (
                <li key={post.id}>
                  <Link href={`/magazin/${post.slug}/`}>
                    <CalendarIcon />
                    <span>{stripTags(post.titleHtml)}</span>
                    <ArrowIcon />
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

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
                <Link href={`/magazin/${entry.slug}/`}><small>SSW</small><strong>{entry.week}</strong></Link>
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
                <Link href={`/magazin/${entry.slug}/`}><BookIcon /><span>{stripTags(entry.title)}</span><ArrowIcon /></Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <MagazineBand />
    </main>
  );
}
