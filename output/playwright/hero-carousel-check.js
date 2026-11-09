async page => {
  await page.goto('http://localhost:3001/');
  const results = [];
  for (const width of [1440, 768, 440, 375, 320]) {
    await page.setViewportSize({width, height:1000});
    await page.getByRole('tab', {name:'Explore Rapé', exact:true}).click();
    await page.locator('#hero-panel-1 img').evaluate(img => img.decode());
    await page.screenshot({path:'output/playwright/hero-carousel-rape-'+width+'.png'});
    results.push(await page.evaluate(() => ({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,visiblePanels:[...document.querySelectorAll('[role=tabpanel]')].filter(el=>!el.hidden).length,cta:document.querySelector('#hero-panel-1 .button.primary').getAttribute('href'),image:document.querySelector('#hero-panel-1 img').naturalWidth})));
    await page.keyboard.press('ArrowLeft');
    if (!(await page.getByRole('tab', {name:'Discover Katukina',exact:true}).getAttribute('aria-selected') === 'true')) throw new Error('Keyboard navigation failed');
    await page.screenshot({path:'output/playwright/hero-carousel-first-'+width+'.png'});
  }
  await page.setViewportSize({width:1440,height:1000});
  const response=await page.request.get('http://localhost:3001/collections/rape');
  return {results,categoryStatus:response.status()};
}
