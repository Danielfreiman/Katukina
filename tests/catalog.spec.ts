import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import {
  minorAmount,
  parseCatalogQuery,
  catalogApiQuery,
  catalogHref,
} from "../lib/commerce/catalog-query";

test("catalog query validates money, repeated input and navigation", () => {
  expect(minorAmount("1.13", 2)).toBe("113");
  expect(minorAmount("0.001", 3)).toBe("1");
  expect(minorAmount("12.50", 0)).toBeUndefined();
  expect(minorAmount("-1", 2)).toBeUndefined();
  expect(minorAmount("1e3", 2)).toBeUndefined();
  const { query, errors } = parseCatalogQuery({
    q: ["one", "two"],
    min_price: "20",
    max_price: "5",
    page: "-1",
    sort: "unknown",
  });
  expect(query).toMatchObject({
    q: "",
    min_price: "",
    max_price: "",
    page: 1,
    sort: "name-asc",
  });
  expect(errors).toHaveLength(1);
  const extended = parseCatalogQuery({
    sale: "yes",
    rating: "4",
    brand: "herbs",
    sort: "popular",
    per_page: "48",
  }).query;
  expect(catalogApiQuery(extended, 2)).toEqual({
    on_sale: "true",
    rating: "4,5",
    brand: "herbs",
    orderby: "popularity",
    order: "desc",
  });
  expect(catalogHref("/shop", extended)).toContain("per_page=48");
  expect(
    parseCatalogQuery({ per_page: "999", rating: "9", sale: "malformed" })
      .query,
  ).toMatchObject({ per_page: 12, rating: "", sale: "" });
  const valid = parseCatalogQuery({
    q: "tea",
    min_price: "1.13",
    stock: "instock",
    sort: "price-desc",
    page: "3",
  }).query;
  expect(catalogApiQuery(valid, 2, 8)).toEqual({
    search: "tea",
    min_price: "113",
    "stock_status[0]": "instock",
    orderby: "price",
    order: "desc",
    category: 8,
  });
  expect(catalogHref("/shop", valid, { page: 1 })).toBe(
    "/shop?q=tea&min_price=1.13&stock=instock&sort=price-desc",
  );
});

