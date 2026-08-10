import { getMarket, publicUrl, type MarketCode } from "#markets";

export type RegistrationContext = "default" | "magazin" | "location";

export function registrationUrlForContext(
  market: MarketCode,
  context: RegistrationContext = "default",
): string {
  switch (context) {
    case "magazin":
      return publicUrl(market, "/registration/?AID=magazin");
    case "location":
      return publicUrl(market, "/registration/?AID=location");
    default:
      return publicUrl(market, "/registration/");
  }
}

export function footerRegistrationLabel(
  market: MarketCode,
  context: RegistrationContext = "default",
): string {
  const domain = getMarket(market).domain;

  switch (context) {
    case "magazin":
      return `Jetzt kostenlos bei ${domain} registrieren`;
    case "location":
      return `Jetzt Singles in deiner Region auf ${domain} kennenlernen`;
    default:
      return `Jetzt kostenlos auf ${domain} registrieren`;
  }
}
