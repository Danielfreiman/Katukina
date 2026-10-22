import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

test("same-origin WordPress login, protected modules and live catalogue/content", async ({
  page,
  request,
}) => {
  test.setTimeout(240000);
  const access = JSON.parse(
    readFileSync("wordpress/.local-access.json", "utf8"),
  );
  expect([401, 403]).toContain(
    (await request.get("/wp-json/katukina/v1/modules")).status(),
  );
  const backend = await request.get("http://127.0.0.1:8888/", {
    maxRedirects: 0,
  });
  expect(backend.status()).toBe(302);
  expect(backend.headers().location).toBe("http://localhost:3001/");
  const directAdmin = await request.get("http://localhost:8888/wp-admin/", {
    maxRedirects: 0,
  });
  expect(directAdmin.status()).toBe(302);
  expect(directAdmin.headers().location).toBe(
    "http://localhost:3001/wp-admin/",
  );
  const directLogin = await request.get("http://localhost:8888/wp-login.php", {
    maxRedirects: 0,
  });
  expect(directLogin.status()).toBe(302);
  expect(directLogin.headers().location).toContain(
    "http://localhost:3001/wp-login.php",
  );
  await page.goto("/wp-admin/");
  await expect(page).toHaveURL(/^http:\/\/localhost:3001\/wp-login.php/);
  expect(page.url()).not.toContain("8888");
  await page.locator("#user_login").fill(access.username);
  await page.locator("#user_pass").fill(access.password);
  await Promise.all([
    page.waitForURL(/\/wp-admin\//, {
      timeout: 30000,
      waitUntil: "domcontentloaded",
    }),
    page.locator("#wp-submit").click(),
  ]);
  await expect(page.locator("#wpadminbar")).toBeVisible();
  await page.goto("/wp-admin/admin.php?page=katukina");
  await expect(
    page.getByRole("heading", { name: "Products", exact: true }),
  ).toBeVisible();
  await expect(
    page.locator('#menu-posts-product'),
  ).toBeVisible();
  const assets = await page
    .locator('link[rel="stylesheet"]')
    .evaluateAll((links) =>
      links.map((link) => (link as HTMLLinkElement).href),
    );
  const wpAsset = assets.find((url) => url.includes("/wp-"));
  expect(wpAsset).toBeTruthy();
  expect(wpAsset).not.toContain(":8888");
  expect((await page.request.get(wpAsset!)).status()).toBe(200);
  // Native WP REST cookie authentication and nonce; no API secret in the browser.
  const nonce = await page.evaluate(
    () =>
      (window as unknown as { wpApiSettings: { nonce: string } }).wpApiSettings
        .nonce,
  );
  const headers = { "X-WP-Nonce": nonce };
  expect(
    (
      await page.request.get("/wp-json/katukina/v1/modules", { headers })
    ).status(),
  ).toBe(200);
  const suffix = Date.now();
  const slug = `katukina-test-${suffix}`;
  let productId: number | undefined;
  let categoryId: number | undefined;
  let articleId: number | undefined;
  try {
    const categoryResponse = await page.request.post(
      "/wp-json/wc/v3/products/categories",
      { headers, data: { name: `Test collection ${suffix}`, slug } },
    );
    expect(categoryResponse.status()).toBe(201);
    categoryId = (await categoryResponse.json()).id;
    const created = await page.request.post("/wp-json/wc/v3/products", {
      headers,
      data: {
        name: `Katukina integration ${suffix}`,
        slug,
        type: "simple",
        status: "publish",
        regular_price: "12.50",
        description: "<p>Temporary integration fixture.</p>",
        categories: [{ id: categoryId }],
      },
    });
    expect(created.status()).toBe(201);
    const product = await created.json();
    productId = product.id;
    expect(product.permalink).toBe(`http://localhost:3001/products/${slug}`);
    const productPage = await request.get(`/products/${slug}`);
    expect(productPage.status()).toBe(200);
    expect(await productPage.text()).toContain(product.name);
    expect(await productPage.text()).toContain(
      "Temporary integration fixture.",
    );
    expect(
      (await (await request.get(`/shop?q=${suffix}`)).text()).includes(
        product.name,
      ),
    ).toBe(true);
    expect(await (await request.get(`/collections/${slug}`)).text()).toContain(
      product.name,
    );
    expect(await (await request.get("/sitemap.xml")).text()).toContain(
      `/products/${slug}`,
    );
    const edited = await page.request.put(
      `/wp-json/wc/v3/products/${productId}`,
      { headers, data: { name: `Updated integration ${suffix}` } },
    );
    expect(edited.status()).toBe(200);
    expect(await (await request.get(`/products/${slug}`)).text()).toContain(
      `Updated integration ${suffix}`,
    );
    const unpublished = await page.request.put(
      `/wp-json/wc/v3/products/${productId}`,
      { headers, data: { status: "draft" } },
    );
    expect(unpublished.status()).toBe(200);
    expect((await request.get(`/products/${slug}`)).status()).toBe(404);
    const article = await page.request.post("/wp-json/wp/v2/posts", {
      headers,
      data: {
        title: `Journal integration ${suffix}`,
        slug,
        content: "<p>Published editorial fixture.</p>",
        status: "publish",
      },
    });
    expect(article.status()).toBe(201);
    articleId = (await article.json()).id;
    expect(await (await request.get(`/journal/${slug}`)).text()).toContain(
      "Published editorial fixture.",
    );
  } finally {
    if (productId)
      expect(
        (
          await page.request.delete(
            `/wp-json/wc/v3/products/${productId}?force=true`,
            { headers },
          )
        ).status(),
      ).toBe(200);
    if (categoryId)
      expect(
        (
          await page.request.delete(
            `/wp-json/wc/v3/products/categories/${categoryId}?force=true`,
            { headers },
          )
        ).status(),
      ).toBe(200);
    if (articleId)
      expect(
        (
          await page.request.delete(
            `/wp-json/wp/v2/posts/${articleId}?force=true`,
            { headers },
          )
        ).status(),
      ).toBe(200);
  }
});
