import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('face renders distinguish lacquer crown from wooden underside', () => {
  const rounded = readFileSync(new URL('public/assets/jiaobei/jiaobei-rounded.webp', root));
  const flat = readFileSync(new URL('public/assets/jiaobei/jiaobei-flat.webp', root));
  assert.ok(rounded.length > 1000);
  assert.ok(flat.length > 1000);
  assert.notDeepEqual(rounded, flat);
});

test('local ritual GLBs stay within the agreed asset budget', () => {
  for (const name of ['xianglu.glb', 'lotus-candle-stand.glb']) {
    const file = new URL('public/assets/models/jiaobei/' + name, root);
    assert.ok(statSync(file).size > 10_000);
    assert.ok(statSync(file).size < 1_500_000);
  }
  assert.match(readFileSync(new URL('public/assets/models/jiaobei/LICENSES.md', root), 'utf8'), /CC0-1.0/);
});
