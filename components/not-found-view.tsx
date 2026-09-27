import { ArrowIcon, CompassIcon, PinIcon } from "@/components/icons";
import { MarketLink } from "@/components/market-link";
import { getCityPages } from "@/lib/city-pages";
import { type MarketCode } from "@/lib/markets";
import { registrationUrlForContext } from "@/lib/registration-links";
import "@/components/city/city.css";

/** Freundliche Fehlerseite: Seite fehlt, aber Städte, Start und Registrierung sind einen Klick entfernt. */
export function NotFoundView({ market, requestedPath }: { market: MarketCode; requestedPath?: string }) {
  const cities = getCityPages(market).slice(0, 8);

  return (
    <main className="aec">
      <section className="ae-hero">
        <div className="ae-wrap aenf">
          <span className="ae-badge"><CompassIcon />Hier geht&apos;s nicht weiter</span>
          <h1>Diese Seite gibt es leider nicht (mehr).</h1>
          <p className="ae-lead">
            {requestedPath ? <>Unter <strong>{requestedPath}</strong> haben wir nichts gefunden. </> : null}
            Vielleicht hilft Dir einer dieser Wege weiter – oder Du schaust direkt, wer in Deiner Nähe sucht.
          </p>
          <div className="ae-actions">
            <MarketLink className="ae-btn ae-btn-primary" market={market} path="/">Zur Startseite</MarketLink>
            <MarketLink className="ae-btn ae-btn-ghost" market={market} path="/partnersuche/">Alle Städte ansehen</MarketLink>
          </div>
        </div>
      </section>
      <section className="ae-wrap aec-related aenf-cities" aria-labelledby="aenf-title">
        <h2 id="aenf-title">Beliebte Stadtseiten</h2>
        <ul>
          {cities.map((city) => (
            <li key={city.slug}><MarketLink market={market} path={city.path}><PinIcon />{city.name}</MarketLink></li>
          ))}
          <li><a className="aec-related-all" href={registrationUrlForContext(market, "location")}>Kostenlos registrieren <ArrowIcon /></a></li>
        </ul>
      </section>
    </main>
  );
}
