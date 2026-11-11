async (page) => {
 const response=await page.reload();
 if(response.status()!==200) throw new Error('Home HTTP '+response.status());
 const results=[];
 for(const width of [1440,390]) {
  await page.setViewportSize({width,height:900});
  if(await page.locator('.rh-guidance,.rh-signin').count()) throw new Error('Section still present');
  await page.locator('.rh-campaigns').scrollIntoViewIfNeeded();
  await page.screenshot({path:'output/playwright/removed-two-sections-top-'+width+'.png'});
  await page.locator('footer').scrollIntoViewIfNeeded();
  await page.screenshot({path:'output/playwright/removed-two-sections-bottom-'+width+'.png'});
  results.push({width,removed:true,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
 }
 return results;
}
