import { buildIndividualSearchUrl } from "@/lib/city-search-postcodes.mjs";
import type { MarketCode } from "@/lib/markets";
import styles from "./city-search-fallback.module.css";

type Props = {
  market: MarketCode;
};

export function CitySearchFallback({ market }: Props) {
  return (
    <aside className={styles.fallback} aria-labelledby={`city-search-fallback-${market}`}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>Individuelle Suche</p>
        <h2 id={`city-search-fallback-${market}`}>Deine Stadt fehlt? Such direkt in Deiner Umgebung.</h2>
        <p>
          Nicht jede Stadt hat eine eigene Seite – alleinerziehende Mütter und Väter gibt es trotzdem auch in
          Deiner Nähe. In der individuellen Suche legst Du Ort, Umkreis und Alter selbst fest und siehst, wer
          in Deiner Region ebenfalls Familie und Partnersuche unter einen Hut bringt.
        </p>
      </div>
      <a className={styles.button} href={buildIndividualSearchUrl(market)}>
        Zur individuellen Suche
      </a>
    </aside>
  );
}
