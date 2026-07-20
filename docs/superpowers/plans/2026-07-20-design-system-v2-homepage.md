# 设计系统 v2「数字民艺」+ 首页重设计 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按 spec 落地方向 C 设计系统 v2、v2 站点外壳(首页+关于页)与首页五区块重设计,完成门面 SEO(title/字体自托管/OG 分享卡)。

**Architecture:** 新增 `tokens.css`(设计变量)+ `gallery.css`(`.theme-gallery` 基底)作为 v2 样式层;新增一组 `Gallery*`/`Home*` 组件渲染首页 S1–S5 与外壳;旧 `SiteHeader`/`museum.css` 保留给文化页过渡期,互不干扰。字体走「源码提字 → pyftsubset 子集化 → 自托管 woff2」管线;OG 卡走「SVG → sharp → PNG」管线。

**Tech Stack:** Next.js 15(静态导出)+ React 19 + 原生 CSS;node:test 契约测试;fonttools(子集化)+ sharp(OG 渲染,均为构建期一次性工具)。

**Spec:** `docs/superpowers/specs/2026-07-20-design-system-v2-homepage-design.md`

## Global Constraints

- 静态导出(`output: 'export'`)+ Gitee Pages,不引入任何服务端能力;`images.unoptimized` 已配置,直接用 `<img>`/CSS 背景。
- 不引入 GSAP/滚动动画库;滚动触发 = IntersectionObserver + CSS(`@supports` 渐进增强)。
- 色值以 spec §6.1 为准:`--g-abyss:#0A0705` `--g-lacquer:#120B07` `--g-float:#1A130C` `--g-card:#241A10` `--g-cinnabar-hi:#E8452F` `--g-cinnabar:#C82E21` `--g-cinnabar-deep:#A81E14` `--g-gold:#C9A24B` `--g-gold-hi:#E8CF9A` `--g-paper:#F7F1E6` `--g-cream:#E8DCC4`。
- 动效:200/500/900ms,`cubic-bezier(0.22,1,0.36,1)`;`prefers-reduced-motion` 全部降级为透明度过渡。
- 禁止 `fonts.googleapis.com` / `fonts.gstatic.com` 外链(任务 7 收尾)。
- 文化页(`app/culture/**`)与游戏页(`app/games/**`、`src/games/**`)本计划零改动。
- 测试:`pnpm test`(node --test,`tests/*.test.ts` 自动拾取);构建:`pnpm build` —— **用户开着 `pnpm dev` 时禁止跑** (会清 `.next` 致 ChunkLoadError),执行前先确认。
- 提交风格:Conventional Commits(参照 `git log`)。
- 实现期偏差说明:OG 分享卡 spec 写「AI 生成」,实现改为 **SVG + sharp 确定性渲染**(文字锐利、品牌精确、可复现);后续如需 AI 版可平替,不属于偏差不报。

---

### Task 1: 设计 tokens + gallery 基底样式

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/styles/gallery.css`
- Modify: `app/layout.tsx:1-5`(样式 import)
- Test: `tests/gallery-tokens.test.ts`

**Interfaces:**
- Produces: 全部 `--g-*` 变量(见 Global Constraints);class `.theme-gallery`、`.g-container`、`.g-section`、`.g-label`、`.g-display`、`.g-btn`/`.g-btn--primary`/`.g-btn--ghost`、`.visually-hidden` —— 后续所有任务依赖这些名字。

- [ ] **Step 1: 写失败测试**

```ts
// tests/gallery-tokens.test.ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('tokens.css defines spec color and motion tokens', () => {
  const css = readFileSync(new URL('src/styles/tokens.css', root), 'utf8');
  for (const token of [
    '--g-abyss: #0A0705',
    '--g-lacquer: #120B07',
    '--g-float: #1A130C',
    '--g-card: #241A10',
    '--g-cinnabar-hi: #E8452F',
    '--g-cinnabar: #C82E21',
    '--g-cinnabar-deep: #A81E14',
    '--g-gold: #C9A24B',
    '--g-gold-hi: #E8CF9A',
    '--g-paper: #F7F1E6',
    '--g-cream: #E8DCC4',
    '--g-ease: cubic-bezier(0.22, 1, 0.36, 1)',
  ]) {
    assert.ok(css.includes(token), `tokens.css missing: ${token}`);
  }
});

