import { MAGAZINE_THEMES, type MagazineTheme } from "./magazine.ts";
import type { MagazineEntry } from "./magazine-content.ts";
import type { MarketCode } from "./markets.ts";

/**
 * Das Magazin ist ein gemeinsamer Bestand für DE, AT und CH (content/magazin). Artikel gibt es nur einmal, auf
 * alleinerziehende-singles.de; die Landesdomains zeigen Übersicht und Teaser und verlinken den DE-Artikel
 * (kein Duplicate Content). Nur das deutsche Kindergeld (Themenwelt, Auszahlungstermine, Kindergeld-Ratgeber) bleibt
 * DE-spezifisch: in Österreich heißt es Familienbeihilfe, in der Schweiz Kinderzulage – diese Teaser erscheinen auf
 * .at/.ch nicht.
 */

export const KINDERGELD_CATEGORY_ID = 8;

export function isKindergeldEntry(entry: Pick<MagazineEntry, "slug" | "categoryIds">): boolean {
  return entry.categoryIds.includes(KINDERGELD_CATEGORY_ID) || /^kindergeld/.test(entry.slug);
}

/** Einträge, die ein Markt in Übersicht, Teasern und Suche zeigt: DE alles, AT/CH ohne Kindergeld. */
export function entryAvailableInMarket(market: MarketCode, entry: Pick<MagazineEntry, "slug" | "categoryIds">): boolean {
  return market === "de" || !isKindergeldEntry(entry);
}

/** Themenwelten eines Markts (AT/CH ohne Kindergeld). */
export function marketThemes(market: MarketCode): MagazineTheme[] {
  return market === "de" ? MAGAZINE_THEMES : MAGAZINE_THEMES.filter((theme) => theme.key !== "kindergeld");
}

export function marketThemeBySlug(market: MarketCode, slug: string | undefined): MagazineTheme | null {
  return marketThemes(market).find((theme) => theme.slug === slug) ?? null;
}
