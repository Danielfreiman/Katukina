import Link from "next/link";
import { getProducts } from "@/lib/commerce/catalog";
import type { Category, Product } from "@/lib/commerce/product";
import { catalogHref, type CatalogQuery } from "@/lib/commerce/catalog-query";
import { plainText } from "@/lib/wordpress/text";
import { CatalogImage } from "./catalog-image";
import { CategoryRail } from "./category-rail";

export async function CategoryDiscovery({
  category,
  categories,
  products,
  query,
}: {
  category: Category;
  categories: Category[];
  products: Product[];
  query: CatalogQuery;
}) {
  const children = categories.filter(
    (item) => item.parent === category.id && item.count > 0,
  );
  const related = children.length
    ? children
    : categories.filter(
        (item) =>
          item.parent === category.parent &&
          item.id !== category.id &&
          item.count > 0,
      );
  const cards = await Promise.all(
    related.slice(0, 12).map(async (item) => {
      const image =
        item.image?.src ||
        (await getProducts({ category: item.id, per_page: 1 })
          .then((result) => result.data[0]?.images[0]?.src)
          .catch(() => undefined));
      return { ...item, image };
    }),
  );
  const image = category.image?.src || products[0]?.images[0]?.src;
  return (
    <>
      <section
        className="category-campaign"
        aria-label={`${plainText(category.name)} collection`}
      >
        <div>
          <p className="eyebrow">NATURE. CULTURE. CONNECTION.</p>
          <h2>Discover {plainText(category.name)}</h2>
          <p>Explore the collection and find your next discovery.</p>
          <a href="#category-products" className="button primary">
            Shop this collection
          </a>
        </div>
        {image && (
          <CatalogImage
            src={image}
            alt=""
            width={320}
            height={240}
            className="category-campaign-image"
          />
        )}
      </section>
      {cards.length > 0 && (
        <CategoryRail
          className="category-discovery"
          label={
            children.length
              ? "Explore subcategories"
              : "Explore related categories"
          }
        >
          {cards.map((item) => (
            <Link
              key={item.id}
              href={catalogHref(`/collections/${item.slug}`, query, {
                category: "",
                page: 1,
              })}
            >
              <span className="category-discovery-photo">
                <CatalogImage
                  src={item.image || "/images/brand/katukina-tree.svg"}
                  alt=""
                  width={120}
                  height={120}
                  loading="lazy"
                />
              </span>
              <span>{plainText(item.name)}</span>
            </Link>
          ))}
        </CategoryRail>
      )}
    </>
  );
}
