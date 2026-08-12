import { readFileSync } from "node:fs";
import { join } from "node:path";

const WORDPRESS_BASE = "https://alleinerziehende-singles.de/magazin/wp-json/wp/v2";

interface KindergeldFacebookMonth {
  month: string;
  publishedAt: string;
  postUrl: string;
  imageUrl: string;
}

type KindergeldFacebookData = {
  slug: string;
  title: string;
  intro: string;
  sourceLabel: string;
  sourceUrl: string;
  updatedAt: string;
  months: KindergeldFacebookMonth[];
};

type RenderedText = {
  rendered: string;
};

type EmbeddedAuthor = {
  name?: string;
  slug?: string;
};

type EmbeddedMedia = {
  source_url?: string;
  alt_text?: string;
};

type WordPressRecord = {
  id: number;
  slug: string;
  link: string;
  date?: string;
  modified?: string;
  title: RenderedText;
  excerpt?: RenderedText;
  content?: RenderedText;
  _embedded?: {
    author?: EmbeddedAuthor[];
    "wp:featuredmedia"?: EmbeddedMedia[];
  };
};

type CategoryRecord = {
  id: number;
  slug: string;
  name: string;
  description: string;
  count: number;
};

export type MagazineEntry = {
  id: number;
  slug: string;
  link: string;
  titleHtml: string;
  excerptHtml: string;
  contentHtml: string;
  date?: string;
  modified?: string;
  authorName?: string;
  authorSlug?: string;
  featuredImageUrl?: string;
  featuredImageAlt?: string;
  kind: "post" | "page";
};

export type MagazineCategory = {
  id: number;
  slug: string;
  name: string;
  description: string;
  count: number;
};

const KINDERGELD_2026 = JSON.parse(
  readFileSync(join(process.cwd(), "data", "kindergeld-facebook-2026.json"), "utf8"),
) as KindergeldFacebookData;

function renderKindergeld2026Content() {
  const monthCards = KINDERGELD_2026.months.map(
    (item) =>
      `<a class="kindergeld-month-card" href="${item.postUrl}" target="_blank" rel="nofollow noopener noreferrer"><span class="kindergeld-month-label">${item.month}</span><span class="kindergeld-month-cta">Facebook-Beitrag öffnen</span></a>`,
  ).join("");

  const firstMonth = KINDERGELD_2026.months.at(0)?.month;
  const lastMonth = KINDERGELD_2026.months.at(-1)?.month;
  const sourceLabel = KINDERGELD_2026.sourceLabel;

  return [
    '<section class="kindergeld-month-overview">',
    '<div class="kindergeld-section-intro">',
    '<h2>Auszahlungstermine 2026 nach Monat</h2>',
    `<p>Hier findest du die aktuell verfügbaren Monatsübersichten aus den Facebook-Beiträgen von „${sourceLabel}“.</p>`,
    '</div>',
    `<div class="kindergeld-month-grid">${monthCards}</div>`,
    '</section>',
    '<div class="kindergeld-note"><p>Neue Monate ergänzen wir, sobald sie dort veröffentlicht sind. So bleibt die Jahresübersicht früh sichtbar, auch wenn noch nicht alle Termine für das ganze Jahr vorliegen.</p></div>',
    `<div class="kindergeld-faq-box"><ul><li>Stand heute liegen Einträge von ${firstMonth} bis ${lastMonth} 2026 vor.</li><li>Jeder Monatslink führt direkt zum zugehörigen Facebook-Beitrag.</li><li>Die Quelle ist die Facebook-Seite „${sourceLabel}“.</li></ul></div>`,
    '<section class="kindergeld-years"><h2>Weitere Jahresübersichten</h2><div class="kindergeld-year-list"><ul><li><a href="/magazin/kindergeld-auszahlungstermine-2025">2025</a></li><li><a href="/magazin/kindergeld-auszahlungstermine-2024">2024</a></li><li><a href="/magazin/kindergeld-auszahlungstermine-2023">2023</a></li><li><a href="/magazin/kindergeld-auszahlungstermine-2022">2022</a></li></ul></div></section>',
  ].join("");
}

