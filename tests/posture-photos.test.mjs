import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
async function adapter(){
 const buttons=[],elements={postureArtControls:{addEventListener(){}},postureArtStatus:{dataset:{}}};
 const context=vm.createContext({window:{renderBiomechViewport(){}},document:{readyState:'complete',getElementById:id=>elements[id],querySelectorAll:()=>buttons},queueMicrotask});
 vm.runInContext(read('posture-art.js'),context);await new Promise(resolve=>setImmediate(resolve));return context.window.tsPosturePoseArt;
}
// Real adapter plus the Lab Studio posture viewport, wired to mock DOM nodes.
function studioViewport(){
 const buttons=[],status={textContent:'Memuat foto…'};
 const elements={postureArtControls:{addEventListener(){}},postureArtStatus:status};
 let frame=null;
 const img={_src:null,getAttribute(k){return k==='src'?this._src:null;},setAttribute(k,v){if(k==='src')this._src=v;},alt:'',onerror:null};
 const pins={querySelector:()=>null,appendChild:b=>buttons.push(b)};
 frame={querySelector:sel=>sel==='#biomechPoseImg'?img:sel==='#biomechTargetRing'?null:sel==='#biomechPinsOverlay'?pins:null};
 const stage={};
 Object.defineProperty(stage,'innerHTML',{set(){frame={querySelector:sel=>sel==='#biomechPoseImg'?img:sel==='#biomechTargetRing'?null:sel==='#biomechPinsOverlay'?pins:null};}});
 stage.querySelector=sel=>sel==='.pose-img-frame'?frame:null;
 const context=vm.createContext({window:{},document:{readyState:'complete',getElementById:id=>elements[id],querySelector:sel=>sel==='.lab-biomech-stage'?stage:null,createElement:tag=>tag==='button'?{type:'',className:'',dataset:{},style:{},hidden:false,setAttribute(k,v){this[k]=v;},addEventListener(){}}:{},querySelectorAll:()=>[]},queueMicrotask});
 vm.runInContext(read('posture-art.js'),context);
 const source=read('lab-studio.js');
 vm.runInContext(source.slice(source.indexOf('  const POSTER_BIOMECH_DATA'),source.indexOf('  function positionBiomechPins')),context);
 vm.runInContext(source.slice(source.indexOf('  function renderBiomechViewport'),source.indexOf('  function renderBiomechIndexTable')),context);
 context.window.renderBiomechViewport=context.renderBiomechViewport;
 return {context,art:context.window.tsPosturePoseArt,img,status,buttons,stage};
}
test('Posture uses the athletes real pre-cropped photos without synthetic characters or mirror views',async()=>{
 const art=await adapter();
 assert.equal(art.isActive(),true);
 assert.doesNotMatch(read('posture-art.js'),/scale\(-1/);
 const seen=new Set();
 for(const color of ['blue','red']){
  art.choose(color);
  assert.equal(art.person(),color==='blue'?'Clarisa Azalia':'Aurellia Cassandra');
  for(const pose of ['back','front','sideLeft','sideRight','feet']){
   const p=art.getPose(pose);
   assert.match(p.src,/^assets\/posture\/poses\/(blue|red)-(back|front|sideLeft|sideRight|feet)\.webp$/);
   const path=new URL('../'+p.src,import.meta.url);
   assert.ok(existsSync(path),p.src+' missing');
   const bytes=readFileSync(path);
   assert.equal(bytes.toString('ascii',0,4),'RIFF');
   assert.equal(bytes.toString('ascii',8,12),'WEBP');
   assert.ok(bytes.length>10000,p.src+' too small to be a real photo');
   const hash=createHash('sha256').update(bytes).digest('hex');
   assert.ok(!seen.has(hash),p.src+' duplicates another pose');
   seen.add(hash);
   for(const [id,pt] of Object.entries(p.points)){
    assert.ok(pt[0]>=0&&pt[0]<=100&&pt[1]>=0&&pt[1]<=100,id+' pin out of range');
   }
  }
 }
 assert.equal(seen.size,10);
});
test('photo detail is centered around the selected point',async()=>{
 const art=await adapter(),point=art.pointPct('head','sideLeft');
 assert.deepEqual(Array.from(point),[71.9,40]);
 const detail=art.detailHtml('sideLeft','head');
 assert.ok(detail.includes('transform-origin:71.9% 40%'));
 assert.ok(detail.includes('left:71.9%;top:40%;'));
 assert.ok(detail.includes('assets/posture/poses/blue-sideLeft.webp'));
});

test('poster asset is the exact original file supplied by the owner',()=>{
 const bytes=readFileSync(new URL('../assets/posture/poster-v15.png',import.meta.url));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),'2e688a77dac3365daa85a0e6020ea4c5505d7885f971f521a1836b9a061b4133');
});

