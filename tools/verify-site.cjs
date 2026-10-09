const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const routes=['/','/about-us/','/gold/','/silver/','/buy-gold-silver/','/goal-based-savings/','/gold-price/','/silver-price/','/learn/','/how-it-works/','/contact/','/privacy-policy/','/terms-and-conditions/','/refund-cancellation/','/disclaimer/'];
for(const route of routes){const res=await page.goto('http://127.0.0.1:4173'+route);assert.equal(res.status(),200,route);assert.equal(await page.locator('h1').count(),1,route);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Desktop overflow ${route}`);}
await page.goto('http://127.0.0.1:4173/goal-based-savings/');
assert.equal(await page.locator('[data-total]').innerText(),'₹6,000');
await page.locator('[name=amount]').fill('1000');assert.equal(await page.locator('[data-total]').innerText(),'₹12,000');
await page.locator('[name=frequency]').selectOption('weekly');assert.equal(await page.locator('[data-total]').innerText(),'₹52,000');
await page.locator('[name=frequency]').selectOption('daily');assert.equal(await page.locator('[data-total]').innerText(),'₹3,65,000');
await page.locator('[name=amount]').fill('-1');assert.equal(await page.locator('[data-total]').innerText(),'Enter a valid amount');
await page.goto('http://127.0.0.1:4173/');await page.locator('details summary').first().click();assert.equal(await page.locator('details').first().getAttribute('open'),'');
assert.equal(await page.locator('[data-start]').first().getAttribute('href'),'https://demowv.gfau.augmont.com/digi-gold');
assert.equal(await page.locator('[data-start]').first().getAttribute('target'),'_blank');
await page.screenshot({path:'tools/home-desktop-full.png',fullPage:true});
await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:4173/');
await page.locator('.menu-toggle').click();assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');assert.equal(await page.locator('nav').isVisible(),true);
await page.keyboard.press('Escape');assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
await page.screenshot({path:'tools/home-mobile-full.png',fullPage:true});
for(const width of [320,390,768]){await page.setViewportSize({width,height:900});for(const route of routes){await page.goto('http://127.0.0.1:4173'+route);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Overflow at ${width}: ${route}`);}}
await page.setViewportSize({width:1440,height:1000});await page.goto('http://127.0.0.1:4173/');await page.addStyleTag({content:'html {font-size:32px}'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Text enlargement overflow');
const missing=await page.goto('http://127.0.0.1:4173/missing/');assert.equal(missing.status(),404);
assert.deepEqual(errors,[]);
console.log('PASS: All 15 routes at desktop, 320px, 390px and 768px; planner calculations and invalid input; FAQ; mobile menu; demo CTAs; 200% text; 404; no runtime errors.');
await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
