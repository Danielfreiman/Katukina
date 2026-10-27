"use client";
import { useId, useRef, useState } from "react";
import Link from "next/link";
import { SlidersHorizontal, X, Search } from "lucide-react";
import { Category, categoryTrail, formatPrice } from "@/lib/commerce/product";
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
  const { path, query, brands, currency, precision, inStock } = props;
  const id = useId();
  const [brandSearch, setBrandSearch] = useState("");
  const ranges = [
    { min: "", max: "10" },
    { min: "10", max: "25" },
    { min: "25", max: "50" },
    { min: "50", max: "" },
  ];
  const money = (value: string) =>
    formatPrice(String(Number(value) * 10 ** precision), currency, precision);
  return (
    <>
      <CategoryLinks {...props} />
      <form action={path} method="get" className="catalog-filter-form">
        {(["sort", "per_page", "category"] as const).map((key) => (
          <input key={key} type="hidden" name={key} value={query[key]} />
        ))}
        <label htmlFor={`${id}-search`}>Search products</label>
        <div className="catalog-search-field">
          <Search size={16} />
          <input
            id={`${id}-search`}
            name="q"
            defaultValue={query.q}
            maxLength={100}
            placeholder="Find a product"
          />
        </div>
        <details className="filter-section" open>
          <summary>Popular filters</summary>
          <label className="stock-checkbox">
            <input
              type="checkbox"
              name="stock"
              value="instock"
              defaultChecked={query.stock === "instock"}
            />
            In stock <span>({inStock})</span>
          </label>
          <label className="stock-checkbox">
            <input
              type="checkbox"
              name="sale"
              value="yes"
              defaultChecked={query.sale === "yes"}
            />
            On sale
          </label>
        </details>
        <details className="filter-section" open>
          <summary>Price {currency && `(${currency})`}</summary>
          {currency && (
            <nav className="price-range-links" aria-label="Price ranges">
              {ranges.map((range) => (
                <Link
                  key={range.min + range.max}
                  aria-current={
                    query.min_price === range.min &&
                    query.max_price === range.max
                      ? "true"
                      : undefined
                  }
                  href={catalogHref(path, query, {
                    min_price: range.min,
                    max_price: range.max,
                    page: 1,
                  })}
                >
                  {!range.min
                    ? `Up to ${money(range.max)}`
                    : !range.max
                      ? `${money(range.min)} & above`
                      : `${money(range.min)} – ${money(range.max)}`}
                </Link>
              ))}
            </nav>
          )}
          <div className="price-inputs">
            <label htmlFor={`${id}-min`}>
              Min
              <input
                id={`${id}-min`}
                type="number"
                name="min_price"
                min="0"
                max="9999999"
                step={10 ** -precision}
                defaultValue={query.min_price}
                inputMode="decimal"
                placeholder="Any"
              />
            </label>
            <label htmlFor={`${id}-max`}>
              Max
              <input
                id={`${id}-max`}
                type="number"
                name="max_price"
                min="0"
                max="9999999"
                step={10 ** -precision}
                defaultValue={query.max_price}
                inputMode="decimal"
                placeholder="Any"
              />
            </label>
          </div>
        </details>
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
                    defaultChecked={query.brand === brand.slug}
                  />
                  {plainText(brand.name)} <span>({brand.count})</span>
                </label>
              ))}
            </div>
          </details>
        )}
        <details className="filter-section" open>
          <summary>Customer rating</summary>
          <label className="stock-checkbox">
            <input
              type="radio"
              name="rating"
              value=""
              defaultChecked={!query.rating}
            />
            All ratings
          </label>
          {[5, 4, 3, 2, 1].map((rating) => (
            <label className="stock-checkbox rating-option" key={rating}>
              <input
                type="radio"
                name="rating"
                value={rating}
                defaultChecked={query.rating === String(rating)}
                aria-label={`${rating} stars & up`}
              />
              <span aria-hidden="true" className="rating-stars">
                {"★".repeat(rating)}
                {"☆".repeat(5 - rating)}
              </span>
              <span>& up</span>
            </label>
          ))}
        </details>
        <button className="button primary" type="submit">
          Apply filters
        </button>
        <a className="filter-clear" href={path}>
          Clear all filters
        </a>
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
