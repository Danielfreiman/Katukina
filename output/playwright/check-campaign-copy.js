async (page) => {
  await page.reload();
  await page.emulateMedia({reducedMotion: 'reduce'});
  const reject = page.getByRole('button', {name: 'Reject optional', exact: true});
  if (await reject.isVisible()) await reject.click();
  const results = [];
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({width, height: 1000});
    for (let step = 0; step < 3; step++) {
      const section = page.locator('.rh-campaigns');
      await section.scrollIntoViewIfNeeded();
      const cards = await section.locator('.rh-campaign').evaluateAll(cards => cards.filter(c => getComputedStyle(c).display !== 'none').map(c => {
        const title = c.querySelector('h2');
        const p = c.querySelector('p');
        const a = c.querySelector('a');
        return {title: title.textContent, text: p.textContent, href: a.getAttribute('href'), overlap: p.getBoundingClientRect().bottom > a.getBoundingClientRect().top, clipped: title.scrollWidth > title.clientWidth || p.scrollWidth > p.clientWidth};
      }));
      results.push({width, cards, overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)});
      await section.screenshot({path: 'output/playwright/campaign-copy-' + width + '-' + step + '.png'});
      await page.getByRole('button', {name: 'Next campaign', exact: true}).click();
    }
  }
  return results;
}
