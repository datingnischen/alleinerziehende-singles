import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { Marked } from "marked";
import { staticAsset } from "./static-asset.ts";

/**
 * Magazin aus Dateien: content/magazin/<slug>.md (Frontmatter + Markdown), Kategorien in
 * data/magazin-kategorien.json, Bilder unter public/magazin/wp-content/uploads/. Kein WordPress zur Laufzeit.
 */

const CONTENT_DIR = join(process.cwd(), "content", "magazin");
const SITE_ORIGIN = "https://alleinerziehende-singles.de";

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
  categoryIds: number[];
  /** SEO-Titel und Description aus dem Frontmatter (vorher AIOSEO) */
  seoTitle?: string;
  seoDescription?: string;
  kind: "post" | "page";
};

export type MagazineCategory = {
  id: number;
  slug: string;
  name: string;
  description: string;
};

const KINDERGELD_2026 = JSON.parse(
  readFileSync(join(process.cwd(), "data", "kindergeld-facebook-2026.json"), "utf8"),
) as KindergeldFacebookData;

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Für Textknoten (Titel, Auszug): Anführungszeichen bleiben stehen, stripTags kennt &quot; nicht. */
function escapeText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

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
    '<section class="kindergeld-years"><h2>Weitere Jahresübersichten</h2><div class="kindergeld-year-list"><ul><li><a href="/magazin/kindergeld-auszahlungstermine-2025/">2025</a></li><li><a href="/magazin/kindergeld-auszahlungstermine-2024/">2024</a></li><li><a href="/magazin/kindergeld-auszahlungstermine-2023/">2023</a></li><li><a href="/magazin/kindergeld-auszahlungstermine-2022/">2022</a></li></ul></div></section>',
  ].join("");
}

export function getStaticMagazinePages(): MagazineEntry[] {
  return [
    {
      id: 2026001,
      slug: KINDERGELD_2026.slug,
      link: `${SITE_ORIGIN}/magazin/${KINDERGELD_2026.slug}/`,
      titleHtml: KINDERGELD_2026.title,
      excerptHtml: `<p>${KINDERGELD_2026.intro}</p>`,
      contentHtml: renderKindergeld2026Content(),
      date: KINDERGELD_2026.updatedAt,
      modified: KINDERGELD_2026.updatedAt,
      authorName: "Redaktion",
      authorSlug: "redaktion",
      featuredImageUrl: KINDERGELD_2026.months.at(-1)?.imageUrl,
      featuredImageAlt: KINDERGELD_2026.title,
      categoryIds: [],
      kind: "page",
    },
  ];
}

export function getStaticMagazinePageBySlug(slug: string): MagazineEntry | null {
  return getStaticMagazinePages().find((entry) => entry.slug === slug) ?? null;
}

// ---------------------------------------------------------------- Markdown -> HTML

const FACEBOOK_HOST = /(^|\.)facebook\.com$/i;
const AMAZON_HOST = /(^|\.)amazon\.de$/i;

function linkAttributes(href: string): string {
  if (!/^https?:\/\//i.test(href)) return "";
  const host = new URL(href).hostname;
  if (AMAZON_HOST.test(host)) return ' rel="sponsored nofollow noopener"';
  if (FACEBOOK_HOST.test(host)) return ' rel="nofollow noopener"';
  if (host.replace(/^www\./, "") === "alleinerziehende-singles.de") return "";
  return ' rel="noopener"';
}

const markdown = new Marked({
  gfm: true,
  // Nackte URLs im Text bleiben Text (WordPress verlinkte sie nicht), <https://…> und [Text](URL) funktionieren weiter.
  tokenizer: {
    url() {
      return undefined;
    },
  },
  renderer: {
    link({ href, tokens }) {
      return `<a href="${escapeHtml(href)}"${linkAttributes(href)}>${this.parser.parseInline(tokens)}</a>`;
    },
    image({ href, text }) {
      return `<img src="${escapeHtml(staticAsset(href))}" alt="${escapeHtml(text)}" loading="lazy" decoding="async" />`;
    },
  },
});

/** Dateien aus dem Magazin (Audio, Bilder) liegen unter public/ und kommen vom Asset-Host. */
function assetifyHtml(html: string): string {
  return html.replace(/\b(src)="(\/magazin\/wp-content\/[^"]+)"/g, (_, attr: string, path: string) => `${attr}="${staticAsset(path)}"`);
}

export function renderMagazineMarkdown(source: string): string {
  return assetifyHtml(markdown.parse(source, { async: false }) as string);
}

