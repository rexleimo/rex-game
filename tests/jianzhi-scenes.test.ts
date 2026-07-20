import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';

test('every act scene image exists on disk when configured', async () => {
  const { ACTS } = await import('../src/games/jianzhi/content/acts.ts');
  for (const act of ACTS) {
    assert.ok(act.scene.image, `${act.id} scene.image not configured`);
    const p = new URL(`../public${act.scene.image}`, import.meta.url);
    assert.ok(existsSync(p), `${act.scene.image} missing`);
  }
});
