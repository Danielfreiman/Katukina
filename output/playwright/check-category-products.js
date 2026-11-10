async (page) => {
 const visits=[];
 for(let visit=0;visit<2;visit++){
  await page.goto('http://localhost:3001/',{waitUntil:'domcontentloaded',timeout:90000});
  const nav=page.locator('.collection-paths');
  await nav.scrollIntoViewIfNeeded();
  await nav.locator('img').first().waitFor();
  await page.waitForFunction(()=>[...document.querySelectorAll('.category-photo-frame img')].length===6&&[...document.querySelectorAll('.category-photo-frame img')].every(i=>i.complete&&i.naturalWidth>0));
  visits.push(await nav.locator('a').evaluateAll(els=>els.map(el=>({slug:el.getAttribute('href').split('/').pop(),id:Number(el.dataset.productId),src:el.querySelector('img')?.getAttribute('src')}))));
 }
 const api=await page.request.get('http://127.0.0.1:8888/wp-json/wc/store/v1/products?per_page=24&include='+[...new Set(visits.flat().map(p=>p.id))].join(','));
 const products=await api.json();
 const membership=visits.flat().map(card=>({slug:card.slug,id:card.id,matches:products.find(p=>p.id===card.id)?.categories.some(c=>c.slug===card.slug)}));
 const layouts=[];
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:960});
  await page.locator('.collection-paths').scrollIntoViewIfNeeded();
  await page.locator('.collection-paths').screenshot({path:`output/playwright/category-products-${width}.png`});
  layouts.push(await page.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,oneRow:new Set([...document.querySelectorAll('.category-photo-card')].map(a=>Math.round(a.getBoundingClientRect().top))).size===1})));
 }
 return {visits,membership,layouts,changed:visits[0].some((p,i)=>p.id!==visits[1][i].id)};
}
