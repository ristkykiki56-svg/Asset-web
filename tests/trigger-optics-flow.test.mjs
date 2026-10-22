import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('trigger stages follow take-up, creep, over-travel and update the explanation and curve',()=>{
 const js=read('lab.js'),nodes=new Map(),get=id=>{if(!nodes.has(id))nodes.set(id,{setAttribute(k,v){this[k]=v;},classList:{toggle(){}}});return nodes.get(id);};
 const context=vm.createContext({document:{getElementById:get,querySelectorAll:()=>[]},drawOscilloscope:p=>context.progress=p,playMechTick(){},endLiveTriggerPull(){}});
 vm.runInContext(js.slice(js.indexOf('        const TRIGGER_STAGES'),js.indexOf('        function computePosterTriggerCurve')),context);
 const stages=vm.runInContext('TRIGGER_STAGES',context);
 for(const [key,term] of [['A','Take-up'],['B','Creep'],['C','Over-travel']]){
  assert.match(stages[key].title,new RegExp(term,'i'));
  context.selectTriggerStage(key);
  assert.equal(get('triggerStageBody').textContent,stages[key].body);
  assert.equal(get('btnStage-'+key)['aria-pressed'],'true');
  assert.equal(context.progress,stages[key].progress);
 }
 assert.ok(stages.A.progress<stages.B.progress&&stages.B.progress<stages.C.progress);
 assert.doesNotMatch(read('lab.html'),/selectFingerVector|data-trigger-vector|adjustTriggerShoeContact/);
});
test('optics removes percentage variation and keeps a single lens view',()=>{
 for(const file of ['lab.html','lab.js','lab-workspace.js'])assert.doesNotMatch(read(file),/optPressure|Variasi pandangan|VARIASI PANDANGAN/);
 const workspace=read('lab-workspace.js');
 assert.doesNotMatch(workspace,/lw-optics-pair/);
 assert.match(workspace,/optics.stage.append\(lens\)/);
 assert.doesNotMatch(workspace,/head.hidden = mode|lens.hidden = mode|tabs\(optics/);
});


test('optical controls update edge shadow and reset using only three positions',()=>{
 const nodes=new Map(),get=id=>{if(!nodes.has(id))nodes.set(id,{value:'0',setAttribute(k,v){this[k]=v;}});return nodes.get(id);};
 get('optEyeDist').value='85';
 let draws=0;const context=vm.createContext({document:{getElementById:get},renderOcularLoop(){draws++;},performance:{now:()=>0},playMechTick(){}});
 const js=read('lab.js');
 vm.runInContext(js.slice(js.indexOf('        function updateOpticalSim'),js.indexOf('        function renderOcularLoop')),context);
 context.updateOpticalSim();assert.match(get('opticsLockBadge').textContent,/LINGKARAN/);
 get('optEyeDist').value='110';get('optCheekHeight').value='10';context.updateOpticalSim();
 assert.equal(nodes.has('svgShooterHeadSide'),false);
 assert.match(get('opticsLockBadge').textContent,/BAYANGAN/);
 assert.equal(draws,2);
 get('optLat').value='12';context.calibratePerfectOptics();
 assert.deepEqual(['optEyeDist','optCheekHeight','optLat'].map(id=>Number(get(id).value)),[85,0,0]);
 assert.equal(nodes.has('optPressure'),false);
});

test('automatic trigger playback advances A to B to C and manual selection stops playback',()=>{
 const nodes=new Map(),get=id=>{if(!nodes.has(id))nodes.set(id,{setAttribute(k,v){this[k]=v;}});return nodes.get(id);};
 let pending=null,frames=0;
 const context=vm.createContext({document:{getElementById:get},playMechTick(){},playSteelImpactSound(){},requestAnimationFrame:fn=>{pending=fn;return ++frames;},cancelAnimationFrame(){pending=null;}});
 const js=read('lab.js');
 vm.runInContext(js.slice(js.indexOf('        const TRIGGER_STAGES'),js.indexOf('        function setupTriggerInput')),context);
 context.drawOscilloscope=()=>{};
 context.runIdealCurvePlayback();
 for(let i=0;i<35;i++){const frame=pending;pending=null;frame();}
 assert.equal(get('btnStage-B')['aria-pressed'],'true');
 for(let i=0;i<50;i++){const frame=pending;pending=null;frame();}
 assert.equal(get('btnStage-C')['aria-pressed'],'true');
 context.selectTriggerStage('A');
 assert.equal(pending,null);
 assert.equal(vm.runInContext('oscPulling',context),false);
 assert.equal(get('btnStage-A')['aria-pressed'],'true');
 assert.match(get('oscPhaseLabel').textContent,/Take-up/);
});
