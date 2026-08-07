import { notFound } from "next/navigation";
import { getMarket, isMarketCode, publicUrl } from "@/lib/markets";

type RouteProps = { params: Promise<{ market: string }> };

export async function GET(_request: Request, { params }: RouteProps) {
  const market = (await params).market;
  if (!isMarketCode(market) || market === "de") notFound();

  const body = [
    "User-agent: *",
    "Allow: /",
    `Sitemap: ${publicUrl(market, "/sitemap.xml")}`,
    `Host: ${getMarket(market).domain}`,
    "",
  ].join("\n");

  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
