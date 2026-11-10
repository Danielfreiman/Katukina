async (page) => {
  await page.goto('http://localhost:3001/', {waitUntil:'networkidle'});
  const nav = page.locator('.collection-paths');
  const results=[];
  for (const width of [1440,800,390,320]) {
    await page.setViewportSize({width,height:960});
    await nav.scrollIntoViewIfNeeded();
    await page.screenshot({path:`output/playwright/categories-${width}.png`});
    results.push(await nav.evaluate((el) => {
      const cards=[...el.querySelectorAll('a')];
      return {width:innerWidth,count:cards.length,overflow:document.documentElement.scrollWidth>innerWidth,columns:getComputedStyle(el.querySelector('.collection-paths-links')).gridTemplateColumns,cards:cards.map(a=>({href:a.getAttribute('href'),loaded:a.querySelector('img').naturalWidth>0,textFits:a.scrollWidth<=a.clientWidth,rect:Math.round(a.getBoundingClientRect().width)}))};
    }));
  }
  await page.setViewportSize({width:1440,height:960});
  await nav.scrollIntoViewIfNeeded();
  await nav.locator('a').first().focus();
  results.push({focus:await nav.locator('a').first().evaluate(el=>({matches:el.matches(':focus-visible'),outline:getComputedStyle(el).outlineWidth}))});
  await page.screenshot({path:'output/playwright/categories-focus.png'});
  console.log(JSON.stringify(results));
}
