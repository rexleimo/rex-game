import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('self-hosted font subsets exist and stay small', () => {
  for (const name of ['NotoSerifSC-subset.woff2', 'NotoSansSC-subset.woff2']) {
    const p = new URL(`public/fonts/${name}`, root);
    assert.ok(existsSync(p), `${name} missing — run: pnpm fonts`);
    const size = statSync(p).size;
    assert.ok(size > 30_000 && size < 1_500_000, `${name} unexpected size ${size}`);
  }
});

test('layout no longer loads Google Fonts; tokens declare @font-face', () => {
  const layout = readFileSync(new URL('app/layout.tsx', root), 'utf8');
  assert.doesNotMatch(layout, /fonts\.googleapis\.com/);
  assert.doesNotMatch(layout, /fonts\.gstatic\.com/);
  const tokens = readFileSync(new URL('src/styles/tokens.css', root), 'utf8');
  assert.match(tokens, /@font-face/);
  assert.match(tokens, /NotoSerifSC-subset\.woff2/);
  assert.match(tokens, /NotoSansSC-subset\.woff2/);
});
