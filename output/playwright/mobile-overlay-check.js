async page => {
  const results = [];
  for (const width of [440, 375, 320, 1440]) {
    await page.setViewportSize({width, height: 1000});
    await page.screenshot({path: 'output/playwright/mobile-overlay-' + width + '.png'});
    results.push(await page.evaluate(() => ({width: innerWidth, overflow: document.documentElement.scrollWidth > innerWidth, position: getComputedStyle(document.querySelector('.hero-campaign-image')).objectPosition})));
  }
  return results;
}
