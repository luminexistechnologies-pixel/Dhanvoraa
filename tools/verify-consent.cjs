const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const context=await b.newContext();const page=await context.newPage();let loads=0;
  await page.route('**/config.json',route=>route.fulfill({json:{analyticsScriptUrl:'/test-analytics.js'}}));
  await page.route('**/test-analytics.js',route=>{loads++;return route.fulfill({contentType:'application/javascript',body:'window.gtag=(...args)=>{window.analyticsCalls=(window.analyticsCalls||0)+1};window.analyticsReady=true;'});});
  await page.goto('http://127.0.0.1:4173/');await page.locator('.consent').waitFor({state:'visible'});assert.equal(loads,0);
  await page.evaluate(()=>{window.analyticsCalls=0;window.gtag=()=>window.analyticsCalls++;document.querySelector('[data-start]').dispatchEvent(new Event('click'));});
  assert.equal(await page.evaluate(()=>window.analyticsCalls),0,'Analytics calls gated before consent');
  await page.locator('[data-consent=declined]').click();assert.equal(loads,0);await page.reload();await page.waitForFunction(()=>localStorage.getItem('dhanvoraa-analytics-consent')==='declined');assert.equal(await page.locator('.consent').isVisible(),false);
  await page.evaluate(()=>localStorage.removeItem('dhanvoraa-analytics-consent'));await page.reload();await page.locator('[data-consent=accepted]').click();await page.waitForFunction(()=>window.analyticsReady);assert.equal(loads,1);
  await page.evaluate(()=>document.querySelector('[data-start]').dispatchEvent(new Event('click')));assert.equal(await page.evaluate(()=>window.analyticsCalls),1);
  console.log('PASS: Analytics script and events stay gated before consent, decline persists, and acceptance loads the tracker once and enables click tracking.');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
