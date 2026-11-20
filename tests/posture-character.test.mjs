import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
async function adapter(){
 const buttons=[],elements={postureArtControls:{addEventListener(){}},postureArtStatus:{dataset:{}}};
 const context=vm.createContext({window:{renderBiomechViewport(){}},document:{readyState:'complete',getElementById:id=>elements[id],querySelectorAll:()=>buttons},queueMicrotask});
 vm.runInContext(read('posture-art.js'),context);await new Promise(resolve=>setImmediate(resolve));return context.window.tsPosturePoseArt;
}

test('Posture exposes the poster photos and removes obsolete model controls',()=>{
 const html=read('lab.html'),js=read('lab-studio.js');
 assert.doesNotMatch(html,/id="(?:postureArtMode|archSlider|hipLockSlider)"/);
 assert.doesNotMatch(js,/function (?:buildEditorialPostureIllustration|updatePosturePhysics|resetPostureParameters)/);
 assert.ok(html.includes('src="posture-art.js"')||html.includes('posture-art.js'),'adapter must be loaded');
 assert.match(html,/data-pose-color="blue"/);
 assert.match(html,/data-pose-color="red"/);
});

test('each anatomy explanation describes the selected body part rather than implementation details',()=>{
 const context=vm.createContext({});
 const source=read('lab-studio.js');
 vm.runInContext(source.slice(source.indexOf('  const POSTER_BIOMECH_DATA'),source.indexOf('  let currentPose')),context);
 const points=vm.runInContext('POSTER_BIOMECH_DATA',context);
 assert.equal(points.length,10);
 for(const point of points){
  assert.doesNotMatch(point.title+' '+point.desc,/WebP|SVG|slider|sensor|persen|rekonstruksi|terverifikasi|tidak diukur/i);
  assert.ok(point.desc.split(/\s+/).length>=15,point.id+' needs an explanation');
 }
});

test('photo guide stays visible at the selected anchor in each automatic view',async()=>{
 const art=await adapter();
 assert.equal(art.isActive(),true);
 for(const pose of ['front','back','sideLeft','sideRight','feet']){
  const [x,y]=art.pointPct('head',pose);
  assert.ok(x>=0&&x<=100&&y>=0&&y<=100,pose+' head pin out of range');
  const detail=art.detailHtml(pose,'head');
  assert.ok(detail.includes(`transform-origin:${x}% ${y}%`),pose+' zoom must center on the pin');
  assert.ok(detail.includes(`left:${x}%;top:${y}%;`),pose+' guide ring must sit on the pin');
  assert.doesNotMatch(detail,/scale\(-1|<path[^>]*fill="url/);
 }
 assert.ok(read('lab-studio.js').includes("ring.style.left = ax + '%'"));
 assert.ok(read('lab-studio.js').includes("ring.style.top = ay + '%'"));
});

test('desktop anatomy index renders all ten entries with readable viewpoint labels',()=>{
 const source=read('lab-studio.js'),list={innerHTML:'',querySelectorAll:()=>[]};
 const context=vm.createContext({document:{getElementById:()=>list}});
 vm.runInContext(source.slice(source.indexOf('  const POSTER_BIOMECH_DATA'),source.indexOf('  function positionBiomechPins')),context);
 vm.runInContext(source.slice(source.indexOf('  function renderBiomechIndexTable'),source.indexOf('  function selectBiomechCallout')),context);
 vm.runInContext('renderBiomechIndexTable()',context);
 assert.equal((list.innerHTML.match(/<button/g)||[]).length,10);
 assert.doesNotMatch(list.innerHTML,/undefined|WebP|slider/);
 assert.match(list.innerHTML,/Foto depan/);
});
