import { SiteShell } from "@/components/site-shell";

export default function MagazineLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell market="de" registrationContext="magazin">{children}</SiteShell>;
}
