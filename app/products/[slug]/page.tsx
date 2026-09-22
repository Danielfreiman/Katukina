import { products, siteUrl } from "@/lib/content";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
export function generateStaticParams() {
  return products.map((p) => ({ slug: p.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = products.find((p) => p.id === slug);
  return {
    title: p?.name || "Product not found",
    description: p?.description,
    alternates: { canonical: `/products/${slug}` },
  };
}
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = products.find((p) => p.id === slug);
  if (!p) notFound();
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: p.name,
        item: `${siteUrl}/products/${slug}`,
      },
    ],
  };
  return (
    <main className="product-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <Link href="/" className="wordmark">
        katukina<span>NATURE · TRADITION · CONNECTION</span>
      </Link>
      <nav aria-label="Breadcrumb">
        <Link href="/">Home</Link> / {p.name}
      </nav>
      <div className="product-detail">
        <Image
          src={p.image}
          alt={p.name + " — original Katukina photograph"}
          width={800}
          height={800}
        />
        <div>
          <p className="eyebrow">{p.category}</p>
          <h1>{p.name}</h1>
          <p>{p.note}</p>
          <p>{p.description}</p>
          <p>
            <a
              className="text-link"
              href={p.source}
              target="_blank"
              rel="noreferrer"
            >
              View the original product ↗
            </a>
          </p>
          <p className="detail-price">
            {p.price.toLocaleString("en-GB", {
              style: "currency",
              currency: "EUR",
            })}
          </p>
          <p className="muted">
            Illustrative price. Not available to purchase in this demo.
          </p>
          <Link className="button primary" href="/#collection">
            Explore the collection →
          </Link>
        </div>
      </div>
    </main>
  );
}
