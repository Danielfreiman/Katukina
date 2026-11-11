import { test, expect } from "@playwright/test";

test("header suggests real products and supports mobile keyboard navigation", async ({ page, request }) => {
  const response = await request.get("/api/search/products?q=palo");
  expect(response.ok()).toBeTruthy();
  const { products } = await response.json();
  expect(products.length).toBeGreaterThan(0);
  expect(products.length).toBeLessThanOrEqual(6);
  expect((await (await request.get("/api/search/products?q=a")).json()).products).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Reject optional", exact: true }).click();

  const input = page.getByRole("combobox", { name: "Search the collection" });
  await input.fill("palo");
  await expect(page.getByRole("listbox").getByRole("option").first()).toBeVisible();
  const href = await page.getByRole("listbox").getByRole("option").first().getAttribute("href");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.screenshot({ path: "artifacts/live-search-mobile.png" });
  await input.press("ArrowDown");
  await expect(page.getByRole("listbox").getByRole("option").first()).toHaveAttribute("aria-selected", "true");
  await input.press("Enter");
  await expect(page).toHaveURL(new RegExp(`${href}$`));
  await expect(page.locator(".search-results-panel")).toBeHidden();
});

test("suggestions discard outdated responses and handle empty/error results", async ({ page }) => {
  await page.route("**/api/search/products?*", async route => {
    const q = new URL(route.request().url()).searchParams.get("q");
    if (q === "old") await new Promise(resolve => setTimeout(resolve, 800));
    await route.fulfill({ status: q === "error" ? 503 : 200, json: {
      products: q === "empty" ? [] : [{ id: 1, name: q, href: "/products/example", image: null, price: null }],
    } });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Reject optional", exact: true }).click();

  const input = page.getByRole("combobox", { name: "Search the collection" });
  const pending = page.waitForRequest("**/api/search/products?q=old");
  await input.fill("old");
  await pending;
  await input.fill("new");
  await expect(page.getByRole("listbox").getByRole("option")).toHaveText("new");
  await page.waitForTimeout(900);
  await expect(page.getByRole("listbox").getByRole("option")).toHaveText("new");
  await input.fill("empty");
  await expect(page.locator(".search-status")).toContainText("No matching products");
  await input.fill("error");
  await expect(page.locator(".search-status")).toContainText("Suggestions are unavailable");
  await input.press("Escape");
  await expect(input).toBeFocused();
  await expect(page.locator(".search-results-panel")).toBeHidden();
});
