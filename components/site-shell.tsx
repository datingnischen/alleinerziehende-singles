import Link from "next/link";
import styles from "./site-shell.module.css";

const primaryNav = [
  { label: "Start", href: "/" },
  { label: "Magazin", href: "/magazin" },
  { label: "Erfahrungen", href: "/bewertungen-und-erfahrungen" },
  { label: "Social Media", href: "/social-media" },
  { label: "Hilfe", href: "/hilfe" },
];

const trustLinks = [
  { label: "Sicherheit & Datenschutz", href: "/sicherheit-und-datenschutz.html" },
  { label: "Redaktionelle Kontrolle", href: "/redaktionelle-kontrolle.html" },
  { label: "Basis-Mitgliedschaft", href: "/kostenlose-basis-mitgliedschaft.html" },
  { label: "Premiumvorteile", href: "/premium-mitgliedschaft.html" },
];

const footerColumns = [
  {
    title: "Magazin & Ratgeber",
    links: [
      { label: "Magazin", href: "/magazin" },
      { label: "Fragenflirt", href: "https://alleinerziehende-singles.de/fragenflirt.html", external: true },
      { label: "Fotoflirt", href: "https://alleinerziehende-singles.de/fotoflirt.html", external: true },
      { label: "Video-Date", href: "https://alleinerziehende-singles.de/videodate.html", external: true },
    ],
  },
  {
    title: "Vertrauen",
    links: [
      { label: "Bewertungen & Erfahrungen", href: "/bewertungen-und-erfahrungen" },
      { label: "Sicherheit & Datenschutz", href: "/sicherheit-und-datenschutz.html" },
      { label: "Redaktionelle Kontrolle", href: "/redaktionelle-kontrolle.html" },
      { label: "Social Media", href: "/social-media" },
    ],
  },
  {
    title: "Mitgliedschaft",
    links: [
      { label: "Kostenlose Basis-Mitgliedschaft", href: "/kostenlose-basis-mitgliedschaft.html" },
      { label: "Premiumvorteile", href: "/premium-mitgliedschaft.html" },
      { label: "Jetzt registrieren", href: "https://alleinerziehende-singles.de/registration/", external: true },
      { label: "Login", href: "https://alleinerziehende-singles.de/login/", external: true },
    ],
  },
  {
    title: "Service",
    links: [
      { label: "Hilfe & Support", href: "/hilfe" },
      { label: "Datenschutz", href: "https://alleinerziehende-singles.de/datenschutz.html", external: true },
      { label: "Impressum", href: "https://alleinerziehende-singles.de/impressum.html", external: true },
      { label: "AGB", href: "https://alleinerziehende-singles.de/agb.html", external: true },
      { label: "Barrierefreiheit", href: "https://alleinerziehende-singles.de/barrierefreiheit.html", external: true },
    ],
  },
];

function RenderLink({ href, label, external = false }: { href: string; label: string; external?: boolean }) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer">
        {label}
      </a>
    );
  }

  return <Link href={href}>{label}</Link>;
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} href="/">
            <span className={styles.brandKicker}>Alleinerziehende-Singles.de</span>
            <strong>Partnersuche für Mütter und Väter</strong>
          </Link>

          <nav className={styles.nav} aria-label="Hauptnavigation">
            {primaryNav.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className={styles.headerActions}>
            <a className={styles.login} href="https://alleinerziehende-singles.de/login/" target="_blank" rel="noreferrer">
              Login
            </a>
            <a className={styles.primaryCta} href="https://alleinerziehende-singles.de/registration/" target="_blank" rel="noreferrer">
              Kostenlos registrieren
            </a>
          </div>
        </div>

        <div className={styles.trustBar}>
          <div className={styles.trustBarInner}>
            <span>Mehr Vertrauen für neue Kontakte</span>
            <div className={styles.trustLinks}>
              {trustLinks.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className={styles.content}>{children}</div>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerIntro}>
            <p className={styles.footerEyebrow}>Mehr Sicherheit beim Dating</p>
            <h2>Triff heute noch Singles aus Deiner Region.</h2>
            <p>
              Alleinerziehende-Singles.de verbindet Alleinerziehende, die eine ehrliche Partnersuche,
              verständnisvolle Kontakte und einen geschützten Rahmen suchen.
            </p>
            <div className={styles.footerActions}>
              <a href="https://alleinerziehende-singles.de/registration/" target="_blank" rel="noreferrer">
                Jetzt registrieren
              </a>
              <Link href="/magazin">Zum Magazin</Link>
            </div>
          </div>

          <div className={styles.footerGrid}>
            {footerColumns.map((column) => (
              <section key={column.title} className={styles.footerColumn}>
                <h3>{column.title}</h3>
                <div className={styles.footerLinks}>
                  {column.links.map((link) => (
                    <RenderLink key={`${column.title}-${link.label}`} {...link} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
