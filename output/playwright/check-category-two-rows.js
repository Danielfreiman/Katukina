async (page) => {
 await page.goto('http://localhost:3001/',{waitUntil:'domcontentloaded'});
 const results=[];
 for(const width of [1440,800,390]) {
  await page.setViewportSize({width,height:1100});
  const nav=page.locator('.collection-paths');
  await nav.scrollIntoViewIfNeeded();
  results.push(await nav.evaluate(el=>{
   const cards=[...el.querySelectorAll('.category-photo-card')];
   return {width:innerWidth,rows:new Set(cards.map(a=>Math.round(a.getBoundingClientRect().top))).size,cardWidth:cards[0].getBoundingClientRect().width,allSquare:cards.every(a=>{const r=a.querySelector('.category-photo-frame').getBoundingClientRect();return Math.abs(r.width-r.height)<1;}),overflow:document.documentElement.scrollWidth>innerWidth};
  }));
  await nav.screenshot({path:`output/playwright/category-two-rows-${width}.png`});
 }
 return results;
}
