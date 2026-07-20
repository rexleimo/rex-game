import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('GameChrome exposes gs-head back title body', () => {
  const src = readFileSync(new URL('src/components/game/GameChrome.tsx', root), 'utf8');
  assert.match(src, /gs-head/);
  assert.match(src, /gs-back/);
  assert.match(src, /gs-title/);
  assert.match(src, /gs-body/);
  assert.match(src, /返回展厅/);
});

test('game-shell.css uses --g-* tokens and shell primitives', () => {
  const css = readFileSync(new URL('src/styles/game-shell.css', root), 'utf8');
  for (const sel of [
    '.gs-root',
    '.gs-head',
    '.gs-btn--primary',
    '.gs-btn--ghost',
    '.gs-eyebrow',
    '.gs-panel',
    'prefers-reduced-motion',
  ]) {
    assert.ok(css.includes(sel), `missing ${sel}`);
  }
  assert.match(css, /var\(--g-abyss\)|var\(--g-lacquer\)/);
  assert.match(css, /var\(--g-cinnabar\)/);
  assert.match(css, /var\(--g-gold\)/);
  // 壳主色不得整块硬编码另一套色板：允许 rgba 半透明，禁止独立 #hex 主色板行
  const hexColors = css.match(/#[0-9A-Fa-f]{3,8}/g) ?? [];
  assert.ok(
    hexColors.length === 0,
    `game-shell.css should not hardcode hex colors, found: ${hexColors.join(', ')}`,
  );
});
