const {spawn}=require('node:child_process');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const root=path.resolve('dhanvoraa-site');const source=path.join(root,'styles.css');const original=fs.readFileSync(source,'utf8');
 const child=spawn(process.execPath,['dev.mjs'],{cwd:root,env:{...process.env,PORT:'4174'},stdio:['ignore','pipe','pipe']});
 let browser;
 try{
  await new Promise((resolve,reject)=>{let log='';const timer=setTimeout(()=>reject(Error('Preview startup timed out')),15000);child.stdout.on('data',d=>{log+=d;if(log.includes('Local URL: http://127.0.0.1:4174')){clearTimeout(timer);resolve();}});child.stderr.on('data',d=>{clearTimeout(timer);reject(Error(d.toString()));});child.once('exit',code=>{clearTimeout(timer);reject(Error('Dev server exited: '+code));});});
  browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const page=await browser.newPage();
  await page.goto('http://127.0.0.1:4174/');await page.waitForFunction(()=>typeof live!=='undefined'&&live.readyState===EventSource.OPEN);
  const navigation=page.waitForEvent('framenavigated',{predicate:frame=>frame===page.mainFrame(),timeout:15000});
  fs.writeFileSync(source+'.tmp',original+'\n/* live refresh verification */\n');fs.renameSync(source+'.tmp',source);
  await navigation;await page.waitForLoadState('domcontentloaded');await page.waitForFunction(()=>typeof live!=='undefined'&&live.readyState===EventSource.OPEN);
  const restored=page.waitForEvent('framenavigated',{predicate:frame=>frame===page.mainFrame(),timeout:15000});
  fs.writeFileSync(source+'.tmp',original);fs.renameSync(source+'.tmp',source);await restored;
  assert.equal(fs.readFileSync(path.join(root,'dist/styles.css'),'utf8'),original);
  console.log('PASS: Dev command builds and starts, uses configured PORT, and rebuilds/reloads after two consecutive atomic file saves.');
 }finally{fs.writeFileSync(source,original);if(browser)await browser.close();child.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
