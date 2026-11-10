import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';

test('receive form searches SKUs, preserves failures and synchronizes native stock',async({page})=>{
 test.setTimeout(240000); page.setDefaultTimeout(15000); page.setDefaultNavigationTimeout(60000);
 const access=JSON.parse(readFileSync('wordpress/.local-access.json','utf8'));
 await page.goto('/wp-login.php');await page.locator('#user_login').fill(access.username);await page.locator('#user_pass').fill(access.password);await Promise.all([page.waitForURL(/\/wp-admin\//),page.locator('#wp-submit').click()]);
 const base='/wp-admin/edit.php?post_type=product&page=katukina-lots';
 await page.goto(base+'&operation=receive');
 const nonce=await page.evaluate(()=>(window as any).wpApiSettings.nonce);const headers={'X-WP-Nonce':nonce};
 await page.locator('#select2-kat-data-form_id-container').click();await page.getByRole('combobox',{name:'Search by name or SKU'}).fill('1829-3944');
 await page.locator('.select2-results__option').filter({hasText:'Wooden Egg Shaker'}).click();await expect(page.locator('#kat-data-form_id').locator('..').getByRole('status')).toContainText('SKU 1829-3944');
 const prefix='stock-ui-'+Date.now();let id=0;const lotIds:number[]=[];
 try{
  const created=await page.request.post('/wp-json/wc/v3/products',{headers,data:{name:prefix,sku:prefix,type:'simple',status:'draft',regular_price:'1',manage_stock:false}});expect(created.status()).toBe(201);id=(await created.json()).id;
  await page.goto(base+'&operation=receive');await page.locator('#select2-kat-data-form_id-container').click();await page.getByRole('combobox',{name:'Search by name or SKU'}).fill(prefix);await page.locator('.select2-results__option').filter({hasText:prefix}).click();
  const formId=await page.locator('#kat-data-form_id').inputValue();
  const warehouse=await page.locator('#kat-data-warehouse_id option').evaluateAll(a=>(a as HTMLOptionElement[]).find(x=>x.value)?.value||'');await page.locator('#kat-data-warehouse_id').selectOption(warehouse);
  await page.getByLabel('Lot code',{exact:true}).fill('invalid code');await page.getByLabel('Quantity received',{exact:true}).fill('2');await page.getByLabel('Reason',{exact:true}).fill('Temporary receive UI verification');
  await page.getByRole('button',{name:'Receive lot',exact:true}).click();await expect(page.locator('.notice-error')).toContainText('Not saved');await expect(page.getByLabel('Quantity received',{exact:true})).toHaveValue('2');await expect(page.locator('#kat-data-form_id')).toHaveValue(formId);
  await page.getByLabel('Lot code',{exact:true}).fill(prefix);await page.getByRole('button',{name:'Receive lot',exact:true}).click();await expect(page.locator('.notice-success')).toContainText('Operation saved');await expect(page).toHaveURL(/operation=lots/);
  let report=await(await page.request.get('/wp-json/katukina/v1/report/lots',{headers})).json();const lot=report.rows.find((r:any)=>r.code===prefix);expect(lot).toBeTruthy();lotIds.push(Number(lot.id));
  let product=await(await page.request.get('/wp-json/wc/v3/products/'+id,{headers})).json();expect(product.stock_quantity).toBe(2);
  await page.goto('/wp-admin/post.php?post='+id+'&action=edit',{waitUntil:'domcontentloaded'});await page.locator('.inventory_options a').click();await page.locator('#_stock').fill('7');await page.locator('#publish').click();await page.waitForLoadState('domcontentloaded');
  product=await(await page.request.get('/wp-json/wc/v3/products/'+id,{headers})).json();expect(product.stock_quantity).toBe(7);
  report=await(await page.request.get('/wp-json/katukina/v1/report/lots',{headers})).json();expect(Number(report.rows.find((r:any)=>r.code===prefix).balance)).toBe(7000);
  await page.goto(base+'&operation=adjust');await page.locator('#select2-kat-data-lot_id-container').click();await page.getByRole('combobox',{name:'Search by name or SKU'}).fill(prefix);await page.locator('.select2-results__option').filter({hasText:prefix}).click();await page.getByLabel('Quantity (negative to remove stock)',{exact:true}).fill('-2');await page.getByLabel('Reference',{exact:true}).fill(prefix);await page.getByLabel('Reason',{exact:true}).fill('Temporary adjustment UI verification');await page.getByRole('button',{name:'Adjust stock',exact:true}).click();await expect(page.locator('.notice-success')).toContainText('Operation saved');
  product=await(await page.request.get('/wp-json/wc/v3/products/'+id,{headers})).json();expect(product.stock_quantity).toBe(5);
  await page.goto('/wp-admin/edit.php?post_type=product&page=katukina-inventory&form_id='+formId);await expect(page.locator('.wp-list-table')).toContainText(prefix);await expect(page.locator('.wp-list-table')).toContainText('5.000');
  await page.screenshot({path:'artifacts/stock-inventory-filter.png',fullPage:true});
  await page.goto(base+'&operation=receive');await page.screenshot({path:'artifacts/stock-receive-search.png',fullPage:true});
 }finally{
  const report=await(await page.request.get('/wp-json/katukina/v1/report/lots',{headers})).json();
  for(const lot of report.rows.filter((r:any)=>r.code===prefix)){if(Number(lot.balance)>0)await page.request.post('/wp-json/katukina/v1/command/adjust',{headers,data:{key:randomUUID(),lot_id:lot.id,quantity:String(-Number(lot.balance)/1000),reference:prefix,reason:'Close isolated UI fixture'}});}
  if(id)await page.request.delete('/wp-json/wc/v3/products/'+id+'?force=true',{headers});
 }
});
