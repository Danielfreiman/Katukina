export type Money = {
  currency_code: string;
  currency_minor_unit: number;
  total_items: string;
  total_discount: string;
  total_shipping: string;
  total_tax: string;
  total_price: string;
};
export type CartItem = {
  key: string;
  id: number;
  name: string;
  quantity: number;
  quantity_limits: { minimum: number; maximum: number };
  images: { src: string; alt: string }[];
  totals: {
    line_total: string;
    currency_code: string;
    currency_minor_unit: number;
  };
};
export type Cart = {
  items: CartItem[];
  items_count: number;
  coupons: { code: string }[];
  totals: Money;
  needs_shipping: boolean;
  shipping_rates: {
    package_id: number;
    shipping_rates: {
      rate_id: string;
      name: string;
      price: string;
      selected: boolean;
      currency_code: string;
      currency_minor_unit: number;
    }[];
  }[];
  shipping_address: Address;
  billing_address: Address;
  errors: { message: string }[];
};
export type Address = {
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
};
export type CommerceConfig = {
  local_checkout: boolean;
  countries: Record<string, string>;
  currency: string;
  payment_method: string | null;
  notices: Record<
    string,
    {
      id: number;
      version: number;
      note: string;
      warning: string;
      requires_acceptance: boolean;
    }
  >;
};
export function formatMoney(
  amount: string,
  currency: string,
  precision: number,
) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(
    Number(amount) / 10 ** precision,
  );
}
