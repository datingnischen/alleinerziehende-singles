import { CountryMap } from "@/components/city/country-map";
import {
  ArrowIcon,
  CameraIcon,
  ChatIcon,
  CheckIcon,
  EyeIcon,
  FamilyHeartIcon,
  HeartIcon,
  PinIcon,
  ShieldIcon,
  SparkIcon,
  StarIcon,
  TagIcon,
  UsersIcon,
  VideoIcon,
} from "@/components/icons";
import { MarketLink } from "@/components/market-link";
import { getCityHubData } from "@/lib/city-hub";
import { getMarket, publicUrl, type MarketCode } from "@/lib/markets";
import { registrationUrlForContext } from "@/lib/registration-links";
import { getHomeContent, platformFeatures } from "@/lib/startseite";
import { staticAsset } from "@/lib/static-asset";
import { type MagazineEntry } from "@/lib/wordpress";
import { PostCard } from "@/components/magazine/post-card";
import "@/components/city/city.css";
import "@/components/city/hub.css";
import "@/components/magazine/magazine.css";
import "./home.css";

const LEAD: Record<MarketCode, string> = {
  de: "Kita-Abholung, Job, Wäscheberge – und trotzdem Lust auf Liebe? Hier lernst Du Mütter und Väter kennen, denen Du Deinen Alltag nicht erst erklären musst.",
  at: "Hier lernst Du Mütter und Väter aus Österreich kennen, die wissen, wie sich Familienalltag anfühlt – und die trotzdem wieder Lust auf Nähe haben.",
  ch: "Hier lernst Du Mütter und Väter aus der Schweiz kennen, die wissen, wie sich Familienalltag anfühlt – und die trotzdem wieder Lust auf Nähe haben.",
};

const FLIRT_ICONS = { fragen: ChatIcon, foto: CameraIcon, video: VideoIcon, stories: StarIcon } as const;
const TRUST_ICONS = { security: ShieldIcon, control: EyeIcon, basis: TagIcon } as const;

