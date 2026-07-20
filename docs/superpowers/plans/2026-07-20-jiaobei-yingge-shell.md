# 圣杯 / 英歌外壳对齐 v2 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用共享 `GameChrome` + `game-shell.css`（`--g-*`）把圣杯与英歌的沉浸式玩法壳对齐设计系统 v2，流程 / 引擎 / 页内 SEO 零改。

**Architecture:** 新建全局 `gs-*` 原语（顶栏、主次按钮、眉标、面板）；圣杯删除内联 `GameChrome` 并 token 化 `jiaobei.css` 壳层色；英歌非 playing 视图顶栏与主次按钮接 `gs-*`，module CSS 壳色改 token；playing HUD 仅对比度修补。

**Tech Stack:** React 19 Client Components、原生 CSS（全局 `game-shell.css` + 既有 module）、Next.js 静态导出、node:test 源码契约测试。

**Spec:** `docs/superpowers/specs/2026-07-20-jiaobei-yingge-shell-design.md`

## Global Constraints

- 不改 `physics/*`、`vision/*`、`runtime/*`、`core/*` 逻辑；无 localStorage key/schema 变更。
- 不改 `app/games/shantou-jiaobei/page.tsx` 与 `app/games/chaoshan-yingge/page.tsx` 的 SEO 长文区（导读/FAQ/来源）；允许无关空白除外的零 diff。
- 不挂 `GalleryHeader` / `GalleryFooter`；沉浸 Chrome only。
- 色/字/动效用 `--g-*`（`src/styles/tokens.css`）；壳 class 前缀 `gs-`。
- 测试：`pnpm test`；构建验收用隔离 worktree（主目录 dev 常占 3030，勿 `rm -rf .next`）。
- 提交：Conventional Commits。
- 大块 JSX 替换后立刻 `npx tsc --noEmit`（全角标点易导致 Edit 失配）。

## File map

| 路径 | 职责 |
|---|---|
| Create `src/components/game/GameChrome.tsx` | 共享沉浸顶栏 |
| Create `src/styles/game-shell.css` | `gs-*` 原语 |
| Create `tests/game-shell-contract.test.ts` | 共享壳契约 |
| Modify `src/games/shantou-jiaobei/JiaobeiGame.tsx` | 换共享 Chrome + import CSS |
| Modify `src/styles/jiaobei.css` | 删旧 chrome、壳层 token 化、接 gs 按钮 |
| Modify `src/games/shantou-jiaobei/scenes/IntroScene.tsx` | 主 CTA → `gs-btn gs-btn--primary` |
| Modify `src/games/shantou-jiaobei/scenes/ResultScene.tsx` | 操作钮 → `gs-btn*` |
| Modify `src/games/shantou-jiaobei/scenes/OfferingScene.tsx` | 完成/备用钮 → `gs-btn*`（仅 class） |
| Modify `src/games/chaoshan-yingge/YinggeGame.tsx` | 非 playing 顶栏/按钮 |
| Modify `src/games/chaoshan-yingge/YinggeGame.module.css` | 壳色 token、按钮样式让位全局 |
| Modify `tests/jiaobei-ui-contract.test.ts` | 若断言旧 `.chrome` 则更新为 `gs-` |
| Modify `tests/yingge-game.test.ts` | 追加壳 class 契约（可选同 Task 3） |

---

### Task 1: 共享 GameChrome + game-shell.css + 契约测试

**Files:**
- Create: `src/components/game/GameChrome.tsx`
- Create: `src/styles/game-shell.css`
- Create: `tests/game-shell-contract.test.ts`

**Interfaces:**
- Produces: `GameChrome({ title, edition?, backHref?, backLabel?, children })`；CSS 类：`gs-root` `gs-head` `gs-back` `gs-title` `gs-edition` `gs-body` `gs-btn` `gs-btn--primary` `gs-btn--ghost` `gs-eyebrow` `gs-panel`。

- [ ] **Step 1: 写失败测试**

