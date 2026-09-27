import { decodeEntities, leadImage, plainText } from "./city-guide.ts";
import { getImportedRootPageBySlug } from "./icony-import.ts";

export type RatingKind = "google" | "loca" | "trustpilot" | "portals" | "text";

export type RatingSection = {
  kind: RatingKind;
  title: string;
  html: string;
  score: number | null;
  scale: number;
  link: string | null;
  sealUrl: string | null;
  sealAlt: string;
};

export type ReviewsData = {
  title: string;
  heroTitle: string;
  description: string;
  imageUrl: string | null;
  imageAlt: string;
  introHtml: string;
  ratings: RatingSection[];
  texts: RatingSection[];
};

function kindFor(title: string): RatingKind {
  const value = title.toLowerCase();
  if (value.includes("google")) return "google";
  if (value.includes("loca")) return "loca";
  if (value.includes("trustpilot")) return "trustpilot";
  if (value.includes("vergleichsportal")) return "portals";
  return "text";
}

function score(html: string): { score: number | null; scale: number } {
  const text = plainText(html);
  const match = text.match(/(\d+(?:,\d+)?)\s+von\s+(5|10)\s+(?:Sternen|Punkten)/);
  return match ? { score: Number(match[1].replace(",", ".")), scale: Number(match[2]) } : { score: null, scale: 5 };
}

/** Bewertungsseite (ICONY „Bewertung und Erfahrungen“) in Plattform-Karten und Fließtext zerlegt, Wortlaut unverändert. */
export function getReviewsData(): ReviewsData | null {
  const page = getImportedRootPageBySlug("bewertungen-und-erfahrungen");
  if (!page) return null;
  const image = leadImage(page.contentHtml);
  const parts = page.contentHtml.split(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i);
  const intro = parts[0].replace(/<p>\s*(?:<strong>)?\s*<img\b[^>]*>\s*(?:<\/strong>)?\s*<\/p>/i, "").trim();

  const sections: RatingSection[] = [];
  for (let index = 1; index < parts.length; index += 2) {
    const title = plainText(parts[index]).replace(/^⭐\s*/, "");
    let html = parts[index + 1].trim();
    const kind = kindFor(title);
    // Siegel-Bild unter den Vergleichsportalen gehört zu dieser Karte
    const seal = kind === "portals" ? html.match(/<p>\s*<img\b[^>]*>\s*<\/p>/i) : null;
    const sealImage = seal ? leadImage(seal[0]) : null;
    if (seal) html = html.replace(seal[0], "").trim();
    const link = kind !== "text" && kind !== "portals" ? html.match(/<a\b[^>]*href="([^"]+)"/i)?.[1] ?? null : null;
    sections.push({
      kind,
      title,
      html,
      ...score(html),
      link: link ? decodeEntities(link) : null,
      sealUrl: sealImage?.url ?? null,
      sealAlt: sealImage ? decodeEntities(sealImage.alt) : "",
    });
  }

  return {
    title: page.title,
    heroTitle: page.heroTitle,
    description: page.description,
    imageUrl: image?.url ?? null,
    imageAlt: image ? decodeEntities(image.alt) : "",
    introHtml: intro,
    ratings: sections.filter((section) => section.kind !== "text"),
    texts: sections.filter((section) => section.kind === "text"),
  };
}

export type SocialChannel = { network: "facebook" | "youtube" | "instagram" | "tiktok" | "pinterest" | "other"; name: string; url: string; text: string };

export type SocialData = { title: string; heroTitle: string; description: string; heading: string; channels: SocialChannel[] };

/** Social-Media-Seite: je Absatz ein Kanal (Symbolbild, Link, Beschreibung). */
export function getSocialData(): SocialData | null {
  const page = getImportedRootPageBySlug("social-media");
  if (!page) return null;
  const heading = plainText(page.contentHtml.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i)?.[1] ?? "");
  const channels: SocialChannel[] = [];
  for (const paragraph of page.contentHtml.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)) {
    const link = paragraph[1].match(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!link) continue;
    const url = decodeEntities(link[1]);
    const host = new URL(url).hostname;
    const network = (["facebook", "youtube", "instagram", "tiktok", "pinterest"] as const).find((name) => host.includes(name)) ?? "other";
    const text = plainText(paragraph[1].split(/<br\s*\/?>/i).slice(1).join(" "));
    channels.push({ network, name: plainText(link[2]), url, text });
  }
  return { title: page.title, heroTitle: page.heroTitle, description: page.description, heading, channels };
}
