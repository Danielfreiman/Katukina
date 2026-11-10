import Link from "next/link";
import { existsSync } from "node:fs";
import path from "node:path";
import { Hand } from "lucide-react";
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
  const hasArtwork = (slug: string) => existsSync(path.join(process.cwd(), "public/images/home/category-cards", `${slug}.webp`));
  const categories = homeCategories.every((item) => hasArtwork(item.slug))
    ? []
    : await getCategories().catch(() => []);
  const cards = await Promise.all(homeCategories.map(async (item) => {
    if (hasArtwork(item.slug)) return { ...item, artwork: `/images/home/category-cards/${item.slug}.webp`, product: undefined };
    const category = categories.find((category) => category.slug === item.slug);
    if (!category) return { ...item, artwork: undefined, product: undefined };
    // A bounded category-specific pool keeps the home request lightweight.
    // Selection happens on the server, so the photo is present in initial HTML.
    const products = await getProducts({ category: category.id, per_page: 24 })
      .then(({ data }) => data.filter((product) => product.images.some((image) => image.src)))
      .catch(() => []);
    const product = products[Math.floor(Math.random() * products.length)];
    return { ...item, artwork: undefined, product };
  }));

  return (
    <nav className="collection-paths" aria-labelledby="home-categories-title">
      <h3 id="home-categories-title">Explore by <span>category</span></h3>
      <div className="collection-paths-links">
        {cards.map((category) => {
          const image = category.product?.images.find((image) => image.src);
          return (
            <Link className="category-photo-card" key={category.slug} href={`/collections/${category.slug}`} data-product-id={category.product?.id}>
              <span className="category-photo-frame">
                {category.artwork ? (
                  <CatalogImage className="category-photo category-photo-artwork" src={category.artwork} sizes="(max-width: 600px) 180px, (max-width: 1100px) 33vw, 210px" alt="" width={960} height={960} loading="lazy" />
                ) : image ? (
                  <CatalogImage className="category-photo" src={image.src} srcSet={image.srcset || undefined} sizes="(max-width: 600px) 180px, (max-width: 1100px) 33vw, 210px" alt="" width={640} height={640} loading="lazy" />
                ) : (
                  <span className="catalog-image-placeholder"><BrandMark /><span>Image unavailable</span></span>
                )}
              </span>
              <div className="category-photo-copy">
                <h4>{category.name}</h4>
              </div>
            </Link>
          );
        })}
      </div>
      <p className="collection-paths-scroll-hint">
        <Hand size={16} aria-hidden="true" />
        <span>Swipe to explore</span>
      </p>
    </nav>
  );
}
