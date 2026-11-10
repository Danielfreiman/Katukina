async (page) => {
 await page.goto('http://localhost:3001',{waitUntil:'domcontentloaded'});
 const results=[];
 for (const width of [1440,768,390,320]) {
  await page.setViewportSize({width,height:900});
  results.push(await page.locator('.collections-banner').evaluate(el=>({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,imageLoaded:el.querySelector('img').complete&&el.querySelector('img').naturalWidth>0,textAlign:getComputedStyle(el.querySelector('.collections-banner-copy')).textAlign,href:el.querySelector('a').getAttribute('href')})));
 }
 const cta=page.locator('.collections-banner a');
 await cta.focus();
 const focus=await cta.evaluate(el=>({active:el===document.activeElement,outline:getComputedStyle(el).outlineStyle}));
 await cta.hover();
 const hover=await cta.evaluate(el=>getComputedStyle(el).backgroundColor);
 return {results,focus,hover};
}
