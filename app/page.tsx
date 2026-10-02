import type { Metadata } from "next";
import { HomePage } from "@/components/home/home-page";
import { SiteShell } from "@/components/site-shell";
import { getHomeContent } from "@/lib/startseite";
import { getMagazinePosts } from "@/lib/magazine-content";

const content = getHomeContent("de");

export const metadata: Metadata = {
  title: { absolute: content.title },
  description: content.description.replace(/\.{2,}$/, "."),
  alternates: { canonical: "https://alleinerziehende-singles.de/" },
};

export default function Home() {
  const posts = getMagazinePosts(3);

  return (
    <SiteShell market="de">
      <HomePage market="de" posts={posts} />
    </SiteShell>
  );
}
