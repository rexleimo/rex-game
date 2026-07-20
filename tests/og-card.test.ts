import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('og-home.png exists and is 1200x630', () => {
  const p = new URL('public/assets/og-home.png', root);
  assert.ok(existsSync(p), 'og-home.png missing — run: pnpm og');
  const buf = readFileSync(p);
  assert.equal(buf.readUInt32BE(16), 1200, 'PNG width');
  assert.equal(buf.readUInt32BE(20), 630, 'PNG height');
});

test('layout OG/Twitter reference og-home.png with new copy', () => {
  const src = readFileSync(new URL('app/layout.tsx', root), 'utf8');
  assert.match(src, /\/assets\/og-home\.png/);
  assert.match(src, /可玩的民俗文化馆/);
});
