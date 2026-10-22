import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('hardware rail layout keeps every 44px hit area separated and connected to its source point',()=>{
 const js=read('lab-workspace.js'),a=js.indexOf('    function layoutHardwarePins'),b=js.indexOf("    window.addEventListener");
 assert.ok(a>=0,'missing collision-free layout');
 const context=vm.createContext({});vm.runInContext(js.slice(a,b),context);
 for(const width of [280,320,375,390,767])for(const height of [130,180,260,400])for(const count of [4,6]){
  const source=Array.from({length:count},(_,i)=>({key:String(i),x:40+i*30,y:height/2}));
  const pins=context.layoutHardwarePins(source,width,height);
  assert.equal(pins.length,count);
  for(let i=0;i<count;i++){
   const p=pins[i];assert.ok(p.x>=22&&p.x<=width-22&&p.y>=22&&p.y<=height-22);
   assert.equal(p.anchorX,source[i].x);assert.equal(p.anchorY,source[i].y);
   for(const q of pins.slice(i+1))assert.ok(Math.abs(p.x-q.x)>=44||Math.abs(p.y-q.y)>=44,'overlap at '+width+' x '+height);
  }
 }
});
test('unhelpful controls are removed and key explanations are directly visible',()=>{
 const html=read('lab.html'),js=read('lab.js'),workspace=read('lab-workspace.js');
 assert.doesNotMatch(html,/trajectoryCanvas|windRangeInput|adjustRifleBalancePoint|svgCobFulcrum/);
 assert.doesNotMatch(js,/renderTrajectoryGraph|triggerBallisticTrace|adjustRifleBalancePoint/);
 assert.ok(workspace.includes("move($('#hwSpecBody'), hardware.panel)"));
 assert.ok(workspace.includes("move($('#hwSpecNote'), hardware.panel)"));
 assert.ok(workspace.includes("move($('#silhouetteHelp'), silhouette.panel)"));
});


test('component picker, index and explanation use the same ten names',()=>{
 const html=read('lab.html'),js=read('lab.js'),context=vm.createContext({});
 vm.runInContext(js.slice(js.indexOf('        const HARDWARE_SPECS'),js.indexOf('        function inspectHardware')),context);
 const specs=vm.runInContext('HARDWARE_SPECS',context);
 assert.equal(Object.keys(specs).length,10);
 for(const [key,item] of Object.entries(specs)){
  const option=html.match(new RegExp('<option value="'+key+'">[^·]+· ([^<]+)'));
  assert.equal(option?.[1],item.title,key+' picker');
  const start=html.indexOf('onclick="inspectHardware(\''+key+'\')" class="text-left');
  assert.ok(start>=0,key+' index button');
  const label=html.slice(start).match(/<span>\[\d+\] ([^<]+)<\/span>/);
  assert.equal(label?.[1],item.title,key+' index');
 }
});

test('silhouette counts survive changing groups and reset without a trajectory dependency',()=>{
 const nodes=new Map(),get=id=>{if(!nodes.has(id))nodes.set(id,{classList:{add(){},remove(){},toggle(){}},setAttribute(k,v){this[k]=v;}});return nodes.get(id);};
 for(const animal of ['chicken','pig','turkey','ram'])for(let i=0;i<5;i++)get('target-'+animal+'-'+i);
 const context=vm.createContext({document:{getElementById:get,querySelector:()=>({classList:{toggle(){}}}),querySelectorAll:()=>[...nodes.values()]},playSteelImpactSound(){},playMechTick(){}});
 const js=read('lab.js');vm.runInContext(js.slice(js.indexOf('        const RANGE_SPECS'),js.indexOf('        // Text is indexed')),context);
 context.hitSteelTarget('chicken',0);context.hitSteelTarget('chicken',1);
 assert.equal(get('rackGroupScore').textContent,'2 / 5');
 context.hitSteelTarget('ram',0);assert.equal(get('rackGroupScore').textContent,'1 / 5');
 assert.equal(get('rackHitScore').textContent,'03 / 20');
 context.selectRangeAnimal('chicken');assert.equal(get('rackGroupScore').textContent,'2 / 5');
 context.hitSteelTarget('chicken',0);assert.equal(get('rackGroupScore').textContent,'1 / 5');
 context.resetSilhouetteRack();assert.equal(get('rackGroupScore').textContent,'0 / 5');assert.equal(get('rackHitScore').textContent,'00 / 20');
});
