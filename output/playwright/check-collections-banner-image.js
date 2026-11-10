async (page) => {
 const banner=page.locator('.collections-banner');
 await banner.scrollIntoViewIfNeeded();
 await banner.locator('img').evaluate(img=>img.decode());
 return await banner.locator('img').evaluate(img=>({loaded:img.complete,naturalWidth:img.naturalWidth}));
}
