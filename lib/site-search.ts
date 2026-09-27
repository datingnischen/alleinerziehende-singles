// Seitensuche unter /ueber-uns/suche/. Reine Funktionen ohne Datenzugriff, damit Tests sie direkt laden können.
// Die Suche liegt bewusst unter Über uns: nginx reicht /ueber-uns/ an Next.js durch, /suche gehört ICONY.

export const SEARCH_PATH = "/ueber-uns/suche/";
export const MAX_SEARCH_RESULTS = 50;

export type SearchDocument = {
  area: string;
  title: string;
  href: string;
  excerpt: string;
  text?: string;
};

export type SearchResult = SearchDocument & { score: number };

const HTML_ENTITIES: Record<string, string> = {
  amp: "&",
  quot: '"',
  apos: "'",
  lt: "<",
  gt: ">",
  nbsp: " ",
  auml: "ä",
  ouml: "ö",
  uuml: "ü",
  Auml: "Ä",
  Ouml: "Ö",
  Uuml: "Ü",
  szlig: "ß",
  hellip: "…",
  ndash: "–",
  mdash: "—",
  bdquo: "„",
  ldquo: "“",
  rdquo: "”",
};

export function htmlToText(html: string): string {
  return html
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, name: string) => HTML_ENTITIES[name] ?? match)
    .replace(/\s+/g, " ")
    .trim();
}

/** Kleinschreibung, ä/ö/ü/ß wie ae/oe/ue/ss, übrige Diakritika weg. */
export function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function shortExcerpt(text: string, maxLength = 180): string {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:–-]+$/, "")} …`;
}

export function searchDocuments(
  documents: SearchDocument[],
  query: string,
  limit = MAX_SEARCH_RESULTS,
): SearchResult[] {
  const terms = normalizeSearchText(query).split(" ").filter(Boolean);
  if (terms.length === 0) return [];
  const phrase = terms.join(" ");

  const results: SearchResult[] = [];
  const seen = new Set<string>();

  for (const document of documents) {
    if (seen.has(document.href)) continue;
    const title = normalizeSearchText(document.title);
    const excerpt = normalizeSearchText(document.excerpt);
    const text = normalizeSearchText(document.text ?? "");

    let score = 0;
    let allTermsFound = true;
    for (const term of terms) {
      if (title.includes(term)) score += 100;
      else if (excerpt.includes(term)) score += 20;
      else if (text.includes(term)) score += 5;
      else allTermsFound = false;
    }
    if (!allTermsFound) continue;

    if (title === phrase) score += 200;
    else if (title.startsWith(phrase)) score += 80;
    else if (terms.length > 1 && title.includes(phrase)) score += 50;

    seen.add(document.href);
    results.push({ ...document, score });
  }

  return results
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "de"))
    .slice(0, limit);
}
