import type { NextRequest } from "next/server.js";
import { NextResponse } from "next/server.js";
import { publicUrl, resolveMarketRequest, withTrailingSlash, type MarketCode } from "#markets";

const INTERNAL_REWRITE_TOKEN = globalThis.crypto.randomUUID();
const INTERNAL_PATH_PATTERN = /^\/market-(?:home|placeholder|partnersuche|robots|sitemap|magazin|faq|ueber-uns)(?:\/|$)/;
const NO_SLASH_PREFIXES = ["/_next/", "/app-assets/", "/brand/", "/api/", "/.well-known/"];
const MARKET_HOSTS = new Set([
  "alleinerziehende-singles.de",
  "alleinerziehende-singles.at",
  "alleinerziehende-singles.ch",
]);

function normalizeHostname(value: string | null) {
  return value?.split(",")[0]?.trim().toLowerCase().replace(/:\d+$/, "").replace(/^www\./, "") ?? "";
}

export function requestHostname(request: NextRequest) {
  const directHost = normalizeHostname(request.headers.get("host"));
  const forwardedHost = normalizeHostname(request.headers.get("x-forwarded-host"));

  if (MARKET_HOSTS.has(directHost)) return directHost;
  if (MARKET_HOSTS.has(forwardedHost)) return forwardedHost;
  return directHost || forwardedHost || request.nextUrl.hostname;
}

function platformHandoffResponse(url: string) {
  const escapedUrl = url.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const body = `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta http-equiv="refresh" content="0;url=${escapedUrl}"><title>Weiterleitung</title></head><body><p>Weiter zur bestehenden Plattform: <a href="${escapedUrl}">${escapedUrl}</a></p><script>location.replace(${JSON.stringify(url)})</script></body></html>`;
  return new NextResponse(body, {
    status: 200,
    headers: {
      "cache-control": "no-store",
      "content-type": "text/html; charset=utf-8",
    },
  });
}

// WordPress-kompatibler REST-Endpunkt des Magazins (app/magazin/wp-json): JSON ohne Slash-Umleitung und ohne
// Marktlogik. ICONY ruft /magazin/wp-json/wp/v2/posts, ?rest_route= und index.php?rest_route= auf; nginx stellt dem
// Pfad je Domain /de, /at oder /ch voran (Host *.vercel.app). Für .at/.ch hängt der Rewrite aes_market an: Der
// Länderknoten liefert statt der .de-Beiträge die größten Städteseiten des Landes (lib/wp-market-teasers.ts).
// Als Query-Parameter statt Header, damit der CDN-Cache die Länder getrennt hält.
const WP_REST_PATH = /^\/(?:(de|at|ch)\/)?magazin\/wp-json(?:\/|$)/;
const WP_REST_ENTRY = /^\/(?:(de|at|ch)\/)?magazin(?:\/index\.php)?\/?$/;

function wpRestResponse(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const restRoute = searchParams.get("rest_route");
  const entry = restRoute !== null ? pathname.match(WP_REST_ENTRY) : null;
  const path = entry ? null : pathname.match(WP_REST_PATH);
  if (!entry && !path) return null;

  const prefix = (entry ?? path)![1];
  // Direkt auf der Landesdomain (ohne nginx-Präfix) gilt deren Markt.
  const hostname = requestHostname(request);
  const hostMarket = MARKET_HOSTS.has(hostname) ? hostname.split(".").pop() : undefined;
  const market = prefix ?? hostMarket;
  const destination = request.nextUrl.clone();
  destination.searchParams.delete("aes_market");
  if (entry && restRoute !== null) {
    destination.searchParams.delete("rest_route");
    destination.pathname = `/magazin/wp-json/${restRoute.replace(/^\/+/, "")}`;
  } else if (prefix) {
    destination.pathname = pathname.slice(prefix.length + 1);
  } else if (market !== "at" && market !== "ch" && !searchParams.has("aes_market")) {
    return NextResponse.next();
  }
  // Vercel behält beim Rewrite die ursprünglichen Query-Parameter: einen von außen gesetzten Wert überschreiben.
  if (market === "at" || market === "ch") destination.searchParams.set("aes_market", market);
  else if (searchParams.has("aes_market")) destination.searchParams.set("aes_market", "de");
  // Vercel verwirft bei Rewrites Parameter ohne Wert; ICONY ruft "?_embed" ohne Wert auf (WordPress-Schreibweise).
  // Ohne diese Angleichung fehlten hinter nginx (Upstream-Pfad /de/…) die eingebetteten Beitragsbilder.
  if (destination.searchParams.has("_embed") && destination.searchParams.get("_embed") === "") {
    destination.searchParams.set("_embed", "1");
  }
  return NextResponse.rewrite(destination);
}

