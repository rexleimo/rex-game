import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('ActShell renders act progress, scene and children', () => {
  const src = readFileSync(new URL('src/games/jianzhi/theater/ActShell.tsx', root), 'utf8');
  assert.match(src, /th-act/);
  assert.match(src, /th-scene/);
  assert.match(src, /SceneArt/);
  assert.match(src, /children/);
});

test('DialogueBar plays lines sequentially and can finish', () => {
  const src = readFileSync(new URL('src/games/jianzhi/theater/DialogueBar.tsx', root), 'utf8');
  assert.match(src, /th-dialog/);
  assert.match(src, /character/);
  assert.match(src, /lines/);
  assert.match(src, /onDone/);
});

test('JianzhiGame workshop uses theater stage components', () => {
  const src = readFileSync(new URL('src/games/jianzhi/JianzhiGame.tsx', root), 'utf8');
  assert.match(src, /ActShell/);
  assert.match(src, /DialogueBar/);
  assert.match(src, /CutBench/);
});
