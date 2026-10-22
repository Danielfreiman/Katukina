import { expect, test, type Route } from "@playwright/test";
import type { Address, Cart, CommerceConfig } from "../lib/commerce/types";

test("checkout preserves entered details when an older startup response arrives", async ({ page }) => {
  const emptyAddress: Address = {
    first_name: "", last_name: "", address_1: "", city: "", state: "",
    postcode: "", country: "GB", email: "",
  };
  const config: CommerceConfig = {
    local_checkout: true, countries: { GB: "United Kingdom" }, currency: "USD",
    payment_method: "katukina_local_test", notices: {},
  };
  const cart: Cart = {
    items: [{ key: "fixture", id: 1, name: "Local fixture", quantity: 1,
      quantity_limits: { minimum: 1, maximum: 10 }, images: [],
      totals: { line_total: "1000", currency_code: "USD", currency_minor_unit: 2 } }],
    items_count: 1, coupons: [], needs_shipping: false, shipping_rates: [], errors: [],
    shipping_address: emptyAddress, billing_address: emptyAddress,
    totals: { currency_code: "USD", currency_minor_unit: 2, total_items: "1000",
      total_discount: "0", total_shipping: "0", total_tax: "0", total_price: "1000" },
  };
  let firstConfig: Route | undefined;
  let configRequests = 0;
  let submitted: { shipping_address: Address; billing_address: Address } | undefined;
  await page.route("**/api/commerce/*", async (route) => {
    const action = new URL(route.request().url()).pathname.split("/").pop();
    if (action === "config") {
      configRequests++;
      // Hold the abandoned Strict Mode request until the customer has typed.
      if (configRequests === 1) { firstConfig = route; return; }
      await route.fulfill({ json: config });
    } else if (action === "cart") {
      await route.fulfill({ json: cart });
    } else if (action === "address") {
      submitted = route.request().postDataJSON();
      await route.fulfill({ json: cart });
    } else {
      await route.fulfill({ status: 400, json: { message: "Unexpected test operation" } });
    }
  });
  await page.goto("/checkout");
  await expect.poll(() => configRequests).toBeGreaterThan(0);
  // Production has a single effect execution. It must also preserve the form,
  // while development exercises the out-of-order Strict Mode responses.
  let replayed = true;
  try {
    await expect.poll(() => configRequests, { timeout: 1500 }).toBeGreaterThan(1);
  } catch {
    replayed = false;
    await firstConfig!.fulfill({ json: config });
  }
  await expect(page.getByRole("heading", { name: "Contact and delivery" })).toBeVisible();
  const details = {
    Email: "checkout-regression@example.invalid", "First name": "Local", "Last name": "Test",
    "Street address": "1 Test Street", City: "London", Postcode: "SW1A 1AA",
  };
  for (const [label, value] of Object.entries(details)) {
    await page.getByLabel(label, { exact: true }).fill(value);
  }
  if (replayed) {
    const response = page.waitForResponse((r) => new URL(r.url()).pathname === "/api/commerce/config");
    await firstConfig!.fulfill({ json: config });
    await (await response).finished();
    await page.evaluate(() => new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    }));
  }
  for (const [label, value] of Object.entries(details)) {
    await expect(page.getByLabel(label, { exact: true })).toHaveValue(value);
  }
  await page.getByRole("button", { name: "Review address and totals", exact: true }).click();
  await expect(page.getByRole("button", { name: "Place local test order — no payment" })).toBeEnabled();
  expect(submitted?.billing_address.email).toBe(details.Email);
  expect(submitted?.shipping_address).toMatchObject({
    first_name: "Local", last_name: "Test", address_1: "1 Test Street", city: "London", postcode: "SW1A 1AA",
  });
});
