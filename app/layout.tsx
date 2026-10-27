import type { Metadata } from "next";
import "./globals.css";
import "./catalog.css";
import "./privacy.css";
import "@fontsource-variable/manrope";
import { siteUrl } from "@/lib/config/site";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { CookieConsentProvider } from "@/components/privacy/cookie-consent";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Katukina | Find your natural rhythm",
    template: "%s | Katukina",
  },
  description:
    "Discover Katukina: incense, botanicals and objects connecting nature, culture and everyday rituals. Explore the collection and its origins.",
  alternates: { canonical: "/" },
  robots: { index: process.env.SITE_INDEXABLE === "true", follow: true },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "Katukina",
    title: "Katukina — Find your natural rhythm",
    description: "Nature, tradition and connection in every discovery.",
    images: [
      {
        url: "/images/original-background.jpg",
        alt: "Katukina geometric pattern",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Katukina — Find your natural rhythm",
    images: ["/images/original-background.jpg"],
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB" data-scroll-behavior="smooth">
      <body>
        <CookieConsentProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </CookieConsentProvider>
      </body>
    </html>
  );
}
