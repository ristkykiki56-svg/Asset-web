import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../profile.css', import.meta.url), 'utf8');
const rules = readFileSync(new URL('../rules.html', import.meta.url), 'utf8');

test('all athlete data and results remain in static HTML', () => {
  assert.match(html, /Clarisa Azalia/);
  assert.match(html, /Aurellia Cassandra/);
  assert.equal((html.match(/<article class="achievement /g) || []).length, 25);
  assert.match(html, /id="achievements"/);
  assert.match(html, /id="journey"/);
  assert.match(html, /assets\/clarisa\.webp/);
  assert.match(html, /assets\/aurellia\.webp/);
});

test('remove generic reveal so content never waits for JS to become visible', () => {
  assert.doesNotMatch(html, /class="[^"]*\breveal\b/);
  assert.doesNotMatch(html, /classList\.add\('has-js'\)/);
  assert.doesNotMatch(css, /\.has-js \.reveal/);
});

test('hero has targeted entrance and reduced motion safeguard', () => {
  assert.match(css, /@keyframes ts-hero-enter/);
  assert.match(css, /@keyframes ts-photo-enter/);
  assert.match(css, /prefers-reduced-motion:no-preference/);
  assert.match(css, /\.hero h1\{animation:ts-hero-enter/);
  assert.doesNotMatch(css, /animation-iteration-count:\s*infinite/);
});

test('timeline only moves a decorative line with static fallback', () => {
  assert.match(css, /\.journey::after\{/);
  assert.match(css, /\.journey\.motion-pending\.motion-active::after/);
  assert.match(css, /\.journey:before\{[^}]*background:rgba/);
  assert.match(html, /observer\.disconnect\(\)/);
  assert.match(html, /'IntersectionObserver' in window/);
  assert.match(html, /prefers-reduced-motion: reduce/);
});

test('filter remains immediate and accessible', () => {
  assert.match(html, /card\.hidden=!match/);
  assert.match(html, /button\.setAttribute\('aria-pressed',String\(active\)\)/);
  assert.match(html, /id="results-status" role="status" aria-live="polite"/);
  assert.match(css, /\.filter\{transition:background-color 160ms/);
});

test('IMSSU rules remain accessible and functional', () => {
  assert.match(rules, /id="pdfViewer"/);
  assert.match(rules, /id="zoomIn"/);
  assert.match(rules, /id="zoomOut"/);
  assert.match(rules, /drive\.google\.com/);
});
