import type { CSSProperties } from "react";
import { AboutSearchForm } from "@/components/about-search-form";
import { CountryMap } from "@/components/city/country-map";
import {
  ArrowIcon,
  BookIcon,
  CheckIcon,
  EyeIcon,
  FamilyHeartIcon,
  HeartIcon,
  MailIcon,
  PinIcon,
  QuestionIcon,
  SearchIcon,
  ShieldIcon,
  SparkIcon,
  StarIcon,
  UsersIcon,
} from "@/components/icons";
import { MarketLink } from "@/components/market-link";
import type { ReviewsData, SocialData, RatingSection } from "@/lib/about";
import { getCityHubData } from "@/lib/city-hub";
import { serializeJsonLd } from "@/lib/json-ld";
import { getMarket, publicUrl, type MarketCode } from "@/lib/markets";
import { registrationUrlForContext } from "@/lib/registration-links";
import { staticAsset } from "@/lib/static-asset";
import "@/components/city/hub.css";
import "./info.css";
import "./about.css";

const ABOUT_LINKS = [
  { path: "/ueber-uns/", label: "Über uns" },
  { path: "/ueber-uns/bewertungen/", label: "Bewertungen" },
  { path: "/ueber-uns/social-media/", label: "Social Media" },
  { path: "/ueber-uns/kooperationen/", label: "Kooperationen" },
  { path: "/ueber-uns/suche/", label: "Suche" },
];

export function AboutSubnav({ current }: { current: string }) {
  return (
    <nav className="ae-wrap aea-subnav" aria-label="Über uns">
      {ABOUT_LINKS.map((link) => (
        <MarketLink key={link.path} market="de" path={link.path} className={link.path === current ? "aea-subnav-active" : undefined} aria-current={link.path === current ? "page" : undefined}>
          {link.label === "Suche" ? <SearchIcon /> : null}{link.label}
        </MarketLink>
      ))}
    </nav>
  );
}

