import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import { readAnalyticsConfig } from '../src/core/analytics/config.ts';
import { __queueSize, __resetAnalyticsQueue, track } from '../src/core/analytics/track.ts';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

const GAME_ROOTS: Array<[string, string]> = [
  ['../src/games/shantou-jiaobei/JiaobeiGame.tsx', 'shantou-jiaobei'],
  ['../src/games/chaoshan-yingge/YinggeGame.tsx', 'chaoshan-yingge'],
  ['../src/games/jianzhi/JianzhiGame.tsx', 'jianzhi'],
  ['../src/games/shanhai-shiyi/ShanhaiGame.tsx', 'shanhai-shiyi'],
  ['../src/games/ershisi-jieqi/JieqiGame.tsx', 'ershisi-jieqi'],
];

describe('analytics config', () => {
  it('degrades to a no-op when the provider env is unset', () => {
    const config = readAnalyticsConfig();
    assert.equal(config.provider, 'none');
    assert.equal(config.src, '');
    assert.equal(config.siteId, '');
  });

  it('never injects a half-configured provider', () => {
    const source = read('../src/core/analytics/config.ts');
    // 没有 siteId 就没有收数据的去处，必须整体退回 none
    assert.match(source, /!siteId/);
    // umami / plausible 还额外需要脚本地址，缺了同样退回
    assert.match(source, /if \(!src\) return \{ provider: 'none'/);
  });

  it('derives the GA4 script URL from the measurement id', () => {
    const source = read('../src/core/analytics/config.ts');
    assert.match(source, /googletagmanager\.com\/gtag\/js\?id=/);
  });
});

describe('analytics dispatcher', () => {
  it('drops events on the floor instead of throwing when there is no window', () => {
    __resetAnalyticsQueue();
    assert.doesNotThrow(() => track('game_open', { game: 'jianzhi' }));
    assert.equal(__queueSize(), 0, 'SSR 期间不应入队');
  });

  it('caps the pending queue so a blocked script cannot leak memory', () => {
    const source = read('../src/core/analytics/track.ts');
    assert.match(source, /MAX_QUEUE = \d+/);
    assert.match(source, /queue\.length < MAX_QUEUE/);
  });

  it('honours Do Not Track and Global Privacy Control', () => {
    const source = read('../src/core/analytics/track.ts');
    assert.match(source, /doNotTrack/);
    assert.match(source, /globalPrivacyControl/);
  });
});

describe('event coverage', () => {
  it('every game root reports its own game_open', () => {
    for (const [path, id] of GAME_ROOTS) {
      const source = read(path);
      assert.match(source, /useGameOpen\(/, `${id} 缺少曝光埋点`);
      assert.match(source, new RegExp(`useGameOpen\\('${id}'\\)`), `${id} 上报了错误的 game id`);
    }
  });

  it('every game reports a start and a finish so the funnel has both ends', () => {
    for (const [path, id] of GAME_ROOTS) {
      const source = read(path);
      assert.match(source, /trackGameStart\(/, `${id} 缺少 game_start`);
      assert.match(source, /trackGameFinish\(/, `${id} 缺少 game_finish`);
    }
  });

  it('culture links funnel through the tracked component instead of raw next/link', () => {
    for (const path of [
      '../app/games/shantou-jiaobei/page.tsx',
      '../app/games/chaoshan-yingge/page.tsx',
      '../app/games/jianzhi/page.tsx',
      '../app/games/ershisi-jieqi/page.tsx',
    ]) {
      const source = read(path);
      assert.doesNotMatch(
        source,
        /<Link href="\/culture\//,
        `${path} 仍有未埋点的文化页链接，转化率会算漏`,
      );
      assert.match(source, /<CultureLink/, `${path} 缺少 culture_click 埋点`);
    }
  });

  it('the share card export is measured — it is the only organic growth lever', () => {
    const source = read('../src/games/jianzhi/JianzhiGame.tsx');
    assert.match(source, /trackShareClick\('jianzhi', 'gallery'\)/);
  });
});

describe('analytics script injection', () => {
  it('is mounted once, site-wide, from the root layout', () => {
    const layout = read('../app/layout.tsx');
    assert.match(layout, /<AnalyticsScript \/>/);
  });

  it('loads after interaction so it cannot block first paint', () => {
    const source = read('../src/core/analytics/AnalyticsScript.tsx');
    assert.match(source, /strategy="afterInteractive"/);
    assert.match(source, /onLoad=\{flushAnalyticsQueue\}/);
    assert.doesNotMatch(source, /strategy="beforeInteractive"/);
  });

  it('bootstraps GA4 dataLayer before the loader can fire onLoad', () => {
    const source = read('../src/core/analytics/AnalyticsScript.tsx');
    const bootstrapAt = source.indexOf('ga4-bootstrap');
    const loaderAt = source.indexOf('ga4-loader');
    assert.ok(bootstrapAt > -1 && loaderAt > -1, 'GA4 需要引导脚本与加载器两段');
    assert.ok(bootstrapAt < loaderAt, '引导必须排在加载器之前，否则 window.gtag 还不存在');
  });

  it('routes GA4 events through gtag', () => {
    const source = read('../src/core/analytics/track.ts');
    assert.match(source, /gtag\('event', name, props\)/);
  });
});
