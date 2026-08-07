import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconySinglesWidget } from "@/components/icony-singles-widget";
import { getImportedCityPageBySlug, importedCityPages } from "@/lib/icony-import";
import { getIconyWidgetConfig } from "@/lib/icony-widget-config";
import styles from "../../imported-page.module.css";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return importedCityPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getImportedCityPageBySlug(slug);

  if (!page) {
    return { title: "Partnersuche | Alleinerziehende-Singles.de" };
  }

  return {
    title: page.title,
    description: page.description,
  };
}

export default async function PartnersucheCityPage({ params }: Props) {
  const { slug } = await params;
  const page = getImportedCityPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const widgetConfig = getIconyWidgetConfig(slug);
  const otherCities = importedCityPages.filter((city) => city.slug !== slug).slice(0, 6);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Regionale Partnersuche für Alleinerziehende</p>
        <h1>{page.heroTitle}</h1>
        <p className={styles.lead}>{page.description}</p>
      </section>

      {widgetConfig ? (
        <IconySinglesWidget
          city={widgetConfig.city}
          zip={widgetConfig.zip}
          country={widgetConfig.country}
          platformId={widgetConfig.platformId}
        />
      ) : null}

      <section className={styles.layout}>
        <article className={styles.article}>
          <div dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
        </article>

        <aside className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <h2>Weitere Städte entdecken</h2>
            <div className={styles.linkList}>
              <Link href="/partnersuche">Alle Städte ansehen</Link>
              {otherCities.map((city) => (
                <Link key={city.slug} href={city.path}>
                  {city.cityLabel}
                </Link>
              ))}
            </div>
          </div>

          <div className={styles.ctaCard}>
            <h2>Direkt Singles in {page.cityLabel} finden</h2>
            <p>
              Wenn Du direkt loslegen willst, starte jetzt mit Deiner kostenlosen Registrierung.
            </p>
            <a href="https://alleinerziehende-singles.de/registration/" target="_blank" rel="noreferrer">
              Kostenlos registrieren
            </a>
          </div>
        </aside>
      </section>
    </main>
  );
}
