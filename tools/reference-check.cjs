const fs = require('fs');
const { chromium } = require('playwright');
(async () => {
 const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const page = await browser.newPage({viewport:{width:1440,height:1000},ignoreHTTPSErrors:true});
 await page.goto('https://demowv.gfau.augmont.com/digi-gold',{waitUntil:'networkidle',timeout:45000}).catch(e => console.log(e.message));
 await page.screenshot({path:'tools/reference.png',fullPage:true});
 fs.writeFileSync('tools/reference-rendered.html',await page.content());
 console.log(await page.locator('body').innerText());
 console.log(await page.evaluate(()=> [...document.querySelectorAll('*')].map(e=>getComputedStyle(e).backgroundColor).filter(x=>x!=='rgba(0, 0, 0, 0)').reduce((a,x)=>(a[x]=(a[x]||0)+1,a),{})));
 await browser.close();
})();
