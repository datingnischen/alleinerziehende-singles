import data from "../data/startseiten.json" with { type: "json" };
import type { MarketCode } from "./markets.ts";

export type HomeSection = { title: string; imageUrl: string | null; imageAlt: string; html: string };
export type HomeContent = { sourceUrl: string; title: string; description: string; h1: string; sections: HomeSection[] };

/** Startseitentexte aus dem ICONY-CMS (scripts/import_startseiten.py), Wort für Wort. */
export function getHomeContent(market: MarketCode): HomeContent {
  return (data as Record<MarketCode, HomeContent>)[market];
}

/** Kacheln der Plattform (ICONY-Startseite), in allen Märkten gleich formuliert. */
export function platformFeatures(domain: string) {
  return {
    trust: [
      { key: "security", title: "Sicherheit & Datenschutz", text: `Eine sichere Partnersuche mit maximalem Datenschutz steht für uns bei ${domain} an erster Stelle.`, path: "/sicherheit-und-datenschutz.html" },
      { key: "control", title: "Redaktionelle Kontrolle", text: "Unser Supportteam prüft zu Deiner Sicherheit jedes Profil. Über 750.000 sind schon dabei und finden hier ihre neue Liebe.", path: "/redaktionelle-kontrolle.html" },
      { key: "basis", title: "Basis-Mitgliedschaft", text: `Die Registrierung ist komplett kostenlos und Du kannst ${domain} auch mit einer Basis-Mitgliedschaft sehr umfangreich nutzen.`, path: "/kostenlose-basis-mitgliedschaft.html" },
    ],
    flirt: [
      { key: "fragen", title: "Strand oder Berge?", text: "Passen Eure Wünsche, Gedanken und Träume zusammen? Unser Persönlichkeitstest bringt Euch einander näher.", cta: "Mehr zum Fragenflirt", path: "/fragenflirt.html" },
      { key: "foto", title: "Fotoflirt", text: "Für alle, denen häufiger mal die Worte fehlen: Finde mit dem Fotoflirt völlig unkompliziert Deinen Wunschflirt.", cta: "Mehr zum Fotoflirt", path: "/fotoflirt.html" },
      { key: "video", title: "Video-Date", text: "Verabrede Dich virtuell zu einem Date und lerne Deinen Traumpartner persönlich kennen, unkompliziert und sicher.", cta: "Wie unser Video-Date funktioniert", path: "/videodate.html" },
      { key: "stories", title: "Unsere Erfolgsgeschichten", text: "Es funktioniert. Täglich finden sich bei uns neue Paare und das freut uns.", cta: "Zu den Erfolgsgeschichten", path: "/unsere-erfolgsgeschichten.html" },
    ],
  };
}
