import type { Metadata } from "next";
import { HomePage } from "@/components/home/home-page";
import { SiteShell } from "@/components/site-shell";
import { getHomeContent } from "@/lib/startseite";
import { getMagazinePosts, type MagazineEntry } from "@/lib/wordpress";

const content = getHomeContent("de");

export const metadata: Metadata = {
  title: { absolute: content.title },
  description: content.description.replace(/\.{2,}$/, "."),
  alternates: { canonical: "https://alleinerziehende-singles.de/" },
};

export const revalidate = 300;

export default async function Home() {
  let posts: MagazineEntry[] = [];
  try {
    posts = await getMagazinePosts(3);
  } catch {
    // Magazin nicht erreichbar: Startseite ohne Artikelteaser ausliefern
  }

  return (
    <SiteShell market="de">
      <HomePage market="de" posts={posts} />
    </SiteShell>
  );
}
