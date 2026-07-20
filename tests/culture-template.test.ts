import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('CultureDocument splits hub/topic and uses gallery shell', () => {
  const src = readFileSync(new URL('src/components/site/CultureDocument.tsx', root), 'utf8');
  assert.match(src, /theme-gallery/);
  assert.match(src, /GalleryHeader/);
  assert.match(src, /GalleryFooter/);
  assert.match(src, /CultureHubGallery/);
  assert.match(src, /CultureHero/);
  assert.match(src, /QuickAnswerBar/);
  assert.match(src, /culture-paper/);
  assert.match(src, /CultureCtaBanner/);
  assert.doesNotMatch(src, /theme-museum/);
  assert.doesNotMatch(src, /SiteHeader/);
});

test('culture types carry presentation fields', () => {
  const src = readFileSync(new URL('src/content/culture/types.ts', root), 'utf8');
  assert.match(src, /readingMinutes\?: number/);
  assert.match(src, /symbol\?: CultureHubId/);
  assert.match(src, /ogImage\?: string/);
});

test('culture index page uses gallery shell', () => {
  const src = readFileSync(new URL('app/culture/page.tsx', root), 'utf8');
  assert.match(src, /theme-gallery/);
  assert.match(src, /GalleryHeader/);
  assert.doesNotMatch(src, /theme-museum/);
});
