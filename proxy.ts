import type { NextRequest } from "next/server.js";
import { NextResponse } from "next/server.js";
import { resolveMarketRequest } from "#markets";

const INTERNAL_REWRITE_TOKEN = globalThis.crypto.randomUUID();
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

export function proxy(request: NextRequest) {
  const rewriteDestination = request.headers.get("x-aes-rewrite-destination");
  const rewriteToken = request.headers.get("x-aes-rewrite-token");

  if (
    rewriteToken === INTERNAL_REWRITE_TOKEN &&
    rewriteDestination === request.nextUrl.pathname
  ) {
    return NextResponse.next();
  }

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
  matcher: ["/((?!_next/static|_next/image|app-assets/|brand/).*)"],
};
