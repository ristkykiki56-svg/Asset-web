import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';

const porprov = readFileSync(new URL('../porprov-2026.html', import.meta.url), 'utf8');
const home = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const lab = readFileSync(new URL('../lab.html', import.meta.url), 'utf8');
const rules = readFileSync(new URL('../rules.html', import.meta.url), 'utf8');
const motion = readFileSync(new URL('../homepage-motion.js', import.meta.url), 'utf8');
const llms = readFileSync(new URL('../llms.txt', import.meta.url), 'utf8');
const llmsFull = readFileSync(new URL('../llms-full.txt', import.meta.url), 'utf8');
const sitemap = readFileSync(new URL('../sitemap.xml', import.meta.url), 'utf8');
const robots = readFileSync(new URL('../robots.txt', import.meta.url), 'utf8');

function jsonLd(html) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  assert.ok(blocks.length > 0, 'expected at least one JSON-LD block');
  return blocks.map((b) => JSON.parse(b));
}

test('Porprov FAQ section renders all 13 verified questions', () => {
  assert.match(porprov, /<section id="faq" class="faq-band"/);
  assert.equal((porprov.match(/<article class="faq-item/g) || []).length, 13);
  assert.equal((porprov.match(/<span class="faq-num"/g) || []).length, 13);
  assert.match(porprov, /Di mana bisa latihan menembak IMSSU di Depok\?/);
  assert.match(porprov, /Informasi tempat, jadwal, dan pendaftaran latihan belum tersedia di situs ini\./);
  assert.match(porprov, /Sekolah Menembak Perbakin di Lapangan Tembak Senayan/);
  assert.match(porprov, /href="#faq">FAQ IMSSU &amp; Latihan/);
});

test('Porprov FAQPage JSON-LD carries the same 13 questions', () => {
  const graphs = jsonLd(porprov).flatMap((doc) => doc['@graph'] || [doc]);
  const faq = graphs.find((node) => node['@type'] === 'FAQPage');
  assert.ok(faq, 'FAQPage node missing');
  assert.equal(faq.mainEntity.length, 13);
  assert.ok(faq.mainEntity.every((q) => q['@type'] === 'Question' && q.acceptedAnswer && q.acceptedAnswer['@type'] === 'Answer'));
  const names = faq.mainEntity.map((q) => q.name);
  assert.ok(names.includes('Harus beli senapan dulu sebelum latihan?'));
  assert.ok(names.includes('Kalau belum ada info Depok, di mana bisa belajar menembak dulu?'));
});

test('llms-full.txt exists and mirrors the FAQ and P70 modules', () => {
  assert.ok(existsSync(new URL('../llms-full.txt', import.meta.url)));
  assert.match(llmsFull, /13 tanya jawab/);
  assert.match(llmsFull, /FAQ IMSSU & Latihan Depok/);
  assert.match(llmsFull, /Feinwerkbau P70/);
  assert.match(llms, /llms-full\.txt/);
  for (const page of [home, porprov, lab, rules]) {
    assert.match(page, /rel="alternate" type="text\/markdown" href="https:\/\/twinshooter\.vercel\.app\/llms-full\.txt"/);
  }
});

test('P70 simulation links deep-link to real Lab sections and are well formed', () => {
  for (const anchor of ['sec-optics', 'sec-trigger', 'sec-biomech']) {
    assert.ok(lab.includes(`id="${anchor}"`), `lab.html missing #${anchor}`);
    assert.ok(motion.includes(`lab#${anchor}">`), `homepage-motion.js missing well-formed lab#${anchor} link`);
  }
  assert.doesNotMatch(motion, /href="[^"]*↗/);
  assert.match(motion, /Uji Pelatuk di Lab ↗<\/a>/);
  assert.match(motion, /Cek Postur di Lab ↗<\/a>/);
});

test('sitemap lists the PDF documents and robots allows AI crawlers', () => {
  assert.match(sitemap, /imssu-sporting-rules-2025-bilingual\.pdf/);
  assert.match(sitemap, /imssu-oga-minutes-2026\.pdf/);
  for (const bot of ['OAI-SearchBot', 'GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended']) {
    assert.ok(robots.includes(`User-agent: ${bot}`), `robots.txt missing ${bot}`);
  }
});

test('JSON-LD on every page parses', () => {
  for (const [name, html] of [['index', home], ['porprov', porprov], ['lab', lab], ['rules', rules]]) {
    assert.doesNotThrow(() => jsonLd(html), `${name} JSON-LD must parse`);
  }
});
