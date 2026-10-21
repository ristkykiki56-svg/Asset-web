import puppeteer from 'puppeteer-core';
import {mkdirSync} from 'node:fs';

const base='http://127.0.0.1:'+(process.env.PORT||'8765');
const chrome=process.env.CHROME;
if(!chrome)throw new Error('CHROME executable missing');
mkdirSync('/tmp/twinshooter-qa',{recursive:true});

const browser=await puppeteer.launch({
  executablePath:chrome,
  headless:true,
  args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']
});
const page=await browser.newPage();
const errors=[];
page.on('pageerror',e=>errors.push('JS: '+e.message));
page.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text())});
page.on('requestfailed',req=>errors.push('fetch: '+req.url()+' '+req.failure()?.errorText));
const assert=(truth,message)=>{if(!truth)throw new Error(message)};
async function waitRendered(doc,pageNo,timeout=45000){
 const key=doc+':'+pageNo;
 try{
   await page.waitForFunction((expected)=>document.documentElement.dataset.pdfRendered===expected,{timeout},key);
 } catch(e) {
   const state=await page.evaluate(()=>({
     render:document.documentElement.dataset.pdfRendered,
     loading:document.getElementById('pdfLoading')?.textContent,
     error:document.getElementById('pdfError')?.hidden,
     canvas:document.getElementById('pdfCanvas')?.width
   }));
   throw new Error('PDF render '+key+' timeout: '+JSON.stringify(state)+'; '+errors.slice(-9).join('; '));
 }
}
async function openDoc(doc,width,height,screenshot){
 await page.setViewport({width,height,deviceScaleFactor:1});
 const suffix=doc==='minutes'?'?doc=minutes':'';
 const response=await page.goto(base+'/rules.html'+suffix,{waitUntil:'domcontentloaded',timeout:30000});
 assert(response.ok(),'Rules HTTP '+response.status());
 await waitRendered(doc,1);
 if(screenshot){
   await page.evaluate(()=>document.querySelector('.rules-reading').scrollIntoView({block:'start'}));
   await page.screenshot({path:'/tmp/twinshooter-qa/rules-'+doc+'-'+(width<=430?'mobile':'desktop')+'.png'});
 }
 const state=await page.evaluate(()=>({
  total:document.getElementById('pageTotal').textContent,
  page:document.getElementById('pageNumber').value,
  canvas:document.getElementById('pdfCanvas').width,
  current:document.querySelector('.rules-document.is-selected')?.dataset.document,
  overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
  pdfTop:document.getElementById('pdfViewport').getBoundingClientRect().top + window.scrollY,
  pdfHeight:document.getElementById('pdfViewport').getBoundingClientRect().height,
  pdfWidth:document.getElementById('pdfViewport').getBoundingClientRect().width,
  canvasWidth:parseInt(document.getElementById('pdfCanvas').style.width,10),
  canvasHeight:parseInt(document.getElementById('pdfCanvas').style.height,10),
  searchOpen:document.getElementById('rulesSearchDisclosure').open,
  noteOpen:document.getElementById('rulesContextDisclosure').open
 }));
 assert(state.canvas>100&&state.page==='1','Invalid rendered canvas: '+JSON.stringify(state));
 assert(Number(state.total)===(doc==='rules'?110:45),'Incorrect PDF page count '+JSON.stringify(state));
 assert(state.current===doc,'Wrong active document '+JSON.stringify(state));
 assert(state.overflow<=3,'Horizontal body overflow '+JSON.stringify(state));
 assert(state.pdfTop<(width<=430?620:450),'PDF pushed too far below navigation: '+JSON.stringify(state));
 assert(state.pdfHeight>=(width<=430?350:500),'PDF reading area too short: '+JSON.stringify(state));
 if(width<=430)assert(state.pdfHeight<=state.canvasHeight+28,'Mobile PDF leaves avoidable empty area: '+JSON.stringify(state));
 assert(state.canvasWidth>=state.pdfWidth*0.84,'PDF does not fill available width: '+JSON.stringify(state));
 assert(!state.searchOpen&&!state.noteOpen,'Secondary panels must start collapsed');
}
try {
 await openDoc('rules',1440,1060,true);
 await openDoc('rules',390,900,true);
 for(const width of [320,360,430,768,1100]){
   await page.setViewport({width,height:900,deviceScaleFactor:1});
   await new Promise(resolve=>setTimeout(resolve,250));
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
   assert(overflow<=3,'Overflow at width '+width+': '+overflow);
 }
 await page.setViewport({width:390,height:900});
 await page.click('#pageNext');
 await waitRendered('rules',2);
 assert((await page.$eval('#pageNumber',x=>x.value))==='2','Next page failed');
 await page.click('#pagePrev');
 await waitRendered('rules',1);
 const baseline=await page.$eval('#pdfCanvas',x=>parseInt(x.style.width,10));
 await page.click('#zoomIn');
 await page.waitForFunction(w=>parseInt(document.getElementById('pdfCanvas').style.width,10)>w+35,{timeout:15000},baseline);
 assert((await page.$eval('#zoomLabel',x=>x.textContent))==='125%','Zoom was not applied');
 await page.click('#zoomReset');
 await page.waitForFunction(()=>document.getElementById('zoomLabel').textContent==='Lebar',{timeout:15000});
 // Inspect the unusual landscape page in the 2025 source: fit-width still holds.
 await page.$eval('#pageNumber',x=>{x.value='64';x.dispatchEvent(new Event('change',{bubbles:true}))});
 await waitRendered('rules',64);
 const landscape=await page.$eval('#pdfCanvas',c=>({w:parseInt(c.style.width,10),h:parseInt(c.style.height,10)}));
 assert(landscape.w>landscape.h,'Landscape PDF page not preserved: '+JSON.stringify(landscape));
 await page.$eval('#pageNumber',x=>{x.value='110';x.dispatchEvent(new Event('change',{bubbles:true}))});
 await waitRendered('rules',110);
 assert((await page.$eval('#pdfPageText',x=>x.textContent.length))>100,'Last rules page text unavailable');
 await openDoc('minutes',1440,1060,true);
 await openDoc('minutes',390,900,true);
 // Expand the secondary search panel; it should not occupy the initial reading space.
 await page.click('#rulesSearchDisclosure > summary');
 assert(await page.$eval('#rulesSearchDisclosure',e=>e.open),'Search panel failed to open');
 // Search text in the original document: results lead to a page, not word highlighting.
 await page.$eval('#pdfSearchInput',x=>{x.value='General Assembly';x.dispatchEvent(new Event('input',{bubbles:true}))});
 await page.click('#pdfSearchButton');
 await page.waitForFunction(()=>/halaman ditemukan|Tidak ada halaman|belum berhasil/.test(document.getElementById('searchStatus').textContent),{timeout:60000});
 const searchText=await page.$eval('#searchStatus',e=>e.textContent);
 assert(searchText.includes('halaman ditemukan'),'Minutes search failed: '+searchText);
 await page.$eval('#pageNumber',x=>{x.value='45';x.dispatchEvent(new Event('change',{bubbles:true}))});
 await waitRendered('minutes',45);
 assert((await page.$eval('#pdfPageText',x=>x.textContent.length))>30,'Last minutes page text unavailable');
 assert((await page.$eval('#openPdf',e=>e.getAttribute('href')))==='/assets/documents/imssu-oga-minutes-2026.pdf','Minutes direct PDF link broken');
 await page.click('#docChoiceRules');
 await waitRendered('rules',1);
 console.log('PASS: compact Rules layout, dominant PDF area, 110/45 pages, search, zoom, page 64 landscape, mobile/desktop');
} finally {
 await browser.close();
}
