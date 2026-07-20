import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('llms.txt exists and indexes games + culture hubs', () => {
  const p = new URL('public/llms.txt', root);
  assert.ok(existsSync(p), 'public/llms.txt missing');
  const src = readFileSync(p, 'utf8');
  assert.match(src, /可玩的民俗文化馆/);
  assert.match(src, /\/games\/shantou-jiaobei\//);
  assert.match(src, /\/culture\/jiaobei\//);
  assert.match(src, /\/culture\/yingge\//);
  assert.match(src, /\/culture\/jianzhi\//);
});

test('sitemap includes llms.txt', () => {
  const src = readFileSync(new URL('app/sitemap.ts', root), 'utf8');
  assert.match(src, /llms\.txt/);
});
