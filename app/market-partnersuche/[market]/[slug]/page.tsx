import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import {
  getMarketCityPage,
  getMarketCityPages,
  type RegionalMarket,
} from "@/lib/market-icony-import";
import { isMarketCode, publicUrl } from "@/lib/markets";
import styles from "../../../imported-page.module.css";

type Props = { params: Promise<{ market: string; slug: string }> };

function activeMarket(value: string): RegionalMarket {
  if (!isMarketCode(value) || value === "de") notFound();
  return value;
}

export function generateStaticParams() {
  return (["at", "ch"] as const).flatMap((market) =>
    getMarketCityPages(market).map((page) => ({ market, slug: page.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const values = await params;
  const market = activeMarket(values.market);
  const page = getMarketCityPage(market, values.slug);
  if (!page) return { title: { absolute: "Regionale Partnersuche" }, robots: { index: false, follow: false } };

  return {
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical: publicUrl(market, page.path) },
    robots: { index: true, follow: true },
  };
}

export default async function MarketCityPage({ params }: Props) {
  const values = await params;
  const market = activeMarket(values.market);
  const page = getMarketCityPage(market, values.slug);
  if (!page) notFound();

  const otherCities = getMarketCityPages(market).filter((city) => city.slug !== page.slug).slice(0, 6);

  return (
    <SiteShell market={market}>
      <main className={styles.page}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Regionale Partnersuche für Alleinerziehende</p>
          <h1>{page.heroTitle}</h1>
          <p className={styles.lead}>{page.description}</p>
        </section>

        <section className={styles.layout}>
          <article className={styles.article}>
            <div dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
            {page.image?.sourceAttributionUrl ? (
              <p className={styles.sourceNote}>
                Bildquelle: <a href={page.image.sourceAttributionUrl} rel="noreferrer" target="_blank">Pixabay</a>
              </p>
            ) : null}
          </article>

          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <h2>Weitere Städte entdecken</h2>
              <div className={styles.linkList}>
                <a href={publicUrl(market, "/partnersuche")}>Alle Städte ansehen</a>
                {otherCities.map((city) => (
                  <a key={city.slug} href={publicUrl(market, city.path)}>{city.cityLabel}</a>
                ))}
              </div>
            </div>
            <div className={styles.ctaCard}>
              <h2>Singles in {page.cityLabel} kennenlernen</h2>
              <p>Die aktuellen Profile werden über die bestehende ICONY-Plattform bereitgestellt.</p>
              <a href={publicUrl(market, "/registration/")}>Kostenlos registrieren</a>
            </div>
          </aside>
        </section>

        <section className={styles.gridSection} aria-labelledby="city-singles-heading">
          <div className={styles.sectionHeader}>
            <h2 id="city-singles-heading">Singles aus {page.cityLabel}</h2>
            <p>Aktuelle Kontakte aus der bestehenden Länderplattform.</p>
          </div>
          <iframe
            className={styles.iconyFrame}
            src={page.icony.frameUrl}
            title={`Singles aus ${page.cityLabel}`}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </section>
      </main>
    </SiteShell>
  );
}
