export type SearchParams = Record<string, string | string[] | undefined>;
export const sortOptions = {
  "name-asc": "Name: A–Z",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  newest: "Newest arrivals",
  popular: "Best sellers",
  rating: "Top rated",
} as const;
export type CatalogQuery = {
  q: string;
  category: string;
  min_price: string;
  max_price: string;
  stock: string;
  sale: string;
  rating: string;
  brand: string;
  per_page: number;
  sort: keyof typeof sortOptions;
  page: number;
};
export const singleParam = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : "";
// Decimal string conversion avoids floating point multiplication (e.g. 1.13 * 100).
export function minorAmount(
  value: string,
  precision: number,
): string | undefined {
  if (!/^\d{1,7}(\.\d{1,6})?$/.test(value) || precision < 0 || precision > 6)
    return;
  const [whole, fraction = ""] = value.split(".");
  if (fraction.length > precision) return;
  return (
    BigInt(whole) * BigInt(10) ** BigInt(precision) +
    BigInt(fraction.padEnd(precision, "0") || "0")
  ).toString();
}
export function parseCatalogQuery(params: SearchParams, precision = 2) {
  const errors: string[] = [];
  const price = (name: "min_price" | "max_price") => {
    const raw = singleParam(params[name]).trim();
    if (raw && minorAmount(raw, precision) === undefined) {
      errors.push("Enter valid non-negative prices for this currency.");
      return "";
    }
    return raw;
  };
  let min_price = price("min_price"),
    max_price = price("max_price");
  if (
    min_price &&
    max_price &&
    BigInt(minorAmount(min_price, precision)!) >
      BigInt(minorAmount(max_price, precision)!)
  ) {
    errors.push("Minimum price cannot exceed maximum price.");
    min_price = "";
    max_price = "";
  }
  const rawSort = singleParam(params.sort);
  const page = singleParam(params.page);
  const query: CatalogQuery = {
    q: singleParam(params.q).trim().slice(0, 100),
    category: singleParam(params.category).slice(0, 200),
    min_price,
    max_price,
    stock: singleParam(params.stock) === "instock" ? "instock" : "",
    sale: singleParam(params.sale) === "yes" ? "yes" : "",
    rating: /^[1-5]$/.test(singleParam(params.rating))
      ? singleParam(params.rating)
      : "",
    brand: singleParam(params.brand).slice(0, 200),
    per_page: [12, 24, 48].includes(Number(singleParam(params.per_page)))
      ? Number(singleParam(params.per_page))
      : 12,
    sort: Object.hasOwn(sortOptions, rawSort)
      ? (rawSort as CatalogQuery["sort"])
      : "name-asc",
    page: /^\d+$/.test(page) ? Math.max(1, Math.min(10000, Number(page))) : 1,
  };
  return { query, errors: [...new Set(errors)] };
}
export function catalogHref(
  path: string,
  query: CatalogQuery,
  changes: Partial<CatalogQuery> = {},
) {
  const result = { ...query, ...changes };
  const params = new URLSearchParams();
  for (const key of [
    "q",
    "category",
    "min_price",
    "max_price",
    "stock",
    "sale",
    "rating",
    "brand",
    "per_page",
    "sort",
    "page",
  ] as const) {
    const value = result[key];
    if (
      value &&
      !(key === "page" && value === 1) &&
      !(key === "per_page" && value === 12) &&
      !(key === "sort" && value === "name-asc")
    )
      params.set(key, String(value));
  }
  return path + (params.size ? `?${params}` : "");
}
export function catalogApiQuery(
  query: CatalogQuery,
  precision: number,
  category?: number,
) {
  const sort = {
    "name-asc": { orderby: "title", order: "asc" },
    "price-asc": { orderby: "price", order: "asc" },
    "price-desc": { orderby: "price", order: "desc" },
    newest: { orderby: "date", order: "desc" },
    popular: { orderby: "popularity", order: "desc" },
    rating: { orderby: "rating", order: "desc" },
  }[query.sort];
  return {
    ...sort,
    ...(query.q ? { search: query.q } : {}),
    ...(category ? { category } : {}),
    ...(query.min_price
      ? { min_price: minorAmount(query.min_price, precision)! }
      : {}),
    ...(query.max_price
      ? { max_price: minorAmount(query.max_price, precision)! }
      : {}),
    ...(query.stock ? { "stock_status[0]": query.stock } : {}),
    ...(query.sale ? { on_sale: "true" } : {}),
    ...(query.rating
      ? {
          rating: Array.from(
            { length: 6 - Number(query.rating) },
            (_, index) => Number(query.rating) + index,
          ).join(","),
        }
      : {}),
    ...(query.brand ? { brand: query.brand } : {}),
  };
}
