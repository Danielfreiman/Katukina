async (page) => {
 await page.goto('http://localhost:3001/',{waitUntil:'domcontentloaded'});
 const results=[];
 for(const width of [1440,390]) {
  await page.setViewportSize({width,height:960});
  const nav=page.locator('.collection-paths');
  await nav.scrollIntoViewIfNeeded();
  results.push(await page.evaluate(()=>{
   const original=getComputedStyle(document.querySelector('.collection-intro h2'));
   const heading=getComputedStyle(document.querySelector('#home-categories-title'));
   return {width:innerWidth,sameSize:original.fontSize===heading.fontSize,sameWeight:original.fontWeight===heading.fontWeight,size:heading.fontSize,color:heading.color,accent:getComputedStyle(document.querySelector('#home-categories-title span')).color,overflow:document.documentElement.scrollWidth>innerWidth};
  }));
  await nav.screenshot({path:`output/playwright/category-heading-style-${width}.png`});
 }
 return results;
}
