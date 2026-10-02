import type { MagazinePageLink } from "./magazine-content.ts";

/** Themenwelten des Magazins, abgebildet auf die WordPress-Kategorien. */
export type MagazineTheme = {
  key: "partnersuche" | "singleleben" | "kindergeld";
  slug: string;
  categoryId: number;
  title: string;
  short: string;
  text: string;
};

export const MAGAZINE_THEMES: MagazineTheme[] = [
  { key: "partnersuche", slug: "singleboersen", categoryId: 26, title: "Partnersuche & Dating mit Kind", short: "Dating mit Kind", text: "Ehrliche Tipps für Neuanfang, erste Dates und neue Kontakte – wenn Kinder zum Leben dazugehören." },
  { key: "singleleben", slug: "singleleben", categoryId: 1, title: "Singleleben & Familienalltag", short: "Familienalltag", text: "Elternzeit, Unterhalt, Beruf und Alltag: Wissen, das Alleinerziehenden den Rücken freihält." },
  { key: "kindergeld", slug: "kindergeld", categoryId: 8, title: "Kindergeld & Finanzen", short: "Kindergeld", text: "Auszahlungstermine Monat für Monat, Anträge und finanzielle Hilfen im Überblick." },
];

/** Artikel ohne die monatlichen Kindergeld-Termine: Partnersuche + Singleleben. */
export const EDITORIAL_CATEGORY_IDS = [26, 1];

export function themeForCategories(ids: number[]): MagazineTheme | null {
  return MAGAZINE_THEMES.find((theme) => ids.includes(theme.categoryId)) ?? null;
}

export function themeBySlug(slug: string | undefined): MagazineTheme | null {
  return MAGAZINE_THEMES.find((theme) => theme.slug === slug) ?? null;
}

export function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8211;|&ndash;/g, "–")
    .replace(/&#8222;|&bdquo;/g, "„")
    .replace(/&#8220;|&ldquo;/g, "“")
    .replace(/&#8230;|&hellip;/g, "…")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, " ")
    .trim();
}

/** Auszug als Text: ohne Audio-Player-Hinweis („Artikel kurz anhören …“) und ohne „[…]“ am Ende. */
export function excerptText(html: string): string {
  return stripTags(html)
    .replace(/^Artikel kurz anhören[\s\S]*?Audio-Element nicht\.?\s*/i, "")
    .replace(/\s*\[(?:…|\.\.\.)\]\s*$/, "…")
    .trim();
}

export function readingMinutes(html: string): number {
  return Math.max(1, Math.round(stripTags(html).split(" ").length / 200));
}

function slugify(value: string) {
  return value.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

/** Vergibt Anker an die h2 des Artikels und liefert das Inhaltsverzeichnis. */
export function withHeadingAnchors(html: string): { html: string; toc: { id: string; title: string }[] } {
  const toc: { id: string; title: string }[] = [];
  const used = new Set<string>();
  const result = html.replace(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi, (match, attrs: string, inner: string) => {
    const title = stripTags(inner);
    if (!title) return match;
    const existing = attrs.match(/\bid="([^"]+)"/)?.[1];
    let id = existing || slugify(title) || `abschnitt-${toc.length + 1}`;
    while (used.has(id)) id = `${id}-${toc.length + 1}`;
    used.add(id);
    toc.push({ id, title });
    return existing ? match : `<h2${attrs} id="${id}">${inner}</h2>`;
  });
  return { html: result, toc };
}

export type PageGroups = {
  pregnancy: { week: string; slug: string }[];
  kindergeldYears: { year: string; slug: string }[];
  guides: MagazinePageLink[];
};

/** Sortiert die WordPress-Seiten: Schwangerschaftswochen, Kindergeld-Jahre, übrige Ratgeber. */
export function groupMagazinePages(pages: MagazinePageLink[]): PageGroups {
  const pregnancy: PageGroups["pregnancy"] = [];
  const kindergeldYears: PageGroups["kindergeldYears"] = [];
  const guides: MagazinePageLink[] = [];
  for (const page of pages) {
    const week = page.slug.match(/^ssw-schwangerschaftswoche-(\d+(?:-\d+)?)$/)?.[1];
    const year = page.slug.match(/^kindergeld-auszahlungstermine-(\d{4})$/)?.[1];
    if (week) pregnancy.push({ week: week.replace("-", "–"), slug: page.slug });
    else if (year) kindergeldYears.push({ year, slug: page.slug });
    else if (!/^kindergeld-auszahlungstermine-[a-z]+-\d{4}$/.test(page.slug)) guides.push(page);
  }
  pregnancy.sort((a, b) => parseInt(a.week, 10) - parseInt(b.week, 10));
  kindergeldYears.sort((a, b) => Number(b.year) - Number(a.year));
  return { pregnancy, kindergeldYears, guides };
}
