import { MarketLink } from "@/components/market-link";
import { CheckIcon, FamilyHeartIcon, ShieldIcon } from "@/components/icons";
import { SiteHeader, type HeaderNavItem } from "@/components/site-header";
import { StickyCta } from "@/components/sticky-cta";
import { importedCityPages } from "@/lib/icony-import";
import { getMarketCityPages } from "@/lib/market-icony-import";
import { getMarket, publicUrl, type MarketCode } from "@/lib/markets";
import {
  footerRegistrationLabel,
  registrationUrlForContext,
  type RegistrationContext,
} from "@/lib/registration-links";
import { SEARCH_PATH } from "@/lib/site-search";
import { staticAsset } from "@/lib/static-asset";
import styles from "./site-shell.module.css";

type FooterLink = { label: string; path?: string; href?: string };

function navigation(market: MarketCode): HeaderNavItem[] {
  if (market === "de") {
    return [
      { label: "Start", path: "/" },
      { label: "Partnersuche", path: "/partnersuche/" },
      { label: "Magazin", path: "/magazin/" },
      { label: "FAQ", path: "/faq/" },
      { label: "Über uns", path: "/ueber-uns/" },
    ];
  }

  return [
    { label: "Start", path: "/" },
    { label: "Partnersuche", path: "/partnersuche/" },
    { label: "FAQ", href: publicUrl(market, "/faq/") },
    { label: "Fragenflirt", href: publicUrl(market, "/fragenflirt.html") },
    { label: "Erfolgsgeschichten", href: publicUrl(market, "/unsere-erfolgsgeschichten.html") },
  ];
}

function cityLinks(market: MarketCode): FooterLink[] {
  const cities = market === "de"
    ? importedCityPages.map((page) => ({ label: page.cityLabel, path: page.path }))
    : getMarketCityPages(market).map((page) => ({ label: page.cityLabel, path: page.path }));
  return cities.slice(0, 6);
}

