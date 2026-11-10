async (page) => {
 await page.goto('http://localhost:3001/', {waitUntil:'domcontentloaded'});
 const nav=page.locator('.collection-paths');
 const results=[];
 for(const width of [1440,390]) {
  await page.setViewportSize({width,height:960});
  await nav.scrollIntoViewIfNeeded();
  await nav.screenshot({path:`output/playwright/categories-six-heading-${width}.png`});
  results.push(await nav.evaluate(el=>{
   const grid=el.querySelector('.collection-paths-links').getBoundingClientRect();
   const cards=[...el.querySelectorAll('.category-photo-card')].map(a=>a.getBoundingClientRect());
   return {viewport:innerWidth,count:cards.length,oneRow:new Set(cards.map(a=>Math.round(a.top))).size===1,headingAbove:el.querySelector('h3').getBoundingClientRect().bottom<=grid.top,fullWidth:Math.abs(cards[0].left-grid.left)<1&&Math.abs(cards[5].right-grid.right)<1,overflow:document.documentElement.scrollWidth>innerWidth};
  }));
 }
 return results;
}
