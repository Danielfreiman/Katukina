async (page) => {
 await page.goto('http://localhost:3001/',{waitUntil:'domcontentloaded'});
 const results=[];
 for(const width of [1440,390]) {
  await page.setViewportSize({width,height:960});
  const card=page.locator('.home-collection .product-card').first();
  await card.scrollIntoViewIfNeeded();
  await page.mouse.move(0,0);
  await page.waitForTimeout(350);
  results.push(await card.evaluate(el=>({width:innerWidth,shadow:getComputedStyle(el.querySelector('.product-card-link')).boxShadow,overflow:document.documentElement.scrollWidth>innerWidth})));
  await card.screenshot({path:`output/playwright/product-photo-depth-${width}.png`});
 }
 return results;
}
