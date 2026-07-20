import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('culture pages derive per-page og image by naming convention with override field', () => {
  for (const file of ['app/culture/[hub]/page.tsx', 'app/culture/[hub]/[topic]/page.tsx']) {
    const src = readFileSync(new URL(file, root), 'utf8');
    assert.match(src, /ogImage/, `${file} should allow page.ogImage override`);
    assert.match(src, /\/assets\/og\/culture-/, `${file} should derive convention path`);
  }
});

test('every culture page has a generated OG card on disk', async () => {
  const { listCulturePages } = await import('../src/content/culture/registry.ts');
  for (const page of listCulturePages()) {
    const name = page.kind === 'hub' ? `culture-${page.hub}` : `culture-${page.hub}-${page.slug}`;
    const p = new URL(`public/assets/og/${name}.png`, root);
    assert.ok(existsSync(p), `${name}.png missing — run: pnpm og:culture`);
  }
});
