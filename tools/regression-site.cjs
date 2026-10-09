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
  for(const route of routes){await page.goto('http://127.0.0.1:4173'+route);const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();for(const v of result.violations)violations.push({route,id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))});}
  fs.writeFileSync('tools/accessibility-report.json',JSON.stringify(violations,null,2));
  if(violations.length)console.log(JSON.stringify(violations,null,2));assert.deepEqual(violations,[],'Accessibility checks');
  await page.goto('http://127.0.0.1:4173/');
  const wordmark=page.locator('.nav-brand img');assert.equal(await wordmark.getAttribute('src'),'/assets/wordmark-transparent.png');
  const box=await wordmark.boundingBox();assert.ok(box.width/box.height>2.99&&box.width/box.height<3.01,'Full logo preserves its aspect ratio');
  await page.locator('.menu-toggle').click();await page.mouse.click(360,760);assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false','Outside click closes menu');
  await page.locator('.menu-toggle').click();await page.keyboard.press('Escape');assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');assert.equal(await page.locator('.menu-toggle').evaluate(e=>e===document.activeElement),true,'Escape restores focus');
  await page.locator('.menu-toggle').click();await page.setViewportSize({width:1100,height:900});await page.setViewportSize({width:390,height:844});assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false','Resize resets menu');
  await page.locator('[name=amount]').fill('1.25');assert.equal(await page.locator('[data-total]').innerText(),'₹15');
  await page.locator('[name=amount]').fill('1.234');assert.equal(await page.locator('[data-total]').innerText(),'Enter a valid amount');assert.equal(await page.locator('[name=amount]').getAttribute('aria-invalid'),'true');
  await page.locator('[name=amount]').fill('');assert.equal(await page.locator('[data-total]').innerText(),'Enter a valid amount');
  await page.locator('[name=amount]').fill('0');assert.equal(await page.locator('[data-total]').innerText(),'Enter a valid amount');
  await page.locator('[name=amount]').fill('10000001');assert.equal(await page.locator('[data-total]').innerText(),'Enter a valid amount');
  await page.locator('[name=amount]').fill('500');assert.equal(await page.locator('[data-amount-error]').isVisible(),false);
  await page.locator('[name=metal]').selectOption('Silver');await page.locator('[name=goal]').selectOption('Wedding');assert.equal(await page.locator('[data-plan-purpose]').innerText(),'Wedding · Silver');
  await page.locator('[name=frequency]').selectOption('weekly');assert.equal(await page.locator('[data-frequency-note]').isVisible(),true);
  await page.locator('[name=frequency]').selectOption('monthly');assert.equal(await page.locator('[data-frequency-note]').isVisible(),false);
  await page.goto('http://127.0.0.1:4173/');await page.addStyleTag({content:'html{font-size:32px}'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Mobile 200% type');
  for(const[url,status]of [['/assets/',404],['/assets',308],['/.openai/hosting.json',403],['/bad%zz',400],['/gold',308],['/gold/index.html',308],['/index.html',308],['/missing/',404]]){const r=await context.request.get('http://127.0.0.1:4173'+url,{maxRedirects:0});assert.equal(r.status(),status,url);}
  const head=await context.request.head('http://127.0.0.1:4173/');assert.equal(head.status(),200);assert.equal((await head.body()).length,0);
  const post=await context.request.post('http://127.0.0.1:4173/');assert.equal(post.status(),405);
  assert.deepEqual(errors,[]);
  console.log('PASS: 15 page accessibility audits, full navbar logo, outside-click/Escape/resize menu handling, decimal and invalid amounts, goal/metal summaries, mobile 200% text, canonical redirects, directory requests, HEAD and rejected methods.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
