import { MAGAZINE_THEMES, type MagazineTheme } from "./magazine.ts";
import { getMagazineSlugs, getMagazineEntryBySlug, type MagazineEntry } from "./magazine-content.ts";
import { publicUrl, type MarketCode } from "./markets.ts";

/**
 * Das Magazin ist ein gemeinsamer Bestand für DE, AT und CH (content/magazin). Die Landesdomains zeigen dieselben
 * Artikel unter ihrer eigenen Adresse mit Canonical auf die DE-URL. Nur das deutsche Kindergeld (Themenwelt,
 * Auszahlungstermine, Kindergeld-Ratgeber) bleibt DE-spezifisch: in Österreich heißt es Familienbeihilfe, in der
 * Schweiz Kinderzulage – diese Inhalte erscheinen auf .at/.ch nicht.
 */

export const KINDERGELD_CATEGORY_ID = 8;

export function isKindergeldEntry(entry: Pick<MagazineEntry, "slug" | "categoryIds">): boolean {
  return entry.categoryIds.includes(KINDERGELD_CATEGORY_ID) || /^kindergeld/.test(entry.slug);
}

/** Artikel, die ein Markt zeigt: DE alles, AT/CH ohne Kindergeld. */
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

/** Slugs, die ein Markt als eigene Seite ausliefert (generateStaticParams). */
export function marketMagazineSlugs(market: MarketCode): string[] {
  return getMagazineSlugs().filter((slug) => {
    const entry = getMagazineEntryBySlug(slug);
    return entry ? entryAvailableInMarket(market, entry) : false;
  });
}

let kindergeldSlugCache: Set<string> | null = null;

function kindergeldSlugs(): Set<string> {
  if (!kindergeldSlugCache) {
    kindergeldSlugCache = new Set(
      getMagazineSlugs().filter((slug) => {
        const entry = getMagazineEntryBySlug(slug);
        return entry ? isKindergeldEntry(entry) : false;
      }),
    );
  }
  return kindergeldSlugCache;
}

/**
 * Artikel-HTML für eine Landesdomain: Links auf Kindergeld-Seiten und auf deutsche Stadtseiten (/partnersuche/…)
 * gehen absolut auf alleinerziehende-singles.de, weil es diese Seiten auf .at/.ch nicht gibt. Alle übrigen
 * relativen Links (Magazin, FAQ, Über uns) bleiben auf der Landesdomain.
 */
export function localizeMagazineHtml(market: MarketCode, html: string): string {
  if (market === "de") return html;
  const kindergeld = kindergeldSlugs();
  return html
    .replace(/href="\/magazin\/([a-z0-9-]+)\/"/gi, (match, slug: string) =>
      kindergeld.has(slug) ? `href="${publicUrl("de", `/magazin/${slug}/`)}"` : match,
    )
    .replace(/href="\/partnersuche\/([^"]*)"/gi, (_match, rest: string) => `href="${publicUrl("de", `/partnersuche/${rest}`)}"`);
}