// Nur Seitenlinks werden relativ; Dateien (Bilder, Audio) liegen im Repo.
function makeMagazineLinksRelative(html: string): string {
  return html.replace(
    /https?:\/\/(?:www\.)?alleinerziehende-singles\.de(\/magazin\/(?!wp-(?:content|includes|json)\/)[^"]*)/gi,
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

// ---------------------------------------------------------------- Dateien lesen

type Loaded = { entries: MagazineEntry[]; categories: MagazineCategory[] };

let cache: Loaded | null = null;

function dateValue(value: unknown): string | undefined {
  if (value instanceof Date) return value.toISOString();
  return typeof value === "string" && value ? value : undefined;
}

function readCategories(): MagazineCategory[] {
  return JSON.parse(readFileSync(join(process.cwd(), "data", "magazin-kategorien.json"), "utf8")) as MagazineCategory[];
}

function readEntries(categories: MagazineCategory[]): MagazineEntry[] {
  const idBySlug = new Map(categories.map((category) => [category.slug, category.id]));
  const files = readdirSync(CONTENT_DIR).filter((file) => file.endsWith(".md") && !file.startsWith("_"));

  const entries = files.map((file): MagazineEntry => {
    const slug = file.replace(/\.md$/, "");
    const { data, content } = matter(readFileSync(join(CONTENT_DIR, file), "utf8"));
    const kind = data.kind === "page" ? "page" : "post";
    const excerptHtml = data.excerpt ? `<p>${escapeText(String(data.excerpt))}</p>` : "";
    // Beim Artikel steht der Auszug als Lead im Kopf: den doppelten ersten Absatz im Text weglassen.
    const rendered = normalizeMagazineHtml(slug, renderMagazineMarkdown(content));
    const contentHtml = kind === "post" ? removeDuplicateLeadParagraph(rendered, excerptHtml) : rendered;

    return {
      id: Number(data.wpId) || 0,
      slug,
      link: `${SITE_ORIGIN}/magazin/${slug}/`,
      titleHtml: escapeText(String(data.title ?? slug)),
      excerptHtml,
      contentHtml,
      date: dateValue(data.published),
      modified: dateValue(data.updated),
      authorName: "Redaktion",
      authorSlug: String(data.author ?? "redaktion"),
      featuredImageUrl: data.image ? staticAsset(String(data.image)) : undefined,
      featuredImageAlt: data.imageAlt ? String(data.imageAlt) : undefined,
      categoryIds: (Array.isArray(data.categories) ? data.categories : [])
        .map((category: string) => idBySlug.get(category))
        .filter((id: number | undefined): id is number => typeof id === "number"),
      seoTitle: data.seoTitle ? String(data.seoTitle) : undefined,
      seoDescription: data.description ? String(data.description) : undefined,
      kind,
    };
  });

  // neueste zuerst, wie die WordPress-Listen
  return entries.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

function load(): Loaded {
  if (cache) return cache;
  const categories = readCategories();
  const loaded = { entries: readEntries(categories), categories };
  if (process.env.NODE_ENV === "production") cache = loaded;
  return loaded;
}

function posts(): MagazineEntry[] {
  return load().entries.filter((entry) => entry.kind === "post");
}

function pages(): MagazineEntry[] {
  return load().entries.filter((entry) => entry.kind === "page");
}

export function getMagazinePosts(limit = 12, categoryId?: number): MagazineEntry[] {
  const list = categoryId ? posts().filter((entry) => entry.categoryIds.includes(categoryId)) : posts();
  return list.slice(0, limit);
}

/** Artikel aus mehreren Kategorien (z. B. alles außer den Kindergeld-Monatsterminen), seitenweise. */
export function getMagazinePostsByCategories(categoryIds: number[], limit = 12, page = 1): MagazineEntry[] {
  const list = posts().filter((entry) => entry.categoryIds.some((id) => categoryIds.includes(id)));
  return list.slice((page - 1) * limit, page * limit);
}

export type MagazinePageLink = { slug: string; title: string };

/** Alle Magazin-Seiten als schlanke Liste (Slug und Titel) plus die statischen Seiten. */
export function getMagazinePageLinks(): MagazinePageLink[] {
  return [
    ...getStaticMagazinePages().map((entry) => ({ slug: entry.slug, title: entry.titleHtml })),
    ...pages().map((entry) => ({ slug: entry.slug, title: entry.titleHtml })),
  ];
}

/** Weitere Artikel derselben Kategorie, ohne den aktuellen. */
export function getRelatedPosts(entry: MagazineEntry, limit = 3): MagazineEntry[] {
  const categoryId = entry.categoryIds[0];
  if (!categoryId) return [];
  return posts()
    .filter((post) => post.slug !== entry.slug && post.categoryIds.includes(categoryId))
    .slice(0, limit);
}

export function getMagazineCategories(): MagazineCategory[] {
  return load().categories;
}

export type MagazineSearchEntry = {
  slug: string;
  titleHtml: string;
  excerptHtml: string;
  kind: "post" | "page";
};

export function getMagazineSearchIndex(): MagazineSearchEntry[] {
  return [...getStaticMagazinePages(), ...load().entries].map(({ slug, titleHtml, excerptHtml, kind }) => ({
    slug,
    titleHtml,
    excerptHtml,
    kind,
  }));
}

/** Alle Slugs (für generateStaticParams). */
export function getMagazineSlugs(): string[] {
  return [...getStaticMagazinePages(), ...load().entries].map((entry) => entry.slug);
}

export function getMagazineEntryBySlug(slug: string): MagazineEntry | null {
  return getStaticMagazinePageBySlug(slug) ?? load().entries.find((entry) => entry.slug === slug) ?? null;
}

/**
 * Sichtbares Artikeldatum: Änderungsdatum statt Veröffentlichungsdatum
 * (Fallback auf date), z. B. "Aktualisiert am 12. November 2025".
 * Feste Seiten zeigen bewusst kein Datum.
 */
export function formatArticleUpdated(entry: Pick<MagazineEntry, "date" | "modified">): string {
  const value = entry.modified || entry.date;
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  const formatted = new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Berlin",
  }).format(parsed);

  return `Aktualisiert am ${formatted}`;
}
