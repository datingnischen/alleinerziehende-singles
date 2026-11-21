export type CityQuizHint = { before: string; anchor: string; href: string; after: string };

/**
 * Redaktioneller Hinweis auf eine eigene Verteilerseite, bewusst nur auf einzelnen Stadtseiten eines Marktes
 * und nicht in der Vorlage für alle Städte (2026-11-21, koelner-singles.de). Je Seite eigener Text und Ankertext.
 */
const HINTS: Record<string, CityQuizHint> = {
  "de:koeln": {
    before: "Neben Beratung und Betreuung suchst Du in Köln auch Menschen mit ähnlichen Interessen? Der ",
    anchor: "Kölner Wegweiser zu den Nischenbörsen",
    href: "https://koelner-singles.de/#quiz",
    after: " stellt Dir drei Fragen und nennt Dir danach das passende Portal.",
  },
};

export function cityQuizHint(market: string, slug: string): CityQuizHint | null {
  return HINTS[`${market}:${slug}`] ?? null;
}
