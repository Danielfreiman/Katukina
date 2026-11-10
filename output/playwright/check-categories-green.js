async (page) => {
 await page.goto('http://localhost:3001/',{waitUntil:'domcontentloaded'});
 const nav=page.locator('.collection-paths');
 const results=[];
 for(const width of [1440,390]) {
  await page.setViewportSize({width,height:960});
  await nav.scrollIntoViewIfNeeded();
  if(width===1440) await nav.locator('.category-photo-card').first().hover();
  await page.waitForTimeout(250);
  await page.screenshot({path:`output/playwright/categories-green-${width}.png`});
  results.push(await nav.evaluate(el=>{
   const css=selector=>getComputedStyle(el.querySelector(selector));
   return {width:innerWidth,background:getComputedStyle(el).backgroundColor,title:css('h3').color,copyBackground:css('.category-photo-copy').backgroundColor,copy:css('h4').color,hint:css('.collection-paths-scroll-hint').display,photo:css('.category-photo-frame').backgroundColor,overflow:document.documentElement.scrollWidth>innerWidth};
  }));
 }
 return results;
}
