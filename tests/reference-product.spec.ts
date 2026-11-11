import { test, expect } from "@playwright/test";

test("PDP merges gallery, variations and purchase summary across screen sizes", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/products/palo-santo-beads");
  await page
    .getByRole("button", { name: "Reject optional", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Palo Santo beads", exact: true }),
  ).toBeVisible();
  const options = page.getByRole("region", {
    name: "Product options",
    exact: true,
  });
  const summary = page.getByRole("region", {
    name: "Purchase summary",
    exact: true,
  });
  await expect(
    summary.getByRole("button", { name: "Choose an option", exact: true }),
  ).toBeDisabled();
  const radios = options.getByRole("radio");
  expect(await radios.count()).toBeGreaterThan(1);
  const first = radios.first();
  const firstId = await first.getAttribute("value");
  await first.check();
  await expect(first).toBeChecked();
  await expect(page).toHaveURL(new RegExp(`variation=${firstId}`));
  await expect(summary.locator(".pdp-selection-name")).toHaveText(
    (await first.getAttribute("aria-label")) || "",
  );
  const price = await summary.getByTestId("product-price").innerText();
  await radios.last().check();
  await expect(summary.getByTestId("product-price")).not.toHaveText(price);
  await page.goBack();
  await expect(first).toBeChecked();
  await page.reload();
  await expect(first).toBeChecked();
  await expect(summary.getByTestId("product-price")).toHaveText(price);
  await page
    .getByRole("button", { name: "Enlarge product image", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Enlarge product image", exact: true }),
  ).toBeFocused();
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(() => scrollTo(0, 0));
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await page.screenshot({
      path: `artifacts/reference-product-${width}.png`,
      fullPage: true,
    });
    if (width === 1440)
      expect(
        await page
          .locator(".product-purchase-layout")
          .evaluate(
            (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length,
          ),
      ).toBe(3);
  }
  await page
    .getByRole("navigation", { name: "Product sections" })
    .getByRole("link", { name: "Specifications" })
    .click();
  await expect(page).toHaveURL(/#product-specifications$/);
  await options
    .getByRole("button", { name: "Clear selection", exact: true })
    .click();
  await expect(options.locator('input[type="radio"]:checked')).toHaveCount(0);
  await expect(
    summary.getByRole("button", { name: "Choose an option", exact: true }),
  ).toBeDisabled();
  expect(errors).toEqual([]);
});
