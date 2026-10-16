import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
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
test('all nine sliders and sixteen SVG input nodes remain accessible',()=>{
 const sliders=[...html.matchAll(/<input\b[^>]*type="range"[^>]*>/g)].map(x=>x[0]);
 assert.equal(sliders.length,9);
 assert.ok(sliders.every(x=>x.includes('aria-label=')));
 assert.ok((html.match(/tabindex="0" role="button"/g)||[]).length>=16);
 assert.match(js,/btn\.setAttribute\('aria-label', `Titik/);
 assert.match(js,/btn\.setAttribute\('aria-pressed','false'\)/);
});
test('pointer cancellation, keyboard input, pose sync, and RAF throttling are implemented',()=>{
 for(const key of ['pointerdown','pointerup','pointercancel','lostpointercapture','keydown','keyup'])assert.ok(js.includes(key),key);
 assert.match(js,/if \(!chosen \|\| chosen\.pose !== poseKey\)/);
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
 assert.match(html,/href="#lab-sources">Periksa sumber/);
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
 assert.match(html,/ATURAN: IMSSU 2025/);
 assert.match(html,/ILUSTRASI: BUKAN DATA TERUKUR/);
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
 assert.match(js,/calloutPicker\.value = item\.id/);
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
