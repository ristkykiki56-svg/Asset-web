import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../profile.css', import.meta.url), 'utf8');
const site = readFileSync(new URL('../site.css', import.meta.url), 'utf8');
const rules = readFileSync(new URL('../rules.html', import.meta.url), 'utf8');

test('editorial hero identifies both real athletes without new external dependencies', () => {
  assert.match(html, /<section class="hero wrap" aria-labelledby="hero-title">/);
  assert.match(html, /<h1 id="hero-title">Clarisa Azalia<br><span>&amp; Aurellia Cassandra<\/span><\/h1>/);
  assert.match(html, /class="hero-copy"/);
  assert.match(html, /assets\/clarisa\.webp/);
  assert.match(html, /assets\/aurellia\.webp/);
  assert.equal((html.match(/<article class="athlete/g)||[]).length, 2);
  assert.doesNotMatch(html, /https:\/\/fonts\.|https:\/\/cdn\./);
  assert.match(css, /\.duo::before\{content:none\}/);
  assert.match(css, /\.duo::after\{/);
});

test('featured facts are supported by the original achievement records', () => {
  assert.match(html, /CLARISA AZALIA · POPNAS XVI/);
  assert.match(html, /AURELLIA CASSANDRA · JABAR OPEN/);
  assert.match(html, /<p class="feature-result">Juara 2<\/p>/);
  assert.match(html, /<p class="feature-result">Juara 1<\/p>/);
  assert.match(html, /<p class="feature-class">Multi Range Women Junior · 2023<\/p>/);
  assert.match(html, /<h3>POPNAS XVI Sumatra Selatan<\/h3>/);
  assert.match(html, /<h3>Kejuaraan Nasional Jabar Open<\/h3>/);
});

test('archive, accessibility and navigation are preserved', () => {
  assert.equal((html.match(/<article class="achievement /g)||[]).length,25);
  for(const href of ['#athletes','#journey','#achievements','/rules']){
    assert.ok(html.includes('href="'+href+'"'), href);
  }
  assert.match(html,/id="results-status" role="status" aria-live="polite"/);
  assert.match(html,/card\.hidden=!match/);
  assert.match(html,/aria-pressed/);
  assert.match(html, /class="skip-link"/);
  assert.match(site, /:focus-visible/);
});

test('lightweight motion, responsive behavior, and rules remain intact', () => {
  assert.match(css, /prefers-reduced-motion:no-preference/);
  assert.match(css, /@media\(max-width:360px\)/);
  assert.match(css, /@media\(max-width:900px\)/);
  assert.match(css, /\.journey\.motion-pending\.motion-active::after/);
  assert.match(html, /observer\.disconnect\(\)/);
  assert.match(rules, /id="pdfViewer"/);
  assert.match(rules, /drive\.google\.com\/file\/d\/1KOkHDMheZ7-PYl_6c6C7Iz4fCdDQvkWl/);
});
