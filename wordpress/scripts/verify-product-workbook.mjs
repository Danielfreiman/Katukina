import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';
import { wordpressRoot } from './local-runtime.mjs';

const access = JSON.parse(readFileSync(resolve(wordpressRoot, '.local-access.json'), 'utf8'));
assert.equal(new URL(access.site_url).hostname, 'localhost');
const artifactRoot = resolve(wordpressRoot, '.runtime/catalog-import');
const expectedCurrency = existsSync(resolve(wordpressRoot, 'tools/.imports/sacred-incense-uk/usd-verification.json')) ? 'USD' : 'GBP';
mkdirSync(artifactRoot, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ baseURL: access.site_url });
  const response = await context.request.get('/wp-json/wc/store/v1/products?search=Abalone%20Shell');
  assert.equal(response.status(), 200);
  const product = (await response.json()).find(row => row.sku === '2082');
  assert(product, 'The imported parent must be visible in the Store API.');
  assert.equal(product.type, 'variable');
  assert.equal(product.prices.currency_code, expectedCurrency);
  assert(product.images.length > 0);
  const page = await context.newPage();
  await page.goto('/wp-login.php');
  await page.locator('#user_login').fill(access.username);
  await page.locator('#user_pass').fill(access.password);
  await Promise.all([page.waitForURL(/\/wp-admin\//), page.locator('#wp-submit').click()]);
  await page.goto('/wp-admin/edit.php?post_type=product');
  assert(await page.locator('#menu-posts-product').isVisible());
  await page.screenshot({ path: resolve(artifactRoot, 'products-list.png'), fullPage: false });
  await page.goto(`/wp-admin/post.php?post=${product.id}&action=edit`);
  assert.equal(await page.locator('#product-type').inputValue(), 'variable');
  await page.locator('a[href="#katukina_product_data"]').click();
  await page.locator('#katukina_product_data summary').click();
  assert(await page.getByText('Source product pages', { exact: true }).isVisible());
  await page.locator('a[href="#variable_product_options"]').click();
  const variation = page.locator('.woocommerce_variation').first();
  await variation.waitFor();
  await variation.locator('h3').click();
  await variation.locator('summary').click();
  assert(await variation.getByText('Original price tiers', { exact: true }).isVisible());
  assert(await variation.getByText(/Reference only.*not available inventory/).isVisible());
  await page.screenshot({ path: resolve(artifactRoot, 'variation-source-data.png'), fullPage: true });
  console.log(JSON.stringify({ status: 'passed', product_id: product.id, currency: product.prices.currency_code, checks: ['public variable product', 'product image', 'native product list', 'native variation editor', 'read-only source tiers', 'inventory reference label'] }));
} finally {
  await browser.close();
}
