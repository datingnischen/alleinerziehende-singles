import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { importedRootPages } from "@/lib/icony-import";
import { getMagazinePosts, formatGermanDate } from "@/lib/wordpress";
import styles from "./page.module.css";

const ABOUT_PAGE_PATHS: Record<string, string> = {
  "bewertungen-und-erfahrungen": "/ueber-uns/bewertungen",
  "social-media": "/ueber-uns/social-media",
};

const trustPoints = [
  "Sicherheit, Datenschutz und redaktionelle Kontrolle klar erklärt",
  "Kostenloser Einstieg mit transparenter Basis-Mitgliedschaft",
  "Magazin und regionale Partnersuche als wichtigste Content-Einstiege",
];

export const metadata: Metadata = {
  title: "Alleinerziehende Singles - Suchen, Finden, Verlieben",
  description: "Partnersuche für alleinerziehende Mütter und Väter in Deutschland.",
  alternates: { canonical: "https://alleinerziehende-singles.de/" },
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const latestPosts = await getMagazinePosts(3);
  const featuredServicePages = importedRootPages.filter((page) =>
    ["faq", "bewertungen-und-erfahrungen", "social-media"].includes(page.slug),
  );

  return (
    <SiteShell market="de">
      <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Partnersuche mit Verständnis</p>
          <h1>Die Partnersuche für alleinerziehende Singles</h1>
          <p className={styles.lead}>
            Entdecke regionale Stadtseiten, hilfreiche Antworten, Bewertungen, Social Media und
            frische Magazin-Inhalte rund um die Partnersuche für alleinerziehende Singles.
          </p>
          <div className={styles.actions}>
            <a className={styles.primary} href="https://alleinerziehende-singles.de/registration/" target="_blank" rel="noreferrer">
              Kostenlos registrieren
            </a>
            <Link className={styles.secondary} href="/magazin">
              Zum Magazin
            </Link>
          </div>
          <Image
            className={styles.heroImage}
            src="/brand/frontpage-visual-alleinerziehende.webp"
            alt="Alleinerziehende Mutter mit Kind auf dem Weg zu einem neuen Kontakt"
            width={1264}
            height={711}
            priority
          />
        </section>

        <section className={styles.grid}>
          <article className={styles.card}>
            <h2>Warum dieser Einstieg besser führt</h2>
            <ul>
              {trustPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>

          <article className={styles.card}>
            <h2>Direkte Einstiege</h2>
            <div className={styles.linkList}>
              <Link href="/partnersuche">Regionale Partnersuche</Link>
              <Link href="/faq">FAQ</Link>
              <Link href="/ueber-uns/bewertungen">Erfahrungen</Link>
              <Link href="/ueber-uns/social-media">Social Media</Link>
              <a href="https://alleinerziehende-singles.de/sicherheit-und-datenschutz.html" target="_blank" rel="noreferrer">
                Sicherheit
              </a>
              <a href="https://alleinerziehende-singles.de/redaktionelle-kontrolle.html" target="_blank" rel="noreferrer">
                Redaktionelle Kontrolle
              </a>
            </div>
          </article>
        </section>

        <section className={styles.gridSection}>
          <div className={styles.sectionHeader}>
            <h2>Vertrauen & Service</h2>
            <p>Wichtige Hilfethemen, Bewertungen und Transparenz-Seiten sind jetzt direkt erreichbar.</p>
          </div>
          <div className={styles.serviceGrid}>
            {featuredServicePages.map((page) => (
              <article className={styles.serviceCard} key={page.slug}>
                <p className={styles.serviceEyebrow}>Hilfreich & kompakt</p>
                <h3>{page.heroTitle}</h3>
                <p>{page.description}</p>
                <Link href={ABOUT_PAGE_PATHS[page.slug] ?? `/${page.slug}`}>Seite öffnen</Link>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.gridSection}>
          <div className={styles.sectionHeader}>
            <h2>Neueste Magazin-Artikel</h2>
            <p>Frische Tipps, ehrliche Geschichten und hilfreiche Impulse für deinen Alltag als alleinerziehender Single.</p>
          </div>
          <div className={styles.articleGrid}>
            {latestPosts.map((post) => (
              <article className={styles.articleCard} key={post.id}>
                {post.featuredImageUrl ? (
                  <img className={styles.articleImage} src={post.featuredImageUrl} alt={post.featuredImageAlt || ""} />
                ) : null}
                <div className={styles.articleCopy}>
                  <div className={styles.articleMeta}>
                    <span>Magazin</span>
                    <span>{formatGermanDate(post.date)}</span>
                  </div>
                  <h3 dangerouslySetInnerHTML={{ __html: post.titleHtml }} />
                  <div className={styles.excerpt} dangerouslySetInnerHTML={{ __html: post.excerptHtml }} />
                  <Link href={`/magazin/${post.slug}`}>Artikel lesen</Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      </div>
    </SiteShell>
  );
}
