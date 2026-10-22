import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
const visible=html=>html.replace(/<!--[\s\S]*?-->/g,'').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replace(/<[^>]+>/g,' ');
test('lesson explanations do not expose implementation formats to readers',()=>{
 assert.doesNotMatch(visible(read('lab.html')),/\b(?:SVG|WebP|canvas|raster|fallback)\b/i);
 const optics=read('optics-poster-artwork.js');
 for(const [,copy] of optics.matchAll(/announce\('([^']+)'\)/g))assert.doesNotMatch(copy,/SVG|WebP|layer|fallback/i);
});
test('mobile lessons retain explanations beside every experiment',()=>{
 const source=read('lab-workspace.js');
 for(const id of ['triggerCurveHelp','opticsExplanation','silhouetteHelp'])assert.ok(source.includes("$('#"+id+"')"),id+' must be available on mobile');
 assert.match(read('lab.html'),/id="trajectoryHelp"/);
 assert.ok(source.includes("$('#trajectoryCanvas')?.parentElement"),'trajectory instructions move with their graph');
});

test('all ten anatomy selections show standalone teaching and select the matching photo',()=>{
 const source=read('lab.js'),nodes=new Map();
 const context=vm.createContext({document:{getElementById:id=>{if(!nodes.has(id))nodes.set(id,{setAttribute(){}});return nodes.get(id);}},playMechTick(){},renderBiomechViewport(){},renderBiomechIndexTable(){}});
 vm.runInContext(source.slice(source.indexOf('const POSTER_BIOMECH_DATA'),source.indexOf('        // Anchor locations')),context);
 vm.runInContext(source.slice(source.indexOf('        function selectBiomechCallout'),source.indexOf('        function renderBiomechIndexTable')),context);
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
