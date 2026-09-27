import type { Metadata } from "next";
import { AboutHub } from "@/components/info/about-views";
import { getReviewsData, getSocialData } from "@/lib/about";

export const metadata: Metadata = {
  title: "Über uns",
  description:
    "Erfahre mehr über alleinerziehende-singles.de, unsere Social-Media-Kanäle, Bewertungen und Kooperationsmöglichkeiten.",
  alternates: { canonical: "https://alleinerziehende-singles.de/ueber-uns/" },
};

export default function AboutPage() {
  // Die Seitensuche steckt im Hub als <AboutSearchForm /> (siehe AboutHub).
  return <AboutHub reviews={getReviewsData()} social={getSocialData()} />;
}
