import { publicUrl, type MarketCode } from "./markets";

export { serializeJsonLd } from "./faq-schema";

export function breadcrumbJsonLd(market: MarketCode, items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: publicUrl(market, item.path),
    })),
  };
}
