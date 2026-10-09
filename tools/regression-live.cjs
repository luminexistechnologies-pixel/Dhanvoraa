const {chromium}=require('playwright');
const AxeBuilder=require('@axe-core/playwright').default;
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const routes=['/','/about-us/','/gold/','/silver/','/buy-gold-silver/','/goal-based-savings/','/gold-price/','/silver-price/','/learn/','/how-it-works/','/contact/','/privacy-policy/','/terms-and-conditions/','/refund-cancellation/','/disclaimer/'];
  const violations=[];
  let rateRequests=0;page.on('request',request=>{if(request.url().includes('/api/metal-prices'))rateRequests++;});
  for(const route of routes){await page.goto('http://127.0.0.1:4176'+route);assert.equal(await page.locator('[data-planner],[data-quote-panel],[data-metal-estimate],.price-calculator').count(),0,'Calculator removed: '+route);assert.ok(!/\bcalculator\b|\bplanner\b|oropocket|goldprice\.org/i.test(await page.locator('body').innerText()),'Retired copy removed: '+route);const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();for(const v of result.violations)violations.push({route,id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))});}
  fs.writeFileSync('tools/accessibility-report.json',JSON.stringify(violations,null,2));
  if(violations.length)console.log(JSON.stringify(violations,null,2));assert.deepEqual(violations,[],'Accessibility checks');
  await page.goto('http://127.0.0.1:4176/');
  const wordmark=page.locator('.nav-brand img');assert.equal(await wordmark.getAttribute('src'),'/assets/wordmark-transparent.png');
  const box=await wordmark.boundingBox();assert.ok(box.width/box.height>2.99&&box.width/box.height<3.01,'Full logo preserves its aspect ratio');
  await page.locator('.menu-toggle').click();await page.mouse.click(360,760);assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false','Outside click closes menu');
  await page.locator('.menu-toggle').click();await page.keyboard.press('Escape');assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');assert.equal(await page.locator('.menu-toggle').evaluate(e=>e===document.activeElement),true,'Escape restores focus');
  await page.locator('.menu-toggle').click();await page.setViewportSize({width:1100,height:900});await page.setViewportSize({width:390,height:844});assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false','Resize resets menu');
  await page.goto('http://127.0.0.1:4176/');await page.addStyleTag({content:'html{font-size:32px}'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Mobile 200% type');
  for(const[url,status]of [['/assets/',404],['/assets',308],['/.openai/hosting.json',403],['/bad%zz',400],['/gold',308],['/gold/index.html',308],['/index.html',308],['/missing/',404]]){const r=await context.request.get('http://127.0.0.1:4176'+url,{maxRedirects:0});assert.equal(r.status(),status,url);}
  const head=await context.request.head('http://127.0.0.1:4176/');assert.equal(head.status(),200);assert.equal((await head.body()).length,0);
  const post=await context.request.post('http://127.0.0.1:4176/');assert.equal(post.status(),405);
  for(const route of ['/','/goal-based-savings/','/gold-price/','/silver-price/']){for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});await page.goto('http://127.0.0.1:4176'+route);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No overflow: '+route+' '+width);}}
  await page.setViewportSize({width:1440,height:1050});await page.goto('http://127.0.0.1:4176/');await page.screenshot({path:'tools/home-without-calculator.png',fullPage:true});
  await page.goto('http://127.0.0.1:4176/goal-based-savings/');await page.screenshot({path:'tools/goals-without-calculator.png',fullPage:true});
  assert.equal(rateRequests,0,'No background rate polling');
  assert.equal((await context.request.get('http://127.0.0.1:4176/api/metal-prices')).status(),404,'Retired API removed');
  assert.equal(await page.locator('.footer-brand img').getAttribute('src'),'/assets/wordmark-transparent.png');
  assert.equal(await page.locator('.footer-bottom a').getAttribute('href'),'https://www.luminexistechnologies.com');
  assert.deepEqual(errors,[]);
  console.log('PASS: 15 page accessibility audits, full navbar logo, outside-click/Escape/resize menu handling, calculator and API removal, no rate polling, footer branding, four responsive layouts, mobile 200% text, canonical redirects, directory requests, HEAD and rejected methods.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});


