import Link from "next/link";
import { getCategories, getProducts } from "@/lib/commerce/catalog";
import { CatalogImage } from "./catalog-image";
import { BrandMark } from "@/components/site/brand-mark";

const homeCategories = [
  { slug: "exclusive-sale", name: "Exclusive Sale", cta: "Explore the sale" },
  { slug: "puer-teas", name: "Puer Teas", cta: "Discover the teas" },
  { slug: "giftshop", name: "Giftshop", cta: "Find a gift" },
  { slug: "incense-smudge", name: "Incense Smudge", cta: "Explore incense" },
  { slug: "shamanic-tools", name: "Shamanic Tools", cta: "Discover the tools" },
  { slug: "rape", name: "Rape", cta: "Explore the varieties" },
];

export async function HomeCategoryStrip() {
  const categories = await getCategories().catch(() => []);
  const cards = await Promise.all(homeCategories.map(async (item) => {
    const category = categories.find((category) => category.slug === item.slug);
    if (!category) return { ...item, product: undefined };
    // A bounded category-specific pool keeps the home request lightweight.
    // Selection happens on the server, so the photo is present in initial HTML.
    const products = await getProducts({ category: category.id, per_page: 24 })
      .then(({ data }) => data.filter((product) => product.images.some((image) => image.src)))
      .catch(() => []);
    const product = products[Math.floor(Math.random() * products.length)];
    return { ...item, product };
  }));

  return (
    <nav className="collection-paths" aria-labelledby="home-categories-title">
      <h3 id="home-categories-title">Explore by category</h3>
      <div className="collection-paths-links">
        {cards.map((category) => {
          const image = category.product?.images.find((image) => image.src);
          return (
            <Link className="category-photo-card" key={category.slug} href={`/collections/${category.slug}`} data-product-id={category.product?.id}>
              <span className="category-photo-frame">
                {image ? (
                  <CatalogImage className="category-photo" src={image.src} srcSet={image.srcset || undefined} sizes="(max-width: 1100px) 120px, 210px" alt="" width={640} height={640} loading="lazy" />
                ) : (
                  <span className="catalog-image-placeholder"><BrandMark /><span>Image unavailable</span></span>
                )}
              </span>
              <div className="category-photo-copy">
                <h4>{category.name}</h4>
                <span className="category-photo-cta">{category.cta}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
