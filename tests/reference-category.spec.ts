import { test, expect } from "@playwright/test";

test("category layout keeps search, sorting, pagination and mobile filters working", async ({
  page,
}) => {
  await page.goto("/collections/giftshop");
  await page
    .getByRole("button", { name: "Reject optional", exact: true })
    .click();
  await expect(page.locator(".category-campaign")).toBeVisible();
  await expect(page.locator(".catalog-results .product-card")).toHaveCount(12);
  const productName = await page
    .locator(".catalog-results .product-info h3")
    .first()
    .innerText();
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(() => scrollTo(0, 0));
    await page
      .locator(".category-reference img")
      .evaluateAll((images) =>
        images.forEach(
          (image) => ((image as HTMLImageElement).loading = "eager"),
        ),
      );
    await expect
      .poll(() =>
        page
          .locator(".category-reference img")
          .evaluateAll((images) =>
            images.every(
              (image) =>
                (image as HTMLImageElement).complete &&
                (image as HTMLImageElement).naturalWidth > 0,
            ),
          ),
      )
      .toBeTruthy();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await page.screenshot({
      path: `artifacts/reference-category-${width}.png`,
      fullPage: true,
    });
    if (width === 1440) {
      const columns = await page
        .locator(".catalog-results .product-grid-v2")
        .first()
        .evaluate(
          (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length,
        );
      expect(columns).toBe(4);
    }
  }
  await page.getByRole("button", { name: "Filters", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Filter products" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Close filters", exact: true })
    .click();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByLabel("Sort by", { exact: true }).selectOption("price-asc");
  await expect(page).toHaveURL(/sort=price-asc/);
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Show", { exact: true }).selectOption("24");
  await expect(page).toHaveURL(/per_page=24/);
  await expect(page.locator(".catalog-results .product-card")).toHaveCount(24);
  await page.getByRole("link", { name: "Next page", exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
  await page.waitForLoadState("networkidle");
  const input = page
    .locator(".catalog-sidebar")
    .getByPlaceholder("Find a product");
  await input.fill(productName);
  await input.press("Enter");
  await expect(page.locator(".active-filters")).toContainText(productName);
  await expect(
    page.locator(".catalog-results .product-card").first(),
  ).toContainText(productName);
  expect(new URL(page.url()).searchParams.get("page")).toBeNull();
  await page.waitForLoadState("networkidle");
  await input.fill("zzzz-no-matching-product");
  await input.press("Enter");
  await expect(page.locator(".no-results")).toBeVisible();
  await page.goto("/shop");
  await expect(page.locator(".category-campaign")).toHaveCount(0);
});
