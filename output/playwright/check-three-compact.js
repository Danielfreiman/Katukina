async (page) => {
 await page.goto('http://localhost:3001/', {waitUntil:'domcontentloaded'});
 const nav = page.locator('.collection-paths');
 const results=[];
 for (const width of [1440,390]) {
  await page.setViewportSize({width,height:960});
  await nav.scrollIntoViewIfNeeded();
  await nav.screenshot({path:`output/playwright/categories-three-compact-${width}.png`});
  results.push(await nav.evaluate(el=>({viewport:innerWidth,cards:[...el.querySelectorAll('.category-photo-card')].map(a=>({width:a.getBoundingClientRect().width,top:Math.round(a.getBoundingClientRect().top)})),overflow:document.documentElement.scrollWidth>innerWidth})));
 }
 return results;
}
