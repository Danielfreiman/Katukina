async (page) => {
 await page.goto('http://localhost:3001/', {waitUntil:'domcontentloaded'});
 const nav=page.locator('.collection-paths');
 const results=[];
 for(const width of [1440,390]) {
  await page.setViewportSize({width,height:960});
  await nav.scrollIntoViewIfNeeded();
  await page.screenshot({path:`output/playwright/categories-full-bleed-${width}.png`});
  results.push(await nav.evaluate(el=>({width:innerWidth,background:getComputedStyle(el).backgroundColor,shadow:getComputedStyle(el).boxShadow,clip:getComputedStyle(el).clipPath,overflow:document.documentElement.scrollWidth>innerWidth})));
 }
 return results;
}
