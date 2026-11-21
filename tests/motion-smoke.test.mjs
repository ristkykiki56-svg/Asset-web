import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../homepage-editorial.css', import.meta.url), 'utf8');
const motion = readFileSync(new URL('../homepage-motion.js', import.meta.url), 'utf8');
const rules = readFileSync(new URL('../rules.html', import.meta.url), 'utf8');

test('all athlete data and results remain in static HTML', () => {
  assert.match(html, /Clarisa Azalia/);
  assert.match(html, /Aurellia Cassandra/);
  assert.equal((html.match(/<article class="sb-row /g) || []).length, 25);
  assert.match(html, /id="achievements"/);
  assert.match(html, /id="journey"/);
  assert.match(html, /assets\/clarisa\.webp/);
  assert.match(html, /assets\/aurellia\.webp/);
});

test('remove generic reveal so content never waits for JS to become visible', () => {
  assert.doesNotMatch(html, /class="[^"]*\breveal\b/);
  assert.doesNotMatch(motion, /classList\.add\('has-js'\)/);
  assert.doesNotMatch(css, /\.has-js \.reveal/);
  // Hiding is scoped under html.js-anim, a class only the motion script adds:
  // with no JS, nothing is hidden and the page stays fully readable.
  assert.match(motion, /classList\.add\('js-anim'\)/);
  assert.match(css, /html\.js-anim \[data-reveal\] \{/);
  assert.match(css, /html\.js-anim \.hero-title/);
});

test('hero has targeted entrance and reduced motion safeguard', () => {
  assert.match(css, /@keyframes sbPop/);
  assert.match(css, /\.motion-ready \.hero-title \{ opacity: 1/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(css, /animation-iteration-count:\s*infinite/);
});

test('timeline only moves a decorative line with static fallback', () => {
  assert.match(css, /\.timeline::before\s*\{/);
  assert.match(css, /\.timeline-fill\s*\{/);
  assert.match(css, /transform: scaleY\(0\)/);
  assert.match(motion, /'IntersectionObserver' in window/);
  assert.match(motion, /io\.unobserve\(entry\.target\)/);
  assert.match(motion, /matchMedia\('\(prefers-reduced-motion: reduce\)'\)/);
});

test('filter remains immediate and accessible', () => {
  assert.match(motion, /row\.hidden = !match/);
  assert.match(motion, /btn\.setAttribute\('aria-pressed', String\(active\)\)/);
  assert.match(html, /id="results-status" role="status" aria-live="polite"/);
  assert.match(css, /transition: background-color 0\.14s ease/);
});

test('IMSSU rules remain accessible and functional', () => {
  assert.match(rules, /id="pdfCanvas"/);
  assert.match(rules, /id="zoomIn"/);
  assert.match(rules, /id="zoomOut"/);
  assert.match(rules, /data-document="minutes"/);
  const reader=readFileSync(new URL('../rules-reader.js',import.meta.url),'utf8');
  assert.ok(reader.includes('imssu-oga-minutes-2026.pdf'));
});
