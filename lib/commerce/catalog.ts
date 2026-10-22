import "server-only";
import { cache } from "react";
import { wordpressGet } from "@/lib/wordpress/client";
import { plainText } from "@/lib/wordpress/text";
export type Category = {
  id: number;
  name: string;
  slug: string;
  count: number;
  description: string;
};
export type Product = {
  id: number;
  slug: string;
  name: string;
  type: string;
  sku: string;
  description: string;
  short_description: string;
  is_in_stock: boolean;
  images: { id: number; src: string; alt: string }[];
  categories: Category[];
  attributes?: { name: string; terms: { name: string }[] }[];
  prices: {
    price: string;
    currency_code: string;
    currency_minor_unit: number;
    price_range: { min_amount: string; max_amount: string } | null;
  };
};
export const getProduct = cache(async (slug: string) => {
  const { data } = await wordpressGet<Product[]>(
    "/wp-json/wc/store/v1/products",
    { slug, per_page: 1 },
  );
  return data[0] ?? null;
});
export async function getProducts(
  query: {
    search?: string;
    category?: number;
    page?: number;
    per_page?: number;
  } = {},
) {
  return wordpressGet<Product[]>("/wp-json/wc/store/v1/products", {
    per_page: 12,
    page: 1,
    ...query,
  });
}
export const getCategories = cache(async () => {
  const items: Category[] = [];
  for (let page = 1; ; page++) {
    const result = await wordpressGet<Category[]>(
      "/wp-json/wc/store/v1/products/categories",
      { per_page: 100, page, hide_empty: "true" },
    );
    items.push(...result.data);
    if (page >= result.pages) return items;
  }
});
export function productName(product: Product) {
  return plainText(product.name);
}
export function productPrice(product: Product) {
  const { price, currency_code, currency_minor_unit, price_range } =
    product.prices;
  if (!price || !currency_code) return null;
  const format = (value: string) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency_code,
    }).format(Number(value) / 10 ** currency_minor_unit);
  return price_range
    ? `${format(price_range.min_amount)} – ${format(price_range.max_amount)}`
    : format(price);
}
