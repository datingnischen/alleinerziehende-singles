"use client";

import { usePreviewHost } from "@/components/market-link";
import { previewPath, publicUrl, type MarketCode } from "@/lib/markets";
import { SEARCH_PATH } from "@/lib/site-search";
import styles from "./about-search-form.module.css";

// GET-Formular auf /ueber-uns/suche/ (relativ: nginx reicht /ueber-uns/ an Next.js durch).
// AT/CH: Live-URL der Landesdomain, in der Vorschau (localhost, *.vercel.app) der Vercel-Pfad /at/ueber-uns/suche/.
export function AboutSearchForm({ market = "de", defaultValue = "", autoFocus = false }: { market?: MarketCode; defaultValue?: string; autoFocus?: boolean }) {
  const preview = usePreviewHost();
  const action = market === "de" ? SEARCH_PATH : preview ? previewPath(market, SEARCH_PATH) : publicUrl(market, SEARCH_PATH);
  return (
    <form className={styles.form} action={action} method="get" role="search">
      <label className={styles.label} htmlFor="seitensuche-q">Magazin, Städte und FAQ durchsuchen</label>
      <div className={styles.row}>
        <input
          className={styles.input}
          id="seitensuche-q"
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder={market === "de" ? "z. B. Kindergeld, Berlin oder Unterhalt" : market === "at" ? "z. B. Wien, erstes Date oder Unterhalt" : "z. B. Zürich, erstes Date oder Unterhalt"}
          autoComplete="off"
          maxLength={100}
          autoFocus={autoFocus}
        />
        <button className={styles.button} type="submit">Suchen</button>
      </div>
    </form>
  );
}
