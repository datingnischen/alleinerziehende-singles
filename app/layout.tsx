import type { Metadata } from "next";
import { Bricolage_Grotesque, Open_Sans } from "next/font/google";
import { staticAsset } from "@/lib/static-asset";
import "./globals.css";

// Überschriften: Bricolage Grotesque (wie die übrigen Nischen), Fließtext: Open Sans wie auf der ICONY-Plattform.
const display = Bricolage_Grotesque({
  variable: "--ae-display",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

const body = Open_Sans({
  variable: "--ae-body",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Alleinerziehende-Singles.de",
    template: "%s | Alleinerziehende-Singles.de",
  },
  description:
    "Partnersuche für alleinerziehende Mütter und Väter: regionale Stadtseiten, Magazin und ehrliche Antworten rund ums Kennenlernen mit Kind.",
  // Icons liegen in public/brand/ statt als app/icon.png, damit sie absolut vom Vercel-Host kommen
  // (der nginx vor den Live-Domains reicht nur Seitenrouten weiter).
  icons: {
    icon: staticAsset("/brand/icon.png"),
    apple: staticAsset("/brand/apple-icon.png"),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
