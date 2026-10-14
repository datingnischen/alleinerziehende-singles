import { decodeEntities, leadImage, plainText } from "./city-guide.ts";
import { extractFaqEntries, type FaqEntry } from "./faq-schema.ts";
import { getImportedRootPageBySlug } from "./icony-import.ts";
import { getMarketRootPage } from "./market-icony-import.ts";
import type { MarketCode } from "./markets.ts";

export type FaqTopicIcon = "shield" | "star" | "tag" | "phone" | "user" | "chat" | "heart";

export type FaqItem = { id: string; question: string; answerHtml: string; answerText: string };
export type FaqTopic = {
  id: string;
  title: string;
  short: string;
  icon: FaqTopicIcon;
  /** Einleitung des Themas vor der ersten Frage (z. B. „Transparenz“ auf .at/.ch) */
  introHtml: string;
  items: FaqItem[];
};
export type FaqData = {
  market: MarketCode;
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
  ["shield", /sicherheit|seriosit|transparenz/],
  ["star", /bewertung|erfahrung/],
  ["tag", /kosten|mitgliedschaft|anmeldung/],
  ["phone", /nutzung|funktion|technik/],
  ["user", /profil|einstellung|angaben/],
  ["chat", /konto|support|hilfe|kontakt/],
];

function slugify(value: string) {
  return value.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
}

/** Themen-Chip ohne „… über/von alleinerziehende-singles.de“ bzw. „… zu alleinerziehende-singles.ch“. */
function shortTitle(title: string) {
  return title.replace(/\s+(?:über|von|zu|bei)\s+alleinerziehende-singles\.(?:de|at|ch)$/i, "").trim();
}

function stripEmptyParagraphs(html: string) {
  return html.replace(/<p>\s*(?:&nbsp;|&#160;|\s)*\s*<\/p>/gi, "").trim();
}

function faqPage(market: MarketCode) {
  return market === "de" ? getImportedRootPageBySlug("faq") : getMarketRootPage(market, "faq");
}

/**
 * Zerlegt die importierte ICONY-FAQ (h2 + details/summary) in Themen und Fragen, Wortlaut unverändert.
 * DE hält alle Fragen in <section id="faq">; AT/CH hängen dahinter ein weiteres Thema („Transparenz“) mit eigener
 * Einleitung an – darum werden alle h2-Blöcke ab der Sektion gelesen, Text nach der letzten Frage ist der Ausklang.
 */
export function getFaqData(market: MarketCode = "de"): FaqData | null {
  const page = faqPage(market);
  if (!page) return null;
  const html = page.contentHtml;
  const start = html.search(/<section\b[^>]*id="faq"/i);
  const before = start >= 0 ? html.slice(0, start) : "";
  const rest = (start >= 0 ? html.slice(start) : html).replace(/<\/?section\b[^>]*>/gi, "");
  const image = leadImage(before);

  const topics: FaqTopic[] = [];
  const usedIds = new Set<string>();
  let outroHtml = "";
  const parts = rest.split(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i);
  for (let index = 1; index < parts.length; index += 2) {
    const title = plainText(parts[index]);
    const chunk = parts[index + 1];
    const isLast = index + 2 >= parts.length;
    const firstDetails = chunk.search(/<details\b/i);
    if (firstDetails < 0) {
      if (isLast) outroHtml = stripEmptyParagraphs(chunk);
      continue;
    }
    const lastDetailsEnd = chunk.lastIndexOf("</details>") + "</details>".length;
    if (isLast) outroHtml = stripEmptyParagraphs(chunk.slice(lastDetailsEnd));
    const items = [...chunk.matchAll(/<details\b[^>]*>\s*<summary\b[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi)]
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
      introHtml: stripEmptyParagraphs(chunk.slice(0, firstDetails)),
      items,
    });
  }

  return {
    market,
    title: page.title,
    heroTitle: page.heroTitle,
    description: page.description,
    path: page.path,
    introHtml: stripEmptyParagraphs(before.replace(/<p>\s*<img\b[^>]*>\s*<\/p>/i, "").replace(/<img\b[^>]*>/gi, "")),
    imageUrl: image?.url ?? null,
    imageAlt: image ? decodeEntities(image.alt) : "",
    topics,
    outroHtml,
    schemaEntries: extractFaqEntries(html),
  };
}