test("catalog filters, pagination and responsive controls use the public API", async ({
  page,
  request,
}) => {
  test.setTimeout(150000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/shop?sort=price-asc");
  await page
    .getByRole("button", { name: "Accept optional", exact: true })
    .click();
  const categoryNav = page
    .locator(".catalog-sidebar")
    .getByRole("navigation", { name: "Browse categories" });
  await expect(
    categoryNav.getByRole("link", { name: "All products", exact: true }),
  ).toBeVisible();
  await expect(page.locator("select[name=category]")).toHaveCount(0);
  const more = categoryNav.getByRole("button", { name: /more categories/ });
  if (await more.count()) {
    await more.click();
    await expect(
      categoryNav.getByRole("button", { name: "Show fewer categories" }),
    ).toHaveAttribute("aria-expanded", "true");
  }

  const response = await request.get(
    "/wp-json/wc/store/v1/products?orderby=price&order=asc&per_page=12",
  );
  const products = await response.json();
  expect(
    await page
      .locator(".catalog-results [data-product-id]")
      .evaluateAll((nodes) =>
        nodes.map((node) => Number(node.getAttribute("data-product-id"))),
      ),
  ).toEqual(products.map((product: { id: number }) => product.id));
  const next = page.getByRole("link", { name: "Next page", exact: true });
  if (await next.count()) {
    await next.click();
    await expect(page).toHaveURL(/page=2/, { timeout: 20000 });
    await expect(page.locator("#catalog-sort")).toHaveValue("price-asc");
    await page.goBack();
    await expect(page).not.toHaveURL(/page=2/);
  }
  for (const width of [1440, 768, 390, 360]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `width ${width}`,
    ).toBe(true);
  }
  await page.getByRole("button", { name: "Filters", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Filter products" });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Min", { exact: true }).fill("1");
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Filters", exact: true }),
  ).toBeFocused();
  await expect(page).not.toHaveURL(/min_price/);
  await page.getByRole("button", { name: "Filters", exact: true }).click();
  await dialog
    .getByLabel("Search products", { exact: true })
    .fill("katukina-no-results");
  await dialog.getByRole("button", { name: "Apply filters" }).click();
  await expect(page).toHaveURL(/q=katukina-no-results/);
  await expect(page.getByText("No discoveries here just yet.")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Remove Search:/ }),
  ).toBeVisible();
  await page.goto("/shop?min_price=100&max_price=2");
  await expect(page.locator(".catalog-results [role=alert]")).toContainText(
    "Minimum price cannot exceed",
  );
  await page.goto("/shop?per_page=24&sort=newest");
  const newestResponse = await request.get(
    "/wp-json/wc/store/v1/products?orderby=date&order=desc&per_page=24",
  );
  expect(newestResponse.ok()).toBe(true);
  const newest = await newestResponse.json();
  await expect(page.locator(".catalog-results [data-product-id]")).toHaveCount(
    newest.length,
  );
  expect(
    await page
      .locator(".catalog-results [data-product-id]")
      .evaluateAll((nodes) =>
        nodes.map((node) => Number(node.getAttribute("data-product-id"))),
      ),
  ).toEqual(newest.map((product: { id: number }) => product.id));
  await expect(page.getByLabel("Show", { exact: true })).toHaveValue("24");
  await page.goto("/shop?page=9999");
  await expect(page).not.toHaveURL(/page=9999/);
  const missingMedia = await request.get(
    "/wp-content/uploads/catalog-definitely-missing.jpg",
    { maxRedirects: 0 },
  );
  expect(missingMedia.status()).toBe(404);
  // Media failures must show a stable placeholder, without removing product navigation.
  if (products[0]?.images.length) {
    await page.route("**/wp-content/uploads/**", (route) =>
      route.fulfill({ status: 404, body: "Missing test image" }),
    );
    await page.goto(`/products/${products[0].slug}`);
    await expect(
      page.locator(".gallery-main .catalog-image-placeholder"),
    ).toBeVisible();
    await page.unroute("**/wp-content/uploads/**");
  }
  await page.goto("/shop");
  const recent = page.getByRole("region", { name: "Recently viewed products" });
  if (products[0]?.images.length) {
    await expect(
      recent.locator(`[data-product-id="${products[0].id}"]`),
    ).toBeVisible();
    await recent.getByRole("button", { name: "Clear history" }).click();
    await expect(recent).toHaveCount(0);
    expect(
      await page.evaluate(() =>
        localStorage.getItem("katukina:recent-products:v2"),
      ),
    ).toBeNull();
  }
  expect(errors).toEqual([]);
});

