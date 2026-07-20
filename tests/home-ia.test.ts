import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('home page uses gallery shell and keeps exhibits anchor + JsonLd', () => {
  const src = readFileSync(new URL('app/page.tsx', root), 'utf8');
  assert.match(src, /theme-gallery/);
  assert.match(src, /GalleryHeader/);
  assert.match(src, /GalleryFooter/);
  assert.match(src, /id="exhibits"/);
  assert.match(src, /JsonLd/);
  assert.match(src, /CultureGateway/);
  assert.doesNotMatch(src, /theme-museum/);
});

test('about page switched to gallery shell', () => {
  const src = readFileSync(new URL('app/about/page.tsx', root), 'utf8');
  assert.match(src, /theme-gallery/);
  assert.match(src, /GalleryHeader/);
  assert.doesNotMatch(src, /theme-museum/);
});

test('site title drops cheap wording', () => {
  const layout = readFileSync(new URL('app/layout.tsx', root), 'utf8');
  assert.match(layout, /可玩的民俗文化馆/);
  assert.doesNotMatch(layout, /趣玩/);
  const manifest = readFileSync(new URL('public/manifest.json', root), 'utf8');
  assert.match(manifest, /可玩的民俗文化馆/);
  assert.doesNotMatch(manifest, /趣玩/);
});
