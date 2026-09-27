import { MarketLink } from "@/components/market-link";
import type { CityHubData } from "@/lib/city-hub";
import { getMarket, type MarketCode } from "@/lib/markets";

/** Landesumriss mit allen Stadtseiten als Herz-Pins; jeder Pin verlinkt die Stadtseite. */
export function CountryMap({ market, data, caption = "Stadt antippen und direkt loslegen", className = "" }: { market: MarketCode; data: CityHubData; caption?: string; className?: string }) {
  const config = getMarket(market);
  return (
    <figure className={`aeh-map aeh-map-${market} ${className}`}>
      <svg viewBox={`-20 -20 ${data.map.width + 40} ${data.map.height + 40}`} role="img" aria-label={`Karte: Stadtseiten für Alleinerziehende in ${config.countryName}`}>
        <defs>
          <symbol id={`aeh-heart-${market}`} viewBox="0 0 24 24">
            <path d="M12 21.2s-8.6-5.2-8.6-11.6A4.9 4.9 0 0 1 12 6.4a4.9 4.9 0 0 1 8.6 3.2c0 6.4-8.6 11.6-8.6 11.6Z" />
          </symbol>
          <pattern id={`aeh-dots-${market}`} width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="9" cy="9" r="1.7" className="aeh-map-dot" />
          </pattern>
        </defs>
        <path className="aeh-map-land" d={data.map.path} />
        <path d={data.map.path} fill={`url(#aeh-dots-${market})`} />
        {data.cities.map((city, index) => (
          <MarketLink key={city.slug} className="aeh-pin" market={market} path={city.path}>
            <title>{`Alleinerziehende Singles in ${city.name}`}</title>
            <circle className="aeh-pin-pulse" cx={city.x} cy={city.y} r="18" style={{ animationDelay: `${(index % 7) * 0.4}s` }} />
            <circle className="aeh-pin-dot" cx={city.x} cy={city.y} r="20" />
            <use href={`#aeh-heart-${market}`} x={city.x - 12} y={city.y - 12} width="24" height="24" className="aeh-pin-heart" />
            {city.label ? <text x={city.label.x} y={city.label.y} textAnchor={city.label.anchor}>{city.name}</text> : null}
          </MarketLink>
        ))}
      </svg>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
