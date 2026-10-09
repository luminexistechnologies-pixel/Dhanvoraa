import assert from 'node:assert/strict';
import {normalizePrices,createPriceService,GRAMS_PER_TROY_OUNCE} from '../dhanvoraa-site/prices.mjs';
let now=Date.now(),calls=0,fail=false;
const payload=()=>({ts:now,items:[{curr:'INR',xauPrice:10000*GRAMS_PER_TROY_OUNCE,xagPrice:100*GRAMS_PER_TROY_OUNCE}]});
assert.equal(normalizePrices(payload(),now).metals.gold.spot,10000);
assert.equal(normalizePrices(payload(),now).metals.silver.spot,100);
for(const mutate of [p=>p.ts=now-300001,p=>p.ts=now+60001,p=>p.items[0].xauPrice=0,p=>p.items[0].curr='USD',p=>p.items[0].xagPrice=-1,p=>p.items=null,p=>p.ts=String(now)]){
 const p=payload();mutate(p);assert.throws(()=>normalizePrices(p,now));
}
const service=createPriceService({endpoint:'https://licensed-feed.example/INR',clock:()=>now,fetcher:async()=>{calls++;await Promise.resolve();if(fail)throw Error('offline');return Response.json(payload());}});
const responses=await Promise.all([service(),service(),service()]);assert.equal(calls,1);assert.ok(responses.every(r=>r.status===200));
await service();assert.equal(calls,1);
now+=60001;await service();assert.equal(calls,2);
fail=true;now+=60001;assert.equal((await service()).status,200,'Fresh cached quote survives upstream failure');
await service();assert.equal(calls,3,'Cooldown prevents duplicate failed fetches');
now+=300001;const stale=await service();assert.equal(stale.status,503);assert.equal((await stale.json()).status,'unavailable');
const offline=createPriceService({endpoint:'https://licensed-feed.example/INR',clock:()=>now,fetcher:()=>{throw Error('synchronous failure');}});
assert.equal((await offline()).status,503);now+=60001;assert.equal((await offline()).status,503);
const disabled=createPriceService({fetcher:()=>{assert.fail('Unconfigured provider must not be contacted');}});
assert.equal((await disabled()).status,503);
const worker=(await import('../dhanvoraa-site/dist/server/index.js')).default;
for(const [pathname,status] of [['/',200],['/gold-price/',200],['/silver-price/',200],['/gold-price',308],['/index.html',308],['/missing/',404],['/server/index.js',404],['/.openai/hosting.json',403]])assert.equal((await worker.fetch(new Request('https://example.test'+pathname))).status,status,pathname);
const logo=await worker.fetch(new Request('https://example.test/assets/wordmark-transparent.png'));assert.equal(logo.headers.get('content-type'),'image/png');assert.ok((await logo.arrayBuffer()).byteLength>10000);
assert.equal((await worker.fetch(new Request('https://example.test/',{method:'POST'}))).status,405);
assert.equal((await worker.fetch(new Request('https://example.test/api/metal-prices'))).status,503);
console.log('PASS: provisional feed contract, ounce-to-gram conversion, caching, outage/expiry, disabled feed, Worker routes and PNG. Live provider access remains unverified.');
