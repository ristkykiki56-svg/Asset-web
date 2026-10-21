import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, statSync} from 'node:fs';
import {createHash} from 'node:crypto';

const root = new URL('../', import.meta.url);
const read = p => readFileSync(new URL(p, root), 'utf8');
const html = read('rules.html');
const script = read('rules-reader.js');
const css = read('rules-reader.css');
const docs = [
  {name:'imssu-sporting-rules-2025-bilingual.pdf', count:110, sha:'11fa89e5bae8c36870f0c53af6e1ab8aee602c58db720702bd51ffc77e401460'},
  {name:'imssu-oga-minutes-2026.pdf', count:45, sha:'68ebb0264d4cdfe323e39ba88f886d6e71640071136aca5e48be0d6670772a7c'}
];

test('Rules: two original PDFs are preserved byte-for-byte', () => {
  for (const doc of docs) {
    const bytes = readFileSync(new URL('assets/documents/' + doc.name, root));
    assert.ok(bytes.length > 1_000_000 && bytes.length < 4_000_000);
    assert.equal(bytes.toString('ascii',0,5),'%PDF-');
    assert.equal(createHash('sha256').update(bytes).digest('hex'),doc.sha);
    assert.match(script, new RegExp(doc.name.replaceAll('.', '\\.'), 'i'));
    assert.match(script, new RegExp('pages: ' + doc.count));
  }
});

test('Rules: local PDF.js main module and matching worker are available', () => {
  assert.ok(statSync(new URL('assets/pdfjs/pdf.min.mjs',root)).size > 100_000);
  assert.ok(statSync(new URL('assets/pdfjs/pdf.worker.min.mjs',root)).size > 700_000);
  assert.match(script, /pdfjsLib\.GlobalWorkerOptions\.workerSrc/);
  assert.match(script, /pdfjsLib\.getDocument/);
  assert.doesNotMatch(html, /drive\.google\.com|<iframe/);
});

test('Rules: document and page navigation, zoom, search, direct file actions', () => {
  for (const id of ['docChoiceRules','docChoiceMinutes','pagePrev','pageNext','pageNumber','pageTotal',
    'zoomIn','zoomOut','zoomReset','pdfSearchForm','pdfSearchInput','searchNext','searchPrevious',
    'fullscreen','openPdf','downloadPdf','pdfCanvas','pdfError']) {
    assert.ok(html.includes('id="' + id + '"'),id+' missing');
  }
  assert.match(script,/window\.addEventListener\('popstate'/);
  assert.match(script,/history\[replace \? 'replaceState' : 'pushState'\]/);
  assert.match(css,/@media\(max-width:720px\)/);
  assert.match(html,/lang="id"/);
  assert.match(html,/45 halaman · Risalah rapat/);
  assert.match(script,/Risalah rapat 13 Juli 2026/);
  assert.match(html,/id="rulesSearchDisclosure"/);
  assert.match(html,/id="rulesContextDisclosure"/);
  assert.match(html,/Buka PDF asli/);
});

test('Rules: copy gate marks 2026 proposals as non-automatic rule changes', () => {
  assert.match(script, /Usulan yang tercantum tidak otomatis menjadi aturan yang berlaku/);
  assert.match(script, /Peraturan 2025/);
  const userText = [html, script.slice(script.indexOf('const DOCUMENTS'),script.indexOf('const el ='))].join('\n');
  assert.doesNotMatch(userText, /\b(?:revolusioner|luar biasa|solusi terbaik|bertransformasi|pengalaman tak tertandingi)\b/i);
  assert.doesNotMatch(userText, /<iframe/i);
});
