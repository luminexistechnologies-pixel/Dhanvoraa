'use strict';
let analyticsAllowed=false;
function track(name,detail={}){
  window.dispatchEvent(new CustomEvent('dhanvoraa:analytics',{detail:{name,...detail}}));
  if(analyticsAllowed&&typeof window.gtag==='function')window.gtag('event',name,detail);
}
const menu=document.querySelector('.menu-toggle');
const navigation=document.querySelector('#navigation');
function setMenu(open,restoreFocus=false){
  if(!menu||!navigation)return;
  menu.setAttribute('aria-expanded',String(open));
  menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');
  navigation.classList.toggle('is-open',open);
  if(restoreFocus)menu.focus();
}
menu?.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
navigation?.addEventListener('click',e=>{if(e.target.closest('a'))setMenu(false);});
document.addEventListener('click',e=>{if(!e.target.closest('.nav-wrap'))setMenu(false);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true')setMenu(false,true);});
document.addEventListener('focusin',e=>{if(!e.target.closest('.nav-wrap'))setMenu(false);});
matchMedia('(min-width: 801px)').addEventListener('change',e=>{if(e.matches)setMenu(false);});
document.querySelectorAll('[data-start]').forEach(link=>link.addEventListener('click',()=>track('start_saving_click',{page:location.pathname,destination:'augmont'})));
document.querySelectorAll('details').forEach(d=>d.addEventListener('toggle',()=>{if(d.open)track('faq_open',{question:d.querySelector('summary').textContent.replace('+','').trim()});}));
async function configure(){
  try{
    const response=await fetch('/config.json');if(!response.ok)return;
    const config=await response.json();if(!config.analyticsScriptUrl)return;
    const banner=document.querySelector('.consent');if(!banner)return;
    let saved;try{saved=localStorage.getItem('dhanvoraa-analytics-consent');}catch{}
    let loaded=false;
    const enable=()=>{if(loaded)return;loaded=true;analyticsAllowed=true;const script=document.createElement('script');script.src=config.analyticsScriptUrl;script.async=true;document.head.append(script);};
    if(saved==='accepted')enable();else if(saved!=='declined')banner.hidden=false;
    banner.querySelectorAll('[data-consent]').forEach(button=>button.addEventListener('click',()=>{
      const value=button.dataset.consent;try{localStorage.setItem('dhanvoraa-analytics-consent',value);}catch{}
      banner.hidden=true;if(value==='accepted')enable();
    }));
  }catch{}
}
configure();
