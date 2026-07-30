const WORDPRESS_BASE = "https://alleinerziehende-singles.de/magazin/wp-json/wp/v2";

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

  return {
    id: record.id,
    slug: record.slug,
    link: record.link,
    titleHtml: record.title?.rendered ?? "",
    excerptHtml: record.excerpt?.rendered ?? "",
    contentHtml: record.content?.rendered ?? "",
    date: record.date,
    modified: record.modified,
    authorName: author?.name,
    authorSlug: author?.slug,
    featuredImageUrl: featured?.source_url,
    featuredImageAlt: featured?.alt_text,
    kind,
  };
}

export async function getMagazinePosts(limit = 12): Promise<MagazineEntry[]> {
  const records = await wordpressFetch<WordPressRecord[]>(`/posts?per_page=${limit}&_embed=1`);
  return records.map((record) => mapEntry(record, "post"));
}

export async function getMagazinePages(limit = 12): Promise<MagazineEntry[]> {
  const records = await wordpressFetch<WordPressRecord[]>(`/pages?per_page=${limit}&_embed=1`);
  return records.map((record) => mapEntry(record, "page"));
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