```ts
// tests/game-shell-contract.test.ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('GameChrome exposes gs-head back title body', () => {
  const src = readFileSync(new URL('src/components/game/GameChrome.tsx', root), 'utf8');
  assert.match(src, /gs-head/);
  assert.match(src, /gs-back/);
  assert.match(src, /gs-title/);
  assert.match(src, /gs-body/);
  assert.match(src, /返回展厅/);
});

test('game-shell.css uses --g-* tokens and shell primitives', () => {
  const css = readFileSync(new URL('src/styles/game-shell.css', root), 'utf8');
  for (const sel of [
    '.gs-root',
    '.gs-head',
    '.gs-btn--primary',
    '.gs-btn--ghost',
    '.gs-eyebrow',
    '.gs-panel',
    'prefers-reduced-motion',
  ]) {
    assert.ok(css.includes(sel), `missing ${sel}`);
  }
  assert.match(css, /var\(--g-abyss\)|var\(--g-lacquer\)/);
  assert.match(css, /var\(--g-cinnabar\)/);
  assert.match(css, /var\(--g-gold\)/);
  // 壳主色不得整块硬编码另一套色板：允许 rgba 半透明，禁止独立 #hex 主色板行
  const hexColors = css.match(/#[0-9A-Fa-f]{3,8}/g) ?? [];
  assert.ok(
    hexColors.length === 0,
    `game-shell.css should not hardcode hex colors, found: ${hexColors.join(', ')}`,
  );
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `node --experimental-strip-types --test tests/game-shell-contract.test.ts`  
Expected: FAIL — files missing / ENOENT

- [ ] **Step 3: 创建 GameChrome.tsx**

```tsx
// src/components/game/GameChrome.tsx
import type { ReactNode } from 'react';

export interface GameChromeProps {
  title: string;
  edition?: string;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
}

/** 沉浸式游戏顶栏：返回展厅 / 标题 / 副标。class 前缀 gs-，样式见 game-shell.css */
export function GameChrome({
  title,
  edition,
  backHref = '/',
  backLabel = '返回展厅',
  children,
}: GameChromeProps) {
  return (
    <div className="gs-root">
      <header className="gs-head">
        <a className="gs-back" href={backHref} aria-label="返回首页">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
            <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {backLabel}
        </a>
        <h1 className="gs-title">{title}</h1>
        {edition ? <span className="gs-edition">{edition}</span> : <span className="gs-edition" />}
      </header>
      <div className="gs-body">{children}</div>
    </div>
  );
}
```

- [ ] **Step 4: 创建 game-shell.css**

```css
/* 游戏沉浸壳原语 —— Spec 4。仅 --g-* token，无硬编码 hex。
 * spec: docs/superpowers/specs/2026-07-20-jiaobei-yingge-shell-design.md
 */

.gs-root {
  min-height: 100dvh;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  color: var(--g-cream);
  background: var(--g-abyss);
  font-family: var(--g-font-body);
}

.gs-head {
  position: relative;
  z-index: 20;
  display: grid;
  grid-template-columns: minmax(8rem, 1fr) auto minmax(8rem, 1fr);
  align-items: center;
  min-height: 64px;
  padding: 0 clamp(1rem, 3vw, 3rem);
  color: var(--g-text);
  border-bottom: 1px solid color-mix(in srgb, var(--g-gold) 22%, transparent);
  background: color-mix(in srgb, var(--g-lacquer) 88%, transparent);
  backdrop-filter: blur(18px);
}

.gs-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  width: max-content;
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  color: inherit;
  text-decoration: none;
  transition: color var(--g-dur-micro) var(--g-ease);
}
.gs-back svg {
  width: 1rem;
  height: 1rem;
}
.gs-back:hover {
  color: var(--g-gold-hi);
}

.gs-title {
  margin: 0;
  color: var(--g-text-hi);
  font-family: var(--g-font-display);
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.28em;
  text-align: center;
}

.gs-edition {
  justify-self: end;
  font-size: 0.68rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--g-text-dim);
}

.gs-body {
  min-width: 0;
  min-height: 0;
}

.gs-eyebrow {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: var(--g-gold);
}

.gs-panel {
  border: 1px solid color-mix(in srgb, var(--g-gold) 22%, transparent);
  border-radius: var(--g-radius);
  background: var(--g-float);
}

