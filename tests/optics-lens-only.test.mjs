import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('optics presents only the lens on desktop and mobile and does not load the old side image',()=>{
 const html=read('lab.html'),js=read('lab-studio.js');
 assert.doesNotMatch(html,/id="(?:opticalSidePan|opticalAlignmentArtwork|opticalAlignmentIllustration|opticsDetailToggle)"|src="\/optics-poster-artwork.js"/);
 assert.doesNotMatch(js,/OpticsPosterArt|svgShooterHeadSide|axisStatusMini/);
 assert.doesNotMatch(js,/lw-optics-head|lw-optics-pair|Posisi mata terhadap okuler/);
 assert.equal((html.match(/id="ocularLensCanvas"/g)||[]).length,1);
 const panel=html.slice(html.indexOf('<section id="sec-optics"'),html.indexOf('</section>',html.indexOf('<section id="sec-optics"')));
 assert.ok(panel.includes('id="ocularLensCanvas"'),'lens canvas must live inside the optics panel');
});


test('the lens still responds to distance, height and lateral controls without a side image',()=>{
 const values={optEyeDist:85,optCheekHeight:0,optLat:0},arcs=[];
 const ctx=new Proxy({arc:(...args)=>arcs.push(args),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});
 const context=vm.createContext({document:{getElementById:id=>id==='ocularLensCanvas'?{width:300,height:300,getContext:()=>ctx}:{value:values[id]}},performance:{now:()=>0}});
 const source=read('lab-studio.js');
 vm.runInContext(source.slice(source.indexOf('  function renderOcularLoop'),source.indexOf('  function updateOpticalSim')),context);
 const draw=()=>{arcs.length=0;context.renderOcularLoop(0,true);return arcs[0].slice(0,3);};
 const initial=draw();
 values.optEyeDist=110;const distance=draw();assert.ok(distance[2]<initial[2]);
 values.optCheekHeight=10;const height=draw();assert.ok(height[1]>distance[1]);
 values.optLat=10;const lateral=draw();assert.ok(lateral[0]<height[0]);
});