export function getStaticMagazinePages(): MagazineEntry[] {
  return [
    {
      id: 2026001,
      slug: KINDERGELD_2026.slug,
      link: `https://alleinerziehende-singles.de/magazin/${KINDERGELD_2026.slug}`,
      titleHtml: KINDERGELD_2026.title,
      excerptHtml: `<p>${KINDERGELD_2026.intro}</p>`,
      contentHtml: renderKindergeld2026Content(),
      date: KINDERGELD_2026.updatedAt,
      modified: KINDERGELD_2026.updatedAt,
      authorName: "Redaktion",
      authorSlug: "redaktion",
      featuredImageUrl: KINDERGELD_2026.months.at(-1)?.imageUrl,
      featuredImageAlt: KINDERGELD_2026.title,
      kind: "page",
    },
  ];
}

export function getStaticMagazinePageBySlug(slug: string): MagazineEntry | null {
  return getStaticMagazinePages().find((entry) => entry.slug === slug) ?? null;
}

function makeMagazineLinksRelative(html: string): string {
  return html.replace(
    /https?:\/\/(?:www\.)?alleinerziehende-singles\.de(\/magazin\/[^"]*)/gi,
    "$1",
  );
}

function isKindergeldScheduleSlug(slug: string): boolean {
  return /^kindergeld-auszahlungstermine-/i.test(slug);
}

function transformKindergeldOverviewHtml(html: string): string {
  const monthPattern = /<h3>(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)<\/h3>\s*<p><a href="([^"]+)">([^<]+)<\/a><\/p>/gi;
  const monthMatches = [...html.matchAll(monthPattern)];

  if (monthMatches.length >= 12) {
    const monthCards = monthMatches
      .map((match) => {
        const [, month, href] = match;
        return [
          `<a class="kindergeld-month-card" href="${href}">`,
          `<span class="kindergeld-month-label">${month}</span>`,
          '<span class="kindergeld-month-cta">Termine ansehen</span>',
          "</a>",
        ].join("");
      })
      .join("");

    const firstIndex = monthMatches[0].index ?? -1;
    const lastMatch = monthMatches.at(-1);
    const lastIndex = lastMatch?.index ?? -1;

    if (firstIndex >= 0 && lastIndex >= 0 && lastMatch) {
      const lastEnd = lastIndex + lastMatch[0].length;
      html = [
        html.slice(0, firstIndex),
        '<section class="kindergeld-month-overview">',
        '<div class="kindergeld-section-intro">',
        '<h2>Auszahlungstermine nach Monat</h2>',
        '<p>Wähle einfach den Monat aus, damit du die passenden Auszahlungstermine schneller findest.</p>',
        '</div>',
        `<div class="kindergeld-month-grid">${monthCards}</div>`,
        '</section>',
        html.slice(lastEnd),
      ].join("");
    }
  }

  html = html.replace(
    /<h2>Praktische Hinweise zur Kindergeldauszahlung<\/h2>\s*<p>([\s\S]*?)<\/p>/i,
    '<h2>Praktische Hinweise zur Kindergeldauszahlung</h2><div class="kindergeld-note"><p>$1</p></div>',
  );

  html = html.replace(
    /<h2>Häufige Fragen \(FAQ\) zur Kindergeldauszahlung<\/h2>\s*<ul>([\s\S]*?)<\/ul>/i,
    '<h2>Häufige Fragen (FAQ) zur Kindergeldauszahlung</h2><div class="kindergeld-faq-box"><ul>$1</ul></div>',
  );

  html = html.replace(
    /<p><strong>(Hier findest du die Auszahlungstermine für)<\/strong><br \/?>\s*<ul>([\s\S]*?)<\/ul>/i,
    '<section class="kindergeld-years"><h2>$1</h2><div class="kindergeld-year-list"><ul>$2</ul></div></section>',
  );

  return html;
}

function plainText(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();
}

