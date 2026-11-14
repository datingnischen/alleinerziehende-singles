import { ArrowIcon, BookIcon, FamilyHeartIcon, HeartIcon, PinIcon, SparkIcon, UsersIcon } from "@/components/icons";
import { MarketLink } from "@/components/market-link";
import { breadcrumbJsonLd, serializeJsonLd } from "@/lib/json-ld";
import { publicUrl } from "@/lib/markets";
import { registrationUrlForContext } from "@/lib/registration-links";
import { staticAsset } from "@/lib/static-asset";
import "@/components/magazine/magazine.css";

/**
 * Autorenseite /magazin/christian-m-haas/ (nur DE, wie die Artikel selbst).
 *
 * Hintergrund: Die Beiträge liefen bis November 2026 unter „Redaktion“. Christian M. Haas war selbst jahrelang
 * alleinerziehend; namentliche Autorenschaft mit Hintergrund und Buch ist für die E-E-A-T-Bewertung besser als ein
 * anonymes Redaktionskürzel (Christian, 13.11.2026). Feste Seiten zeigen kein Datum.
 */

export const AUTHOR_NAME = "Christian M. Haas";
export const AUTHOR_PATH = "/magazin/christian-m-haas/";
export const AUTHOR_URL = publicUrl("de", AUTHOR_PATH);
export const AUTHOR_PHOTO = "/brand/christian-m-haas.jpg";

const VITA_URL = "https://datingnischen.de/christian/";
const AMAZON_AUTHOR_URL = "https://www.amazon.com/author/christian-m-haas";
const LINKEDIN_URL = "https://www.linkedin.com/in/christian-m-haas-457323379";

const BOOK = {
  title: "Dating ohne Bullshit",
  subtitle: "Der ungeschönte Insiderblick ins Online-Dating-Business",
  isbn: "9783696371210",
  isbnPrint: "978-3-6963-7121-0",
  pages: 136,
  published: "2026-08-21",
  url: "https://www.amazon.de/dp/3696371211/",
  cover: "/brand/dating-ohne-bullshit-cover.webp",
};

export const AUTHOR_META_TITLE = "Christian M. Haas: Autor des Magazins";
export const AUTHOR_META_DESCRIPTION =
  "Christian M. Haas schreibt im Magazin von alleinerziehende-singles.de: seit 2008 im Online-Dating, Betreiber spezialisierter Singlebörsen und selbst jahrelang alleinerziehend.";

function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${AUTHOR_URL}#person`,
    name: AUTHOR_NAME,
    url: AUTHOR_URL,
    image: staticAsset(AUTHOR_PHOTO),
    jobTitle: "Datingexperte",
    description:
      "Betreibt seit 2008 spezialisierte Singlebörsen im deutschsprachigen Raum und schreibt über Partnersuche mit Kind.",
    knowsAbout: ["Online-Dating", "Partnersuche für Alleinerziehende", "Singlebörsen"],
    knowsLanguage: ["Deutsch", "Englisch"],
    sameAs: [VITA_URL, AMAZON_AUTHOR_URL, LINKEDIN_URL],
  };
}

function bookJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    "@id": `${AUTHOR_URL}#book-isbn-${BOOK.isbn}`,
    name: BOOK.title,
    alternateName: BOOK.subtitle,
    author: { "@id": `${AUTHOR_URL}#person` },
    isbn: BOOK.isbn,
    datePublished: BOOK.published,
    inLanguage: "de-DE",
    bookFormat: "https://schema.org/Paperback",
    numberOfPages: BOOK.pages,
    url: BOOK.url,
    image: staticAsset(BOOK.cover),
  };
}

/** Kurzer Autorenhinweis unter jedem Artikel. */
export function AuthorByline() {
  return (
    <aside className="aemag-byline aemag-byline-author">
      <img
        className="aemag-byline-photo"
        src={staticAsset(AUTHOR_PHOTO)}
        alt="Porträt von Christian M. Haas"
        width={60}
        height={60}
        loading="lazy"
        decoding="async"
      />
      <div>
        <strong>{AUTHOR_NAME}</strong>
        <p>
          Betreibt seit 2008 spezialisierte Singlebörsen und hat alleinerziehende-singles.de aufgebaut. Er war selbst
          jahrelang alleinerziehend – darüber schreibt er auch in seinem Buch „{BOOK.title}“.
        </p>
        <MarketLink market="de" path={AUTHOR_PATH}>
          Mehr über Christian M. Haas <ArrowIcon />
        </MarketLink>
      </div>
    </aside>
  );
}

