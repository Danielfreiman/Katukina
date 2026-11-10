"use client";
import { useId, useRef, useState } from "react";
import Link from "next/link";
import { SlidersHorizontal, X, Search } from "lucide-react";
import { Category, categoryTrail } from "@/lib/commerce/product";
import type { Brand } from "@/lib/commerce/catalog";
import {
  CatalogQuery,
  catalogHref,
  sortOptions,
} from "@/lib/commerce/catalog-query";
import { plainText } from "@/lib/wordpress/text";

type Props = {
  path: string;
  query: CatalogQuery;
  categories: Category[];
  selectedCategory?: Category;
  brands: Brand[];
  currency: string;
  precision: number;
  inStock: number;
};
function CategoryLinks({ query, categories, selectedCategory }: Props) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const children = categories.filter(
    (item) => item.parent === (selectedCategory?.id ?? 0) && item.count > 0,
  );
  const siblings = categories.filter(
    (item) => item.parent === (selectedCategory?.parent ?? 0) && item.count > 0,
  );
  const items =
    selectedCategory && !children.length
      ? siblings.filter((item) => item.id !== selectedCategory.id)
      : children;
  const href = (slug?: string) =>
    catalogHref(slug ? `/collections/${slug}` : "/shop", query, {
      category: "",
      page: 1,
    });
  return (
    <nav className="category-list" aria-label="Browse categories">
      <h2>Categories</h2>
      <Link
        className="category-root"
        href={href()}
        aria-current={!selectedCategory ? "page" : undefined}
      >
        All products
      </Link>
      {categoryTrail(selectedCategory, categories).map((item) => (
        <Link
          className="category-ancestor"
          href={href(item.slug)}
          key={item.id}
          aria-current={item.id === selectedCategory?.id ? "page" : undefined}
        >
          <span>{plainText(item.name)}</span>
          <span className="category-count">({item.count})</span>
        </Link>
      ))}
      <ul
        id={listId}
        className={
          children.length && selectedCategory ? "category-children" : undefined
        }
      >
        {(expanded ? items : items.slice(0, 9)).map((item) => (
          <li key={item.id}>
            <Link href={href(item.slug)}>
              <span>{plainText(item.name)}</span>
              <span className="category-count">({item.count})</span>
            </Link>
          </li>
        ))}
      </ul>
      {items.length > 9 && (
        <button
          type="button"
          className="filter-show-more"
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded
            ? "Show fewer categories"
            : `+ ${items.length - 9} more categories`}
        </button>
      )}
    </nav>
  );
}
function FilterForm(props: Props) {
  const { path, query, brands } = props;
  const id = useId();
  const [brandSearch, setBrandSearch] = useState("");
  return (
    <>
      <CategoryLinks {...props} />
      <form action={path} method="get" className="catalog-filter-form">
        {(["sort", "per_page", "category"] as const).map((key) => (
          <input key={key} type="hidden" name={key} value={query[key]} />
        ))}
        <label htmlFor={`${id}-search`}>Search products</label>
        <div className="catalog-search-field">
          <button type="submit" aria-label="Search products">
            <Search size={16} />
          </button>
          <input
            id={`${id}-search`}
            name="q"
            defaultValue={query.q}
            maxLength={100}
            placeholder="Find a product"
          />
        </div>
        {!!brands.length && (
          <details className="filter-section" open>
            <summary>Brands</summary>
            <label className="sr-only" htmlFor={`${id}-brand-search`}>
              Find a brand
            </label>
            <input
              id={`${id}-brand-search`}
              type="search"
              placeholder="Find a brand"
              value={brandSearch}
              onChange={(event) => setBrandSearch(event.target.value)}
            />
            <div className="brand-filter-options">
              <label className="stock-checkbox">
                <input
                  type="radio"
                  name="brand"
                  value=""
                  onChange={(event) =>
                    event.currentTarget.form?.requestSubmit()
                  }
                  defaultChecked={!query.brand}
                />
                All brands
              </label>
              {brands.map((brand) => (
                <label
                  key={brand.id}
                  className="stock-checkbox"
                  hidden={
                    !plainText(brand.name)
                      .toLowerCase()
                      .includes(brandSearch.toLowerCase())
                  }
                >
                  <input
                    type="radio"
                    name="brand"
                    value={brand.slug}
                    onChange={(event) =>
                      event.currentTarget.form?.requestSubmit()
                    }
                    defaultChecked={query.brand === brand.slug}
                  />
                  {plainText(brand.name)} <span>({brand.count})</span>
                </label>
              ))}
            </div>
          </details>
        )}
      </form>
    </>
  );
}
export function CatalogFilters(props: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <aside className="catalog-sidebar">
        <FilterForm {...props} />
      </aside>
      <button
        className="mobile-filters-button"
        onClick={() => dialog.current?.showModal()}
      >
        <SlidersHorizontal size={17} /> Filters
      </button>
      <dialog
        className="filter-dialog"
        ref={dialog}
        aria-label="Filter products"
      >
        <div className="filter-dialog-heading">
          <h2>Filters</h2>
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => dialog.current?.close()}
          >
            <X />
          </button>
        </div>
        <FilterForm {...props} />
      </dialog>
    </>
  );
}
export function CatalogSort({
  path,
  query,
}: {
  path: string;
  query: CatalogQuery;
}) {
  return (
    <form action={path} method="get" className="catalog-sort">
      {(
        [
          "q",
          "category",
          "min_price",
          "max_price",
          "stock",
          "sale",
          "rating",
          "brand",
        ] as const
      ).map(
        (key) =>
          query[key] && (
            <input key={key} type="hidden" name={key} value={query[key]} />
          ),
      )}
      <label htmlFor="catalog-sort">Sort by</label>
      <select
        id="catalog-sort"
        name="sort"
        defaultValue={query.sort}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
      >
        {Object.entries(sortOptions).map(([value, label]) => (
          <option value={value} key={value}>
            {label}
          </option>
        ))}
      </select>
      <label htmlFor="catalog-page-size">Show</label>
      <select
        id="catalog-page-size"
        name="per_page"
        defaultValue={query.per_page}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
      >
        {[12, 24, 48].map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
      <noscript>
        <button type="submit">Update results</button>
      </noscript>
    </form>
  );
}
