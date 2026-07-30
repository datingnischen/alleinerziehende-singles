import Link from "next/link";
import { getMagazinePosts, formatGermanDate } from "@/lib/wordpress";
import { servicePages } from "@/lib/service-pages";
import styles from "./page.module.css";

const trustPoints = [
  "Sicherheit, Datenschutz und redaktionelle Kontrolle klar erklärt",
  "Kostenloser Einstieg mit transparenter Basis-Mitgliedschaft",
  "Magazin und Hilfe als feste Vertrauens- und Support-Einstiege",
];

export default async function Home() {
  const latestPosts = await getMagazinePosts(3);
  const featuredServicePages = servicePages.filter((page) =>
    [
      "bewertungen-und-erfahrungen",
      "sicherheit-und-datenschutz.html",
      "kostenlose-basis-mitgliedschaft.html",
      "hilfe",
    ].includes(page.slug),
  );

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Partnersuche mit Verständnis</p>
          <h1>Die Partnersuche für alleinerziehende Singles</h1>
          <p className={styles.lead}>
            Hier entsteht die neue Vercel-Schicht für Alleinerziehende-Singles.de mit klarerem Root-Bereich,
            Service-Einstiegen und bereits angebundenem Live-Magazin.
          </p>
          <div className={styles.actions}>
            <a className={styles.primary} href="https://alleinerziehende-singles.de/registration/" target="_blank" rel="noreferrer">
              Kostenlos registrieren
            </a>
            <Link className={styles.secondary} href="/magazin">
              Zum Magazin
            </Link>
          </div>
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
              <Link href="/bewertungen-und-erfahrungen">Erfahrungen</Link>
              <Link href="/social-media">Social Media</Link>
              <Link href="/sicherheit-und-datenschutz.html">Sicherheit</Link>
              <Link href="/redaktionelle-kontrolle.html">Redaktionelle Kontrolle</Link>
              <Link href="/kostenlose-basis-mitgliedschaft.html">Basis-Mitgliedschaft</Link>
              <Link href="/hilfe">Hilfe & Support</Link>
            </div>
          </article>
        </section>

        <section className={styles.gridSection}>
          <div className={styles.sectionHeader}>
            <h2>Vertrauen & Service</h2>
            <p>Die wichtigsten Root-/Service-Bereiche sind jetzt als eigene Einstiege in der neuen Schicht angelegt.</p>
          </div>
          <div className={styles.serviceGrid}>
            {featuredServicePages.map((page) => (
              <article className={styles.serviceCard} key={page.slug}>
                <p className={styles.serviceEyebrow}>{page.eyebrow}</p>
                <h3>{page.title}</h3>
                <p>{page.description}</p>
                <Link href={`/${page.slug}`}>Seite öffnen</Link>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.gridSection}>
          <div className={styles.sectionHeader}>
            <h2>Neueste Magazin-Artikel</h2>
            <p>Diese Inhalte kommen bereits direkt aus dem Live-WordPress unter /magazin.</p>
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
  );
}
