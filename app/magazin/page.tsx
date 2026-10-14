import type { Metadata } from "next";
import { MagazineOverview } from "@/components/magazine/magazine-overview";

export const metadata: Metadata = {
  title: "Magazin",
  description:
    "Magazin für Alleinerziehende: Dating mit Kind, Familienalltag, Kindergeld-Termine und Schwangerschaft Woche für Woche – ehrlich und alltagsnah.",
  alternates: { canonical: "https://alleinerziehende-singles.de/magazin/" },
};

type Props = {
  searchParams?: Promise<{ thema?: string; seite?: string }>;
};

// Übersicht, Themenwelten und Kindergeld-Service: components/magazine/magazine-overview.tsx (auch für AT/CH).
export default async function MagazinePage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};
  return <MagazineOverview market="de" thema={params.thema} seite={params.seite} />;
}
