async (page) => {
 await page.goto('http://localhost:3001/',{waitUntil:'domcontentloaded'});
 const results=[];
 for(const width of [1440,800,390]) {
  await page.setViewportSize({width,height:960});
  const nav=page.locator('.collection-paths');
  await nav.scrollIntoViewIfNeeded();
  await page.mouse.move(0,0);
  await page.waitForTimeout(250);
  results.push(await nav.evaluate(el=>{
   const cards=[...el.querySelectorAll('.category-photo-card')];
   return {width:innerWidth,count:cards.length,rows:new Set(cards.map(a=>Math.round(a.getBoundingClientRect().top))).size,radius:getComputedStyle(cards[0]).borderRadius,labelColor:getComputedStyle(el.querySelector('h4')).color,hint:getComputedStyle(el.querySelector('.collection-paths-scroll-hint')).display,overflow:document.documentElement.scrollWidth>innerWidth};
  }));
  await nav.screenshot({path:`output/playwright/category-art-cards-${width}.png`});
 }
 return results;
}
