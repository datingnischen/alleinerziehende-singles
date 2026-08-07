import { SiteShell } from "@/components/site-shell";

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell market="de">{children}</SiteShell>;
}
