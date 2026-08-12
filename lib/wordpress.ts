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

type KindergeldFacebookMonth = {
  month: string;
  publishedAt: string;
  postUrl: string;
  imageUrl: string;
};

const KINDERGELD_2026_SLUG = "kindergeld-auszahlungstermine-2026";

const KINDERGELD_2026_MONTHS: KindergeldFacebookMonth[] = [
  {
    month: "Januar",
    publishedAt: "2025-12-27T17:31:08+0000",
    postUrl: "https://www.facebook.com/1034334292437869/posts/873780425159924",
    imageUrl:
      "https://scontent-ber1-1.xx.fbcdn.net/v/t39.30808-6/606073612_873780111826622_5444504418397512496_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=127cfc&_nc_ohc=lFTZbQ1FgkcQ7kNvwG_iMeS&_nc_oc=AdpoXILiwSeSIpUcB0Fmo4i-X6q3Ons1quDcFul4sPedbGE8beAqfSj3OZatryBuAek&_nc_zt=23&_nc_ht=scontent-ber1-1.xx&edm=AKIiGfEEAAAA&_nc_gid=kLZ6evEaccXpRb66rwPC1Q&_nc_tpa=Q5bMBQLyW8rxIW1zEw7yRgqiwTvVdBg7DKfrD0-F-mH4XdtawAPCeqMLkyb0nZj7cMNU6qFUGcl___t-MQ&oh=00_AQEXo6us9HEbsx2cLgOpPwvoAbx36sDLAD7OURWl1Xo68w&oe=6A81F086",
  },
  {
    month: "Februar",
    publishedAt: "2026-01-28T06:30:32+0000",
    postUrl: "https://www.facebook.com/1034334292437869/posts/897046682833298",
    imageUrl:
      "https://scontent-ber1-1.xx.fbcdn.net/v/t39.30808-6/621803019_897046489499984_2641218428859961307_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=127cfc&_nc_ohc=sMtplF92neQQ7kNvwExVDpk&_nc_oc=Ados-wRF1xApiq-c5U2pTWLMGiEfn54ymQFeAzqkLxRANpBwzGIU6WSeEf7ti-3qqZQ&_nc_zt=23&_nc_ht=scontent-ber1-1.xx&edm=AKIiGfEEAAAA&_nc_gid=kLZ6evEaccXpRb66rwPC1Q&_nc_tpa=Q5bMBQKPy6RnI2LA_P4fwuhYtEMOAz3_6yH5lD7tJWpYvYs-yU48agNaizNVyxrPgEnMMPvQyd4v0oosmA&oh=00_AQGINv9Ds5-h4yFw0QBizdjXe7YeNAOQUt13tFt2lgJ6cA&oe=6A821ACE",
  },
  {
    month: "März",
    publishedAt: "2026-02-27T08:39:33+0000",
    postUrl: "https://www.facebook.com/1034334292437869/posts/921935150344451",
    imageUrl:
      "https://scontent-ber1-1.xx.fbcdn.net/v/t39.30808-6/643729636_921935023677797_2351025837485369360_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=127cfc&_nc_ohc=FbDYA1rLwvMQ7kNvwEBKAO6&_nc_oc=Adqn4D8EcJg_aXoSkKqmb1NXZgnr-8xcsOM8XPnUfFiKM5lA14ASzodrrwOIE70zaf4&_nc_zt=23&_nc_ht=scontent-ber1-1.xx&edm=AKIiGfEEAAAA&_nc_gid=kLZ6evEaccXpRb66rwPC1Q&_nc_tpa=Q5bMBQJtVpghEMlD8HUhnBN7RN-lILsHuA6xngk_6vdJN3uS5-zRPtU3c83X0L56z-HqVNtKToCRL13m-A&oh=00_AQEfj3OWVvudzap1yyIa7W463tlLcxLTOMhchVVVCumMAw&oe=6A81FD8D",
  },
  {
    month: "April",
    publishedAt: "2026-03-26T11:49:38+0000",
    postUrl: "https://www.facebook.com/1034334292437869/posts/943175341553765",
    imageUrl:
      "https://scontent-ber1-1.xx.fbcdn.net/v/t39.30808-6/656314187_943175181553781_4754330318360847452_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=127cfc&_nc_ohc=7YGjtBHY318Q7kNvwG3qno4&_nc_oc=AdrRpMJb3bXMgWDmS-VgzUAz1huPYL8oavJ-vH4HTSYn7oWHCQPRFUV2xUR13lSPieE&_nc_zt=23&_nc_ht=scontent-ber1-1.xx&edm=AKIiGfEEAAAA&_nc_gid=kLZ6evEaccXpRb66rwPC1Q&_nc_tpa=Q5bMBQI1Mi8REagzS0gwwFbf33K8L4tFAtkK4HS6oGC4rLypnm-eOMVm86Ad_g5uY6HNeE-D1egSzQOs1g&oh=00_AQE8xgn3IjZWpnX3HICMkbbQ-8G5lnDUW-Kj3ELEYCFvCg&oe=6A81F2AD",
  },
  {
    month: "Mai",
    publishedAt: "2026-04-28T06:06:50+0000",
    postUrl: "https://www.facebook.com/1034334292437869/posts/968865442318088",
    imageUrl:
      "https://scontent-ber1-1.xx.fbcdn.net/v/t39.30808-6/681141004_968865295651436_7413463303822711714_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=127cfc&_nc_ohc=tPFHL0ITai8Q7kNvwGhfa0c&_nc_oc=AdrrGo4fIPeXwy6FzsQOYKL1BN076lT52CI3IbdI5F_XM3LMNhcHtmPSLEJMo4vzV0c&_nc_zt=23&_nc_ht=scontent-ber1-1.xx&edm=AKIiGfEEAAAA&_nc_gid=kLZ6evEaccXpRb66rwPC1Q&_nc_tpa=Q5bMBQLP2O8gamWMkoXHFVBz3F2LjDV7F9pgDo0AIwpOtb5JA3wOA26xcPBXnwP3_2uXLmbsN3LkpG0C2A&oh=00_AQFfGsKG6QTZQ5vVlhsCpbNbbquYNuLvAFANQxSLHqXjFA&oe=6A8202B4",
  },
  {
    month: "Juni",
    publishedAt: "2026-05-28T05:07:07+0000",
    postUrl: "https://www.facebook.com/1034334292437869/posts/993206559883976",
    imageUrl:
      "https://scontent-ber1-1.xx.fbcdn.net/v/t39.30808-6/706396956_993206313217334_3490743817833932633_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=127cfc&_nc_ohc=0qF77zzR8bQQ7kNvwEJsPtp&_nc_oc=AdrLlay00O2oTNE-AD9gpqh0oHTim6kC4uRzxKK9vl1IwA_-lf_D8TORev0gPdLFUqo&_nc_zt=23&_nc_ht=scontent-ber1-1.xx&edm=AKIiGfEEAAAA&_nc_gid=kLZ6evEaccXpRb66rwPC1Q&_nc_tpa=Q5bMBQLlYKNEHm9J1euUllolh17lbhc41NMyo0YsQ30pcbQKE6QrbHLfKzSUzjLqkHVlITACd17ZLJ3Nlw&oh=00_AQFCqiTlrFw3hWWu2rX4ux3-aH4_5aSzIZdIvkNmxnx-qw&oe=6A820479",
  },
  {
    month: "Juli",
    publishedAt: "2026-06-27T07:14:47+0000",
    postUrl: "https://www.facebook.com/1034334292437869/posts/1018564500681515",
    imageUrl:
      "https://scontent-ber1-1.xx.fbcdn.net/v/t39.30808-6/731146891_1018564274014871_7472492591873468101_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=127cfc&_nc_ohc=HHzJvmeD3FEQ7kNvwE_yf10&_nc_oc=AdrLoBMq_85OER1HAH1li-t4cgA-adtfbDNMJwyG7OhJgVTiHyynSSRuZWR0rSE2htU&_nc_zt=23&_nc_ht=scontent-ber1-1.xx&edm=AKIiGfEEAAAA&_nc_gid=kLZ6evEaccXpRb66rwPC1Q&_nc_tpa=Q5bMBQKEkYO9Zu81VGNsz5PUyG7F1Soc9HZKl_mYpsJ4HjetUoiRQrVFm7Yl7-TlZ2-DJ8kLLDMimHXeaw&oh=00_AQH6eYcelog3gEyKXQpt0JQJf-gQTr1HXytZ7wDZJRA09w&oe=6A821653",
  },
  {
    month: "August",
    publishedAt: "2026-07-30T05:44:28+0000",
    postUrl: "https://www.facebook.com/1034334292437869/posts/1045622221309076",
    imageUrl:
      "https://scontent-ber1-1.xx.fbcdn.net/v/t39.30808-6/760677213_1045621891309109_955347461878880577_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=127cfc&_nc_ohc=shAdJm9ni6UQ7kNvwFfToI7&_nc_oc=AdqbsL7QrGcVHGGhAOwvkf67Vm4ibGAPn2IfgfXYOmv6TAjP6hNQTU8Li2thKFWFn10&_nc_zt=23&_nc_ht=scontent-ber1-1.xx&edm=AKIiGfEEAAAA&_nc_gid=kLZ6evEaccXpRb66rwPC1Q&_nc_tpa=Q5bMBQKndpBp27EDjTu0c3I5Po23ydEBAflOxRkMntmao8-xGrljYmDXFkWsYjqQjqkj3t17bPuJ1aYdtQ&oh=00_AQERMSOwjNkoEpFYfR2KK_JMOgIIthOGRP_8wUk2MOWTuQ&oe=6A8202DE",
  },
];

