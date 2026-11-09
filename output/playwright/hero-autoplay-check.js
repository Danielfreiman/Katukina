async page => {
  await page.goto('http://localhost:3001/');
  await page.mouse.move(0, 0);
  await page.clock.install();
  const selected = () => page.locator('[role=tab][aria-selected=true]').getAttribute('id');
  const initial = await selected();
  await page.clock.fastForward(6100);
  const automatic = await selected();
  if(initial === automatic) throw new Error('Autoplay did not advance');
  await page.getByRole('button', {name:'Pause slideshow',exact:true}).click();
  await page.mouse.move(0, 0);
  const paused = await selected();
  await page.clock.fastForward(13000);
  if(await selected() !== paused) throw new Error('Pause failed');
  await page.getByRole('button', {name:'Play slideshow',exact:true}).click();
  await page.mouse.move(0, 0);
  await page.clock.fastForward(6100);
  if(await selected() === paused) throw new Error('Resume failed');
  await page.getByRole('button', {name:'Pause slideshow',exact:true}).click();
  const sizes=[];
  for(const width of [1440,375,320]) {
    await page.setViewportSize({width,height:1000});
    await page.screenshot({path:'output/playwright/hero-autoplay-'+width+'.png'});
    sizes.push(await page.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth})));
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.reload();
  await page.getByRole('button',{name:'Play slideshow',exact:true}).waitFor();
  await page.emulateMedia({reducedMotion:'no-preference'});
  return {automatic:true,pause:true,resume:true,reducedMotion:true,sizes};
}
