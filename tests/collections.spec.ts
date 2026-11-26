import { test, expect } from "@playwright/test";

test("collection directory supports browsing and filtering by name", async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const response = await request.get(
    "/wp-json/wc/store/v1/products/categories?per_page=100&hide_empty=false",
  );
  expect(response.ok()).toBeTruthy();
  const categories: { slug: string }[] = await response.json();
  await page.goto("/collections");
  await page.getByRole("button", { name: "Reject optional" }).click();
  const directory = page.getByRole("region", { name: "All collections" });
  const entries = directory.getByRole("link");
  for (const category of categories) {
    await expect(
      directory.locator(`a[href="/collections/${category.slug}"]`),
    ).toHaveCount(1);
  }
  const initialCount = await entries.count();
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await entries.evaluateAll((links) =>
        links.every((link) => {
          const { width, height } = link.getBoundingClientRect();
          return (
            width > 0 &&
            Math.abs(width - height) < 1 &&
            !!link.querySelector("img[src]")
          );
        }),
      ),
    ).toBe(true);
  }
  const field = page.getByRole("searchbox", { name: "Find a collection" });
  await field.fill("ArOmÁtiCs");
  await expect(entries).toHaveCount(1);
  await expect(entries.first()).toContainText("Aromatics");
  await field.fill("no-matching-collection");
  await expect(entries).toHaveCount(0);
  await expect(directory.getByText(/No collections match/)).toBeVisible();
  await directory
    .getByRole("button", { name: "Clear collection search" })
    .click();
  await expect(field).toBeFocused();
  await expect(entries).toHaveCount(initialCount);
  await field.fill("shipibo");
  await field.press("Tab");
  await page.keyboard.press("Tab");
  await expect(entries.first()).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/collections\/shipibo-art$/);
});