test("native variations, gallery, real cart validation and uncertain responses", async ({
  page,
  browser,
}) => {
  test.setTimeout(240000);
  const access = JSON.parse(
    readFileSync("wordpress/.local-access.json", "utf8"),
  );
  await page.goto("/wp-admin/");
  await page.locator("#user_login").fill(access.username);
  await page.locator("#user_pass").fill(access.password);
  await Promise.all([
    page.waitForURL(/\/wp-admin\//),
    page.locator("#wp-submit").click(),
  ]);
  const nonce = await page.evaluate(
    () =>
      (window as unknown as { wpApiSettings: { nonce: string } }).wpApiSettings
        .nonce,
  );
  const headers = { "X-WP-Nonce": nonce };
  const api = "/wp-json/wc/v3/products";
  const suffix = Date.now();
  const slug = `catalog-fixture-${suffix}`;
  const productIds: number[] = [];
  const categoryIds: number[] = [];
  const context = await browser.newContext({
    baseURL: "http://localhost:3001",
    viewport: { width: 1440, height: 1000 },
  });
  const customer = await context.newPage();
  const purchase = customer.getByRole("region", { name: "Product options" });
  const errors: string[] = [];
  customer.on("pageerror", (error) => errors.push(error.message));
  async function create(path: string, data: object) {
    const result = await page.request.post(path, { headers, data });
    expect(result.status(), await result.text()).toBe(201);
    return result.json();
  }
  try {
    const root = await create(`${api}/categories`, {
      name: `Catalog test ${suffix}`,
      slug,
    });
    categoryIds.push(root.id);
    const child = await create(`${api}/categories`, {
      name: `Presentations ${suffix}`,
      slug: `${slug}-child`,
      parent: root.id,
    });
    categoryIds.push(child.id);
    const mediaProducts = await (
      await page.request.get("/wp-json/wc/store/v1/products?per_page=30")
    ).json();
    const photoIds = [
      ...new Set<number>(
        mediaProducts.flatMap((product: { images: { id: number }[] }) =>
          product.images.map((image) => image.id),
        ),
      ),
    ].slice(0, 2);
    const parent = await create(api, {
      name: `Variation fixture ${suffix}`,
      slug,
      type: "variable",
      status: "publish",
      categories: [{ id: child.id }],
      images: photoIds.map((id) => ({ id })),
      attributes: [
        {
          name: "Presentation",
          visible: true,
          variation: true,
          options: ["Small", "Large", "Refill", "Draft"],
        },
      ],
    });
    productIds.push(parent.id);
    const small = await create(`${api}/${parent.id}/variations`, {
      regular_price: "7.25",
      sku: `${slug}-small`,
      manage_stock: true,
      stock_quantity: 5,
      attributes: [{ name: "Presentation", option: "Small" }],
      ...(photoIds[1] ? { image: { id: photoIds[1] } } : {}),
    });
    const large = await create(`${api}/${parent.id}/variations`, {
      regular_price: "12.50",
      manage_stock: true,
      stock_quantity: 0,
      attributes: [{ name: "Presentation", option: "Large" }],
    });
    const refill = await create(`${api}/${parent.id}/variations`, {
      regular_price: "9.50",
      manage_stock: true,
      stock_quantity: 3,
      attributes: [{ name: "Presentation", option: "Refill" }],
    });
    await create(`${api}/${parent.id}/variations`, {
      status: "private",
      regular_price: "1.00",
      attributes: [{ name: "Presentation", option: "Draft" }],
    });
    const simple = await create(api, {
      name: `Simple fixture ${suffix}`,
      slug: `${slug}-simple`,
      type: "simple",
      regular_price: "15.00",
      sale_price: "12.00",
      status: "publish",
      categories: [{ id: child.id }],
      manage_stock: true,
      stock_quantity: 4,
    });
    productIds.push(simple.id);
    await customer.goto(`/collections/${slug}`);
    await customer
      .getByRole("button", { name: "Reject optional", exact: true })
      .click();
    await expect(
      customer
        .getByRole("navigation", { name: "Browse categories" })
        .getByText(child.name),
    ).toBeVisible();
    await customer.goto(
      `/collections/${child.slug}?min_price=7&max_price=10&stock=instock`,
    );
    await expect(
      customer.locator(".catalog-results [data-product-id]"),
    ).toHaveCount(1);
    await expect(
      customer.locator(".catalog-results [data-product-id]"),
    ).toHaveAttribute("data-product-id", String(parent.id));
    await customer.goto(
      `/collections/${child.slug}?sale=yes&sort=popular&per_page=24`,
    );
    await expect(
      customer.locator(".catalog-results [data-product-id]"),
    ).toHaveCount(1);
    await expect(
      customer.locator(".catalog-results [data-product-id]"),
    ).toHaveAttribute("data-product-id", String(simple.id));
    await expect(
      customer.locator(".catalog-results .product-sale-badge"),
    ).toHaveText("Sale");
    await expect(customer.locator(".catalog-results del")).toContainText(
      "15.00",
    );
    await expect(
      customer.getByRole("link", { name: "Remove On sale" }),
    ).toBeVisible();
    await customer.goto(`/products/${slug}?variation=${simple.id}`);
    const swatches = customer.getByRole("group", {
      name: "Presentation",
      exact: true,
    });
    await expect(swatches.getByRole("radio")).toHaveCount(3);
    await expect(swatches.locator("input:checked")).toHaveCount(0);
    await expect(
      customer.getByRole("button", {
        name: "Choose a presentation",
        exact: true,
      }),
    ).toBeDisabled();
    await swatches.getByRole("radio", { name: "Small", exact: true }).check();
    await swatches.getByRole("radio", { name: "Small", exact: true }).focus();
    await customer.keyboard.press("ArrowRight");
    await expect(
      swatches.getByRole("radio", { name: "Large", exact: true }),
    ).toBeChecked();
    await customer.keyboard.press("ArrowLeft");
    await expect(
      swatches.getByRole("radio", { name: "Small", exact: true }),
    ).toBeChecked();
    await expect(customer.getByTestId("product-price")).toContainText("7.25");
    await expect(customer.locator(".purchase-sku")).toContainText(
      `${slug}-small`,
    );
    if (photoIds[1])
      expect(
        await customer.locator(".gallery-main img").getAttribute("src"),
      ).toBe(small.image.src);
    await customer
      .getByRole("button", { name: "Enlarge product image" })
      .click();
    await expect(customer.getByRole("dialog")).toBeVisible();
    await customer.keyboard.press("Escape");
    await expect(
      customer.getByRole("button", { name: "Enlarge product image" }),
    ).toBeFocused();
    await customer.getByRole("spinbutton", { name: "Quantity" }).fill("99");
    await expect(customer.locator("#quantity-error")).toContainText(
      "Choose a quantity",
    );
    await customer.getByRole("spinbutton", { name: "Quantity" }).fill("2");
    const [submitted] = await Promise.all([
      customer.waitForRequest((r) => r.url().endsWith("/api/commerce/add")),
      purchase.getByRole("button", { name: "Add to bag", exact: true }).click(),
    ]);
    expect(submitted.postDataJSON()).toEqual({
      id: small.id,
      quantity: 2,
    });
    await expect(customer.getByText("Added to your bag.")).toBeVisible();
    let cart = await (await customer.request.get("/api/commerce/cart")).json();
    expect(
      cart.items.find((item: { id: number }) => item.id === small.id)?.quantity,
    ).toBe(2);
    await swatches.getByRole("radio", { name: "Large", exact: true }).check();
    await expect(customer.getByTestId("product-price")).toContainText("12.50");
    await expect(
      customer.getByRole("button", {
        name: "Currently unavailable",
        exact: true,
      }),
    ).toBeDisabled();
    await customer.goBack();
    await expect(
      swatches.getByRole("radio", { name: "Small", exact: true }),
    ).toBeChecked();
    await swatches.getByRole("radio", { name: "Refill", exact: true }).check();
    if (photoIds[0])
      expect(
        await customer.locator(".gallery-main img").getAttribute("src"),
      ).toBe(parent.images[0].src);
    await customer.reload();
    await expect(
      swatches.getByRole("radio", { name: "Refill", exact: true }),
    ).toBeChecked();
    // Change price after page read. The cart must use the authoritative new price.
    expect(
      (
        await page.request.put(`${api}/${parent.id}/variations/${refill.id}`, {
          headers,
          data: { regular_price: "10.75" },
        })
      ).ok(),
    ).toBe(true);
    let additions = 0;
    await customer.route("**/api/commerce/add", async (route) => {
      additions++;
      await route.fetch();
      await route.fulfill({
        status: 502,
        json: { message: "Simulated lost response" },
      });
    });
    await purchase
      .getByRole("button", { name: "Add to bag", exact: true })
      .click();
    await expect(
      customer.getByText(/We could not confirm the update/),
    ).toBeVisible();
    await expect(
      purchase.getByRole("button", { name: "Add to bag", exact: true }),
    ).toBeDisabled();
    cart = await (await customer.request.get("/api/commerce/cart")).json();
    expect(
      cart.items.find((item: { id: number }) => item.id === refill.id)?.prices
        .price,
    ).toBe("1075");
    expect(additions).toBe(1);
    await customer.unroute("**/api/commerce/add");
    // Stale availability must be rejected by WooCommerce, not just the UI.
    await customer.goto(`/products/${simple.slug}`);
    await purchase
      .getByRole("button", { name: "Add to bag", exact: true })
      .click();
    await expect(purchase.getByText("Added to your bag.")).toBeVisible();
    const simpleCart = await (
      await customer.request.get("/api/commerce/cart")
    ).json();
    expect(
      simpleCart.items.find((item: { id: number }) => item.id === simple.id)
        ?.quantity,
    ).toBe(1);
    expect(
      (
        await page.request.put(`${api}/${simple.id}`, {
          headers,
          data: { stock_quantity: 0 },
        })
      ).ok(),
    ).toBe(true);
    await purchase
      .getByRole("button", { name: "Add to bag", exact: true })
      .click();
    await expect(
      customer.locator(".product-purchase-panel .purchase-actions p"),
    ).toContainText(/stock|unavailable|purchas/i);
    for (const width of [1440, 768, 390, 360]) {
      await customer.setViewportSize({ width, height: 900 });
      expect(
        await customer.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `product width ${width}`,
      ).toBe(true);
    }
    expect(errors).toEqual([]);
  } finally {
    await context.close();
    for (const id of productIds.reverse())
      expect(
        (
          await page.request.delete(`${api}/${id}?force=true`, { headers })
        ).ok(),
      ).toBe(true);
    for (const id of categoryIds.reverse())
      expect(
        (
          await page.request.delete(`${api}/categories/${id}?force=true`, {
            headers,
          })
        ).ok(),
      ).toBe(true);
  }
});
