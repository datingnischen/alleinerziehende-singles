import { getCityHub, getCityPages } from "./city-pages.ts";
import { getFaqData } from "./faq.ts";
import { getMagazineSearchIndex } from "./magazine-content.ts";
import { entryAvailableInMarket } from "./magazine-market.ts";
import { getMarket, publicUrl, type MarketCode } from "./markets.ts";
import { htmlToText, type SearchDocument } from "./site-search.ts";

/** Suchdokumente eines Markts: Magazin (ohne Kindergeld auf .at/.ch), Städte, Partnersuche-Hub, FAQ, Über uns. */
export function buildSearchDocuments(market: MarketCode): SearchDocument[] {
  const domain = getMarket(market).domain;
  const faq = getFaqData(market);
  const hub = getCityHub(market);

  const magazine: SearchDocument[] = getMagazineSearchIndex()
    .filter((entry) => entryAvailableInMarket(market, entry))
    .map((entry) => ({
      area: "Magazin",
      title: htmlToText(entry.titleHtml),
      // Artikel gibt es nur auf .de: AT/CH verlinken absolut dorthin
      href: market === "de" ? `/magazin/${entry.slug}/` : publicUrl("de", `/magazin/${entry.slug}/`),
      excerpt: htmlToText(entry.excerptHtml),
    }));

  const cities: SearchDocument[] = getCityPages(market).map((page) => ({
    area: "Stadt",
    title: page.title,
    href: page.path,
    excerpt: page.description,
    text: `${page.name} ${page.heroTitle} ${htmlToText(page.contentHtml)}`,
  }));

  const about: SearchDocument[] = [
    { area: "Über uns", title: "Über uns", href: "/ueber-uns/", excerpt: `Hintergründe, offizielle Kanäle und unabhängige Bewertungen von ${domain}.` },
    { area: "Über uns", title: "Bewertungen & Erfahrungen", href: "/ueber-uns/bewertungen/", excerpt: "Externe Bewertungen und Erfahrungen mit der Plattform im Überblick." },
    { area: "Über uns", title: "Social Media", href: "/ueber-uns/social-media/", excerpt: "Unsere verifizierten Kanäle für Austausch, Videos und Themen aus dem Alltag Alleinerziehender." },
    { area: "Über uns", title: "Kooperationen", href: "/ueber-uns/kooperationen/", excerpt: "Informationen für Medien, Communities, Portale und mögliche Kooperationspartner." },
  ];

  return [
    ...magazine,
    ...cities,
    { area: "Partnersuche", title: hub.title, href: "/partnersuche/", excerpt: hub.description, text: htmlToText(hub.contentHtml) },
    ...(faq
      ? [{ area: "FAQ", title: faq.title, href: faq.path, excerpt: faq.description, text: faq.topics.map((topic) => topic.items.map((item) => `${item.question} ${item.answerText}`).join(" ")).join(" ") }]
      : []),
    ...about,
  ];
}
