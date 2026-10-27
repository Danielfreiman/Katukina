import Link from "next/link";
import { Product, productName, productPrice } from "@/lib/commerce/product";
import {
  canPurchase,
  quantityLimits,
  formatPrice,
} from "@/lib/commerce/product";
import { plainText } from "@/lib/wordpress/text";
import { BrandMark } from "@/components/site/brand-mark";
import { AddToCart } from "@/components/commerce/add-to-cart";
import { CatalogImage } from "./catalog-image";
export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length)
    return (
      <div className="no-results">
        <BrandMark />
        <h2>No discoveries here just yet.</h2>
        <p>Explore another collection or visit again soon.</p>
        <Link className="text-link" href="/shop">
          Explore the collection
        </Link>
      </div>
    );
  return (
    <div className="product-grid product-grid-v2">
      {products.map((product) => {
        const href = `/products/${product.slug}`;
        return (
          <article
            className="product-card"
            key={product.id}
            data-product-id={product.id}
          >
            <Link
              href={href}
              className="product-card-link"
              tabIndex={-1}
              aria-hidden="true"
            >
              <div className="product-photo">
                {product.on_sale && (
                  <span className="product-sale-badge">Sale</span>
                )}
                {product.images[0] ? (
                  <CatalogImage
                    src={product.images[0].src}
                    srcSet={product.images[0].srcset || undefined}
                    sizes="(max-width: 600px) 45vw, (max-width: 1000px) 30vw, 320px"
                    alt=""
                    width={640}
                    height={640}
                    loading="lazy"
                  />
                ) : (
                  <span className="product-placeholder">
                    <BrandMark />
                  </span>
                )}
              </div>
            </Link>
            <div className="product-info">
              <p className="product-category">
                {plainText(product.categories[0]?.name || "Collection")}
              </p>
              <h3>
                <Link href={href}>{productName(product)}</Link>
              </h3>
              {!!product.review_count && (
                <p
                  className="product-rating"
                  aria-label={`${product.average_rating} out of 5 stars, ${product.review_count} reviews`}
                >
                  <span className="rating-stars" aria-hidden="true">
                    ★
                  </span>{" "}
                  {product.average_rating} <span>({product.review_count})</span>
                </p>
              )}
              {product.type === "variable" && !!product.variations?.length && (
                <Link className="product-more-options" href={href}>
                  + {product.variations.length} {product.variations.length === 1 ? "presentation" : "presentations"}
                </Link>
              )}
              <p className="product-price">
                {product.type === "simple" &&
                  product.on_sale &&
                  product.prices.regular_price &&
                  Number(product.prices.regular_price) >
                    Number(product.prices.price) && (
                    <del>
                      {formatPrice(
                        product.prices.regular_price,
                        product.prices.currency_code,
                        product.prices.currency_minor_unit,
                      )}{" "}
                    </del>
                  )}
                {productPrice(product) || "View details"}
              </p>
              <p className="product-stock">
                {product.is_in_stock
                  ? product.is_on_backorder
                    ? "Available on backorder"
                    : "In stock"
                  : "Out of stock"}
              </p>
            </div>
            {product.type === "simple" && canPurchase(product) ? (
              <AddToCart
                id={product.id}
                quantity={quantityLimits(product).min}
                available
                simple
              />
            ) : (
              <Link className="product-card-action" href={href}>
                {product.type === "variable" && product.is_in_stock
                  ? "Choose options"
                  : "View product"}
                <span aria-hidden="true"> →</span>
                <span className="sr-only"> for {productName(product)}</span>
              </Link>
            )}
          </article>
        );
      })}
    </div>
  );
}
