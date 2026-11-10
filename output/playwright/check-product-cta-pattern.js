async (page) => {
 await page.goto('http://localhost:3001/',{waitUntil:'domcontentloaded'});
 const results=[];
 for(const width of [1440,390]) {
  await page.setViewportSize({width,height:960});
  const cta=page.locator('.home-collection .product-card-action').first();
  await cta.scrollIntoViewIfNeeded();
  const state=await page.evaluate(()=>{
   const action=getComputedStyle(document.querySelector('.home-collection .product-card-action'));
   const band=getComputedStyle(document.querySelector('.collection-paths'),'::before');
   const category=getComputedStyle(document.querySelector('.category-photo-cta'));
   return {width:innerWidth,actionPattern:action.backgroundImage,sameSize:action.backgroundSize===band.backgroundSize,size:action.backgroundSize,categoryBackground:category.backgroundImage,categoryText:category.color,overflow:document.documentElement.scrollWidth>innerWidth};
  });
  await page.screenshot({path:`output/playwright/product-cta-pattern-${width}.png`});
  results.push(state);
 }
 return results;
}
