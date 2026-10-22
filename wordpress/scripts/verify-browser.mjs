import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(new URL("../../package.json", import.meta.url));
const { chromium } = require("@playwright/test");
const access = JSON.parse(readFileSync(new URL("../.local-access.json", import.meta.url), "utf8"));
const baseURL = access.site_url;
assert.equal(new URL(baseURL).hostname, "localhost", "Checks must target the local environment.");

const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ baseURL });
  const api = await context.request.get("/wp-json/");
  assert.equal(api.status(), 200);
  const index = await api.json();
  assert(index.namespaces.includes("wc/store/v1"));
  const products = await context.request.get("/wp-json/wc/store/v1/products");
  assert.equal(products.status(), 200);
  assert(Array.isArray(await products.json()));
  const cart = await context.request.get("/wp-json/wc/store/v1/cart");
  assert.equal(cart.status(), 200);
  assert(cart.headers()["cart-token"], "Store API must issue a cart token.");

  const page = await context.newPage();
  const home = await page.goto("/");
  assert.equal(home.status(), 200);
  assert.match(await page.locator('meta[name="robots"]').getAttribute("content"), /noindex/);
  await page.goto("/wp-login.php");
  await page.locator("#user_login").fill(access.username);
  await page.locator("#user_pass").fill(access.password);
  await Promise.all([
    page.waitForURL(/\/wp-admin\//),
    page.locator("#wp-submit").click(),
  ]);
  assert(await page.locator("#wpadminbar").isVisible());
  await page.goto("/wp-admin/edit.php?post_type=product");
  assert(await page.locator("#menu-posts-product").isVisible());
  assert(await page.locator("#adminmenu").isVisible());
  console.log(JSON.stringify({
    status: "passed", baseURL,
    checks: ["home HTTP 200", "noindex", "WordPress REST API", "WooCommerce Store API", "cart token", "administrator login", "product administration"],
  }));
} finally {
  await browser.close();
}
