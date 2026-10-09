const fs=require('fs');
const file='dhanvoraa-site/build.mjs';
let text=fs.readFileSync(file,'utf8');
const changes=[
 ['<a class="brand" href="/" aria-label="Dhanvoraa home"><img src="/assets/brand.jpeg" width="48" height="48" alt=""><span>Dhanvoraa<small>SAVE SMALL. BUILD REAL.</small></span></a>','<a class="brand nav-brand" href="/" aria-label="Dhanvoraa home"><img src="/assets/wordmark.jpeg" width="1600" height="533" alt="Dhanvoraa" fetchpriority="high"></a>'],
 ["${icon('book')}</button><nav",'<span class="menu-lines" aria-hidden="true"><span></span><span></span><span></span></span></button><nav'],
 ['step="1" value="500" inputmode="numeric" required','step="0.01" value="500" inputmode="decimal" aria-describedby="amount-error" required'],
 ['value="500" inputmode="decimal" aria-describedby="amount-error" required></div></label>','value="500" inputmode="decimal" aria-describedby="amount-error" required></div><span id="amount-error" class="input-error" data-amount-error hidden>Enter ₹1–₹1,00,00,000, with up to two decimal places.</span></label>'],
 ['<div class="planner-result" aria-live="polite"><span>Your planned contributions</span>','<div class="planner-result" aria-live="polite"><span data-plan-purpose>My future · Gold</span><span>Your planned contributions</span>'],
 ['<p class="fine">A planning illustration, not a payment instruction or a forecast of metal value. No returns, taxes or fees are included.</p>','<p class="fine" data-frequency-note hidden>Daily and weekly contribution counts use a 365-day, 52-week planning year. Actual payment dates can differ.</p><p class="fine">A planning illustration, not a payment instruction or a forecast of metal value. No returns, taxes or fees are included.</p>'],
 ['No live buy or sell price is displayed in this preview. Check the current rate, timestamp, taxes and charges in the Augmont experience before making a purchase.','For current rates, check the Augmont experience. Review the buy and sell prices, timestamp, taxes and charges before making a purchase.']
];
for(const[from,to]of changes){if(!text.includes(from))throw Error('Missing expected source: '+from);text=text.replaceAll(from,to);}
text=text.split('\n').filter(line=>!line.startsWith('const dialogs=')).join('\n');
fs.writeFileSync(file,text);
