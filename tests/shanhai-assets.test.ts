import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import {
  fallbackKey,
  OVERRIDE_BASE,
  PIXEL_BASE,
} from '../src/games/shanhai-wenshou/action/assets.ts';

/** 每次用独立 query 串导入，绕开模块内 cached，保证用例隔离。 */
async function resolveWith(manifest: unknown, opts?: { ok?: boolean; tag?: string }): Promise<string> {
  const { ok = true, tag = Math.random().toString(36).slice(2) } = opts ?? {};
  (globalThis as Record<string, unknown>).fetch = async () => ({
    ok,
    json: async () => manifest,
  });
  try {
    const mod = await import(`../src/games/shanhai-wenshou/action/assets.ts?tag=${tag}`);
    return (await mod.resolveAssetBase()) as string;
  } finally {
    delete (globalThis as Record<string, unknown>).fetch;
  }
}

describe('wenshou asset base resolution', () => {
  it('ignores the disabled example manifest (默认走自产像素)', async () => {
    const base = await resolveWith(
      {
        disabled: true,
        pack: 'example-kenney-pixel-platformer',
        license: 'CC0-1.0',
        source: 'https://kenney.nl/assets/pixel-platformer',
        files: ['pl.png', 'beasts.png'],
      },
      { tag: 'disabled' },
    );
    assert.equal(base, PIXEL_BASE);
  });

  it('switches to override only for enabled CC0/CC-BY manifests', async () => {
    const base = await resolveWith(
      {
        pack: 'kenney-pixel-platformer',
        license: 'CC0-1.0',
        source: 'https://kenney.nl/assets/pixel-platformer',
        files: ['pl.png'],
      },
      { tag: 'enabled' },
    );
    assert.equal(base, OVERRIDE_BASE);
  });

  it('falls back to pixel on empty files, bad license, or fetch failure', async () => {
    assert.equal(
      await resolveWith({ pack: 'x', license: 'CC0-1.0', files: [] }, { tag: 'empty' }),
      PIXEL_BASE,
    );
    assert.equal(
      await resolveWith({ pack: 'x', license: 'CC-NC-ND', files: ['pl.png'] }, { tag: 'license' }),
      PIXEL_BASE,
    );
    assert.equal(await resolveWith(null, { ok: false, tag: 'http' }), PIXEL_BASE);
  });

  it('fallbackKey picks primary only when it exists', () => {
    assert.equal(fallbackKey(true, 'a', 'b'), 'a');
    assert.equal(fallbackKey(false, 'a', 'b'), 'b');
  });

  it('shipped override manifest is enabled, CC0, and complete on disk', () => {
    const dir = join(import.meta.dirname, '..', 'public', 'assets', 'shanhai-wenshou', 'override');
    const manifest = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8')) as {
      disabled?: boolean;
      license: string;
      files: string[];
    };
    assert.equal(manifest.disabled, undefined, '覆盖包应已启用（无 disabled）');
    assert.match(manifest.license, /CC0/i);
    assert.equal(manifest.files.length, 68, 'pl+beasts+10山×6+6道具=68');
    const missing = manifest.files.filter((f) => !existsSync(join(dir, f)));
    assert.deepEqual(missing, [], `override 缺文件: ${missing.join(', ')}`);
  });
});
