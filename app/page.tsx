import { faqs, siteUrl } from "@/lib/content";
import Storefront from "@/components/storefront";
export default function Home() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Katukina",
        inLanguage: "en-GB",
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Katukina — demonstration concept",
        url: siteUrl,
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <Storefront />
    </>
  );
}
