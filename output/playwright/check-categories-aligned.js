async (page) => {
 await page.goto('http://localhost:3001/',{waitUntil:'domcontentloaded'});
 const results=[];
 for (const width of [1440,390]) {
  await page.setViewportSize({width,height:960});
  await page.locator('.collection-paths').scrollIntoViewIfNeeded();
  results.push(await page.evaluate(()=>{
   const product=document.querySelector('.home-collection .product-grid-v2').getBoundingClientRect();
   const grid=document.querySelector('.collection-paths-links').getBoundingClientRect();
   const heading=document.querySelector('#home-categories-title').getBoundingClientRect();
   return {width:innerWidth,leftDifference:grid.left-product.left,rightDifference:grid.right-product.right,headingDifference:heading.left-product.left,overflow:document.documentElement.scrollWidth>innerWidth};
  }));
  await page.screenshot({path:`output/playwright/categories-aligned-${width}.png`});
 }
 return results;
}
