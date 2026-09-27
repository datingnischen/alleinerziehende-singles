import type { Metadata } from "next";
import { NotFoundView } from "@/components/not-found-view";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Seite nicht gefunden",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <SiteShell market="de">
      <NotFoundView market="de" />
    </SiteShell>
  );
}
