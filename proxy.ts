import type { NextRequest } from "next/server.js";
import { NextResponse } from "next/server.js";
import { publicUrl, resolveMarketRequest, withTrailingSlash, type MarketCode } from "#markets";

const INTERNAL_REWRITE_TOKEN = globalThis.crypto.randomUUID();
const INTERNAL_PATH_PATTERN = /^\/market-(?:home|placeholder|partnersuche|robots|sitemap)(?:\/|$)/;
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
