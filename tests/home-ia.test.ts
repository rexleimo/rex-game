import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('home page uses museum shell and culture CTA', () => {
  const src = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
  assert.match(src, /theme-museum|SiteHeader/);
  assert.match(src, /文化馆|\/culture\//);
  assert.match(src, /id=\"exhibits\"|id='exhibits'/);
  assert.match(src, /games\.map|games\[0\]/);
});
