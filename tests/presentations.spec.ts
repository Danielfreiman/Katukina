import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

test("native variation selection, destination preference and currency guard reach the cart", async ({
  page,
}) => {
  test.setTimeout(240000);
  page.setDefaultTimeout(30000);
  const access = JSON.parse(
    readFileSync("wordpress/.local-access.json", "utf8"),
  );
  await page.goto("/wp-admin/");
  await page.locator("#user_login").fill(access.username);
  await page.locator("#user_pass").fill(access.password);
  await Promise.all([
    page.waitForURL(/\/wp-admin\//, { timeout: 30000 }),
    page.locator("#wp-submit").click(),
  ]);
  const nonce = await page.evaluate(
    () =>
      (window as unknown as { wpApiSettings: { nonce: string } }).wpApiSettings
        .nonce,
  );
  const headers = { "X-WP-Nonce": nonce };
  const suffix = Date.now();
  let parentId = 0;
  try {
    const created = await page.request.post("/wp-json/wc/v3/products", {
      headers,
      data: {
        name: `Presentation test ${suffix}`,
        slug: `presentation-${suffix}`,
        type: "variable",
        status: "publish",
        attributes: [
          { name: "Size", visible: true, variation: true, options: ["10g"] },
          {
            name: "Finish",
            visible: true,
            variation: true,
            options: ["Raw", "Roasted"],
          },
        ],
      },
    });
    expect(created.status(), await created.text()).toBe(201);
    parentId = (await created.json()).id;
    const variation = await page.request.post(
      `/wp-json/wc/v3/products/${parentId}/variations`,
      {
        headers,
        data: {
          regular_price: "13.50",
          status: "publish",
          attributes: [
            { name: "Size", option: "10g" },
            { name: "Finish", option: "" },
          ],
          manage_stock: true,
          stock_quantity: 3,
        },
      },
    );
    expect(variation.status(), await variation.text()).toBe(201);
    const variant = await variation.json();
    await page.goto(`/products/presentation-${suffix}`);
    await page.getByLabel("Shopping destination").selectOption("GB");
    await expect(page.getByLabel("Shopping destination")).toBeEnabled({
      timeout: 30000,
    });
    expect(
      (await page.context().cookies()).find(
        (cookie) => cookie.name === "katukina_destination",
      )?.value,
    ).toBe("GB");
    const presentation = page.locator(
      `input[name="presentation"][value="${variant.id}"]`,
    );
    await presentation.check();
    await expect(presentation).toBeChecked();
    await expect(
      page.getByRole("button", { name: "Choose a presentation", exact: true }),
    ).toBeDisabled();
    await page
      .getByRole("combobox", { name: "Finish", exact: true })
      .selectOption("Raw");
    await page.getByRole("button", { name: "Add to bag", exact: true }).click();
    await expect(
      page.locator(".purchase-actions").getByRole("status"),
    ).toContainText("Added to your bag.", {
      timeout: 30000,
    });
    const cart = await (await page.request.get("/api/commerce/cart")).json();
    expect(cart.items[0].id).toBe(variant.id);
    expect(cart.items[0].totals.line_total).toBe("1350");
    expect(
      cart.extensions.katukina.payment_options.some(
        (method: { id: string }) => method.id === "katukina_local_test",
      ),
    ).toBe(true);
    const currency = await page.request.post("/api/commerce/currency", {
      headers: { Origin: "http://localhost:3001" },
      data: { currency: "EUR" },
    });
    expect(currency.status()).toBe(409);
    await page.request.post("/api/commerce/remove", {
      headers: { Origin: "http://localhost:3001" },
      data: { key: cart.items[0].key },
    });
    await page.screenshot({
      path: "artifacts/variation-purchase-preview.png",
      fullPage: true,
    });
  } finally {
    if (parentId)
      await page.request.delete(
        `/wp-json/wc/v3/products/${parentId}?force=true`,
        { headers },
      );
  }
});
