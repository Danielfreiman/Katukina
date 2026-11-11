async (page) => {
 await page.reload();
 const result=[];
 for(const width of [1440,390]) {
  await page.setViewportSize({width,height:900});
  await page.locator('footer').scrollIntoViewIfNeeded();
  result.push({width,removed:await page.getByRole('region',{name:'Shopping with Katukina',exact:true}).count()===0,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
  await page.screenshot({path:'output/playwright/removed-shopping-section-'+width+'.png'});
 }
 return result;
}
