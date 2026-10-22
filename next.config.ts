import type { NextConfig } from "next";
const backend = new URL(
  process.env.WORDPRESS_INTERNAL_URL || "http://127.0.0.1:8888",
);
if (
  !["http:", "https:"].includes(backend.protocol) ||
  backend.username ||
  backend.password ||
  backend.pathname !== "/"
) {
  throw new Error(
    "WORDPRESS_INTERNAL_URL must be an HTTP(S) origin without credentials or path.",
  );
}
const nextConfig: NextConfig = {
  devIndicators: false,
  // WordPress requires /wp-admin/; Next's automatic slash removal would loop.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    const paths = [
      "/wp-admin/:path+",
      "/wp-login.php",
      "/wp-json/:path*",
      "/wp-content/uploads/:path*",
      "/wp-content/plugins/:path*",
      "/wp-content/themes/:path*",
      "/wp-includes/:path*",
      "/wp-cron.php",
      "/wc-api/:path*",
    ];
    return {
      beforeFiles: [
        { source: "/wp-admin", destination: `${backend.origin}/wp-admin/` },
        ...paths.map((source) => ({
          source,
          destination: `${backend.origin}${source}`,
        })),
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};
export default nextConfig;