export function HomePage({ market, posts = [] }: { market: MarketCode; posts?: MagazineEntry[] }) {
  const config = getMarket(market);
  const content = getHomeContent(market);
  const hub = getCityHubData(market);
  const registrationUrl = registrationUrlForContext(market, "location");
  const features = platformFeatures(config.domain);
  const topCities = hub.cities.slice(0, 6);
  const [intro, ...sections] = content.sections[0]?.title ? [null, ...content.sections] : content.sections;

  return (
    <main className="aec aem">
      <section className="ae-hero ae-hero-shade aem-hero">
        <img className="ae-hero-img" src={staticAsset(config.heroPath)} alt="" fetchPriority="high" decoding="async" />
        <div className="ae-wrap aem-hero-grid">
          <div>
            <span className="ae-badge"><FamilyHeartIcon />Die Singlebörse für Mütter und Väter in {config.countryName}</span>
            <h1>{content.h1}</h1>
            <p className="ae-lead">{LEAD[market]}</p>
            <div className="ae-actions">
              <a className="ae-btn ae-btn-primary" href={registrationUrl}>Kostenlos registrieren</a>
              <a className="ae-btn ae-btn-ghost" href="#staedte">Singles in Deiner Nähe <span aria-hidden="true">↓</span></a>
            </div>
            <ul className="aem-proof">
              <li><CheckIcon />Über 20 Jahre Erfahrung</li>
              <li><CheckIcon />Server in Deutschland</li>
              <li><CheckIcon />Keine versteckten Kosten</li>
            </ul>
          </div>

          <aside className="aem-steps" aria-label="So funktioniert die Anmeldung">
            <span className="aem-steps-kicker">So einfach geht&apos;s</span>
            <strong>In drei Schritten zum ersten Kennenlernen</strong>
            <ol>
              <li><span>1</span><div><b>Kostenlos registrieren</b><small>Profil in Ruhe anlegen – die Basis-Mitgliedschaft kostet nichts.</small></div></li>
              <li><span>2</span><div><b>Zeigen, was Euch ausmacht</b><small>Fragenflirt und Fotoflirt helfen, ins Gespräch zu kommen.</small></div></li>
              <li><span>3</span><div><b>Mütter &amp; Väter treffen</b><small>Schreib Menschen aus Deiner Region, die Deinen Alltag kennen.</small></div></li>
            </ol>
            <a className="ae-btn ae-btn-primary" href={registrationUrl}>Jetzt kostenlos starten</a>
          </aside>
        </div>
      </section>

      <div className="ae-wrap">
        <ul className="ae-facts">
          <li><EyeIcon /><span><small>Profile</small><strong>redaktionell geprüft</strong></span></li>
          <li><TagIcon /><span><small>Basis-Mitgliedschaft</small><strong>kostenlos</strong></span></li>
          <li><PinIcon /><span><small>Stadtseiten</small><strong>{hub.totals.cities} Städte in {config.countryName}</strong></span></li>
          <li><UsersIcon /><span><small>Community</small><strong>in DE, AT und CH</strong></span></li>
        </ul>
      </div>

      <section id="staedte" className="ae-wrap ae-section aem-near">
        <div className="aem-near-copy">
          <div className="ae-head">
            <span className="ae-eyebrow"><PinIcon />Alleinerziehende Singles vor Ort</span>
            <h2>Liebe beginnt oft ganz in der Nähe</h2>
            <p>Für {hub.totals.cities} Städte in {hub.totals.regions} {market === "ch" ? "Kantonen" : "Bundesländern"} zeigen wir, wer vor Ort gerade sucht – dazu Tipps zu Freizeit mit Kind, Betreuung und Anlaufstellen.</p>
          </div>
          <ul className="aem-tiles">
            {topCities.map((city) => (
              <li key={city.slug}>
                <MarketLink className="aem-tile" market={market} path={city.path}>
                  {city.imageUrl ? <img src={city.imageUrl} alt="" loading="lazy" decoding="async" /> : null}
                  <span>{city.name}</span>
                </MarketLink>
              </li>
            ))}
          </ul>
          <MarketLink className="ae-btn ae-btn-green" market={market} path="/partnersuche/">Alle {hub.totals.cities} Städte ansehen <ArrowIcon /></MarketLink>
        </div>
        <CountryMap market={market} data={hub} className="aem-map" />
      </section>

      <section className="ae-wrap ae-section" aria-labelledby="aem-flirt-title">
        <div className="ae-head ae-head-center">
          <span className="ae-eyebrow"><SparkIcon />Kennenlernen mit System</span>
          <h2 id="aem-flirt-title">So kommt Ihr ins Gespräch – auch wenn der Kalender voll ist</h2>
          <p>Kleine Anstöße für große Gefühle: Mit diesen Funktionen findest Du heraus, ob es passt, bevor Ihr den Babysitter bucht.</p>
        </div>
        <div className="aem-flirt">
          {features.flirt.map((entry, index) => {
            const Icon = FLIRT_ICONS[entry.key as keyof typeof FLIRT_ICONS];
            return (
              <a key={entry.key} className={`aem-flirt-card aem-flirt-${entry.key}`} href={publicUrl(market, entry.path)} style={{ ["--tilt" as string]: `${index % 2 ? 1 : -1}deg` }}>
                <span className="aem-flirt-icon"><Icon /></span>
                <strong>{entry.title}</strong>
                <span>{entry.text}</span>
                <em>{entry.cta} <ArrowIcon /></em>
              </a>
            );
          })}
        </div>
      </section>

      <section className="ae-section aem-trust" aria-labelledby="aem-trust-title">
        <div className="ae-wrap">
          <div className="ae-head">
            <span className="ae-eyebrow"><ShieldIcon />Sicher kennenlernen</span>
            <h2 id="aem-trust-title">Vertrauen ist bei uns kein Kleingedrucktes</h2>
          </div>
          <div className="aem-trust-grid">
            {features.trust.map((entry) => {
              const Icon = TRUST_ICONS[entry.key as keyof typeof TRUST_ICONS];
              return (
                <a key={entry.key} className="aem-trust-card" href={publicUrl(market, entry.path)}>
                  <Icon />
                  <strong>{entry.title}</strong>
                  <span>{entry.text}</span>
                  <em>Weiterlesen <ArrowIcon /></em>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {posts.length ? (
        <section className="ae-wrap ae-section" aria-labelledby="aem-mag-title">
          <div className="aem-mag-head">
            <div className="ae-head">
              <span className="ae-eyebrow"><HeartIcon />Magazin</span>
              <h2 id="aem-mag-title">Neu im Magazin</h2>
              <p>Frische Tipps, ehrliche Geschichten und hilfreiche Impulse für deinen Alltag als alleinerziehender Single.</p>
            </div>
            <MarketLink className="ae-btn ae-btn-outline" market={market} path="/magazin/">Alle Magazin-Artikel <ArrowIcon /></MarketLink>
          </div>
          <div className="aemag-grid">
            {posts.map((post) => <PostCard key={post.id} post={post} />)}
          </div>
        </section>
      ) : null}

      <section className="ae-wrap ae-section aem-story" aria-labelledby="aem-story-title">
        <div className="ae-head">
          <span className="ae-eyebrow"><FamilyHeartIcon />Partnersuche mit Kind</span>
          <h2 id="aem-story-title">{market === "de" ? "Singlebörse für Alleinerziehende: Liebe mit Anhang" : `Partnersuche mit Kind ${market === "ch" ? "in der Schweiz" : "in Österreich"}`}</h2>
        </div>
        {intro ? <div className="aem-story-intro ae-rich" dangerouslySetInnerHTML={{ __html: intro.html }} /> : null}
        <div className={`aem-story-list ${sections.some((section) => section?.imageUrl) ? "aem-story-images" : "aem-story-cards"}`}>
          {sections.map((section, index) => section ? (
            <article key={section.title} className="aem-story-item">
              {section.imageUrl ? (
                <figure style={{ ["--tilt" as string]: `${index % 2 ? 2 : -2}deg` }}>
                  <img src={section.imageUrl} alt={section.imageAlt} loading="lazy" decoding="async" />
                </figure>
              ) : null}
              <div>
                <span className="aem-story-no" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <h3>{section.title}</h3>
                <div className="ae-rich" dangerouslySetInnerHTML={{ __html: section.html }} />
              </div>
            </article>
          ) : null)}
        </div>
      </section>

      <section className="ae-wrap ae-section">
        <div className="ae-band">
          <div>
            <span className="ae-eyebrow"><HeartIcon />Triff heute noch Singles aus Deiner Region</span>
            <h2>Deine Familie ist komplett. Dein Herz ist noch frei?</h2>
            <p>Anmelden, Profil anlegen, Umkreis wählen – und schauen, wer in Deiner Nähe ebenfalls Familie und Liebe unter einen Hut bringen möchte.</p>
          </div>
          <div className="ae-band-actions">
            <a className="ae-btn ae-btn-primary" href={registrationUrl}>Kostenlos registrieren</a>
            <MarketLink className="ae-btn ae-btn-ghost" market={market} path="/partnersuche/">Städte entdecken</MarketLink>
          </div>
        </div>
      </section>
    </main>
  );
}
