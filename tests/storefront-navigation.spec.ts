import {test, expect} from '@playwright/test';
test('departments, permanent search and home shelves work across screen sizes', async ({page}) => {
  await page.goto('/');
  await page.getByRole('button',{name:'Reject optional',exact:true}).click();
  await page.getByRole('button',{name:'All categories',exact:true}).click();
  const departments=page.getByRole('navigation',{name:'All product categories'});
  await expect(departments).toBeVisible();
  expect(await departments.getByRole('link').count()).toBeGreaterThan(7);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:'All categories',exact:true})).toBeFocused();
  const shelf=page.getByRole('region',{name:'Discover Katukina',exact:true});
  await shelf.scrollIntoViewIfNeeded();
  await shelf.getByRole('button',{name:'Next Discover Katukina'}).click();
  await expect.poll(()=>shelf.locator('.rh-product-track').evaluate(el=>el.scrollLeft)).toBeGreaterThan(100);
  for(const width of [1440,1024,801,390,320]) {
    await page.setViewportSize({width,height:900});
    await page.evaluate(()=>window.scrollTo(0,0));
    await expect(page.getByRole('combobox',{name:'Search the collection'})).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
    await page.screenshot({path:`artifacts/storefront-structure-${width}.png`});
  }
  await page.getByRole('button',{name:'Open menu',exact:true}).click();
  const mobile=page.getByRole('navigation',{name:'Mobile navigation'});
  await expect(mobile).toBeVisible();
  await mobile.getByRole('link',{name:'Giftshop',exact:true}).click();
  await expect(page).toHaveURL(/\/collections\/giftshop$/);
  await expect(mobile).toHaveCount(0);
});
