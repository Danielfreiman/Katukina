"use client";

import { plainText } from "@/lib/wordpress/text";
import type { Cart, CommerceConfig } from "./types";

// Share only requests currently in flight in this browser. Never retain a cart
// or configuration across visits, identities, currencies or destinations.
const reads = new Map<string, Promise<unknown>>();
export function invalidateCommerceReads() {
  reads.clear();
}

export async function loadCheckoutContext(): Promise<[Cart, CommerceConfig]> {
  const cart = await commerceRequest<Cart>("cart");
  // Both values are resolved in the same authoritative WooCommerce request.
  // The fallback supports a frontend deployed before the backend extension.
  const config =
    cart.extensions?.katukina?.checkout_config ??
    (await commerceRequest<CommerceConfig>("config"));
  return [cart, config];
}

export function commerceRequest<T>(action: string, body?: unknown): Promise<T> {
  const read = body === undefined;
  if (read && reads.has(action)) return reads.get(action) as Promise<T>;
  // A read started before a mutation must not be reused for reconciliation.
  if (!read) reads.clear();
  const request = (async () => {
    const response = await fetch(`/api/commerce/${action}`, {
      method: read ? "GET" : "POST",
      headers: read ? {} : { "Content-Type": "application/json" },
      ...(!read ? { body: JSON.stringify(body) } : {}),
      cache: "no-store",
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(
        plainText(data.message || "The shop could not complete this request."),
      );
    if (Array.isArray(data.items))
      data.items = data.items.map((item: { name: string }) => ({
        ...item,
        name: plainText(item.name),
      }));
    return data as T;
  })();
  if (read) reads.set(action, request);
  // Clear on either outcome, without creating an unhandled rejected promise.
  const clear = () => {
    if (reads.get(action) === request) reads.delete(action);
    if (!read) reads.clear();
  };
  void request.then(clear, clear);
  return request;
}
