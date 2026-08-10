import type { Metadata } from "next";
import Link from "next/link";
import {
  formatGermanDate,
  getMagazineCategories,
  getMagazinePages,
  getMagazinePosts,
} from "@/lib/wordpress";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Magazin",
  description:
    "Ratgeber, Hintergründe und wichtige Magazinseiten von Alleinerziehende-Singles.de.",
};

type Props = {
  searchParams?: Promise<{ thema?: string }>;
};

const MAGAZINE_ENTRY_POINTS = [
  {
    title: "Kindergeld & Finanzen",
    description: "Finde wichtige Termine, finanzielle Hilfen und praktische Orientierung für deinen Familienalltag.",
    href: "/magazin?thema=kindergeld",
  },
  {
    title: "Dating mit Kind",
    description: "Lies ehrliche Tipps für Neuanfang, Partnersuche und gute Gespräche mit neuen Kontakten.",
    href: "/magazin?thema=singleboersen",
  },
  {
    title: "Wichtige Magazin-Seiten",
    description: "Springe direkt zu den wichtigsten Übersichtsseiten, die viele Leserinnen und Leser wieder aufrufen.",
    href: "#magazin-seiten",
  },
] as const;

const KINDERGELD_PAGE_SLUG_PATTERN = /^kindergeld-auszahlungstermine-/;

export default async function MagazinePage({ searchParams }: Props) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const selectedSlug = resolvedSearchParams.thema;
  const categories = await getMagazineCategories(10);
  const selectedCategory = categories.find((category) => category.slug === selectedSlug);

  const [posts, pages] = await Promise.all([
    getMagazinePosts(12, selectedCategory?.id),
    getMagazinePages(6),
  ]);
  const kindergeldPages = pages.filter((page) => KINDERGELD_PAGE_SLUG_PATTERN.test(page.slug));
  const generalPages = pages.filter((page) => !KINDERGELD_PAGE_SLUG_PATTERN.test(page.slug));
  const visiblePosts =
    selectedCategory?.slug === "kindergeld"
      ? posts
      : posts.filter((post) => !KINDERGELD_PAGE_SLUG_PATTERN.test(post.slug));

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Magazin für Alleinerziehende</p>
        <h1>Alleinerziehende-Singles Magazin</h1>
        <p className={styles.lead}>
          Hier findest du hilfreiche Artikel für den Alltag als alleinerziehender Single: von
          Familie und Finanzen bis zu neuen Chancen in Liebe, Freizeit und Beruf.
        </p>
        <div className={styles.entryGrid}>
          {MAGAZINE_ENTRY_POINTS.map((entry) => (
            <Link className={styles.entryCard} href={entry.href} key={entry.title}>
              <strong>{entry.title}</strong>
              <span>{entry.description}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Themen, die dich gerade interessieren</h2>
          <p>Wähle ein Thema aus und lass dir passende Beiträge anzeigen.</p>
        </div>
        <div className={styles.categoryRow}>
          <Link
            className={`${styles.categoryChip} ${!selectedCategory ? styles.categoryChipActive : ""}`}
            href="/magazin"
          >
            Alle Themen
          </Link>
          {categories.map((category) => (
            <Link
              className={`${styles.categoryChip} ${selectedCategory?.id === category.id ? styles.categoryChipActive : ""}`}
              href={`/magazin?thema=${encodeURIComponent(category.slug)}`}
              key={category.id}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      {kindergeldPages.length ? (
        <section className={styles.gridSection} id="kindergeld-auszahlungstermine">
          <div className={styles.sectionHeader}>
            <h2>Kindergeld-Auszahlungstermine</h2>
            <p>
              Alle Jahresübersichten zu den Auszahlungsterminen findest du hier gesammelt an
              einem Ort.
            </p>
          </div>
          <div className={styles.pageList}>
            {kindergeldPages.map((page) => (
              <Link className={styles.pageListItem} href={`/magazin/${page.slug}`} key={page.id}>
                <div>
                  <span className={styles.pageType}>Kindergeld</span>
                  <strong dangerouslySetInnerHTML={{ __html: page.titleHtml }} />
                </div>
                <span>Öffnen</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className={styles.gridSection}>
        <div className={styles.sectionHeader}>
          <h2>{selectedCategory ? `Beiträge zu ${selectedCategory.name}` : "Neueste Artikel"}</h2>
          <p>
            {selectedCategory
              ? `Hier findest du Beiträge aus dem Themenbereich ${selectedCategory.name}.`
              : "Neue Artikel, Tipps und Geschichten für alleinerziehende Singles."}
          </p>
        </div>
        <div className={styles.cardGrid}>
          {visiblePosts.map((post) => (
            <article className={styles.card} key={post.id}>
              {post.featuredImageUrl ? (
                <img
                  className={styles.cardImage}
                  src={post.featuredImageUrl}
                  alt={post.featuredImageAlt || ""}
                />
              ) : null}
              <div className={styles.cardCopy}>
                <div className={styles.metaRow}>
                  <span>Artikel</span>
                  <span>{formatGermanDate(post.date)}</span>
                </div>
                <h3 dangerouslySetInnerHTML={{ __html: post.titleHtml }} />
                <div
                  className={styles.excerpt}
                  dangerouslySetInnerHTML={{ __html: post.excerptHtml }}
                />
                <Link className={styles.cardLink} href={`/magazin/${post.slug}`}>
                  Artikel öffnen
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.gridSection} id="magazin-seiten">
        <div className={styles.sectionHeader}>
          <h2>Magazin-Seiten</h2>
          <p>Wichtige Übersichtsseiten und Ratgeber, die du schnell wiederfinden möchtest.</p>
        </div>
        <div className={styles.pageList}>
          {generalPages.map((page) => (
            <Link className={styles.pageListItem} href={`/magazin/${page.slug}`} key={page.id}>
              <div>
                <span className={styles.pageType}>Seite</span>
                <strong dangerouslySetInnerHTML={{ __html: page.titleHtml }} />
              </div>
              <span>Öffnen</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
