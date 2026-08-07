import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { getMarket, isMarketCode, publicUrl } from "@/lib/markets";
import styles from "../../market-home/[market]/page.module.css";

type PageProps = {
  params: Promise<{ market: string }>;
  searchParams: Promise<{ requestedPath?: string }>;
};

function unavailableRouteMarket(value: string): "at" | "ch" {
  if (!isMarketCode(value) || value === "de") notFound();
  return value;
}

export async function generateMetadata({ params }: Pick<PageProps, "params">): Promise<Metadata> {
  const market = unavailableRouteMarket((await params).market);
  const config = getMarket(market);

  return {
    title: { absolute: "Seite noch nicht verfügbar" },
    description: `Dieser Inhalt ist auf ${config.domain} noch nicht veröffentlicht.`,
    robots: { index: false, follow: false },
  };
}

export default async function MarketPlaceholderPage({ params, searchParams }: PageProps) {
  const market = unavailableRouteMarket((await params).market);
  const config = getMarket(market);
  const requestedPath = (await searchParams).requestedPath || "/";

  return (
    <SiteShell market={market}>
      <main className={styles.main}>
        <section className={styles.expert}>
          <div>
            <p className={styles.eyebrow}>{config.countryName}</p>
            <h1>Dieser Inhalt ist in diesem Länderbereich noch nicht veröffentlicht.</h1>
          </div>
          <div>
            <p>
              Der Pfad <strong>{requestedPath}</strong> wird nicht mit Inhalten aus einem anderen Land gefüllt. Bitte nutze die Länderstartseite oder die bestehende Plattform.
            </p>
            <div className={styles.actions}>
              <a className={styles.primary} href={publicUrl(market)}>Zur Länderstartseite</a>
              <a className={styles.secondary} href={publicUrl(market, "/registration/")}>Kostenlos registrieren</a>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
