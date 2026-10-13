// ROAD 1ST real Chromium smoke: genuine portal CSS at phone/desktop widths and
// browser-native print of synthetic Unicode report. No login or customer data.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
(async()=>{
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
try{
for(const width of [390,1280]){
 const ctx=await browser.newContext({viewport:{width,height:850},acceptDownloads:true});
 const page=await ctx.newPage();
 await page.goto(pathToFileURL(path.resolve('index.html')).href,{waitUntil:'domcontentloaded'});
 await page.evaluate(()=>{
  document.getElementById('reportViewer').classList.remove('hidden');
  document.getElementById('viewerTitle').textContent='ROAD 1ST Synthetic Fleet Report';
  const body=document.getElementById('viewerContent');
  body.textContent='';
  const heading=document.createElement('h3');heading.textContent='Journey summary — Δοκιμή – Français – Gaeilge';
  body.appendChild(heading);
  const row=document.createElement('div');row.className='viewer-row';
  const label=document.createElement('span');label.textContent='Started';
  const data=document.createElement('strong');data.textContent='2026-10-13 13:00 Europe/Dublin';
  row.append(label,data);body.appendChild(row);
 });
 const metrics=await page.evaluate(()=>{
  const buttons=[...document.querySelectorAll('.viewer-actions button')];
  const b=buttons.map(el=>{let r=el.getBoundingClientRect();return {left:r.left,right:r.right,height:r.height}});
  return{vw:window.innerWidth, docw:document.documentElement.scrollWidth, buttons:b};
 });
 if(width===390){
   assert(metrics.buttons.every(b=>b.left>=0&&b.right<=width+1&&b.height>=44),'print/download/close actions fit 390px phone');
 }
 assert.equal(metrics.buttons.length,4,'four report actions');
 const lang=await page.evaluate(()=>window.ROAD1ST_FLEET_PRINT?.languages?.length);
 assert.equal(lang,32,'32 manager print locales');
 // Click a synthetic local action; do not bypass authentication or fetch a real report.
 await page.evaluate(()=>{
  const button=document.createElement('button');button.id='synthetic-print-test';
  button.onclick=()=>window.ROAD1ST_FLEET_PRINT.open(
   document.getElementById('viewerContent'),
   'Synthetic Journey','synthetic-report.jsonl','el','Synthetic Fleet A');
  document.body.appendChild(button);
 });
 const popupPromise=page.waitForEvent('popup',{timeout:20000});
 await page.click('#synthetic-print-test');
 const popup=await popupPromise;
 await popup.waitForLoadState('domcontentloaded');
 const body=await popup.locator('body').innerText();
 assert(body.includes('Synthetic Fleet A'),'company printed');
 assert(body.includes('Δοκιμή'),'Greek glyph preserved');
 assert(body.includes('Français'),'French glyph preserved');
 assert(body.includes('Gaeilge'),'Irish label preserved');
 assert(body.includes('synthetic-report.jsonl'),'source name preserved');
 assert.equal(await popup.locator('img,script,iframe').count(),0,'no external copied resources');
 const pdf=await popup.pdf({format:'A4',printBackground:true});
 assert(pdf.length>1000 && pdf.subarray(0,4).toString()==='%PDF','Chromium produced an A4 PDF');
 console.log('PASS: '+width+'px viewport, 32 locales, company, Unicode, secure browser A4 PDF ('+pdf.length+' bytes)');
 await ctx.close();
}
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