test('gallery.css exposes theme-gallery shell and shared primitives', () => {
  const css = readFileSync(new URL('src/styles/gallery.css', root), 'utf8');
  for (const sel of ['.theme-gallery', '.g-container', '.g-section', '.g-label', '.g-display', '.g-btn--primary', '.g-btn--ghost', '.visually-hidden', 'prefers-reduced-motion']) {
    assert.ok(css.includes(sel), `gallery.css missing: ${sel}`);
  }
  const layout = readFileSync(new URL('app/layout.tsx', root), 'utf8');
  assert.match(layout, /tokens\.css/);
  assert.match(layout, /gallery\.css/);
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm test`
Expected: FAIL — `ENOENT` 读不到 `src/styles/tokens.css`

- [ ] **Step 3: 创建 tokens.css**

```css
/* src/styles/tokens.css
 * 设计系统 v2「数字民艺」tokens —— 方向 C 当代数字艺术
 * 色值/动效以 spec §6 为唯一来源,禁散落硬编码。
 */
:root {
  /* 底色阶梯 */
  --g-abyss: #0A0705;
  --g-lacquer: #120B07;
  --g-float: #1A130C;
  --g-card: #241A10;
  /* 朱 */
  --g-cinnabar-hi: #E8452F;
  --g-cinnabar: #C82E21;
  --g-cinnabar-deep: #A81E14;
  /* 金 */
  --g-gold: #C9A24B;
  --g-gold-hi: #E8CF9A;
  /* 纸 */
  --g-paper: #F7F1E6;
  --g-cream: #E8DCC4;
  /* 文本阶梯 */
  --g-text-hi: #F5EDE0;
  --g-text: rgba(232, 220, 196, 0.68);
  --g-text-dim: rgba(232, 220, 196, 0.45);
  /* 字族(自托管 @font-face 见任务 7;栈内为系统回退) */
  --g-font-display: 'Noto Serif SC', 'Songti SC', 'STSong', serif;
  --g-font-body: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  /* 动效 */
  --g-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --g-dur-micro: 200ms;
  --g-dur-enter: 500ms;
  --g-dur-hero: 900ms;
  /* 节奏 */
  --g-section-gap: clamp(7.5rem, 15vw, 12.5rem);
  --g-radius: 2px;
}
```

- [ ] **Step 4: 创建 gallery.css 基底**

```css
/* src/styles/gallery.css
 * 方向 C「数字民艺」基底 —— 首页/关于页 v2 外壳。
 * 仅服务 .theme-gallery 子树;文化页仍用 museum.css,互不干扰。
 */

html:has(.theme-gallery) body {
  background: var(--g-abyss);
}

.theme-gallery {
  min-height: 100vh;
  background:
    radial-gradient(90% 60% at 72% 0%, rgba(200, 46, 33, 0.14) 0%, transparent 55%),
    var(--g-abyss);
  color: var(--g-cream);
  font-family: var(--g-font-body);
  font-size: 16.5px;
  line-height: 1.85;
  -webkit-font-smoothing: antialiased;
}
.theme-gallery ::selection {
  background: var(--g-cinnabar);
  color: var(--g-paper);
}
.theme-gallery a {
  color: inherit;
  text-decoration: none;
}
.theme-gallery :focus-visible {
  outline: 2px solid var(--g-gold);
  outline-offset: 3px;
}

/* —— 布局与排版原语 —— */
.g-container {
  width: min(1120px, 92vw);
  margin-inline: auto;
}
.g-section {
  padding-block: calc(var(--g-section-gap) / 2);
}
.g-label {
  font-size: 11px;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: var(--g-gold);
}
.g-display {
  margin: 0;
  font-family: var(--g-font-display);
  font-weight: 700;
  line-height: 1.14;
  color: var(--g-text-hi);
}
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

/* —— 按钮:朱砂实底(主)/ 描金幽灵(次) —— */
.g-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.9rem 2.2rem;
  border-radius: var(--g-radius);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.22em;
  transition:
    transform var(--g-dur-micro) var(--g-ease),
    box-shadow var(--g-dur-micro) var(--g-ease),
    background var(--g-dur-micro) var(--g-ease),
    border-color var(--g-dur-micro) var(--g-ease);
}
.g-btn--primary {
  background: var(--g-cinnabar);
  color: var(--g-paper);
  box-shadow: 0 10px 30px rgba(200, 46, 33, 0.35);
}
.g-btn--primary:hover {
  background: var(--g-cinnabar-hi);
  transform: translateY(-2px);
}
.g-btn--ghost {
  border: 1px solid rgba(201, 162, 75, 0.5);
  color: var(--g-gold);
}
.g-btn--ghost:hover {
  border-color: var(--g-gold);
  background: rgba(201, 162, 75, 0.08);
  transform: translateY(-2px);
}

/* —— 动效降级:全站只剩透明度过渡 —— */
@media (prefers-reduced-motion: reduce) {
  .theme-gallery *,
  .theme-gallery *::before,
  .theme-gallery *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 5: layout.tsx 引入两个样式文件**

`app/layout.tsx` 顶部 import 块改为:

```tsx
import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import '@/styles/tokens.css';
import '@/styles/gallery.css';
import '@/styles/museum.css';
import '@/styles/home.css';
import '@/styles/jiaobei.css';
```

- [ ] **Step 6: 跑测试确认通过**

Run: `pnpm test`
Expected: PASS(含旧测试,全绿)

- [ ] **Step 7: Commit**

```bash
git add src/styles/tokens.css src/styles/gallery.css app/layout.tsx tests/gallery-tokens.test.ts
git commit -m "feat(styles): 设计系统 v2 tokens 与 gallery 基底样式"
```

---

### Task 2: Reveal 滚动显现组件

**Files:**
- Create: `src/components/site/Reveal.tsx`
- Modify: `src/styles/gallery.css`(追加 reveal 段)
- Test: `tests/reveal.test.ts`

**Interfaces:**
- Produces: `Reveal({ children, className?, delay? })` —— client component,进场后给根 div 加 `is-in`;`delay` 单位 ms。CSS class `.reveal`/`.reveal.is-in`。

- [ ] **Step 1: 写失败测试**

```ts
// tests/reveal.test.ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('Reveal is a client component using IntersectionObserver with reduced-motion fallback', () => {
  const src = readFileSync(new URL('src/components/site/Reveal.tsx', root), 'utf8');
  assert.match(src, /'use client'/);
  assert.match(src, /IntersectionObserver/);
  assert.match(src, /prefers-reduced-motion/);
  assert.match(src, /is-in/);
  const css = readFileSync(new URL('src/styles/gallery.css', root), 'utf8');
  assert.match(css, /\.reveal/);
  assert.match(css, /\.reveal\.is-in/);
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm test`
Expected: FAIL — `ENOENT` 读不到 `Reveal.tsx`

- [ ] **Step 3: 实现 Reveal.tsx**

```tsx
'use client';

import { useEffect, useRef, type ReactNode } from 'react';

export function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('is-in');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add('is-in');
            io.disconnect();
          }
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 4: gallery.css 追加**

```css
/* —— 滚动显现(配合 Reveal 组件) —— */
.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition:
    opacity var(--g-dur-enter) var(--g-ease),
    transform var(--g-dur-enter) var(--g-ease);
}
.reveal.is-in {
  opacity: 1;
  transform: none;
}
@media (prefers-reduced-motion: reduce) {
  .reveal {
    opacity: 1;
    transform: none;
  }
}
```

- [ ] **Step 5: 跑测试确认通过**

Run: `pnpm test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/site/Reveal.tsx src/styles/gallery.css tests/reveal.test.ts
git commit -m "feat(site): Reveal 滚动显现组件"
```

---

### Task 3: GalleryHeader / GalleryFooter v2 外壳

**Files:**
- Create: `src/components/site/GalleryHeader.tsx`
- Create: `src/components/site/GalleryFooter.tsx`
- Modify: `src/styles/gallery.css`(追加 gh/gf 段)
- Test: `tests/gallery-shell.test.ts`

**Interfaces:**
- Consumes: `.g-container`、`.g-btn*`(Task 1);`SITE_NAV`、`SITE_DISCLAIMER`、`SITE_ORIGIN`(`src/content/site.ts`);`games`(`src/core/gamesRegistry.ts`);`listCultureHubs()` → `CulturePage[]` 含 `path`/`h1`(`src/content/culture/registry.ts`)。
- Produces: `GalleryHeader({ ctaHref?, ctaLabel? })`(client)、`GalleryFooter()`(server);class `.gh`/`.gh--scrolled`/`.gh__*`/`.gf`/`.gf__*`。

- [ ] **Step 1: 写失败测试**

```ts
// tests/gallery-shell.test.ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('GalleryHeader: client component, wordmark, nav, mobile menu', () => {
  const src = readFileSync(new URL('src/components/site/GalleryHeader.tsx', root), 'utf8');
  assert.match(src, /'use client'/);
  assert.match(src, /REX-GAME/);
  assert.match(src, /SITE_NAV/);
  assert.match(src, /aria-expanded/);
  assert.match(src, /gh--scrolled/);
});

