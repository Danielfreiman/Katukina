import "server-only";
import { cache } from "react";
import { wordpressGet } from "@/lib/wordpress/client";
import { plainText } from "@/lib/wordpress/text";
import type {
  Category,
  Product,
  ProductVariation,
  PresentationChoice,
} from "./product";
export { productName, productPrice } from "./product";
export type { Category, Product } from "./product";
export type Presentation = {
  id: number;
  label: string;
  price: string;
  currency: string;
  available: boolean;
  choices: PresentationChoice[];
};
export async function getPresentations(id: number) {
  return (
    await wordpressGet<Presentation[]>(
      `/wp-json/katukina/v1/commerce/products/${id}/presentations`,
    )
  ).data;
}
export const getProduct = cache(async (slug: string) => {
  const { data } = await wordpressGet<Product[]>(
    "/wp-json/wc/store/v1/products",
    { slug, per_page: 1 },
  );
  return data[0] ?? null;
});
export async function getProducts(query: Record<string, string | number> = {}) {
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
      { per_page: 100, page, hide_empty: "false" },
    );
    items.push(...result.data);
    if (result.pages ? page >= result.pages : result.data.length < 100)
      return items;
  }
});
export type Brand = { id: number; name: string; slug: string; count: number };
export const getBrands = cache(async () => {
  const items: Brand[] = [];
  for (let page = 1; ; page++) {
    const result = await wordpressGet<Brand[]>(
      "/wp-json/wc/store/v1/products/brands",
      { per_page: 100, page, hide_empty: "true" },
    );
    items.push(...result.data);
    if (result.pages ? page >= result.pages : result.data.length < 100)
      return items;
  }
});
export type CollectionData = {
  price_range: {
    min_price: string;
    max_price: string;
    currency_code: string;
    currency_minor_unit: number;
  } | null;
  stock_status_counts: { status: string; count: number | string }[] | null;
};
export async function getCollectionData(
  query: Record<string, string | number> = {},
) {
  const { data } = await wordpressGet<CollectionData>(
    "/wp-json/wc/store/v1/products/collection-data",
    {
      ...query,
      calculate_price_range: "true",
      calculate_stock_status_counts: "true",
    },
  );
  return data;
}
export async function getVariations(
  product: Product,
): Promise<ProductVariation[]> {
  if (product.type !== "variable") return [];
  const children: Product[] = [];
  for (let page = 1; ; page++) {
    const result = await getProducts({
      type: "variation",
      parent: product.id,
      per_page: 100,
      page,
    });
    children.push(...result.data);
    if (page >= result.pages) break;
  }
  const presentations = (product.variations ?? []).some((option) =>
    option.attributes.some((attribute) => !attribute.value),
  )
    ? await getPresentations(product.id)
    : [];
  return (product.variations ?? []).flatMap((option) => {
    const child = children.find(
      (item) => item.id === option.id && item.parent === product.id,
    );
    const wildcard = option.attributes.some((attribute) => !attribute.value);
    const presentation = presentations.find((item) => item.id === option.id);
    if (
      !child ||
      !option.attributes.length ||
      (wildcard && !presentation?.choices.length)
    )
      return [];
    return [
      {
        ...child,
        choices: wildcard ? presentation!.choices : [],
        optionLabel: wildcard
          ? plainText(presentation!.label)
          : option.attributes
              .map(
                (attribute) =>
                  `${option.attributes.length > 1 ? `${plainText(attribute.name)}: ` : ""}${plainText(attribute.value)}`,
              )
              .join(" / "),
      },
    ];
  });
}
