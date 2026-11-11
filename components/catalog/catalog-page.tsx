import Link from "next/link";
import { redirect } from "next/navigation";
import { X } from "lucide-react";
import {
  getCollectionData,
  getProducts,
  getBrands,
} from "@/lib/commerce/catalog";
import { Category, categoryTrail, formatPrice } from "@/lib/commerce/product";
import {
  SearchParams,
  parseCatalogQuery,
  catalogApiQuery,
  catalogHref,
} from "@/lib/commerce/catalog-query";
import { plainText } from "@/lib/wordpress/text";
import { ProductGrid } from "./product-grid";
import { CatalogFilters, CatalogSort } from "./catalog-controls";
import { RecentlyViewed } from "./recently-viewed";
import { CategoryDiscovery } from "./category-discovery";
import "@/app/category-reference.css";

export async function CatalogPage({
  params,
  category,
  categories,
}: {
  params: SearchParams;
  category?: Category;
  categories: Category[];
}) {
  const initial = parseCatalogQuery(params).query;
  const selectedCategory =
    category ?? categories.find((item) => item.slug === initial.category);
  const path = category ? `/collections/${category.slug}` : "/shop";
  const universe = {
    ...(selectedCategory ? { category: selectedCategory.id } : {}),
    ...(initial.q ? { search: initial.q } : {}),
  };
  const [baseData, brands] = await Promise.all([
    getCollectionData(universe),
    getBrands(),
  ]);
  const currencyData =
    baseData.price_range ?? (await getCollectionData()).price_range;
  const precision = currencyData?.currency_minor_unit ?? 2;
  const currency = currencyData?.currency_code ?? "";
  const { query, errors } = parseCatalogQuery(params, precision);
  if (category) query.category = "";
  else if (query.category && !selectedCategory) {
    query.category = "";
    errors.push("That category is unavailable. Showing all categories.");
  }
  if (query.brand && !brands.some((brand) => brand.slug === query.brand)) {
    query.brand = "";
    errors.push("That brand is unavailable. Showing all brands.");
  }
  const apiQuery = catalogApiQuery(query, precision, selectedCategory?.id);
  const [products, aggregate] = await Promise.all([
    getProducts({ ...apiQuery, page: query.page, per_page: query.per_page }),
    query.min_price ||
    query.max_price ||
    query.stock ||
    query.sale ||
    query.rating ||
    query.brand
      ? getCollectionData(apiQuery)
      : Promise.resolve(baseData),
  ]);
  const pages = Math.max(1, products.pages);
  if (query.page > pages) redirect(catalogHref(path, query, { page: pages }));
  const inStock = Number(
    aggregate.stock_status_counts?.find((item) => item.status === "instock")
      ?.count ?? 0,
  );
  const active = [
    ...(query.q ? [{ key: "q", text: `Search: ${query.q}` }] : []),
    ...(query.category && selectedCategory
      ? [{ key: "category", text: plainText(selectedCategory.name) }]
      : []),
    ...(query.min_price
      ? [{ key: "min_price", text: `Min: ${query.min_price} ${currency}` }]
      : []),
    ...(query.max_price
      ? [{ key: "max_price", text: `Max: ${query.max_price} ${currency}` }]
      : []),
    ...(query.stock ? [{ key: "stock", text: "In stock" }] : []),
    ...(query.sale ? [{ key: "sale", text: "On sale" }] : []),
    ...(query.rating
      ? [{ key: "rating", text: `${query.rating} stars & up` }]
      : []),
    ...(query.brand
      ? [
          {
            key: "brand",
            text: plainText(
              brands.find((brand) => brand.slug === query.brand)!.name,
            ),
          },
        ]
      : []),
  ];
  const numbers = Array.from(
    new Set([
      1,
      ...Array.from({ length: 5 }, (_, i) => query.page + i - 2).filter(
        (n) => n > 0 && n <= pages,
      ),
      pages,
    ]),
  ).sort((a, b) => a - b);
  return (
    <main
      id="content"
      className={`shell page-content catalog-page${category ? " category-reference" : ""}`}
    >
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/shop">Shop</Link>
        {categoryTrail(category, categories).map((item) => (
          <span key={item.id}>
            {" "}
            /{" "}
            <Link
              href={`/collections/${item.slug}`}
              aria-current={item.id === category?.id ? "page" : undefined}
            >
              {plainText(item.name)}
            </Link>
          </span>
        ))}
      </nav>
      <header className="catalog-intro">
        <p className="eyebrow">THE KATUKINA COLLECTION</p>
        <h1>
          {category
            ? plainText(category.name)
            : query.q
              ? `Results for “${query.q}”`
              : "The collection"}
        </h1>
        <p>
          {category?.description
            ? plainText(category.description)
            : "Explore botanicals, artisan objects and traditions. Find your next discovery."}
        </p>
      </header>
      {category && (
        <CategoryDiscovery
          category={category}
          categories={categories}
          products={products.data}
          query={query}
        />
      )}
      <div className="catalog-layout">
        <CatalogFilters
          key={catalogHref(path, query)}
          path={path}
          query={query}
          categories={categories}
          currency={currency}
          precision={precision}
          inStock={inStock}
          selectedCategory={selectedCategory}
          brands={brands}
        />
        <section
          className="catalog-results"
          id={category ? "category-products" : undefined}
          aria-label="Product results"
        >
          <div className="catalog-results-toolbar">
            <p className="catalog-result-count" role="status">
              <strong>{products.total}</strong>{" "}
              {products.total === 1 ? "product" : "products"}
              {products.total > 0 && (
                <span>
                  {" "}
                  · {(query.page - 1) * query.per_page + 1}–
                  {Math.min(query.page * query.per_page, products.total)}
                </span>
              )}
            </p>
            <CatalogSort
              key={catalogHref(path, query)}
              path={path}
              query={query}
            />
          </div>
          {errors.length > 0 && (
            <div className="commerce-error" role="alert">
              {errors.join(" ")}
            </div>
          )}
          {active.length > 0 && (
            <nav className="active-filters" aria-label="Active filters">
              {active.map((filter) => (
                <Link
                  key={filter.key}
                  href={catalogHref(path, query, { [filter.key]: "", page: 1 })}
                  aria-label={`Remove ${filter.text}`}
                >
                  {filter.text}
                  <X size={13} />
                </Link>
              ))}
              <Link href={path}>Clear all</Link>
            </nav>
          )}
          {products.data.length ? (
            category ? (
              <>
                <ProductGrid products={products.data.slice(0, 4)} />
                {products.data.length > 4 && (
                  <>
                    <aside
                      className="category-subscribe"
                      aria-label="Collection updates"
                    >
                      <div>
                        <h2>Stay connected to the collection</h2>
                        <p>Discover new arrivals and stories from Katukina.</p>
                      </div>
                      <Link href="/subscribe" className="button secondary">
                        Get email updates
                      </Link>
                    </aside>
                    <ProductGrid products={products.data.slice(4)} />
                  </>
                )}
              </>
            ) : (
              <ProductGrid products={products.data} />
            )
          ) : (
            <div className="no-results">
              <h2>No discoveries here just yet.</h2>
              <p>
                No products match these filters. Try a different search or price
                range.
              </p>
              <Link className="button secondary" href={path}>
                Clear filters
              </Link>
            </div>
          )}
          {category && products.data.length > 0 && (
            <section
              className="category-editorial"
              aria-labelledby="category-editorial-title"
            >
              <div>
                <h2 id="category-editorial-title">A little more to discover</h2>
                <Link href="/journal">View the journal</Link>
              </div>
              <nav aria-label="Collection guidance">
                {[
                  {
                    href: "/about",
                    image: "/images/forest.jpg",
                    title: "Our story",
                    copy: "Nature, culture and connection.",
                  },
                  {
                    href: "/journal",
                    image: "/images/palo-santo.jpg",
                    title: "The journal",
                    copy: "Explore the stories behind the collection.",
                  },
                  {
                    href: "/shipping",
                    image: "/images/bamboo.jpg",
                    title: "Shipping & destinations",
                    copy: "Check delivery options for your country.",
                  },
                ].map((item) => (
                  <Link href={item.href} key={item.href}>
                    <img
                      src={item.image}
                      alt=""
                      width={320}
                      height={180}
                      loading="lazy"
                    />
                    <h3>{item.title}</h3>
                    <p>{item.copy}</p>
                  </Link>
                ))}
              </nav>
            </section>
          )}
          {pages > 1 && (
            <nav className="catalog-pagination" aria-label="Pagination">
              {query.page > 1 && (
                <Link
                  href={catalogHref(path, query, { page: query.page - 1 })}
                  aria-label="Previous page"
                >
                  Previous
                </Link>
              )}
              {numbers.map((number, index) => (
                <span key={number}>
                  {index > 0 && number > numbers[index - 1] + 1 && (
                    <span className="pagination-gap">…</span>
                  )}
                  <Link
                    href={catalogHref(path, query, { page: number })}
                    aria-label={`Page ${number}`}
                    aria-current={number === query.page ? "page" : undefined}
                  >
                    {number}
                  </Link>
                </span>
              ))}
              {query.page < pages && (
                <Link
                  href={catalogHref(path, query, { page: query.page + 1 })}
                  aria-label="Next page"
                >
                  Next
                </Link>
              )}
            </nav>
          )}
          {aggregate.price_range && currency && (
            <p className="catalog-range">
              Price range in these results:{" "}
              {formatPrice(
                aggregate.price_range.min_price,
                currency,
                precision,
              )}{" "}
              –{" "}
              {formatPrice(
                aggregate.price_range.max_price,
                currency,
                precision,
              )}
            </p>
          )}
        </section>
      </div>
      <RecentlyViewed />
    </main>
  );
}
