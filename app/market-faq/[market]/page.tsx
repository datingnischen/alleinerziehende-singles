import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FaqPageView } from "@/components/info/faq-page";
import { SiteShell } from "@/components/site-shell";
import { getFaqData } from "@/lib/faq";
import type { RegionalMarket } from "@/lib/market-icony-import";
import { isMarketCode, publicUrl } from "@/lib/markets";

type Props = { params: Promise<{ market: string }> };

function activeMarket(value: string): RegionalMarket {
  if (!isMarketCode(value) || value === "de") notFound();
  return value;
}

export function generateStaticParams() {
  return [{ market: "at" }, { market: "ch" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const market = activeMarket((await params).market);
  const faq = getFaqData(market);
  if (!faq) return { title: "FAQ" };

  return {
    title: { absolute: faq.title },
    description: faq.description,
    alternates: { canonical: publicUrl(market, faq.path) },
    robots: { index: true, follow: true },
  };
}

/** FAQ der Landesdomains (/faq/ auf .at/.ch): Wortlaut der ICONY-FAQ des jeweiligen Landes (data/icony-import-<markt>.json). */
export default async function MarketFaqPage({ params }: Props) {
  const market = activeMarket((await params).market);
  const faq = getFaqData(market);
  if (!faq) notFound();

  return (
    <SiteShell market={market} registrationContext="location">
      <FaqPageView faq={faq} market={market} />
    </SiteShell>
  );
}
