async (page) => {
 await page.goto('http://localhost:3001',{waitUntil:'domcontentloaded'});
 const cta=page.locator('.collections-banner .button');
 await cta.scrollIntoViewIfNeeded();
 await page.mouse.move(0,0);
 await page.waitForTimeout(250);
 const read=()=>cta.evaluate(el=>({background:getComputedStyle(el).backgroundColor,texture:getComputedStyle(el,'::before').backgroundImage,opacity:getComputedStyle(el,'::before').opacity,transform:getComputedStyle(el).transform}));
 const normal=await read();
 await cta.hover(); await page.waitForTimeout(250);
 const hover=await read();
 await page.mouse.move(0,0); await cta.focus(); await page.waitForTimeout(250);
 const focus=await read();
 await page.setViewportSize({width:1440,height:1000});
 await cta.scrollIntoViewIfNeeded();
 await page.locator('.collections-banner').screenshot({path:'output/playwright/collections-banner-cta-desktop.png'});
 await page.setViewportSize({width:390,height:844});
 await cta.scrollIntoViewIfNeeded();
 await page.locator('.collections-banner').screenshot({path:'output/playwright/collections-banner-cta-mobile.png'});
 return {normal,hover,focus,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)};
}
