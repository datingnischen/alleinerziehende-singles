import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatGermanDate, getMagazineEntryBySlug } from "@/lib/wordpress";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getMagazineEntryBySlug(slug);

  if (!entry) {
    return {
      title: "Magazin",
    };
  }

  return {
    title: entry.titleHtml.replace(/<[^>]+>/g, ""),
    description: entry.excerptHtml.replace(/<[^>]+>/g, " ").trim().slice(0, 160),
  };
}

export default async function MagazineEntryPage({ params }: Props) {
  const { slug } = await params;
  const entry = await getMagazineEntryBySlug(slug);

  if (!entry) {
    notFound();
  }

  return (
    <main className={styles.page}>
      <Link className={styles.backLink} href="/magazin">
        ← Zurück zum Magazin
      </Link>

      <article className={styles.article}>
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <div className={styles.metaRow}>
              <span>{entry.kind === "post" ? "Artikel" : "Seite"}</span>
              {entry.date ? <span>{formatGermanDate(entry.date)}</span> : null}
              {entry.authorName ? <span>{entry.authorName}</span> : null}
            </div>
            <h1 dangerouslySetInnerHTML={{ __html: entry.titleHtml }} />
            {entry.excerptHtml ? (
              <div className={styles.excerpt} dangerouslySetInnerHTML={{ __html: entry.excerptHtml }} />
            ) : null}
          </div>

          {entry.featuredImageUrl ? (
            <div className={styles.heroMedia}>
              <img src={entry.featuredImageUrl} alt={entry.featuredImageAlt || ""} />
            </div>
          ) : null}
        </header>

        <div className={styles.content} dangerouslySetInnerHTML={{ __html: entry.contentHtml }} />
      </article>
    </main>
  );
}
