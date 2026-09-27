"use client";

import { useMemo, useState } from "react";
import { ArrowIcon, PinIcon, SearchIcon } from "@/components/icons";
import { MarketLink } from "@/components/market-link";
import { TOPIC_LABELS } from "@/lib/city-guide";
import type { HubCity } from "@/lib/city-hub";
import type { MarketCode } from "@/lib/markets";
import { TopicIcon } from "./topic-icon";

type Props = { market: MarketCode; cities: HubCity[]; regions: string[]; regionLabel: string };

function normalize(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss");
}

/** Städtesuche mit Regionsfilter. Ohne JavaScript bleiben alle Karten sichtbar. */
export function CityFinder({ market, cities, regions, regionLabel }: Props) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<string | null>(null);
  const visible = useMemo(() => {
    const q = normalize(query.trim());
    return cities.filter((city) => (!region || city.region === region) && (!q || normalize(`${city.name} ${city.region}`).includes(q)));
  }, [cities, query, region]);

  return (
    <div className="aeh-finder">
      <div className="aeh-finder-bar">
        <label className="aeh-search">
          <SearchIcon />
          <span className="ae-sr">Stadt suchen</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Stadt oder Region suchen …" autoComplete="off" />
        </label>
        <div className="aeh-regions" role="group" aria-label={`Nach ${regionLabel} filtern`}>
          <button type="button" aria-pressed={region === null} onClick={() => setRegion(null)}>Alle</button>
          {regions.map((entry) => (
            <button type="button" key={entry} aria-pressed={region === entry} onClick={() => setRegion(region === entry ? null : entry)}>{entry}</button>
          ))}
        </div>
      </div>
      <p className="aeh-count" aria-live="polite">{visible.length === cities.length ? `${cities.length} Städte mit Familien-Kompass` : `${visible.length} von ${cities.length} Städten`}</p>
      <ul className="aeh-grid">
        {visible.map((city, index) => (
          <li key={city.slug} style={{ ["--i" as string]: index }}>
            <MarketLink className="aeh-card" market={market} path={city.path}>
              <span className="aeh-card-media">
                {city.imageUrl ? <img src={city.imageUrl} alt={`Stadtansicht ${city.name}`} loading="lazy" decoding="async" /> : <PinIcon />}
                {city.region && city.region !== city.name ? <span className="aeh-card-region"><PinIcon />{city.region}</span> : null}
              </span>
              <span className="aeh-card-body">
                <small>Alleinerziehende Singles in</small>
                <strong>{city.name}</strong>
                <span className="aeh-card-meta">{city.chapters} Kapitel · ca. {city.minutes} Min. Lesezeit</span>
                {city.topics.length ? (
                  <span className="aeh-card-topics">
                    {city.topics.map((topic) => (
                      <span key={topic} className={`aec-t-${topic}`} title={TOPIC_LABELS[topic]}><TopicIcon topic={topic} /><span className="ae-sr">{TOPIC_LABELS[topic]}</span></span>
                    ))}
                  </span>
                ) : null}
                <span className="aeh-card-go">Zum Familien-Kompass <ArrowIcon /></span>
              </span>
            </MarketLink>
          </li>
        ))}
      </ul>
      {!visible.length ? <p className="aeh-empty">Keine Stadtseite gefunden – probier die individuelle Suche direkt darunter.</p> : null}
    </div>
  );
}
