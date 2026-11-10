async (page) => {
 await page.goto('http://localhost:3001/',{waitUntil:'networkidle'});
 const nav=page.locator('.collection-paths');
 const results=[];
 for (const width of [1440,800,390,320]) {
  await page.setViewportSize({width,height:960});
  await nav.scrollIntoViewIfNeeded();
  await nav.screenshot({path:`output/playwright/category-strip-${width}.png`});
  results.push(await nav.evaluate(el=>({width:innerWidth,cards:el.querySelectorAll('a').length,oneRow:new Set([...el.querySelectorAll('a')].map(a=>Math.round(a.getBoundingClientRect().top))).size===1,overflow:document.documentElement.scrollWidth>innerWidth,loaded:[...el.querySelectorAll('img')].every(img=>img.complete&&img.naturalWidth>0),leftHeading:el.querySelector('h3').getBoundingClientRect().right<el.querySelector('.collection-paths-links').getBoundingClientRect().left,allTextFits:[...el.querySelectorAll('a')].every(a=>a.scrollWidth<=a.clientWidth)})));
 }
 await page.setViewportSize({width:1440,height:960});
 await nav.locator('a').first().focus();
 results.push({focusVisible:await nav.locator('a').first().evaluate(el=>el.matches(':focus-visible'))});
 const links=await nav.locator('a').evaluateAll(els=>els.map(el=>el.getAttribute('href')));
 for(const href of links){const res=await page.request.get(`http://localhost:3001${href}`);results.push({href,status:res.status()});}
 require('fs').writeFileSync('output/playwright/category-strip-results.json',JSON.stringify(results,null,2));
}