.gs-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0.85rem 1.8rem;
  border: 1px solid transparent;
  border-radius: var(--g-radius);
  font-family: var(--g-font-body);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.18em;
  cursor: pointer;
  text-decoration: none;
  transition:
    transform var(--g-dur-micro) var(--g-ease),
    box-shadow var(--g-dur-micro) var(--g-ease),
    background var(--g-dur-micro) var(--g-ease),
    border-color var(--g-dur-micro) var(--g-ease),
    color var(--g-dur-micro) var(--g-ease);
}
.gs-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}
.gs-btn--primary {
  background: var(--g-cinnabar);
  color: var(--g-paper);
  box-shadow: 0 10px 30px color-mix(in srgb, var(--g-cinnabar) 40%, transparent);
}
.gs-btn--primary:hover:not(:disabled) {
  background: var(--g-cinnabar-hi);
  transform: translateY(-2px);
}
.gs-btn--ghost {
  border-color: color-mix(in srgb, var(--g-gold) 50%, transparent);
  color: var(--g-gold);
  background: transparent;
}
.gs-btn--ghost:hover:not(:disabled) {
  border-color: var(--g-gold);
  background: color-mix(in srgb, var(--g-gold) 10%, transparent);
  transform: translateY(-2px);
}

.gs-root :focus-visible {
  outline: 2px solid var(--g-gold);
  outline-offset: 3px;
}

