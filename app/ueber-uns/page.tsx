import type { Metadata } from "next";
import Link from "next/link";
import styles from "../imported-page.module.css";

export const metadata: Metadata = {
  title: "Über uns",
  description:
    "Erfahre mehr über alleinerziehende-singles.de, unsere Social-Media-Kanäle, Bewertungen und Kooperationsmöglichkeiten.",
  alternates: { canonical: "https://alleinerziehende-singles.de/ueber-uns" },
};

const aboutPages = [
  {
    href: "/ueber-uns/social-media",
    title: "Social Media",
    description: "Unsere verifizierten Kanäle für Austausch, Videos und Themen aus dem Alltag Alleinerziehender.",
  },
  {
    href: "/ueber-uns/bewertungen",
    title: "Bewertungen & Erfahrungen",
    description: "Externe Bewertungen und Erfahrungen mit alleinerziehende-singles.de im Überblick.",
  },
  {
    href: "/ueber-uns/kooperationen",
    title: "Kooperationen",
    description: "Informationen für Medien, Communities, Portale und mögliche Kooperationspartner.",
  },
];

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Über alleinerziehende-singles.de</p>
        <h1>Mehr Vertrauen, mehr Einblicke, mehr Verständnis</h1>
        <p className={styles.lead}>
          alleinerziehende-singles.de bringt Mütter und Väter zusammen, die ihre besondere
          Lebenssituation nicht erst erklären möchten. Hier findest Du die wichtigsten Hintergründe,
          offiziellen Kanäle und unabhängigen Bewertungen unserer Plattform.
        </p>
      </section>

      <section className={styles.gridSection}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Direkt entdecken</p>
          <h2>Die wichtigsten Hintergrundseiten</h2>
          <p>
            Alle verifizierten Hintergrundinhalte sind jetzt zentral und übersichtlich im Bereich
            „Über uns“ gebündelt.
          </p>
        </div>
        <div className={styles.cityGrid}>
          {aboutPages.map((page) => (
            <article key={page.href} className={styles.cityCard}>
              <h3>{page.title}</h3>
              <p>{page.description}</p>
              <Link href={page.href}>Mehr erfahren</Link>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.ctaCard}>
        <h2>Du möchtest neue Menschen kennenlernen?</h2>
        <p>
          Entdecke Alleinerziehende aus Deiner Region oder starte direkt mit einem kostenlosen Profil.
        </p>
        <div className={styles.linkList}>
          <Link href="/partnersuche">Singles nach Stadt entdecken</Link>
          <a href="https://alleinerziehende-singles.de/registration/">Kostenlos registrieren</a>
        </div>
      </section>
    </main>
  );
}
