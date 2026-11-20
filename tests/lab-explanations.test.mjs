import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
const visible=html=>html.replace(/<!--[\s\S]*?-->/g,'').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replace(/<[^>]+>/g,' ');
test('lesson explanations do not expose implementation formats to readers',()=>{
 assert.doesNotMatch(visible(read('lab.html')),/\b(?:SVG|WebP|canvas|raster|fallback)\b/i);
 const source=read('lab-studio.js'),context=vm.createContext({});
 vm.runInContext(source.slice(source.indexOf('  const POSTER_BIOMECH_DATA'),source.indexOf('  function positionBiomechPins')),context);
 vm.runInContext(source.slice(source.indexOf('  const TRIGGER_STAGES'),source.indexOf('  function computePosterTriggerCurve')),context);
 vm.runInContext(source.slice(source.indexOf('  const HARDWARE_SPECS'),source.indexOf('  function inspectHardware')),context);
 const copy=[];
 for(const point of vm.runInContext('POSTER_BIOMECH_DATA',context))copy.push(point.title,point.desc,point.viewNote);
 for(const stage of Object.values(vm.runInContext('TRIGGER_STAGES',context)))copy.push(stage.title,stage.body);
 for(const item of Object.values(vm.runInContext('HARDWARE_SPECS',context)))copy.push(item.code,item.title,item.body,item.note);
 for(const phrase of copy)assert.doesNotMatch(phrase,/\b(?:SVG|WebP|canvas|raster|fallback|layer)\b/i);
});
test('mobile lessons retain explanations beside every experiment',()=>{
 const html=read('lab.html'),js=read('lab-studio.js');
 for(const id of ['sec-biomech','sec-trigger','sec-optics','sec-imssu','sec-hardware']){
  const panel=html.slice(html.indexOf(`id="${id}"`),html.indexOf('</section>',html.indexOf(`id="${id}"`)));
  assert.ok(panel.includes('stage-lead'),id+' must carry its explanation inside the panel');
 }
 for(const cls of ['stage-deck-disclosure','optics-notes-disclosure','range-notes-disclosure'])assert.ok(html.includes(cls),cls+' must exist');
 assert.doesNotMatch(html,/id="trajectoryCanvas"/);
 assert.ok(html.includes('id="hwSpecBody"')&&html.includes('id="hwSpecNote"'),'component explanation is directly available');
 assert.ok(js.includes("d1.open = isDesktop")&&js.includes("d2.open = isDesktop")&&js.includes("d3.open = isDesktop"),'disclosures open on desktop');
});

test('all ten anatomy selections show standalone teaching and select the matching photo',()=>{
 const source=read('lab-studio.js'),nodes=new Map();
 const get=id=>{if(!nodes.has(id)){const n={setAttribute(){},querySelectorAll:()=>[]};nodes.set(id,n);}return nodes.get(id);};
 const context=vm.createContext({document:{getElementById:get,querySelectorAll:()=>[]},renderBiomechViewport(){},renderBiomechIndexTable(){}});
 vm.runInContext(source.slice(source.indexOf('  const POSTER_BIOMECH_DATA'),source.indexOf('  function positionBiomechPins')),context);
 vm.runInContext(source.slice(source.indexOf('  function selectBiomechCallout'),source.indexOf('  function openPosturePhotoDetail')),context);
 const points=vm.runInContext('POSTER_BIOMECH_DATA',context);
 for(const point of points){
  context.selectBiomechCallout(point.id);
  assert.equal(nodes.get('dossierBody').textContent,point.desc);
  assert.doesNotMatch(point.desc+' '+point.viewNote,/poster|SVG|WebP/i);
  assert.equal(nodes.get('dossierViewNote').textContent,point.viewNote);
  assert.equal(nodes.get('dossierTitle').textContent,point.title);
  assert.equal(vm.runInContext('currentPose',context),point.pose);
 }
 context.selectBiomechCallout('pelvis');
 assert.match(nodes.get('dossierViewNote').textContent,/panggul/);
 context.selectBiomechCallout('elbowHip');
 assert.match(nodes.get('dossierBody').textContent,/tumpuan/);
 assert.match(nodes.get('dossierViewNote').textContent,/siku/);
});
