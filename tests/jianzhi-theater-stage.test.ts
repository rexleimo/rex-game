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
  // C 图优先 / B art / A 皆无隐藏；练功房用 badge 而非假进度
  assert.match(src, /showScene/);
  assert.match(src, /th-act-badge/);
});

test('SceneArt includes dedicated practice studio art', () => {
  const src = readFileSync(new URL('src/games/jianzhi/theater/SceneArt.tsx', root), 'utf8');
  assert.match(src, /practice/);
  assert.match(src, /练 功 房/);
});

test('PRACTICE_ACT uses practice scene art not reunion placeholder', () => {
  const src = readFileSync(new URL('src/games/jianzhi/JianzhiGame.tsx', root), 'utf8');
  assert.match(src, /art:\s*'practice'/);
  assert.doesNotMatch(src, /PRACTICE_ACT[\s\S]{0,200}art:\s*'reunion'/);
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
