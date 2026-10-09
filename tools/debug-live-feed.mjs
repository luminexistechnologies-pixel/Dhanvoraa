import {normalizePrices} from '../dhanvoraa-site/prices.mjs';
for(const url of ['https://api.oropocket.com/public/prices','http://127.0.0.1:4175/api/metal-prices']){
 try{const r=await fetch(url,{signal:AbortSignal.timeout(12000)});const p=await r.json();console.log(url,r.status,JSON.stringify(p),new Date().toISOString());if(p.data)try{console.log('normalized',normalizePrices(p));}catch(e){console.log('Validation:',e.message);}}
 catch(e){console.log(url,e.message,e.cause?.code);}
}
