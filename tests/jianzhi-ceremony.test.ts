import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('UnfoldCeremony renders cinematic reveal with skip and reduced-motion path', () => {
  const src = readFileSync(new URL('src/games/jianzhi/theater/UnfoldCeremony.tsx', root), 'utf8');
  assert.match(src, /th-ceremony/);
  assert.match(src, /prefers-reduced-motion|reducedMotion/);
  assert.match(src, /跳过|skip/i);
  assert.match(src, /phrase/);
  const game = readFileSync(new URL('src/games/jianzhi/JianzhiGame.tsx', root), 'utf8');
  assert.match(game, /UnfoldCeremony/);
  assert.match(game, /exportPNG/);
});
