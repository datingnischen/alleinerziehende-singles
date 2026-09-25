import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { staticAsset } from "@/lib/static-asset";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Alleinerziehende-Singles.de",
    template: "%s | Alleinerziehende-Singles.de",
  },
  description:
    "Partnersuche, Sicherheit, Antworten und Magazin von Alleinerziehende-Singles.de in einer klaren, modernen Übersicht.",
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
    <html lang="de" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
