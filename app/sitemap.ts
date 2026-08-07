import type { MetadataRoute } from "next";
import { importedCityPages, importedRootPages } from "@/lib/icony-import";
import { publicUrl } from "@/lib/markets";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: publicUrl("de"), changeFrequency: "daily", priority: 1 },
    { url: publicUrl("de", "/magazin"), changeFrequency: "daily", priority: 0.9 },
    { url: publicUrl("de", "/partnersuche"), changeFrequency: "weekly", priority: 0.9 },
    ...importedCityPages.map((page) => ({
      url: publicUrl("de", page.path),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...importedRootPages.map((page) => ({
      url: publicUrl("de", page.path),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
