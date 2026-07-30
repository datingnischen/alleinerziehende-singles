import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServicePageBySlug, servicePages } from "@/lib/service-pages";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return servicePages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getServicePageBySlug(slug);

  if (!page) {
    return { title: "Alleinerziehende-Singles.de" };
  }

  return {
    title: page.title,
    description: page.description,
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const page = getServicePageBySlug(slug);

  if (!page) {
    notFound();
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>{page.eyebrow}</p>
        <h1>{page.title}</h1>
        <p className={styles.lead}>{page.heroLead}</p>
        <div className={styles.highlightRow}>
          {page.highlights.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      <section className={styles.layout}>
        <article className={styles.article}>
          {page.sections.map((section) => (
            <section className={styles.section} key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.bullets?.length ? (
                <ul>
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </article>

        <aside className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <h2>Passende nächste Schritte</h2>
            <div className={styles.sidebarLinks}>
              <Link href="/magazin">Magazin entdecken</Link>
              <Link href="/bewertungen-und-erfahrungen">Erfahrungen lesen</Link>
              <Link href="/hilfe">Hilfe & Support</Link>
            </div>
          </div>

          <div className={styles.ctaCard}>
            <h2>Bereit für neue Kontakte?</h2>
            <p>Wenn Du nicht nur lesen, sondern selbst passende Menschen kennenlernen willst, starte direkt mit Deinem Profil.</p>
            <a href={page.ctaHref} target="_blank" rel="noreferrer">
              {page.ctaLabel}
            </a>
          </div>
        </aside>
      </section>
    </main>
  );
}
