async page => {
 const data=[];
 for (const route of ['/','/shop','/products/yunnan-puer-gold-from-2003','/privacy']) {
 await page.goto('http://127.0.0.1:3001'+route,{waitUntil:'load'});
 await page.setViewportSize({width:320,height:900});
 await page.evaluate(()=>document.documentElement.style.fontSize='200%');
 data.push(await page.evaluate(()=>({route:location.pathname,overflow:document.documentElement.scrollWidth>innerWidth,offenders:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1&&e.getBoundingClientRect().width>0&&getComputedStyle(e).position!=='absolute').slice(0,15).map(e=>({tag:e.tagName,cls:e.className,width:e.getBoundingClientRect().width,text:e.textContent.slice(0,50)}))})));
 } return data;
}
