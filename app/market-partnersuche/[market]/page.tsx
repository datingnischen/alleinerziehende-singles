import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import {
  getMarketCityPages,
  getMarketPartnersucheHub,
  type RegionalMarket,
} from "@/lib/market-icony-import";
import { isMarketCode, publicUrl } from "@/lib/markets";
import styles from "../../imported-page.module.css";

type Props = { params: Promise<{ market: string }> };

function relativeCityHref(slug: string) {
  return `partnersuche/${slug}`;
}

function cityCardExcerpt(description: string) {
  const firstSentence = description.match(/.*?[.!?](?:\s|$)/)?.[0]?.trim();
  return firstSentence && firstSentence.length >= 60 ? firstSentence : description;
}

function activeMarket(value: string): RegionalMarket {
  if (!isMarketCode(value) || value === "de") notFound();
  return value;
}

export function generateStaticParams() {
  return [{ market: "at" }, { market: "ch" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const market = activeMarket((await params).market);
  const page = getMarketPartnersucheHub(market);

  return {
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical: publicUrl(market, "/partnersuche") },
    robots: { index: true, follow: true },
  };
}

export default async function MarketPartnersuchePage({ params }: Props) {
  const market = activeMarket((await params).market);
  const page = getMarketPartnersucheHub(market);
  const cities = getMarketCityPages(market);

  return (
    <SiteShell market={market}>
      <main className={styles.page}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Städte & regionale Partnersuche</p>
          <h1>{page.heroTitle}</h1>
          <p className={styles.lead}>{page.description}</p>
        </section>

        <section className={styles.layout}>
          <article className={styles.article}>
            <div dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
          </article>

          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <h2>Städte im Überblick</h2>
              <p>Wähle direkt Deinen Einstieg in der Region, die am besten zu Deinem Alltag passt.</p>
              <div className={styles.sidebarCityGrid}>
                {cities.map((city) => (
                  <a className={styles.sidebarCityLink} key={city.slug} href={relativeCityHref(city.slug)}>
                    {city.image ? <img src={city.image.url} alt="" aria-hidden="true" /> : null}
                    <span>{city.cityLabel}</span>
                  </a>
                ))}
              </div>
            </div>
            <div className={styles.ctaCard}>
              <h2>Direkt Kontakte finden</h2>
              <p>Starte kostenlos und lerne andere alleinerziehende Singles aus Deinem Land kennen.</p>
              <a href={publicUrl(market, "/registration/")}>Kostenlos registrieren</a>
            </div>
          </aside>
        </section>

        <section className={styles.gridSection}>
          <div className={styles.sectionHeader}>
            <h2>Alle regionalen Ratgeber</h2>
            <p>Wähle Deine Stadt und entdecke lokale Tipps, Orte und passende Kontakte.</p>
          </div>
          <div className={styles.cityGrid}>
            {cities.map((city) => (
              <article className={styles.cityCard} key={city.slug}>
                <div className={styles.cityCardMedia}>
                  {city.image ? <img src={city.image.url} alt={city.image.alt || `Stadtansicht ${city.cityLabel}`} /> : null}
                  <span>{city.cityLabel}</span>
                </div>
                <div className={styles.cityCardCopy}>
                  <span className={styles.cityCardEyebrow}>Regionale Partnersuche</span>
                  <h3>{city.cityLabel}</h3>
                  <p>{cityCardExcerpt(city.description)}</p>
                </div>
                <a href={relativeCityHref(city.slug)}>Mehr zu {city.cityLabel}</a>
              </article>
            ))}
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
