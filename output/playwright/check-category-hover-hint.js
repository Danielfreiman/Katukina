async (page) => {
 await page.goto('http://localhost:3001/',{waitUntil:'domcontentloaded'});
 await page.setViewportSize({width:1440,height:960});
 const nav=page.locator('.collection-paths');
 const card=nav.locator('.category-photo-card').first();
 await nav.scrollIntoViewIfNeeded();
 const before=await card.evaluate(el=>getComputedStyle(el,'::after').opacity);
 await card.hover();
 await page.waitForTimeout(250);
 const hover=await card.evaluate(el=>({opacity:getComputedStyle(el,'::after').opacity,border:getComputedStyle(el,'::after').borderWidth}));
 await page.screenshot({path:'output/playwright/categories-hover-outline.png'});
 await card.focus();
 const focus=await card.evaluate(el=>getComputedStyle(el).outlineWidth);
 await page.setViewportSize({width:390,height:960});
 await nav.scrollIntoViewIfNeeded();
 const mobile=await nav.evaluate(el=>{
  const grid=el.querySelector('.collection-paths-links');
  grid.scrollLeft=160;
  return {hint:getComputedStyle(el.querySelector('.collection-paths-scroll-hint')).display,scrollable:grid.scrollWidth>grid.clientWidth,overflow:document.documentElement.scrollWidth>innerWidth};
 });
 await page.waitForTimeout(200);
 mobile.scrollLeft=await nav.locator('.collection-paths-links').evaluate(el=>el.scrollLeft);
 await page.screenshot({path:'output/playwright/categories-mobile-swipe-hint.png'});
 return {before,hover,focus,mobile};
}
