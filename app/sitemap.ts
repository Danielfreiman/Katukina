import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config/site";
import { getCategories, getProducts } from "@/lib/commerce/catalog";
import { wordpressGet } from "@/lib/wordpress/client";
import type { Editorial } from "@/lib/wordpress/content";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    "",
    "/shop",
    "/collections",
    "/about",
    "/journal",
    "/cookies",
    "/privacy",
  ].map((path) => ({ url: `${siteUrl}${path}`, changeFrequency: "weekly" }));
  const categories = await getCategories();
  categories.forEach((category) =>
    entries.push({ url: `${siteUrl}/collections/${category.slug}` }),
  );
  for (let page = 1; ; page++) {
    const result = await getProducts({ per_page: 100, page });
    result.data.forEach((product) =>
      entries.push({ url: `${siteUrl}/products/${product.slug}` }),
    );
    if (page >= result.pages) break;
  }
  for (const type of ["posts", "pages"] as const) {
    for (let page = 1; ; page++) {
      const result = await wordpressGet<Editorial[]>(`/wp-json/wp/v2/${type}`, {
        per_page: 100,
        page,
        status: "publish",
        // Avoid rendering page blocks (including WooCommerce blocks) just to list URLs.
        _fields: "slug,modified",
      });
      result.data
        .filter(
          (item) =>
            type !== "pages" ||
            !["shop", "cart", "checkout", "my-account"].includes(item.slug),
        )
        .forEach((item) =>
          entries.push({
            url: `${siteUrl}/${type === "posts" ? "journal" : "pages"}/${item.slug}`,
            lastModified: item.modified,
          }),
        );
      if (page >= result.pages) break;
    }
  }
  return entries;
}
