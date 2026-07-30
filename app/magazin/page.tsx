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
    "Ratgeber, Hintergründe und wichtige Magazinseiten von Alleinerziehende-Singles.de in der neuen Vercel-Schicht.",
};

export default async function MagazinePage() {
  const [posts, pages, categories] = await Promise.all([
    getMagazinePosts(12),
    getMagazinePages(6),
    getMagazineCategories(10),
  ]);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Magazin-Quelle verknüpft</p>
        <h1>Alleinerziehende-Singles Magazin</h1>
        <p className={styles.lead}>
          Dieser erste Slice zieht bereits echte Magazin-Inhalte direkt aus dem WordPress unter
          <strong> /magazin</strong> und bildet damit die Grundlage für die weitere Headless-Migration.
        </p>
        <div className={styles.stats}>
          <span>{posts.length} aktuelle Artikel geladen</span>
          <span>{pages.length} Magazinseiten eingebunden</span>
          <span>{categories.length} Kategorien angebunden</span>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Magazin-Kategorien</h2>
          <p>Erste echte REST-Anbindung der vorhandenen WordPress-Taxonomien.</p>
        </div>
        <div className={styles.categoryRow}>
          {categories.map((category) => (
            <span className={styles.categoryChip} key={category.id}>
              {category.name}
            </span>
          ))}
        </div>
      </section>

      <section className={styles.gridSection}>
        <div className={styles.sectionHeader}>
          <h2>Neueste Artikel</h2>
          <p>Die Artikel kommen direkt aus dem Live-Magazin-WordPress.</p>
        </div>
        <div className={styles.cardGrid}>
          {posts.map((post) => (
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

      <section className={styles.gridSection}>
        <div className={styles.sectionHeader}>
          <h2>Magazin-Seiten</h2>
          <p>Auch WordPress-Pages werden direkt mit in die neue Schicht übernommen.</p>
        </div>
        <div className={styles.pageList}>
          {pages.map((page) => (
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
