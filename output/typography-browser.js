async (page) => {
  const routes=['/','/shop','/collections','/collections/sacred-incense','/products/yunnan-puer-gold-from-2003','/about','/journal','/privacy','/cookies','/account','/cart','/checkout','/shipping','/subscribe','/shop?q=katukina-no-results','/typography-missing-page'];
  await page.goto('http://127.0.0.1:3001/');
  const reject=page.getByRole('button',{name:'Reject optional',exact:true});
  await reject.waitFor({state:'visible',timeout:5000}).catch(()=>{}); if(await reject.isVisible()) await reject.click();
  const links=await page.locator('a[href^="/journal/"],a[href^="/pages/"]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')));
  routes.push(...[...new Set(links)].slice(0,2));
  const results=[];
  for(const width of [1440,390]) {
    await page.setViewportSize({width,height:1000});
    for(const route of routes){
      const response=await page.goto('http://127.0.0.1:3001'+route,{waitUntil:'load',timeout:60000});
      await page.evaluate(()=>document.fonts.ready);
      const data=await page.evaluate(()=>{
        const visible=e=>e.getBoundingClientRect().width>0&&e.getBoundingClientRect().height>0&&getComputedStyle(e).visibility!=='hidden';
        const samples=[...document.querySelectorAll('h1,h2,h3,h4,.rh-product-name,.product-price,.purchase-price,.catalog-sort,input,select,.button,.site-note,.footer-links a,.product-card-action')].filter(visible).map(e=>{const s=getComputedStyle(e);return {selector:e.tagName+'.'+e.className,text:e.textContent.trim().slice(0,65),family:s.fontFamily,size:s.fontSize,weight:s.fontWeight,line:s.lineHeight,tracking:s.letterSpacing};});
        const small=[...document.querySelectorAll('main *,header *,footer *,[role="dialog"] *')].filter(e=>visible(e)&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&parseFloat(getComputedStyle(e).fontSize)<12).map(e=>({tag:e.tagName,cls:e.className,text:e.textContent.trim().slice(0,50),size:getComputedStyle(e).fontSize}));
        return {title:document.title,overflow:document.documentElement.scrollWidth>innerWidth,fonts:[...document.fonts].filter(f=>f.status==='loaded').map(f=>({family:f.family,weight:f.weight,style:f.style})),samples,small};
      });
      const name=route.replace(/[^a-z0-9]/gi,'-')||'home';
      await page.screenshot({path:'output/playwright/typeset-'+width+'-'+name+'.png',fullPage:true});
      results.push({width,route,status:response.status(),...data}); console.log(JSON.stringify(results.at(-1))); 
    }
  }
  await page.setViewportSize({width:320,height:900});
  for(const route of ['/','/shop','/products/yunnan-puer-gold-from-2003','/privacy']){
    await page.goto('http://127.0.0.1:3001'+route,{waitUntil:'load',timeout:60000});
    for(const scale of ['100%','200%']){
      await page.evaluate(scale=>document.documentElement.style.fontSize=scale,scale);
      results.push({width:320,route,scale,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
    }
  }
  console.log(JSON.stringify(results));
}
