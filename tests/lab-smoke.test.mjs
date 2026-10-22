import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync, statSync} from 'node:fs';
const html=readFileSync(new URL('../lab.html',import.meta.url),'utf8');
const js=readFileSync(new URL('../lab.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../lab.css',import.meta.url),'utf8');
const utilities=readFileSync(new URL('../lab-utilities.css',import.meta.url),'utf8');
const home=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const rules=readFileSync(new URL('../rules.html',import.meta.url),'utf8');

test('lab lives at its own static /lab route; homepage stays an athlete profile',()=>{
 assert.match(html,/<title>Laboratorium Interaktif \| Twin Shooter<\/title>/);
 assert.match(html,/href="https:\/\/twinshooter.vercel.app\/lab"/);
 assert.match(html,/href="\/"[^>]*>← Profil Twin Shooter<\/a>/);
 assert.match(home,/href="\/lab">Laboratorium<\/a>/);
 assert.match(home,/<h1 id="hero-title">Clarisa Azalia/);
 assert.equal((home.match(/<article class="achievement /g)||[]).length,25);
 assert.match(rules,/Dokumen IMSSU/);
});
test('production CSS is static, not Tailwind Play CDN',()=>{
 assert.doesNotMatch(html,/cdn\.tailwindcss\.com/);
 assert.match(html,/href="\/lab-utilities.css"/);
 assert.match(html,/href="\/lab.css"/);
 assert.match(html,/defer src="\/lab.js"/);
 assert.match(utilities,/tailwindcss v4/);
 assert.match(utilities,/\.lg\\:col-span-6/);
 assert.match(css,/prefers-reduced-motion:reduce/);
});
test('five remaining sliders and ten unique SVG keyboard controls remain accessible',()=>{
 const sliders=[...html.matchAll(/<input\b[^>]*type="range"[^>]*>/g)].map(x=>x[0]);
 assert.equal(sliders.length,5);
 assert.ok(sliders.every(x=>x.includes('aria-label=')));
 assert.equal((html.match(/tabindex="0" role="button"/g)||[]).length,10);
 assert.match(js,/btn\.setAttribute\('aria-label', `Titik/);
 assert.match(js,/btn\.setAttribute\('aria-pressed','false'\)/);
});
test('pointer cancellation, keyboard input, pose sync, and RAF throttling are implemented',()=>{
 for(const key of ['pointerdown','pointerup','pointercancel','lostpointercapture','keydown','keyup'])assert.ok(js.includes(key),key);
 assert.match(js,/currentPose = item\.pose/);
 assert.match(js,/setupOcularVisibility/);
 assert.match(js,/const reducedMotion = window\.matchMedia/);
 assert.match(js,/cancelAnimationFrame\(ballisticReq\)/);
 assert.match(js,/let sfxActive = false/);
});
test('disclaimers separate illustration from rules and provenance',()=>{
 assert.match(html,/SIMULASI EDUKATIF — BUKAN PERATURAN ATAU DATA TERUKUR/);
 assert.match(html,/Tidak ada rekomendasi angka setelan/);
 assert.doesNotMatch(html,/ANTI-SLOP EDITION|REV\.14|DOKTRIN POSTER/);
 assert.match(html,/href="\/rules"/);
});

test('published claims distinguish official rules from unvalidated demonstrations',()=>{
 assert.match(html,/id="lab-sources"/);
 assert.match(html,/IMSSU Official Sporting Rules 2025/);
 assert.match(html,/toleransi jarak ±2,5%/);
 assert.match(html,/rel="noopener noreferrer"/);
 assert.doesNotMatch(html,/110 gf \(IDEAL\)|85 mm \(IDEAL\)|DROP: -6\.8 CM|1085 mm/);
 assert.doesNotMatch(js,/Reduksi goyangan 80%|LINTASAN CONTOH:.*KLIK CONTOH/);
 assert.doesNotMatch(js,/ref: 'REF POSTER/);
 assert.match(js,/wind.toFixed\(1\)/);
 assert.match(js,/JARAK SESUAI ATURAN/);
 assert.doesNotMatch(js,/note: 'STANDAR:|SPESIFIKASI VEKTOR B/);
 assert.match(html,/bukan template produksi sasaran/);
});


test('mobile Lab offers five focused lessons without removing desktop content',()=>{
 assert.match(html,/id="labMobileModuleSelect"/);
 assert.doesNotMatch(html,/id="labMobilePosePicker"/);
 assert.doesNotMatch(js,/function switchPose/);
 assert.match(html,/id="labNextModule"/);
 assert.match(html,/id="labPrevModule"/);
 assert.equal((html.match(/class="lab-heading-short"/g)||[]).length,5);
 assert.equal((html.match(/data-lab-mobile-collapse/g)||[]).length,7);
 assert.equal((html.match(/data-rack-animal=/g)||[]).length,4);
 assert.match(html,/aria-label="Diagram senapan, geser horizontal/);
 assert.match(js,/function setupLabMobileExperience/);
 assert.match(js,/lab-mobile-focused/);
 assert.match(js,/classList\.toggle\('is-active'/);
 assert.match(js,/tier\.classList\.toggle\('is-current'/);
 assert.match(css,/lab-mobile-focused main#main-content/);
 assert.match(css,/\.lab-mobile-stepper/);
 assert.match(css,/lab-settings:not\(\[open\]\)/);
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


test('desktop and mobile field guide preserve clear navigation and all five experiments',()=>{
 assert.match(html,/data-lab-desktop-nav/);
 assert.match(html,/class="lab-intro-provenance"/);
 assert.match(html,/href="#lab-sources">Sumber/);
 assert.match(css,/min-width:1200px/);
 assert.match(css,/\.lab-section-nav a\.is-current/);
 assert.match(css,/\.lab-mobile-stepper/);
 assert.match(js,/function setupLabDesktopActiveNav/);
 assert.match(js,/IntersectionObserver/);
 assert.equal((html.match(/id="sec-(?:biomech|trigger|optics|imssu|hardware)"/g)||[]).length,5);
});

test('educational model avoids unsupported ideal-settings and explains recorded vs illustrative values',()=>{
 assert.doesNotMatch(html,/Take-Up \(0–70 gf\)/);
 assert.doesNotMatch(html,/LUBANG #2 — OPTIMAL/);
 assert.doesNotMatch(html,/85 mm \(IDEAL\)/);
 assert.match(html,/Tiga tahap pergerakan pelatuk/);
 assert.match(html,/bukan rekaman gaya, waktu, atau performa atlet/);
 assert.match(html,/ATURAN · IMSSU 2025/);
 assert.match(html,/MODEL · BUKAN DATA UKUR/);
 assert.doesNotMatch(js,/KESALAHAN VEKTOR [AC]/);
 assert.doesNotMatch(js,/LUBANG #2 — OPTIMAL/);
});

test('guided anatomy selection and equipment inspection preserve accessible click targets',()=>{
 assert.match(html,/id="labCalloutPicker"/);
 assert.match(html,/id="labHardwarePicker"/);
 assert.equal((html.match(/data-hw-key="/g)||[]).length,15);
 assert.match(js,/anatomySelect\.addEventListener\('change'/);
 assert.match(js,/hardwareSelect\?\.addEventListener\('change'/);
 assert.match(js,/btn\.hidden = pt\.pose !== currentPose/);
 assert.match(js,/if \(picker\) picker\.value = item\.id/);
 assert.match(js,/node\.classList\.toggle\('is-highlighted'/);
 assert.match(css,/\.callout-node\[hidden\]/);
 assert.match(css,/\.callout-node\[aria-pressed="true"\]/);
});

test('active and total silhouette counts both update across selection and reset',()=>{
 assert.match(html,/id="rackGroupScore"/);
 assert.match(html,/id="rackHitScore"/);
 assert.match(js,/function updateRackCounters/);
 assert.match(js,/key\.startsWith\(selectedAnimal \+ '-'\)/);
 assert.match(js,/updateRackCounters\(\);\s+renderTrajectoryGraph/);
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
 for (const id of ['svgCobFulcrum','rigMainChassis','rigRearBlock','rigMuzzleCap','rigCheekName']) {
   assert.equal((svg.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
 }
 for (const key of ['stock','cheekpiece','grip','riser','cylinder','barrel','objective','turrets','zoom','ocular']) {
   assert.match(svg,new RegExp('data-hw-key="'+key+'"'),key);
 }
 assert.match(css,/Equipment illustration v2/);
 assert.match(css,/hw-raster-ready/);
 assert.match(css,/\.hw-marker\.is-highlighted/);
 assert.match(js,/document\.getElementById\('labHardwarePicker'\)/);
 assert.match(js,/document\.getElementById\('blueprintActiveLabel'\)/);
 assert.match(html,/Bukan spesifikasi|bukan spesifikasi|bukan skala|BUKAN SKALA/);
});


test('four remaining Lab visuals use layered illustrations and preserve DOM wiring',()=>{
 assert.doesNotMatch(js,/function buildEditorialPostureIllustration/);
 assert.match(html,/id="svgAthleteLayer"/);
 assert.match(js,/tsPosturePoseArt\?\.figure\(currentPose, activeBiomechId\)/);
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
 assert.match(css,/Four-module visual refinement/);
 assert.doesNotMatch(js,/id="targetSteel-/);
 assert.match(html,/role="img" aria-labelledby="triggerStageDiagramTitle/);
});


test('callout alignment remains connected to the character illustration',()=>{
  assert.match(js,/function positionBiomechPins\(\)/);
  assert.match(js,/getScreenCTM/);
  assert.match(js,/createSVGPoint/);
  assert.match(js,/button\.dataset\.svgX/);
  assert.match(js,/new ResizeObserver/);
  assert.match(js,/tsPosturePoseArt\?\.anchor\(point, currentPose\)/);
});

test('diagram labels do not misrepresent conceptual plots as measured data',()=>{
  assert.doesNotMatch(js,/WAKTU \(ms\)/);
  assert.match(js,/URUTAN MODEL/);
  assert.match(html,/BUKAN GAYA\/WAKTU UKUR/);
  assert.doesNotMatch(html,/id="hipLockSlider"/);
});


test('interactive diagram markers expose a single keyboard path and truthful pressed state',()=>{
 const hardware=html.match(/<svg id="hardwareBlueprintSvg"[\s\S]*?<\/svg>/)?.[0]||'';
 assert.equal((hardware.match(/class="hw-marker cursor-pointer"(?: transform="[^"]+")? tabindex="0" role="button"/g)||[]).length,10);
 assert.equal((hardware.match(/class="hw-region cursor-pointer" data-hw-key=/g)||[]).length,5);
 assert.doesNotMatch(hardware,/class="hw-region cursor-pointer" tabindex="0"/);
 assert.equal((hardware.match(/class="hw-marker cursor-pointer"[^\n]*aria-pressed=/g)||[]).length,10);
 assert.equal((html.match(/id="btnStage-[ABC]"[^>]*aria-pressed=/g)||[]).length,3);
 assert.match(js,/getElementById\('btnStage-'\+id\)\.setAttribute\('aria-pressed', String\(selected\)\)/);
 assert.match(js,/if \(node\.classList\.contains\('hw-marker'\)\) node\.setAttribute\('aria-pressed', String\(selected\)\)/);
});


test('anatomy selection keeps ten stable click controls and viewpoint-aware anchor coordinates',()=>{
 assert.match(js,/function biomechAnchor\(point, arch, hipLock\)/);
 assert.match(readFileSync(new URL('../posture-art.js',import.meta.url),'utf8'),/const photos=\{/);
 assert.match(js,/btn\.dataset\.biomechId = pt\.id/);
 assert.match(js,/pinsContainer\.querySelector\('\[data-biomech-id=/);
 assert.match(js,/btn\.addEventListener\('click', \(\) => selectBiomechCallout\(pt\.id\)\)/);
 assert.doesNotMatch(js,/pinsContainer\.innerHTML = ''/);
 assert.match(js,/currentPose = item\.pose/);
 assert.match(js,/leaderLayer\.replaceChildren\(\)/);
 assert.match(css,/#sec-biomech \.callout-node:not\(\[hidden\]\)\{display:flex!important/);
 assert.doesNotMatch(css,/\.callout-node:not\(\[aria-pressed="true"\]\)\{display:none/);
});


test('poster photographs have an explicit unavailable state and no generated fallback',()=>{
 const adapter=readFileSync(new URL('../posture-art.js',import.meta.url),'utf8');
 assert.match(html,/data-pose-color="blue"/);
 assert.match(html,/data-pose-color="red"/);
 assert.match(html,/Clarisa Azalia/);
 assert.match(html,/Aurellia Cassandra/);
 assert.doesNotMatch(html,/id="postureArtMode"/);
 assert.match(adapter,/poster-v15\.png/);
 assert.match(adapter,/Foto poster tidak dapat dimuat/);
 assert.doesNotMatch(adapter,/scale\(-1/);
});


test('original poster photograph is present with the expected PNG dimensions',()=>{
 const bytes=readFileSync(new URL('../assets/posture/poster-v15.png',import.meta.url));
 assert.equal(bytes.subarray(1,4).toString(),'PNG');
 assert.equal(bytes.readUInt32BE(16),3466);
 assert.equal(bytes.readUInt32BE(20),5000);
});
