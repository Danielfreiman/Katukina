async (page) => {
 await page.goto('http://localhost:3001/',{waitUntil:'domcontentloaded'});
 const results=[];
 for(const width of [1440,800,390]) {
  await page.setViewportSize({width,height:960});
  const nav=page.locator('.collection-paths');
  await nav.scrollIntoViewIfNeeded();
  results.push(await nav.evaluate(el=>({width:innerWidth,cards:[...el.querySelectorAll('.category-photo-card')].map(card=>{
   const frame=card.querySelector('.category-photo-frame').getBoundingClientRect();
   const label=card.querySelector('.category-photo-copy').getBoundingClientRect();
   return {square:Math.abs(frame.width-frame.height)<1,separate:label.top>=frame.bottom-1};
  }),overflow:document.documentElement.scrollWidth>innerWidth})));
  await nav.screenshot({path:`output/playwright/category-square-separated-${width}.png`});
 }
 return results;
}
