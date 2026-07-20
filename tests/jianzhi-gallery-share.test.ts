import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('shareCard builds 1080x1350 branded card with watermark', () => {
  const src = readFileSync(new URL('src/games/jianzhi/theater/shareCard.ts', root), 'utf8');
  assert.match(src, /1080/);
  assert.match(src, /1350/);
  assert.match(src, /REX-GAME/);
  assert.match(src, /纸上生花/);
  assert.match(src, /toBlob/);
});

test('GalleryWall frames works with spotlights and share action', () => {
  const src = readFileSync(new URL('src/games/jianzhi/theater/GalleryWall.tsx', root), 'utf8');
  assert.match(src, /th-wall/);
  assert.match(src, /th-frame/);
  assert.match(src, /分享|share/i);
  const game = readFileSync(new URL('src/games/jianzhi/JianzhiGame.tsx', root), 'utf8');
  assert.match(game, /GalleryWall/);
});
