import type { MetadataRoute } from "next";
import { getSitemapData } from "@/lib/server-api";
import { SITE_URL } from "@/lib/utils";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/catalog`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/shipping`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.1 },
  ];
  try {
    const d = await getSitemapData();
    return [
      ...staticPages,
      ...d.collections.map((c) => ({ url: `${SITE_URL}/collections/${c.slug}`, lastModified: new Date(c.updatedAt), changeFrequency: "daily" as const, priority: 0.8 })),
      ...d.categories.map((c) => ({ url: `${SITE_URL}/category/${c.slug}`, lastModified: new Date(c.updatedAt), changeFrequency: "daily" as const, priority: 0.8 })),
      ...d.products.map((p) => ({
        url: `${SITE_URL}/product/${p.slug}`,
        lastModified: new Date(p.updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.7,
        images: p.image ? [p.image] : undefined,
      })),
    ];
  } catch {
    return staticPages;
  }
}
