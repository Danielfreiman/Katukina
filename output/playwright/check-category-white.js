async (page) => {
 await page.goto('http://localhost:3001/',{waitUntil:'domcontentloaded'});
 const nav=page.locator('.collection-paths');
 const results=[];
 for (const width of [1440,390]) {
  await page.setViewportSize({width,height:960});
  await nav.scrollIntoViewIfNeeded();
  await nav.screenshot({path:`output/playwright/category-white-${width}.png`});
  results.push(await nav.evaluate(el=>({width:innerWidth,count:el.querySelectorAll('a').length,oneRow:new Set([...el.querySelectorAll('a')].map(a=>Math.round(a.getBoundingClientRect().top))).size===1,overflow:document.documentElement.scrollWidth>innerWidth,square:[...el.querySelectorAll('.category-photo-frame')].every(img=>Math.abs(img.getBoundingClientRect().width-img.getBoundingClientRect().height)<1),textBelow:[...el.querySelectorAll('a')].every(a=>a.querySelector('.category-photo-copy').getBoundingClientRect().top>=a.querySelector('img').getBoundingClientRect().bottom-1),white:[...el.querySelectorAll('a')].every(a=>getComputedStyle(a).backgroundColor==='rgb(255, 255, 255)')})));
 }
 return results;
}
