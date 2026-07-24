import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('shanhai game is registered', () => {
  const src = readFileSync(new URL('src/core/gamesRegistry.ts', root), 'utf8');
  assert.match(src, /shanhai-shiyi/);
  assert.match(src, /山海拾遗/);
});

test('shanhai page exists and marks free cultural app', () => {
  const src = readFileSync(new URL('app/games/shanhai-shiyi/page.tsx', root), 'utf8');
  assert.match(src, /isAccessibleForFree:\s*true/);
  assert.match(src, /ShanhaiGame/);
  assert.match(src, /无登录/);
});

test('shanhai main shell uses local progress key', () => {
  const src = readFileSync(new URL('src/games/shanhai-shiyi/core/progress.ts', root), 'utf8');
  assert.match(src, /rex-game:shanhai-shiyi:progress:v1/);
});

test('zhongyuan has three exhibit routes and six learn points', () => {
  const src = readFileSync(new URL('src/games/shanhai-shiyi/content/region.ts', root), 'utf8');
  assert.match(src, /EXHIBIT_ROUTES/);
  assert.match(src, /route-liqi/);
  assert.match(src, /route-wenyang/);
  assert.match(src, /route-mingwen/);
  assert.match(src, /R01-L04/);
  assert.match(src, /R01-L05/);
});

test('regions registry includes xianshan and haisi', () => {
  const src = readFileSync(new URL('src/games/shanhai-shiyi/content/regions.ts', root), 'utf8');
  assert.match(src, /R05/);
  assert.match(src, /塞北/);
  assert.match(src, /R06/);
  assert.match(src, /仙山/);
  assert.match(src, /R07/);
  assert.match(src, /岁时/);
  assert.match(src, /R08/);
  assert.match(src, /海丝/);
  assert.match(src, /r06-shan/);
  assert.match(src, /r08-chuan/);
});

test('festival topics are defined', () => {
  const src = readFileSync(new URL('src/games/shanhai-shiyi/content/festivals.ts', root), 'utf8');
  assert.match(src, /FESTIVAL_TOPICS/);
  assert.match(src, /spring/);
  assert.match(src, /duanwu/);
  assert.match(src, /midautumn/);
  assert.match(src, /suggestFestivalIds/);
});

test('artifact art map points at webp files on disk', () => {
  const artSrc = readFileSync(new URL('src/games/shanhai-shiyi/content/artifactArt.ts', root), 'utf8');
  assert.match(artSrc, /\.webp'/);
  assert.doesNotMatch(artSrc, /artifacts\/A-R[^\s']+\.png/);
  const ids = [...artSrc.matchAll(/'(A-R[^']+)':\s*'(\/assets\/shanhai\/artifacts\/[^']+\.webp)'/g)];
  assert.ok(ids.length >= 160, `expected full atlas ≥160 mapped arts, got ${ids.length}`);
  for (const [, , path] of ids) {
    const disk = new URL(`public${path}`, root);
    assert.ok(existsSync(disk), `missing asset public${path}`);
  }
});
