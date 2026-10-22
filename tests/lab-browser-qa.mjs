import puppeteer from 'puppeteer-core';
import {mkdirSync,writeFileSync} from 'node:fs';
const base='http://127.0.0.1:'+(process.env.PORT||8765);
const out='/tmp/twinshooter-qa';mkdirSync(out,{recursive:true});
const browser=await puppeteer.launch({executablePath:process.env.CHROME,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
const page=await browser.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
try{
 await page.setViewport({width:1500,height:1000});
 await page.goto(base+'/tests/lab-workspace.html',{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(()=>['pass','fail'].includes(document.querySelector('#result')?.dataset.status),{timeout:60000});
 const result=await page.$eval('#result',e=>({status:e.dataset.status,text:e.textContent}));
 writeFileSync(out+'/lab-workspace-result.json',JSON.stringify({result,errors},null,2));
 if(result.status!=='pass'||errors.length)throw new Error(result.text+'; '+errors.join('; '));
 console.log('Lab workspace browser QA PASS: '+result.text);
}catch(error){
 writeFileSync(out+'/lab-viewport-result.html',await page.content());
 await page.screenshot({path:out+'/lab-workspace-failure.png',fullPage:true});
 throw new Error(error.message+'; browser errors: '+errors.join('; '));
}finally{await browser.close();}
