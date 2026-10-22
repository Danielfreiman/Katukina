import { test, expect, Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

async function login(page: Page) {
  const access = JSON.parse(readFileSync('wordpress/.local-access.json', 'utf8'));
  await page.goto('/wp-login.php');
  await page.locator('#user_login').fill(access.username);
  await page.locator('#user_pass').fill(access.password);
  await Promise.all([page.waitForURL(/\/wp-admin\//), page.locator('#wp-submit').click()]);
  await page.goto('/wp-admin/edit.php?post_type=product');
  await expect(page.locator('#toplevel_page_katukina')).toHaveCount(0);
  await expect(page.locator('script[src*="katukina-core/assets/admin.js"]')).toHaveCount(0);
  return { 'X-WP-Nonce': await page.evaluate(() => (window as unknown as {wpApiSettings:{nonce:string}}).wpApiSettings.nonce) };
}

test('complementary admin opens lists and separate English editors', async ({page}) => {
  test.setTimeout(240000);
  const headers = await login(page);
  const suppliers = '/wp-admin/edit.php?post_type=product&page=katukina-suppliers';
  await page.goto(suppliers);
  await expect(page.getByRole('heading', {name:'Suppliers',exact:true})).toBeVisible();
  await expect(page.locator('.wp-list-table')).toBeVisible();
  await expect(page.locator('#kat-code')).toHaveCount(0);
  await page.screenshot({path:'artifacts/admin-suppliers-list.png',fullPage:true});
  await page.getByRole('link',{name:'Add new',exact:true}).click();
  await expect(page.locator('#kat-code')).toBeVisible();
  await expect(page.getByLabel('Purchasing terms')).toBeVisible();
  await expect(page.locator('.wp-list-table')).toHaveCount(0);
  await page.screenshot({path:'artifacts/admin-supplier-editor.png',fullPage:true});
  await page.getByRole('link',{name:'Back to list',exact:true}).click();
  await expect(page.locator('#kat-code')).toHaveCount(0);

  for (const section of ['company','warehouse','channel','country','hs','transition']) {
    await page.goto(`/wp-admin/admin.php?page=wc-settings&tab=katukina&section=${section}`);
    await expect(page.locator('.wp-list-table')).toBeVisible();
    await expect(page.locator('#kat-code')).toHaveCount(0);
    await expect(page.locator('button[name="save"]')).toHaveCount(0);
    await page.getByRole('link',{name:'Add new',exact:true}).click();
    await expect(page.locator('#kat-code')).toBeVisible();
    await expect(page.locator('button[name="save"]')).toBeVisible();
  }
  for (const section of ['contact','mailbox','template','message','subscription','campaign']) {
    await page.goto(`/wp-admin/users.php?page=katukina-contacts&section=${section}`);
    await expect(page.locator('.wp-list-table')).toBeVisible();
    await expect(page.locator('#kat-code')).toHaveCount(0);
    await page.getByRole('link',{name:'Add new',exact:true}).click();
    await expect(page.locator('#kat-code')).toBeVisible();
    await expect(page.locator('.wp-list-table')).toHaveCount(0);
  }
  await page.goto('/wp-admin/edit.php?post_type=product&page=katukina-lots');
  await expect(page.locator('.wp-list-table')).toBeVisible();
  await expect(page.locator('#kat-data-code')).toHaveCount(0);
  await page.getByRole('link',{name:'Add new — Receive lot',exact:true}).click();
  await expect(page.getByLabel('Lot code', {exact:true})).toBeVisible();
  await page.getByRole('link',{name:'Back to list',exact:true}).click();
  await expect(page.locator('#kat-data-code')).toHaveCount(0);

  // The WooCommerce settings form must switch to editing after creation,
  // otherwise a second save would attempt to insert a duplicate record.
  const code = `admin-layout-${Date.now()}`;
  try {
    await page.goto('/wp-admin/admin.php?page=wc-settings&tab=katukina&section=company&record_action=add');
    await page.getByLabel('Reference code',{exact:true}).fill(code);
    await page.getByLabel('Legal name / name',{exact:true}).fill('Admin layout test');
    await page.getByLabel('Country (ISO code)',{exact:true}).selectOption('GB');
    await page.getByLabel('Accounting currency',{exact:true}).selectOption('GBP');
    await Promise.all([page.waitForNavigation(),page.locator('button[name="save"]').click()]);
    await expect(page).toHaveURL(/record_id=\d+/);
    await expect(page.getByLabel('Legal name / name',{exact:true})).toHaveValue('Admin layout test');
    await page.getByLabel('Legal name / name',{exact:true}).fill('Admin layout updated');
    await Promise.all([page.waitForNavigation(),page.locator('button[name="save"]').click()]);
    await expect(page.getByLabel('Legal name / name',{exact:true})).toHaveValue('Admin layout updated');
    await page.getByRole('link',{name:'Back to list',exact:true}).click();
    await expect(page.locator('.wp-list-table tbody tr').filter({hasText:code}).getByRole('link',{name:'Admin layout updated',exact:true})).toBeVisible();
    await page.screenshot({path:'artifacts/admin-operational-settings-list.png',fullPage:true});
  } finally {
    const result = await (await page.request.get(`/wp-json/katukina/v1/records/company?search=${code}`,{headers})).json();
    for (const row of result.rows ?? []) {
      await page.request.post('/wp-json/katukina/v1/records/company',{headers,data:{...row,key:randomUUID(),data:{...row.data,active:false}}});
    }
  }
});

test('native product editor, stock and variation metadata are the catalogue authority', async ({page}) => {
  test.setTimeout(180000);
  const headers = await login(page);
  const products: number[] = [];
  const suffix = Date.now();
  const create = async (data: object) => {
    const response = await page.request.post('/wp-json/wc/v3/products', {headers, data});
    expect(response.status(), await response.text()).toBe(201);
    const product = await response.json(); products.push(product.id); return product;
  };
  try {
    const simple = await create({name: `Native catalogue ${suffix}`, slug: `native-${suffix}`, type:'simple', status:'publish', regular_price:'12.50', manage_stock:true, stock_quantity:7});
    await page.goto(`/wp-admin/post.php?post=${simple.id}&action=edit`);
    await page.locator('a[href="#katukina_product_data"]').click();
    await page.locator('#kat_content_unit').selectOption('g');
    await page.locator('#kat_content_quantity').fill('25');
    await page.locator('#kat_origin_country').fill('PE');
    await page.locator('#kat_location').fill('Native shelf A');
    await page.locator('#kat_blocked_countries').fill('FR');
    await Promise.all([page.waitForNavigation(), page.locator('#publish').click()]);
    const fresh = await (await page.request.get(`/wp-json/wc/v3/products/${simple.id}`, {headers})).json();
    expect(fresh.manage_stock).toBe(true); expect(fresh.stock_quantity).toBe(7); expect(fresh.regular_price).toBe('12.50');
    const meta = Object.fromEntries(fresh.meta_data.map((m: {key:string;value:unknown}) => [m.key,m.value]));
    expect(meta._kat_content_quantity).toBe('25'); expect(meta._kat_origin_country).toBe('PE'); expect(meta._kat_blocked_countries).toBe('FR');
    const references = await (await page.request.get('/wp-json/katukina/v1/references/form', {headers})).json();
    expect(references.rows.filter((r: {id:number}) => Number(r.id) === Number(meta._kat_form_record_id))).toHaveLength(1);
    await page.locator('a[href="#katukina_product_data"]').click();
    await expect(page.locator('#kat_location')).toHaveValue('Native shelf A');
    await page.screenshot({path:'artifacts/native-product-preview.png',fullPage:true});
    await page.goto(`/products/native-${suffix}`);
    await expect(page.getByRole('heading', {name: simple.name, exact:true})).toBeVisible();
    const parent = await create({name:`Native variable ${suffix}`, type:'variable', status:'draft', attributes:[{name:'Size', visible:true, variation:true, options:['25g','50g']}]});
    const variantResponse = await page.request.post(`/wp-json/wc/v3/products/${parent.id}/variations`, {headers,data:{regular_price:'8', attributes:[{name:'Size',option:'25g'}],meta_data:[{key:'_kat_content_unit',value:'g'},{key:'_kat_content_quantity',value:'25'}]}});
    expect(variantResponse.status(), await variantResponse.text()).toBe(201);
    const variant = await variantResponse.json();
    await page.goto(`/wp-admin/post.php?post=${parent.id}&action=edit`);
    const ajaxURL = await page.evaluate(() => (window as unknown as {woocommerce_admin_meta_boxes_variations:{ajax_url:string}}).woocommerce_admin_meta_boxes_variations.ajax_url);
    expect(new URL(ajaxURL).origin).toBe(new URL(page.url()).origin);
    await page.locator('a[href="#variable_product_options"]').click();
    const variation = page.locator('.woocommerce_variation').first();
    // WooCommerce loads variations through admin-ajax after the tab opens.
    await expect(variation).toBeVisible({timeout:30000});
    await variation.locator('h3').click();
    await expect(page.locator('#kat_content_quantity_0')).toHaveValue('25');
    await page.locator('#kat_content_quantity_0').fill('26');
    await page.locator('#kat_content_quantity_0').dispatchEvent('change');
    await page.locator('.save-variation-changes').click();
    await expect(page.locator('.save-variation-changes')).toBeDisabled();
    const savedVariant = await (await page.request.get(`/wp-json/wc/v3/products/${parent.id}/variations/${variant.id}`,{headers})).json();
    expect(savedVariant.meta_data.find((m:{key:string}) => m.key === '_kat_content_quantity').value).toBe('26');
    await page.screenshot({path:'artifacts/native-variation-preview.png',fullPage:true});
  } finally {
    for (const id of products.reverse()) await page.request.delete(`/wp-json/wc/v3/products/${id}?force=true`,{headers});
  }
});

test('native order editor saves operations and native settings retain configuration', async ({page}) => {
  test.setTimeout(180000);
  const headers = await login(page);
  const channels = await (await page.request.get('/wp-json/katukina/v1/records/channel',{headers})).json();
  const channel = channels.rows.find((r:{code:string})=>r.code==='LOCAL-DEMO');
  let orderId = 0;
  try {
    const productsResponse = await page.request.get('/wp-json/wc/v3/products?sku=1809-4055',{headers});
    expect(productsResponse.ok()).toBe(true);
    const fixture = (await productsResponse.json()).find((product:{sku:string})=>product.sku==='1809-4055');
    expect(fixture, 'Import the local catalogue fixtures before testing.').toBeTruthy();
    const created = await page.request.post('/wp-json/wc/v3/orders',{headers,data:{status:'on-hold',currency:'USD',line_items:[{product_id:fixture.id,quantity:1}]}});
    expect(created.status()).toBe(201); orderId=(await created.json()).id;
    await page.goto(`/wp-admin/admin.php?page=wc-orders&action=edit&id=${orderId}`);
    await expect(page.locator('#katukina_order_operations')).toBeVisible();
    await page.locator('#kat-order-channel').selectOption(String(channel.id));
    await page.locator('#kat-order-short_note').fill('Native order test');
    await page.locator('#kat-order-tracking_code').fill('LOCAL-TEST');
    await page.locator('#kat-order-tracking_url').fill('https://example.invalid/tracking/LOCAL-TEST');
    await page.locator('#kat-order-reason').fill('Verify native order controls');
    await Promise.all([page.waitForNavigation(),page.locator('button.save_order').click()]);
    await expect(page.locator('#kat-order-short_note')).toHaveValue('Native order test');
    await expect(page.locator('#kat-order-channel')).toBeDisabled();
    const order = await (await page.request.get(`/wp-json/wc/v3/orders/${orderId}`,{headers})).json();
    expect(order.status).toBe('on-hold'); expect(order.date_paid).toBeNull();
    expect(order.meta_data.find((m:{key:string})=>m.key==='_kat_tracking_code').value).toBe('LOCAL-TEST');
    const pickingURL = await page.getByRole('link',{name:'Print picking list',exact:true}).getAttribute('href');
    const picking = await page.request.get(pickingURL!); expect(picking.status()).toBe(200); expect(await picking.text()).toContain('Native order test');
    expect(await picking.text()).not.toContain('Internal local test note');
    await page.screenshot({path:'artifacts/native-order-preview.png',fullPage:true});
    await page.goto('/wp-admin/admin.php?page=wc-settings&tab=katukina');
    await expect(page.getByRole('heading',{name:'Storefront and reservations',exact:true})).toBeVisible();
    const original = await page.locator('#kat-settings-reservation_minutes').inputValue();
    await page.locator('#kat-settings-reservation_minutes').fill(String(Number(original) + 1));
    await page.locator('#kat-settings-reservation_minutes').dispatchEvent('change');
    await Promise.all([page.waitForNavigation(), page.locator('button[name="save"]').click()]);
    await expect(page.locator('#kat-settings-reservation_minutes')).toHaveValue(String(Number(original) + 1));
    await page.locator('#kat-settings-reservation_minutes').fill(original);
    await page.locator('#kat-settings-reservation_minutes').dispatchEvent('change');
    await Promise.all([page.waitForNavigation(), page.locator('button[name="save"]').click()]);
    await expect(page.locator('#kat-settings-reservation_minutes')).toHaveValue(original);
    await expect(page.locator('#kat-settings-channel_id')).toHaveValue(String(channel.id));
    await page.screenshot({path:'artifacts/native-settings-preview.png',fullPage:true});
    for (const tab of ['shipping','checkout','tax']) {
      const response=await page.goto(`/wp-admin/admin.php?page=wc-settings&tab=${tab}`);
      expect(response?.status()).toBe(200); await expect(page.locator('#wpadminbar')).toBeVisible();
    }
  } finally {
    if(orderId) await page.request.delete(`/wp-json/wc/v3/orders/${orderId}?force=true`,{headers});
  }
});
