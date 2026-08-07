import type { MetadataRoute } from "next";
import { importedCityPages, importedRootPages } from "@/lib/icony-import";
import { publicUrl } from "@/lib/markets";

const ABOUT_PATHS = [
  "/ueber-uns",
  "/ueber-uns/social-media",
  "/ueber-uns/bewertungen",
  "/ueber-uns/kooperationen",
];
const MOVED_ROOT_SLUGS = new Set(["social-media", "bewertungen-und-erfahrungen"]);

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: publicUrl("de"), changeFrequency: "daily", priority: 1 },
    { url: publicUrl("de", "/magazin"), changeFrequency: "daily", priority: 0.9 },
    { url: publicUrl("de", "/partnersuche"), changeFrequency: "weekly", priority: 0.9 },
    ...ABOUT_PATHS.map((path) => ({
      url: publicUrl("de", path),
      changeFrequency: "monthly" as const,
      priority: path === "/ueber-uns" ? 0.7 : 0.6,
    })),
    ...importedCityPages.map((page) => ({
      url: publicUrl("de", page.path),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...importedRootPages
      .filter((page) => !MOVED_ROOT_SLUGS.has(page.slug))
      .map((page) => ({
        url: publicUrl("de", page.path),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
  ];
}