export function AuthorPage() {
  const crumbs = breadcrumbJsonLd("de", [
    { name: "Start", path: "/" },
    { name: "Magazin", path: "/magazin/" },
    { name: AUTHOR_NAME, path: AUTHOR_PATH },
  ]);

  return (
    <main className="aemag aemag-author-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(personJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(bookJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(crumbs) }} />

      <section className="ae-hero aemag-hero aemag-hero-theme">
        <div className="ae-wrap aemag-author-hero">
          <div>
            <nav className="ae-crumbs" aria-label="Brotkrumen">
              <MarketLink market="de" path="/">Start</MarketLink>
              <span aria-hidden="true">›</span>
              <MarketLink market="de" path="/magazin/">Magazin</MarketLink>
              <span aria-hidden="true">›</span>
              <span aria-current="page">{AUTHOR_NAME}</span>
            </nav>
            <span className="ae-badge"><FamilyHeartIcon />Autor im Magazin</span>
            <h1>Christian M. Haas – Autor des Magazins für Alleinerziehende</h1>
            <p className="ae-lead">
              Ich beschäftige mich seit 2008 mit Online-Dating: zuerst als Entwickler eigener Singlebörsen, heute als
              Betreiber spezialisierter Portale für Zielgruppen, die auf den großen Plattformen untergehen. Eine davon
              ist alleinerziehende-singles.de.
            </p>
          </div>
          <figure className="aemag-author-photo">
            <img
              src={staticAsset(AUTHOR_PHOTO)}
              alt="Porträt von Christian M. Haas"
              width={648}
              height={800}
              fetchPriority="high"
              decoding="async"
            />
          </figure>
        </div>
      </section>

      <section className="ae-wrap ae-section" aria-labelledby="aemag-author-why">
        <div className="ae-head">
          <span className="ae-eyebrow"><HeartIcon />Warum dieses Thema</span>
          <h2 id="aemag-author-why">Alleinerziehend war für mich kein Recherchethema</h2>
        </div>
        <div className="ae-rich aemag-author-text">
          <p>
            Ich war selbst jahrelang alleinerziehend. Kita-Zeiten, Krankheitstage, ein Kalender, der für zwei reicht und
            trotzdem nie – das kenne ich nicht aus Studien, sondern aus dem eigenen Alltag. Darüber schreibe ich auch in
            meinem Buch.
          </p>
          <p>
            Genau deshalb gibt es dieses Magazin: Es soll keine Ratgeber-Floskeln liefern, sondern das beschreiben, was
            zwischen Betreuung, Beruf und dem Wunsch nach Nähe wirklich passiert. Wenn ein Beitrag auf Zahlen oder
            Leistungen eingeht, steht die Quelle dabei – bei den Kindergeld-Terminen zum Beispiel die Familienkasse.
          </p>
        </div>
      </section>

      <section className="ae-wrap ae-section" aria-labelledby="aemag-author-book">
        <div className="aemag-author-book">
          <figure>
            <a href={BOOK.url} rel="nofollow noopener noreferrer" target="_blank">
              <img
                src={staticAsset(BOOK.cover)}
                alt={`Buchcover „${BOOK.title}“ von Christian M. Haas`}
                width={520}
                height={738}
                loading="lazy"
                decoding="async"
              />
            </a>
          </figure>
          <div>
            <span className="ae-eyebrow"><BookIcon />Das Buch</span>
            <h2 id="aemag-author-book">{BOOK.title}</h2>
            <p className="aemag-author-book-sub">{BOOK.subtitle}</p>
            <p>
              Ein persönlicher Blick hinter die Kulissen des Online-Dating-Business: wie Plattformen entstehen, welche
              Entscheidungen dahinterstecken und was davon für die Menschen übrig bleibt, die sich dort anmelden.
            </p>
            <ul className="aemag-author-facts">
              <li>Taschenbuch, 1. Auflage, {BOOK.pages} Seiten</li>
              <li>Erschienen am 21. August 2026</li>
              <li>ISBN {BOOK.isbnPrint}</li>
            </ul>
            <a className="ae-btn ae-btn-primary" href={BOOK.url} rel="nofollow noopener noreferrer" target="_blank">
              „{BOOK.title}“ bei Amazon ansehen
            </a>
          </div>
        </div>
      </section>

      <section className="ae-wrap ae-section" aria-labelledby="aemag-author-profile">
        <div className="ae-head">
          <span className="ae-eyebrow"><SparkIcon />Mehr zur Person</span>
          <h2 id="aemag-author-profile">Vita und Profile</h2>
        </div>
        <ul className="aemag-author-links">
          <li>
            <a href={VITA_URL} rel="noopener" target="_blank"><PinIcon /><span>Vita auf Datingnischen.de</span><ArrowIcon /></a>
          </li>
          <li>
            <a href={AMAZON_AUTHOR_URL} rel="nofollow noopener noreferrer" target="_blank"><BookIcon /><span>Autorenseite bei Amazon</span><ArrowIcon /></a>
          </li>
          <li>
            <a href={LINKEDIN_URL} rel="noopener" target="_blank"><UsersIcon /><span>Beruflicher Werdegang bei LinkedIn</span><ArrowIcon /></a>
          </li>
        </ul>
      </section>

      <section className="ae-wrap ae-section">
        <div className="ae-band">
          <div>
            <span className="ae-eyebrow"><HeartIcon />Vom Lesen zum Kennenlernen</span>
            <h2>Mütter und Väter, die Deinen Alltag kennen</h2>
            <p>Profil kostenlos anlegen, Umkreis wählen und in Ruhe schauen, wer zu Dir und Deiner Familie passt.</p>
          </div>
          <div className="ae-band-actions">
            <a className="ae-btn ae-btn-primary" href={registrationUrlForContext("de", "magazin")}>Kostenlos registrieren</a>
            <MarketLink className="ae-btn ae-btn-ghost" market="de" path="/magazin/">Alle Magazin-Artikel</MarketLink>
          </div>
        </div>
      </section>
    </main>
  );
}