test('changing athlete selects separate photo coordinates and detail outputs stay unique',async()=>{
 const art=await adapter();
 const blue=art.pointPct('leftWrist','sideRight');
 art.choose('red');
 const red=art.pointPct('leftWrist','sideRight');
 assert.notDeepEqual(blue,red);
 assert.equal(art.person(),'Aurellia Cassandra');
 const main=art.detailHtml('front','elbowHip');
 assert.ok(main.includes('Aurellia Cassandra'));
 assert.ok(main.includes('assets/posture/poses/red-front.webp'));
 art.choose('blue');
 const other=art.detailHtml('front','elbowHip');
 assert.ok(other.includes('Clarisa Azalia'));
 assert.ok(other.includes('assets/posture/poses/blue-front.webp'));
 assert.notEqual(main,other);
});

test('mobile photo labels remain separated and within a short viewport',async()=>{
 const {context,art,buttons}=studioViewport();
 context.renderBiomechViewport();
 assert.equal(buttons.length,10);
 const points=vm.runInContext('POSTER_BIOMECH_DATA',context);
 for(const btn of buttons){
  const point=points.find(p=>p.id===btn.dataset.biomechId);
  if(point.pose==='back'){
   assert.equal(btn.hidden,false,point.id+' must show in the back pose');
   const [px,py]=art.pointPct(point.id,'back');
   assert.equal(btn.style.left,px+'%');
   assert.equal(btn.style.top,py+'%');
  }else{
   assert.equal(btn.hidden,true,point.id+' must hide outside its pose');
  }
 }
 // Visible pin dots (10-13px) must never overlap at a 320px phone width.
 for(const color of ['blue','red']){
  art.choose(color);
  for(const pose of ['back','front','sideLeft','sideRight','feet']){
   const p=art.getPose(pose),pts=Object.values(p.points),w=320,h=w/p.aspect;
   for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
    const d=Math.hypot((pts[i][0]-pts[j][0])/100*w,(pts[i][1]-pts[j][1])/100*h);
    assert.ok(d>=20,pose+' pins too close: '+d.toFixed(1)+'px');
   }
  }
 }
});

test('the photo area reports loading and failure instead of leaving a blank diagram',async()=>{
 const html=read('lab.html');
 assert.match(html,/<p id="postureArtStatus" aria-live="polite">Memuat foto…<\/p>/);
 const {context,img,status}=studioViewport();
 context.renderBiomechViewport();
 assert.equal(img.alt,'Foto postur Clarisa Azalia');
 assert.equal(typeof img.onerror,'function');
 img.onerror();
 assert.match(status.textContent,/tidak dapat dimuat/);
 assert.match(read('lab-studio.js'),/Foto postur tidak dapat dimuat/);
});


test('both athletes have a separate feet crop with two distinct ankle anchors and centered zoom',async()=>{
 const art=await adapter();
 for(const athlete of ['blue','red']){
  art.choose(athlete);
  const feet=art.getPose('feet'),front=art.getPose('front');
  assert.notEqual(feet.src,front.src);
  const left=art.pointPct('leftLeg','feet'),right=art.pointPct('rightLeg','feet');
  assert.ok(Math.hypot(left[0]-right[0],left[1]-right[1])>30);
  for(const id of ['leftLeg','rightLeg']){
   const p=art.pointPct(id,'feet');
   assert.ok(p[0]>0&&p[0]<100&&p[1]>0&&p[1]<100);
   const detail=art.detailHtml('feet',id);
   assert.ok(detail.includes(`transform-origin:${p[0]}% ${p[1]}%`));
  }
 }
});


test('Clarisa rear crop is a distinct real photo, not a duplicate of another pose',async()=>{
 const art=await adapter();
 const back=readFileSync(new URL('../assets/posture/poses/blue-back.webp',import.meta.url));
 assert.equal(back.toString('ascii',0,4),'RIFF');
 assert.equal(back.toString('ascii',8,12),'WEBP');
 assert.ok(back.length>10000);
 const hash=createHash('sha256').update(back).digest('hex');
 for(const pose of ['front','sideLeft','sideRight','feet']){
  const other=readFileSync(new URL('../assets/posture/poses/blue-'+pose+'.webp',import.meta.url));
  assert.notEqual(createHash('sha256').update(other).digest('hex'),hash,pose+' must not duplicate the back photo');
 }
 assert.deepEqual(Array.from(art.getPose('back').points.spine),[52.27,40.83]);
});
