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
 assert.match(html,/bukan rekomendasi setelan peralatan/);
 assert.doesNotMatch(html,/ANTI-SLOP EDITION|REV\.14|DOKTRIN POSTER/);
 assert.match(html,/href="\/rules"/);
});

test('published claims distinguish official rules from unvalidated demonstrations',()=>{
 assert.match(html,/id="lab-sources"/);
 assert.match(html,/IMSSU Official Sporting Rules 2025/);
 assert.match(html,/toleransi jarak ±2,5%/);
 assert.match(html,/ref="noopener noreferrer"/);
 assert.doesNotMatch(html,/110 gf \(IDEAL\)|85 mm \(IDEAL\)|DROP: -6\.8 CM|1085 mm/);
 assert.doesNotMatch(js,/Reduksi goyangan 80%|LINTASAN CONTOH:.*KLIK CONTOH/);
 assert.doesNotMatch(js,/ref: 'REF POSTER/);
 assert.match(js,/unit model/);
 assert.match(js,/JARAK SESUAI ATURAN/);
 assert.match(html,/bukan template produksi sasaran/);
});
