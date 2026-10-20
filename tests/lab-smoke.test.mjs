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
 assert.match(rules,/IMSSU Air Rifle/);
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
test('nine sliders and thirteen unique SVG keyboard controls remain accessible',()=>{
 const sliders=[...html.matchAll(/<input\b[^>]*type="range"[^>]*>/g)].map(x=>x[0]);
 assert.equal(sliders.length,9);
 assert.ok(sliders.every(x=>x.includes('aria-label=')));
 assert.equal((html.match(/tabindex="0" role="button"/g)||[]).length,13);
 assert.match(js,/btn\.setAttribute\('aria-label', `Titik/);
 assert.match(js,/btn\.setAttribute\('aria-pressed','false'\)/);
});
test('pointer cancellation, keyboard input, pose sync, and RAF throttling are implemented',()=>{
 for(const key of ['pointerdown','pointerup','pointercancel','lostpointercapture','keydown','keyup'])assert.ok(js.includes(key),key);
 assert.match(js,/const chosen = POSTER_BIOMECH_DATA\.find\(p => p\.id === activeBiomechId && p\.pose === poseKey\)/);
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
 assert.match(js,/unit model/);
 assert.match(js,/JARAK SESUAI ATURAN/);
 assert.doesNotMatch(js,/note: 'STANDAR:|SPESIFIKASI VEKTOR B/);
 assert.match(html,/bukan template produksi sasaran/);
});


test('mobile Lab offers five focused lessons without removing desktop content',()=>{
 assert.match(html,/id="labMobileModuleSelect"/);
 assert.match(html,/id="labMobilePosePicker"/);
 assert.match(js,/posePicker\?\.addEventListener\('change'/);
 assert.match(html,/id="labNextModule"/);
 assert.match(html,/id="labPrevModule"/);
 assert.equal((html.match(/class="lab-heading-short"/g)||[]).length,5);
 assert.equal((html.match(/data-lab-mobile-collapse/g)||[]).length,8);
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
 assert.match(html,/INDEKS GERAKAN MODEL:/);
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
 assert.equal((svg.match(/class="hw-marker cursor-pointer"/g)||[]).length,10);
 assert.equal((svg.match(/class="hw-region cursor-pointer"/g)||[]).length,5);
 for (const id of ['svgCobFulcrum','rigMainChassis','rigRearBlock','rigMuzzleCap','rigCheekName']) {
   assert.equal((svg.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
 }
 for (const key of ['stock','cheekpiece','grip','riser','cylinder','barrel','objective','turrets','zoom','ocular']) {
   assert.match(svg,new RegExp('data-hw-key="'+key+'"'),key);
 }
 assert.match(css,/Equipment illustration v2/);
 assert.match(css,/\.hw-marker\.is-highlighted/);
 assert.match(js,/document\.getElementById\('labHardwarePicker'\)/);
 assert.match(js,/document\.getElementById\('blueprintActiveLabel'\)/);
 assert.match(html,/Bukan spesifikasi|bukan spesifikasi|bukan skala|BUKAN SKALA/);
});


test('four remaining Lab visuals use layered illustrations and preserve DOM wiring',()=>{
 assert.match(js,/function buildEditorialPostureIllustration/);
 assert.match(html,/id="biomechBlueKit"/);
 assert.match(html,/id="biomechRedKit"/);
 assert.match(html,/id="svgAthleteLayer"/);
 assert.match(html,/id="svgCogPlumbGroup"/);
 assert.match(js,/tsPosturePoseArt\?\.figure\(currentPose\) \|\| buildEditorialPostureIllustration\(currentPose, arch, hipLock\)/);
 assert.match(html,/id="triggerVectorDiagram"/);
 assert.match(html,/id="triggerMechanismDiagram"/);
 for(const id of ['svgVecA','svgVecB','svgVecC','mechTriggerBlade','mechFingerPad','ocularLensCanvas','opticFixedScope','optStaticRifle','svgShooterHeadSide']){
  assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
 }
 assert.match(html,/id="opticalAlignmentIllustration"/);
 assert.match(js,/const SILHOUETTE_PATHS =/);
 assert.match(js,/class="silhouette-study"/);
 assert.match(css,/Four-module visual refinement/);
 assert.doesNotMatch(js,/id="targetSteel-/);
 assert.match(html,/role="group" aria-labelledby="triggerVectorTitle/);
});


test('callout alignment and elbow controls are connected to the rendered SVG',()=>{
  assert.match(js,/function positionBiomechPins\(\)/);
  assert.match(js,/getScreenCTM/);
  assert.match(js,/createSVGPoint/);
  assert.match(js,/button\.dataset\.svgX/);
  assert.match(js,/new ResizeObserver/);
  assert.match(js,/buildEditorialPostureIllustration\(currentPose, arch, hipLock\)/);
  assert.match(js,/const armShift = Math\.round\(\(100 - hipLock\)/);
  assert.match(js,/cy="\$\{230 \+ elbowShift\}"/);
});

test('diagram labels do not misrepresent conceptual plots as measured data',()=>{
  assert.doesNotMatch(js,/WAKTU \(ms\)/);
  assert.match(js,/URUTAN MODEL/);
  assert.match(html,/BUKAN GAYA\/WAKTU UKUR/);
  assert.match(html,/POSISI SIKU RELATIF KE PINGGUL \(MODEL\)/);
});


test('interactive diagram markers expose a single keyboard path and truthful pressed state',()=>{
 const hardware=html.match(/<svg id="hardwareBlueprintSvg"[\s\S]*?<\/svg>/)?.[0]||'';
 assert.equal((hardware.match(/class="hw-marker cursor-pointer" tabindex="0" role="button"/g)||[]).length,10);
 assert.equal((hardware.match(/class="hw-region cursor-pointer" data-hw-key=/g)||[]).length,5);
 assert.doesNotMatch(hardware,/class="hw-region cursor-pointer" tabindex="0"/);
 assert.equal((hardware.match(/class="hw-marker cursor-pointer"[^\n]*aria-pressed=/g)||[]).length,10);
 assert.equal((html.match(/data-trigger-vector="[ABC]" aria-pressed=/g)||[]).length,3);
 assert.match(js,/marker\.setAttribute\('aria-pressed', String\(v === vec\)\)/);
 assert.match(js,/if \(node\.classList\.contains\('hw-marker'\)\) node\.setAttribute\('aria-pressed', String\(selected\)\)/);
});


test('anatomy selection keeps ten stable click controls and viewpoint-aware anchor coordinates',()=>{
 assert.match(js,/function biomechAnchor\(point, arch, hipLock\)/);
 assert.match(js,/const anchors = \{/);
 assert.match(js,/btn\.dataset\.biomechId = pt\.id/);
 assert.match(js,/pinsContainer\.querySelector\('\[data-biomech-id=/);
 assert.match(js,/btn\.addEventListener\('click', \(\) => selectBiomechCallout\(pt\.id\)\)/);
 assert.doesNotMatch(js,/pinsContainer\.innerHTML = ''/);
 assert.match(js,/currentPose = item\.pose/);
 assert.match(js,/leaderLayer\.replaceChildren\(\)/);
 assert.match(css,/#sec-biomech \.callout-node:not\(\[hidden\]\)\{display:flex!important/);
 assert.doesNotMatch(css,/\.callout-node:not\(\[aria-pressed="true"\]\)\{display:none/);
});


test('review-only blue/red static posture adapter keeps existing SVG fallback',()=>{
 const adapter=readFileSync(new URL('../posture-art.js',import.meta.url),'utf8');
 assert.match(html,/id="postureArtControls"/);
 assert.match(html,/id="postureArtMode"/);
 assert.match(html,/data-pose-color="blue"/);
 assert.match(html,/data-pose-color="red"/);
 assert.match(html,/defer src="\/posture-art.js"/);
 assert.match(js,/tsPosturePoseArt\?\.figure\(currentPose\) \|\| buildEditorialPostureIllustration/);
 assert.match(js,/tsPosturePoseArt\?\.anchor\(point, currentPose\)/);
 assert.match(adapter,/Promise\.all\(variants\.flatMap/);
 assert.match(adapter,/state\.ready=false;state\.active=false/);
 assert.match(adapter,/skema SVG tetap digunakan/);
 assert.match(adapter,/aria-pressed/);
 assert.match(css,/ts-pose-art-controls/);
 assert.match(css,/ts-pose-art-active \.ts-scheme-only/);
 assert.equal((html.match(/id="postureArtMode"/g)||[]).length,1);
});


test('posture review is complete only when all six valid WebP images are present',()=>{
 const base=new URL('../assets/posture/',import.meta.url);
 const names=['blue-front','blue-side','blue-back','red-front','red-side','red-back'];
 const present=names.filter(name=>existsSync(new URL(name+'.webp',base)));
 if(present.length!==0)assert.deepEqual(present,names,'posture assets must be added as a complete set');
 if(process.env.REQUIRE_POSTURE_ASSETS==='1')assert.equal(present.length,6,'merge gate: assets are missing');
 for(const name of present){
   const location=new URL(name+'.webp',base);
   assert.ok(statSync(location).size>=1000,name+' should not be a placeholder');
   const data=readFileSync(location);
   assert.equal(data.subarray(0,4).toString(),'RIFF',name+' is not a RIFF/WebP asset');
   assert.equal(data.subarray(8,12).toString(),'WEBP',name+' has an invalid WebP header');
 }
});


test('optics study uses a fixed detailed scope and only a slider-driven head',()=>{
  assert.match(html, /id="opticalAlignmentIllustration"/);
  assert.match(html, /id="opticFixedScope"/);
  assert.match(html, /id="optStaticRifle"/);
  assert.match(html, /id="svgShooterHeadSide"/);
  assert.doesNotMatch(html, /id="svgSideCheekpiece"/);
  assert.match(html, /id="opticalAlignmentIllustration"[^>]*viewBox="0 0 800 282"/);
  assert.match(html, /TINGGI POSISI MATA/);
  assert.match(html, /KESTABILAN PANDANGAN/);
  assert.match(js, /const dx = \(dist - 85\) \* 0\.6/);
  assert.match(js, /const dy = -7 - comb \* 0\.85/);
  assert.doesNotMatch(js, /getElementById\('svgSideCheekpiece'\)/);
  assert.match(css, /\.optical-side-pan/);
});