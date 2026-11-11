import { test, expect } from "@playwright/test";
test("reference home preserves its composition and interactive sections", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Reject optional", exact: true })
    .click();
  await expect(page.locator(".rh-campaign")).toHaveCount(2);
  const first = await page.locator(".rh-campaign").first().getAttribute("href");
  await page
    .getByRole("button", { name: "Next campaign", exact: true })
    .click();
  await expect(page.locator(".rh-campaign").first()).not.toHaveAttribute(
    "href",
    first!,
  );
  const rail = page.getByRole("region", {
    name: "Discover Katukina",
    exact: true,
  });
  expect(await rail.locator(".rh-product").count()).toBeGreaterThan(6);
  await rail.scrollIntoViewIfNeeded();
  await rail.getByRole("button", { name: "Next Discover Katukina" }).click();
  await expect
    .poll(() =>
      rail.locator(".rh-product-track").evaluate((el) => el.scrollLeft),
    )
    .toBeGreaterThan(200);
  const tabs = page.getByRole("tablist", { name: "Product collections" });
  await tabs.getByRole("tab").first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.getByRole("tab").nth(1)).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.locator(".rh-tab-products:visible")).toHaveCount(1);
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(() => scrollTo(0, 0));
    await page
      .locator(".reference-home img")
      .evaluateAll((images) =>
        images
          .filter((image) => image.getBoundingClientRect().width > 0)
          .forEach((image) => ((image as HTMLImageElement).loading = "eager")),
      );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    const columns = await rail
      .locator(".rh-product-track")
      .evaluate((el) => getComputedStyle(el).gridAutoColumns);
    console.log({ width, columns });
    for (
      let y = 0;
      y < (await page.evaluate(() => document.body.scrollHeight));
      y += 700
    ) {
      await page.evaluate((y) => scrollTo(0, y), y);
      await page.waitForTimeout(80);
    }
    await page.evaluate(() => scrollTo(0, 0));
    await expect
      .poll(() =>
        page
          .locator(".reference-home img")
          .evaluateAll(
            (images) =>
              images.filter(
                (image) =>
                  image.getBoundingClientRect().width > 0 &&
                  !(image as HTMLImageElement).complete,
              ).length,
          ),
      )
      .toBe(0);
    expect(
      await page
        .locator(".reference-home img")
        .evaluateAll((images) =>
          images
            .filter(
              (image) =>
                image.getBoundingClientRect().width > 0 &&
                (image as HTMLImageElement).naturalWidth === 0,
            )
            .map((image) => image.getAttribute("src")),
        ),
    ).toEqual([]);
    await page.screenshot({
      path: `artifacts/reference-home-${width}.png`,
      fullPage: true,
    });
  }
});