function renderKindergeld2026Content() {
  const monthCards = KINDERGELD_2026_MONTHS.map(
    (item) =>
      `<a class="kindergeld-month-card" href="${item.postUrl}" target="_blank" rel="nofollow noopener noreferrer"><span class="kindergeld-month-label">${item.month}</span><span class="kindergeld-month-cta">Facebook-Beitrag öffnen</span></a>`,
  ).join("");

  return [
    '<section class="kindergeld-month-overview">',
    '<div class="kindergeld-section-intro">',
    '<h2>Auszahlungstermine 2026 nach Monat</h2>',
    '<p>Hier findest du die aktuell verfügbaren Monatsübersichten aus den Facebook-Beiträgen von „Wir wollen mehr Kindergeld“.</p>',
    '</div>',
    `<div class="kindergeld-month-grid">${monthCards}</div>`,
    '</section>',
    '<div class="kindergeld-note"><p>Neue Monate ergänzen wir, sobald sie dort veröffentlicht sind. So bleibt die Jahresübersicht früh sichtbar, auch wenn noch nicht alle Termine für das ganze Jahr vorliegen.</p></div>',
    '<div class="kindergeld-faq-box"><ul><li>Stand heute liegen Einträge von Januar bis August 2026 vor.</li><li>Jeder Monatslink führt direkt zum zugehörigen Facebook-Beitrag.</li><li>Die Quelle ist die Facebook-Seite „Wir wollen mehr Kindergeld“.</li></ul></div>',
    '<section class="kindergeld-years"><h2>Weitere Jahresübersichten</h2><div class="kindergeld-year-list"><ul><li><a href="/magazin/kindergeld-auszahlungstermine-2025">2025</a></li><li><a href="/magazin/kindergeld-auszahlungstermine-2024">2024</a></li><li><a href="/magazin/kindergeld-auszahlungstermine-2023">2023</a></li><li><a href="/magazin/kindergeld-auszahlungstermine-2022">2022</a></li></ul></div></section>',
  ].join("");
}

export function getStaticMagazinePages(): MagazineEntry[] {
  return [
    {
      id: 2026001,
      slug: KINDERGELD_2026_SLUG,
      link: `https://alleinerziehende-singles.de/magazin/${KINDERGELD_2026_SLUG}`,
      titleHtml: "Kindergeld Auszahlungstermine 2026",
      excerptHtml:
        "<p>Hier findest du die bisher veröffentlichten Kindergeld-Auszahlungstermine 2026 gesammelt in einer Jahresübersicht.</p>",
      contentHtml: renderKindergeld2026Content(),
      date: KINDERGELD_2026_MONTHS.at(-1)?.publishedAt,
      modified: KINDERGELD_2026_MONTHS.at(-1)?.publishedAt,
      authorName: "Redaktion",
      authorSlug: "redaktion",
      featuredImageUrl: KINDERGELD_2026_MONTHS.at(-1)?.imageUrl,
      featuredImageAlt: "Kindergeld Auszahlungstermine 2026",
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
