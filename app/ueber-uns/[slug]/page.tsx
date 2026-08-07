import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getImportedRootPageBySlug } from "@/lib/icony-import";
import styles from "../../imported-page.module.css";

type Props = { params: Promise<{ slug: string }> };
type AboutSlug = "social-media" | "bewertungen" | "kooperationen";

const aboutLinks: { href: string; label: string }[] = [
  { href: "/ueber-uns", label: "Über uns" },
  { href: "/ueber-uns/social-media", label: "Social Media" },
  { href: "/ueber-uns/bewertungen", label: "Bewertungen & Erfahrungen" },
  { href: "/ueber-uns/kooperationen", label: "Kooperationen" },
];

function isAboutSlug(value: string): value is AboutSlug {
  return value === "social-media" || value === "bewertungen" || value === "kooperationen";
}

function importedPage(slug: AboutSlug) {
  if (slug === "social-media") return getImportedRootPageBySlug("social-media");
  if (slug === "bewertungen") return getImportedRootPageBySlug("bewertungen-und-erfahrungen");
  return null;
}

export function generateStaticParams() {
  return [{ slug: "social-media" }, { slug: "bewertungen" }, { slug: "kooperationen" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isAboutSlug(slug)) return {};

  const imported = importedPage(slug);
  const title = imported?.title ?? "Kooperationen mit alleinerziehende-singles.de";
  const description =
    imported?.description ??
    "Kooperationsmöglichkeiten für Portale, Medien, Communities und Projekte rund um Alleinerziehende, Dating und Partnersuche.";

  return {
    title,
    description,
    alternates: { canonical: `https://alleinerziehende-singles.de/ueber-uns/${slug}` },
  };
}

function AboutSidebar({ current }: { current: AboutSlug }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarCard}>
        <h2>Über uns</h2>
        <div className={styles.linkList}>
          {aboutLinks
            .filter((link) => link.href !== `/ueber-uns/${current}`)
            .map((link) => (
              <Link key={link.href} href={link.href}>{link.label}</Link>
            ))}
        </div>
      </div>
      <div className={styles.ctaCard}>
        <h2>Passende Kontakte entdecken</h2>
        <p>Finde Mütter und Väter aus Deiner Region, die Deine Lebenssituation verstehen.</p>
        <a href="https://alleinerziehende-singles.de/registration/">Kostenlos registrieren</a>
      </div>
    </aside>
  );
}

export default async function AboutDetailPage({ params }: Props) {
  const { slug } = await params;
  if (!isAboutSlug(slug)) notFound();

  const imported = importedPage(slug);

  if (imported) {
    return (
      <main className={styles.page}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Über uns</p>
          <h1>{imported.heroTitle}</h1>
          <p className={styles.lead}>{imported.description}</p>
        </section>
        <section className={styles.layout}>
          <article className={styles.article}>
            <div dangerouslySetInnerHTML={{ __html: imported.contentHtml }} />
          </article>
          <AboutSidebar current={slug} />
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Über uns</p>
        <h1>Kooperationen mit alleinerziehende-singles.de</h1>
        <p className={styles.lead}>
          Informationen für Portale, Medien, Communities und gemeinsame Projekte rund um
          Alleinerziehende, Dating und Partnersuche.
        </p>
      </section>
      <section className={styles.layout}>
        <article className={styles.article}>
          <p>
            Du betreibst ein Magazin, ein Portal, eine Community, einen Social-Media-Kanal oder hast
            eine passende Idee für alleinerziehende Mütter und Väter? Dann freuen wir uns über eine
            konkrete Kooperationsanfrage.
          </p>
          <h2>Für wen Kooperationen interessant sein können</h2>
          <ul>
            <li><strong>Portale und Vergleichsseiten:</strong> für redaktionelle Einordnungen, Tests und thematisch passende Inhalte.</li>
            <li><strong>Influencer und Communities:</strong> für Kanäle rund um Familie, Alleinerziehende, Beziehungen oder Dating.</li>
            <li><strong>Regionale Partner:</strong> für Aktionen und Projekte, die Menschen beim Kennenlernen zusammenbringen.</li>
            <li><strong>Content- und Medienpartner:</strong> für Ratgeber, Interviews, Studien oder gemeinsame Veröffentlichungen.</li>
          </ul>
          <h2>So läuft eine Anfrage ab</h2>
          <ol>
            <li>Stell Dich und Deine Zielgruppe kurz vor.</li>
            <li>Sende einen Link zu Website, Profil, Kanal oder Medienkit.</li>
            <li>Beschreibe, welche Form der Zusammenarbeit Du Dir vorstellst.</li>
            <li>Wir prüfen, ob das Vorhaben fachlich und thematisch passt.</li>
          </ol>
          <h2>Kooperationsanfrage senden</h2>
          <p>
            Je konkreter Du Zielgruppe, Reichweite und Idee beschreibst, desto schneller können wir
            die Anfrage einordnen.
          </p>
          <p><a href="mailto:christian@datingnischen.de">christian@datingnischen.de</a></p>
        </article>
        <AboutSidebar current="kooperationen" />
      </section>
    </main>
  );
}
