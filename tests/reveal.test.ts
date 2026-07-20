import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('Reveal is a client component using IntersectionObserver with reduced-motion fallback', () => {
  const src = readFileSync(new URL('src/components/site/Reveal.tsx', root), 'utf8');
  assert.match(src, /'use client'/);
  assert.match(src, /IntersectionObserver/);
  assert.match(src, /prefers-reduced-motion/);
  assert.match(src, /is-in/);
  const css = readFileSync(new URL('src/styles/gallery.css', root), 'utf8');
  assert.match(css, /\.reveal/);
  assert.match(css, /\.reveal\.is-in/);
});