test('GalleryFooter: wordmark, nav columns, disclaimer', () => {
  const src = readFileSync(new URL('src/components/site/GalleryFooter.tsx', root), 'utf8');
  assert.match(src, /REX-GAME · 民艺馆/);
  assert.match(src, /listCultureHubs/);
  assert.match(src, /SITE_DISCLAIMER/);
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm test`
Expected: FAIL — `ENOENT` 读不到 `GalleryHeader.tsx`

- [ ] **Step 3: 实现 GalleryHeader.tsx**

```tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { games } from '@/core/gamesRegistry';
import { SITE_NAV } from '@/content/site';

export function GalleryHeader({
  ctaHref,
  ctaLabel,
}: {
  ctaHref?: string;
  ctaLabel?: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const href = ctaHref ?? games[0]?.href ?? '/';
  const label = ctaLabel ?? '进入展厅';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`gh ${scrolled ? 'gh--scrolled' : ''}`}>
      <div className="gh__inner g-container">
        <Link className="gh__brand" href="/" aria-label="rex-game 首页">
          <span className="gh__wordmark">REX-GAME</span>
          <span className="gh__sub">民艺馆</span>
        </Link>
        <nav className="gh__nav" aria-label="主导航">
          {SITE_NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          <Link className="g-btn g-btn--primary gh__cta" href={href}>
            {label}
          </Link>
        </nav>
        <button
          type="button"
          className="gh__burger"
          aria-expanded={open}
          aria-label={open ? '关闭菜单' : '打开菜单'}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </div>
      {open ? (
        <nav className="gh__mobile" aria-label="移动端导航">
          {SITE_NAV.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link className="g-btn g-btn--primary" href={href} onClick={() => setOpen(false)}>
            {label}
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
```

- [ ] **Step 4: 实现 GalleryFooter.tsx**

```tsx
import Link from 'next/link';
import { games } from '@/core/gamesRegistry';
import { listCultureHubs } from '@/content/culture/registry';
import { SITE_DISCLAIMER, SITE_ORIGIN } from '@/content/site';

export function GalleryFooter() {
  const hubs = listCultureHubs();

  return (
    <footer className="gf">
      <div className="g-container">
        <p className="gf__wordmark">REX-GAME · 民艺馆</p>
        <div className="gf__grid">
          <nav aria-label="展品导航">
            <h3>展品</h3>
            <ul>
              {games.map((g) => (
                <li key={g.id}>
                  <Link href={g.href}>{g.name}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="文化馆导航">
            <h3>文化馆</h3>
            <ul>
              <li>
                <Link href="/culture/">索引</Link>
              </li>
              {hubs.map((h) => (
                <li key={h.path}>
                  <Link href={h.path}>{h.h1.replace(/？$/, '').slice(0, 12)}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="关于导航">
            <h3>关于</h3>
            <ul>
              <li>
                <Link href="/about/">本站说明</Link>
              </li>
              <li>
                <a href={SITE_ORIGIN}>{SITE_ORIGIN.replace('https://', '')}</a>
              </li>
            </ul>
          </nav>
        </div>
        <p className="gf__disclaimer">{SITE_DISCLAIMER}</p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 5: gallery.css 追加外壳样式**

```css
/* —— v2 外壳:GalleryHeader —— */
.gh {
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid transparent;
  transition:
    background var(--g-dur-micro) var(--g-ease),
    border-color var(--g-dur-micro) var(--g-ease);
}
.gh--scrolled {
  background: rgba(18, 11, 7, 0.78);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom-color: rgba(201, 162, 75, 0.16);
}
.gh__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-block: 18px;
}
.gh__brand {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.gh__wordmark {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.28em;
  color: var(--g-text-hi);
}
.gh__sub {
  font-size: 11px;
  letter-spacing: 0.35em;
  color: var(--g-gold);
}
.gh__nav {
  display: flex;
  align-items: center;
  gap: 30px;
}
.gh__nav a:not(.g-btn) {
  font-size: 13px;
  letter-spacing: 0.18em;
  color: var(--g-text);
  transition: color var(--g-dur-micro) var(--g-ease);
}
.gh__nav a:not(.g-btn):hover {
  color: var(--g-gold-hi);
}
.gh__cta {
  padding: 0.55rem 1.4rem;
  font-size: 12px;
}
.gh__burger {
  display: none;
}
.gh__mobile {
  display: none;
}
@media (max-width: 760px) {
  .gh__nav {
    display: none;
  }
  .gh__burger {
    display: inline-flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px;
    background: none;
    border: 0;
    cursor: pointer;
  }
  .gh__burger span {
    width: 22px;
    height: 1.5px;
    background: var(--g-cream);
  }
  .gh__mobile {
    display: flex;
    flex-direction: column;
    gap: 22px;
    padding: 28px 4vw 36px;
    background: rgba(10, 7, 5, 0.96);
    backdrop-filter: blur(14px);
    border-bottom: 1px solid rgba(201, 162, 75, 0.16);
  }
  .gh__mobile a:not(.g-btn) {
    font-family: var(--g-font-display);
    font-size: 24px;
    color: var(--g-text-hi);
  }
}

/* —— v2 外壳:GalleryFooter —— */
.gf {
  border-top: 1px solid rgba(201, 162, 75, 0.16);
  padding-block: 4rem 3rem;
}
.gf__wordmark {
  margin: 0 0 2.5rem;
  font-family: var(--g-font-display);
  font-size: clamp(1.4rem, 3vw, 1.9rem);
  letter-spacing: 0.12em;
  color: var(--g-text-hi);
}
.gf__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2rem;
  margin-bottom: 2.5rem;
}
.gf__grid h3 {
  margin: 0 0 0.8rem;
  font-size: 12px;
  letter-spacing: 0.3em;
  color: var(--g-gold);
  font-weight: 500;
}
.gf__grid ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.5rem;
}
.gf__grid a {
  font-size: 13.5px;
  color: var(--g-text);
  transition: color var(--g-dur-micro) var(--g-ease);
}
.gf__grid a:hover {
  color: var(--g-gold-hi);
}
.gf__disclaimer {
  margin: 0;
  max-width: 46rem;
  font-size: 12.5px;
  line-height: 1.8;
  color: var(--g-text-dim);
}
@media (max-width: 760px) {
  .gf__grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 6: 跑测试确认通过**

Run: `pnpm test`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/components/site/GalleryHeader.tsx src/components/site/GalleryFooter.tsx src/styles/gallery.css tests/gallery-shell.test.ts
git commit -m "feat(site): GalleryHeader/GalleryFooter v2 暗场外壳"
```

---

### Task 4: S1 首屏 — HomeHero + HeroInstallation

**Files:**
- Create: `src/components/site/HomeHero.tsx`
- Create: `src/components/site/HeroInstallation.tsx`
- Modify: `src/styles/gallery.css`(追加 hero 段)
- Test: `tests/home-hero.test.ts`

**Interfaces:**
- Consumes: `.g-container`/`.g-label`/`.g-display`/`.g-btn*`(Task 1);`games`(registry)。
- Produces: `HomeHero()`(server)、`HeroInstallation()`(client,`data-depth` 层做视差);class `.hero__*`/`.hi__*`。

- [ ] **Step 1: 写失败测试**

```ts
// tests/home-hero.test.ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('HomeHero renders approved claim and CTAs', () => {
  const src = readFileSync(new URL('src/components/site/HomeHero.tsx', root), 'utf8');
  assert.match(src, /一座可以玩的/);
  assert.match(src, /民艺馆/);
  assert.match(src, /进入展厅/);
  assert.match(src, /先去文化馆/);
  assert.match(src, /HeroInstallation/);
});

test('HeroInstallation is client, parallax layers, reduced-motion safe', () => {
  const src = readFileSync(new URL('src/components/site/HeroInstallation.tsx', root), 'utf8');
  assert.match(src, /'use client'/);
  assert.match(src, /data-depth/);
  assert.match(src, /prefers-reduced-motion/);
  assert.match(src, /aria-hidden/);
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm test`
Expected: FAIL — `ENOENT` 读不到 `HomeHero.tsx`

- [ ] **Step 3: 实现 HeroInstallation.tsx**

视差加在外层 `span[data-depth]`,漂浮 keyframes 加在内层 `svg`,避免 transform 冲突。

```tsx
'use client';

import { useEffect, useRef } from 'react';

export function HeroInstallation() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const layers = Array.from(root.querySelectorAll<HTMLElement>('[data-depth]'));
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        for (const el of layers) {
          const depth = Number(el.dataset.depth ?? 0);
          el.style.transform = `translate3d(0, ${(-y * depth).toFixed(1)}px, 0)`;
        }
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div ref={ref} className="hi" aria-hidden="true">
      <span className="hi__layer hi__ring" data-depth="0.06">
        <svg className="hi__float-slow" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(201,162,75,0.55)" strokeWidth="1" />
        </svg>
      </span>
      <span className="hi__layer hi__diamond" data-depth="0.12">
        <svg className="hi__float-mid" viewBox="0 0 64 64">
          <polygon points="32,2 62,32 32,62 2,32" fill="#C82E21" />
          <polygon points="32,14 50,32 32,50 14,32" fill="#0A0705" />
          <polygon points="32,22 42,32 32,42 22,32" fill="#D23627" />
        </svg>
      </span>
      <span className="hi__layer hi__crescent-a" data-depth="0.18">
        <svg className="hi__float-fast" viewBox="0 0 27 42">
          <path d="M13 2 a26 26 0 0 0 0 38 a20 20 0 0 1 0 -38z" fill="#C9A24B" />
        </svg>
      </span>
      <span className="hi__layer hi__crescent-b" data-depth="0.18">
        <svg className="hi__float-fast" viewBox="0 0 27 42">
          <path d="M14 2 a26 26 0 0 1 0 38 a20 20 0 0 0 0 -38z" fill="#C9A24B" opacity="0.85" />
        </svg>
      </span>
      <span className="hi__layer hi__sticks" data-depth="0.1">
        <svg className="hi__float-mid" viewBox="0 0 80 56">
          <rect x="8" y="4" width="7" height="46" rx="3.5" fill="#E8CF9A" transform="rotate(18 11 27)" />
          <rect x="65" y="4" width="7" height="46" rx="3.5" fill="#E8CF9A" transform="rotate(-18 68 27)" />
          <circle cx="40" cy="34" r="16" fill="none" stroke="#C82E21" strokeWidth="4" />
          <circle cx="40" cy="34" r="5" fill="#C9A24B" />
        </svg>
      </span>
    </div>
  );
}
```

- [ ] **Step 4: 实现 HomeHero.tsx**

```tsx
import Link from 'next/link';
import { games } from '@/core/gamesRegistry';
import { HeroInstallation } from './HeroInstallation';

export function HomeHero() {
  const featured = games[0];

  return (
    <section className="hero">
      <div className="g-container hero__inner">
        <div className="hero__copy">
          <p className="g-label hero__eyebrow">可玩的民俗文化馆 · INTERACTIVE FOLK MUSEUM</p>
          <h1 className="g-display hero__title">
            一座可以玩的
            <br />
            中国<em>民艺馆</em>
          </h1>
          <p className="hero__lead">
            掷筊问愿、英歌合槌、折剪生花——三件民俗展品,无需下载,即开即玩;玩完再读背后的称法、节奏与吉语。
          </p>
          <div className="hero__actions">
            <Link className="g-btn g-btn--primary" href={featured?.href ?? '/culture/'}>
              进入展厅
            </Link>
            <Link className="g-btn g-btn--ghost" href="/culture/">
              先去文化馆
            </Link>
          </div>
        </div>
        <HeroInstallation />
      </div>
      <p className="hero__scrollhint">向下滚动 · 逛三件展品</p>
    </section>
  );
}
```

- [ ] **Step 5: gallery.css 追加 hero 样式**

```css
/* —— S1 首屏装置 —— */
.hero {
  position: relative;
  min-height: 92vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: radial-gradient(90% 80% at 72% 18%, rgba(200, 46, 33, 0.22) 0%, transparent 55%);
}
.hero__inner {
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  align-items: center;
  gap: 2rem;
  padding-block: 4rem 2rem;
}
.hero__eyebrow {
  margin: 0 0 1.4rem;
}
.hero__title {
  font-size: clamp(3rem, 8vw, 6rem);
  letter-spacing: 0.04em;
}
.hero__title em {
  font-style: normal;
  color: var(--g-cinnabar-hi);
}
.hero__lead {
  margin: 1.6rem 0 2.2rem;
  max-width: 34rem;
  font-size: 17px;
  line-height: 1.9;
  color: var(--g-text);
}
.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}
.hero__scrollhint {
  margin: 0;
  padding-bottom: 1.2rem;
  text-align: center;
  font-size: 10px;
  letter-spacing: 0.35em;
  color: var(--g-text-dim);
}

/* 装置层 */
.hi {
  position: relative;
  height: 420px;
}
.hi__layer {
  position: absolute;
  will-change: transform;
}
.hi__layer svg {
  display: block;
  width: 100%;
  height: 100%;
}
.hi__ring {
  right: 62%;
  top: 6%;
  width: 40px;
  height: 40px;
}
.hi__diamond {
  right: 26%;
  top: 8%;
  width: clamp(96px, 12vw, 150px);
  aspect-ratio: 1;
  filter: drop-shadow(0 30px 50px rgba(200, 30, 20, 0.4));
}
.hi__crescent-a {
  right: 64%;
  top: 58%;
  width: 30px;
  height: 46px;
}
.hi__crescent-b {
  right: 55%;
  top: 70%;
  width: 30px;
  height: 46px;
}
.hi__sticks {
  right: 4%;
  top: 58%;
  width: clamp(72px, 8vw, 104px);
  aspect-ratio: 80 / 56;
}
.hi__float-slow {
  animation: hi-float 7s var(--g-ease) infinite alternate;
}
.hi__float-mid {
  animation: hi-float 5.5s var(--g-ease) infinite alternate;
}
.hi__float-fast {
  animation: hi-float 4.2s var(--g-ease) infinite alternate;
}
@keyframes hi-float {
  from {
    transform: translate3d(0, -8px, 0) rotate(-2deg);
  }
  to {
    transform: translate3d(0, 10px, 0) rotate(2.5deg);
  }
}
@media (max-width: 860px) {
  .hero__inner {
    grid-template-columns: 1fr;
  }
  .hi {
    position: absolute;
    inset: 0;
    height: auto;
    opacity: 0.38;
    pointer-events: none;
  }
}
```

- [ ] **Step 6: 跑测试确认通过**

Run: `pnpm test`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/components/site/HomeHero.tsx src/components/site/HeroInstallation.tsx src/styles/gallery.css tests/home-hero.test.ts
git commit -m "feat(site): 首页 S1 首屏装置 Hero"
```

---

### Task 5: S2–S5 区块组件 + GallerySectionHeader

**Files:**
- Create: `src/components/site/GallerySectionHeader.tsx`
- Create: `src/components/site/ExhibitSection.tsx`
- Create: `src/components/site/HomeClaims.tsx`
- Create: `src/components/site/CultureGateway.tsx`
- Create: `src/components/site/HomeTrust.tsx`
- Modify: `src/core/gamesRegistry.ts:28,38,47`(tagline 换成 spec 文案)
- Modify: `src/styles/gallery.css`(追加区块段)
- Test: `tests/home-sections.test.ts`

**Interfaces:**
- Consumes: `Reveal`(Task 2);`.g-label` 等(Task 1);`GameMeta`(registry);`TRUST_METRICS`、`SITE_DISCLAIMER`(site.ts)。
- Produces: `GallerySectionHeader({ index, title, note? })`;`ExhibitSection({ game, index, cultureHref })`;`HomeClaims()`;`CultureGateway()`;`HomeTrust()`。class `.gsh*`/`.exhibit*`/`.claims*`/`.gateway*`/`.trust*`。

- [ ] **Step 1: 写失败测试**

```ts
// tests/home-sections.test.ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('ExhibitSection: numbered label, dual entries, approved taglines', () => {
  const src = readFileSync(new URL('src/components/site/ExhibitSection.tsx', root), 'utf8');
  assert.match(src, /No\.01/);
  assert.match(src, /No\.03/);
  assert.match(src, /cultureHref/);
  assert.match(src, /开始占卜/);
  assert.match(src, /加入巡游/);
  assert.match(src, /开始创作/);
  const registry = readFileSync(new URL('src/core/gamesRegistry.ts', root), 'utf8');
  assert.match(registry, /看神明如何回你/);
  assert.match(registry, /中华战舞/);
  assert.match(registry, /读懂一纸吉语/);
});

test('HomeClaims / CultureGateway / HomeTrust render spec copy', () => {
  const claims = readFileSync(new URL('src/components/site/HomeClaims.tsx', root), 'utf8');
  assert.match(claims, /壹/);
  assert.match(claims, /在地线索/);
  assert.match(claims, /可核来源/);
  const gateway = readFileSync(new URL('src/components/site/CultureGateway.tsx', root), 'utf8');
  assert.match(gateway, /圣杯怎么看/);
  assert.match(gateway, /\/culture\/jiaobei\//);
  assert.match(gateway, /\/culture\/yingge\//);
  assert.match(gateway, /\/culture\/jianzhi\//);
  const trust = readFileSync(new URL('src/components/site/HomeTrust.tsx', root), 'utf8');
  assert.match(trust, /TRUST_METRICS/);
  assert.match(trust, /SITE_DISCLAIMER/);
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm test`
Expected: FAIL — `ENOENT` 读不到 `ExhibitSection.tsx`

- [ ] **Step 3: 更新 gamesRegistry taglines(spec 文案)**

`src/core/gamesRegistry.ts` 三处 tagline 改为:

```ts
// shantou-jiaobei:
    tagline: '双手合十,掷筊问愿——圣杯、笑杯、阴杯,看神明如何回你。',
// chaoshan-yingge:
    tagline: '听鼓落槌,随队而行——在节奏与队形中认识「中华战舞」。',
// jianzhi:
    tagline: '跟纸灵学徒:读帖、折剪、展开,读懂一纸吉语。',
```

- [ ] **Step 4: 实现 GallerySectionHeader.tsx**

```tsx
export function GallerySectionHeader({
  index,
  title,
  note,
}: {
  index: string;
  title: string;
  note?: string;
}) {
  return (
    <div className="gsh">
      <span className="gsh__index">{index}</span>
      <h2 className="gsh__title">{title}</h2>
      {note ? <span className="gsh__note">{note}</span> : null}
    </div>
  );
}
```

- [ ] **Step 5: 实现 ExhibitSection.tsx**

```tsx
import Link from 'next/link';
import type { GameMeta } from '@/core/gamesRegistry';
import { Reveal } from './Reveal';

const EXHIBIT_META: Record<string, { no: string; tags: string; playLabel: string; cultureLabel: string }> = {
  'shantou-jiaobei': { no: 'No.01', tags: '3D 物理 · 手势可选', playLabel: '开始占卜', cultureLabel: '掷筊怎么看' },
  'chaoshan-yingge': { no: 'No.02', tags: '节奏判定 · 横版动作', playLabel: '加入巡游', cultureLabel: '英歌的脸谱与角色' },
  jianzhi: { no: 'No.03', tags: '折剪展开 · 图鉴收集', playLabel: '开始创作', cultureLabel: '纹样里的吉祥话' },
};

function ExhibitGlyph({ id }: { id: string }) {
  if (id === 'shantou-jiaobei') {
    return (
      <svg viewBox="0 0 70 46" role="img" aria-label="筊杯">
        <path d="M14 4 a26 26 0 0 0 0 38 a20 20 0 0 1 0 -38z" fill="#C9A24B" />
        <path d="M56 4 a26 26 0 0 1 0 38 a20 20 0 0 0 0 -38z" fill="#C9A24B" opacity="0.85" />
      </svg>
    );
  }
  if (id === 'chaoshan-yingge') {
    return (
      <svg viewBox="0 0 80 56" role="img" aria-label="英歌双槌与鼓">
        <rect x="8" y="4" width="7" height="46" rx="3.5" fill="#E8CF9A" transform="rotate(18 11 27)" />
        <rect x="65" y="4" width="7" height="46" rx="3.5" fill="#E8CF9A" transform="rotate(-18 68 27)" />
        <circle cx="40" cy="34" r="16" fill="none" stroke="#C82E21" strokeWidth="4" />
        <circle cx="40" cy="34" r="5" fill="#C9A24B" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="剪纸红菱">
      <polygon points="32,2 62,32 32,62 2,32" fill="#C82E21" />
      <polygon points="32,14 50,32 32,50 14,32" fill="#150C07" />
      <polygon points="32,22 42,32 32,42 22,32" fill="#D23627" />
    </svg>
  );
}

export function ExhibitSection({
  game,
  index,
  cultureHref,
}: {
  game: GameMeta;
  index: number;
  cultureHref: string;
}) {
  const meta = EXHIBIT_META[game.id] ?? {
    no: `No.0${index + 1}`,
    tags: '',
    playLabel: '开始游玩',
    cultureLabel: '文化导读',
  };

  return (
    <Reveal className={`exhibit ${index % 2 === 1 ? 'exhibit--rev' : ''}`}>
      <div className={`exhibit__visual exhibit__visual--${game.id}`}>
        <ExhibitGlyph id={game.id} />
      </div>
      <div className="exhibit__copy">
        <p className="exhibit__no">
          展品 {meta.no}
          {meta.tags ? ` · ${meta.tags}` : ''}
        </p>
        <h3 className="exhibit__name">{game.name}</h3>
        <p className="exhibit__tagline">{game.tagline}</p>
        <p className="exhibit__links">
          <Link className="exhibit__play" href={game.href}>
            {meta.playLabel} →
          </Link>
          <Link className="exhibit__culture" href={cultureHref}>
            文化导读:{meta.cultureLabel}
          </Link>
        </p>
      </div>
    </Reveal>
  );
}
```

- [ ] **Step 6: 实现 HomeClaims.tsx / CultureGateway.tsx / HomeTrust.tsx**

```tsx
// src/components/site/HomeClaims.tsx
import { Reveal } from './Reveal';

const CLAIMS = [
  { n: '壹', t: '在地线索', d: '以潮汕掷筊、英歌与通行剪纸吉语为线索,保留地区差异,不编「标准答案」。' },
  { n: '贰', t: '可玩展品', d: '3D 筊杯、节奏合槌、折剪展读——用交互建立记忆,而不是只读长文。' },
  { n: '叁', t: '可核来源', d: '每篇导读附快速回答、FAQ 与外链来源,区分常见说法与游戏设计。' },
];

export function HomeClaims() {
  return (
    <div className="claims">
      {CLAIMS.map((c, i) => (
        <Reveal key={c.t} className="claims__item" delay={i * 90}>
          <span className="claims__n">{c.n}</span>
          <h3>{c.t}</h3>
          <p>{c.d}</p>
        </Reveal>
      ))}
    </div>
  );
}
```

```tsx
// src/components/site/CultureGateway.tsx
import Link from 'next/link';
import { Reveal } from './Reveal';

const GATEWAYS = [
  {
    q: '掷筊 · 圣杯怎么看?',
    teaser: '一平一凸为圣杯,两平为笑杯……快速回答 + 判读口诀 + 线上与庙里的差别。',
    count: '3 篇导读',
    href: '/culture/jiaobei/',
  },
  {
    q: '英歌 · 为什么叫「战舞」?',
    teaser: '脸谱、槌法、队形——从水浒角色到巡游节奏,一次讲清。',
    count: '2 篇导读',
    href: '/culture/yingge/',
  },
  {
    q: '剪纸 · 纹样里的吉祥话',
    teaser: '莲年有余、喜上眉梢——每个纹样都是一句可以剪出来的祝福。',
    count: '2 篇导读',
    href: '/culture/jianzhi/',
  },
];

export function CultureGateway() {
  return (
    <div className="gateway">
      {GATEWAYS.map((g, i) => (
        <Reveal key={g.href} delay={i * 90}>
          <Link className="gateway__card" href={g.href}>
            <span className="gateway__q">{g.q}</span>
            <span className="gateway__teaser">{g.teaser}</span>
            <span className="gateway__count">{g.count} →</span>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
```

```tsx
// src/components/site/HomeTrust.tsx
import { SITE_DISCLAIMER, TRUST_METRICS } from '@/content/site';

export function HomeTrust() {
  return (
    <div className="trust">
      <ul className="trust__metrics">
        {TRUST_METRICS.map((m) => (
          <li key={m.label}>
            <strong>{m.value}</strong>
            <span>{m.label}</span>
          </li>
        ))}
      </ul>
      <p className="trust__disclaimer">{SITE_DISCLAIMER}</p>
    </div>
  );
}
```

- [ ] **Step 7: gallery.css 追加区块样式**

```css
/* —— GallerySectionHeader —— */
.gsh {
  display: flex;
  align-items: baseline;
  gap: 18px;
  margin-bottom: 3.5rem;
  padding-top: 1.2rem;
  border-top: 1px solid rgba(201, 162, 75, 0.35);
}
.gsh__index {
  font-size: 12px;
  letter-spacing: 0.25em;
  color: var(--g-gold);
}
.gsh__title {
  margin: 0;
  font-family: var(--g-font-display);
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  letter-spacing: 0.06em;
  color: var(--g-text-hi);
}
.gsh__note {
  margin-left: auto;
  font-size: 11px;
  letter-spacing: 0.12em;
  color: var(--g-text-dim);
}

/* —— S2 展品展签 —— */
.exhibit {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  align-items: center;
  gap: clamp(2rem, 6vw, 5rem);
  padding-block: 3.5rem;
}
.exhibit--rev {
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
}
.exhibit--rev .exhibit__visual {
  order: 2;
}
.exhibit__visual {
  position: relative;
  aspect-ratio: 8 / 5;
  border: 1px solid rgba(201, 162, 75, 0.2);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.exhibit__visual svg {
  width: 34%;
  height: auto;
  filter: drop-shadow(0 18px 30px rgba(0, 0, 0, 0.5));
}
.exhibit__visual--shantou-jiaobei {
  background: radial-gradient(100% 120% at 30% 20%, #3a140e 0%, #160d08 70%);
}
.exhibit__visual--chaoshan-yingge {
  background: radial-gradient(100% 120% at 70% 20%, #2a1014 0%, #140b07 70%);
}
.exhibit__visual--jianzhi {
  background: radial-gradient(100% 120% at 50% 0%, #35100c 0%, #150c07 70%);
}
.exhibit__no {
  margin: 0 0 0.7rem;
  font-size: 11px;
  letter-spacing: 0.3em;
  color: var(--g-gold);
}
.exhibit__name {
  margin: 0 0 0.8rem;
  font-family: var(--g-font-display);
  font-size: clamp(1.5rem, 3vw, 2.1rem);
  letter-spacing: 0.05em;
  color: var(--g-text-hi);
}
.exhibit__tagline {
  margin: 0 0 1.4rem;
  max-width: 30rem;
  font-size: 15px;
  line-height: 1.85;
  color: var(--g-text);
}
.exhibit__links {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 1.4rem;
  align-items: center;
}
.exhibit__play {
  font-size: 13px;
  letter-spacing: 0.2em;
  color: var(--g-cinnabar-hi);
  transition: transform var(--g-dur-micro) var(--g-ease);
  display: inline-block;
}
.exhibit__play:hover {
  transform: translateX(4px);
}
.exhibit__culture {
  font-size: 12px;
  letter-spacing: 0.1em;
  color: rgba(201, 162, 75, 0.8);
  border-bottom: 1px solid rgba(201, 162, 75, 0.35);
  padding-bottom: 2px;
}
.exhibit__culture:hover {
  color: var(--g-gold-hi);
}
@media (max-width: 760px) {
  .exhibit,
  .exhibit--rev {
    grid-template-columns: 1fr;
    gap: 1.4rem;
  }
  .exhibit--rev .exhibit__visual {
    order: 0;
  }
}

/* —— S3 价值主张 —— */
.claims {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(1.5rem, 4vw, 3rem);
}
.claims__item {
  border-top: 1px solid rgba(201, 162, 75, 0.35);
  padding-top: 1.1rem;
}
.claims__n {
  font-family: var(--g-font-display);
  font-size: 26px;
  color: var(--g-cinnabar-hi);
}
.claims__item h3 {
  margin: 0.5rem 0 0.4rem;
  font-family: var(--g-font-display);
  font-size: 18px;
  letter-spacing: 0.12em;
  color: var(--g-text-hi);
}
.claims__item p {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.8;
  color: var(--g-text);
}
@media (max-width: 760px) {
  .claims {
    grid-template-columns: 1fr;
  }
}

/* —— S4 文化馆入口 —— */
.gateway {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.2rem;
}
.gateway__card {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  height: 100%;
  padding: 1.4rem 1.3rem;
  background: var(--g-float);
  border: 1px solid rgba(201, 162, 75, 0.18);
  border-radius: 6px;
  transition:
    transform var(--g-dur-micro) var(--g-ease),
    border-color var(--g-dur-micro) var(--g-ease);
}
.gateway__card:hover {
  transform: translateY(-4px);
  border-color: rgba(201, 162, 75, 0.45);
}
.gateway__q {
  font-family: var(--g-font-display);
  font-size: 17px;
  letter-spacing: 0.04em;
  color: var(--g-text-hi);
}
.gateway__teaser {
  flex: 1;
  font-size: 12.5px;
  line-height: 1.8;
  color: var(--g-text);
}
.gateway__count {
  font-size: 11px;
  letter-spacing: 0.18em;
  color: var(--g-gold);
}
@media (max-width: 760px) {
  .gateway {
    grid-template-columns: 1fr;
  }
}

/* —— S5 信任条 —— */
.trust {
  display: flex;
  align-items: center;
  gap: clamp(1.5rem, 5vw, 3.5rem);
}
.trust__metrics {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  gap: clamp(1.5rem, 4vw, 3rem);
}
.trust__metrics li {
  display: grid;
  gap: 0.2rem;
}
.trust__metrics strong {
  font-family: var(--g-font-display);
  font-size: 28px;
  font-weight: 600;
  color: var(--g-gold);
}
.trust__metrics span {
  font-size: 11px;
  letter-spacing: 0.1em;
  color: var(--g-text-dim);
}
.trust__disclaimer {
  margin: 0;
  flex: 1;
  min-width: 16rem;
  border-left: 1px solid rgba(201, 162, 75, 0.25);
  padding-left: 1.6rem;
  font-size: 12px;
  line-height: 1.8;
  color: var(--g-text-dim);
}
@media (max-width: 860px) {
  .trust {
    flex-direction: column;
    align-items: flex-start;
  }
  .trust__disclaimer {
    border-left: 0;
    padding-left: 0;
  }
}
```

- [ ] **Step 8: 跑测试确认通过**

Run: `pnpm test`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add src/components/site/GallerySectionHeader.tsx src/components/site/ExhibitSection.tsx src/components/site/HomeClaims.tsx src/components/site/CultureGateway.tsx src/components/site/HomeTrust.tsx src/core/gamesRegistry.ts src/styles/gallery.css tests/home-sections.test.ts
git commit -m "feat(site): 首页 S2-S5 区块组件与 spec 文案"
```

---

### Task 6: 首页/关于页换装 + metadata/manifest 更新

**Files:**
- Modify: `app/page.tsx`(整文件重写)
- Modify: `app/about/page.tsx:31-34,67`(换壳)
- Modify: `app/layout.tsx:7-72`(title/description/OG/themeColor)
- Modify: `public/manifest.json:2-8`
- Modify: `src/styles/gallery.css`(追加 `.g-doc` 段)
- Test: `tests/home-ia.test.ts`(整文件重写)

**Interfaces:**
- Consumes: Task 3–5 全部组件;`JsonLd`(`@/components/site/JsonLd`,props `{ data: object }`)。

- [ ] **Step 1: 重写 home-ia.test.ts(失败在先)**

```ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('home page uses gallery shell and keeps exhibits anchor + JsonLd', () => {
  const src = readFileSync(new URL('app/page.tsx', root), 'utf8');
  assert.match(src, /theme-gallery/);
  assert.match(src, /GalleryHeader/);
  assert.match(src, /GalleryFooter/);
  assert.match(src, /id="exhibits"/);
  assert.match(src, /JsonLd/);
  assert.match(src, /CultureGateway/);
  assert.doesNotMatch(src, /theme-museum/);
});

test('about page switched to gallery shell', () => {
  const src = readFileSync(new URL('app/about/page.tsx', root), 'utf8');
  assert.match(src, /theme-gallery/);
  assert.match(src, /GalleryHeader/);
  assert.doesNotMatch(src, /theme-museum/);
});

test('site title drops cheap wording', () => {
  const layout = readFileSync(new URL('app/layout.tsx', root), 'utf8');
  assert.match(layout, /可玩的民俗文化馆/);
  assert.doesNotMatch(layout, /趣玩/);
  const manifest = readFileSync(new URL('public/manifest.json', root), 'utf8');
  assert.match(manifest, /可玩的民俗文化馆/);
  assert.doesNotMatch(manifest, /趣玩/);
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm test`
Expected: FAIL — `theme-gallery` / `趣玩` 断言不过

- [ ] **Step 3: 整文件重写 app/page.tsx**

```tsx
import type { Metadata } from 'next';
import { games } from '@/core/gamesRegistry';
import { CultureGateway } from '@/components/site/CultureGateway';
import { ExhibitSection } from '@/components/site/ExhibitSection';
import { GalleryFooter } from '@/components/site/GalleryFooter';
import { GalleryHeader } from '@/components/site/GalleryHeader';
import { GallerySectionHeader } from '@/components/site/GallerySectionHeader';
import { HomeClaims } from '@/components/site/HomeClaims';
import { HomeHero } from '@/components/site/HomeHero';
import { HomeTrust } from '@/components/site/HomeTrust';
import { JsonLd } from '@/components/site/JsonLd';
import { SITE_ORIGIN } from '@/content/site';

const CULTURE_BY_GAME: Record<string, string> = {
  'shantou-jiaobei': '/culture/jiaobei/',
  'chaoshan-yingge': '/culture/yingge/',
  jianzhi: '/culture/jianzhi/',
};

export const metadata: Metadata = {
  title: { absolute: 'rex-game · 可玩的民俗文化馆' },
  description:
    '一座可以玩的中国民艺馆:潮汕圣杯占卜、潮汕英歌、中国剪纸——三件民俗展品无需下载即开即玩,文化说明可检索。',
  openGraph: {
    title: 'rex-game · 可玩的民俗文化馆',
    description: '一座可以玩的中国民艺馆:掷筊问愿、英歌合槌、折剪生花。',
    url: SITE_ORIGIN,
  },
};

export default function HomePage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'rex-game',
        url: `${SITE_ORIGIN}/`,
        description: '一座可以玩的中国民艺馆:浏览器即开即玩的民俗互动展品与文化导读。',
        inLanguage: 'zh-CN',
        publisher: {
          '@type': 'Organization',
          name: 'rex-game',
          url: `${SITE_ORIGIN}/`,
          logo: { '@type': 'ImageObject', url: `${SITE_ORIGIN}/favicon.svg` },
        },
      },
      {
        '@type': 'ItemList',
        itemListElement: games.map((g, index) => {
          const href = g.href.endsWith('/') ? g.href : `${g.href}/`;
          return {
            '@type': 'ListItem',
            position: index + 1,
            url: `${SITE_ORIGIN}${href}`,
            name: g.name,
            description: g.tagline,
            image: `${SITE_ORIGIN}${g.cover}`,
          };
        }),
      },
    ],
  };

  return (
    <div className="theme-gallery">
      <JsonLd data={structuredData} />
      <GalleryHeader ctaHref={games[0]?.href} ctaLabel="进入展厅" />
      <main>
        <HomeHero />

        <section className="g-section g-container" id="exhibits" aria-labelledby="exhibits-title">
          <GallerySectionHeader index="〇一" title="三件可玩,三道门径" note="每个游戏 = 一件可玩展品" />
          <h2 id="exhibits-title" className="visually-hidden">
            展品列表
          </h2>
          {games.map((game, i) => (
            <ExhibitSection
              key={game.id}
              game={game}
              index={i}
              cultureHref={CULTURE_BY_GAME[game.id] ?? '/culture/'}
            />
          ))}
        </section>

        <section className="g-section g-container" aria-labelledby="why-title">
          <GallerySectionHeader index="〇二" title="为何在此" />
          <h2 id="why-title" className="visually-hidden">
            为什么在浏览器里学民俗
          </h2>
          <HomeClaims />
        </section>

        <section className="g-section g-container" aria-labelledby="gateway-title">
          <GallerySectionHeader index="〇三" title="玩完,读懂它" note="9 篇文化导读,持续扩充" />
          <h2 id="gateway-title" className="visually-hidden">
            文化馆入口
          </h2>
          <CultureGateway />
        </section>

        <section className="g-section g-container" aria-labelledby="trust-title">
          <GallerySectionHeader index="〇四" title="娱乐展示,不作人生裁决" />
          <h2 id="trust-title" className="visually-hidden">
            信任与声明
          </h2>
          <HomeTrust />
        </section>
      </main>
      <GalleryFooter />
    </div>
  );
}
```

- [ ] **Step 4: about/page.tsx 换壳**

- `import { SiteFooter }` → `import { GalleryFooter } from '@/components/site/GalleryFooter';`
- `import { SiteHeader }` → `import { GalleryHeader } from '@/components/site/GalleryHeader';`
- 第 31 行 `<div className="theme-museum site-root">` → `<div className="theme-gallery">`
- 第 33 行 `<SiteHeader />` → `<GalleryHeader />`
- 第 34 行 `<main className="culture-doc">` → `<main className="g-doc">`
- 第 35 行 `<p className="site-hero__kicker">关于</p>` → `<p className="g-label">关于</p>`
- 第 67 行 `<SiteFooter />` → `<GalleryFooter />`

- [ ] **Step 5: gallery.css 追加 .g-doc(关于页暗场文档样式)**

```css
/* —— 关于页暗场文档 —— */
.g-doc {
  max-width: 44rem;
  margin-inline: auto;
  padding: 5rem 4vw 7rem;
}
.g-doc h1 {
  margin: 0.6rem 0 1.6rem;
  font-family: var(--g-font-display);
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1.2;
  letter-spacing: 0.04em;
  color: var(--g-text-hi);
}
.g-doc h2 {
  margin: 2.8rem 0 0.7rem;
  font-family: var(--g-font-display);
  font-size: 1.35rem;
  letter-spacing: 0.1em;
  color: var(--g-gold);
}
.g-doc p {
  margin: 0 0 1.1rem;
  color: var(--g-text);
}
.g-doc strong {
  color: var(--g-cream);
}
.g-doc a {
  color: var(--g-gold);
  text-decoration: underline;
  text-underline-offset: 4px;
}
.g-doc a:hover {
  color: var(--g-gold-hi);
}
```

- [ ] **Step 6: layout.tsx metadata 更新**

- 第 10 行 `default: 'rex-game · 趣玩小游戏站'` → `default: 'rex-game · 可玩的民俗文化馆'`
- 第 13-14 行 description → `'一座可以玩的中国民艺馆:潮汕圣杯占卜、潮汕英歌、中国剪纸——可玩展品与可检索文化导读,无需下载,即开即玩。'`
- 第 50 行 openGraph.title → `'rex-game · 可玩的民俗文化馆'`
- 第 51 行 openGraph.description → `'一座可以玩的中国民艺馆:掷筊问愿、英歌合槌、折剪生花,即开即玩。'`
- 第 64-65 行 twitter.title/description 同上两句
- 第 71 行 `themeColor: '#17100b'` → `themeColor: '#0A0705'`
- (OG images 在任务 8 才换,本步不动。)

- [ ] **Step 7: manifest.json 更新**

```json
{
  "name": "rex-game · 可玩的民俗文化馆",
  "short_name": "rex-game",
  "description": "一座可以玩的中国民艺馆:浏览器即开即玩的民俗互动展品与文化导读。",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0A0705",
  "theme_color": "#0A0705",
  "orientation": "portrait-primary",
  "scope": "/",
  "lang": "zh-CN",
  "icons": [
    {
      "src": "/favicon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ]
}
```

- [ ] **Step 8: 跑测试确认通过**

Run: `pnpm test`
Expected: PASS(注意 `seo-jsonld.test.ts`/`sitemap-routes.test.ts` 等旧测试仍应全绿;若旧测试断言了「趣玩」等旧文案,同步更新该断言为新文案)

- [ ] **Step 9: Commit**

```bash
git add app/page.tsx app/about/page.tsx app/layout.tsx public/manifest.json src/styles/gallery.css tests/home-ia.test.ts
git commit -m "feat(site): 首页/关于页切换 v2 暗场外壳,门面文案去廉价化"
```

---

### Task 7: 字体自托管(思源宋体/黑体子集)

**Files:**
- Create: `scripts/extract-charset.mjs`
- Create: `scripts/fonts-subset.sh`
- Create: `public/fonts/NotoSerifSC-subset.woff2`、`public/fonts/NotoSansSC-subset.woff2`(脚本产物)
- Modify: `src/styles/tokens.css`(追加 `@font-face`)
- Modify: `app/layout.tsx:77-89`(`<head>` 字体链接)
- Modify: `package.json:6-14`(加 `fonts` script)
- Test: `tests/fonts-selfhost.test.ts`

**Interfaces:**
- Produces: `pnpm fonts` 命令(提字 + 子集化);`/fonts/*.woff2` 静态资产;`@font-face` family 名沿用 `'Noto Serif SC'`/`'Noto Sans SC'` —— 既有 CSS 字体栈零改动。

- [ ] **Step 1: 写失败测试**

```ts
// tests/fonts-selfhost.test.ts
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('self-hosted font subsets exist and stay small', () => {
  for (const name of ['NotoSerifSC-subset.woff2', 'NotoSansSC-subset.woff2']) {
    const p = new URL(`public/fonts/${name}`, root);
    assert.ok(existsSync(p), `${name} missing — run: pnpm fonts`);
    const size = statSync(p).size;
    assert.ok(size > 30_000 && size < 1_500_000, `${name} unexpected size ${size}`);
  }
});

test('layout no longer loads Google Fonts; tokens declare @font-face', () => {
  const layout = readFileSync(new URL('app/layout.tsx', root), 'utf8');
  assert.doesNotMatch(layout, /fonts\.googleapis\.com/);
  assert.doesNotMatch(layout, /fonts\.gstatic\.com/);
  const tokens = readFileSync(new URL('src/styles/tokens.css', root), 'utf8');
  assert.match(tokens, /@font-face/);
  assert.match(tokens, /NotoSerifSC-subset\.woff2/);
  assert.match(tokens, /NotoSansSC-subset\.woff2/);
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm test`
Expected: FAIL — `missing — run: pnpm fonts`

- [ ] **Step 3: 安装子集工具链**

Run: `python3 -m pip install --user fonttools brotli`
Expected: `Successfully installed fonttools-... brotli-...`(若系统 Python 报 externally-managed,改用 `python3 -m venv .venv-fonts && .venv-fonts/bin/pip install fonttools brotli`,后续命令把 `python3 -m fontTools.subset` 换成 `.venv-fonts/bin/python -m fontTools.subset`)

- [ ] **Step 4: 创建 scripts/extract-charset.mjs**

```js
// 从站点源码提取用字 → scripts/font-charset.txt(供 pyftsubset --text-file)
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const files = execSync(
  "git ls-files 'app/*.ts' 'app/*.tsx' 'src/*.ts' 'src/*.tsx' 'public/manifest.json'",
  { encoding: 'utf8' },
)
  .trim()
  .split('\n');

const chars = new Set();
for (let i = 0x20; i <= 0x7e; i += 1) chars.add(String.fromCharCode(i)); // ASCII 可见字符
for (const c of '　、。,「」『』《》〈〉【】…—～·:;!?()[]{}%#@&*+-/=→←↑↓〇壹贰叁肆伍陆柒捌玖') chars.add(c);

for (const file of files) {
  const text = readFileSync(file, 'utf8');
  for (const c of text) {
    if ((c.codePointAt(0) ?? 0) > 0x2000) chars.add(c); // CJK 与全角符号
  }
}

writeFileSync('scripts/font-charset.txt', [...chars].join(''));
console.log(`charset: ${chars.size} chars -> scripts/font-charset.txt`);
```

- [ ] **Step 5: 创建 scripts/fonts-subset.sh**

```bash
#!/usr/bin/env bash
# 思源宋体/黑体(可变字重)→ 按 scripts/font-charset.txt 子集化为 woff2
set -euo pipefail
cd "$(dirname "$0")/.."

SRC=resources/fonts-src
OUT=public/fonts
mkdir -p "$SRC" "$OUT"

SERIF="$SRC/NotoSerifSC-VF.ttf"
SANS="$SRC/NotoSansSC-VF.ttf"
[ -f "$SERIF" ] || curl -fL "https://github.com/google/fonts/raw/main/ofl/notoserifsc/NotoSerifSC%5Bwght%5D.ttf" -o "$SERIF"
[ -f "$SANS" ] || curl -fL "https://github.com/google/fonts/raw/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf" -o "$SANS"

node scripts/extract-charset.mjs

python3 -m fontTools.subset "$SERIF" \
  --text-file=scripts/font-charset.txt \
  --flavor=woff2 \
  --output-file="$OUT/NotoSerifSC-subset.woff2" \
  --layout-features='*' --no-hinting --desubroutinize

python3 -m fontTools.subset "$SANS" \
  --text-file=scripts/font-charset.txt \
  --flavor=woff2 \
  --output-file="$OUT/NotoSansSC-subset.woff2" \
  --layout-features='*' --no-hinting --desubroutinize

ls -lh "$OUT"
```

Run: `chmod +x scripts/fonts-subset.sh`

- [ ] **Step 6: package.json 加 script 并执行**

`package.json` scripts 块加一行(放 `test` 之后):

```json
    "fonts": "bash scripts/fonts-subset.sh",
```

Run: `pnpm fonts`
Expected: 输出 `charset: N chars`,生成两个 woff2,每个约 100KB–1MB;`ls -lh` 可见

- [ ] **Step 7: tokens.css 追加 @font-face**

```css
/* —— 自托管字体子集(pnpm fonts 生成) —— */
@font-face {
  font-family: 'Noto Serif SC';
  src: url('/fonts/NotoSerifSC-subset.woff2') format('woff2');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Noto Sans SC';
  src: url('/fonts/NotoSansSC-subset.woff2') format('woff2');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}
```

- [ ] **Step 8: layout.tsx 移除 Google Fonts、改为 preload 自托管**

`app/layout.tsx` 的 `<head>` 内容(第 77-89 行)整体替换为:

```tsx
      <head>
        {/* 自托管字体子集(public/fonts,pnpm fonts 生成):preload 展示 serif,正文 sans 随 @font-face swap */}
        <link
          rel="preload"
          href="/fonts/NotoSerifSC-subset.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
```

- [ ] **Step 9: 跑测试确认通过**

Run: `pnpm test`
Expected: PASS

- [ ] **Step 10: Commit**

```bash
git add scripts/extract-charset.mjs scripts/fonts-subset.sh scripts/font-charset.txt public/fonts src/styles/tokens.css app/layout.tsx package.json tests/fonts-selfhost.test.ts
git commit -m "feat(styles): 思源宋体/黑体自托管子集,移除 Google Fonts 依赖"
```

(`resources/fonts-src/` 为 ~50MB 原字体缓存,在 `.gitignore` 追加一行 `resources/fonts-src/` 后一并提交。)

---

### Task 8: OG 分享卡(SVG → sharp → PNG)

**Files:**
- Create: `scripts/generate-og.mjs`
- Create: `public/assets/og-home.png`(脚本产物)
- Modify: `app/layout.tsx:53-66`(OG/Twitter images 与文案)
- Modify: `package.json`(加 `og` script)
- Test: `tests/og-card.test.ts`

**Interfaces:**
- Produces: `pnpm og` 命令;`/assets/og-home.png`(1200×630);layout OG 引用该图。

- [ ] **Step 1: 写失败测试**

```ts
// tests/og-card.test.ts
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('og-home.png exists and is 1200x630', () => {
  const p = new URL('public/assets/og-home.png', root);
  assert.ok(existsSync(p), 'og-home.png missing — run: pnpm og');
  const buf = readFileSync(p);
  assert.equal(buf.readUInt32BE(16), 1200, 'PNG width');
  assert.equal(buf.readUInt32BE(20), 630, 'PNG height');
});

test('layout OG/Twitter reference og-home.png with new copy', () => {
  const src = readFileSync(new URL('app/layout.tsx', root), 'utf8');
  assert.match(src, /\/assets\/og-home\.png/);
  assert.match(src, /可玩的民俗文化馆/);
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm test`
Expected: FAIL — `og-home.png missing`

- [ ] **Step 3: 创建 scripts/generate-og.mjs**

```js
// 首页 OG 分享卡 1200×630:暗场 + 主张 + 三符号(SVG → sharp → PNG)
// 生成后人工目检一次(CJK 字形依赖本机字体);产物提交入库,线上无需再生成。
import sharp from 'sharp';

const W = 1200;
const H = 630;

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="72%" cy="16%" r="85%">
      <stop offset="0%" stop-color="#C82E21" stop-opacity="0.38"/>
      <stop offset="55%" stop-color="#C82E21" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#0A0705"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <text x="80" y="140" font-family="serif" font-size="28" letter-spacing="12" fill="#C9A24B">可玩的民俗文化馆</text>
  <text x="80" y="290" font-family="serif" font-weight="700" font-size="96" fill="#F5EDE0">一座可以玩的</text>
  <text x="80" y="412" font-family="serif" font-weight="700" font-size="96" fill="#F5EDE0">中国<tspan fill="#E8452F">民艺馆</tspan></text>
  <text x="80" y="492" font-family="sans-serif" font-size="26" fill="#E8DCC4" opacity="0.72">掷筊问愿 · 英歌合槌 · 折剪生花 — 即开即玩</text>

  <g transform="translate(860,150)">
    <polygon points="120,0 240,120 120,240 0,120" fill="#C82E21"/>
    <polygon points="120,48 192,120 120,192 48,120" fill="#0A0705"/>
    <polygon points="120,82 158,120 120,158 82,120" fill="#D23627"/>
  </g>
  <path d="M884 486 a42 42 0 0 0 0 72 a32 32 0 0 1 0 -72z" fill="#C9A24B"/>
  <path d="M952 486 a42 42 0 0 1 0 72 a32 32 0 0 0 0 -72z" fill="#C9A24B" opacity="0.85"/>

  <text x="80" y="586" font-family="sans-serif" font-size="22" letter-spacing="6" fill="#C9A24B">REX-GAME · game.rexai.top</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile('public/assets/og-home.png');
console.log('public/assets/og-home.png (1200x630) generated');
```

- [ ] **Step 4: package.json 加 script 并执行**

scripts 块加(`fonts` 之后):

```json
    "og": "node scripts/generate-og.mjs",
```

Run: `pnpm og`
Expected: `public/assets/og-home.png (1200x630) generated`;人工目检图片无豆腐块

- [ ] **Step 5: layout.tsx OG/Twitter images 更新**

- 第 53-60 行 openGraph.images → `[{ url: '/assets/og-home.png', width: 1200, height: 630, alt: 'rex-game 可玩的民俗文化馆:一座可以玩的中国民艺馆' }]`
- 第 66 行 twitter.images → `['/assets/og-home.png']`

- [ ] **Step 6: 跑测试确认通过**

Run: `pnpm test`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add scripts/generate-og.mjs public/assets/og-home.png app/layout.tsx package.json tests/og-card.test.ts
git commit -m "feat(seo): 首页 OG 分享卡(SVG 渲染)+ OG 文案更新"
```

---

### Task 9: home.css 清理 + 全量验收

**Files:**
- Modify: `app/layout.tsx:5`(删 home.css import)
- Delete: `src/styles/home.css`
- Modify: `.gitignore`(追加 `resources/fonts-src/`,若任务 7 未加)

**Interfaces:**
- Consumes: 之前全部任务。

- [ ] **Step 1: 确认 home.css 无引用**

Run: `grep -rn "home-exhibit" app src --include="*.tsx" --include="*.ts" | wc -l`
Expected: `0`(所有 home.css class 均为 `.home-exhibit*`,零引用即安全)

- [ ] **Step 2: 删 import 与文件**

- `app/layout.tsx` 删除第 5 行 `import '@/styles/home.css';`
- `git rm src/styles/home.css`

- [ ] **Step 3: 全量测试**

Run: `pnpm test`
Expected: 全部 PASS

- [ ] **Step 4: 构建验收(先确认 pnpm dev 未在运行)**

Run: `pnpm build`
Expected: `✓ Generating static pages` 含 `/`、`/about`、全部 `/culture/*`、`/games/*`;无类型/链接错误

- [ ] **Step 5: 对照 spec §9 验收清单逐项核对**

- 首页五区块 + 页脚按 spec §7 文案落地(`pnpm preview` 或 dev 目检:首屏方向 C 观感、滚动显现、展签交替、移动端汉堡菜单)
- tokens 集中于 `tokens.css`,gallery 组件无散落硬编码色值(grep `#` `src/components/site/Gallery*`:只允许 SVG glyph 里的象征色)
- 文化页/游戏页零破版(打开 `/culture/jiaobei/`、`/games/shantou-jiaobei/` 目检)
- 无 Google Fonts 请求(devtools Network 或 `grep -r fonts.googleapis out/ | wc -l` = 0)
- OG 卡接入;`prefers-reduced-motion` 下动效退化(DevTools 模拟目检)

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx .gitignore
git rm src/styles/home.css
git commit -m "chore(styles): 删除遗留 home.css,完成 v2 首页切换"
```

---

## Self-Review 记录

- **Spec 覆盖:** §6.1 色 tokens → T1;§6.2 字 → T1+T7;§6.3 距 → T1(`--g-section-gap`);§6.4 材质 → T1(光晕)/T4(装置)/T8(OG),洒金纹理列为后续增强不阻塞;§6.5 动效 → T1(降级)+T2+T4;§7 S1–S5+页脚+门面 SEO → T4/T5/T6/T8;§8.1 组件 → T2–T5;§8.2 并存 → T6(museum.css 保留、文化页零改动);§8.3 字体 → T7;§8.4 图片管线/OG → T8;§8.5 不变项 → Global Constraints;§9 验收 → T9。
- **占位符:** 无 TBD/TODO;所有步骤含完整代码或精确命令。
- **类型一致:** `Reveal({children,className?,delay?})` 在 T2 定义、T5 消费一致;`GallerySectionHeader({index,title,note?})` T5 定义、T6 消费一致;`@font-face` family 名与 tokens 字族栈一致(`'Noto Serif SC'`/`'Noto Sans SC'`)。
