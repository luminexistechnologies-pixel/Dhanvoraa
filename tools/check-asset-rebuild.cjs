const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');const {spawn}=require('node:child_process');
const site=path.resolve('dhanvoraa-site');const image=path.join(site,'dist/assets/brand.jpeg');
const before=fs.statSync(image).mtimeMs;
const run=()=>new Promise((resolve,reject)=>{const p=spawn(process.execPath,['build.mjs'],{cwd:site,stdio:['ignore','pipe','pipe']});let error='';p.stderr.on('data',d=>error+=d);p.once('error',reject);p.once('exit',c=>c===0?resolve():reject(Error(error)));});
Promise.all([run(),run()]).then(()=>{assert.equal(fs.statSync(image).mtimeMs,before);console.log('PASS: Simultaneous builds succeed and leave unchanged brand assets untouched.');}).catch(e=>{console.error(e);process.exitCode=1;});