function FooterAnchor({ market, link }: { market: MarketCode; link: FooterLink }) {
  return link.path ? <MarketLink market={market} path={link.path}>{link.label}</MarketLink> : <a href={link.href}>{link.label}</a>;
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
  const de = market === "de";
  const trustLinks: FooterLink[] = [
    { label: "Sicherheit & Datenschutz", href: publicUrl(market, "/sicherheit-und-datenschutz.html") },
    { label: "Redaktionelle Kontrolle", href: publicUrl(market, "/redaktionelle-kontrolle.html") },
    { label: "Kostenlose Basis-Mitgliedschaft", href: publicUrl(market, "/kostenlose-basis-mitgliedschaft.html") },
  ];

  const footerColumns: { title: string; links: FooterLink[] }[] = [
    {
      title: "Partnersuche",
      links: [...cityLinks(market), { label: `Alle Städte in ${config.countryName}`, path: "/partnersuche/" }],
    },
    de
      ? {
          title: "Magazin & Über uns",
          links: [
            { label: "Magazin für Alleinerziehende", path: "/magazin/" },
            { label: "Häufige Fragen (FAQ)", path: "/faq/" },
            { label: "Über uns", path: "/ueber-uns/" },
            { label: "Bewertungen & Erfahrungen", path: "/ueber-uns/bewertungen/" },
            { label: "Social Media", path: "/ueber-uns/social-media/" },
            { label: "Kooperationen", path: "/ueber-uns/kooperationen/" },
          ],
        }
      : {
          title: "Kennenlernen",
          links: [
            { label: "Häufige Fragen (FAQ)", href: publicUrl(market, "/faq/") },
            { label: "Fragenflirt", href: publicUrl(market, "/fragenflirt.html") },
            { label: "Fotoflirt", href: publicUrl(market, "/fotoflirt.html") },
            { label: "Video-Date", href: publicUrl(market, "/videodate.html") },
            { label: "Erfolgsgeschichten", href: publicUrl(market, "/unsere-erfolgsgeschichten.html") },
          ],
        },
    {
      title: "Mitgliedschaft & Service",
      links: [
        ...trustLinks,
        { label: "Premiumvorteile", href: publicUrl(market, "/premium-mitgliedschaft.html") },
        ...(de ? [
          { label: "Fragenflirt & Fotoflirt", href: publicUrl(market, "/fragenflirt.html") },
          { label: "Erfolgsgeschichten", href: publicUrl(market, "/unsere-erfolgsgeschichten.html") },
        ] : []),
        { label: "Hilfe & Support", href: publicUrl(market, "/hilfe/") },
      ],
    },
  ];

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.strip}>
          <div className={styles.stripInner}>
            <span className={styles.stripClaim}>
              <FamilyHeartIcon />
              Partnersuche für alleinerziehende Mütter und Väter in {config.countryName}
            </span>
            <span className={styles.stripLinks}>
              {trustLinks.map((link) => <a key={link.label} href={link.href}>{link.label}</a>)}
            </span>
          </div>
        </div>
        <SiteHeader
          market={market}
          items={navigation(market)}
          logo={{ src: staticAsset(config.logoPath), alt: `${config.domain} Logo` }}
          loginUrl={loginUrl}
          registrationUrl={registrationUrl}
          searchPath={de ? SEARCH_PATH : null}
        />
      </header>

      <div className={styles.content}>{children}</div>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <section className={styles.footerCta} aria-label="Registrierung">
            <div>
              <p className={styles.footerKicker}>Gemeinsam statt allein</p>
              <h2>Finde Mütter und Väter, die Deinen Alltag verstehen.</h2>
              <p>
                Kinder, Job und ein voller Kalender? Bei {config.domain} musst Du Deine Lebenssituation nicht
                erklären – hier suchen Menschen, denen es genauso geht.
              </p>
            </div>
            <a className="ae-btn ae-btn-primary" href={registrationUrl}>
              {footerRegistrationText}
            </a>
          </section>

          <div className={styles.footerMain}>
            <div className={styles.footerBrand}>
              <MarketLink market={market} path="/" className={styles.footerLogo}>
                <img src={staticAsset("/brand/alleinerziehende-singles-light.svg")} alt={`${config.domain} Logo`} width={300} height={31} loading="lazy" />
              </MarketLink>
              <p>
                Die Partnersuche für alleinerziehende Singles in {config.countryName}: regionale Stadtseiten,
                ehrliche Antworten und ein kostenloser Einstieg.
              </p>
              <ul className={styles.footerTrust}>
                <li><CheckIcon />Kostenlose Basis-Mitgliedschaft</li>
                <li><CheckIcon />Profile werden redaktionell geprüft</li>
                <li><ShieldIcon />Persönlicher Support bei Fragen</li>
              </ul>
            </div>

            <nav className={styles.footerNav} aria-label="Fußzeile">
              {footerColumns.map((column) => (
                <div key={column.title} className={styles.footerColumn}>
                  <h2>{column.title}</h2>
                  <ul>
                    {column.links.map((link) => (
                      <li key={`${column.title}-${link.label}`}><FooterAnchor market={market} link={link} /></li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          <div className={styles.footerBottom}>
            <span>© {new Date().getFullYear()} {config.domain} · Partnersuche mit Kind und Herz</span>
            <div className={styles.footerLegal}>
              <a href={publicUrl(market, "/datenschutz.html")}>Datenschutz</a>
              <a href={publicUrl(market, "/impressum.html")}>Impressum</a>
              <a href={publicUrl(market, "/agb.html")}>AGB</a>
              <a href={publicUrl(market, "/barrierefreiheit.html")}>Barrierefreiheit</a>
              <span className={styles.footerMarkets} aria-label="Land wählen">
                {(["de", "at", "ch"] as MarketCode[]).map((code) => (
                  <MarketLink key={code} market={code} path="/" aria-current={code === market ? "page" : undefined}>
                    {code.toUpperCase()}
                  </MarketLink>
                ))}
              </span>
            </div>
          </div>
        </div>
      </footer>

      <StickyCta href={registrationUrl} label={registrationContext === "magazin" ? "Kostenlos anmelden" : "Singles in Deiner Nähe finden"} />
    </div>
  );
}
