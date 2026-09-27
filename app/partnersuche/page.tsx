import type { Metadata } from "next";
import { CityHub } from "@/components/city/city-hub";
import { getCityHub } from "@/lib/city-pages";
import { publicUrl } from "@/lib/markets";

const hub = getCityHub("de");

export const metadata: Metadata = {
  title: hub.title,
  description: hub.description,
  alternates: { canonical: publicUrl("de", "/partnersuche/") },
};

export default function PartnersucheHubPage() {
  return <CityHub market="de" />;
}
