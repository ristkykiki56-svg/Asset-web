import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const html = read('lab.html');
const js = read('lab.js');
const css = read('lab.css');
const posture = read('posture-art.js');
const optics = read('optics-poster-artwork.js');

// Gate for copy affected by the five-lesson raster migration. Keep scope
// deliberately narrow: legacy technical quotations elsewhere are not rewritten.
test('copy gate: five lesson introductions and equipment descriptions are plain, specific Indonesian', () => {
  const introductions = [...html.matchAll(/<p\b[^>]*class="lab-section-hint"[^>]*>([^<]+)<\/p>/g)].map(match => match[1]);
  assert.equal(introductions.length, 5, 'expected one introduction per lesson');
  const block = js.slice(js.indexOf('const HARDWARE_SPECS = {'), js.indexOf('function inspectHardware(key)'));
  assert.ok(block.length > 1500, 'hardware descriptions must be present');
  const descriptions = [...block.matchAll(/\b(?:code|title|body|note): '([^']+)'/g)].map(match => match[1]);
  assert.equal(descriptions.length, 40, 'ten components need a code, title, body and note');
  const auditedCopy = [...introductions, ...descriptions];
  for (const phrase of auditedCopy) {
    assert.doesNotMatch(phrase, /—/, 'avoid decorative em dash in edited copy');
    assert.doesNotMatch(phrase, /\b(?:sempurna|revolusioner|menakjubkan|terbaik|paling akurat|standar emas|optimal untuk semua|anti.slop)\b/i, 'unsupported hype or generic phrasing');
    assert.ok(phrase.split(/\s+/).length <= 55, 'keep copy concise: ' + phrase.slice(0,80));
  }
});

test('copy gate: posture explains body parts and offers only character artwork',()=>{
 assert.match(html,/Pilih warna dan sudut pandang/);
 assert.doesNotMatch(html,/Gunakan gambar karakter|membuka skema SVG|id="archSlider"/);
 assert.doesNotMatch(posture,/Slider tersedia|Matikan opsi/);
 const anatomy=js.slice(js.indexOf('const POSTER_BIOMECH_DATA'),js.indexOf('let currentPose'));
 assert.doesNotMatch(anatomy,/WebP|SVG|slider|sensor|persen/i);
});

test('copy gate: optics describes both the moving-head and lens-only controls', () => {
  assert.match(html, /Jarak dan tinggi mata menggeser kepala/);
  assert.match(html, /Posisi lateral dan variasi pandangan hanya mengubah tampilan dalam lensa/);
  assert.match(html, /Dua kontrol posisi menggeser kepala/);
  assert.match(js, /optLatLabel'\)\.textContent = .*mm \(MODEL\)/);
  assert.match(js, /optCheekHeightLabel'\)\.textContent = .*mm \(MODEL\)/);
  assert.match(optics, /getForeground:\(\)=>foreground/);
  assert.doesNotMatch(html, /Slider hanya menggeser kepala ilustrasi/);
});

test('copy gate: silhouette failure retains the animal silhouette and 20 buttons', () => {
  assert.match(html, /Di ponsel, satu kelompok ditampilkan setiap kali/);
  assert.match(js, /const SILHOUETTE_RASTERS =/);
  assert.match(js, /const SILHOUETTE_FALLBACK_PATHS =/);
  assert.match(js, /document\.createElementNS\(ns, 'svg'\)/);
  assert.match(css, /#sec-imssu \.silhouette-fallback svg/);
  assert.match(js, /for \(let i = 0; i < 5; i\+\+\)/);
});

test('copy gate: hardware photo, separate scope diagram and marker-only slider are accurately named', () => {
  assert.match(html, /foto senapan merah atau 07–10 pada skema teleskop/);
  assert.match(html, /PENANDA POSISI PADA DIAGRAM/);
  assert.match(html, /Posisi tersebut tidak dihitung dari berat/);
  assert.match(js, /title: 'Bagian Depan Badan Senapan \(Fore-End\)'/);
  assert.match(js, /Nomor 04 bukan pengatur teleskop/);
  assert.match(html, /Gambar senapan dan ilustrasi teleskop ditampilkan secara terpisah/);
  assert.doesNotMatch(html, /DISTRIBUSI BERAT &amp; TITIK KESEIMBANGAN SENAPAN/);
  assert.doesNotMatch(html, /\[04\] Penyelarasan Peninggi/);
});
