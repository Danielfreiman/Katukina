async (page) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForLoadState("domcontentloaded");
  const reject = page.getByRole('button', {name: 'Reject optional', exact: true});
  if (await reject.isVisible()) await reject.click();
  const results = [];
  for (const width of [1664, 390, 320]) {
    await page.setViewportSize({width, height: 900});
    await page.locator('.rh-campaigns').scrollIntoViewIfNeeded();
    for (let slide = 0; slide < 3; slide++) {
      const data = await page.locator('.rh-campaign').evaluateAll(cards => cards.filter(c => getComputedStyle(c).display !== 'none').map(c => {
        const link = c.querySelector('a'); const r = c.getBoundingClientRect(); const b = link.getBoundingClientRect();
        return {title: c.querySelector('h2').textContent, cta: link.textContent.trim(), href: link.getAttribute('href'), textLinked: !!c.querySelector('h2').closest('a'), radius: getComputedStyle(link).borderRadius, links: c.querySelectorAll('a').length, left: Math.round(b.left-r.left), bottom: Math.round(r.bottom-b.bottom), overlap: b.top < c.querySelector('p').getBoundingClientRect().bottom, inside: b.right <= r.right && b.bottom <= r.bottom};
      }));
      results.push({width, slide, overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), cards: data});
      if (slide === 0) await page.locator('.rh-campaigns').screenshot({path: `output/playwright/campaign-cta-${width}.png`});
      await page.getByRole('button', {name: 'Next campaign', exact: true}).click();
    }
  }
  return results;
}


