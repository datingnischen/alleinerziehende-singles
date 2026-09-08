// City-centre postcodes verified against OpenPLZ locality records on 2026-09-08.
// Keep these independent from ICONY widget z values, which may target an outer
// district or a broad locality rather than the city centre.
export const centralCityPostcodes = Object.freeze({
  de: Object.freeze({
    berlin: "10117", hamburg: "20095", stuttgart: "70173", "frankfurt-am-main": "60311",
    duesseldorf: "40213", muenchen: "80331", koeln: "50667", dortmund: "44135",
    nuernberg: "90402", bochum: "44787", hannover: "30159", essen: "45127",
    bremen: "28195", dresden: "01067", leipzig: "04109",
  }),
  at: Object.freeze({
    wien: "1010", graz: "8010", salzburg: "5020", innsbruck: "6020", dornbirn: "6850",
    klagenfurt: "9020", linz: "4020", bregenz: "6900", villach: "9500", wels: "4600",
    "st-poelten": "3100", amstetten: "3300", leoben: "8700", steyr: "4400", eisenstadt: "7000",
  }),
  ch: Object.freeze({
    bern: "3011", basel: "4001", fribourg: "1700", thun: "3600", luzern: "6003",
    genf: "1204", stgallen: "9000", biel: "2502", chur: "7000", aarau: "5000",
    lausanne: "1003", winterthur: "8400", zug: "6300", zuerich: "8001", schaffhausen: "8200",
  }),
});

/** @param {"de" | "at" | "ch"} market @param {string} slug */
export function getCentralCityPostcode(market, slug) {
  const postcode = centralCityPostcodes[market]?.[slug];
  if (!postcode) throw new Error(`Missing central postcode for ${market}/${slug}`);
  const pattern = market === "de" ? /^\d{5}$/ : /^\d{4}$/;
  if (!pattern.test(postcode)) throw new Error(`Invalid central postcode for ${market}/${slug}: ${postcode}`);
  return postcode;
}

/** @param {"de" | "at" | "ch"} market @param {string} slug */
export function buildCitySearchUrl(market, slug) {
  const postcode = getCentralCityPostcode(market, slug);
  return `https://alleinerziehende-singles.${market}/suche/?plz=${postcode}&AID=location`;
}
