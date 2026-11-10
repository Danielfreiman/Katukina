async (page) => {
 await page.goto('http://localhost:3001/',{waitUntil:'domcontentloaded'});
 await page.setViewportSize({width:1440,height:960});
 const first=page.locator('.home-collection .product-card').first();
 await first.scrollIntoViewIfNeeded();
 await page.mouse.move(0,0);
 const normal=await first.evaluate(el=>({shadow:getComputedStyle(el).boxShadow,transform:getComputedStyle(el).transform,border:getComputedStyle(el).borderWidth,radius:getComputedStyle(el).borderRadius}));
 await page.screenshot({path:'output/playwright/home-card-depth-rest.png'});
 await first.hover();
 await page.waitForTimeout(350);
 const hover=await first.evaluate(el=>({shadow:getComputedStyle(el).boxShadow,transform:getComputedStyle(el).transform}));
 await page.screenshot({path:'output/playwright/home-card-depth-hover.png'});
 const nav=page.locator('.collection-paths');
 await nav.scrollIntoViewIfNeeded();
 const category=nav.locator('.category-photo-card').first();
 await category.hover();
 await page.waitForTimeout(350);
 await page.screenshot({path:'output/playwright/home-category-depth-hover.png'});
 await page.mouse.move(0,0);
 await category.focus();
 const focus=await category.evaluate(el=>({outline:getComputedStyle(el).outlineWidth,shadow:getComputedStyle(el).boxShadow}));
 await page.emulateMedia({reducedMotion:'reduce'});
 await category.hover();
 const reduced=await category.evaluate(el=>({transform:getComputedStyle(el).transform,transition:getComputedStyle(el).transitionDuration}));
 await page.emulateMedia({reducedMotion:'no-preference'});
 const responsive=[];
 for(const width of [800,390,320]) {
  await page.setViewportSize({width,height:960});
  await page.mouse.move(0,0);
  await nav.scrollIntoViewIfNeeded();
  responsive.push(await page.evaluate(()=>{
   const grid=document.querySelector('.collection-paths-links');
   const categories=[...grid.querySelectorAll('.category-photo-card')];
   const products=[...document.querySelectorAll('.home-collection .product-card')];
   return {width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,categoryRows:new Set(categories.map(c=>Math.round(c.getBoundingClientRect().top))).size,productColumns:products.filter(c=>Math.round(c.getBoundingClientRect().top)===Math.round(products[0].getBoundingClientRect().top)).length,square:categories.every(c=>{const r=c.querySelector('.category-photo-frame').getBoundingClientRect();return Math.abs(r.width-r.height)<1;}),railPadding:getComputedStyle(grid).paddingBottom};
  }));
  if(width===390) {
   await page.screenshot({path:'output/playwright/home-card-depth-mobile.png'});
   await first.scrollIntoViewIfNeeded();
   await page.screenshot({path:'output/playwright/home-products-depth-mobile.png'});
  }
 }
 return {normal,hover,focus,reduced,responsive};
}
