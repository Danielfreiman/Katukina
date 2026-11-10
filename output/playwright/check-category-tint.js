async(page)=>{
 await page.goto('http://localhost:3001/',{waitUntil:'domcontentloaded',timeout:90000});
 const checks=[];
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:960});
  const nav=page.locator('.collection-paths');await nav.scrollIntoViewIfNeeded();
  await nav.screenshot({path:`output/playwright/category-tinted-copy-${width}.png`});
  checks.push(await page.locator('.category-photo-card').first().evaluate(el=>({width:innerWidth,photo:getComputedStyle(el.querySelector('.category-photo-frame')).backgroundColor,text:getComputedStyle(el.querySelector('.category-photo-copy')).backgroundColor,overflow:document.documentElement.scrollWidth>innerWidth})));
 }
 return checks;
}
