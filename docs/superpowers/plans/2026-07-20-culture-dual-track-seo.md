# 文化页明暗双轨 + SEO/GEO 内容矩阵 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 文化页切换明暗双轨(topic)+ 独立展厅(hub),内容矩阵扩到 ~20 页,落地 llms.txt 与每页 OG 卡。

**Architecture:** `CultureDocument` 按 `page.kind` 分流:topic → 暗场 CultureHero + QuickAnswerBar + 宣纸阅读面(复用 museum.css 的 `.culture-doc` 全局排版)+ CultureCtaBanner;hub → CultureHubGallery(展厅头 + 专题卡 grid)。OG 走「参数化 SVG 模板 → sharp 批量渲」;内容为 registry 纯数据,contract test 卡字数/FAQ/来源阈值。

**Tech Stack:** Next.js 15 静态导出 + React 19 + 原生 CSS;node:test 契约测试;sharp(OG 批量)。

**Spec:** `docs/superpowers/specs/2026-07-20-culture-dual-track-seo-design.md`

## Global Constraints

- 静态导出 + GitHub Pages(push main 触发 Action 部署);不引入服务端能力。
- `CulturePage` registry 数据驱动模式不变;`generateStaticParams`、`buildCulturePageGraph` 不动。
- 内容写作遵守站点三分表述:常见说法 / 地区差异 / 游戏设计,不编「标准答案」;quickAnswer 合计 ≤80 字。
- 测试:`pnpm test`;构建验收用隔离 worktree(dev 常占 3030,禁直接 `pnpm build`)。
- 老文件全角标点(,?:——)多,Edit 失配就用 python ASCII 锚点替换。
- 提交风格:Conventional Commits。

---

### Task 1: 文化页模板改造(双轨 + hub 展厅 + 换壳)

**Files:**
- Modify: `src/content/culture/types.ts:27-47`(增 3 个可选字段)
- Create: `src/components/site/CultureHero.tsx`
- Create: `src/components/site/QuickAnswerBar.tsx`
- Create: `src/components/site/CultureCtaBanner.tsx`
- Create: `src/components/site/CultureHubGallery.tsx`
- Modify: `src/components/site/CultureDocument.tsx`(整文件重写)
- Modify: `app/culture/page.tsx`(换 gallery 壳)
- Modify: `src/styles/gallery.css`(追加文化页段)
- Test: `tests/culture-template.test.ts`

**Interfaces:**
- Consumes: `GalleryHeader/GalleryFooter`(Spec 1);`Breadcrumb({ items: {name,path}[] })`、`CultureTermGrid`、`FaqList`、`SourceList`(既有,不动);`cultureBreadcrumbItems(page)`、`buildCulturePageGraph(page)`(`@/core/seo/jsonld`);`listCulturePages()`(registry)。
- Produces: `CultureHero({ page, crumbs })`、`QuickAnswerBar({ sentences })`、`CultureCtaBanner({ page })`、`CultureHubGallery({ page, crumbs })`;types 增 `readingMinutes?: number`、`symbol?: 'jiaobei'|'yingge'|'jianzhi'`、`ogImage?: string`;class `.chero`/`.cqa`/`.culture-paper`/`.ccta`/`.chub*`。

- [ ] **Step 1: 写失败测试**

```ts
// tests/culture-template.test.ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('CultureDocument splits hub/topic and uses gallery shell', () => {
  const src = readFileSync(new URL('src/components/site/CultureDocument.tsx', root), 'utf8');
  assert.match(src, /theme-gallery/);
  assert.match(src, /GalleryHeader/);
  assert.match(src, /GalleryFooter/);
  assert.match(src, /CultureHubGallery/);
  assert.match(src, /CultureHero/);
  assert.match(src, /QuickAnswerBar/);
  assert.match(src, /culture-paper/);
  assert.match(src, /CultureCtaBanner/);
  assert.doesNotMatch(src, /theme-museum/);
  assert.doesNotMatch(src, /SiteHeader/);
});

test('culture types carry presentation fields', () => {
  const src = readFileSync(new URL('src/content/culture/types.ts', root), 'utf8');
  assert.match(src, /readingMinutes\?: number/);
  assert.match(src, /symbol\?: CultureHubId/);
  assert.match(src, /ogImage\?: string/);
});

test('culture index page uses gallery shell', () => {
  const src = readFileSync(new URL('app/culture/page.tsx', root), 'utf8');
  assert.match(src, /theme-gallery/);
  assert.match(src, /GalleryHeader/);
  assert.doesNotMatch(src, /theme-museum/);
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm test`
Expected: FAIL — `theme-gallery` 断言不过

- [ ] **Step 3: types.ts 增字段**

`src/content/culture/types.ts` 的 `CulturePage` 接口,在 `howToSteps?` 行之后追加:

```ts
  /** 阅读时长(分钟),展厅头元信息行展示 */
  readingMinutes?: number;
  /** 主题符号,用于展厅头装置与 OG 卡;hub 页必填 */
  symbol?: CultureHubId;
  /** 页面级 OG 卡路径(pnpm og:culture 生成),缺省回落首页 OG */
  ogImage?: string;
```

- [ ] **Step 4: 创建 CultureHero.tsx**

