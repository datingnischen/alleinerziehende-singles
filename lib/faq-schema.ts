const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: "\"", apos: "'", nbsp: " ",
  auml: "ä", ouml: "ö", uuml: "ü", Auml: "Ä", Ouml: "Ö", Uuml: "Ü", szlig: "ß",
  ndash: "–", mdash: "—", hellip: "…", bdquo: "„", ldquo: "“", rdquo: "”", sbquo: "‚", lsquo: "‘", rsquo: "’",
  eacute: "é", egrave: "è", euro: "€",
};

function decodeEntities(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === "#") {
      const code = entity[1].toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return NAMED_ENTITIES[entity] ?? match;
  });
}

function plainText(html: string): string {
  return decodeEntities(html.replace(/<\/(p|li)>/gi, " ").replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}

export type FaqEntry = { question: string; answer: string };

/** Liest die Frage/Antwort-Paare aus den importierten <details><summary>-Blöcken. */
export function extractFaqEntries(contentHtml: string): FaqEntry[] {
  return [...contentHtml.matchAll(/<details\b[^>]*>\s*<summary\b[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi)]
    .map(([, summary, body]) => {
      // Reine Linkzeilen („Mehr dazu in der Hilfe“) tragen im strukturierten Antworttext keine Information.
      const answer = plainText(body.replace(/<p>(?:\s|&nbsp;|<a\b[^>]*>[^<]*<\/a>)*<\/p>/gi, "")) || plainText(body);
      return { question: plainText(summary), answer };
    })
    .filter(entry => entry.question && entry.answer);
}

export function buildFaqPageJsonLd({ url, name, entries }: { url: string; name: string; entries: FaqEntry[] }) {
  const siteUrl = new URL("/", url).href;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Startseite", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "FAQ", item: url },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        url,
        name,
        inLanguage: "de-DE",
        isPartOf: { "@type": "WebSite", "@id": `${siteUrl}#website`, url: siteUrl, name: new URL(url).hostname },
        publisher: { "@type": "Organization", name: "ICONY GmbH", url: `${siteUrl}impressum.html` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        mainEntity: entries.map(entry => ({
          "@type": "Question",
          name: entry.question,
          acceptedAnswer: { "@type": "Answer", text: entry.answer },
        })),
      },
    ],
  };
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
