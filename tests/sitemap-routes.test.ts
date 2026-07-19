import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { listCulturePages } from '../src/content/culture/registry.ts';
import { games } from '../src/core/gamesRegistry.ts';

test('expected public URLs cover culture games about home', () => {
  const urls = new Set<string>([
    'https://game.rexai.top/',
    'https://game.rexai.top/about/',
    'https://game.rexai.top/culture/',
  ]);
  for (const g of games) {
    const href = g.href.endsWith('/') ? g.href : `${g.href}/`;
    urls.add(`https://game.rexai.top${href}`);
  }
  for (const p of listCulturePages()) {
    urls.add(`https://game.rexai.top${p.path}`);
  }
  assert.ok(urls.size >= 1 + 1 + 1 + games.length + listCulturePages().length);
});

test('sitemap.ts enumerates culture registry and about', () => {
  const src = readFileSync(new URL('../app/sitemap.ts', import.meta.url), 'utf8');
  assert.match(src, /listCulturePages/);
  assert.match(src, /about/);
});
