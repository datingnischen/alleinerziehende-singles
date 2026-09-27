import type { CSSProperties } from "react";
import { IconySinglesWidget } from "@/components/icony-singles-widget";
import { ArrowIcon, ClockIcon, CompassIcon, FamilyHeartIcon, HeartIcon, PinIcon, RouteIcon } from "@/components/icons";
import { MarketLink } from "@/components/market-link";
import { TOPIC_LABELS, buildCityGuide, nearestCities, type GuideTopic } from "@/lib/city-guide";
import { citySlugFromHref, getCityPages, type CityPage } from "@/lib/city-pages";
import { publicUrl } from "@/lib/markets";
import { TopicIcon } from "./topic-icon";
import "./city.css";

const IDEAS: { topic: GuideTopic; title: string; text: string; cta: string }[] = [
  { topic: "leisure", title: "Ausflug zu dritt", text: "Spielplatz, Park oder Museum: Ein Treffen, bei dem die Kinder dabei sein dürfen, nimmt den Druck raus – und zeigt schnell, ob es passt.", cta: "Freizeittipps ansehen" },
  { topic: "meet", title: "Treffpunkte für Eltern", text: "Offene Treffs und Gruppen für Alleinerziehende: Hier begegnest Du Menschen, die den Alltag mit Kind aus eigener Erfahrung kennen.", cta: "Treffpunkte ansehen" },
  { topic: "love", title: "Ehrlich von Anfang an", text: "Wer Kinder hat, sagt es gleich – und findet so Menschen, die genau das zu schätzen wissen. Tipps fürs Kennenlernen mit Kind.", cta: "Dating-Tipps lesen" },
  { topic: "kids", title: "Zeit für Dich", text: "Verlässliche Kinderbetreuung ist die halbe Miete für ein entspanntes Date zu zweit – und für ein bisschen Luft im Alltag.", cta: "Betreuung ansehen" },
  { topic: "support", title: "Rückhalt vor Ort", text: "Beratungsstellen und Netzwerke entlasten im Alltag und schaffen Freiräume – auch für neue Kontakte.", cta: "Anlaufstellen ansehen" },
  { topic: "home", title: "Wohnen mit Kind", text: "Gemeinschaftliche Wohnprojekte und Hilfen bei der Wohnungssuche: gut zu wissen, wenn aus zwei Familien eine wird.", cta: "Wohntipps ansehen" },
  { topic: "money", title: "Finanzen im Blick", text: "Welche Hilfen es gibt und wo Du sie beantragst – weniger Sorgen machen den Kopf frei fürs Wesentliche.", cta: "Hilfen ansehen" },
];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function CityPageView({ city }: { city: CityPage }) {
  const { market } = city;
  const guide = buildCityGuide({ contentHtml: city.contentHtml, imageUrl: city.imageUrl, creditUrl: city.creditUrl });
  const pages = getCityPages(market);
  const nearby = nearestCities(market, city.slug, pages, 5);
  const maxKm = Math.max(...nearby.map((entry) => entry.km), 1);
  const bySlug = new Map(pages.map((page) => [page.slug, page]));
  const relatedFromText = guide.related
    .map((link) => bySlug.get(citySlugFromHref(link.href) ?? ""))
    .filter((page): page is CityPage => Boolean(page) && page!.slug !== city.slug);
  const related = [...new Map((relatedFromText.length ? relatedFromText : nearby).map((page) => [page.slug, page])).values()];
  const matched = IDEAS.map((idea) => ({ ...idea, href: guide.sections.find((section) => section.topic === idea.topic)?.id }))
    .filter((idea) => idea.href);
  // Mindestens drei Karten: fehlende Themen verweisen auf den Anfang des Stadt-Kompasses.
  const ideas = [...matched, ...IDEAS.filter((idea) => !matched.some((entry) => entry.topic === idea.topic)).map((idea) => ({ ...idea, href: "kompass" }))]
    .slice(0, Math.max(3, Math.min(4, matched.length)));
  const longTitle = city.heroTitle.length > 58;

  return (
    <main className="aec">
      <section className="ae-hero ae-hero-shade aec-hero">
        {city.imageUrl ? <img className="ae-hero-img" src={city.imageUrl} alt={city.imageAlt?.trim() || `Stadtansicht ${city.name}`} fetchPriority="high" decoding="async" /> : null}
        <div className="ae-wrap aec-hero-grid">
          <div>
            <nav className="ae-crumbs" aria-label="Brotkrumen">
              <MarketLink market={market} path="/">Start</MarketLink>
              <span aria-hidden="true">›</span>
              <MarketLink market={market} path="/partnersuche/">Partnersuche</MarketLink>
              <span aria-hidden="true">›</span>
              <span aria-current="page">{city.name}</span>
            </nav>
            <span className="ae-badge"><FamilyHeartIcon />Familien-Kompass{city.geo ? ` · ${city.geo.region}` : ""}</span>
            <h1 className={longTitle ? "aec-h1-long" : undefined}>{city.heroTitle}</h1>
            <p className="ae-lead">{city.description}</p>
            <div className="ae-actions">
              <a className="ae-btn ae-btn-primary" href={city.registrationUrl}>Singles in {city.name} finden</a>
              <a className="ae-btn ae-btn-ghost" href="#kompass">Zum Stadt-Kompass <span aria-hidden="true">↓</span></a>
            </div>
          </div>

          <aside className="aec-note" aria-label={`Familien-Kompass ${city.name}`}>
            <span className="aec-note-tape" aria-hidden="true" />
            <span className="aec-note-kicker"><CompassIcon />Familien-Kompass</span>
            <strong className="aec-note-city">{city.name}</strong>
            <dl className="aec-note-stats">
              <div><dt>Kapitel</dt><dd>{guide.sections.length || 1}</dd></div>
              <div><dt>Themen</dt><dd>{Math.max(guide.topics.length, 1)}</dd></div>
              <div><dt>Min. Lesen</dt><dd>{guide.readingMinutes}</dd></div>
            </dl>
            {guide.topics.length ? (
              <ul className="aec-note-topics">
                {guide.topics.slice(0, 6).map((topic) => <li key={topic} className={`aec-t-${topic}`}><TopicIcon topic={topic} />{TOPIC_LABELS[topic]}</li>)}
              </ul>
            ) : null}
          </aside>
        </div>
        {guide.imageCreditUrl ? (
          <a className="ae-credit" href={guide.imageCreditUrl} target="_blank" rel="nofollow noopener noreferrer">
            Bild: {guide.imageCreditUrl.includes("pixabay") ? "Pixabay" : "Quelle"}
          </a>
        ) : null}
      </section>

      <div className="ae-wrap">
        <ul className="ae-facts">
          <li><PinIcon /><span><small>Suchort</small><strong>{city.name}{city.geo && city.geo.region !== city.name ? `, ${city.geo.region}` : ""}</strong></span></li>
          {nearby[0] ? <li><RouteIcon /><span><small>Nächste Stadtseite</small><strong>{nearby[0].name} · {nearby[0].km} km</strong></span></li> : null}
          <li><ClockIcon /><span><small>Lesezeit Kompass</small><strong>ca. {guide.readingMinutes} Minuten</strong></span></li>
          <li><HeartIcon /><span><small>Anmeldung</small><strong>kostenlos</strong></span></li>
        </ul>
      </div>

      <div className="ae-wrap aec-widget">
        <IconySinglesWidget
          city={city.name}
          zip={city.widget.zip}
          country={city.widget.country}
          platformId={city.widget.platformId}
          searchUrl={city.searchUrl}
          profileUrl={publicUrl(market, "/?AID=location")}
        />
      </div>

      {ideas.length ? (
        <section className="ae-wrap ae-section" aria-labelledby="aec-ideas-title">
          <div className="ae-head">
            <span className="ae-eyebrow"><FamilyHeartIcon />Aus dem Stadt-Kompass</span>
            <h2 id="aec-ideas-title">Kennenlernen mit Kind in {city.name}</h2>
            <p>Was Alleinerziehende in {city.name} wissen sollten – und wo sich Mütter und Väter ganz natürlich begegnen.</p>
          </div>
          <div className="aec-ideas">
            {ideas.map((idea, index) => (
              <a key={idea.topic} className={`aec-idea aec-t-${idea.topic}`} href={`#${idea.href}`} style={{ "--tilt": `${index % 2 ? 1.2 : -1.2}deg` } as CSSProperties}>
                <span className="aec-idea-icon"><TopicIcon topic={idea.topic} /></span>
                <strong>{idea.title}</strong>
                <span>{idea.text}</span>
                <em>{idea.cta} <span aria-hidden="true">→</span></em>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <section id="kompass" className="ae-wrap ae-section aec-guide" aria-label={`Stadt-Kompass für ${city.name}`}>
        {guide.sections.length > 1 ? (
          <aside className="aec-toc">
            <span className="aec-toc-kicker"><CompassIcon />Stadt-Kompass</span>
            <strong>Alleinerziehend in {city.name}</strong>
            <ol>
              {guide.sections.map((section, index) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}><TopicIcon topic={section.topic} /><span>{section.heading}</span><small>{pad(index + 1)}</small></a>
                </li>
              ))}
            </ol>
            <a className="ae-btn ae-btn-primary aec-toc-cta" href={city.registrationUrl}>Mütter &amp; Väter kennenlernen</a>
          </aside>
        ) : null}
        <div className="aec-chapters">
          {guide.introHtml ? (
            <article className="aec-chapter aec-intro">
              <div className="ae-rich" dangerouslySetInnerHTML={{ __html: guide.introHtml }} />
            </article>
          ) : null}
          {guide.sections.map((section, index) => (
            <article key={section.id} id={section.id} className={`aec-chapter aec-t-${section.topic}`}>
              <header>
                <span className="aec-chapter-icon"><TopicIcon topic={section.topic} /></span>
                <span className="aec-chapter-no" aria-hidden="true">{pad(index + 1)}</span>
                <span className="aec-chapter-kicker">{TOPIC_LABELS[section.topic]}</span>
                <h2>{section.heading}</h2>
              </header>
              {section.html ? <div className="ae-rich" dangerouslySetInnerHTML={{ __html: section.html }} /> : null}
            </article>
          ))}
        </div>
      </section>

      {nearby.length ? (
        <section className="ae-wrap ae-section" aria-labelledby="aec-near-title">
          <div className="ae-head">
            <span className="ae-eyebrow"><RouteIcon />Nachbarn in Reichweite</span>
            <h2 id="aec-near-title">Alleinerziehende Singles rund um {city.name}</h2>
            <p>Die nächsten Stadtseiten, gemessen in Luftlinie ab {city.name} – für alle, die ihren Suchradius etwas größer ziehen.</p>
          </div>
          <ol className="aec-near">
            {nearby.map((entry) => (
              <li key={entry.slug}>
                <MarketLink className="aec-near-row" market={market} path={entry.path}>
                  {entry.imageUrl ? <img src={entry.imageUrl} alt="" loading="lazy" decoding="async" /> : <span className="aec-near-ph"><PinIcon /></span>}
                  <span className="aec-near-name"><small>Singles in</small><strong>{entry.name}</strong></span>
                  <span className="aec-near-bar" aria-hidden="true"><i style={{ width: `${Math.max(16, (entry.km / maxKm) * 100)}%` }} /></span>
                  <span className="aec-near-km">{entry.km} km</span>
                </MarketLink>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className="ae-wrap aec-related" aria-labelledby="aec-related-title">
        <h2 id="aec-related-title">Diese Städte könnten auch interessant für dich sein:</h2>
        <ul>
          {related.map((page) => (
            <li key={page.slug}><MarketLink market={market} path={page.path}><PinIcon />{page.name}</MarketLink></li>
          ))}
          <li><MarketLink className="aec-related-all" market={market} path="/partnersuche/">Alle {pages.length} Städte <ArrowIcon /></MarketLink></li>
        </ul>
      </section>

      <section className="ae-wrap ae-section">
        <div className="ae-band">
          <div>
            <span className="ae-eyebrow"><HeartIcon />Neu verlieben in {city.name}</span>
            <h2>Mütter und Väter aus {city.name}, die Deinen Alltag verstehen</h2>
            <p>Profil in wenigen Minuten anlegen, Umkreis festlegen und in Ruhe schauen, wer zu Dir und Deiner Familie passt. Die Anmeldung ist kostenlos.</p>
          </div>
          <div className="ae-band-actions">
            <a className="ae-btn ae-btn-primary" href={city.registrationUrl}>Kostenlos registrieren</a>
            <a className="ae-btn ae-btn-ghost" href={city.searchUrl}>In {city.name} suchen</a>
          </div>
        </div>
      </section>
    </main>
  );
}
