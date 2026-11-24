import Link from "next/link";
import { getProducts } from "@/lib/commerce/catalog";
import { getCollectionBannerCopy } from "@/lib/collection-banner-copy";
import { publicImageUrl } from "@/lib/public-image";
import type { Category } from "@/lib/commerce/product";
import { catalogHref, type CatalogQuery } from "@/lib/commerce/catalog-query";
import { plainText } from "@/lib/wordpress/text";
import { CatalogImage } from "./catalog-image";
import { CategoryRail } from "./category-rail";

export async function CategoryDiscovery({
  category,
  categories,
  query,
}: {
  category: Category;
  categories: Category[];
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
  const bannerFile = /^[a-z0-9][a-z0-9_-]*$/.test(category.slug)
    ? `${category.slug}.webp`
    : null;
  const copy = getCollectionBannerCopy(category);
  const [desktop, mobile, cards] = await Promise.all([
    bannerFile &&
      publicImageUrl(`/images/collections/banners/desktop/${bannerFile}`),
    bannerFile &&
      publicImageUrl(`/images/collections/banners/mobile/${bannerFile}`),
    Promise.all(
      related.slice(0, 12).map(async (item) => {
        const image =
          item.image?.src ||
          (await getProducts({ category: item.id, per_page: 1 })
            .then((result) => result.data[0]?.images[0]?.src)
            .catch(() => undefined));
        return { ...item, image };
      }),
    ),
  ]);
  const name = plainText(category.name);
  const banner = desktop || mobile;
  return (
    <>
      <section className="category-campaign" aria-label={`${name} collection`}>
        {banner && (
          <picture>
            {mobile && (
              <source
                media="(max-width: 640px)"
                srcSet={mobile}
                width={1080}
                height={720}
              />
            )}
            <img
              src={banner}
              alt=""
              width={desktop ? 2880 : 1080}
              height={desktop ? 640 : 720}
            />
          </picture>
        )}
        <div className="category-campaign-copy">
          <h2>{copy.heading}</h2>
          <p>{copy.description}</p>
        </div>
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
