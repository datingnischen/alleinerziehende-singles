import type { Metadata } from "next";
import Link from "next/link";
import { importedCityPages, importedPartnersucheHub } from "@/lib/icony-import";
import styles from "../imported-page.module.css";

const HUB_ONLINE_WIDGET_URL = "https://js.icony.com/frame/?h=300&id=alleinerziehende&pc=eeaf0c&ds=&ctr=49&it=1";

function extractLeadImage(html: string) {
  const match = html.match(/<p>\s*(<img[^>]+>)\s*(?:&nbsp;|&#160;)?\s*<\/p>/i);
  return match?.[1] ?? null;
}

function stripLegacyCityLists(html: string) {
  return html
    .replace(/<p>\s*<img[^>]+>\s*(?:&nbsp;|&#160;)?\s*<\/p>/i, "")
    .replace(/<ul[\s\S]*?<\/ul>/gi, "")
    .replace(/<p>\s*(?:&nbsp;|&#160;|\s)*<\/p>/gi, "")
    .trim();
}

function cityCardExcerpt(description: string) {
  const firstSentence = description.match(/.*?[.!?](?:\s|$)/)?.[0]?.trim();
  return firstSentence && firstSentence.length >= 60 ? firstSentence : description;
}

export const metadata: Metadata = {
  title: importedPartnersucheHub.title,
  description: importedPartnersucheHub.description,
};

export default function PartnersucheHubPage() {
  const heroImageHtml = extractLeadImage(importedPartnersucheHub.contentHtml);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopyBlock}>
          <p className={styles.eyebrow}>Städte & regionale Partnersuche</p>
          <h1>{importedPartnersucheHub.heroTitle}</h1>
          <p className={styles.lead}>{importedPartnersucheHub.description}</p>
        </div>
        {heroImageHtml ? (
          <div className={styles.heroMediaLarge} dangerouslySetInnerHTML={{ __html: heroImageHtml }} />
        ) : null}
      </section>

      <section className={styles.layout}>
        <div className={styles.gridSection}>
          <div className={styles.sectionHeader}>
            <h2>Städte im Überblick</h2>
            <p>
              Finde direkt den passenden regionalen Einstieg und entdecke, wo Du in Deiner Stadt
              verständnisvolle Kontakte, Tipps und Unterstützung findest.
            </p>
          </div>

          <div className={styles.cityGrid}>
            {importedCityPages.map((city) => (
              <article className={styles.cityCard} key={city.slug}>
                <div className={styles.cityCardMedia} aria-hidden="true">
                  <span>{city.cityLabel}</span>
                </div>
                <div className={styles.cityCardCopy}>
                  <span className={styles.cityCardEyebrow}>Regionale Partnersuche</span>
                  <h3>Singles in {city.cityLabel}</h3>
                  <p>{cityCardExcerpt(city.description)}</p>
                </div>
                <Link href={city.path}>Singles aus {city.cityLabel} entdecken</Link>
              </article>
            ))}
          </div>
        </div>

        <article className={styles.article}>
          <div dangerouslySetInnerHTML={{ __html: stripLegacyCityLists(importedPartnersucheHub.contentHtml) }} />
        </article>

        <aside className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <h2>Schnelleinstiege</h2>
            <div className={styles.linkList}>
              <Link href="/faq">FAQ</Link>
              <Link href="/ueber-uns/bewertungen">Erfahrungen</Link>
              <Link href="/ueber-uns/social-media">Social Media</Link>
              <Link href="/magazin">Magazin</Link>
            </div>
          </div>

          <div className={styles.ctaCard}>
            <h2>Wer ist gerade online?</h2>
            <p>
              Sieh direkt nach neuen Kontakten auf alleinerziehende-singles.de und starte kostenlos, wenn jemand zu Dir passt.
            </p>
            <iframe
              className={styles.sidebarWidgetFrame}
              src={HUB_ONLINE_WIDGET_URL}
              title="Wer ist gerade online auf alleinerziehende-singles.de"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
            <a href="https://alleinerziehende-singles.de/registration/" target="_blank" rel="noreferrer">
              Kostenlos registrieren
            </a>
          </div>
        </aside>
      </section>
    </main>
  );
}
