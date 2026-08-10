import Image from "next/image";
import Link from "next/link";
import { getMarket, publicUrl, type MarketCode } from "@/lib/markets";
import {
  footerRegistrationLabel,
  registrationUrlForContext,
  type RegistrationContext,
} from "@/lib/registration-links";
import styles from "./site-shell.module.css";

type NavLink = { label: string; href: string; internal?: boolean };

function navigation(market: MarketCode): NavLink[] {
  if (market === "de") {
    return [
      { label: "Start", href: "/", internal: true },
      { label: "Partnersuche", href: "/partnersuche", internal: true },
      { label: "Magazin", href: "/magazin", internal: true },
      { label: "FAQ", href: "/faq", internal: true },
      { label: "Über uns", href: "/ueber-uns", internal: true },
    ];
  }

  return [
    { label: "Start", href: publicUrl(market) },
    { label: "FAQ", href: publicUrl(market, "/faq") },
    { label: "Fragenflirt", href: publicUrl(market, "/fragenflirt.html") },
    { label: "Fotoflirt", href: publicUrl(market, "/fotoflirt.html") },
  ];
}

function RenderLink({ href, label, internal = false }: NavLink) {
  return internal ? <Link href={href}>{label}</Link> : <a href={href}>{label}</a>;
}

export function SiteShell({
  children,
  market = "de",
  registrationContext = "default",
}: {
  children: React.ReactNode;
  market?: MarketCode;
  registrationContext?: RegistrationContext;
}) {
  const config = getMarket(market);
  const loginUrl = publicUrl(market, "/login/");
  const registrationUrl = registrationUrlForContext(market, registrationContext);
  const footerRegistrationText = footerRegistrationLabel(market, registrationContext);
  const frontendMagazine = market === "de";
  const primaryNav = navigation(market);
  const trustLinks: NavLink[] = [
    { label: "Sicherheit & Datenschutz", href: publicUrl(market, "/sicherheit-und-datenschutz.html") },
    { label: "Redaktionelle Kontrolle", href: publicUrl(market, "/redaktionelle-kontrolle.html") },
    { label: "Basis-Mitgliedschaft", href: publicUrl(market, "/kostenlose-basis-mitgliedschaft.html") },
    { label: "Premiumvorteile", href: publicUrl(market, "/premium-mitgliedschaft.html") },
  ];
  const countryLinks = (["de", "at", "ch"] as MarketCode[]).filter((code) => code !== market);

  const footerColumns: { title: string; links: NavLink[] }[] = [
    {
      title: "Tipps",
      links: [
        ...(frontendMagazine ? [{ label: "Magazin", href: "/magazin", internal: true }] : []),
        { label: "Fragenflirt", href: publicUrl(market, "/fragenflirt.html") },
        { label: "Fotoflirt", href: publicUrl(market, "/fotoflirt.html") },
        { label: "Video-Date", href: publicUrl(market, "/videodate.html") },
        { label: "Erfolgsgeschichten", href: publicUrl(market, "/unsere-erfolgsgeschichten.html") },
      ],
    },
    {
      title: market === "de" ? "Über uns" : "Vertrauen",
      links: market === "de"
        ? [
            { label: "Über uns", href: "/ueber-uns", internal: true },
            { label: "Bewertungen & Erfahrungen", href: "/ueber-uns/bewertungen", internal: true },
            { label: "Social Media", href: "/ueber-uns/social-media", internal: true },
            { label: "Kooperationen", href: "/ueber-uns/kooperationen", internal: true },
          ]
        : [
            { label: "FAQ", href: publicUrl(market, "/faq") },
            ...trustLinks.slice(0, 2),
          ],
    },
    {
      title: "Mitgliedschaft",
      links: [
        { label: "Kostenlose Basis-Mitgliedschaft", href: publicUrl(market, "/kostenlose-basis-mitgliedschaft.html") },
        { label: "Premiumvorteile", href: publicUrl(market, "/premium-mitgliedschaft.html") },
        { label: "Jetzt registrieren", href: registrationUrl },
        { label: "Login", href: loginUrl },
      ],
    },
    {
      title: "Service & Länder",
      links: [
        ...(market === "de" ? [{ label: "FAQ", href: "/faq", internal: true }] : []),
        { label: "Hilfe & Support", href: publicUrl(market, "/hilfe/") },
        { label: "Datenschutz", href: publicUrl(market, "/datenschutz.html") },
        { label: "Impressum", href: publicUrl(market, "/impressum.html") },
        { label: "AGB", href: publicUrl(market, "/agb.html") },
        ...countryLinks.map((code) => ({
          label: `${getMarket(code).countryName} · ${getMarket(code).domain}`,
          href: publicUrl(code),
        })),
      ],
    },
  ];

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a className={styles.brand} href={publicUrl(market)}>
            <Image src={config.logoPath} alt={`${config.domain} Logo`} width={300} height={31} priority />
            <span>Partnersuche für Mütter und Väter</span>
          </a>

          <nav className={styles.nav} aria-label="Hauptnavigation">
            {primaryNav.map((item) => <RenderLink key={`${item.href}-${item.label}`} {...item} />)}
          </nav>

          <div className={styles.headerActions}>
            <a className={styles.login} href={loginUrl}>Login</a>
            <a className={styles.primaryCta} href={registrationUrl}>Kostenlos registrieren</a>
          </div>
        </div>

        <div className={styles.trustBar}>
          <div className={styles.trustBarInner}>
            <span>Mehr Vertrauen für neue Kontakte in {config.countryName}</span>
            <div className={styles.trustLinks}>
              {trustLinks.map((item) => <RenderLink key={item.href} {...item} />)}
            </div>
          </div>
        </div>
      </header>

      <div className={styles.content}>{children}</div>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerIntro}>
            <p className={styles.footerEyebrow}>Mehr Sicherheit beim Dating</p>
            <h2>Finde jetzt liebevolle Kontakte in {config.countryName}.</h2>
            <p>
              {config.domain} ist für alleinerziehende Singles da, die sich eine ehrliche Partnersuche,
              verständnisvolle Gespräche und neue Nähe wünschen.
            </p>
            <div className={styles.footerActions}>
              <a href={registrationUrl}>{footerRegistrationText}</a>
              {frontendMagazine ? <Link href="/magazin">Zum Magazin</Link> : <a href={publicUrl(market, "/faq")}>Zu den FAQ</a>}
            </div>
          </div>

          <div className={styles.footerGrid}>
            {footerColumns.map((column) => (
              <section key={column.title} className={styles.footerColumn}>
                <h3>{column.title}</h3>
                <div className={styles.footerLinks}>
                  {column.links.map((link) => <RenderLink key={`${column.title}-${link.label}`} {...link} />)}
                </div>
              </section>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
