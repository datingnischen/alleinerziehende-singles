export type IconyWidgetConfig = {
  slug: string;
  city: string;
  zip: string;
  country: number;
  platformId: string;
};

export const iconyWidgetConfigs: IconyWidgetConfig[] = [
  { slug: "berlin", city: "Berlin", zip: "14199", country: 49, platformId: "alleinerziehende" },
  { slug: "hamburg", city: "Hamburg", zip: "20038", country: 49, platformId: "alleinerziehende" },
  { slug: "stuttgart", city: "Stuttgart", zip: "70173", country: 49, platformId: "alleinerziehende" },
  { slug: "frankfurt-am-main", city: "Frankfurt am Main", zip: "60308", country: 49, platformId: "alleinerziehende" },
  { slug: "duesseldorf", city: "Düsseldorf", zip: "40210", country: 49, platformId: "alleinerziehende" },
  { slug: "muenchen", city: "München", zip: "80333", country: 49, platformId: "alleinerziehende" },
  { slug: "koeln", city: "Köln", zip: "50667", country: 49, platformId: "alleinerziehende" },
  { slug: "dortmund", city: "Dortmund", zip: "44135", country: 49, platformId: "alleinerziehende" },
  { slug: "nuernberg", city: "Nürnberg", zip: "90402", country: 49, platformId: "alleinerziehende" },
  { slug: "bochum", city: "Bochum", zip: "44787", country: 49, platformId: "alleinerziehende" },
  { slug: "hannover", city: "Hannover", zip: "30159", country: 49, platformId: "alleinerziehende" },
  { slug: "essen", city: "Essen", zip: "45127", country: 49, platformId: "alleinerziehende" },
  { slug: "bremen", city: "Bremen", zip: "28195", country: 49, platformId: "alleinerziehende" },
  { slug: "dresden", city: "Dresden", zip: "01067", country: 49, platformId: "alleinerziehende" },
  { slug: "leipzig", city: "Leipzig", zip: "04157", country: 49, platformId: "alleinerziehende" },
];

export function getIconyWidgetConfig(slug: string) {
  return iconyWidgetConfigs.find((config) => config.slug === slug) ?? null;
}
