import { SEARCH_PATH } from "@/lib/site-search";
import styles from "./about-search-form.module.css";

// GET-Formular auf /ueber-uns/suche/ (relativ: nginx reicht /ueber-uns/ an Next.js durch).
export function AboutSearchForm({ defaultValue = "", autoFocus = false }: { defaultValue?: string; autoFocus?: boolean }) {
  return (
    <form className={styles.form} action={SEARCH_PATH} method="get" role="search">
      <label className={styles.label} htmlFor="seitensuche-q">Magazin, Städte und FAQ durchsuchen</label>
      <div className={styles.row}>
        <input
          className={styles.input}
          id="seitensuche-q"
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder="z. B. Kindergeld, Berlin oder Unterhalt"
          autoComplete="off"
          maxLength={100}
          autoFocus={autoFocus}
        />
        <button className={styles.button} type="submit">Suchen</button>
      </div>
    </form>
  );
}
