import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
test('Posture has one anatomy-driven photo flow without manual view controls',()=>{
 assert.doesNotMatch(read('lab.html'),/id="labMobilePosePicker"|id="poseTab-|onclick="switchPose/);
 assert.doesNotMatch(read('lab-workspace.js'),/Foto & pembesaran/);
 assert.match(read('lab.html'),/id="posturePhotoZoom"/);
});
test('point explanations are standalone professional copy and legs open the dedicated photo',()=>{
 const source=read('lab.js'),context=vm.createContext({});
 vm.runInContext(source.slice(source.indexOf('const POSTER_BIOMECH_DATA'),source.indexOf('        // Anchor locations')),context);
 const points=vm.runInContext('POSTER_BIOMECH_DATA',context);
 for(const point of points)assert.doesNotMatch(point.desc+' '+point.viewNote,/poster|SVG|WebP|kode|model|karakter|—|–/i);
 for(const id of ['leftLeg','rightLeg'])assert.equal(points.find(point=>point.id===id).pose,'feet');
});