export function removeDuplicateLeadParagraph(contentHtml: string, excerptHtml: string): string {
  if (!contentHtml || !excerptHtml) return contentHtml;

  const firstParagraphMatch = contentHtml.match(/^\s*<p>([\s\S]*?)<\/p>/i);
  if (!firstParagraphMatch) return contentHtml;

  const firstParagraphText = plainText(firstParagraphMatch[1]);
  const excerptText = plainText(excerptHtml);

  if (
    firstParagraphText &&
    excerptText &&
    (firstParagraphText === excerptText ||
      firstParagraphText.startsWith(excerptText) ||
      excerptText.startsWith(firstParagraphText))
  ) {
    return contentHtml.replace(/^\s*<p>[\s\S]*?<\/p>\s*/i, "");
  }

  return contentHtml;
}

export function normalizeMagazineHtml(slug: string, html: string): string {
  const linkedHtml = makeMagazineLinksRelative(html);

  if (isKindergeldScheduleSlug(slug) && /^kindergeld-auszahlungstermine-\d{4}$/i.test(slug)) {
    return transformKindergeldOverviewHtml(linkedHtml);
  }

  return linkedHtml;
}

async function wordpressFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${WORDPRESS_BASE}${path}`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`WordPress fetch failed for ${path}: ${response.status}`);
  }

  return response.json();
}

function mapEntry(record: WordPressRecord, kind: "post" | "page"): MagazineEntry {
  const author = record._embedded?.author?.[0];
  const featured = record._embedded?.["wp:featuredmedia"]?.[0];
  const excerptHtml = makeMagazineLinksRelative(record.excerpt?.rendered ?? "");
  const contentHtml = removeDuplicateLeadParagraph(
    normalizeMagazineHtml(record.slug, record.content?.rendered ?? ""),
    excerptHtml,
  );

  return {
    id: record.id,
    slug: record.slug,
    link: record.link,
    titleHtml: record.title?.rendered ?? "",
    excerptHtml,
    contentHtml,
    date: record.date,
    modified: record.modified,
    authorName: author?.name,
    authorSlug: author?.slug,
    featuredImageUrl: featured?.source_url,
    featuredImageAlt: featured?.alt_text,
    kind,
  };
}

export async function getMagazinePosts(limit = 12, categoryId?: number): Promise<MagazineEntry[]> {
  const categoryQuery = categoryId ? `&categories=${categoryId}` : "";
  const records = await wordpressFetch<WordPressRecord[]>(`/posts?per_page=${limit}&_embed=1${categoryQuery}`);
  return records.map((record) => mapEntry(record, "post"));
}

export async function getMagazinePages(limit = 12): Promise<MagazineEntry[]> {
  const records = await wordpressFetch<WordPressRecord[]>(`/pages?per_page=${limit}&_embed=1`);
  const wordpressPages = records.map((record) => mapEntry(record, "page"));
  return [...getStaticMagazinePages(), ...wordpressPages].slice(0, limit);
}

export async function getMagazineCategories(limit = 10): Promise<MagazineCategory[]> {
  const records = await wordpressFetch<CategoryRecord[]>(`/categories?per_page=${limit}`);
  return records.map((record) => ({
    id: record.id,
    slug: record.slug,
    name: record.name,
    description: record.description,
    count: record.count,
  }));
}

export async function getMagazinePostBySlug(slug: string): Promise<MagazineEntry | null> {
  const records = await wordpressFetch<WordPressRecord[]>(`/posts?slug=${encodeURIComponent(slug)}&_embed=1`);
  return records[0] ? mapEntry(records[0], "post") : null;
}

export async function getMagazinePageBySlug(slug: string): Promise<MagazineEntry | null> {
  const staticPage = getStaticMagazinePageBySlug(slug);
  if (staticPage) return staticPage;

  const records = await wordpressFetch<WordPressRecord[]>(`/pages?slug=${encodeURIComponent(slug)}&_embed=1`);
  return records[0] ? mapEntry(records[0], "page") : null;
}

export async function getMagazineEntryBySlug(slug: string): Promise<MagazineEntry | null> {
  const [post, page] = await Promise.all([
    getMagazinePostBySlug(slug),
    getMagazinePageBySlug(slug),
  ]);

  return post ?? page;
}

export function formatGermanDate(date?: string): string {
  if (!date) return "";

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}
