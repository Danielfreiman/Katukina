import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser = await chromium.launch();
const checks = [];
try {
  const context = await browser.newContext({ baseURL: 'http://localhost:3001' });
  const page = await context.newPage(); const errors = []; page.on('pageerror', error => errors.push(error.message));
  const productResponse = await page.request.get('/wp-json/wc/store/v1/products?slug=sacred-incense-palo-santo');
  assert(productResponse.ok(), 'Local catalogue API must be available.');
  const fixture = (await productResponse.json()).find(product => product.sku === '1809-4055');
  assert(fixture, 'Import the local catalogue fixtures before visual verification.');
  await page.request.get('/api/commerce/cart');
  const add = await page.request.post('/api/commerce/add', { headers: { Origin: 'http://localhost:3001' }, data: { id: fixture.id, quantity: 1 } }); assert(add.ok());
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/cart', '/checkout', '/account', '/shipping']) {
      await page.goto(path); await page.waitForLoadState('networkidle');
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${path}, ${width}`);
      const name = path.slice(1); if (width !== 320) await page.screenshot({ path: `artifacts/operations-${name}-${width}-preview.png`, fullPage: true });
      checks.push({ path, width, overflow: false });
    }
  }
  const access = JSON.parse(await readFile('wordpress/.local-access.json', 'utf8'));
  await page.setViewportSize({ width: 1440, height: 1000 }); await page.goto('/wp-login.php');
  await page.locator('#user_login').fill(access.username); await page.locator('#user_pass').fill(access.password);
  await Promise.all([page.waitForURL(/\/wp-admin\//), page.locator('#wp-submit').click()]);
  await page.goto('/wp-admin/edit.php?post_type=product');
  await page.locator('#the-list tr').first().waitFor(); await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: 'artifacts/operations-catalog-admin-preview.png', fullPage: true });
  await page.goto('/wp-admin/admin.php?page=wc-settings&tab=katukina');
  await page.getByRole('heading', { name: 'Storefront and reservations', exact: true }).waitFor();
  await page.evaluate(() => scrollTo(0, 0)); await page.screenshot({ path: 'artifacts/operations-settings-admin-preview.png', fullPage: true });
  assert.deepEqual(errors, []);
  await writeFile('artifacts/operations-visual-verification.json', JSON.stringify({ checked_at: new Date().toISOString(), checks, javascript_errors: errors }, null, 2));
  console.log(JSON.stringify({ checks: checks.length, javascript_errors: errors.length }));
} finally { await browser.close(); }
