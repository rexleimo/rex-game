import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('CultureDocument wires quick answer FAQ sources and play CTA', () => {
  const src = readFileSync(new URL('src/components/site/CultureDocument.tsx', root), 'utf8');
  assert.match(src, /QuickAnswerBar/);
  assert.match(src, /FaqList/);
  assert.match(src, /SourceList/);
  assert.match(src, /CultureCtaBanner/);
  assert.match(src, /JsonLd|buildCulturePageGraph/);
});

test('GalleryHeader exposes culture and about nav', () => {
  const src = readFileSync(new URL('src/components/site/GalleryHeader.tsx', root), 'utf8');
  assert.match(src, /SITE_NAV/);
  assert.match(src, /REX-GAME/);
  const site = readFileSync(new URL('src/content/site.ts', root), 'utf8');
  assert.match(site, /文化馆/);
  assert.match(site, /关于/);
});