@media (max-width: 640px) {
  .gs-head {
    grid-template-columns: auto 1fr;
    min-height: 56px;
  }
  .gs-title {
    justify-self: end;
    font-size: 0.86rem;
    letter-spacing: 0.18em;
  }
  .gs-edition {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .gs-btn,
  .gs-back {
    transition: none;
  }
  .gs-btn--primary:hover:not(:disabled),
  .gs-btn--ghost:hover:not(:disabled) {
    transform: none;
  }
}
```

- [ ] **Step 5: 跑测试确认通过**

Run: `node --experimental-strip-types --test tests/game-shell-contract.test.ts`  
Expected: PASS（2 tests）

- [ ] **Step 6: Commit**

```bash
git add src/components/game/GameChrome.tsx src/styles/game-shell.css tests/game-shell-contract.test.ts
git commit -m "feat(shell): GameChrome + game-shell.css 共享沉浸壳原语"
```

---

### Task 2: 圣杯接线 + jiaobei.css token 化

**Files:**
- Modify: `src/games/shantou-jiaobei/JiaobeiGame.tsx`
- Modify: `src/styles/jiaobei.css`（删除 `.chrome*`；`.jiaobei` 底色与字色接 token；`.jiaobei--result .gs-body` 替代 `.chrome__body`；壳层硬编码主色改为 `var(--g-*)` 或 `color-mix`）
- Modify: `src/games/shantou-jiaobei/scenes/IntroScene.tsx`（`btn btn--gold` → `gs-btn gs-btn--primary`）
- Modify: `src/games/shantou-jiaobei/scenes/OfferingScene.tsx`（完成钮等主 CTA → `gs-btn gs-btn--primary`；次要保持可读）
- Modify: `src/games/shantou-jiaobei/scenes/ResultScene.tsx`（`btn` / `btn--ghost` → `gs-btn*`）
- Modify: `tests/jiaobei-ui-contract.test.ts`（若有 `.chrome` 断言则改 `gs-`；无则追加 chrome 接线断言）

**Interfaces:**
- Consumes: `GameChrome`、`game-shell.css`
- Produces: 圣杯三阶段仍挂共享顶栏；edition 三句不变

- [ ] **Step 1: 写/扩展失败测试**

在 `tests/jiaobei-ui-contract.test.ts` 追加（或新建同文件内 test）：

```ts
test('JiaobeiGame uses shared GameChrome with gs- classes', () => {
  const game = readFileSync(new URL('../src/games/shantou-jiaobei/JiaobeiGame.tsx', import.meta.url), 'utf8');
  assert.match(game, /from ['"]@\/components\/game\/GameChrome['"]/);
  assert.match(game, /game-shell\.css/);
  assert.match(game, /<GameChrome/);
  assert.doesNotMatch(game, /function GameChrome/);
  assert.match(game, /展品 \/ 序章/);
  assert.match(game, /仪式进行中/);
  assert.match(game, /落杯已定/);
});

test('jiaobei intro primary CTA uses gs-btn', () => {
  const intro = readFileSync(new URL('../src/games/shantou-jiaobei/scenes/IntroScene.tsx', import.meta.url), 'utf8');
  assert.match(intro, /gs-btn\s+gs-btn--primary|gs-btn--primary/);
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `node --experimental-strip-types --test tests/jiaobei-ui-contract.test.ts`  
Expected: 新断言 FAIL

- [ ] **Step 3: 改写 JiaobeiGame.tsx**

完整替换文件内容为：

```tsx
'use client';

import { useCallback, useState } from 'react';
import { GameChrome } from '@/components/game/GameChrome';
import '@/styles/game-shell.css';
import { IntroScene } from './scenes/IntroScene';
import { OfferingScene } from './scenes/OfferingScene';
import { ResultScene } from './scenes/ResultScene';
import { sfx } from './audio/SfxManager';

/** 游戏阶段状态机 */
export type Phase = 'intro' | 'offering' | 'result';

/** 单次掷杯结果 */
export type CupResult = 'sheng' | 'xiao' | 'yin';

/** 心愿分类 */
export type WishCategory = '感情' | '事业' | '学业' | '财运' | '健康' | '其他';

export interface GameState {
  /** 玩家心愿文本（玩家在合十静心时默念，不强制输入） */
  wish: string;
  wishCategory: WishCategory;
  /** 三次掷杯结果 */
  throws: CupResult[];
}

const INITIAL: GameState = { wish: '', wishCategory: '其他', throws: [] };

const EDITION: Record<Phase, string> = {
  intro: '展品 / 序章',
  offering: '仪式进行中',
  result: '落杯已定',
};

/**
 * 潮汕圣杯占卜 —— 游戏根组件。
 * 流程：intro → offering(×3) → result
 */
export function JiaobeiGame() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [state, setState] = useState<GameState>(INITIAL);

  const go = useCallback((p: Phase) => setPhase(p), []);

  const handleThrow = useCallback(
    (result: CupResult) => {
      setState((s) => {
        const throws = [...s.throws, result];
        if (throws.length >= 3) {
          setTimeout(() => go('result'), 900);
        }
        return { ...s, throws };
      });
    },
    [go],
  );

  const restart = useCallback(() => {
    setState(INITIAL);
    setPhase('intro');
  }, []);

  return (
    <main className={`jiaobei jiaobei--${phase}`}>
      <GameChrome title="潮汕圣杯" edition={EDITION[phase]}>
        {phase === 'intro' && (
          <IntroScene
            onStart={() => {
              sfx.unlock();
              sfx.playPrepare();
              go('offering');
            }}
          />
        )}
        {phase === 'offering' && (
          <OfferingScene
            state={state}
            onThrow={handleThrow}
            onDone={() => go('result')}
            onWishChange={(wish) => setState((s) => ({ ...s, wish }))}
            onWishCategoryChange={(wishCategory) => setState((s) => ({ ...s, wishCategory }))}
          />
        )}
        {phase === 'result' && <ResultScene state={state} onRestart={restart} />}
      </GameChrome>
    </main>
  );
}
```

注意：`GameChrome` 已含 `gs-root`；外层保留 `jiaobei` 供场景 CSS 作用域。

- [ ] **Step 4: 更新场景按钮 class**

`IntroScene.tsx` 中开始按钮：

```tsx
<button className="gs-btn gs-btn--primary intro__start" onClick={onStart}>开始掷筊</button>
```

`ResultScene.tsx` 操作区：

```tsx
<button className="gs-btn gs-btn--primary" onClick={onRestart}>再问一次</button>
<a className="gs-btn gs-btn--ghost" href="/">回到展厅</a>
```

`OfferingScene.tsx` 中「查看神明解答」等主 CTA：

```tsx
<button className="gs-btn gs-btn--primary" onClick={onDone}>查看神明解答</button>
```

其它 `className="btn"` / `btn--gold` 主路径同样改为 `gs-btn gs-btn--primary`；次要描边改为 `gs-btn gs-btn--ghost`。保留 `offering__category` 等局部控件 class。

- [ ] **Step 5: jiaobei.css 壳层 token 化**

1. **删除** 全部 `.chrome` / `.chrome__*` 规则（约文件顶部 10–43 行及媒体查询内 `.chrome__*`）。
2. **替换** 结果页作用域：

```css
.jiaobei--result .gs-body {
  display: grid;
  place-items: center;
  padding: clamp(1rem, 4vw, 4rem);
}
```

（原 `.jiaobei--result .chrome__body`）

3. **`.jiaobei` 底色** 改为：

```css
.jiaobei {
  min-height: 100dvh;
  color: var(--g-cream);
  background:
    radial-gradient(circle at 72% 8%, color-mix(in srgb, var(--g-cinnabar) 18%, transparent), transparent 34%),
    radial-gradient(circle at 20% 86%, color-mix(in srgb, var(--g-gold) 10%, transparent), transparent 30%),
    var(--g-abyss);
}
```

4. 壳层高频字色/边线（intro 标题、eyebrow、按钮旁文案）优先改为 `var(--g-text-hi)` / `var(--g-text)` / `var(--g-text-dim)` / `var(--g-gold)`；**不要**为赶工重写整个 intro 电影装饰（丝绸/烟雾 gradient 可保留少量 rgba）。
5. 媒体查询内所有 `.chrome__*` 改为 `.gs-*` 或删除（顶栏响应式已由 `game-shell.css` 覆盖）。
6. `.result__actions .btn--ghost` 改为：

```css
.result__actions .gs-btn--ghost {
  /* 可空或仅微调；主样式在 game-shell */
}
```

7. `--font-display` / `--font-body` 若在 jiaobei 场景使用，改为 `var(--g-font-display)` / `var(--g-font-body)`（globals 若仍定义旧变量可并存，但壳层新写只用 `--g-font-*`）。

- [ ] **Step 6: 跑测试 + tsc**

```bash
node --experimental-strip-types --test tests/jiaobei-ui-contract.test.ts tests/game-shell-contract.test.ts
npx tsc --noEmit
```

Expected: PASS / 0 errors

- [ ] **Step 7: Commit**

```bash
git add src/games/shantou-jiaobei/JiaobeiGame.tsx \
  src/games/shantou-jiaobei/scenes/IntroScene.tsx \
  src/games/shantou-jiaobei/scenes/OfferingScene.tsx \
  src/games/shantou-jiaobei/scenes/ResultScene.tsx \
  src/styles/jiaobei.css \
  tests/jiaobei-ui-contract.test.ts
git commit -m "feat(jiaobei): 沉浸壳对齐 GameChrome 与 --g-* token"
```

---

### Task 3: 英歌非 playing 壳对齐

**Files:**
- Modify: `src/games/chaoshan-yingge/YinggeGame.tsx`
- Modify: `src/games/chaoshan-yingge/YinggeGame.module.css`
- Modify: `tests/yingge-game.test.ts`（追加壳契约）

**Interfaces:**
- Consumes: `GameChrome`、`gs-btn*`、`game-shell.css`
- Produces: menu/guide/chapters/settings/archive/result 顶栏同构或按钮统一；playing 布局结构不变

- [ ] **Step 1: 写失败测试**

在 `tests/yingge-game.test.ts` 末尾追加：

```ts
test('YinggeGame shell imports GameChrome and gs button classes on non-play views', () => {
  assert.match(gameSource, /from ['"]@\/components\/game\/GameChrome['"]/);
  assert.match(gameSource, /game-shell\.css/);
  assert.match(gameSource, /gs-btn--primary/);
  assert.match(gameSource, /gs-btn--ghost/);
  // menu 顶栏：可用 GameChrome 或 gs-head 结构
  assert.ok(
    gameSource.includes('<GameChrome') || gameSource.includes('gs-head'),
    'expected GameChrome or gs-head on yingge shell',
  );
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `node --experimental-strip-types --test tests/yingge-game.test.ts`  
Expected: 新 test FAIL

- [ ] **Step 3: YinggeGame.tsx 接线**

1. 文件顶部增加：

```tsx
import { GameChrome } from '@/components/game/GameChrome';
import '@/styles/game-shell.css';
```

2. **menu 视图**：将 `yg-start-rail` 整段 header 替换为包在 `GameChrome` 外或内：
   - 推荐结构：menu 仍用 `yg-start` 布局，但顶部用：

```tsx
{view === 'menu' && (
  <GameChrome title="潮汕英歌" edition={`已开放 ${progress.unlocked} / ${YINGGE_CHAPTERS.length}`}>
    <div className="yg-start">
      {/* 去掉原 yg-start-rail；保留 start-stage / poster / footer */}
      ...
    </div>
  </GameChrome>
)}
```

3. **guide / chapters / settings / archive / result**：凡带 `yg-guide-head` / `yg-masthead` 的顶栏，改为 `GameChrome`（title 固定「潮汕英歌」或该屏中文标题；edition 用原 eyebrow 短句，如 `HOW TO PLAY` → 可简化为 `巡游手册` / `章节选择` / `文化档案` / `设置` / `演出结果`）。

   edition 建议映射：

| view | title | edition |
|---|---|---|
| menu | 潮汕英歌 | `已开放 n / N` |
| guide | 潮汕英歌 | 巡游手册 |
| chapters | 潮汕英歌 | 章节选择 |
| settings | 潮汕英歌 | 游戏设置 |
| archive | 潮汕英歌 | 文化档案 |
| result | 潮汕英歌 | 演出结果 |
| playing | （可不套 GameChrome，保留局内返回） | — |

4. **按钮 class 批量替换**（非 playing）：
   - `className="yg-primary"` → `className="gs-btn gs-btn--primary"`
   - `className="yg-secondary"` → `className="gs-btn gs-btn--ghost"`
   - menu 列表 `is-primary` 主线按钮：可保留列表布局 class，另加 `gs-btn gs-btn--primary` **或** 仅 token 化 CSS 中 `.is-primary`（二选一；优先按钮加 `gs-btn*` 以保证契约匹配）。

   菜单条目若是大卡而非标准 CTA，允许保留 `yg-start-menu button` 布局，在 CSS 中把其颜色改为 token，并保证至少一处主路径含 `gs-btn--primary`（例如章节页「击鼓开演」）。

5. **playing**：保持现有局内 header；仅当字色过暗时给返回钮加 `gs-btn gs-btn--ghost`（可选）。

- [ ] **Step 4: YinggeGame.module.css 壳色 token 化**

1. 文件顶部若有 `--yg-red` / `--yg-ink` / `--yg-paper` 等，映射到 v2：

```css
.root {
  /* 保留 layout；色阶对齐 v2 */
  --yg-red: var(--g-cinnabar);
  --yg-ink: var(--g-abyss);
  --yg-paper: var(--g-paper);
  --yg-gold: var(--g-gold);
  background: var(--g-abyss);
  color: var(--g-cream);
  min-height: 100dvh;
}
```

（若原变量名不同，按实际 CSS 变量名改，目标是主色来自 `--g-*`。）

2. **弱化或删除** `.yg-primary` / `.yg-secondary` 的硬阴影块状「廉价」样式（`box-shadow: 7px 7px 0`），因已改 `gs-btn`；若仍有残留 class 引用，改为：

```css
.root :global(.yg-primary),
.root :global(.yg-secondary) {
  /* deprecated: use .gs-btn* */
}
```

3. eyebrow / masthead 标题色：`color: var(--g-gold)` / `var(--g-text-hi)` / `font-family: var(--g-font-display)`。
4. 卡片边：`border-color: color-mix(in srgb, var(--g-gold) 22%, transparent)`；背景 `var(--g-float)` / `var(--g-card)`。
5. 保留 poster 几何装饰（`.yg-sun` / `.yg-figure`）动画；reduced-motion 既有规则保留。
6. 若 `GameChrome` 嵌套导致双层 min-height，确保 `.gs-root` 内 `.yg-start` 不再强制 `100dvh` 顶栏双算——可用：

```css
.root :global(.gs-root) {
  min-height: 100dvh;
  background: transparent; /* 底由 .root 提供，避免双层漆 */
}
```

或让 `section.root` 在包了 `GameChrome` 后不再包一层满高（实现时二选一，以不出现双滚动条为准）。

- [ ] **Step 5: 跑测试 + tsc**

```bash
node --experimental-strip-types --test tests/yingge-game.test.ts tests/game-shell-contract.test.ts
npx tsc --noEmit
```

Expected: PASS / 0 errors

- [ ] **Step 6: Commit**

```bash
git add src/games/chaoshan-yingge/YinggeGame.tsx \
  src/games/chaoshan-yingge/YinggeGame.module.css \
  tests/yingge-game.test.ts
git commit -m "feat(yingge): 非对局壳对齐 GameChrome 与 gs 按钮"
```

---

### Task 4: playing 对比度 + 全量验收

**Files:**
- Modify: `src/games/chaoshan-yingge/YinggeGame.tsx` / `.module.css`（仅当 playing HUD 字色不足）
- Modify: 无 SEO page.tsx diff（验收时 `git diff` 确认）
- 可选：更新 `CHANGELOG.md` / `VERSION` 仅当仓库惯例要求（本 plan 默认不升版本，除非用户要求）

- [ ] **Step 1: playing HUD 抽检与最小修补**

阅读 `YinggeGame.tsx` 中 `view === 'playing'` 区块与 module 中 HUD 选择器。若字色已是浅色可跳过。若为深色硬编码导致暗底不可读，改为 `color: var(--g-text-hi)` 或 `var(--g-cream)`。**不**重做布局。

- [ ] **Step 2: 全量测试**

```bash
pnpm test
```

Expected: 全部 PASS（含 game-shell / jiaobei / yingge）

- [ ] **Step 3: 隔离 worktree 构建**

```bash
git worktree add /tmp/rex-game-shell-build HEAD
cd /tmp/rex-game-shell-build
pnpm install --frozen-lockfile
pnpm exec next build
# 确认 games 路由输出存在
test -f out/games/shantou-jiaobei/index.html
test -f out/games/chaoshan-yingge/index.html
cd -
git worktree remove /tmp/rex-game-shell-build --force
```

Expected: build success；两游戏 HTML 存在。  
（若 `pnpm install` 过慢且主仓 `node_modules` 可用，可用 `pnpm exec next build` 于 worktree 并 `ln -s` node_modules——以不破坏主 `.next` 为准。）

- [ ] **Step 4: SEO 零 diff 检查**

```bash
git diff -- app/games/shantou-jiaobei/page.tsx app/games/chaoshan-yingge/page.tsx
```

Expected: 空输出

- [ ] **Step 5: reduced-motion 与 class 终检**

```bash
# 壳 CSS 含降级
rg -n "prefers-reduced-motion" src/styles/game-shell.css
# 共享组件仍在
rg -n "GameChrome" src/games/shantou-jiaobei/JiaobeiGame.tsx src/games/chaoshan-yingge/YinggeGame.tsx
```

- [ ] **Step 6: Commit（若 Step 1 有改动）**

```bash
git add src/games/chaoshan-yingge/YinggeGame.tsx src/games/chaoshan-yingge/YinggeGame.module.css
git commit -m "fix(yingge): playing HUD 对比度对齐暗场壳"
```

若无改动：跳过 commit，仅在汇报中注明「playing 无需改动」。

- [ ] **Step 7: 对照 spec §9 验收清单勾选**

人工确认：
- [ ] 两游戏顶栏同构 `gs-*`
- [ ] 主次按钮朱/金
- [ ] token 主色来源
- [ ] 圣杯流程不变
- [ ] 英歌进度/设置不变
- [ ] reduced-motion
- [ ] tests + build
- [ ] page.tsx SEO 零 diff

---

## Spec coverage (self-review)

| Spec 要求 | Task |
|---|---|
| 共享 GameChrome + game-shell.css | T1 |
| 圣杯删本地 chrome、接共享、token 化 | T2 |
| 英歌非 playing 顶栏/按钮/token | T3 |
| playing 最小动 | T4 |
| 契约测试 | T1–T3 |
| 全量测试 + 隔离构建 + SEO 零 diff | T4 |
| 不做物理/Phaser/SEO 长文 | 全局约束 |
| reduced-motion | T1 CSS + T4 终检 |

## Placeholder scan

无 TBD/TODO；按钮替换与 edition 映射均已写明。

## Type consistency

- `GameChromeProps`：`title` `edition?` `backHref?` `backLabel?` `children` — T1 定义，T2/T3 消费一致。
- class 前缀全程 `gs-`；edition 圣杯三句与英歌 view 表一致。