function withoutTrailingSlash(pathname: string | null) {
  return pathname && pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

// Ersetzt die eingebaute Slash-Umleitung von Next.js (skipTrailingSlashRedirect): Seitenpfade enden
// immer auf "/". Next.js kennt nur den Upstream-Pfad: nginx ruft für alleinerziehende-singles.at/partnersuche
// hier /at/partnersuche auf, Besucher landeten sonst auf alleinerziehende-singles.at/at/partnersuche/.
// Pfade mit Marktpräfix gehen darum absolut auf die öffentliche Landes-URL, alles andere relativ.
function trailingSlashRedirect(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (
    pathname.endsWith("/")
    || withTrailingSlash(pathname) === pathname
    || NO_SLASH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
    || INTERNAL_PATH_PATTERN.test(pathname)
  ) {
    return null;
  }

  const target = withTrailingSlash(pathname);
  const marketMatch = target.match(/^\/(de|at|ch)(\/.*)$/);
  if (marketMatch) {
    // Auf einer Landesdomain gilt deren Markt (der Router streift dort jedes Präfix ab).
    const hostname = requestHostname(request);
    const market = MARKET_HOSTS.has(hostname) ? hostname.split(".").pop() as MarketCode : marketMatch[1] as MarketCode;
    return NextResponse.redirect(`${publicUrl(market, marketMatch[2])}${search}`, 308);
  }

  // Plain URL statt nextUrl.clone(): NextURL normalisiert den Schrägstrich sonst selbst.
  const destination = new URL(request.nextUrl.href);
  destination.pathname = target;
  return NextResponse.redirect(destination, 308);
}

export function proxy(request: NextRequest) {
  const rewriteDestination = request.headers.get("x-aes-rewrite-destination");
  const rewriteToken = request.headers.get("x-aes-rewrite-token");

  if (
    rewriteToken === INTERNAL_REWRITE_TOKEN &&
    withoutTrailingSlash(rewriteDestination) === withoutTrailingSlash(request.nextUrl.pathname)
  ) {
    return NextResponse.next();
  }

  // .de: Magazinbeiträge; .at/.ch: Länderknoten mit den größten Städteseiten (kein eigenes Magazin).
  const wpRest = wpRestResponse(request);
  if (wpRest) return wpRest;

  // Magazin-Sitemap (ICONYs sitemap.php verweist auf /magazin/sitemap.xml). nginx ruft Vercel mit /de/… auf.
  // /at/… und /ch/… sowie die .at/.ch-Domain selbst laufen weiter zur Marktlogik (Länder-Sitemap).
  const hostname = requestHostname(request);
  const regionalHost = MARKET_HOSTS.has(hostname) && !hostname.endsWith(".de");
  if (!regionalHost && /^\/(?:de\/)?magazin\/sitemap\.xml$/.test(request.nextUrl.pathname)) {
    if (!request.nextUrl.pathname.startsWith("/de/")) return NextResponse.next();
    const destination = request.nextUrl.clone();
    destination.pathname = "/magazin/sitemap.xml";
    return NextResponse.rewrite(destination);
  }

  // Erst nach der Prüfung auf interne Rewrites: deren Ziele (/market-home/at) haben keinen Schrägstrich.
  const slashRedirect = trailingSlashRedirect(request);
  if (slashRedirect) return slashRedirect;

  const resolution = resolveMarketRequest(request.nextUrl.pathname, requestHostname(request));

  if (resolution.action === "pass") return NextResponse.next();
  if (resolution.action === "not-found") return new NextResponse("Not found", { status: 404 });
  if (resolution.action === "redirect-platform") {
    return platformHandoffResponse(resolution.url);
  }

  const destination = request.nextUrl.clone();
  destination.pathname = resolution.pathname;

  if (resolution.action === "placeholder") {
    destination.searchParams.set("requestedPath", resolution.requestedPath);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-aes-rewrite-destination", destination.pathname);
  requestHeaders.set("x-aes-rewrite-token", INTERNAL_REWRITE_TOKEN);

  return NextResponse.rewrite(destination, {
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icon.png|apple-icon.png|app-assets/|brand/).*)"],
};
