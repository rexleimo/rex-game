import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import { PASSPORT_CARDS } from '../src/core/passport/cards.ts';
import { SITE_NAV, TRUST_METRICS } from '../src/content/site.ts';
import { games } from '../src/core/gamesRegistry.ts';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

describe('passport page', () => {
  it('is reachable from the site navigation', () => {
    assert.ok(
      SITE_NAV.some((item) => item.href === '/passport/'),
      '护照没进主导航就等于不存在',
    );
  });

  it('is listed in the sitemap', () => {
    const sitemap = read('../app/sitemap.ts');
    assert.match(sitemap, /\/passport\//);
  });

  it('renders its card total from the registry rather than a hardcoded number', () => {
    const page = read('../app/passport/page.tsx');
    assert.match(page, /PASSPORT_CARDS\.length/, '卡数写死会随注册表增卡而失真');
  });

  it('states the local-only storage limit on the page itself', () => {
    const view = read('../src/components/passport/PassportView.tsx');
    assert.match(view, /不上传/);
    assert.match(view, /清空浏览器数据/);
  });
});

describe('homepage progress surfaces', () => {
  it('mounts the passport bar above the exhibit list', () => {
    const page = read('../app/page.tsx');
    const barAt = page.indexOf('<HomePassportBar />');
    const exhibitsAt = page.indexOf('id="exhibits"');
    assert.ok(barAt > -1, '首页没有护照条');
    assert.ok(barAt < exhibitsAt, '护照条应在展品列表之前');
  });

  it('shows a per-exhibit card count', () => {
    const section = read('../src/components/site/ExhibitSection.tsx');
    assert.match(section, /<ExhibitProgress game=\{game\.id\} \/>/);
  });

  it('gives every registered game a distinct accession number', () => {
    const section = read('../src/components/site/ExhibitSection.tsx');
    const numbers = [...section.matchAll(/no: '(No\.\d+)'/g)].map((m) => m[1]);
    assert.equal(new Set(numbers).size, numbers.length, '馆藏号重复');
    assert.equal(numbers.length, games.length, '有展品没有馆藏号，会回落到与他人相同的编号');
  });

  it('keeps the exhibit count claim in step with the registry', () => {
    const metric = TRUST_METRICS.find((m) => m.label === '可玩文化展品');
    assert.equal(metric?.value, String(games.length));
  });

  it('defers progress rendering until after hydration', () => {
    for (const path of [
      '../src/components/site/ExhibitProgress.tsx',
      '../src/components/site/HomePassportBar.tsx',
      '../src/components/passport/PassportView.tsx',
    ]) {
      // 静态导出的 HTML 里没有进度，首帧直接渲染会 hydration mismatch
      assert.match(read(path), /hydrated/, `${path} 未处理水合前状态`);
    }
  });
});

describe('share card extraction', () => {
  it('has jianzhi and passport share cards on one set of primitives', () => {
    const jianzhi = read('../src/games/jianzhi/theater/shareCard.ts');
    const passport = read('../src/core/share/passportCard.ts');
    for (const source of [jianzhi, passport]) {
      assert.match(source, /paintBackdrop/);
      assert.match(source, /paintWatermark/);
      assert.match(source, /createCardSurface/);
    }
  });

  it('no longer duplicates the backdrop gradient in the game', () => {
    const jianzhi = read('../src/games/jianzhi/theater/shareCard.ts');
    assert.doesNotMatch(jianzhi, /createRadialGradient/, '底色渐变应只存在于共享原语里');
  });

  it('keeps downloadBlob importable from its original path', () => {
    // 剪纸组件仍从 theater/shareCard 引入，抽层不应逼它改 import
    const jianzhi = read('../src/games/jianzhi/theater/shareCard.ts');
    assert.match(jianzhi, /export \{ downloadBlob \}/);
    const game = read('../src/games/jianzhi/JianzhiGame.tsx');
    assert.match(game, /from '\.\/theater\/shareCard'/);
  });

  it('watermarks every share card with the site origin', () => {
    const primitives = read('../src/core/share/cardCanvas.ts');
    assert.match(primitives, /game\.rexai\.top/);
  });

  it('only lists earned cards on the passport share image', () => {
    const passport = read('../src/core/share/passportCard.ts');
    assert.match(passport, /if \(section\.earnedCount === 0\) continue/);
    assert.match(passport, /filter\(\(c\) => c\.earned\)/);
  });
});

describe('passport analytics', () => {
  it('measures the passport share under its own game id, not a random exhibit', () => {
    const view = read('../src/components/passport/PassportView.tsx');
    assert.match(view, /trackShareClick\(\s*['"]passport['"]/);
    assert.match(view, /trackStepComplete\(\s*['"]passport['"]/);
    assert.doesNotMatch(
      view,
      /trackShareClick\(\s*['"]ershisi-jieqi['"]/,
      '护照事件挂在节气 id 上会污染展品漏斗',
    );
  });

  it('only reports passport-complete once per browser', () => {
    const view = read('../src/components/passport/PassportView.tsx');
    assert.match(view, /passport:complete-tracked/);
  });

  it('has a card registry large enough to be worth collecting', () => {
    assert.ok(PASSPORT_CARDS.length >= 20, `只有 ${PASSPORT_CARDS.length} 张卡，撑不起收集动机`);
  });
});
