import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');

test('Posture exposes the poster photos and removes obsolete model controls',()=>{
 const html=read('lab.html'),js=read('lab.js');
 assert.doesNotMatch(html,/id="(?:postureArtMode|archSlider|hipLockSlider)"/);
 assert.doesNotMatch(js,/function (?:buildEditorialPostureIllustration|updatePosturePhysics|resetPostureParameters)/);
});

test('each anatomy explanation describes the selected body part rather than implementation details',()=>{
 const context=vm.createContext({window:{addEventListener(){}},document:{addEventListener(){}},matchMedia:()=>({matches:false,addEventListener(){}})});
 const source=read('lab.js');
 vm.runInContext(source.slice(source.indexOf('const POSTER_BIOMECH_DATA'),source.indexOf('let activeBiomechId')),context);
 const points=vm.runInContext('POSTER_BIOMECH_DATA',context);
 assert.equal(points.length,10);
 for(const point of points){
  assert.doesNotMatch(point.title+' '+point.desc,/WebP|SVG|slider|sensor|persen|rekonstruksi|terverifikasi|tidak diukur/i);
  assert.ok(point.desc.split(/\s+/).length>=15,point.id+' needs an explanation');
 }
});

test('photo guide stays visible at the selected anchor in each automatic view',async()=>{
 const controls={addEventListener(){}};
 const elements={postureArtControls:controls,postureArtStatus:{dataset:{}},'sec-biomech':{classList:{toggle(){}}}};
 const context=vm.createContext({window:{renderBiomechViewport(){}},document:{readyState:'complete',getElementById:id=>elements[id],querySelectorAll:()=>[]},Image:class{naturalWidth=200;set src(value){queueMicrotask(()=>this.onload());}},queueMicrotask});
 vm.runInContext(read('posture-art.js'),context);
 await new Promise(resolve=>setImmediate(resolve));
 const art=context.window.tsPosturePoseArt;
 assert.equal(art.isActive(),true);
 for(const pose of ['front','back','sideLeft','sideRight','feet']){
  const point=art.anchor({id:'head'},pose);
  const image=art.figure(pose,'head');
  assert.match(image,/<image href=/);
  assert.ok(image.includes('cx="'+point[0]+'" cy="'+point[1]+'"'),pose+' guide matches the pin');
  assert.doesNotMatch(image,/<path[^>]*fill="url/);
 }
 assert.match(art.figure('feet','leftLeg'),/posture-point-guide/);
});

test('desktop anatomy index renders all ten entries with readable viewpoint labels',()=>{
 const source=read('lab.js'),list={innerHTML:''};
 const context=vm.createContext({document:{getElementById:()=>list}});
 vm.runInContext(source.slice(source.indexOf('const POSTER_BIOMECH_DATA'),source.indexOf('        // Anchor locations')),context);
 vm.runInContext(source.slice(source.indexOf('        function renderBiomechIndexTable'),source.indexOf('        const TRIGGER_STAGES')),context);
 vm.runInContext('renderBiomechIndexTable()',context);
 assert.equal((list.innerHTML.match(/<button/g)||[]).length,10);
 assert.doesNotMatch(list.innerHTML,/undefined|WebP|slider/);
 assert.match(list.innerHTML,/Foto depan/);
});
