async (page) => {
 await page.goto('http://localhost:3001/',{waitUntil:'domcontentloaded'});
 const results=[];
 for(const width of [1440,390]) {
  await page.setViewportSize({width,height:960});
  const nav=page.locator('.collection-paths');
  await nav.scrollIntoViewIfNeeded();
  await page.mouse.move(0,0);
  results.push(await nav.evaluate(el=>{
   const card=getComputedStyle(el.querySelector('.category-photo-card'));
   const copy=getComputedStyle(el.querySelector('.category-photo-copy'));
   return {width:innerWidth,outer:card.borderTop,separator:copy.borderTop,overflow:document.documentElement.scrollWidth>innerWidth};
  }));
  await nav.screenshot({path:`output/playwright/categories-dividers-${width}.png`});
 }
 return results;
}
