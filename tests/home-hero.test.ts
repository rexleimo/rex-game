import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('HomeHero renders approved claim and CTAs', () => {
  const src = readFileSync(new URL('src/components/site/HomeHero.tsx', root), 'utf8');
  assert.match(src, /一座可以玩的/);
  assert.match(src, /民艺馆/);
  assert.match(src, /进入展厅/);
  assert.match(src, /先去文化馆/);
  assert.match(src, /HeroInstallation/);
});

test('HeroInstallation is client, parallax layers, reduced-motion safe', () => {
  const src = readFileSync(new URL('src/components/site/HeroInstallation.tsx', root), 'utf8');
  assert.match(src, /'use client'/);
  assert.match(src, /data-depth/);
  assert.match(src, /prefers-reduced-motion/);
  assert.match(src, /aria-hidden/);
});
