import { decodeEntities, leadImage, plainText } from "./city-guide.ts";
import { extractFaqEntries, type FaqEntry } from "./faq-schema.ts";
import { getImportedRootPageBySlug } from "./icony-import.ts";

export type FaqTopicIcon = "shield" | "star" | "tag" | "phone" | "user" | "chat" | "heart";

export type FaqItem = { id: string; question: string; answerHtml: string; answerText: string };
export type FaqTopic = { id: string; title: string; short: string; icon: FaqTopicIcon; items: FaqItem[] };
export type FaqData = {
  title: string;
  heroTitle: string;
  description: string;
  path: string;
  introHtml: string;
  imageUrl: string | null;
  imageAlt: string;
  topics: FaqTopic[];
  outroHtml: string;
  schemaEntries: FaqEntry[];
};

const ICON_RULES: [FaqTopicIcon, RegExp][] = [
  ["shield", /sicherheit|seriosit/],
  ["star", /bewertung|erfahrung/],
  ["tag", /kosten|mitgliedschaft|anmeldung/],
  ["phone", /nutzung|funktion|technik/],
  ["user", /profil|einstellung/],
  ["chat", /konto|support|hilfe/],
];

function slugify(value: string) {
  return value.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
}

/** Themen-Chip ohne „… über/von alleinerziehende-singles.de“. */
function shortTitle(title: string) {
  return title.replace(/\s+(?:über|von|zu|bei)\s+alleinerziehende-singles\.de$/i, "").trim();
}

/** Zerlegt die importierte ICONY-FAQ (h2 + details/summary) in Themen und Fragen, Wortlaut unverändert. */
export function getFaqData(): FaqData | null {
  const page = getImportedRootPageBySlug("faq");
  if (!page) return null;
  const html = page.contentHtml;
  const start = html.search(/<section\b[^>]*id="faq"/i);
  const end = html.indexOf("</section>", start);
  const before = start >= 0 ? html.slice(0, start) : html;
  const body = start >= 0 ? html.slice(start, end) : "";
  const after = start >= 0 && end >= 0 ? html.slice(end + "</section>".length) : "";
  const image = leadImage(before);

  const topics: FaqTopic[] = [];
  const usedIds = new Set<string>();
  const parts = body.split(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i);
  for (let index = 1; index < parts.length; index += 2) {
    const title = plainText(parts[index]);
    const items = [...parts[index + 1].matchAll(/<details\b[^>]*>\s*<summary\b[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi)]
      .map((match) => {
        const question = plainText(match[1]);
        const answerHtml = match[2].trim().replace(/^<div>\s*/i, "").replace(/\s*<\/div>$/i, "");
        let id = `frage-${slugify(question)}`;
        while (usedIds.has(id)) id = `${id}-2`;
        usedIds.add(id);
        return { id, question, answerHtml, answerText: plainText(answerHtml) };
      });
    if (!items.length) continue;
    const lower = title.toLowerCase();
    topics.push({
      id: `thema-${slugify(shortTitle(title))}`,
      title,
      short: shortTitle(title),
      icon: ICON_RULES.find(([, rule]) => rule.test(lower))?.[0] ?? "heart",
      items,
    });
  }

  return {
    title: page.title,
    heroTitle: page.heroTitle,
    description: page.description,
    path: page.path,
    introHtml: before.replace(/<p>\s*<img\b[^>]*>\s*<\/p>/i, "").replace(/<img\b[^>]*>/gi, "").trim(),
    imageUrl: image?.url ?? null,
    imageAlt: image ? decodeEntities(image.alt) : "",
    topics,
    outroHtml: after.trim(),
    schemaEntries: extractFaqEntries(html),
  };
}
