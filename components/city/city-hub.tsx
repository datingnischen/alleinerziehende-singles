import { CitySearchFallback } from "@/components/city-search-fallback";
import { FamilyHeartIcon, HeartIcon, PinIcon } from "@/components/icons";
import { MarketLink } from "@/components/market-link";
import { TOPIC_LABELS, type GuideTopic } from "@/lib/city-guide";
import { getCityHubData } from "@/lib/city-hub";
import { getCityHub } from "@/lib/city-pages";
import { getMarket, type MarketCode } from "@/lib/markets";
import { registrationUrlForContext } from "@/lib/registration-links";
import { CityFinder } from "./city-finder";
import { CountryMap } from "./country-map";
import { TopicIcon } from "./topic-icon";
import "./city.css";
import "./hub.css";

const REGION_LABEL: Record<MarketCode, { one: string; many: string }> = {
  de: { one: "Bundesland", many: "Bundesländer" },
  at: { one: "Bundesland", many: "Bundesländer" },
  ch: { one: "Kanton", many: "Kantone" },
};

const INSIDE: { topic: GuideTopic; text: string }[] = [
  { topic: "support", text: "Beratungsstellen, Netzwerke und offene Türen – wer vor Ort hilft, wenn der Alltag mal zu voll wird." },
  { topic: "kids", text: "Kita, Schule und Betreuung: was es gibt und wie Alleinerziehende Beruf und Familie unter einen Hut bekommen." },
  { topic: "leisure", text: "Ausflüge, Spielplätze und Familienangebote – ideal für Treffen, bei denen die Kinder dabei sein dürfen." },
  { topic: "love", text: "Ehrliche Gedanken und Tipps rund ums Kennenlernen, wenn Kinder zum Leben dazugehören." },
];

export function CityHub({ market }: { market: MarketCode }) {
  const hub = getCityHub(market);
  const data = getCityHubData(market);
  const config = getMarket(market);
  const regionLabel = REGION_LABEL[market];
  const registrationUrl = registrationUrlForContext(market, "location");

  return (
    <main className="aec aeh">
      <section className="ae-hero aeh-hero">
        <div className="ae-wrap aeh-hero-grid">
          <div>
            <nav className="ae-crumbs" aria-label="Brotkrumen">
              <MarketLink market={market} path="/">Start</MarketLink>
              <span aria-hidden="true">›</span>
              <span aria-current="page">Partnersuche</span>
            </nav>
            <span className="ae-badge"><FamilyHeartIcon />Partnersuche für Alleinerziehende · {config.countryName}</span>
            <h1>{hub.heroTitle}</h1>
            <p className="ae-lead">{hub.description}</p>
            <ul className="ae-stats">
              <li><strong>{data.totals.cities}</strong> Städte</li>
              <li><strong>{data.totals.regions}</strong> {regionLabel.many}</li>
              <li><strong>{data.totals.chapters}</strong> Kapitel Stadtwissen</li>
            </ul>
            <div className="ae-actions">
              <a className="ae-btn ae-btn-primary" href="#staedte">Deine Stadt finden <span aria-hidden="true">↓</span></a>
              <a className="ae-btn ae-btn-ghost" href={registrationUrl}>Kostenlos registrieren</a>
            </div>
          </div>
          <CountryMap market={market} data={data} />
        </div>
      </section>

      <section id="staedte" className="ae-wrap aeh-cities" aria-labelledby="aeh-cities-title">
        <div className="aeh-panel">
          <div className="ae-head">
            <span className="ae-eyebrow"><PinIcon />{data.totals.cities} Stadtseiten in {config.countryName}</span>
            <h2 id="aeh-cities-title">Finde alleinerziehende Singles in Deiner Stadt</h2>
            <p>Jede Stadtseite zeigt, wer in Deiner Nähe gerade sucht – und was Mütter und Väter vor Ort wissen sollten: Hilfen, Betreuung, Freizeit und Treffpunkte.</p>
          </div>
          <CityFinder market={market} cities={data.cities} regions={data.regions} regionLabel={regionLabel.one} />
          <div className="aeh-fallback">
            <CitySearchFallback market={market} />
          </div>
        </div>
      </section>

      <section className="ae-wrap ae-section" aria-labelledby="aeh-inside-title">
        <div className="ae-head">
          <span className="ae-eyebrow"><FamilyHeartIcon />Familien-Kompass</span>
          <h2 id="aeh-inside-title">Was in den Stadtseiten steckt</h2>
          <p>Mehr als eine Liste mit Profilen: Zu jeder Stadt gibt es Wissen aus dem Alltag Alleinerziehender.</p>
        </div>
        <div className="aeh-inside">
          {INSIDE.map((entry) => (
            <div key={entry.topic} className={`aeh-inside-card aec-t-${entry.topic}`}>
              <span className="aec-idea-icon"><TopicIcon topic={entry.topic} /></span>
              <strong>{TOPIC_LABELS[entry.topic]}</strong>
              <p>{entry.text}</p>
              {data.totals.topicCounts[entry.topic] ? <em>in {data.totals.topicCounts[entry.topic]} von {data.totals.cities} Städten</em> : null}
            </div>
          ))}
        </div>
      </section>

      {data.editorial.html ? (
        <section className="ae-wrap ae-section">
          <article className="aeh-story">
            <div className="aeh-story-copy">
              <span className="ae-eyebrow"><HeartIcon />Regionale Partnersuche in {config.countryName}</span>
              <div className="ae-rich" dangerouslySetInnerHTML={{ __html: data.editorial.html }} />
              <a className="ae-btn ae-btn-primary" href={registrationUrl}>Jetzt kostenlos anmelden</a>
            </div>
            {data.editorial.imageUrl ? (
              <figure className="aeh-polaroid">
                <img src={data.editorial.imageUrl} alt={data.editorial.imageAlt || hub.heroTitle} loading="lazy" decoding="async" />
                <figcaption><FamilyHeartIcon />Liebe mit Kind und Herz</figcaption>
              </figure>
            ) : null}
          </article>
        </section>
      ) : null}
    </main>
  );
}
