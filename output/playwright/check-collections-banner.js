async (page) => {
  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByRole('button', {name:'Reject optional'}).click({timeout:1500}).catch(()=>{});
  const results=[];
  for (const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]) {
    await page.setViewportSize({width,height});
    const banner=page.locator('.collections-banner');
    await banner.scrollIntoViewIfNeeded();
    await page.screenshot({path:`output/playwright/collections-banner-${name}.png`});
    await banner.screenshot({path:`output/playwright/collections-banner-${name}-section.png`});
    results.push(await banner.evaluate((el)=>{
      const copy=el.querySelector('.collections-banner-copy');
      const img=el.querySelector('img');
      const link=el.querySelector('a');
      return {width:innerWidth, overflow:document.documentElement.scrollWidth>innerWidth, alignment:getComputedStyle(copy).textAlign,imageLoaded:img.complete&&img.naturalWidth>0,href:link.getAttribute('href'),heading:el.querySelector('h2').textContent};
    }));
  }
  await page.locator('.collections-banner a').focus();
  results.push({focus:await page.locator('.collections-banner a').evaluate(el=>el===document.activeElement)});
  await page.locator('.collections-banner a').click();
  await page.waitForURL('**/collections');
  results.push({destination:page.url(),collectionsTitle:await page.getByRole('heading',{name:'Collections',exact:true}).count()});
  console.log(JSON.stringify(results));
}
