const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const format=n=>new Intl.NumberFormat('en-IN',{maximumFractionDigits:6}).format(n);
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1050}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  let mode='available',requests=[];
  await page.route('**/api/metal-prices',route=>{
   requests.push(route.request().url());
   const timestamp=new Date(Date.now()-(mode==='stale'?360000:0)).toISOString();
   const body=mode==='unavailable'?{status:'unavailable'}:{status:'available',timestamp,metals:{gold:{spot:10000,currency:'INR',unit:'gram'},silver:{spot:100,currency:'INR',unit:'gram'}}};
   return route.fulfill({status:mode==='unavailable'?503:200,contentType:'application/json',body:JSON.stringify(body)});
  });
  await page.goto('http://127.0.0.1:4175/');
  await page.locator('[data-quote-status]').filter({hasText:'Latest reference rate'}).waitFor();
  assert.equal(await page.locator('[data-metal-estimate]').innerText(),format(6000/10000)+' g Gold');
  assert.match(await page.locator('[data-rate-time]').innerText(),/IST/);
  await page.locator('[name=metal]').selectOption('Silver');assert.equal(await page.locator('[data-metal-estimate]').innerText(),format(6000/100)+' g Silver');
  await page.locator('[name=amount]').fill('1000');await page.locator('[name=frequency]').selectOption('weekly');
  assert.equal(await page.locator('[data-metal-estimate]').innerText(),format(52000/100)+' g Silver');
  await page.locator('[name=amount]').fill('');assert.equal(await page.locator('[data-metal-estimate]').innerText(),'Enter a valid amount');
  for(const route of ['/gold-price/','/silver-price/','/goal-based-savings/']){
   await page.goto('http://127.0.0.1:4175'+route);await page.locator('[data-quote-status]').filter({hasText:'Latest reference rate'}).waitFor();
   assert.equal(await page.locator('[name=metal]').inputValue(),route==='/silver-price/'?'Silver':'Gold');
   assert.ok(!/oropocket|goldprice\.org|source:/i.test(await page.locator('body').innerText()),'No visible provider branding');
   assert.equal(await page.locator('a[href*="goldprice.org"],a[href*="oropocket"]').count(),0);
  }
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:1000});await page.goto('http://127.0.0.1:4175/silver-price/');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No overflow at '+width);
   const logo=page.locator('.footer-brand img');assert.equal(await logo.getAttribute('src'),'/assets/wordmark-transparent.png');
   const styles=await logo.evaluate(e=>({blend:getComputedStyle(e).mixBlendMode,mask:getComputedStyle(e).maskImage}));assert.deepEqual(styles,{blend:'normal',mask:'none'});
  }
  await page.setViewportSize({width:1440,height:1050});await page.goto('http://127.0.0.1:4175/');await page.locator('[data-quote-status]').filter({hasText:'Latest reference rate'}).waitFor();
  await page.locator('[data-planner]').screenshot({path:'tools/live-calculator-desktop.png'});
  await page.locator('footer').screenshot({path:'tools/footer-transparent-desktop.png'});
  const credit=page.locator('.footer-bottom a');assert.equal(await credit.getAttribute('href'),'https://www.luminexistechnologies.com');assert.equal(await credit.getAttribute('target'),'_blank');
  for(const failure of ['unavailable','stale']){
   mode=failure;await page.reload();await page.locator('[data-quote-status]').filter({hasText:'Rates unavailable'}).waitFor();
   assert.equal(await page.locator('[data-metal-estimate]').innerText(),'Rate unavailable');assert.equal(await page.locator('[data-current-rate]').innerText(),'\u2014');assert.match(await page.locator('[data-total]').innerText(),/6,000/);
  }
  mode='available';await page.locator('[data-refresh-rates]').click();await page.locator('[data-quote-status]').filter({hasText:'Latest reference rate'}).waitFor();
  assert.ok(requests.every(url=>new URL(url).search===''),'No planner inputs sent to API');assert.deepEqual(errors,[]);
  await page.unroute('**/api/metal-prices');await page.reload();await page.locator('[data-quote-status]').filter({hasText:'Rates unavailable'}).waitFor({timeout:15000});
  const real=await page.request.get('http://127.0.0.1:4175/api/metal-prices');assert.equal(real.status(),503);const data=await real.json();assert.equal(data.status,'unavailable');assert.equal(data.source,undefined);
  assert.equal(await page.locator('[data-metal-estimate]').innerText(),'Rate unavailable');
  console.log('PASS: spot calculations with fixtures, switching, validation, mobile layout, hidden source branding, expiry/recovery and honest unavailable state. Live access remains blocked.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

