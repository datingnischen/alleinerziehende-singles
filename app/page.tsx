import styles from "./page.module.css";

const serviceLinks = [
  { label: "Registrierung", href: "https://alleinerziehende-singles.de/registration/" },
  { label: "Login", href: "https://alleinerziehende-singles.de/login/" },
  { label: "Bewertungen & Erfahrungen", href: "https://alleinerziehende-singles.de/bewertungen-und-erfahrungen/" },
  { label: "Social Media", href: "https://alleinerziehende-singles.de/social-media/" },
];

const sourceFacts = [
  "Magazin-WordPress unter /magazin verifiziert",
  "162 Posts, 57 Pages, 3 Kategorien live bestätigt",
  "Root-/Servicebereich aktuell getrennt vom Magazin-WordPress",
];

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Migration in Arbeit</p>
          <h1>Alleinerziehende-Singles.de wird jetzt auf eine saubere Vercel-Basis gezogen.</h1>
          <p className={styles.lead}>
            Diese erste Repo-Basis ist bereits live buildbar und dient als technischer Startpunkt für die
            kommende Migration von Magazin und bestehendem Root-/Service-Stack nach dem bewährten elFlirt-Playbook.
          </p>
          <div className={styles.actions}>
            <a className={styles.primary} href="https://alleinerziehende-singles.de/magazin/">
              Magazin live ansehen
            </a>
            <a className={styles.secondary} href="https://github.com/datingnischen/alleinerziehende-singles">
              GitHub-Repo öffnen
            </a>
          </div>
        </section>

        <section className={styles.grid}>
          <article className={styles.card}>
            <h2>Verifizierte Quellen</h2>
            <ul>
              {sourceFacts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
          </article>

          <article className={styles.card}>
            <h2>Wichtige Einstiege</h2>
            <div className={styles.linkList}>
              {serviceLinks.map((link) => (
                <a key={link.href} href={link.href}>
                  {link.label}
                </a>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
