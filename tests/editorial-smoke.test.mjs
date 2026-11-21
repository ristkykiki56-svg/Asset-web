import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../homepage-editorial.css', import.meta.url), 'utf8');
const motion = readFileSync(new URL('../homepage-motion.js', import.meta.url), 'utf8');
const rules = readFileSync(new URL('../rules.html', import.meta.url), 'utf8');

test('editorial hero identifies both real athletes (Google Fonts only)', () => {
  assert.match(html, /<section class="hero-section" aria-labelledby="hero-title">/);
  assert.match(html, /<h1 id="hero-title" class="hero-title">Clarisa Azalia<span class="twin-amp">&amp; Aurellia Cassandra<\/span><\/h1>/);
  assert.match(html, /class="hero-lead"/);
  assert.match(html, /assets\/clarisa\.webp/);
  assert.match(html, /assets\/aurellia\.webp/);
  assert.equal((html.match(/<article class="twin-card/g)||[]).length, 2);
  assert.match(html, /alt="Clarisa Azalia memegang air rifle"/);
  assert.match(html, /alt="Aurellia Cassandra memegang air rifle"/);
  assert.match(html, /fonts\.googleapis\.com\/css2\?family=Archivo/);
  assert.doesNotMatch(html, /https:\/\/cdn\./);
  assert.doesNotMatch(html, /<script[^>]+src="https:/);
  assert.match(css, /\.twin-card\.is-clarisa:hover/);
});

test('featured facts are supported by the original achievement records', () => {
  assert.match(html, /CLARISA AZALIA · POPNAS XVI/);
  assert.match(html, /AURELLIA CASSANDRA · JABAR OPEN/);
  assert.match(html, /<p class="featured-rank">Juara 2<\/p>/);
  assert.match(html, /<p class="featured-rank">Juara 1<\/p>/);
  assert.match(html, /<p class="featured-class">Multi Range Women Junior · 2023<\/p>/);
  assert.match(html, /<article class="sb-row[^>]*>[\s\S]{0,600}?<strong>POPNAS XVI Sumatra Selatan<\/strong>/);
  assert.match(html, /<article class="sb-row[^>]*>[\s\S]{0,600}?<strong>Kejuaraan Nasional Jabar Open<\/strong>/);
});

test('archive, accessibility and navigation are preserved', () => {
  assert.equal((html.match(/<article class="sb-row /g)||[]).length,25);
  for(const href of ['#athletes','#journey','#achievements','/rules']){
    assert.ok(html.includes('href="'+href+'"'), href);
  }
  assert.match(html,/id="results-status" role="status" aria-live="polite"/);
  assert.match(motion,/row\.hidden = !match/);
  assert.match(motion,/btn\.setAttribute\('aria-pressed', String\(active\)\)/);
  assert.match(html, /class="skip-link"/);
  assert.match(css, /:where\(a, button\):focus-visible/);
});

test('lightweight motion, responsive behavior, and rules remain intact', () => {
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /opacity: 1 !important/);
  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /@media \(max-width: 960px\)/);
  assert.match(css, /\.timeline::before\s*\{/);
  assert.match(css, /\.timeline-fill\s*\{/);
  assert.match(motion, /tio\.disconnect\(\)/);
  assert.match(motion, /fill\.style\.transform = 'scaleY\(1\)'/);
  assert.match(rules, /id="pdfCanvas"/);
  assert.match(rules, /assets\/documents\/imssu-sporting-rules-2025-bilingual\.pdf/);
});
