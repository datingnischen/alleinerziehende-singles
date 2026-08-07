import { notFound } from "next/navigation";
import { getMarketCityPages, type RegionalMarket } from "@/lib/market-icony-import";
import { isMarketCode, publicUrl } from "@/lib/markets";

type RouteProps = { params: Promise<{ market: string }> };

export async function GET(_request: Request, { params }: RouteProps) {
  const value = (await params).market;
  if (!isMarketCode(value) || value === "de") notFound();
  const market: RegionalMarket = value;

  const urls = [
    publicUrl(market),
    publicUrl(market, "/partnersuche"),
    ...getMarketCityPages(market).map((page) => publicUrl(market, page.path)),
  ];
  const entries = urls
    .map((url, index) => `  <url><loc>${url}</loc><changefreq>weekly</changefreq><priority>${index === 0 ? "1.0" : "0.8"}</priority></url>`)
    .join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;

  return new Response(body, { headers: { "content-type": "application/xml; charset=utf-8" } });
}
