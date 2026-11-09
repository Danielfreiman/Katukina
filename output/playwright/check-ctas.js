async (page) => {
 for (const width of [1440,390]) {
  await page.setViewportSize({width,height:900});
  for (const route of ['/', '/shop', '/collections', '/journal', '/about', '/products/yunnan-puer-gold-from-2003']) {
   try { await page.goto('http://localhost:3001'+route,{waitUntil:'domcontentloaded'}); } catch { await page.goto('http://localhost:3001'+route,{waitUntil:'domcontentloaded'}); }
   console.log(JSON.stringify({width,route,...await page.evaluate(() => ({arrows:document.querySelectorAll('svg.lucide-arrow-up-right,svg.lucide-arrow-right,svg.lucide-arrow-down,svg.lucide-chevron-left,svg.lucide-chevron-right').length,overflow:document.documentElement.scrollWidth>innerWidth,arrowText:[...document.querySelectorAll('a,button')].filter(e=>/[\u2190\u2192\u2197]/.test(e.textContent)).length}))}));
   if(route==='/') await page.screenshot({path:'output/playwright/cta-'+width+'.png'});
  }
 }
}

