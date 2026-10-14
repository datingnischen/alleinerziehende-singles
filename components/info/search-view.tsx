import { ArrowIcon, BookIcon, PinIcon, QuestionIcon, SearchIcon } from "@/components/icons";
import { MarketLink } from "@/components/market-link";
import { AboutSubnav } from "@/components/info/about-views";
import { AboutSearchForm } from "@/components/about-search-form";
import { getMarket, type MarketCode } from "@/lib/markets";
import { buildSearchDocuments } from "@/lib/search-index";
import { MAX_SEARCH_RESULTS, searchDocuments, shortExcerpt } from "@/lib/site-search";
import "@/components/info/info.css";

/** Treffer-Link: absolute Adressen (Artikel auf .de) als <a>, eigene Pfade als Marktlink. */
function ResultLink({ market, href, children }: { market: MarketCode; href: string; children: React.ReactNode }) {
  if (/^https?:\/\//.test(href)) return <a className="aes-result" href={href}>{children}</a>;
  return <MarketLink className="aes-result" market={market} path={href}>{children}</MarketLink>;
}

/** Seitensuche unter /ueber-uns/suche/ – pro Markt über dessen Magazin, Städte, Partnersuche-Hub, FAQ und Über uns. */
export function SearchView({ market, query }: { market: MarketCode; query: string }) {
  const results = query ? searchDocuments(buildSearchDocuments(market), query, MAX_SEARCH_RESULTS) : [];
  const exampleCity = market === "de" ? "Hamburg" : market === "at" ? "Graz" : "Bern";
  const exampleTopic = market === "de" ? "Kindergeld" : "Unterhalt";

  return (
    <main className="aei aea">
      <section className="aei-hero">
        <div className="ae-wrap aei-hero-grid aei-hero-solo">
          <div>
            <nav className="aei-crumbs" aria-label="Brotkrumen">
              <MarketLink market={market} path="/">Start</MarketLink>
              <span aria-hidden="true">›</span>
              <MarketLink market={market} path="/ueber-uns/">Über uns</MarketLink>
              <span aria-hidden="true">›</span>
              <span aria-current="page">Suche</span>
            </nav>
            <span className="ae-eyebrow"><SearchIcon />Seitensuche</span>
            <h1>{query ? `Suchergebnisse für „${query}“` : "Was suchst Du?"}</h1>
            <p className="aei-lead">
              Durchsuche unser Magazin, die Städteseiten zur Partnersuche {market === "de" ? "" : `in ${market === "ch" ? "der Schweiz" : getMarket(market).countryName} `}und die häufigen Fragen.
            </p>
            <div className="aea-search">
              <AboutSearchForm market={market} defaultValue={query} autoFocus={!query} />
            </div>
          </div>
        </div>
      </section>

      <AboutSubnav market={market} current="/ueber-uns/suche/" />

      {query ? (
        <section className="ae-wrap ae-section aes-results" aria-live="polite">
          {results.length > 0 ? (
            <>
              <p className="aes-count">
                {results.length === 1 ? "1 Treffer" : `${results.length} Treffer`}
                {results.length >= MAX_SEARCH_RESULTS ? " – die besten Ergebnisse zuerst" : ""}
              </p>
              <ol>
                {results.map((result) => (
                  <li key={result.href}>
                    <ResultLink market={market} href={result.href}>
                      <span className={`aes-area aes-area-${result.area === "Magazin" ? "mag" : result.area === "Stadt" ? "city" : "info"}`}>
                        {result.area === "Magazin" ? <BookIcon /> : result.area === "Stadt" ? <PinIcon /> : <QuestionIcon />}
                        {result.area}
                      </span>
                      <strong>{result.title}</strong>
                      {result.excerpt ? <span>{shortExcerpt(result.excerpt)}</span> : null}
                      <em>Öffnen <ArrowIcon /></em>
                    </ResultLink>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <div className="aes-empty">
              <h2>Dazu haben wir leider nichts gefunden</h2>
              <p>
                Probier es mit einem anderen oder kürzeren Suchbegriff, zum Beispiel einer Stadt oder
                einem Thema wie „{exampleTopic}“. Oder stöbere direkt im Magazin und in der Partnersuche.
              </p>
            </div>
          )}
        </section>
      ) : (
        <section className="ae-wrap ae-section">
          <div className="aes-empty">
            <h2>Tipp</h2>
            <p>
              Gib eine Stadt, ein Thema oder eine Frage ein – etwa „{exampleCity}“, „Unterhalt“ oder
              „Schwangerschaftswoche“. Umlaute kannst Du auch als ae, oe oder ue schreiben.
            </p>
          </div>
        </section>
      )}

      <section className="ae-wrap ae-section" aria-labelledby="aes-browse">
        <div className="ae-head">
          <h2 id="aes-browse">Lieber direkt stöbern?</h2>
        </div>
        <div className="aei-tiles">
          <MarketLink className="aei-tile" market={market} path="/magazin/"><BookIcon /><strong>Magazin</strong><span>Tipps und Geschichten für den Alltag als alleinerziehender Single.</span><em>Zum Magazin <ArrowIcon /></em></MarketLink>
          <MarketLink className="aei-tile" market={market} path="/partnersuche/"><PinIcon /><strong>Singles nach Stadt</strong><span>Stadtseiten mit Profilvorschau und Tipps für Alleinerziehende.</span><em>Städte ansehen <ArrowIcon /></em></MarketLink>
          <MarketLink className="aei-tile" market={market} path="/faq/"><QuestionIcon /><strong>Häufige Fragen</strong><span>Kosten, Sicherheit, Profil und Ablauf auf einen Blick.</span><em>Zur FAQ <ArrowIcon /></em></MarketLink>
        </div>
      </section>
    </main>
  );
}
