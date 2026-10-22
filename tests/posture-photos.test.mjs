import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
async function adapter(){
 const buttons=[],elements={postureArtControls:{addEventListener(){}},postureArtStatus:{dataset:{}},'sec-biomech':{classList:{toggle(){}}},xrayToggleBtn:{getAttribute:()=> 'true'}};
 const context=vm.createContext({window:{renderBiomechViewport(){}},document:{readyState:'complete',getElementById:id=>elements[id],querySelectorAll:()=>buttons},Image:class{naturalWidth=3466;set src(value){queueMicrotask(()=>this.onload());}},queueMicrotask});
 vm.runInContext(read('posture-art.js'),context);await new Promise(resolve=>setImmediate(resolve));return context.window.tsPosturePoseArt;
}
test('Posture uses the original poster photograph without synthetic characters or mirror views',async()=>{
 const art=await adapter();
 assert.match(art.figure('front','head'),/poster-v15\.png/);
 for(const pose of ['back','front','sideLeft','sideRight']){
  const photo=art.figure(pose,'head');assert.doesNotMatch(photo,/scale\(-1|blue-front\.webp|red-front\.webp/);
  const p=art.anchor({id:'head'},pose);assert.ok(p[0]>=0&&p[0]<=460&&p[1]>=0&&p[1]<=540);
 }
});
test('photo detail is centered around the selected point',async()=>{
 const art=await adapter(),point=art.anchor({id:'head'},'sideLeft');
 const detail=art.detail('sideLeft','head');
 assert.ok(detail.includes('viewBox="'+(point[0]-75)+' '+(point[1]-75)+' 150 150"'));
 assert.match(read('lab.html'),/id="posturePhotoZoom"/);
});

test('poster asset is the exact original file supplied by the owner',()=>{
 const bytes=readFileSync(new URL('../assets/posture/poster-v15.png',import.meta.url));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),'2e688a77dac3365daa85a0e6020ea4c5505d7885f971f521a1836b9a061b4133');
});

test('changing athlete selects separate photo coordinates and detail IDs stay unique',async()=>{
 const art=await adapter();
 const blue=art.anchor({id:'leftWrist'},'sideRight');
 art.choose('red');
 const red=art.anchor({id:'leftWrist'},'sideRight');
 assert.notDeepEqual(Array.from(blue),Array.from(red));
 assert.match(art.figure('front','elbowHip'),/Aurellia Cassandra/);
 const main=art.figure('front','elbowHip'),detail=art.detail('front','elbowHip');
 const ids=[...((main+detail).matchAll(/\bid="([^"]+)"/g))].map(match=>match[1]);
 assert.equal(new Set(ids).size,ids.length);
});

test('mobile photo labels remain separated and within a short viewport',()=>{
 const nodes=['leftArm','elbowHip','leftLeg'].map((id,index)=>({hidden:false,dataset:{biomechId:id,svgX:150,svgY:120+index*5},style:{setProperty(){}}}));
 const overlay={getBoundingClientRect:()=>({left:0,top:0,width:320,height:150}),querySelectorAll:()=>nodes};
 const svg={getScreenCTM:()=>({}),createSVGPoint:()=>({matrixTransform(){return{x:this.x,y:this.y};}})};
 const document={documentElement:{classList:{contains:()=>true}},getElementById:id=>id==='biomechDraftSvg'?svg:overlay};
 const context=vm.createContext({document,Set,Math});
 const source=read('lab.js');
 vm.runInContext(source.slice(source.indexOf('        function positionBiomechPins'),source.indexOf('        function renderBiomechViewport')),context);
 context.positionBiomechPins();
 const tops=nodes.map(node=>parseFloat(node.style.top));
 assert.ok(tops.every(top=>top>=22&&top<=128));
 for(let i=1;i<tops.length;i++)assert.ok(tops[i]-tops[i-1]>=44);
 const workspace=read('lab-workspace.js');
 assert.ok(workspace.includes("move($('#posturePhotoZoom'), posture.panel)"),'zoom stays outside the photo pin rails');
 assert.ok(!workspace.includes("move($('#posturePhotoZoom'), posture.stage)"));
});

test('the photo area reports loading and failure instead of leaving a blank diagram',()=>{
 let pendingImage;
 const stage={},zoom={},elements={posturePhotoLoading:stage,posturePhotoZoom:zoom,postureArtControls:{addEventListener(){}},postureArtStatus:{dataset:{}},'sec-biomech':{classList:{toggle(){}}}};
 const context=vm.createContext({window:{renderBiomechViewport(){}},document:{readyState:'complete',getElementById:id=>elements[id],querySelectorAll:()=>[]},Image:class{constructor(){pendingImage=this;}set src(value){}naturalWidth=3466;}});
 vm.runInContext(read('posture-art.js'),context);
 assert.equal(stage.hidden,false);
 assert.match(stage.textContent,/Memuat/);
 assert.equal(zoom.disabled,true);
 pendingImage.onload();assert.equal(stage.hidden,true);assert.equal(zoom.disabled,false);
 pendingImage.onerror();assert.equal(stage.hidden,false);assert.match(stage.textContent,/tidak dapat dimuat/);
});
