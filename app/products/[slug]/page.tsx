import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getProduct,
  getProducts,
  getCategories,
  getVariations,
  productName,
} from "@/lib/commerce/catalog";
import { categoryTrail } from "@/lib/commerce/product";
import { plainText } from "@/lib/wordpress/text";
import { siteUrl } from "@/lib/config/site";
import { ProductPurchase } from "@/components/catalog/product-purchase";
import { ProductGrid } from "@/components/catalog/product-grid";
import { RecentlyViewed } from "@/components/catalog/recently-viewed";
import { SearchParams, singleParam } from "@/lib/commerce/catalog-query";
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
};
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
export default async function ProductPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const [variations, categories, query] = await Promise.all([
    getVariations(product),
    getCategories(),
    searchParams,
  ]);
  const related = product.categories[0]
    ? await getProducts({
        category: product.categories[0].id,
        per_page: 4,
        exclude: String(product.id),
        orderby: "title",
        order: "asc",
      }).catch(() => null)
    : null;
  const trail = categoryTrail(
    categories.find((category) => category.id === product.categories[0]?.id),
    categories,
  );
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Shop", url: "/shop" },
    ...trail.map((item) => ({
      name: plainText(item.name),
      url: `/collections/${item.slug}`,
    })),
    { name: productName(product), url: `/products/${slug}` },
  ];
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: productName(product),
      description: plainText(product.description),
      ...(product.sku ? { sku: product.sku } : {}),
      image: product.images.map((image) => image.src),
      url: `${siteUrl}/products/${slug}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: `${siteUrl}${item.url}`,
      })),
    },
  ];
  const attributes =
    product.attributes?.filter((attribute) => !attribute.has_variations) ?? [];
  return (
    <main
      id="content"
      className="shell page-content product-page product-page-v2"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        {breadcrumbs.map((item, index) => (
          <span key={item.url}>
            {index > 0 && " / "}
            {index === breadcrumbs.length - 1 ? (
              <span aria-current="page">{item.name}</span>
            ) : (
              <Link href={item.url}>{item.name}</Link>
            )}
          </span>
        ))}
      </nav>
      <ProductPurchase
        key={product.id}
        product={product}
        variations={variations}
        initialVariation={Number(singleParam(query.variation)) || 0}
      />
      <section className="product-information" aria-label="Product information">
        <div>
          <h2>Description</h2>
          {product.description ? (
            <p className="product-description-text">
              {plainText(product.description)}
            </p>
          ) : (
            <p className="product-description-text">
              Additional product information is not available yet.
            </p>
          )}
        </div>
        <div>
          <h2>Product details</h2>
          <dl className="product-facts">
            <div>
              <dt>Product reference</dt>
              <dd>{product.sku || product.id}</dd>
            </div>
            {attributes.map((attribute) => (
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
          <div className="product-category-tags">
            {product.categories.map((category) => (
              <Link href={`/collections/${category.slug}`} key={category.id}>
                {plainText(category.name)}
              </Link>
            ))}
          </div>
        </div>
      </section>
      {!!related?.data.length && (
        <section className="related-products">
          <div className="related-heading">
            <h2>More to discover</h2>
            <Link
              className="text-link"
              href={`/collections/${product.categories[0].slug}`}
            >
              Explore the category
            </Link>
          </div>
          <ProductGrid products={related.data} />
        </section>
      )}
      <RecentlyViewed currentId={product.id} />
    </main>
  );
}
