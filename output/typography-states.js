async page => {
 const results=[];
 await page.setViewportSize({width:320,height:900});
 await page.goto('http://127.0.0.1:3001/privacy',{waitUntil:'load'});
 await page.evaluate(()=>document.documentElement.style.fontSize='200%');
 results.push(await page.evaluate(()=>({state:'privacy text 200%',width:320,overflow:document.documentElement.scrollWidth>innerWidth,footerColumns:getComputedStyle(document.querySelector('.footer-links')).gridTemplateColumns})));
 await page.screenshot({path:'output/playwright/typeset-final-privacy-zoom.png',fullPage:true});
 await page.setViewportSize({width:390,height:900});
 await page.goto('http://127.0.0.1:3001/cookies',{waitUntil:'load'});
 await page.getByRole('button',{name:'Cookie settings',exact:true}).first().click();
 const dialog=page.getByRole('dialog');
 await dialog.waitFor({state:'visible'});
 results.push({state:'cookie preferences',width:390,box:await dialog.boundingBox(),font:await dialog.locator('h2').evaluate(e=>({size:getComputedStyle(e).fontSize,family:getComputedStyle(e).fontFamily}))});
 await page.screenshot({path:'output/playwright/typeset-final-cookie-preferences.png'});
 await page.getByRole('button',{name:'Close cookie settings',exact:true}).click();
 await page.getByRole('button',{name:'Open menu',exact:true}).click();
 results.push({state:'mobile menu',visible:await page.getByRole('navigation',{name:'Mobile navigation',exact:true}).isVisible(),overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
 const ctx=await page.context().browser().newContext({viewport:{width:390,height:900}});
 const fallback=await ctx.newPage();
 await fallback.route('**/*.woff2',r=>r.abort());
 await fallback.goto('http://127.0.0.1:3001/',{waitUntil:'load'});
 await fallback.evaluate(()=>document.fonts.ready);
 results.push(await fallback.evaluate(()=>({state:'font files unavailable',overflow:document.documentElement.scrollWidth>innerWidth,fonts:[...document.fonts].map(f=>({family:f.family,status:f.status})),visibleTitle:document.querySelector('.rh-campaign h2')?.getBoundingClientRect().height>0})));
 await fallback.screenshot({path:'output/playwright/typeset-final-fallback.png'});
 await ctx.close();
 return results;
}
