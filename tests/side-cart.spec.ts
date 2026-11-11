import { test, expect } from "@playwright/test";

test("side cart opens the real session and supports Escape, focus and mobile", async ({
  page,
}) => {
  await page.goto("/shop");
  await page
    .getByRole("button", { name: "Reject optional", exact: true })
    .click();
  const trigger = page.getByRole("button", { name: "Your bag", exact: true });
  const drawer = page.getByRole("dialog", { name: "Your bag", exact: true });
  await trigger.click();
  await expect(drawer).toBeVisible();
  await expect(drawer.locator(".side-cart-body")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  await expect(drawer.getByRole("alert")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(drawer).not.toBeVisible();
  await expect(trigger).toBeFocused();
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await trigger.click();
    await expect(drawer).toBeVisible();
    await expect
      .poll(async () => {
        const box = await drawer.boundingBox();
        return box!.x + box!.width;
      })
      .toBeLessThanOrEqual(width);
    const bounds = await drawer.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    await page.screenshot({ path: `artifacts/side-cart-${width}.png` });
    await drawer.getByRole("button", { name: "Close bag" }).click();
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await trigger.click();
  await page.mouse.click(10, 300);
  await expect(drawer).not.toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.body.style.overflow))
    .not.toBe("hidden");
});

test("side cart serializes mutations, reconciles failures and uses authoritative totals", async ({
  page,
}) => {
  let quantity = 1;
  let fail = false;
  let writes = 0;
  const cart = () => ({
    items_count: quantity,
    items: quantity
      ? [
          {
            key: "test-line",
            id: 99,
            name: "Palo Santo beads",
            quantity,
            quantity_limits: { minimum: 1, maximum: 3, multiple_of: 1 },
            images: [{ src: "/images/palo-santo.jpg", alt: "Palo Santo" }],
            totals: {
              line_total: String(quantity * 1335),
              currency_code: "USD",
              currency_minor_unit: 2,
            },
          },
        ]
      : [],
    totals: {
      currency_code: "USD",
      currency_minor_unit: 2,
      total_items: String(quantity * 1335),
      total_discount: "0",
      total_shipping: "0",
      total_tax: "0",
      total_price: String(quantity * 1335),
    },
    needs_shipping: true,
    shipping_rates: [],
    shipping_address: {},
    billing_address: {},
    coupons: [],
    errors: [],
  });
  await page.route("**/api/commerce/cart", (route) =>
    route.fulfill({ json: cart() }),
  );
  await page.route("**/api/commerce/update", async (route) => {
    writes++;
    const body = route.request().postDataJSON();
    expect(body.key).toBe("test-line");
    quantity = body.quantity;
    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.fulfill(
      fail
        ? { status: 502, json: { message: "Update response was lost." } }
        : { json: cart() },
    );
  });
  await page.route("**/api/commerce/remove", async (route) => {
    expect(route.request().postDataJSON()).toEqual({ key: "test-line" });
    quantity = 0;
    await route.fulfill({ json: cart() });
  });
  await page.goto("/shop");
  await page
    .getByRole("button", { name: "Reject optional", exact: true })
    .click();
  await page.evaluate(() =>
    window.dispatchEvent(new Event("katukina-cart-open")),
  );
  const drawer = page.getByRole("dialog", { name: "Your bag", exact: true });
  await expect(
    drawer.getByLabel("Quantity of Palo Santo beads", { exact: true }),
  ).toHaveText("1");
  await expect(
    drawer.getByRole("button", { name: "Decrease Palo Santo beads" }),
  ).toBeDisabled();
  const increase = drawer.getByRole("button", {
    name: "Increase Palo Santo beads",
  });
  await increase.click();
  await expect(increase).toBeDisabled();
  await expect(
    drawer.getByLabel("Quantity of Palo Santo beads", { exact: true }),
  ).toHaveText("2");
  await expect(drawer.locator(".commerce-grand-total")).toContainText("26.70");
  expect(writes).toBe(1);
  await page.screenshot({ path: "artifacts/side-cart-items.png" });
  fail = true;
  await increase.click();
  await expect(drawer.getByRole("alert")).toContainText(
    "Update response was lost.",
  );
  await expect(
    drawer.getByLabel("Quantity of Palo Santo beads", { exact: true }),
  ).toHaveText("3");
  expect(writes).toBe(2);
  await expect(increase).toBeDisabled();
  await expect(
    drawer.getByRole("link", { name: "Review and checkout" }),
  ).toHaveAttribute("href", "/checkout");
  await drawer.getByRole("button", { name: "Remove Palo Santo beads" }).click();
  await expect(
    drawer.getByRole("heading", { name: "Your bag is empty." }),
  ).toBeVisible();
  await expect(
    drawer.getByRole("link", { name: "Review and checkout" }),
  ).toHaveCount(0);
});
