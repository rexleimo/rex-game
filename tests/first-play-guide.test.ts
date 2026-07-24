import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { completeFirstPlay, hasCompletedFirstPlay } from '../src/components/game/FirstPlayGuideState.ts';

class MemoryStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

test('a guide is visible until that game has been completed', () => {
  const storage = new MemoryStorage();
  const key = 'rex-game:jianzhi:first-play-guide:v1';

  assert.equal(hasCompletedFirstPlay(storage, key), false);
  completeFirstPlay(storage, key);
  assert.equal(hasCompletedFirstPlay(storage, key), true);
});

test('first-play completion is isolated by game storage key', () => {
  const storage = new MemoryStorage();
  completeFirstPlay(storage, 'rex-game:yingge:first-play-guide:v1');

  assert.equal(hasCompletedFirstPlay(storage, 'rex-game:yingge:first-play-guide:v1'), true);
  assert.equal(hasCompletedFirstPlay(storage, 'rex-game:jiaobei:first-play-guide:v1'), false);
});

test('every playable game configures its own first-play guide', () => {
  const root = new URL('../', import.meta.url);
  const games = [
    ['src/games/shanhai-shiyi/ShanhaiGame.tsx', 'rex-game:shanhai-shiyi:guide:v1'],
    ['src/games/jianzhi/JianzhiGame.tsx', 'rex-game:jianzhi:first-play-guide:v1'],
    ['src/games/chaoshan-yingge/YinggeGame.tsx', 'rex-game:yingge:first-play-guide:v1'],
    ['src/games/shantou-jiaobei/JiaobeiGame.tsx', 'rex-game:jiaobei:first-play-guide:v1'],
  ];

  for (const [path, storageKey] of games) {
    const source = readFileSync(new URL(path, root), 'utf8');
    assert.match(source, /<FirstPlayGuide/);
    assert.ok(source.includes(storageKey), `${path} should retain its own guide key`);
  }
});
