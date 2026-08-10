import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import {
  getMarket,
  isMarketCode,
  previewPath,
  publicUrl,
  type MarketCode,
} from "@/lib/markets";
import styles from "./page.module.css";

const MARKET_COPY = {
  at: {
    heading: "Alleinerziehende Singles in Österreich finden",
    regionHeading: "Partnersuche in Österreich",
    intro:
      "Alleinerziehende haben oft wenig Zeit, um neue Menschen kennenzulernen. Hier findest du einen geschützten Einstieg für Mütter und Väter in Österreich, die Verständnis, Freundschaft oder eine neue Partnerschaft suchen.",
    region:
      "Ob Wien, Graz, Linz, Salzburg, Innsbruck oder eine kleinere Stadt: Die Partnersuche ist auf Kontakte aus Österreich ausgerichtet und lässt sich flexibel in deinen Familienalltag integrieren.",
    tips:
      "Sei offen über deine Familiensituation, gib neuen Kontakten Zeit und achte auf eine Balance zwischen Kennenlernen und elterlichen Aufgaben.",
    entryPages: [
      {
        title: "Partnersuche in Österreich",
        description: "Der wichtigste Überblick für Städte, regionale Tipps und erste passende Kontakte.",
        href: "/partnersuche",
      },
      {
        title: "Wien kennenlernen",
        description: "Direkt zur größten Partnersuche-Seite für alleinerziehende Singles in Österreich.",
        href: "/partnersuche/wien",
      },
      {
        title: "Graz entdecken",
        description: "Ein guter Einstieg für Singles aus der Steiermark und dem Großraum Graz.",
        href: "/partnersuche/graz",
      },
      {
        title: "Salzburg aufrufen",
        description: "Schnell zur regionalen Seite für Salzburg und passende neue Kontakte.",
        href: "/partnersuche/salzburg",
      },
    ],
  },
  ch: {
    heading: "Alleinerziehende Singles in der Schweiz",
    regionHeading: "Partnersuche in der Schweiz",
    intro:
      "Alleinerziehende Singles brauchen eine Partnersuche, die wenig Zeit verlangt und ihre Lebenssituation versteht. Hier triffst du Mütter und Väter in der Schweiz, die ebenfalls offen für Freundschaft oder eine neue Liebe sind.",
    region:
      "Von Zürich, Basel und Bern bis Genf, Lausanne und Lugano: Der Schweizer Bereich hilft dir, verständnisvolle Kontakte aus deiner Region zu entdecken.",
    tips:
      "Ehrlichkeit, Geduld und ein behutsames Einbeziehen der Kinder schaffen eine gute Basis, wenn aus einem Kontakt eine feste Beziehung wird.",
    entryPages: [
      {
        title: "Partnersuche in der Schweiz",
        description: "Der wichtigste Überblick für Regionen, Städte und den Einstieg in die Schweizer Partnersuche.",
        href: "/partnersuche",
      },
      {
        title: "Zürich kennenlernen",
        description: "Direkt zur meistgesuchten regionalen Einstiegsseite für den Raum Zürich.",
        href: "/partnersuche/zuerich",
      },
      {
        title: "Bern entdecken",
        description: "Ein schneller Weg zu regionalen Tipps und neuen Kontakten in Bern.",
        href: "/partnersuche/bern",
      },
      {
        title: "Basel aufrufen",
        description: "Direkt zur wichtigen Schweizer Städteroute für Basel und Umgebung.",
        href: "/partnersuche/basel",
      },
    ],
  },
} as const;

type PageProps = { params: Promise<{ market: string }> };

function activeMarket(value: string): "at" | "ch" {
  if (!isMarketCode(value) || value === "de") notFound();
  return value;
}

export function generateStaticParams() {
  return [{ market: "at" }, { market: "ch" }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const market = activeMarket((await params).market);
  const copy = MARKET_COPY[market];

  return {
    title: { absolute: copy.heading },
    description: `${copy.heading}: sichere Partnersuche für Mütter und Väter mit Kindern.`,
    alternates: { canonical: publicUrl(market) },
    robots: { index: true, follow: true },
  };
}

export default async function MarketHomePage({ params }: PageProps) {
  const market = activeMarket((await params).market);
  const config = getMarket(market);
  const copy = MARKET_COPY[market];

  return (
    <SiteShell market={market}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Partnersuche mit Verständnis</p>
            <h1>{copy.heading}</h1>
            <p>{copy.intro}</p>
            <div className={styles.actions}>
              <a className={styles.primary} href={publicUrl(market, "/registration/")}>Kostenlos registrieren</a>
              <a className={styles.secondary} href={publicUrl(market, "/partnersuche")}>Singles nach Stadt entdecken</a>
              <a className={styles.secondary} href={publicUrl(market, "/faq")}>Häufige Fragen</a>
            </div>
          </div>
          <Image
            className={styles.heroImage}
            src={config.heroPath}
            alt="Alleinerziehende Mutter mit Kind auf dem Weg zu einem neuen Kontakt"
            width={1264}
            height={711}
            priority
          />
        </section>

        <section className={styles.cardGrid}>
          <article>
            <p className={styles.cardEyebrow}>Regional</p>
            <h2>{copy.regionHeading}</h2>
            <p>{copy.region}</p>
          </article>
          <article>
            <p className={styles.cardEyebrow}>Sicher</p>
            <h2>Profile mit redaktioneller Kontrolle</h2>
            <p>Datenschutz, geprüfte Profile und transparente Mitgliedschaften geben dir einen verlässlichen Rahmen für neue Begegnungen.</p>
          </article>
          <article>
            <p className={styles.cardEyebrow}>Alltagstauglich</p>
            <h2>Tipps für das Kennenlernen</h2>
            <p>{copy.tips}</p>
          </article>
        </section>

        <section className={styles.entrySection}>
          <div className={styles.entrySectionHeader}>
            <p className={styles.eyebrow}>Wichtige Einstiegsseiten</p>
            <h2>Schnell zu den wichtigsten Seiten auf Vercel</h2>
            <p>
              Diese Einstiege führen direkt zu den wichtigsten erreichbaren Seiten für {config.countryName.toLowerCase()}.
            </p>
          </div>
          <div className={styles.entryGrid}>
            {copy.entryPages.map((entry) => (
              <a className={styles.entryCard} href={previewPath(market, entry.href)} key={entry.href}>
                <strong>{entry.title}</strong>
                <span>{entry.description}</span>
              </a>
            ))}
          </div>
        </section>

        <section className={styles.expert}>
          <div>
            <p className={styles.eyebrow}>Begleiteter Ratgeber</p>
            <h2>Verständnis für Liebe mit Kind</h2>
          </div>
          <p>
            Christian M. Haas begleitet den Ratgeber-Bereich als erfahrener Datingexperte. Sein Fokus liegt auf fairer, respektvoller Partnersuche für Menschen in besonderen Lebenssituationen.
          </p>
        </section>

        <section className={styles.countries} aria-label="Weitere Länder">
          {(["de", "at", "ch"] as MarketCode[]).map((target) => {
            const targetConfig = getMarket(target);
            return (
              <a key={target} href={publicUrl(target)} aria-current={target === market ? "page" : undefined}>
                <span>{targetConfig.countryName}</span>
                <strong>{targetConfig.domain}</strong>
              </a>
            );
          })}
        </section>
      </main>
    </SiteShell>
  );
}
