async (page) => {
 const reject=page.getByRole('button',{name:'Reject optional',exact:true});
 if(await reject.isVisible()) await reject.click();
 await page.locator('.collection-paths').scrollIntoViewIfNeeded();
 await page.screenshot({path:'output/playwright/categories-mobile-swipe-hint.png'});
 return {hintVisible:await page.getByText('Swipe to explore',{exact:true}).isVisible()};
}
