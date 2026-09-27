"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MarketLink } from "@/components/market-link";
import { ArrowIcon, CloseIcon, MenuIcon, SearchIcon } from "@/components/icons";
import type { MarketCode } from "@/lib/markets";
import styles from "./site-shell.module.css";

export type HeaderNavItem = { label: string; path?: string; href?: string };

type Props = {
  market: MarketCode;
  items: HeaderNavItem[];
  logo: { src: string; alt: string };
  loginUrl: string;
  registrationUrl: string;
  searchPath: string | null;
};

function isActive(pathname: string, path: string) {
  const current = pathname.replace(/^\/(?:de|at|ch)(?=\/|$)/, "") || "/";
  if (path === "/") return current === "/";
  return current.startsWith(path.replace(/\/$/, ""));
}

/** Kopfzeile: Logo, Hauptnavigation, Login und Registrierung; unter 1080px als Klappmenü. */
export function SiteHeader({ market, items, logo, loginUrl, registrationUrl, searchPath }: Props) {
  const pathname = usePathname() || "/";
  const menu = useRef<HTMLDetailsElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Menü nach einem Seitenwechsel schließen
  useEffect(() => {
    if (menu.current) menu.current.open = false;
  }, [pathname]);

  const nav = items.map((item) => {
    const active = item.path ? isActive(pathname, item.path) : false;
    return item.path ? (
      <MarketLink key={item.label} market={market} path={item.path} className={active ? styles.navActive : undefined} aria-current={active ? "page" : undefined}>
        {item.label}
      </MarketLink>
    ) : (
      <a key={item.label} href={item.href}>{item.label}</a>
    );
  });

  return (
    <div className={`${styles.bar} ${scrolled ? styles.barScrolled : ""}`}>
      <div className={styles.barInner}>
        <MarketLink market={market} path="/" className={styles.brand}>
          <img src={logo.src} alt={logo.alt} width={300} height={31} />
        </MarketLink>

        <nav className={styles.nav} aria-label="Hauptnavigation">
          {nav}
        </nav>

        <div className={styles.actions}>
          {searchPath ? (
            <MarketLink market={market} path={searchPath} className={styles.searchLink}>
              <SearchIcon />
              <span className="ae-sr">Seite durchsuchen</span>
            </MarketLink>
          ) : null}
          <a className={styles.login} href={loginUrl}>Login</a>
          <a className={`ae-btn ae-btn-primary ae-btn-small ${styles.register}`} href={registrationUrl}>
            <span className={styles.registerLong}>Kostenlos registrieren</span>
            <span className={styles.registerShort}>Registrieren</span>
          </a>
          <details className={styles.menu} ref={menu}>
            <summary aria-label="Menü">
              <MenuIcon className={styles.menuOpen} />
              <CloseIcon className={styles.menuClose} />
            </summary>
            <div className={styles.menuPanel}>
              <nav aria-label="Menü">
                {nav}
                {searchPath ? <MarketLink market={market} path={searchPath}>Seite durchsuchen</MarketLink> : null}
                <a href={loginUrl}>Login</a>
              </nav>
              <a className="ae-btn ae-btn-primary" href={registrationUrl}>
                Kostenlos registrieren <ArrowIcon />
              </a>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