function Crumbs({ items }: { items: { label: string; path?: string }[] }) {
  return (
    <nav className="aei-crumbs" aria-label="Brotkrumen">
      {items.map((item, index) => (
        <span key={item.label} style={{ display: "contents" }}>
          {index ? <span aria-hidden="true">›</span> : null}
          {item.path ? <MarketLink market="de" path={item.path}>{item.label}</MarketLink> : <span aria-current="page">{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}

function Stars({ value, scale = 5 }: { value: number; scale?: number }) {
  const rating = (value / scale) * 5;
  return <span className="aei-stars" style={{ "--rating": rating } as CSSProperties} role="img" aria-label={`${String(value).replace(".", ",")} von ${scale}`} />;
}

function formatScore(section: RatingSection) {
  return section.score === null ? "" : String(section.score).replace(".", ",");
}

const PLATFORM_LABEL: Record<string, string> = {
  google: "Google",
  loca: "Loca-Dating",
  trustpilot: "Trustpilot",
  portals: "Vergleichsportale",
};

function CtaBand({ title, text }: { title: string; text: string }) {
  return (
    <section className="ae-wrap ae-section">
      <div className="ae-band">
        <div>
          <span className="ae-eyebrow"><HeartIcon />Neu verlieben</span>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
        <div className="ae-band-actions">
          <a className="ae-btn ae-btn-primary" href={registrationUrlForContext("de", "location")}>Kostenlos registrieren</a>
          <MarketLink className="ae-btn ae-btn-ghost" market="de" path="/partnersuche/">Singles nach Stadt</MarketLink>
        </div>
      </div>
    </section>
  );
}

/* ====================================================================== Über uns */

export function AboutHub({ reviews, social }: { reviews: ReviewsData | null; social: SocialData | null }) {
  const hub = getCityHubData("de");
  const ratings = reviews?.ratings.filter((rating) => rating.score !== null) ?? [];
  const markets: MarketCode[] = ["de", "at", "ch"];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    url: publicUrl("de", "/ueber-uns/"),
    name: "Über alleinerziehende-singles.de",
    about: {
      "@type": "Organization",
      name: "alleinerziehende-singles.de",
      url: publicUrl("de", "/"),
      sameAs: [
        ...(social?.channels.map((channel) => channel.url) ?? []),
        ...(reviews?.ratings.map((rating) => rating.link).filter((link): link is string => Boolean(link && link.includes("trustpilot"))) ?? []),
      ],
    },
  };

  return (
    <main className="aei aea">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <section className="aei-hero">
        <div className="ae-wrap aei-hero-grid">
          <div>
            <Crumbs items={[{ label: "Start", path: "/" }, { label: "Über uns" }]} />
            <span className="ae-eyebrow"><FamilyHeartIcon />Über alleinerziehende-singles.de</span>
            <h1>Mehr Vertrauen, mehr Einblicke, mehr Verständnis</h1>
            <p className="aei-lead">
              alleinerziehende-singles.de bringt Mütter und Väter zusammen, die ihre besondere Lebenssituation nicht erst
              erklären möchten. Hier findest Du die wichtigsten Hintergründe, offiziellen Kanäle und unabhängigen
              Bewertungen unserer Plattform.
            </p>
            <div className="aea-search">
              <AboutSearchForm />
            </div>
          </div>
          <figure className="aei-frame">
            <img src={staticAsset("/brand/frontpage-visual-alleinerziehende.webp")} alt="Vater mit Tochter – Familie und Partnersuche gehören zusammen" decoding="async" />
            <span className="aei-frame-badge" aria-hidden="true"><FamilyHeartIcon /></span>
          </figure>
        </div>
      </section>

      <AboutSubnav current="/ueber-uns/" />

      <section className="ae-wrap ae-section aea-values" aria-labelledby="aea-values-title">
        <div className="ae-head">
          <span className="ae-eyebrow"><HeartIcon />Wofür wir stehen</span>
          <h2 id="aea-values-title">Partnersuche, die zum Familienleben passt</h2>
        </div>
        <div className="aea-values-grid">
          <article>
            <FamilyHeartIcon />
            <strong>Verständnis statt Erklärungsnot</strong>
            <p>Hier suchen Menschen, die wissen, dass ein Date gut geplant sein will und die Bedürfnisse der Kinder mitzählen.</p>
          </article>
          <article>
            <EyeIcon />
            <strong>Geprüfte Profile</strong>
            <p>Das Supportteam prüft jedes Profil – inklusive Bilder und Freitexte –, damit Du echten Menschen begegnest.</p>
          </article>
          <article>
            <PinIcon />
            <strong>Nähe, die in den Alltag passt</strong>
            <p>Regionale Stadtseiten zeigen, wer in Deiner Nähe sucht – für Treffen, die sich mit Kita und Job vereinbaren lassen.</p>
          </article>
        </div>
      </section>

      <section className="ae-wrap ae-section">
        <figure className="aea-quote">
          <span className="aea-quote-mark" aria-hidden="true">“</span>
          <blockquote>
            Begleitet wird das Projekt von Christian M. Haas, unabhängiger Datingexperte. Sein Ziel ist es,
            alleinerziehenden Müttern und Vätern eine faire und respektvolle Umgebung für neue Begegnungen zu bieten.
          </blockquote>
          <figcaption>
            <span className="aea-avatar" aria-hidden="true">CH</span>
            <span><strong>Christian M. Haas</strong><small>Datingexperte und Begleiter von alleinerziehende-singles.de</small></span>
          </figcaption>
        </figure>
      </section>

      {ratings.length ? (
        <section className="ae-section aea-ratings" aria-labelledby="aea-ratings-title">
          <div className="ae-wrap">
            <div className="aea-ratings-head">
              <div className="ae-head">
                <span className="ae-eyebrow"><StarIcon />Bewertungen &amp; Erfahrungen</span>
                <h2 id="aea-ratings-title">Was andere über uns sagen</h2>
              </div>
              <MarketLink className="ae-btn ae-btn-primary" market="de" path="/ueber-uns/bewertungen/">Alle Bewertungen <ArrowIcon /></MarketLink>
            </div>
            <div className="aea-ratings-grid">
              {ratings.map((rating) => (
                <div key={rating.kind} className="aea-rating">
                  <small>{PLATFORM_LABEL[rating.kind]}</small>
                  <strong>{formatScore(rating)}<span> / {rating.scale}</span></strong>
                  <Stars value={rating.score!} scale={rating.scale} />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="ae-wrap ae-section aea-community" aria-labelledby="aea-community-title">
        <div>
          <div className="ae-head">
            <span className="ae-eyebrow"><UsersIcon />Community</span>
            <h2 id="aea-community-title">Zu Hause in Deutschland, Österreich und der Schweiz</h2>
            <p>Für {hub.totals.cities} Städte in Deutschland gibt es eigene Stadtseiten mit Tipps für Alleinerziehende – und dieselbe Partnersuche auch für Österreich und die Schweiz.</p>
          </div>
          <ul className="aea-markets">
            {markets.map((code) => (
              <li key={code}>
                <MarketLink market={code} path="/">
                  <span className="aea-market-code">{code.toUpperCase()}</span>
                  <span><strong>{getMarket(code).domain}</strong><small>{getMarket(code).countryName}</small></span>
                  <ArrowIcon />
                </MarketLink>
              </li>
            ))}
          </ul>
        </div>
        <CountryMap market="de" data={hub} className="aea-map" />
      </section>

      <section className="ae-wrap ae-section" aria-labelledby="aea-more-title">
        <div className="ae-head">
          <span className="ae-eyebrow"><SparkIcon />Mehr erfahren</span>
          <h2 id="aea-more-title">Alles rund um alleinerziehende-singles.de</h2>
        </div>
        <div className="aei-tiles">
          <MarketLink className="aei-tile" market="de" path="/ueber-uns/bewertungen/">
            <StarIcon /><strong>Bewertungen &amp; Erfahrungen</strong><span>Google, Trustpilot und Vergleichsportale: So bewerten Mitglieder und Tester die Plattform.</span><em>Bewertungen lesen <ArrowIcon /></em>
          </MarketLink>
          <MarketLink className="aei-tile" market="de" path="/ueber-uns/social-media/">
            <UsersIcon /><strong>Social Media</strong><span>Unsere offiziellen Kanäle für Austausch, Videos und Themen aus dem Alltag Alleinerziehender.</span><em>Kanäle ansehen <ArrowIcon /></em>
          </MarketLink>
          <MarketLink className="aei-tile" market="de" path="/ueber-uns/kooperationen/">
            <MailIcon /><strong>Kooperationen</strong><span>Für Medien, Communities, Portale und Projekte rund um Alleinerziehende und Partnersuche.</span><em>Kooperation anfragen <ArrowIcon /></em>
          </MarketLink>
          <MarketLink className="aei-tile" market="de" path="/faq/">
            <QuestionIcon /><strong>Häufige Fragen</strong><span>Kosten, Sicherheit, Profil und Ablauf – die wichtigsten Antworten auf einen Blick.</span><em>Zur FAQ <ArrowIcon /></em>
          </MarketLink>
          <MarketLink className="aei-tile" market="de" path="/magazin/">
            <BookIcon /><strong>Magazin</strong><span>Tipps und Geschichten für den Alltag als alleinerziehender Single – von Finanzen bis Dating.</span><em>Zum Magazin <ArrowIcon /></em>
          </MarketLink>
          <a className="aei-tile" href={publicUrl("de", "/sicherheit-und-datenschutz.html")}>
            <ShieldIcon /><strong>Sicherheit &amp; Datenschutz</strong><span>Eine sichere Partnersuche mit maximalem Datenschutz steht bei uns an erster Stelle.</span><em>Weiterlesen <ArrowIcon /></em>
          </a>
        </div>
      </section>

      <CtaBand title="Du möchtest neue Menschen kennenlernen?" text="Entdecke Alleinerziehende aus Deiner Region oder starte direkt mit einem kostenlosen Profil." />
    </main>
  );
}

/* ====================================================================== Bewertungen */

export function ReviewsView({ reviews }: { reviews: ReviewsData }) {
  const scored = reviews.ratings.filter((rating) => rating.score !== null);
  return (
    <main className="aei aea">
      <section className="aei-hero">
        <div className="ae-wrap aei-hero-grid">
          <div>
            <Crumbs items={[{ label: "Start", path: "/" }, { label: "Über uns", path: "/ueber-uns/" }, { label: "Bewertungen" }]} />
            <span className="ae-eyebrow"><StarIcon />Bewertungen &amp; Erfahrungen</span>
            <h1>{reviews.heroTitle}</h1>
            <div className="ae-rich aei-intro" dangerouslySetInnerHTML={{ __html: reviews.introHtml }} />
            <ul className="aei-chips">
              {scored.map((rating) => (
                <li key={rating.kind}><strong>{formatScore(rating)}</strong> / {rating.scale} {PLATFORM_LABEL[rating.kind]}</li>
              ))}
            </ul>
          </div>
          {reviews.imageUrl ? (
            <figure className="aei-frame">
              <img src={reviews.imageUrl} alt={reviews.imageAlt} fetchPriority="high" decoding="async" />
              <span className="aei-frame-badge" aria-hidden="true"><StarIcon /></span>
            </figure>
          ) : null}
        </div>
      </section>

      <AboutSubnav current="/ueber-uns/bewertungen/" />

      <section className="ae-wrap ae-section" aria-label="Bewertungen nach Plattform">
        <div className="aea-review-grid">
          {reviews.ratings.map((rating) => (
            <article key={rating.kind} className={`aea-review aea-review-${rating.kind}`}>
              <header>
                <small>{PLATFORM_LABEL[rating.kind]}</small>
                {rating.score !== null ? (
                  <div className="aea-review-score">
                    <strong>{formatScore(rating)}<span> / {rating.scale}</span></strong>
                    <Stars value={rating.score} scale={rating.scale} />
                  </div>
                ) : null}
                {rating.sealUrl ? <img className="aea-seal" src={rating.sealUrl} alt={rating.sealAlt} loading="lazy" decoding="async" /> : null}
              </header>
              <h2>{rating.title}</h2>
              <div className="ae-rich" dangerouslySetInnerHTML={{ __html: rating.html }} />
            </article>
          ))}
        </div>
      </section>

      {reviews.texts.length ? (
        <section className="ae-wrap ae-section aea-reasons">
          {reviews.texts.map((text, index) => (
            <article key={text.title} className={index === reviews.texts.length - 1 ? "aea-reason-cta" : "aea-reason"}>
              <span className="ae-eyebrow">{index === reviews.texts.length - 1 ? <HeartIcon /> : <CheckIcon />}{index === reviews.texts.length - 1 ? "Jetzt starten" : "Darum Alleinerziehende-Singles.de"}</span>
              <h2>{text.title}</h2>
              <div className="ae-rich" dangerouslySetInnerHTML={{ __html: text.html }} />
            </article>
          ))}
        </section>
      ) : null}

      <CtaBand title="Mach Dir selbst ein Bild" text="Die Anmeldung ist kostenlos – schau Dich in Ruhe um und entdecke Mütter und Väter aus Deiner Region." />
    </main>
  );
}

/* ====================================================================== Social Media */

const NETWORK_LABEL: Record<string, string> = { facebook: "Facebook", youtube: "YouTube", instagram: "Instagram", tiktok: "TikTok", pinterest: "Pinterest", other: "Kanal" };

function NetworkIcon({ network }: { network: string }) {
  if (network === "facebook") {
    return <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M13.5 21v-7.2h2.4l.4-2.8h-2.8V9.2c0-.8.2-1.4 1.4-1.4h1.5V5.3a20 20 0 0 0-2.2-.1c-2.2 0-3.7 1.3-3.7 3.8V11H8v2.8h2.5V21Z" /></svg>;
  }
  if (network === "youtube") {
    return <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15V9l5.2 3Z" /></svg>;
  }
  return <UsersIcon />;
}

export function SocialView({ social }: { social: SocialData }) {
  return (
    <main className="aei aea">
      <section className="aei-hero">
        <div className="ae-wrap aei-hero-grid aei-hero-solo">
          <div>
            <Crumbs items={[{ label: "Start", path: "/" }, { label: "Über uns", path: "/ueber-uns/" }, { label: "Social Media" }]} />
            <span className="ae-eyebrow"><UsersIcon />Social Media</span>
            <h1>{social.heroTitle}</h1>
            <p className="aei-lead">{social.description}</p>
          </div>
        </div>
      </section>

      <AboutSubnav current="/ueber-uns/social-media/" />

      <section className="ae-wrap ae-section" aria-labelledby="aea-social-title">
        <div className="ae-head">
          <span className="ae-eyebrow"><HeartIcon />Offizielle Kanäle</span>
          <h2 id="aea-social-title">{social.heading || "Folge uns auf Social Media"}</h2>
        </div>
        <div className="aea-channels">
          {social.channels.map((channel) => (
            <a key={channel.url} className={`aea-channel aea-channel-${channel.network}`} href={channel.url} target="_blank" rel="noopener noreferrer">
              <span className="aea-channel-icon"><NetworkIcon network={channel.network} /></span>
              <small>{NETWORK_LABEL[channel.network]}</small>
              <strong>{channel.name}</strong>
              <span>{channel.text}</span>
              <em>Kanal öffnen <ArrowIcon /></em>
            </a>
          ))}
        </div>
      </section>

      <CtaBand title="Vom Austausch zum Kennenlernen" text="Auf Social Media teilen wir Themen und Tipps – Mütter und Väter aus Deiner Region lernst Du direkt auf der Plattform kennen." />
    </main>
  );
}

/* ====================================================================== Kooperationen */

const COOP_GROUPS = [
  { icon: StarIcon, title: "Portale und Vergleichsseiten", text: "für redaktionelle Einordnungen, Tests und thematisch passende Inhalte." },
  { icon: UsersIcon, title: "Influencer und Communities", text: "für Kanäle rund um Familie, Alleinerziehende, Beziehungen oder Dating." },
  { icon: PinIcon, title: "Regionale Partner", text: "für Aktionen und Projekte, die Menschen beim Kennenlernen zusammenbringen." },
  { icon: BookIcon, title: "Content- und Medienpartner", text: "für Ratgeber, Interviews, Studien oder gemeinsame Veröffentlichungen." },
];

const COOP_STEPS = [
  "Stell Dich und Deine Zielgruppe kurz vor.",
  "Sende einen Link zu Website, Profil, Kanal oder Medienkit.",
  "Beschreibe, welche Form der Zusammenarbeit Du Dir vorstellst.",
  "Wir prüfen, ob das Vorhaben fachlich und thematisch passt.",
];

export function CooperationView() {
  return (
    <main className="aei aea">
      <section className="aei-hero">
        <div className="ae-wrap aei-hero-grid aei-hero-solo">
          <div>
            <Crumbs items={[{ label: "Start", path: "/" }, { label: "Über uns", path: "/ueber-uns/" }, { label: "Kooperationen" }]} />
            <span className="ae-eyebrow"><MailIcon />Kooperationen</span>
            <h1>Kooperationen mit alleinerziehende-singles.de</h1>
            <p className="aei-lead">
              Du betreibst ein Magazin, ein Portal, eine Community, einen Social-Media-Kanal oder hast eine passende Idee für
              alleinerziehende Mütter und Väter? Dann freuen wir uns über eine konkrete Kooperationsanfrage.
            </p>
          </div>
        </div>
      </section>

      <AboutSubnav current="/ueber-uns/kooperationen/" />

      <section className="ae-wrap ae-section" aria-labelledby="aea-coop-groups">
        <div className="ae-head">
          <span className="ae-eyebrow"><SparkIcon />Gemeinsam mehr erreichen</span>
          <h2 id="aea-coop-groups">Für wen Kooperationen interessant sein können</h2>
        </div>
        <div className="aei-tiles">
          {COOP_GROUPS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="aei-tile aea-static-tile"><Icon /><strong>{title}</strong><span>{text}</span></div>
          ))}
        </div>
      </section>

      <section className="ae-wrap ae-section aea-coop">
        <div className="aea-steps-card">
          <span className="ae-eyebrow"><CheckIcon />So läuft eine Anfrage ab</span>
          <ol>
            {COOP_STEPS.map((step, index) => <li key={step}><span>{index + 1}</span>{step}</li>)}
          </ol>
        </div>
        <div className="aea-mail-card">
          <MailIcon />
          <h2>Kooperationsanfrage senden</h2>
          <p>Je konkreter Du Zielgruppe, Reichweite und Idee beschreibst, desto schneller können wir die Anfrage einordnen.</p>
          <a className="ae-btn ae-btn-primary" href="mailto:christian@datingnischen.de">christian@datingnischen.de</a>
        </div>
      </section>
    </main>
  );
}
