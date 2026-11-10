async (page) => {
 await page.goto('http://localhost:3001/', {waitUntil:'domcontentloaded'});
 const results=[];
 for(const width of [1440,390]) {
  await page.setViewportSize({width,height:960});
  await page.locator('.collection-paths').scrollIntoViewIfNeeded();
  results.push(await page.evaluate(()=>{
   const band=document.querySelector('.collection-paths');
   const button=document.querySelector('.home-collection .product-card-action');
   return {width:innerWidth,bandPattern:getComputedStyle(band,'::before').opacity,buttonPattern:getComputedStyle(button,'::before').opacity,title:getComputedStyle(band.querySelector('h3')).opacity,buttonText:getComputedStyle(button).opacity,overflow:document.documentElement.scrollWidth>innerWidth};
  }));
  await page.screenshot({path:`output/playwright/pattern-transparency-${width}.png`});
 }
 return results;
}
