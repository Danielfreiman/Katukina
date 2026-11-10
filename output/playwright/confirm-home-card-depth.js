async (page) => {
 await page.setViewportSize({width:1440,height:960});
 await page.emulateMedia({reducedMotion:'reduce'});
 const product=page.locator('.home-collection .product-card').first();
 const category=page.locator('.category-photo-card').first();
 await product.hover();
 const productMotion=await product.evaluate(el=>({transform:getComputedStyle(el).transform,transition:getComputedStyle(el).transitionDuration}));
 await category.hover();
 const categoryMotion=await category.evaluate(el=>({transform:getComputedStyle(el).transform,transition:getComputedStyle(el).transitionDuration}));
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.setViewportSize({width:800,height:960});
 await page.mouse.move(0,0);
 await page.waitForTimeout(350);
 const rows=await page.locator('.collection-paths-links').evaluate(el=>new Set([...el.children].map(c=>Math.round(c.getBoundingClientRect().top))).size);
 return {productMotion,categoryMotion,tabletRows:rows};
}
