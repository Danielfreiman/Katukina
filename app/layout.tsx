import type { Metadata } from "next";
import "./globals.css";
import "@fontsource-variable/inter";
import "@fontsource-variable/cormorant-garamond";
import { siteUrl } from "@/lib/content";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Katukina | Rooted in nature", template: "%s | Katukina" },
  description:
    "Discover Katukina: incense, botanicals and objects connecting nature, culture and everyday rituals. Explore the collection and its origins.",
  alternates: { canonical: "/" },
  robots: { index: process.env.SITE_INDEXABLE === "true", follow: true },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "Katukina",
    title: "Katukina — Rooted in nature",
    description: "Nature, tradition and connection in every discovery.",
    images: [
      {
        url: "/images/forest.jpg",
        width: 1800,
        height: 1200,
        alt: "Sunlight through a forest",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Katukina — Rooted in nature",
    images: ["/images/forest.jpg"],
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
