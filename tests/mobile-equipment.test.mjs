import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('hardware rail layout keeps every 44px hit area separated and connected to its source point',()=>{
 const html=read('lab.html');
 const svg=html.match(/<svg id="hardwareBlueprintSvg"[\s\S]*?<\/svg>/)?.[0];
 assert.ok(svg,'missing hardware diagram');
 const markers=[...svg.matchAll(/<g class="hw-marker cursor-pointer"[^>]*data-hw-key="([^"]+)"[^>]*>([\s\S]*?)<\/g>/g)].map(m=>{
  const key=m[1],body=m[2];
  const hit=body.match(/<rect class="hw-hitbox" x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/);
  const disc=body.match(/<circle class="hw-marker-disc" cx="([\d.]+)" cy="([\d.]+)"/);
  assert.ok(hit,key+' needs a hitbox');
  assert.ok(disc,key+' needs a disc center');
  return {key,x:+disc[1],y:+disc[2],hx:+hit[1],hy:+hit[2],hw:+hit[3],hh:+hit[4]};
 });
 assert.equal(markers.length,10);
 for(const p of markers){
  assert.ok(p.hw>=44&&p.hh>=44,p.key+' hitbox must be at least 44px');
  assert.ok(p.x>=p.hx&&p.x<=p.hx+p.hw&&p.y>=p.hy&&p.y<=p.hy+p.hh,p.key+' center must sit inside its hitbox');
  for(const q of markers){
   if(q===p)continue;
   assert.ok(Math.hypot(p.x-q.x,p.y-q.y)>=44,p.key+' and '+q.key+' centers must stay 44px apart');
  }
 }
});
test('unhelpful controls are removed and key explanations are directly visible',()=>{
 const html=read('lab.html'),js=read('lab-studio.js');
 assert.doesNotMatch(html,/trajectoryCanvas|windRangeInput|adjustRifleBalancePoint|svgCobFulcrum/);
 assert.doesNotMatch(js,/renderTrajectoryGraph|triggerBallisticTrace|adjustRifleBalancePoint/);
 assert.ok(html.includes('id="hwSpecBody"')&&html.includes('id="hwSpecNote"'),'component explanation is directly available');
 assert.ok(js.includes("document.getElementById('hwSpecBody').textContent = item.body"));
 assert.ok(js.includes("document.getElementById('hwSpecNote').textContent = item.note"));
 const panel=html.slice(html.indexOf('id="sec-imssu"'),html.indexOf('</section>',html.indexOf('id="sec-imssu"')));
 assert.ok(panel.includes('stage-lead'),'silhouette explanation stays beside the rack');
});


test('component picker, index and explanation use the same ten names',()=>{
 const html=read('lab.html'),js=read('lab-studio.js'),context=vm.createContext({});
 vm.runInContext(js.slice(js.indexOf('  const HARDWARE_SPECS'),js.indexOf('  function inspectHardware')),context);
 const specs=vm.runInContext('HARDWARE_SPECS',context);
 assert.equal(Object.keys(specs).length,10);
 const norm=text=>text.replace(/&amp;/g,'&').replace(/ & /g,' dan ');
 for(const [key,item] of Object.entries(specs)){
  const button=html.match(new RegExp('<button[^>]*data-hw-part="'+key+'"[^>]*>([\\s\\S]*?)</button>'));
  assert.ok(button,key+' picker button');
  assert.ok(norm(button[1]).includes(item.title),key+' picker label');
  const marker=html.match(new RegExp('<g class="hw-marker cursor-pointer"[^>]*data-hw-key="'+key+'"[^>]*aria-label="([^"]+)"'));
  assert.ok(marker,key+' diagram marker');
  assert.ok(marker[1].includes(item.title),key+' marker label');
 }
});

test('silhouette counts survive changing groups and reset without a trajectory dependency',()=>{
 const nodes=new Map(),get=id=>{if(!nodes.has(id))nodes.set(id,{classList:{add(){},remove(){},toggle(){}},setAttribute(k,v){this[k]=v;}});return nodes.get(id);};
 for(const animal of ['chicken','pig','turkey','ram'])for(let i=0;i<5;i++)get('target-'+animal+'-'+i);
 const context=vm.createContext({document:{getElementById:get,querySelector:()=>({classList:{toggle(){}}}),querySelectorAll:()=>[...nodes.values()]},playSteelImpactSound(){},playMechTick(){}});
 const js=read('lab-studio.js');vm.runInContext(js.slice(js.indexOf('  const RANGE_SPECS'),js.indexOf('  const HARDWARE_SPECS')),context);
 context.hitSteelTarget('chicken',0);context.hitSteelTarget('chicken',1);
 assert.equal(get('rackGroupScore').textContent,'2 / 5');
 context.hitSteelTarget('ram',0);assert.equal(get('rackGroupScore').textContent,'1 / 5');
 assert.equal(get('rackHitScore').textContent,'03 / 20');
 context.selectRangeAnimal('chicken');assert.equal(get('rackGroupScore').textContent,'2 / 5');
 context.hitSteelTarget('chicken',0);assert.equal(get('rackGroupScore').textContent,'1 / 5');
 context.resetSilhouetteRack();assert.equal(get('rackGroupScore').textContent,'0 / 5');assert.equal(get('rackHitScore').textContent,'00 / 20');
});
