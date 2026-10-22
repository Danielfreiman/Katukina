import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Product, productName, productPrice } from "@/lib/commerce/catalog";
import { plainText } from "@/lib/wordpress/text";
import { BrandMark } from "@/components/site/brand-mark";
export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length)
    return (
      <div className="no-results">
        <BrandMark />
        <h2>No discoveries here just yet.</h2>
        <p>Explore another collection or visit again soon.</p>
        <Link className="text-link" href="/shop">
          Explore the collection <ArrowUpRight size={18} />
        </Link>
      </div>
    );
  return (
    <div className="product-grid">
      {products.map((product) => (
        <article className="product-card" key={product.id}>
          <Link
            href={`/products/${product.slug}`}
            className="product-card-link"
          >
            <div className="product-photo">
              {product.images[0] ? (
                <img
                  src={product.images[0].src}
                  alt={plainText(product.images[0].alt) || productName(product)}
                  width={640}
                  height={480}
                  loading="lazy"
                />
              ) : (
                <span className="product-placeholder">
                  <BrandMark />
                </span>
              )}
              <span className="photo-arrow">
                <ArrowUpRight size={22} />
              </span>
            </div>
            <div className="product-info">
              <p className="product-category">
                {plainText(product.categories[0]?.name || "Collection")}
              </p>
              <div className="product-title-row">
                <h3>
                  {productName(product).replace(
                    /^Sacred Incense\s*[–-]\s*/,
                    "",
                  )}
                </h3>
                <span className="product-price">
                  {productPrice(product) || "View details"}
                </span>
              </div>
              <p className="product-note">
                {plainText(product.short_description)}
              </p>
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
}
