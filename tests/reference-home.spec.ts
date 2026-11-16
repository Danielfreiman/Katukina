import { test, expect } from "@playwright/test";

test("modern home uses real products and keeps rails, collections and responsive layouts working", async ({
  page,
}) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Reject optional", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: /Find your natural rhythm/ }),
  ).toBeVisible();
  await expect(page.locator(".mh-promotions .mh-promotion-card")).toHaveCount(3);
  expect(await page.locator(".mh-category-grid > a").count()).toBeGreaterThan(
    6,
  );
  const rail = page.getByRole("region", {
    name: "Featured products",
    exact: true,
  });
  expect(await rail.locator(".rh-product").count()).toBeGreaterThan(6);
  await rail.scrollIntoViewIfNeeded();
  await rail.getByRole("button", { name: "Next Featured products" }).click();
  await expect
    .poll(() =>
      rail.locator(".rh-product-track").evaluate((el) => el.scrollLeft),
    )
    .toBeGreaterThan(200);
  await rail
    .getByRole("button", { name: "Previous Featured products" })
    .click();
  await expect
    .poll(() =>
      rail.locator(".rh-product-track").evaluate((el) => el.scrollLeft),
    )
    .toBeLessThan(2);
  const tabs = page.getByRole("tablist", { name: "Product collections" });
  await tabs.getByRole("tab").first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.getByRole("tab").nth(1)).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.locator(".rh-tab-products:visible")).toHaveCount(1);
  const firstProduct = rail.locator(".rh-product").first();
  const target = await firstProduct
    .locator(".rh-product-cta")
    .getAttribute("href");
  expect(target).toMatch(/^\/products\//);
  for (const width of [1780, 1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page
      .locator(".modern-home img")
      .evaluateAll((images) =>
        images
          .filter((image) => image.getBoundingClientRect().width > 0)
          .forEach((image) => ((image as HTMLImageElement).loading = "eager")),
      );
    await expect
      .poll(() =>
        page
          .locator(".modern-home img")
          .evaluateAll((images) =>
            images
              .filter((image) => image.getBoundingClientRect().width > 0)
              .every(
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
    await page.evaluate(() => scrollTo(0, 0));
    await expect(
      page.getByRole("combobox", { name: "Search the collection" }),
    ).toBeVisible();
    if ([1440, 390].includes(width)) {
      await page.screenshot({
        path: `.impeccable/review/${width === 1440 ? "desktop" : "mobile"}.png`,
        fullPage: true,
      });
      await page.screenshot({ path: `artifacts/modern-home-top-${width}.png` });
    }
  }
  await page.goto(target!);
  await expect(page.locator("main h1")).toBeVisible();
  expect(errors).toEqual([]);
});
