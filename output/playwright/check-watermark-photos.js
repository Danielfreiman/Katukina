async (page) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://localhost:3001/shop', {waitUntil:'domcontentloaded'});
  const products = await page.locator('.product-card-link').evaluateAll(nodes => [...new Set(nodes.map(n=>n.getAttribute('href')))].slice(0,2));
  if (products.length !== 2) throw Error('Product samples missing');
  const results = [];
  for (const route of ['/', '/shop', ...products]) {
    for (const [device,width,height] of [['desktop',1440,1000],['mobile',390,844]]) {
      await page.setViewportSize({width,height});
      await page.goto('http://localhost:3001'+route, {waitUntil:'networkidle'});
      await page.getByRole('button', {name:'Reject optional'}).click({timeout:1000}).catch(()=>{});
      await page.evaluate(async () => {
        for (const img of document.images) {
          if (img.src.includes('/uploads/')) {
            img.loading='eager';
            await img.decode().catch(()=>{});
          }
        }
      });
      const result=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,
        images:[...document.images].filter(i=>i.src.includes('/uploads/')).map(i=>({src:i.currentSrc,loaded:i.complete&&i.naturalWidth>0}))}));
      if (!result.images.length || result.images.some(i=>!i.loaded) || result.overflow) throw Error(JSON.stringify({route,device,...result}));
      const name=route==='/'?'home':route.split('/').pop();
      await page.screenshot({path:`output/playwright/watermark-${name}-${device}.png`,fullPage:true});
      results.push({route,device,...result});
    }
  }
  if(errors.length) throw Error('Browser errors');
  return {results,errors};
}
