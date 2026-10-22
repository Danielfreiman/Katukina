import { notFound } from "next/navigation";
import Link from "next/link";
import { getProduct, productName, productPrice } from "@/lib/commerce/catalog";
import { plainText } from "@/lib/wordpress/text";
import { siteUrl } from "@/lib/config/site";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { BrandMark } from "@/components/site/brand-mark";
import { AddToCart } from "@/components/commerce/add-to-cart";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  return {
    title: productName(product),
    description: plainText(
      product.short_description || product.description,
    ).slice(0, 160),
    alternates: { canonical: `/products/${slug}` },
  };
}
export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const name = productName(product);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: plainText(product.description),
    ...(product.sku ? { sku: product.sku } : {}),
    ...(product.images.length
      ? { image: product.images.map((image) => image.src) }
      : {}),
    url: `${siteUrl}/products/${slug}`,
  };
  return (
    <main id="content" className="shell page-content product-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/shop">
          <ArrowLeft size={12} /> The collection
        </Link>
        <span>/</span>
        <span>{name}</span>
      </nav>
      <div className="product-detail">
        <div className="detail-image">
          {product.images[0] ? (
            <img
              src={product.images[0].src}
              alt={plainText(product.images[0].alt) || name}
              width={800}
              height={800}
            />
          ) : (
            <div className="product-placeholder detail-placeholder">
              <BrandMark />
            </div>
          )}
        </div>
        <div className="detail-copy">
          <p className="eyebrow">
            {plainText(product.categories[0]?.name || "THE COLLECTION")}
          </p>
          <h1>{name}</h1>
          <p className="editorial-text">
            {plainText(product.short_description || product.description)}
          </p>
          <p className="detail-price">{productPrice(product)}</p>
          <AddToCart id={product.id} available={product.is_in_stock} simple={product.type === 'simple'} />
          <Link className="button secondary" href="/shop">
            Explore the collection <ArrowUpRight size={18} />
          </Link>
          <dl className="product-facts">
            {product.sku && (
              <div>
                <dt>Reference</dt>
                <dd>{product.sku}</dd>
              </div>
            )}
            {product.attributes?.map((attribute) => (
              <div key={attribute.name}>
                <dt>{plainText(attribute.name)}</dt>
                <dd>
                  {attribute.terms
                    .map((term) => plainText(term.name))
                    .join(", ")}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      {product.description && (
        <section className="product-description">
          <h2>About this discovery</h2>
          <p>{plainText(product.description)}</p>
        </section>
      )}
    </main>
  );
}
