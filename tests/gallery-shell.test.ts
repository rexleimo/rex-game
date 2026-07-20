import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('GalleryHeader: client component, wordmark, nav, mobile menu', () => {
  const src = readFileSync(new URL('src/components/site/GalleryHeader.tsx', root), 'utf8');
  assert.match(src, /'use client'/);
  assert.match(src, /REX-GAME/);
  assert.match(src, /SITE_NAV/);
  assert.match(src, /aria-expanded/);
  assert.match(src, /gh--scrolled/);
});

test('GalleryFooter: wordmark, nav columns, disclaimer', () => {
  const src = readFileSync(new URL('src/components/site/GalleryFooter.tsx', root), 'utf8');
  assert.match(src, /REX-GAME · 民艺馆/);
  assert.match(src, /listCultureHubs/);
  assert.match(src, /SITE_DISCLAIMER/);
});
