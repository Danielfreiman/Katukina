import { test, expect } from "@playwright/test";
test("public pages use Next.js, render SEO and remain responsive", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Find your",
  );
  const html = await (await request.get("/")).text();
  expect(html).toContain("application/ld+json");
  expect(html).toContain('rel="canonical"');
  expect(html).toContain('lang="en-GB"');
  expect(html).not.toContain("wp-block-site-title");
  expect(html).not.toContain("The collection is temporarily unavailable.");
  expect(
    (await request.get("/products/katukina-definitely-missing")).status(),
  ).toBe(404);
  expect((await request.get("/xmlrpc.php")).status()).toBe(404);
  expect((await request.get("/shop?q=first&q=second")).status()).toBe(200);
  expect((await request.get("/wp-content/debug.log")).status()).toBe(404);
  expect(
    (await request.get("/wp-content/katukina-tools/setup-local.php")).status(),
  ).toBe(404);
  const slash = await request.get("/about/", { maxRedirects: 0 });
  expect(slash.status()).toBe(308);
  for (const path of [
    "/shop",
    "/collections",
    "/journal",
    "/shipping",
    "/cart",
    "/checkout",
    "/account",
  ]) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
  expect(await (await request.get("/robots.txt")).text()).toContain(
    "Disallow: /wp-admin/",
  );
  const sitemapResponse = await request.get("/sitemap.xml");
  expect(sitemapResponse.status()).toBe(200);
  const sitemap = await sitemapResponse.text();
  expect(sitemap).toContain("/shop");
  expect(sitemap).not.toContain("/checkout");
  expect(sitemap).not.toContain("localhost:8888");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Open menu", exact: true }).click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Open menu", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Open search", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Search the collection" })
    .fill("katukina-no-results");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page).toHaveURL(/\/shop\?q=katukina-no-results/);
  await expect(page.getByText("No discoveries here just yet.")).toBeVisible();
});
