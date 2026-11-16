import { plainText } from "@/lib/wordpress/text";

export type ProductImage = {
  id: number;
  src: string;
  alt: string;
  thumbnail?: string;
  srcset?: string;
};
export type Category = {
  id: number;
  name: string;
  slug: string;
  count: number;
  description: string;
  parent: number;
  image?: ProductImage | null;
};
export type Product = {
  id: number;
  parent?: number;
  slug: string;
  name: string;
  type: string;
  sku: string;
  description: string;
  short_description: string;
  is_in_stock: boolean;
  is_purchasable?: boolean;
  is_on_backorder?: boolean;
  sold_individually?: boolean;
  on_sale?: boolean;
  average_rating?: string;
  review_count?: number;
  images: ProductImage[];
  categories: Category[];
  attributes?: {
    name: string;
    has_variations?: boolean;
    terms: { name: string }[];
  }[];
  variations?: { id: number; attributes: { name: string; value: string }[] }[];
  add_to_cart?: { minimum: number; maximum: number; multiple_of: number };
  prices: {
    price: string;
    regular_price?: string;
    currency_code: string;
    currency_minor_unit: number;
    price_range: { min_amount: string; max_amount: string } | null;
  };
};
export type PresentationChoice = {
  attribute: string;
  label: string;
  options: string[];
};
export type ProductVariation = Product & {
  optionLabel: string;
  choices?: PresentationChoice[];
};

export function productName(product: Product) {
  return plainText(product.name);
}
export function formatPrice(
  value: string,
  currency: string,
  precision: number,
) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(
    Number(value) / 10 ** precision,
  );
}
export function productPrice(product: Product) {
  const { price, currency_code, currency_minor_unit, price_range } =
    product.prices;
  if (!price || !currency_code) return null;
  const format = (value: string) =>
    formatPrice(value, currency_code, currency_minor_unit);
  return price_range && price_range.min_amount !== price_range.max_amount
    ? `${format(price_range.min_amount)} – ${format(price_range.max_amount)}`
    : format(price);
}
export function canPurchase(product: Product) {
  return (
    product.is_in_stock &&
    product.is_purchasable !== false &&
    !!product.prices.price
  );
}
export function quantityLimits(product: Product) {
  return {
    min: product.add_to_cart?.minimum ?? 1,
    max: product.sold_individually ? 1 : (product.add_to_cart?.maximum ?? 9999),
    step: product.add_to_cart?.multiple_of ?? 1,
  };
}
export function categoryTrail(
  category: Category | undefined,
  categories: Category[],
) {
  const trail: Category[] = [];
  const seen = new Set<number>();
  while (category && !seen.has(category.id)) {
    trail.unshift(category);
    seen.add(category.id);
    category = categories.find((item) => item.id === category!.parent);
  }
  return trail;
}