```tsx
import { Breadcrumb } from './Breadcrumb';
import type { CulturePage } from '@/content/culture/types';

const SYMBOL_LABEL = { jiaobei: '筊杯金月', yingge: '英歌双槌', jianzhi: '剪纸红菱' } as const;

function HeroSymbol({ symbol }: { symbol?: CulturePage['symbol'] }) {
  if (symbol === 'yingge') {
    return (
      <svg viewBox="0 0 80 56" role="img" aria-label={SYMBOL_LABEL.yingge}>
        <rect x="8" y="4" width="7" height="46" rx="3.5" fill="#E8CF9A" transform="rotate(18 11 27)" />
        <rect x="65" y="4" width="7" height="46" rx="3.5" fill="#E8CF9A" transform="rotate(-18 68 27)" />
        <circle cx="40" cy="34" r="16" fill="none" stroke="#C82E21" strokeWidth="4" />
        <circle cx="40" cy="34" r="5" fill="#C9A24B" />
      </svg>
    );
  }
  if (symbol === 'jianzhi') {
    return (
      <svg viewBox="0 0 64 64" role="img" aria-label={SYMBOL_LABEL.jianzhi}>
        <polygon points="32,2 62,32 32,62 2,32" fill="#C82E21" />
        <polygon points="32,14 50,32 32,50 14,32" fill="#0A0705" />
        <polygon points="32,22 42,32 32,42 22,32" fill="#D23627" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 70 46" role="img" aria-label={SYMBOL_LABEL.jiaobei}>
      <path d="M14 4 a26 26 0 0 0 0 38 a20 20 0 0 1 0 -38z" fill="#C9A24B" />
      <path d="M56 4 a26 26 0 0 1 0 38 a20 20 0 0 0 0 -38z" fill="#C9A24B" opacity="0.85" />
    </svg>
  );
}

export function CultureHero({
  page,
  crumbs,
}: {
  page: CulturePage;
  crumbs: { name: string; path: string }[];
}) {
  return (
    <header className="chero">
      <div className="g-container chero__inner">
        <div className="chero__crumb">
          <Breadcrumb items={crumbs} />
        </div>
        <h1 className="g-display chero__title">{page.h1}</h1>
        <p className="chero__meta">
          {page.readingMinutes ? `阅读 ${page.readingMinutes} 分钟 · ` : ''}
          {page.dateModified} 修订 · 常见说法整理
        </p>
        <div className="chero__symbol" aria-hidden="true">
          <HeroSymbol symbol={page.symbol} />
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 5: 创建 QuickAnswerBar.tsx**

```tsx
export function QuickAnswerBar({ sentences }: { sentences: string[] }) {
  return (
    <div className="cqa">
      <div className="g-container cqa__inner">
        <span className="cqa__label">快速回答</span>
        <p className="cqa__text">{sentences.join('')}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: 创建 CultureCtaBanner.tsx**

```tsx
import Link from 'next/link';
import type { CulturePage } from '@/content/culture/types';

const CTA_VERB: Record<string, string> = {
  jiaobei: '读完,不如亲手掷一次',
  yingge: '读完,不如亲自上阵打一局',
  jianzhi: '读完,不如动手剪一张',
};

export function CultureCtaBanner({ page }: { page: CulturePage }) {
  return (
    <div className="ccta">
      <div className="g-container ccta__inner">
        <p className="ccta__text">{CTA_VERB[page.hub] ?? '读完,不如亲手试一次'}</p>
        <Link className="ccta__btn" href={page.gameHref}>
          现在体验:{page.gameName} →
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: 创建 CultureHubGallery.tsx**

```tsx
import Link from 'next/link';
import type { CulturePage } from '@/content/culture/types';
import { listCulturePages } from '@/content/culture/registry';
import { Breadcrumb } from './Breadcrumb';
import { CultureCtaBanner } from './CultureCtaBanner';
import { CultureHero } from './CultureHero';
import { QuickAnswerBar } from './QuickAnswerBar';

export function CultureHubGallery({
  page,
  crumbs,
}: {
  page: CulturePage;
  crumbs: { name: string; path: string }[];
}) {
  const topics = listCulturePages().filter((p) => p.kind === 'topic' && p.hub === page.hub);

  return (
    <>
      <CultureHero page={page} crumbs={crumbs} />
      <QuickAnswerBar sentences={page.quickAnswer} />
      <div className="culture-paper">
        <div className="culture-doc culture-paper__inner">
          {page.sections.map((section) => (
            <section key={section.id} id={section.id}>
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
      </div>
      <section className="g-section g-container" aria-labelledby="hub-topics">
        <div className="gsh">
          <span className="gsh__index">专题</span>
          <h2 className="gsh__title" id="hub-topics">
            继续读
          </h2>
          <span className="gsh__note">{topics.length} 篇专题</span>
        </div>
        <div className="chub__grid">
          {topics.map((topic) => (
            <Link className="chub__card" key={topic.path} href={topic.path}>
              <span className="chub__card-title">{topic.h1}</span>
              <span className="chub__card-teaser">{topic.quickAnswer.join('').slice(0, 48)}……</span>
              <span className="chub__card-meta">
                {topic.readingMinutes ? `阅读 ${topic.readingMinutes} 分钟` : '专题导读'} →
              </span>
            </Link>
          ))}
        </div>
      </section>
      <CultureCtaBanner page={page} />
    </>
  );
}
```

- [ ] **Step 8: 整文件重写 CultureDocument.tsx**

```tsx
import Link from 'next/link';
import type { CulturePage } from '@/content/culture/types';
import { getCulturePageByPath } from '@/content/culture/registry';
import { SITE_DISCLAIMER } from '@/content/site';
import { buildCulturePageGraph, cultureBreadcrumbItems } from '@/core/seo/jsonld';
import { CultureCtaBanner } from './CultureCtaBanner';
import { CultureHero } from './CultureHero';
import { CultureHubGallery } from './CultureHubGallery';
import { CultureTermGrid } from './CultureTermGrid';
import { FaqList } from './FaqList';
import { GalleryFooter } from './GalleryFooter';
import { GalleryHeader } from './GalleryHeader';
import { JsonLd } from './JsonLd';
import { QuickAnswerBar } from './QuickAnswerBar';
import { SourceList } from './SourceList';

function labelForPath(path: string): string {
  const page = getCulturePageByPath(path);
  if (page) return page.h1;
  if (path.startsWith('/games/')) return '进入对应游戏';
  if (path === '/about/') return '关于本站';
  if (path === '/culture/') return '文化馆索引';
  return path;
}

export function CultureDocument({ page }: { page: CulturePage }) {
  const crumbs = cultureBreadcrumbItems(page);

  return (
    <div className="theme-gallery">
      <JsonLd data={buildCulturePageGraph(page)} />
      <GalleryHeader ctaHref={page.gameHref} ctaLabel="开始游玩" />
      <main>
        {page.kind === 'hub' ? (
          <CultureHubGallery page={page} crumbs={crumbs} />
        ) : (
          <>
            <CultureHero page={page} crumbs={crumbs} />
            <QuickAnswerBar sentences={page.quickAnswer} />
            <div className="culture-paper">
              <div className="culture-doc culture-paper__inner">
                {page.sections.map((section) => (
                  <section key={section.id} id={section.id}>
                    <h2>{section.title}</h2>
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                    ))}
                  </section>
                ))}
                {page.terms?.length ? (
                  <section aria-labelledby="terms-heading">
                    <h2 id="terms-heading">关键术语</h2>
                    <CultureTermGrid terms={page.terms} />
                  </section>
                ) : null}
                <FaqList items={page.faq} />
                <SourceList sources={page.sources} />
                {page.relatedPaths.length ? (
                  <nav className="culture-doc__related" aria-label="相关阅读">
                    <h2>相关阅读</h2>
                    <ul>
                      {page.relatedPaths.map((path) => (
                        <li key={path}>
                          <Link href={path}>{labelForPath(path)}</Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                ) : null}
                <p className="culture-doc__disclaimer">{SITE_DISCLAIMER}</p>
              </div>
            </div>
            <CultureCtaBanner page={page} />
          </>
        )}
      </main>
      <GalleryFooter />
    </div>
  );
}
```

(旧 `SiteHeader/SiteFooter/PlayCta/QuickAnswer/Breadcrumb` 不再被本文引用;QuickAnswer 组件本体由索引页等继续使用,暂留;T5 统一清理。)

- [ ] **Step 9: app/culture/page.tsx 换壳**

- `SiteFooter`/`SiteHeader` import → `GalleryFooter`/`GalleryHeader`
- 第 41 行 `<div className="theme-museum site-root">` → `<div className="theme-gallery">`
- 第 45 行 `<p className="site-hero__kicker">文化馆</p>` → `<p className="g-label">文化馆</p>`
- 内联 h1 style 的 `var(--font-display)` → `var(--g-font-display)`,两个 h2 内联 style 同样替换(共 3 处 `var(--font-display)`)
- 两个 `<div className="culture-index__list">` 与卡片 class 改为 gallery 版:

```tsx
        <div className="gateway">
          {hubs.map((hub) => (
            <Link className="gateway__card" key={hub.path} href={hub.path}>
              <span className="gateway__q">{hub.h1}</span>
              <span className="gateway__teaser">{hub.description}</span>
              <span className="gateway__count">进入主题 →</span>
            </Link>
          ))}
        </div>
```

专题阅读区同样结构(topics.map,`gateway__count` 为 `专题导读 →`)。
- `SiteFooter` → `GalleryFooter`;`SiteHeader` → `GalleryHeader`

- [ ] **Step 10: gallery.css 追加文化页段**

```css
/* —— 文化页:展厅头 —— */
.chero {
  position: relative;
  padding: 4.5rem 0 3rem;
  background: radial-gradient(100% 120% at 78% 0%, rgba(200, 46, 33, 0.22) 0%, transparent 55%);
  overflow: hidden;
}
.chero__inner {
  position: relative;
}
.chero__crumb {
  margin-bottom: 1.6rem;
  font-size: 12px;
  letter-spacing: 0.12em;
  color: var(--g-gold);
}
.chero__crumb a {
  color: rgba(201, 162, 75, 0.85);
}
.chero__crumb a:hover {
  color: var(--g-gold-hi);
}
.chero__crumb ol {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.chero__crumb li {
  display: inline;
}
.chero__title {
  max-width: 20em;
  font-size: clamp(2rem, 5.5vw, 3.4rem);
  letter-spacing: 0.04em;
}
.chero__title em {
  font-style: normal;
  color: var(--g-cinnabar-hi);
}
.chero__meta {
  margin: 1rem 0 0;
  font-size: 12px;
  letter-spacing: 0.12em;
  color: var(--g-text-dim);
}
.chero__symbol {
  position: absolute;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  width: clamp(72px, 10vw, 120px);
  opacity: 0.95;
  filter: drop-shadow(0 24px 40px rgba(0, 0, 0, 0.5));
}
.chero__symbol svg {
  display: block;
  width: 100%;
  height: auto;
}
@media (max-width: 760px) {
  .chero__symbol {
    opacity: 0.3;
    right: 0;
  }
}

/* —— 文化页:快速回答条 —— */
.cqa {
  border-block: 1px solid rgba(201, 162, 75, 0.25);
  background: var(--g-lacquer);
}
.cqa__inner {
  display: flex;
  gap: 1.2rem;
  align-items: baseline;
  padding-block: 1.1rem;
}
.cqa__label {
  flex: none;
  border: 1px solid rgba(201, 162, 75, 0.4);
  border-radius: 2px;
  padding: 3px 9px;
  font-size: 11px;
  letter-spacing: 0.3em;
  color: var(--g-gold);
}
.cqa__text {
  margin: 0;
  font-size: 15px;
  line-height: 1.85;
  color: rgba(232, 220, 196, 0.88);
}
@media (max-width: 760px) {
  .cqa__inner {
    flex-direction: column;
    gap: 0.6rem;
  }
}

/* —— 文化页:宣纸阅读面(复用 museum.css 的 .culture-doc 全局排版) —— */
.culture-paper {
  background: #f7f1e6;
  color: #1a120b;
  padding: 3.5rem 0 4.5rem;
}
.culture-paper__inner {
  width: min(46rem, 92vw);
  margin-inline: auto;
}
.culture-paper a {
  color: #a6332b;
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* —— 文化页:CTA 横幅 —— */
.ccta {
  background: linear-gradient(120deg, var(--g-cinnabar-deep), var(--g-cinnabar));
}
.ccta__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding-block: 2.2rem;
}
.ccta__text {
  margin: 0;
  font-family: var(--g-font-display);
  font-size: clamp(1.1rem, 2.5vw, 1.5rem);
  letter-spacing: 0.1em;
  color: var(--g-paper);
}
.ccta__btn {
  flex: none;
  background: var(--g-paper);
  color: var(--g-cinnabar-deep);
  border-radius: 2px;
  padding: 0.8rem 1.8rem;
  font-size: 13px;
  letter-spacing: 0.18em;
  font-weight: 500;
  transition: transform var(--g-dur-micro) var(--g-ease);
}
.ccta__btn:hover {
  transform: translateY(-2px);
}
@media (max-width: 760px) {
  .ccta__inner {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* —— hub 展厅:专题卡 —— */
.chub__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.2rem;
}
.chub__card {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  padding: 1.4rem 1.3rem;
  background: var(--g-float);
  border: 1px solid rgba(201, 162, 75, 0.18);
  border-radius: 6px;
  transition:
    transform var(--g-dur-micro) var(--g-ease),
    border-color var(--g-dur-micro) var(--g-ease);
}
.chub__card:hover {
  transform: translateY(-4px);
  border-color: rgba(201, 162, 75, 0.45);
}
.chub__card-title {
  font-family: var(--g-font-display);
  font-size: 17px;
  color: var(--g-text-hi);
}
.chub__card-teaser {
  flex: 1;
  font-size: 12.5px;
  line-height: 1.8;
  color: var(--g-text);
}
.chub__card-meta {
  font-size: 11px;
  letter-spacing: 0.15em;
  color: var(--g-gold);
}
```

- [ ] **Step 11: 跑测试确认通过**

Run: `pnpm test`
Expected: PASS(注意旧 `site-components-contract.test.ts` 第一条断言 CultureDocument 含 `QuickAnswer/PlayCta` —— 新版改用 `QuickAnswerBar`、不再用 PlayCta,需同步把该测试里的 `PlayCta` 断言改为 `CultureCtaBanner`,`QuickAnswer` 断言改为 `QuickAnswerBar`)

- [ ] **Step 12: Commit**

```bash
git add src/content/culture/types.ts src/components/site/CultureHero.tsx src/components/site/QuickAnswerBar.tsx src/components/site/CultureCtaBanner.tsx src/components/site/CultureHubGallery.tsx src/components/site/CultureDocument.tsx app/culture/page.tsx src/styles/gallery.css tests/culture-template.test.ts tests/site-components-contract.test.ts
git commit -m "feat(culture): 文化页明暗双轨模板与 hub 独立展厅"
```

---

### Task 2: OG 模板参数化 + 每文化页 OG 卡

**Files:**
- Modify: `scripts/generate-og.mjs`(抽公共 SVG 模板)
- Create: `scripts/generate-culture-og.mjs`
- Modify: `app/culture/[hub]/page.tsx:22-30`(og images)
- Modify: `app/culture/[hub]/[topic]/page.tsx:21-31`(og images)
- Modify: `package.json`(加 `og:culture`)
- Create: `public/assets/og/culture-*.png`(产物)
- Test: `tests/culture-og.test.ts`

**Interfaces:**
- Consumes: `listCulturePages()`;`page.ogImage` 字段(T1)。
- Produces: `pnpm og:culture`;每页 `ogImage` 命名约定 `culture-<hub>.png`(hub)/ `culture-<hub>-<slug>.png`(topic)。

- [ ] **Step 1: 写失败测试**

```ts
// tests/culture-og.test.ts
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('culture pages reference per-page ogImage with home fallback', () => {
  for (const file of ['app/culture/[hub]/page.tsx', 'app/culture/[hub]/[topic]/page.tsx']) {
    const src = readFileSync(new URL(file, root), 'utf8');
    assert.match(src, /ogImage/, `${file} should consume page.ogImage`);
    assert.match(src, /og-home\.png/, `${file} should fallback to home og`);
  }
});

test('every culture page has a generated OG card on disk', async () => {
  const { listCulturePages } = await import('../src/content/culture/registry.ts');
  for (const page of listCulturePages()) {
    const name = page.kind === 'hub' ? `culture-${page.hub}` : `culture-${page.hub}-${page.slug}`;
    const p = new URL(`public/assets/og/${name}.png`, root);
    assert.ok(existsSync(p), `${name}.png missing — run: pnpm og:culture`);
  }
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm test`
Expected: FAIL — `ogImage` 断言不过 + 卡片缺失

- [ ] **Step 3: generate-og.mjs 抽出模板函数**

文件顶部加导出函数(保留原首页卡逻辑,首页卡改调同一函数):

```js
// 参数化 OG 模板:标题/副题/symbol(jiaobei|yingge|jianzhi|home)/输出路径
export function buildOgSvg({ title, subtitle, symbol = 'home' }) {
  const symbols = {
    home: `<g transform="translate(860,150)"><polygon points="120,0 240,120 120,240 0,120" fill="#C82E21"/><polygon points="120,48 192,120 120,192 48,120" fill="#0A0705"/><polygon points="120,82 158,120 120,158 82,120" fill="#D23627"/></g><path d="M884 486 a42 42 0 0 0 0 72 a32 32 0 0 1 0 -72z" fill="#C9A24B"/><path d="M952 486 a42 42 0 0 1 0 72 a32 32 0 0 0 0 -72z" fill="#C9A24B" opacity="0.85"/>`,
    jiaobei: `<path d="M900 220 a90 90 0 0 0 0 150 a68 68 0 0 1 0 -150z" fill="#C9A24B"/><path d="M1030 220 a90 90 0 0 1 0 150 a68 68 0 0 0 0 -150z" fill="#C9A24B" opacity="0.85"/>`,
    yingge: `<g transform="translate(880,150)"><rect x="30" y="0" width="16" height="200" rx="8" fill="#E8CF9A" transform="rotate(18 38 100)"/><rect x="170" y="0" width="16" height="200" rx="8" fill="#E8CF9A" transform="rotate(-18 178 100)"/><circle cx="120" cy="150" r="66" fill="none" stroke="#C82E21" stroke-width="14"/><circle cx="120" cy="150" r="20" fill="#C9A24B"/></g>`,
    jianzhi: `<g transform="translate(860,150)"><polygon points="120,0 240,120 120,240 0,120" fill="#C82E21"/><polygon points="120,48 192,120 120,192 48,120" fill="#0A0705"/><polygon points="120,82 158,120 120,158 82,120" fill="#D23627"/></g>`,
  };
  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="72%" cy="16%" r="85%">
      <stop offset="0%" stop-color="#C82E21" stop-opacity="0.38"/>
      <stop offset="55%" stop-color="#C82E21" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#0A0705"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <text x="80" y="150" font-family="serif" font-size="26" letter-spacing="10" fill="#C9A24B">rex-game · 可玩的民俗文化馆</text>
  <text x="80" y="330" font-family="serif" font-weight="700" font-size="76" fill="#F5EDE0">${title}</text>
  <text x="80" y="420" font-family="sans-serif" font-size="28" fill="#E8DCC4" opacity="0.72">${subtitle}</text>
  ${symbols[symbol] ?? symbols.home}
  <text x="80" y="586" font-family="sans-serif" font-size="22" letter-spacing="6" fill="#C9A24B">REX-GAME · game.rexai.top</text>
</svg>`;
}
```

注意:标题含 XML 特殊字符时转义(`&` `<` `>`)。在 `buildOgSvg` 内第一行加:

```js
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  title = esc(title);
  subtitle = esc(subtitle);
```

- [ ] **Step 4: 创建 generate-culture-og.mjs**

```js
// 每文化页 OG 卡:遍历 registry,按命名约定渲到 public/assets/og/
// 命名:hub → culture-<hub>.png;topic → culture-<hub>-<slug>.png
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';
import { listCulturePages } from '../src/content/culture/registry.ts';
import { buildOgSvg } from './generate-og.mjs';

await mkdir('public/assets/og', { recursive: true });

for (const page of listCulturePages()) {
  const name = page.kind === 'hub' ? `culture-${page.hub}` : `culture-${page.hub}-${page.slug}`;
  const svg = buildOgSvg({
    title: page.h1.replace(/[?？]$/, ''),
    subtitle: page.description.slice(0, 40),
    symbol: page.symbol ?? page.hub,
  });
  await sharp(Buffer.from(svg)).png().toFile(`public/assets/og/${name}.png`);
  console.log(`${name}.png`);
}
console.log('culture OG cards done');
```

(注册表是 .ts,node --experimental-strip-types 可直接 import;package.json 脚本:`"og:culture": "node --experimental-strip-types scripts/generate-culture-og.mjs"`。generate-og.mjs 顶部需防直接执行时重复渲首页卡:把首页卡渲染包进 `if (process.argv[1] && process.argv[1].endsWith('generate-og.mjs')) { ... }`。)

- [ ] **Step 5: 两个 page.tsx 注入 ogImage**

两个 culture page.tsx 的 `openGraph` 块各加 `images`:

```ts
    openGraph: {
      title: page.title,
      description: page.description,
      url: `${SITE_ORIGIN}${page.path}`,
      images: [{ url: page.ogImage ?? '/assets/og-home.png', width: 1200, height: 630, alt: page.title }],
    },
```

同时在 T3/T4 的内容任务里,每个 `CulturePage` 数据对象补 `ogImage: '/assets/og/culture-<name>.png'`(或在 page.tsx 里按命名约定推导,二选一;**采用推导**,免维护:`images: [{ url: \`/assets/og/culture-${page.kind === 'hub' ? page.hub : `${page.hub}-${page.slug}`}.png\`, ... }]` —— 此时 types 的 `ogImage` 字段保留作为手动覆盖:`page.ogImage ?? \`/assets/og/culture-${...}\``)。

- [ ] **Step 6: 跑生成 + 测试**

Run: `pnpm og:culture && pnpm test`
Expected: 10 张卡生成;测试 PASS

- [ ] **Step 7: Commit**

```bash
git add scripts/generate-og.mjs scripts/generate-culture-og.mjs app/culture package.json public/assets/og tests/culture-og.test.ts
git commit -m "feat(seo): 每文化页独立 OG 卡(参数化模板批量渲染)"
```

---

### Task 3: 现有 10 页内容加厚

**Files:**
- Modify: `src/content/culture/jiaobei.ts`(hub + 3 topic 加厚)
- Modify: `src/content/culture/yingge.ts`(hub + 2 topic 加厚)
- Modify: `src/content/culture/jianzhi.ts`(hub + 2 topic 加厚)
- Test: `tests/culture-matrix.test.ts`

**Interfaces:**
- Consumes: T1 的 `readingMinutes`/`symbol` 字段。
- Produces: 内容标准(供 T4 同标):正文字数 = 全部 `sections[].paragraphs[]` 拼接长度;阈值见测试。

- [ ] **Step 1: 写失败测试(内容契约)**

```ts
// tests/culture-matrix.test.ts
import assert from 'node:assert/strict';
import test from 'node:test';

const NEW_SLUGS = [
  'jiaobei-vs-qiuqian', 'how-to-throw', 'cheatsheet', 'when-not-to-throw',
  'why-war-dance', 'faces-cheatsheet', 'yingge-vs-others',
  'getting-started', 'motifs-cheatsheet', 'south-vs-north',
];

test('culture pages meet depth standard (800+ chars, 4+ sections, sources, quickAnswer<=80)', async () => {
  const { listCulturePages } = await import('../src/content/culture/registry.ts');
  const pages = listCulturePages();
  assert.ok(pages.length >= 20, `expected >= 20 pages, got ${pages.length}`);
  for (const page of pages) {
    const body = page.sections.flatMap((s) => s.paragraphs).join('');
    const isNew = NEW_SLUGS.includes(page.slug);
    const faqMin = isNew ? 5 : 6;
    assert.ok(body.length >= 800, `${page.path} body ${body.length} < 800`);
    assert.ok(page.sections.length >= 4, `${page.path} sections ${page.sections.length} < 4`);
    assert.ok(page.faq.length >= faqMin, `${page.path} faq ${page.faq.length} < ${faqMin}`);
    assert.ok(page.sources.length >= 3, `${page.path} sources < 3`);
    assert.ok(page.quickAnswer.join('').length <= 80, `${page.path} quickAnswer > 80 chars`);
    assert.ok(page.readingMinutes && page.readingMinutes >= 3, `${page.path} readingMinutes missing`);
    assert.ok(page.symbol, `${page.path} symbol missing`);
  }
});

test('ten new long-tail topics registered with slugs', async () => {
  const { listCulturePages } = await import('../src/content/culture/registry.ts');
  const slugs = listCulturePages().map((p) => p.slug);
  for (const slug of NEW_SLUGS) {
    assert.ok(slugs.includes(slug), `missing new topic: ${slug}`);
  }
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm test`
Expected: FAIL — 页数不足 20、字数/FAQ/字段不达标

- [ ] **Step 3: 加厚 10 页(纯内容)**

对 `jiaobei.ts`/`yingge.ts`/`jianzhi.ts` 的每个既有 `CulturePage` 对象:

1. 补 `readingMinutes`(按正文量 4–8)、`symbol`(= hub id)
2. 每页正文扩到 800–1200 字:每页 sections ≥4,不足则新增小节(历史源流/形制细节/地区差异/与游戏的关系 等角度)
3. FAQ 补到 6–8 条(真实搜索问句:是否、怎么、区别、能不能)
4. `quickAnswer` 精简到合计 ≤80 字(首句直答)
5. 来源不足 3 条则补足(沿用各文件 `SOURCES` 常量,可新增权威条目:博物馆典藏页、政府非遗名录、百科)

**写作纪律:** 三分表述(常见说法/地区差异/游戏设计);不确定的民俗细节写「常见说法」「一说」,禁止编造具体年代/人名/出处的精确断言;术语沿用各页 `terms` 词汇表保持全站一致。

- [ ] **Step 4: 跑测试(此时仍允许因新篇缺失而失败)**

Run: `pnpm test`
Expected: 加厚相关断言转绿;`ten new long-tail topics` 与 `pages.length >= 20` 仍红(T4 完成)

- [ ] **Step 5: Commit**

```bash
git add src/content/culture/jiaobei.ts src/content/culture/yingge.ts src/content/culture/jianzhi.ts tests/culture-matrix.test.ts
git commit -m "content(culture): 现有 10 页加厚至深度标准"
```

---

### Task 4: 新增 10 篇长尾/速查专题

**Files:**
- Modify: `src/content/culture/jiaobei.ts`(追加 4 篇)
- Modify: `src/content/culture/yingge.ts`(追加 3 篇)
- Modify: `src/content/culture/jianzhi.ts`(追加 3 篇)
- Modify: `public/llms.txt` 无 —— (llms.txt 在 T5)
- Create: `public/assets/og/culture-*.png`(重跑生成)

**Interfaces:**
- Consumes: T3 内容标准与 `NEW_SLUGS` 契约。

- [ ] **Step 1: 写 10 个新 CulturePage 对象**

每篇结构(以掷筊 `cheatsheet` 为例的字段模板):

```ts
  {
    kind: 'topic',
    hub: 'jiaobei',
    slug: 'cheatsheet',
    path: '/culture/jiaobei/cheatsheet/',
    title: '掷筊判读速查表:圣杯、笑杯、阴杯一览',
    description: '...',  // ≤80 字,含目标关键词
    h1: '掷筊判读速查表',
    keywords: ['掷筊', '圣杯', '笑杯', '阴杯', '判读'],
    quickAnswer: ['一平一凸为圣杯(应允),两平为笑杯(未定),两凸为阴杯(不宜)。'],
    sections: [/* ≥4 节,合计 ≥800 字;速查表用术语网格 terms 承载对照 */],
    terms: [/* 对照表条目 */],
    faq: [/* ≥5 条 */],
    sources: [...SOURCES],
    relatedPaths: ['/culture/jiaobei/how-to-read/', '/games/shantou-jiaobei/'],
    gameHref: GAME.gameHref,
    gameName: GAME.gameName,
    dateModified: DATE,
    readingMinutes: 5,
    symbol: 'jiaobei',
  },
```

10 篇清单(slug/标题/核心角度):

| hub | slug | 标题 | 核心小节角度 |
|---|---|---|---|
| jiaobei | `jiaobei-vs-qiuqian` | 掷筊和求签有什么区别? | 载体与判读/问法粒度/场合礼序/常见混淆/游戏里的体现 |
| jiaobei | `how-to-throw` | 掷筊的姿势与步骤 | 净手与禀告/持杯手势/掷地与判读/次数与追问/线上怎么玩 |
| jiaobei | `cheatsheet` | 掷筊判读速查表 | 三杯象对照(terms)/判读口诀/常见误读/地区差异提醒 |
| jiaobei | `when-not-to-throw` | 什么时候不适合掷筊? | 心态与边界/不替他人问/重大决策提醒/娱乐声明呼应 |
| yingge | `why-war-dance` | 英歌为什么叫「中华战舞」? | 称谓由来(常见说法)/水浒叙事与武元素/槌法与阵型/巡游场合 |
| yingge | `faces-cheatsheet` | 英歌脸谱角色速查 | 主要角色对照(terms:角色×脸谱×槌法)/领队与锣鼓/地区差异 |
| yingge | `yingge-vs-others` | 英歌与傩舞、秧歌的区别 | 源流分野/功能场合/形态对比/为何常被混淆 |
| jianzhi | `getting-started` | 剪纸入门:工具与第一次动剪 | 工具纸选择/执剪与走剪/对称折法起步/安全与练习/游戏里试试 |
| jianzhi | `motifs-cheatsheet` | 剪纸纹样吉语速查表 | 纹样×吉语×场合对照(terms)/组合寓意/贴用时节/地区差异 |
| jianzhi | `south-vs-north` | 南派剪纸与北派剪纸的区别 | 流派划分(常见说法)/风格对比/代表题材/潮汕剪纸的位置 |

`relatedPaths` 至少互链同 hub 一篇 + 对应游戏页;新篇的 FAQ 可与同 hub 既有 `sharedFaq` 复用 1–2 条。

- [ ] **Step 2: 重渲 OG + 跑测试**

Run: `pnpm og:culture && pnpm test`
Expected: 20 张卡齐;全部 PASS(含 `>= 20 pages`)

- [ ] **Step 3: Commit**

```bash
git add src/content/culture public/assets/og
git commit -m "content(culture): 新增 10 篇长尾与速查专题"
```

---

### Task 5: llms.txt + 旧组件清理 + 全量验收

**Files:**
- Create: `public/llms.txt`
- Modify: `app/sitemap.ts:23-28`(加 llms.txt 路由)
- Delete: `src/components/site/SiteHeader.tsx`、`SiteFooter.tsx`、`HeroBand.tsx`、`ExhibitCard.tsx`、`TrustStrip.tsx`、`SectionHeader.tsx`(`PlayCta.tsx` 若已无引用一并删)
- Modify: `tests/site-components-contract.test.ts`(删除 SiteHeader 用例)
- Test: `tests/llms-txt.test.ts`

- [ ] **Step 1: 写 llms.txt + 测试**

```
# rex-game · 可玩的民俗文化馆

> 一座可以玩的中国民艺馆:潮汕圣杯占卜、潮汕英歌、中国剪纸三件互动展品,配可检索文化导读。静态站点,浏览器即开即玩。

## 互动展品
- [潮汕圣杯占卜](https://game.rexai.top/games/shantou-jiaobei/): 3D 物理掷筊,手势可选
- [合槌成阵:潮汕英歌](https://game.rexai.top/games/chaoshan-yingge/): 节奏横版动作
- [纸上生花:中国剪纸](https://game.rexai.top/games/jianzhi/): 折剪展开与吉语图鉴

## 文化导读(hub)
- [掷筊](https://game.rexai.top/culture/jiaobei/)
- [英歌](https://game.rexai.top/culture/yingge/)
- [剪纸](https://game.rexai.top/culture/jianzhi/)

## 引用建议
- 引用文化导读内容时请注明「rex-game · 可玩的民俗文化馆」及页面链接
- 本站内容区分常见说法、地区差异与游戏设计,引用时建议保留该限定
```

```ts
// tests/llms-txt.test.ts
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('llms.txt exists and indexes games + culture hubs', () => {
  const p = new URL('public/llms.txt', root);
  assert.ok(existsSync(p), 'public/llms.txt missing');
  const src = readFileSync(p, 'utf8');
  assert.match(src, /可玩的民俗文化馆/);
  assert.match(src, /\/games\/shantou-jiaobei\//);
  assert.match(src, /\/culture\/jiaobei\//);
  assert.match(src, /\/culture\/yingge\//);
  assert.match(src, /\/culture\/jianzhi\//);
});

test('sitemap includes llms.txt', () => {
  const src = readFileSync(new URL('app/sitemap.ts', root), 'utf8');
  assert.match(src, /llms\.txt/);
});
```

sitemap.ts 在 about 路由后追加:

```ts
    {
      url: 'https://game.rexai.top/llms.txt',
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
```

- [ ] **Step 2: 跑测试确认失败 → 实现 → 转绿**

Run: `pnpm test`(红:llms.txt missing)→ 创建文件与 sitemap 条目 → `pnpm test`(绿)

- [ ] **Step 3: 旧组件清理**

Run: `grep -rln "SiteHeader\|SiteFooter\|HeroBand\|ExhibitCard\|TrustStrip\|PlayCta\|from './SectionHeader'" app src --include="*.tsx" | grep -v "components/site/Site\|components/site/HeroBand\|components/site/ExhibitCard\|components/site/TrustStrip\|components/site/PlayCta\|components/site/SectionHeader"`
Expected: 无输出(仅组件自身文件)。随后:

```bash
git rm src/components/site/SiteHeader.tsx src/components/site/SiteFooter.tsx src/components/site/HeroBand.tsx src/components/site/ExhibitCard.tsx src/components/site/TrustStrip.tsx src/components/site/SectionHeader.tsx
# PlayCta 若 grep 确认无引用:git rm src/components/site/PlayCta.tsx
```

`tests/site-components-contract.test.ts`:删除 `SiteHeader exposes culture and about nav` 用例(保留 CultureDocument 用例)。

- [ ] **Step 4: 全量测试 + 隔离构建**

Run: `pnpm test`
Expected: 全部 PASS

Run: `git worktree add /tmp/rex-game-s2 HEAD && cd /tmp/rex-game-s2 && pnpm install --prefer-offline --silent && pnpm build`
Expected: 30+ 静态路由(20 文化页)全部生成;随后 `git worktree remove --force /tmp/rex-game-s2`

- [ ] **Step 5: 对照 spec §8 验收清单**

- 任一 topic 页(/culture/jiaobei/how-to-read/)目检:展厅头/快速回答条/宣纸正文/CTA 横幅;任一 hub 页目检:展厅头+专题卡 grid;移动端汉堡菜单
- 每页 `<head>` 有页面级 og:image(view-source 或 devtools)
- llms.txt 可访问;sitemap 含全部新路由
- 旧组件已删,museum.css 仅保留供 `.culture-doc` 排版(勿动)

- [ ] **Step 6: Commit**

```bash
git add public/llms.txt app/sitemap.ts tests/llms-txt.test.ts tests/site-components-contract.test.ts
git commit -m "feat(seo): llms.txt 上线与 v1 旧组件清理"
```

---

## Self-Review 记录

- **Spec 覆盖:** §4.1 topic 双轨 → T1;§4.2 hub 展厅 → T1;§4.3 types → T1;§4.4 换壳+索引页 → T1/T5;§5.1 加厚 → T3;§5.2 新篇 → T4;§6 llms.txt/OG/QA 规范 → T5/T2/T3;§7 任务划分 → T1–T5 一一对应;§8 验收 → T5 Step 5。
- **占位符:** 无;内容任务给出阈值、模板与每篇小节角度,执行期展开为全文。
- **类型一致:** `CultureHero({page,crumbs})` 在 T1 定义与 CultureDocument 调用一致;OG 命名约定 `culture-<hub>[-<slug>]` 在 T2 生成器、page.tsx 推导、测试三处一致;`NEW_SLUGS` 在 T3 测试与 T4 清单一致。
