import { test, expect } from "@playwright/test";
test("busca, filtros, sacola persistente e páginas de produto", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Deep roots",
  );
  await page
    .getByRole("button", { name: "Tea & botanicals", exact: true })
    .click();
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.getByRole("button", { name: "All", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Search the collection" })
    .fill("inexistente");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.getByText("No discoveries here just yet.")).toBeVisible();
  await page.getByRole("button", { name: "Clear search" }).click();
  await page
    .getByRole("button", { name: "Add Sacred Incense · Benzoe to bag" })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page
    .getByRole("button", {
      name: "Increase quantity of Sacred Incense · Benzoe",
    })
    .click();
  await expect(page.locator(".cart-total")).toContainText("17.00");
  await page.getByRole("button", { name: "Close bag" }).click();
  await page.reload();
  await page.getByRole("button", { name: "Open bag, 2 items" }).click();
  await page
    .getByRole("button", { name: "Remove Sacred Incense · Benzoe" })
    .click();
  await expect(
    page.getByText("New discoveries are waiting for you."),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page
    .getByRole("link", { name: "Sacred Incense · Benzoe", exact: true })
    .click();
  await expect(page).toHaveURL(/products\/benzoe-incense/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Sacred Incense · Benzoe",
  );
});
test("conteúdo indexável, schema e rotas de descoberta", async ({
  request,
}) => {
  const home = await request.get("/");
  const html = await home.text();
  expect(html).toContain("application/ld+json");
  expect(html).toContain("FAQPage");
  expect(html).toContain('rel="canonical"');
  expect(html).toContain('lang="en-GB"');
  expect((await request.get("/sitemap.xml")).status()).toBe(200);
  expect((await request.get("/robots.txt")).status()).toBe(200);
  expect((await request.get("/products/nao-existe")).status()).toBe(404);
});
test("mobile sem transbordamento e navegação acessível", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Open categories" }).click();
  await expect(
    page.getByRole("button", { name: "Open categories" }),
  ).toHaveAttribute("aria-expanded", "true");
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Tea & botanicals" })
    .click();
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.locator("summary").first().click();
  await expect(page.locator("details").first()).toHaveAttribute("open", "");
});
