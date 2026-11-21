import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync, statSync} from 'node:fs';
const html=readFileSync(new URL('../lab.html',import.meta.url),'utf8');
const js=readFileSync(new URL('../lab-studio.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../lab-studio.css',import.meta.url),'utf8');
const home=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const rules=readFileSync(new URL('../rules.html',import.meta.url),'utf8');

test('lab lives at its own static /lab route; homepage stays an athlete profile',()=>{
 assert.match(html,/<title>Laboratorium Interaktif \| Twin Shooter<\/title>/);
 assert.match(html,/href="https:\/\/twinshooter.vercel.app\/lab"/);
 assert.match(html,/href="https:\/\/twinshooter\.vercel\.app\/"[^>]*>← Profil Twin Shooter<\/a>/);
 assert.match(home,/href="\/lab">Laboratorium ↗<\/a>/);
 assert.match(home,/<h1 id="hero-title" class="hero-title">Clarisa Azalia/);
 assert.equal((home.match(/<article class="sb-row /g)||[]).length,25);
 assert.match(rules,/Dokumen IMSSU/);
});
test('production CSS is static, not Tailwind Play CDN',()=>{
 assert.doesNotMatch(html,/cdn\.tailwindcss\.com/);
 assert.doesNotMatch(html,/tailwind/);
 assert.match(html,/href="lab-studio\.css"/);
 assert.match(html,/defer src="lab-studio\.js"/);
 assert.match(css,/@media \(prefers-reduced-motion: reduce\)/);
});
test('three remaining sliders and ten unique SVG keyboard controls remain accessible',()=>{
 const sliders=[...html.matchAll(/<input\b[^>]*type="range"[^>]*>/g)].map(x=>x[0]);
 assert.equal(sliders.length,3);
 assert.ok(sliders.every(x=>x.includes('aria-label=')));
 assert.equal((html.match(/tabindex="0" role="button"/g)||[]).length,10);
 assert.match(js,/btn\.setAttribute\('aria-label', `Titik/);
 assert.match(js,/setAttribute\('aria-pressed', String\(/);
});
test('pointer cancellation, keyboard input, pose sync, and RAF throttling are implemented',()=>{
 for(const key of ['pointerdown','pointerup','pointercancel','lostpointercapture','keydown','keyup'])assert.ok(js.includes(key),key);
 assert.match(js,/currentPose = item\.pose/);
 assert.match(js,/if \(id === 'sec-optics'\) renderOcularLoop\(\);/);
 assert.match(js,/behavior: 'auto'/);
 assert.match(js,/cancelAnimationFrame\(oscReq\)/);
 assert.doesNotMatch(js,/sfxActive|AudioContext/);
});
test('disclaimers separate illustration from rules and provenance',()=>{
 assert.match(html,/Simulasi edukatif/);
 assert.match(html,/Bukan hasil ukur atlet atau rekomendasi setelan senapan/);
 assert.match(html,/bukan rekomendasi setelan/);
 assert.doesNotMatch(html,/ANTI-SLOP EDITION|REV\.14|DOKTRIN POSTER/);
 assert.match(html,/href="https:\/\/twinshooter\.vercel\.app\/rules"/);
});

test('published claims distinguish official rules from unvalidated demonstrations',()=>{
 assert.match(html,/id="sourcesDialog"/);
 assert.match(html,/IMSSU Official Sporting Rules 2025/);
 assert.match(html,/toleransi jarak ±2,5%/);
 assert.match(html,/rel="noopener noreferrer"/);
 assert.doesNotMatch(html,/110 gf \(IDEAL\)|85 mm \(IDEAL\)|DROP: -6\.8 CM|1085 mm/);
 assert.doesNotMatch(js,/Reduksi goyangan 80%|LINTASAN CONTOH:.*KLIK CONTOH/);
 assert.doesNotMatch(js,/ref: 'REF POSTER/);
 assert.doesNotMatch(js,/windRangeInput/);
 assert.match(js,/chicken: \{ label: 'AYAM \(CHICKEN\)', dist: 18 \}/);
 assert.doesNotMatch(js,/note: 'STANDAR:|SPESIFIKASI VEKTOR B/);
 assert.match(html,/bukan template produksi sasaran/);
});


test('mobile Lab offers six focused tabs without removing desktop content',()=>{
 assert.equal((html.match(/class="mobile-nav-btn"/g)||[]).length,6);
 assert.equal((html.match(/class="studio-tab-btn"/g)||[]).length,6);
 assert.doesNotMatch(html,/id="labMobileModuleSelect"/);
 assert.doesNotMatch(html,/id="labMobilePosePicker"/);
 assert.doesNotMatch(js,/function switchPose/);
 assert.equal((html.match(/data-rack-animal=/g)||[]).length,4);
 assert.match(html,/aria-label="Fokus tampilan diagram"/);
 assert.match(js,/function switchTab/);
 assert.match(js,/classList\.toggle\('is-active'/);
 assert.doesNotMatch(html,/class="lab-settings"/);
});

test('mobile disclosure markup preserves balanced major HTML containers',()=>{
 const source=html.replace(/<!--[\s\S]*?-->/g,'').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
 const stack=[];
 for(const tag of source.matchAll(/<\/?(div|details|section|aside|header|main)\b[^>]*>/g)){
  const closing=tag[0].startsWith('</');
  if(closing) assert.equal(stack.pop(),tag[1], 'closing '+tag[1]);
  else stack.push(tag[1]);
 }
 assert.deepEqual(stack,[]);
});


test('desktop and mobile field guide preserve clear navigation and all six experiments',()=>{
 assert.equal((html.match(/data-studio-tab="sec-[a-z]+"/g)||[]).length,12);
 assert.match(html,/Sumber &amp; IMSSU/);
 assert.match(js,/function switchTab/);
 assert.match(js,/history\.replaceState/);
 assert.match(css,/\.studio-tab-btn/);
 assert.match(css,/\.mobile-nav-btn/);
 assert.equal((html.match(/id="sec-(?:biomech|trigger|optics|imssu|hardware|match)"/g)||[]).length,6);
});

test('educational model avoids unsupported ideal-settings and explains recorded vs illustrative values',()=>{
 assert.doesNotMatch(html,/Take-Up \(0–70 gf\)/);
 assert.doesNotMatch(html,/LUBANG #2 — OPTIMAL/);
 assert.doesNotMatch(html,/85 mm \(IDEAL\)/);
 assert.match(html,/Tahapan Pergerakan Pelatuk/);
 assert.match(html,/bukan rekaman gaya, waktu, atau performa atlet/);
 assert.match(html,/Aturan resmi/);
 assert.match(html,/Model demonstrasi/);
 assert.doesNotMatch(js,/KESALAHAN VEKTOR [AC]/);
 assert.doesNotMatch(js,/LUBANG #2 — OPTIMAL/);
});

test('guided anatomy selection and equipment inspection preserve accessible click targets',()=>{
 assert.match(html,/id="biomechIndexList"/);
 assert.equal((html.match(/data-hw-part="/g)||[]).length,10);
 assert.equal((html.match(/data-hw-key="/g)||[]).length,15);
 assert.match(js,/document\.querySelectorAll\('\[data-hw-part\]'\)/);
 assert.match(js,/btn\.addEventListener\('click', \(\) => inspectHardware\(btn\.dataset\.hwPart\)\)/);
 assert.match(js,/btn\.addEventListener\('click', \(\) => selectBiomechCallout\(btn\.dataset\.selectPoint\)\)/);
 assert.match(js,/btn\.hidden = pt\.pose !== currentPose/);
 assert.match(js,/node\.classList\.toggle\('is-highlighted'/);
 assert.match(css,/\.callout-node\[aria-pressed="true"\]/);
});

test('active and total silhouette counts both update across selection and reset',()=>{
 assert.match(html,/id="rackGroupScore"/);
 assert.match(html,/id="rackHitScore"/);
 assert.match(js,/function updateRackCounters/);
 assert.match(js,/(?:key|k)\.startsWith\(selectedAnimal \+ '-'\)/);
 assert.doesNotMatch(js,/triggerBallisticTrace/);
});


test('equipment v2 is real layered inline SVG with stable interactive contracts',()=>{
 const svg=html.match(/<svg id="hardwareBlueprintSvg"[\s\S]*?<\/svg>/)?.[0];
 assert.ok(svg,'missing diagram');
 assert.match(svg,/class="hw-illustration/);
 assert.match(svg,/role="group"/);
 assert.match(svg,/aria-labelledby="hwArtTitle hwArtDesc"/);
 assert.match(svg,/linearGradient id="hwGraphite"/);
 assert.match(svg,/linearGradient id="hwSteel"/);
 assert.match(svg,/radialGradient id="hwLens"/);
 assert.match(svg,/class="hw-scope-section"/);
 assert.match(svg,/class="hw-rifle-section"/);
 assert.match(svg,/id="hwRedRifleRaster"/);
 assert.ok(svg.includes('aurellia-red-poster.webp'));
 assert.doesNotMatch(html,/id="rigSwitch-clarisa"/);
 assert.equal((svg.match(/class="hw-marker cursor-pointer"/g)||[]).length,10);
 assert.equal((svg.match(/class="hw-region cursor-pointer"/g)||[]).length,5);
 for (const id of ['rigMainChassis','rigRearBlock','rigMuzzleCap','rigCheekName']) {
   assert.equal((svg.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
 }
 for (const key of ['stock','cheekpiece','grip','riser','cylinder','barrel','objective','turrets','zoom','ocular']) {
   assert.match(svg,new RegExp('data-hw-key="'+key+'"'),key);
 }
 assert.match(css,/#hardwareBlueprintSvg/);
 assert.match(css,/hw-raster-ready/);
 assert.match(css,/\.hw-marker\.is-highlighted/);
 assert.match(js,/document\.querySelectorAll\('\[data-hw-part\]'\)/);
 assert.match(js,/document\.getElementById\('blueprintActiveLabel'\)/);
 assert.match(html,/Bukan spesifikasi|bukan skala|BUKAN SKALA/);
});


test('four remaining Lab visuals use layered illustrations and preserve DOM wiring',()=>{
 assert.doesNotMatch(js,/function buildEditorialPostureIllustration/);
 assert.match(html,/lab-biomech-stage/);
 assert.match(js,/tsPosturePoseArt\.getPose/);
 assert.match(js,/pointPct/);
 assert.match(html,/id="triggerVectorDiagram"/);

 for(const id of ['triggerTravelMarker','triggerZoneA','triggerZoneB','triggerZoneC','ocularLensCanvas']){
  assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
 }

 assert.match(js,/const SILHOUETTE_RASTERS =/);
 assert.match(js,/className = 'silhouette-raster'/);
 assert.doesNotMatch(js,/const SILHOUETTE_PATHS =/);
 assert.doesNotMatch(js,/<svg data-target-animal/);
 for(const animal of ['chicken','pig','turkey','ram']){
  const path=new URL('../assets/silhouettes/'+animal+'.webp',import.meta.url);
  assert.ok(existsSync(path),animal+' WebP missing');
  const bytes=readFileSync(path);
  assert.equal(bytes.toString('ascii',0,4),'RIFF');
  assert.equal(bytes.toString('ascii',8,12),'WEBP');
  assert.ok(bytes.length<45000,animal+' WebP too large');
 }
 assert.match(css,/#sec-biomech \.callout-node/);
 assert.doesNotMatch(js,/id="targetSteel-/);
 assert.match(html,/role="img" aria-labelledby="triggerStageDiagramTitle/);
});


test('callout alignment remains connected to the character illustration',()=>{
  assert.match(js,/function positionBiomechPins\(\)/);
  assert.match(js,/btn\.style\.left = px \+ '%'/);
  assert.match(js,/btn\.style\.top = py \+ '%'/);
  assert.match(js,/btn\.dataset\.biomechId = pt\.id/);
  assert.match(js,/new ResizeObserver/);
  assert.match(js,/tsPosturePoseArt\.pointPct/);
});

test('diagram labels do not misrepresent conceptual plots as measured data',()=>{
  assert.doesNotMatch(js,/WAKTU \(ms\)/);
  assert.match(js,/URUTAN MODEL/);
  assert.match(html,/OSILOSKOP KURVA ILUSTRATIF/);
  assert.doesNotMatch(html,/id="hipLockSlider"/);
});


test('interactive diagram markers expose a single keyboard path and truthful pressed state',()=>{
 const hardware=html.match(/<svg id="hardwareBlueprintSvg"[\s\S]*?<\/svg>/)?.[0]||'';
 assert.equal((hardware.match(/class="hw-marker cursor-pointer"(?: transform="[^"]+")? tabindex="0" role="button"/g)||[]).length,10);
 assert.equal((hardware.match(/class="hw-region cursor-pointer" data-hw-key=/g)||[]).length,5);
 assert.doesNotMatch(hardware,/class="hw-region cursor-pointer" tabindex="0"/);
 assert.equal((hardware.match(/class="hw-marker cursor-pointer"[^\n]*aria-pressed=/g)||[]).length,10);
 assert.equal((html.match(/id="btnStage-[ABC]"[^>]*aria-pressed=/g)||[]).length,3);
 assert.match(js,/getElementById\('btnStage-' \+ id\)\?\.setAttribute\('aria-pressed', String\(selected\)\)/);
 assert.match(js,/if \(node\.classList\.contains\('hw-marker'\)\) node\.setAttribute\('aria-pressed', String\(sel\)\)/);
});


test('anatomy selection keeps ten stable click controls and viewpoint-aware anchor coordinates',()=>{
 assert.match(js,/function renderBiomechViewport/);
 assert.match(js,/pointPct/);
 assert.match(readFileSync(new URL('../posture-art.js',import.meta.url),'utf8'),/const POSES = \{/);
 assert.match(js,/btn\.dataset\.biomechId = pt\.id/);
 assert.match(js,/pinsContainer\.querySelector\(`\[data-biomech-id=/);
 assert.match(js,/btn\.addEventListener\('click', \(\) => selectBiomechCallout\(pt\.id\)\)/);
 assert.doesNotMatch(js,/pinsContainer\.innerHTML = ''/);
 assert.match(js,/currentPose = item\.pose/);
 assert.match(css,/#sec-biomech \.callout-node \{/);
 assert.doesNotMatch(css,/\.callout-node:not\(\[aria-pressed="true"\]\)\{display:none/);
});


test('poster photographs have an explicit unavailable state and no generated fallback',()=>{
 const adapter=readFileSync(new URL('../posture-art.js',import.meta.url),'utf8');
 assert.match(html,/data-pose-color="blue"/);
 assert.match(html,/data-pose-color="red"/);
 assert.match(html,/Clarisa Azalia/);
 assert.match(html,/Aurellia Cassandra/);
 assert.doesNotMatch(html,/id="postureArtMode"/);
 assert.match(adapter,/assets\/posture\/poses\//);
 assert.match(js,/Foto postur tidak dapat dimuat/);
 assert.doesNotMatch(adapter,/scale\(-1/);
});


test('original poster photograph is present with the expected PNG dimensions',()=>{
 const bytes=readFileSync(new URL('../assets/posture/poster-v15.png',import.meta.url));
 assert.equal(bytes.subarray(1,4).toString(),'PNG');
 assert.equal(bytes.readUInt32BE(16),3466);
 assert.equal(bytes.readUInt32BE(20),5000);
});
