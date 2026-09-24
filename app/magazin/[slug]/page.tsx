import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { registrationUrlForContext } from "@/lib/registration-links";
import { formatArticleUpdated, getMagazineEntryBySlug } from "@/lib/wordpress";
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

  const registrationHref = registrationUrlForContext("de", "magazin");

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
              {entry.kind === "post" && formatArticleUpdated(entry) ? <span>{formatArticleUpdated(entry)}</span> : null}
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

      <aside className={styles.radarCta} aria-labelledby="radar-cta-title">
        <div className={styles.radarCopy}>
          <span className={styles.radarEyebrow}>Umkreissuche</span>
          <h2 id="radar-cta-title">Alleinerziehende Singles in Deiner Nähe</h2>
          <p>Lerne Mütter und Väter kennen, die Deinen Alltag verstehen – kostenlos und direkt in Deiner Region.</p>
          <a className={styles.radarButton} href={registrationHref}>
            Kostenlos registrieren
          </a>
        </div>
        <a className={styles.radarCard} href={registrationHref}>
          <img
            src="/brand/umkreissuche-radar.svg"
            alt="Umkreissuche: Alleinerziehende in Deiner Nähe – kostenlos anmelden"
            width={320}
            height={480}
            loading="lazy"
            decoding="async"
          />
        </a>
      </aside>
    </main>
  );
}
