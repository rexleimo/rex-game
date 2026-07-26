import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('shareCard builds 1080x1350 branded card with watermark', () => {
  const src = readFileSync(new URL('src/games/jianzhi/theater/shareCard.ts', root), 'utf8');
  // 尺寸与水印在抽层后由 core/share 原语提供，剪纸卡只负责版式
  const primitives = readFileSync(new URL('src/core/share/cardCanvas.ts', root), 'utf8');
  assert.match(primitives, /CARD_WIDTH = 1080/);
  assert.match(primitives, /CARD_HEIGHT = 1350/);
  assert.match(primitives, /REX-GAME/);
  assert.match(primitives, /toBlob/);

  assert.match(src, /CARD_WIDTH/);
  assert.match(src, /CARD_HEIGHT/);
  assert.match(src, /paintWatermark/);
  assert.match(src, /纸上生花/);
});

test('GalleryWall frames works with spotlights and share action', () => {
  const src = readFileSync(new URL('src/games/jianzhi/theater/GalleryWall.tsx', root), 'utf8');
  assert.match(src, /th-wall/);
  assert.match(src, /th-frame/);
  assert.match(src, /分享|share/i);
  const game = readFileSync(new URL('src/games/jianzhi/JianzhiGame.tsx', root), 'utf8');
  assert.match(game, /GalleryWall/);
});
