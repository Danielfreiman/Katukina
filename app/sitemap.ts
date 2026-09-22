import type { MetadataRoute } from "next";
import { siteUrl, products } from "@/lib/content";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    ...products.map((p) => ({
      url: `${siteUrl}/products/${p.id}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
