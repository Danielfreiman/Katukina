import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config/site";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/wp-admin/",
        "/wp-login.php",
        "/wp-json/",
        "/cart",
        "/checkout",
        "/account",
        "/*?q=",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
