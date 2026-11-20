import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
test('Posture has one anatomy-driven photo flow without manual view controls',()=>{
 const html=read('lab.html'),js=read('lab-studio.js');
 assert.doesNotMatch(html,/id="labMobilePosePicker"|id="poseTab-|onclick="switchPose/);
 assert.doesNotMatch(js,/switchPose|Foto & pembesaran/);
 assert.match(html,/id="biomechPoseTabs"/);
 assert.ok(js.includes("selectBiomechCallout(firstInPose.id)"),'pose tabs must route through anatomy selection');
 assert.ok(js.includes("window.tsPosturePoseArt.detailHtml(currentPose, activeBiomechId)"),'detail view must use the adapter');
});
test('point explanations are standalone professional copy and legs open the dedicated photo',()=>{
 const source=read('lab-studio.js'),context=vm.createContext({});
 vm.runInContext(source.slice(source.indexOf('  const POSTER_BIOMECH_DATA'),source.indexOf('  function positionBiomechPins')),context);
 const points=vm.runInContext('POSTER_BIOMECH_DATA',context);
 for(const point of points)assert.doesNotMatch(point.desc+' '+point.viewNote,/poster|SVG|WebP|kode|model|karakter|—|–/i);
 for(const id of ['leftLeg','rightLeg'])assert.equal(points.find(point=>point.id===id).pose,'feet');
});
