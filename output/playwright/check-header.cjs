async (page) => {
  await page.reload();
  const reject = page.getByRole('button', { name: 'Reject optional', exact: true });
  if (await reject.isVisible()) await reject.click();
  const results = [];
  for (const width of [1440, 1024, 801, 375, 360]) {
    await page.setViewportSize({ width, height: 900 });
    results.push(await page.evaluate(() => {
      const h = document.querySelector('.header-wrap');
      const nav = document.querySelector('.desktop-navigation');
      const b = document.querySelector('.header-actions .icon-button');
      return { width: innerWidth, overflow: document.documentElement.scrollWidth > innerWidth,
        background: getComputedStyle(h).backgroundColor, navSize: getComputedStyle(nav).fontSize,
        border: getComputedStyle(b).border, radius: getComputedStyle(b).borderRadius };
    }));
    if (width === 1440 || width === 375) await page.screenshot({ path: `output/playwright/header-${width}.png` });
  }
  await page.getByRole('button', { name: 'Open search', exact: true }).click();
  await page.getByRole('textbox', { name: 'Search the collection' }).waitFor({ state: 'visible' });
  await page.keyboard.press('Escape');
  const searchClosed = await page.locator('#site-search').count() === 0;
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await page.locator('#mobile-navigation').waitFor({ state: 'visible' });
  await page.keyboard.press('Escape');
  return { results, searchClosed, menuClosed: await page.locator('#mobile-navigation').count() === 0 };
}
