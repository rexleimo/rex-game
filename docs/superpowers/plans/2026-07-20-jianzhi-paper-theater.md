# 剪纸「纸上剧场」重生 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把剪纸游戏 UI 层重铸为「纸上剧场」:4 幕主线 + 场景角色台词 + 展开电影时刻 + 民艺馆作品墙 + 分享卡,引擎与进度零改动。

**Architecture:** 新增 `content/acts.ts`(幕配置)与 `theater/` 组件层(TheaterMap/ActShell/CutBench/DialogueBar/UnfoldCeremony/GalleryWall/shareCard),幕状态由既有 `JianzhiProgress` **派生**(`buildActStates`),`runtime/`(paperCanvas/fold/audio)、`core/progress.ts`、7 课内容全部不动。样式新增全局 `theater.css`(`.th-*` 命名空间,引用 `--g-*` token),旧 module.css 仅留 codex/settings 过渡。

**Tech Stack:** React 19 Client Component + Canvas 2D(既有引擎)+ 原生 CSS;node:test 契约测试;AI 场景图失败回落 SVG SceneArt。

**Spec:** `docs/superpowers/specs/2026-07-20-jianzhi-paper-theater-design.md`

## Global Constraints

- 不改 `runtime/`、`core/`、`content/lessons|motifs|combos|commissions|culture.ts` 任何逻辑;台词复用 `lessons[].narrative`。
- 幕/解锁/点亮全部从 `JianzhiProgress` 派生(`curriculumUnlocked`/`completedLessons`),**无 localStorage schema 变更、无需迁移**。
- 静态导出;分享卡走离屏 canvas → `toBlob` → `<a download>`,无分享 API 依赖。
- 动效遵守 `prefers-reduced-motion`;色值只用 `--g-*` token。
- 测试:`pnpm test`;构建验收用隔离 worktree(dev 常占 3030)。
- 提交风格:Conventional Commits。

---

### Task 1: 幕配置 + 状态派生 + 幕布地图

**Files:**
- Create: `src/games/jianzhi/content/acts.ts`
- Create: `src/games/jianzhi/theater/useTheater.ts`
- Create: `src/games/jianzhi/theater/SceneArt.tsx`(SVG 场景,4 幕各一)
- Create: `src/games/jianzhi/theater/TheaterMap.tsx`
- Create: `src/games/jianzhi/theater/theater.css`
- Modify: `src/games/jianzhi/JianzhiGame.tsx`(map 视图换 TheaterMap;import theater.css)
- Test: `tests/jianzhi-theater-acts.test.ts`

**Interfaces:**
- Consumes: `LESSONS`(`content/lessons.ts`,元素含 `id/order/title`)、`JianzhiProgress`(`core/types.ts:109-118`)。
- Produces: `ACTS: Act[]`、`buildActStates(progress): ActState[]`、`ActState = Act & { unlocked, lit, lessons }`、`TheaterMap({ acts, onEnterAct, onOpenCodex, onPractice, onOpenWorks, onOpenSettings })`。

- [ ] **Step 1: 写失败测试**

```ts
// tests/jianzhi-theater-acts.test.ts
import assert from 'node:assert/strict';
import test from 'node:test';

test('acts cover all 7 lessons in order with character and scene', async () => {
  const { ACTS } = await import('../src/games/jianzhi/content/acts.ts');
  const { LESSONS } = await import('../src/games/jianzhi/content/lessons.ts');
  assert.equal(ACTS.length, 4);
  const covered = ACTS.flatMap((a) => a.lessonIds);
  assert.deepEqual(covered, LESSONS.map((l) => l.id));
  for (const act of ACTS) {
    assert.ok(act.character.name.length > 0, `${act.id} character missing`);
    assert.ok(act.scene.art.length > 0, `${act.id} scene missing`);
    assert.ok(act.theme.includes('·'), `${act.id} theme should be 「X · Y」`);
  }
});

test('buildActStates derives unlock/lit from progress without schema change', async () => {
  const { buildActStates } = await import('../src/games/jianzhi/theater/useTheater.ts');
  const base = {
    version: 2,
    curriculumUnlocked: 1,
    completedLessons: [],
    completedCommissions: [],
    collectedMotifIds: [],
    discoveredCombos: [],
    cultureEntryIds: [],
    graduated: false,
  } as const;
  const fresh = buildActStates(base as never);
  assert.equal(fresh[0].unlocked, true);
  assert.equal(fresh[1].unlocked, false);
  assert.equal(fresh.every((a) => !a.lit), true);
  const doneTwo = buildActStates({
    ...base,
    curriculumUnlocked: 3,
    completedLessons: ['awaken', 'symmetry'],
  } as never);
  assert.equal(doneTwo[0].lit, true);
  assert.equal(doneTwo[1].unlocked, true);
  assert.equal(doneTwo[2].unlocked, false);
});

test('TheaterMap renders act curtains with lock states', async () => {
  const { readFileSync } = await import('node:fs');
  const src = readFileSync(new URL('../src/games/jianzhi/theater/TheaterMap.tsx', import.meta.url), 'utf8');
  assert.match(src, /th-curtain/);
  assert.match(src, /unlocked/);
  assert.match(src, /lit/);
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm test`
Expected: FAIL — `acts.ts` 不存在

- [ ] **Step 3: 创建 content/acts.ts**

```ts
// 纸上剧场 · 幕配置:4 幕,按课程顺序映射;端午等时令主题走 commissions 委托
export interface ActCharacter {
  name: string;
  avatar: string; // 单字头像
  role: string; // 角色定位(台词条署名)
}

export interface Act {
  id: 'newyear' | 'wedding' | 'silkroad' | 'reunion';
  order: number;
  no: string; // 第一幕 …
  theme: string; // 年夜 · 窗花
  curtainHint: string; // 门帘副题
  scene: {
    art: 'newyear' | 'wedding' | 'silk' | 'reunion';
    caption: string; // 场景题字
    image?: string; // T5 AI 大图生成后填入 /assets/jianzhi/scenes/*.webp
  };
  character: ActCharacter;
  lessonIds: string[];
}

export const ACTS: Act[] = [
  {
    id: 'newyear',
    order: 1,
    no: '第一幕',
    theme: '年夜 · 窗花',
    curtainHint: '对折起剪,福到窗前',
    scene: { art: 'newyear', caption: '年三十 · 窗外落雪' },
    character: { name: '奶奶', avatar: '奶', role: '第一幕向导' },
    lessonIds: ['awaken', 'symmetry'],
  },
  {
    id: 'wedding',
    order: 2,
    no: '第二幕',
    theme: '新婚 · 双喜',
    curtainHint: '纹样成句,喜上眉梢',
    scene: { art: 'wedding', caption: '喜房 · 红烛高照' },
    character: { name: '喜娘', avatar: '喜', role: '第二幕向导' },
    lessonIds: ['rebus-intro', 'window-four'],
  },
  {
    id: 'silkroad',
    order: 3,
    no: '第三幕',
    theme: '丝路 · 团花',
    curtainHint: '一折一世界,团团绽开',
    scene: { art: 'silk', caption: '灯下 · 驼铃渐远' },
    character: { name: '老艺人', avatar: '艺', role: '第三幕向导' },
    lessonIds: ['silk-rosette'],
  },
  {
    id: 'reunion',
    order: 4,
    no: '第四幕',
    theme: '福寿 · 团圆',
    curtainHint: '吉语大考,出师一剪',
    scene: { art: 'reunion', caption: '团圆夜 · 灯下围坐' },
    character: { name: '纸灵', avatar: '灵', role: '第四幕向导' },
    lessonIds: ['fu-shou', 'graduate'],
  },
];
```

- [ ] **Step 4: 创建 theater/useTheater.ts**

```ts
import { useMemo } from 'react';
import type { JianzhiLesson, JianzhiProgress } from '../core/types';
import { LESSONS } from '../content/lessons';
import { ACTS, type Act } from '../content/acts';

export interface ActState extends Act {
  unlocked: boolean;
  lit: boolean;
  lessons: JianzhiLesson[];
}

export function buildActStates(progress: JianzhiProgress): ActState[] {
  return ACTS.map((act) => {
    const lessons = act.lessonIds
      .map((id) => LESSONS.find((l) => l.id === id))
      .filter((l): l is JianzhiLesson => Boolean(l));
    const minOrder = Math.min(...lessons.map((l) => l.order));
    const unlocked = progress.curriculumUnlocked >= minOrder;
    const lit = lessons.length > 0 && lessons.every((l) => progress.completedLessons.includes(l.id));
    return { ...act, unlocked, lit, lessons };
  });
}

export function useTheater(progress: JianzhiProgress): ActState[] {
  return useMemo(() => buildActStates(progress), [progress]);
}
```

- [ ] **Step 5: 创建 theater/SceneArt.tsx(SVG 场景,纯 CSS/SVG 几何)**

```tsx
// 幕场景 SVG:AI 大图上线前的默认视觉;四幕各一组几何意象(暗场金红)
export function SceneArt({ art }: { art: 'newyear' | 'wedding' | 'silk' | 'reunion' }) {
  if (art === 'newyear') {
    return (
      <svg className="th-scene-art" viewBox="0 0 800 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <radialGradient id="sa-warm" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#F2C879" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#F2C879" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="800" height="240" fill="#120B07" />
        <rect width="800" height="240" fill="url(#sa-warm)" />
        <rect x="330" y="40" width="140" height="110" fill="#C98A3D" stroke="#33200F" strokeWidth="8" />
        <line x1="400" y1="40" x2="400" y2="150" stroke="#33200F" strokeWidth="6" />
        <line x1="330" y1="95" x2="470" y2="95" stroke="#33200F" strokeWidth="6" />
        <rect x="376" y="71" width="48" height="48" fill="#C82E21" transform="rotate(45 400 95)" />
        <g fill="#FFF8EC" opacity="0.7">
          <circle cx="120" cy="60" r="2.5" /><circle cx="220" cy="120" r="2" />
          <circle cx="620" cy="80" r="2.5" /><circle cx="700" cy="150" r="2" />
          <circle cx="80" cy="160" r="1.8" /><circle cx="540" cy="40" r="1.8" />
        </g>
      </svg>
    );
  }
  if (art === 'wedding') {
    return (
      <svg className="th-scene-art" viewBox="0 0 800 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <radialGradient id="sa-candle" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#E8452F" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#E8452F" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="800" height="240" fill="#140B07" />
        <rect width="800" height="240" fill="url(#sa-candle)" />
        <g stroke="#C9A24B" strokeWidth="3" fill="none">
          <path d="M360 150 v-40 M440 150 v-40" />
          <path d="M350 150 h20 M430 150 h20" />
        </g>
        <ellipse cx="360" cy="100" rx="8" ry="14" fill="#F2C879" opacity="0.9" />
        <ellipse cx="440" cy="100" rx="8" ry="14" fill="#F2C879" opacity="0.9" />
        <rect x="356" y="70" width="88" height="88" fill="#C82E21" transform="rotate(45 400 114)" />
        <text x="400" y="126" textAnchor="middle" fontSize="40" fill="#F5D9A0" fontFamily="serif" fontWeight="700">囍</text>
      </svg>
    );
  }
  if (art === 'silk') {
    return (
      <svg className="th-scene-art" viewBox="0 0 800 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <radialGradient id="sa-lamp" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#E8CF9A" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#E8CF9A" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="800" height="240" fill="#100B07" />
        <rect width="800" height="240" fill="url(#sa-lamp)" />
        <ellipse cx="400" cy="70" rx="46" ry="56" fill="#C82E21" />
        <ellipse cx="400" cy="70" rx="46" ry="56" fill="none" stroke="#E8CF9A" strokeWidth="2" />
        <line x1="400" y1="14" x2="400" y2="126" stroke="#E8CF9A" strokeWidth="2" opacity="0.6" />
        <line x1="354" y1="70" x2="446" y2="70" stroke="#E8CF9A" strokeWidth="2" opacity="0.6" />
        <path d="M388 130 h24 l-4 18 h-16 z" fill="#C9A24B" />
        <g stroke="#8A6B2F" strokeWidth="3" fill="none" opacity="0.8">
          <path d="M120 200 q30 -24 60 0 q30 24 60 0" />
          <path d="M560 200 q30 -24 60 0 q30 24 60 0" />
        </g>
      </svg>
    );
  }
  return (
    <svg className="th-scene-art" viewBox="0 0 800 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="sa-home" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#F2C879" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#F2C879" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="240" fill="#120B07" />
      <rect width="800" height="240" fill="url(#sa-home)" />
      <circle cx="400" cy="150" r="60" fill="none" stroke="#C9A24B" strokeWidth="3" />
      <circle cx="400" cy="150" r="60" fill="#C82E21" opacity="0.18" />
      <g fill="#E8CF9A">
        <circle cx="400" cy="110" r="8" /><circle cx="370" cy="150" r="8" />
        <circle cx="430" cy="150" r="8" /><circle cx="400" cy="186" r="8" />
      </g>
      <path d="M120 60 q40 -20 80 0 M600 60 q40 -20 80 0" stroke="#8A6B2F" strokeWidth="3" fill="none" opacity="0.7" />
    </svg>
  );
}
```

- [ ] **Step 6: 创建 theater/TheaterMap.tsx**

```tsx
import type { ActState } from './useTheater';

export function TheaterMap({
  acts,
  onEnterAct,
  onOpenCodex,
  onPractice,
  onOpenWorks,
  onOpenSettings,
}: {
  acts: ActState[];
  onEnterAct: (act: ActState) => void;
  onOpenCodex: () => void;
  onPractice: () => void;
  onOpenWorks: () => void;
  onOpenSettings: () => void;
}) {
  return (
    <div className="th-map">
      <header className="th-map-head">
        <p className="th-kicker">纸上剧场</p>
        <h1 className="th-title">纸上生花</h1>
        <p className="th-sub">四幕民俗剧场 · 一折一剪之间,读一纸吉语</p>
      </header>

      <div className="th-curtains">
        {acts.map((act) => (
          <button
            key={act.id}
            type="button"
            className={`th-curtain ${act.lit ? 'is-lit' : ''} ${act.unlocked ? '' : 'is-locked'}`}
            disabled={!act.unlocked}
            onClick={() => onEnterAct(act)}
          >
            <span className="th-curtain-state">
              {act.lit ? '已点亮' : act.unlocked ? '进行中' : '未解锁'}
            </span>
            <span className="th-curtain-no">{act.no}</span>
            <span className="th-curtain-theme">{act.theme}</span>
            <span className="th-curtain-hint">{act.curtainHint}</span>
          </button>
        ))}
      </div>

      <nav className="th-map-nav" aria-label="工坊导航">
        <button type="button" onClick={onOpenCodex}>纹样图鉴</button>
        <button type="button" onClick={onOpenWorks}>民艺馆</button>
        <button type="button" onClick={onPractice}>练功房</button>
        <button type="button" onClick={onOpenSettings}>设置</button>
      </nav>
    </div>
  );
}
```

- [ ] **Step 7: 创建 theater/theater.css(首批:地图/幕布)**

```css
/* 纸上剧场 · 全局样式(引用 --g-* token;.th-* 命名空间) */
.th-root {
  min-height: 100vh;
  background:
    radial-gradient(90% 60% at 72% 0%, rgba(200, 46, 33, 0.14) 0%, transparent 55%),
    var(--g-abyss);
  color: var(--g-cream);
  font-family: var(--g-font-body);
}
.th-kicker {
  font-size: 11px;
  letter-spacing: 0.35em;
  color: var(--g-gold);
  margin: 0 0 0.6rem;
}
.th-title {
  margin: 0;
  font-family: var(--g-font-display);
  font-size: clamp(2.4rem, 6vw, 4rem);
  letter-spacing: 0.06em;
  color: var(--g-text-hi);
}
.th-sub {
  margin: 0.8rem 0 0;
  color: var(--g-text);
  font-size: 14px;
  letter-spacing: 0.1em;
}

/* 幕布地图 */
.th-map {
  width: min(1080px, 94vw);
  margin-inline: auto;
  padding: 6vh 0 8vh;
}
.th-map-head {
  text-align: center;
  margin-bottom: 4rem;
}
.th-curtains {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.2rem;
}
.th-curtain {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  min-height: 220px;
  padding: 1.4rem 1.2rem;
  text-align: left;
  cursor: pointer;
  border: 1px solid rgba(201, 162, 75, 0.35);
  border-radius: 8px;
  background: linear-gradient(120deg, rgba(168, 30, 20, 0.85), rgba(200, 46, 33, 0.55));
  color: var(--g-paper);
  overflow: hidden;
  transition:
    transform var(--g-dur-micro) var(--g-ease),
    box-shadow var(--g-dur-micro) var(--g-ease),
    border-color var(--g-dur-micro) var(--g-ease);
}
.th-curtain::before,
.th-curtain::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 22%;
  background: linear-gradient(90deg, rgba(10, 7, 5, 0.35), transparent);
  transition: transform var(--g-dur-enter) var(--g-ease);
}
.th-curtain::before { left: 0; }
.th-curtain::after { right: 0; transform: scaleX(-1); }
.th-curtain:not(.is-locked):hover {
  transform: translateY(-6px);
  box-shadow: 0 24px 48px rgba(200, 30, 20, 0.35);
}
.th-curtain:not(.is-locked):hover::before { transform: translateX(-70%); }
.th-curtain:not(.is-locked):hover::after { transform: scaleX(-1) translateX(-70%); }
.th-curtain.is-lit {
  border-color: var(--g-gold);
  box-shadow: 0 0 24px rgba(201, 162, 75, 0.25);
}
.th-curtain.is-locked {
  cursor: not-allowed;
  background: linear-gradient(120deg, var(--g-card), var(--g-float));
  color: var(--g-text-dim);
  border-color: rgba(201, 162, 75, 0.15);
}
.th-curtain-state {
  font-size: 10px;
  letter-spacing: 0.2em;
  padding: 2px 8px;
  border-radius: 2px;
  border: 1px solid rgba(247, 241, 230, 0.4);
}
.th-curtain.is-locked .th-curtain-state {
  border-color: rgba(232, 220, 196, 0.2);
}
.th-curtain-no {
  margin-top: auto;
  font-size: 11px;
  letter-spacing: 0.25em;
  opacity: 0.85;
}
.th-curtain-theme {
  font-family: var(--g-font-display);
  font-size: 22px;
  letter-spacing: 0.08em;
}
.th-curtain-hint {
  font-size: 11px;
  letter-spacing: 0.1em;
  opacity: 0.75;
}
.th-map-nav {
  margin-top: 3rem;
  display: flex;
  justify-content: center;
  gap: 2.2rem;
}
.th-map-nav button {
  background: none;
  border: 0;
  border-bottom: 1px solid rgba(201, 162, 75, 0.35);
  padding: 0 0 4px;
  font-size: 13px;
  letter-spacing: 0.18em;
  color: var(--g-gold);
  cursor: pointer;
}
.th-map-nav button:hover {
  color: var(--g-gold-hi);
}
@media (max-width: 860px) {
  .th-curtains {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .th-curtain { min-height: 170px; }
}
@media (max-width: 520px) {
  .th-curtains {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 8: JianzhiGame.tsx 接线(map 视图替换)**

- 文件顶部追加:`import { useTheater } from './theater/useTheater';` `import { TheaterMap } from './theater/TheaterMap';` `import './theater/theater.css';`
- `const acts = useTheater(progress);`(放在 progress state 之后)
- map 视图 JSX(`JianzhiGame.tsx:636-722` 功课地图段)替换为:

```tsx
      {view === 'map' ? (
        <TheaterMap
          acts={acts}
          onEnterAct={(act) => {
            const target = act.lessons.find((l) => !progress.completedLessons.includes(l.id)) ?? act.lessons[0];
            if (target) enterLesson(target);
          }}
          onOpenCodex={() => setView('codex')}
          onOpenWorks={() => {
            setCodexTab('works');
            setView('codex');
          }}
          onPractice={startPractice}
          onOpenSettings={() => setView('settings')}
        />
      ) : null}
```

(时令委托卡片区保留:置于 TheaterMap 上方或下方,graduated 才显示;委托仍走 `enterCommission`。)
- 根容器 className 追加 `th-root`(`className={`${styles.root} th-root`}`)

- [ ] **Step 9: 跑测试确认通过**

Run: `pnpm test`
Expected: PASS

- [ ] **Step 10: Commit**

```bash
git add src/games/jianzhi/content/acts.ts src/games/jianzhi/theater src/games/jianzhi/JianzhiGame.tsx tests/jianzhi-theater-acts.test.ts
git commit -m "feat(jianzhi): 纸上剧场幕配置与幕布地图"
```

---

### Task 2: 幕内创作界面(ActShell + CutBench + DialogueBar)

**Files:**
- Create: `src/games/jianzhi/theater/ActShell.tsx`
- Create: `src/games/jianzhi/theater/DialogueBar.tsx`
- Create: `src/games/jianzhi/theater/CutBench.tsx`
- Modify: `src/games/jianzhi/JianzhiGame.tsx`(workshop 视图:reading/craft phase 换剧场界面)
- Modify: `src/games/jianzhi/theater/theater.css`(追加幕内段)
- Test: `tests/jianzhi-theater-stage.test.ts`

**Interfaces:**
- Consumes: `ActState`(T1);`SceneArt`(T1);既有 paperCanvas 初始化逻辑(JianzhiGame 内部 `hostRef`/`canvasHandleRef`)。
- Produces: `ActShell({ act, lessonIndex, lessonCount, onBack, children })`、`DialogueBar({ character, lines, onDone })`、`CutBench(props)`(见 Step 3 代码)。

- [ ] **Step 1: 写失败测试**

```ts
// tests/jianzhi-theater-stage.test.ts
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
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm test`
Expected: FAIL — `ActShell.tsx` 不存在

- [ ] **Step 3: 创建 ActShell.tsx / DialogueBar.tsx / CutBench.tsx**

```tsx
// ActShell.tsx
import type { ReactNode } from 'react';
import type { ActState } from './useTheater';
import { SceneArt } from './SceneArt';

export function ActShell({
  act,
  lessonIndex,
  lessonCount,
  onBack,
  children,
}: {
  act: ActState;
  lessonIndex: number; // 1-based
  lessonCount: number;
  onBack: () => void;
  children: ReactNode;
}) {
  return (
    <div className="th-act">
      <header className="th-act-top">
        <button type="button" className="th-back" onClick={onBack} aria-label="返回幕布地图">
          ← 幕布
        </button>
        <span className="th-act-name">
          {act.no} · {act.theme}
        </span>
        <span className="th-act-progress" aria-label={`第 ${lessonIndex} 课,共 ${lessonCount} 课`}>
          {Array.from({ length: lessonCount }, (_, i) => (
            <i key={i} className={i < lessonIndex ? 'on' : ''} />
          ))}
        </span>
      </header>
      <div className="th-scene">
        {act.scene.image ? (
          <img className="th-scene-img" src={act.scene.image} alt="" />
        ) : (
          <SceneArt art={act.scene.art} />
        )}
        <span className="th-scene-cap">{act.scene.caption}</span>
      </div>
      {children}
    </div>
  );
}
```

```tsx
// DialogueBar.tsx
'use client';

import { useState } from 'react';
import type { ActCharacter } from '../content/acts';

export function DialogueBar({
  character,
  lines,
  onDone,
}: {
  character: ActCharacter;
  lines: string[];
  onDone?: () => void;
}) {
  const [index, setIndex] = useState(0);
  if (!lines.length) return null;
  const last = index >= lines.length - 1;

  return (
    <div className="th-dialog">
      <div className="th-avatar" aria-hidden="true">{character.avatar}</div>
      <div className="th-bubble">
        <div className="th-who">{character.name} · {character.role}</div>
        <p className="th-line">{lines[index]}</p>
      </div>
      <button
        type="button"
        className="th-next"
        onClick={() => {
          if (last) {
            setIndex(0);
            onDone?.();
          } else {
            setIndex((i) => i + 1);
          }
        }}
      >
        {last ? '开始 ▸' : '继续 ▸'}
      </button>
      {lines.length > 1 ? (
        <button type="button" className="th-skip" onClick={() => { setIndex(0); onDone?.(); }}>
          跳过
        </button>
      ) : null}
    </div>
  );
}
```

CutBench 把现有 craft 阶段 UI 重排为「左画布右面板」;props 从 JianzhiGame 现有 state/handler 透传(执行时按现有变量名接入,以下为组件骨架):

```tsx
// CutBench.tsx
import type { ReactNode, RefObject } from 'react';
import type { FoldMode } from '../runtime/fold';
import type { MotifDef } from '../core/types';

export function CutBench({
  canvasHostRef,
  fold,
  onFoldChange,
  allowFoldSwitch,
  motifs,
  selectedMotifId,
  onSelectMotif,
  tool,
  onToolChange,
  objective,
  onUnfold,
  onRefold,
  onAskHint,
  actionsDisabled,
}: {
  canvasHostRef: RefObject<HTMLDivElement | null>;
  fold: FoldMode;
  onFoldChange: (fold: FoldMode) => void;
  allowFoldSwitch: boolean;
  motifs: MotifDef[];
  selectedMotifId: string | null;
  onSelectMotif: (id: string) => void;
  tool: 'motif' | 'cut';
  onToolChange: (tool: 'motif' | 'cut') => void;
  objective: ReactNode;
  onUnfold: () => void;
  onRefold: () => void;
  onAskHint: () => void;
  actionsDisabled: boolean;
}) {
  return (
    <div className="th-bench">
      <div className="th-paper" ref={canvasHostRef} />
      <div className="th-tools">
        <div className="th-tool-row" role="group" aria-label="折法">
          {(['book', 'four', 'rosette', 'single'] as const).map((f) => (
            <button
              key={f}
              type="button"
              className={fold === f ? 'sel' : ''}
              disabled={!allowFoldSwitch && fold !== f}
              onClick={() => onFoldChange(f)}
            >
              {{ book: '对折', four: '四折', rosette: '团花', single: '单面' }[f]}
            </button>
          ))}
        </div>
        <div className="th-motifs" role="group" aria-label="纹样">
          {motifs.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`th-motif ${selectedMotifId === m.id && tool === 'motif' ? 'sel' : ''}`}
              onClick={() => {
                onSelectMotif(m.id);
                onToolChange('motif');
              }}
            >
              {m.name}
            </button>
          ))}
          <button
            type="button"
            className={`th-motif ${tool === 'cut' ? 'sel' : ''}`}
            onClick={() => onToolChange('cut')}
          >
            自由剪
          </button>
        </div>
        <p className="th-target">{objective}</p>
        <div className="th-actions">
          <button type="button" className="th-unfold" disabled={actionsDisabled} onClick={onUnfold}>
            展 开
          </button>
          <button type="button" className="th-ghost" onClick={onRefold}>
            重折
          </button>
          <button type="button" className="th-ghost" onClick={onAskHint}>
            求助纸灵
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: JianzhiGame workshop 接入**

- `reading` phase JSX 替换为:

```tsx
<ActShell act={activeAct} lessonIndex={actLessonIndex} lessonCount={activeAct.lessons.length} onBack={leaveWorkshop}>
  <DialogueBar character={activeAct.character} lines={activeLesson.narrative} onDone={() => setPhase('craft')} />
  <button type="button" className="th-enter-craft" onClick={() => setPhase('craft')}>
    开剪 →
  </button>
</ActShell>
```

(`activeAct` = `acts.find((a) => a.lessonIds.includes(activeLesson.id))`;练习模式(无 activeLesson)用兜幕 `acts[0]` 或不显示台词条;`actLessonIndex` = 本幕内第几课。)
- `craft` phase 外层同样包 `ActShell`,内部画布/工具区替换为 `<CutBench … />`,props 全部来自现有 state:`fold/setFold`、`tool/setTool`、`selectedMotif/setSelectedMotif`、`canvasHostRef`(现有 host ref)、`onUnfold`(现有展开 handler)、`onRefold`(现有 clear+fold handler)、objective 文本沿用现有 comboTarget/目标 JSX。
- 求助纸灵:接现有 toast/hint 逻辑(无则 toast `activeLesson.reading.focus`)。

- [ ] **Step 5: theater.css 追加幕内样式**

```css
/* 幕内 */
.th-act {
  width: min(1120px, 96vw);
  margin-inline: auto;
  padding-bottom: 6vh;
}
.th-act-top {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(201, 162, 75, 0.2);
}
.th-back {
  background: none;
  border: 1px solid rgba(201, 162, 75, 0.4);
  border-radius: 2px;
  padding: 6px 14px;
  font-size: 12px;
  letter-spacing: 0.15em;
  color: var(--g-gold);
  cursor: pointer;
}
.th-act-name {
  font-family: var(--g-font-display);
  font-size: 17px;
  letter-spacing: 0.15em;
  color: var(--g-text-hi);
}
.th-act-progress {
  margin-left: auto;
  display: flex;
  gap: 8px;
}
.th-act-progress i {
  width: 26px;
  height: 3px;
  border-radius: 2px;
  background: rgba(201, 162, 75, 0.25);
}
.th-act-progress i.on {
  background: var(--g-gold);
  box-shadow: 0 0 8px rgba(201, 162, 75, 0.6);
}
.th-scene {
  position: relative;
  height: clamp(140px, 22vw, 220px);
  overflow: hidden;
  border-bottom: 1px solid rgba(201, 162, 75, 0.15);
}
.th-scene-art,
.th-scene-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.th-scene-cap {
  position: absolute;
  right: 18px;
  bottom: 10px;
  font-size: 10px;
  letter-spacing: 0.25em;
  color: rgba(232, 220, 196, 0.55);
}
/* 剪纸台 */
.th-bench {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  gap: 1.6rem;
  padding: 1.4rem 0;
}
.th-paper {
  min-height: 420px;
  border: 1px solid rgba(201, 162, 75, 0.22);
  border-radius: 8px;
  background: radial-gradient(80% 80% at 50% 40%, rgba(200, 46, 33, 0.1), transparent 70%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.th-tools {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.th-tool-row {
  display: flex;
  gap: 8px;
}
.th-tool-row button {
  flex: 1;
  padding: 8px 0;
  background: var(--g-float);
  border: 1px solid rgba(201, 162, 75, 0.22);
  border-radius: 4px;
  font-size: 12px;
  letter-spacing: 0.15em;
  color: var(--g-text);
  cursor: pointer;
}
.th-tool-row button.sel {
  border-color: var(--g-gold);
  color: var(--g-gold-hi);
  box-shadow: 0 0 0 2px rgba(201, 162, 75, 0.25);
}
.th-tool-row button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.th-motifs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.th-motif {
  aspect-ratio: 1;
  background: var(--g-float);
  border: 1px solid rgba(201, 162, 75, 0.22);
  border-radius: 6px;
  font-family: var(--g-font-display);
  font-size: 18px;
  color: var(--g-gold);
  cursor: pointer;
}
.th-motif.sel {
  border-color: var(--g-gold);
  background: var(--g-card);
  box-shadow: 0 0 0 2px rgba(201, 162, 75, 0.35);
}
.th-target {
  margin: 0;
  font-size: 13px;
  line-height: 1.8;
  color: var(--g-text);
}
.th-target b {
  color: var(--g-gold-hi);
  font-family: var(--g-font-display);
  letter-spacing: 0.15em;
}
.th-actions {
  margin-top: auto;
  display: flex;
  gap: 10px;
}
.th-unfold {
  background: var(--g-cinnabar);
  color: var(--g-paper);
  border: 0;
  border-radius: 2px;
  padding: 12px 28px;
  font-size: 14px;
  letter-spacing: 0.3em;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(200, 46, 33, 0.4);
  transition: transform var(--g-dur-micro) var(--g-ease);
}
.th-unfold:hover:not(:disabled) {
  transform: translateY(-2px);
}
.th-unfold:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.th-ghost {
  background: none;
  border: 1px solid rgba(201, 162, 75, 0.5);
  border-radius: 2px;
  padding: 12px 18px;
  font-size: 12px;
  letter-spacing: 0.15em;
  color: var(--g-gold);
  cursor: pointer;
}
/* 台词条 */
.th-dialog {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 1rem 1.2rem;
  margin-top: 1rem;
  background: rgba(18, 11, 7, 0.9);
  border: 1px solid rgba(201, 162, 75, 0.25);
  border-radius: 10px;
}
.th-avatar {
  flex: 0 0 46px;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--g-font-display);
  font-size: 19px;
  color: #33200f;
  background: radial-gradient(circle at 35% 30%, var(--g-gold-hi), #8a6b2f);
  border: 2px solid rgba(201, 162, 75, 0.6);
}
.th-bubble {
  flex: 1;
}
.th-who {
  font-size: 10px;
  letter-spacing: 0.25em;
  color: var(--g-gold);
  margin-bottom: 4px;
}
.th-line {
  margin: 0;
  font-family: var(--g-font-display);
  font-size: 15px;
  line-height: 1.85;
  color: var(--g-text-hi);
}
.th-next,
.th-skip {
  align-self: flex-end;
  background: none;
  border: 0;
  font-size: 11px;
  letter-spacing: 0.18em;
  color: var(--g-gold);
  cursor: pointer;
  white-space: nowrap;
}
.th-skip {
  color: var(--g-text-dim);
}
.th-enter-craft {
  margin-top: 1.2rem;
  background: var(--g-cinnabar);
  color: var(--g-paper);
  border: 0;
  border-radius: 2px;
  padding: 12px 32px;
  font-size: 14px;
  letter-spacing: 0.3em;
  cursor: pointer;
}
@media (max-width: 860px) {
  .th-bench {
    grid-template-columns: 1fr;
  }
  .th-paper {
    min-height: 320px;
  }
}
```

- [ ] **Step 6: 跑测试确认通过**

Run: `pnpm test`
Expected: PASS(既有 jianzhi 系列测试保持绿;若旧契约断言了被替换的 craft JSX class 名,同步更新为新 class)

- [ ] **Step 7: Commit**

```bash
git add src/games/jianzhi/theater src/games/jianzhi/JianzhiGame.tsx tests/jianzhi-theater-stage.test.ts
git commit -m "feat(jianzhi): 幕内创作界面与角色台词条"
```

---

### Task 3: 展开电影时刻(UnfoldCeremony)

**Files:**
- Create: `src/games/jianzhi/theater/UnfoldCeremony.tsx`
- Modify: `src/games/jianzhi/JianzhiGame.tsx`(reveal phase 替换)
- Modify: `src/games/jianzhi/theater/theater.css`(追加 ceremony 段)
- Test: `tests/jianzhi-ceremony.test.ts`

**Interfaces:**
- Consumes: `PaperCanvasHandle.unfold()`、`exportPNG(scale)`(paperCanvas.ts:444-460);`playChime`(audio.ts)。
- Produces: `UnfoldCeremony({ image, phrase, principle, reducedMotion, muted, onClose })`;JianzhiGame reveal phase 传入 `exportPNG(2)` 结果与吉语。

- [ ] **Step 1: 写失败测试**

```ts
// tests/jianzhi-ceremony.test.ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('UnfoldCeremony renders cinematic reveal with skip and reduced-motion path', () => {
  const src = readFileSync(new URL('src/games/jianzhi/theater/UnfoldCeremony.tsx', root), 'utf8');
  assert.match(src, /th-ceremony/);
  assert.match(src, /prefers-reduced-motion|reducedMotion/);
  assert.match(src, /跳过|skip/i);
  assert.match(src, /phrase/);
  const game = readFileSync(new URL('src/games/jianzhi/JianzhiGame.tsx', root), 'utf8');
  assert.match(game, /UnfoldCeremony/);
  assert.match(game, /exportPNG/);
});
```

- [ ] **Step 2: 跑测试确认失败** → **Step 3: 实现**

```tsx
// UnfoldCeremony.tsx
'use client';

import { useEffect, useState } from 'react';

export function UnfoldCeremony({
  image,
  phrase,
  principle,
  reducedMotion,
  onClose,
}: {
  image: string; // exportPNG(2) dataURL
  phrase: string | null; // 拼出的吉语,无则 null
  principle: string | null; // 吉语释义
  reducedMotion: boolean;
  onClose: () => void;
}) {
  const [stage, setStage] = useState<'zoom' | 'phrase' | 'done'>(reducedMotion ? 'done' : 'zoom');

  useEffect(() => {
    if (reducedMotion) return;
    const t1 = window.setTimeout(() => setStage('phrase'), 1200);
    const t2 = window.setTimeout(() => setStage('done'), phrase ? 2200 : 1600);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [reducedMotion, phrase]);

  return (
    <div className={`th-ceremony stage-${stage}`} role="dialog" aria-label="展开揭晓">
      <div className="th-ceremony-glow" aria-hidden="true" />
      <div className="th-ceremony-particles" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => (
          <i key={i} style={{ ['--p' as string]: i }} />
        ))}
      </div>
      <img className="th-ceremony-img" src={image} alt="展开的剪纸作品" />
      {phrase ? (
        <div className="th-ceremony-phrase">
          <p className="th-ceremony-rebus">{phrase}</p>
          {principle ? <p className="th-ceremony-principle">{principle}</p> : null}
        </div>
      ) : null}
      <button type="button" className="th-ceremony-skip" onClick={onClose}>
        {stage === 'done' ? '收下作品 →' : '跳过 ▸'}
      </button>
    </div>
  );
}
```

CSS:

```css
/* 展开电影时刻 */
.th-ceremony {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.6rem;
  background: rgba(10, 7, 5, 0.96);
  overflow: hidden;
}
.th-ceremony-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(50% 45% at 50% 46%, rgba(200, 46, 33, 0.35), transparent 70%);
  animation: th-glow 2.2s var(--g-ease) both;
}
@keyframes th-glow {
  from { opacity: 0; transform: scale(0.7); }
  to { opacity: 1; transform: scale(1); }
}
.th-ceremony-img {
  position: relative;
  width: min(64vw, 52vh);
  border: 10px solid #f7f1e6;
  outline: 2px solid var(--g-gold);
  box-shadow: 0 40px 90px rgba(0, 0, 0, 0.7);
  animation: th-zoom 1.2s var(--g-ease) both;
}
@keyframes th-zoom {
  from { opacity: 0; transform: scale(0.6) rotate(-4deg); }
  to { opacity: 1; transform: scale(1) rotate(0); }
}
.th-ceremony-particles i {
  position: absolute;
  left: calc(8% + (var(--p) * 6%));
  top: 55%;
  width: 6px;
  height: 6px;
  background: var(--g-gold-hi);
  clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
  opacity: 0;
  animation: th-spark 1.6s calc(var(--p) * 90ms) var(--g-ease) both;
}
@keyframes th-spark {
  0% { opacity: 0; transform: translateY(0) scale(0.6); }
  30% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-42vh) scale(1.1) rotate(120deg); }
}
.th-ceremony-phrase {
  position: relative;
  text-align: center;
  animation: th-phrase 0.9s var(--g-ease) both;
}
.th-ceremony-rebus {
  margin: 0;
  font-family: var(--g-font-display);
  font-size: clamp(2rem, 6vw, 3.4rem);
  letter-spacing: 0.2em;
  background: linear-gradient(120deg, #f5ede0 30%, var(--g-gold) 70%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.th-ceremony-principle {
  margin: 0.6rem 0 0;
  font-size: 14px;
  color: var(--g-text);
}
@keyframes th-phrase {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: none; }
}
.th-ceremony.stage-zoom .th-ceremony-phrase { visibility: hidden; }
.th-ceremony-skip {
  position: absolute;
  right: 4vw;
  bottom: 4vh;
  background: none;
  border: 1px solid rgba(201, 162, 75, 0.5);
  border-radius: 2px;
  padding: 10px 20px;
  font-size: 12px;
  letter-spacing: 0.2em;
  color: var(--g-gold);
  cursor: pointer;
}
@media (prefers-reduced-motion: reduce) {
  .th-ceremony-glow,
  .th-ceremony-img,
  .th-ceremony-particles i,
  .th-ceremony-phrase {
    animation: none !important;
  }
  .th-ceremony-particles { display: none; }
}
```

JianzhiGame reveal phase:`unfold()` 完成后 `setRevealImage(handle.exportPNG(2))`,reveal JSX 换为:

```tsx
<UnfoldCeremony
  image={revealImage}
  phrase={revealPhrase}
  principle={revealPrinciple}
  reducedMotion={settings.reducedMotion}
  onClose={() => setPhase(activeLesson?.quiz ? 'quiz' : 'result')}
/>
```

- [ ] **Step 4: 跑测试 → 绿 → Commit**

```bash
git add src/games/jianzhi/theater/UnfoldCeremony.tsx src/games/jianzhi/theater/theater.css src/games/jianzhi/JianzhiGame.tsx tests/jianzhi-ceremony.test.ts
git commit -m "feat(jianzhi): 展开电影时刻"
```

---

### Task 4: 民艺馆作品墙 + 分享卡

**Files:**
- Create: `src/games/jianzhi/theater/shareCard.ts`
- Create: `src/games/jianzhi/theater/GalleryWall.tsx`
- Modify: `src/games/jianzhi/JianzhiGame.tsx`(codex works tab 替换 + 仪式定格帧加分享按钮)
- Modify: `src/games/jianzhi/theater/theater.css`(追加 wall 段)
- Test: `tests/jianzhi-gallery-share.test.ts`

**Interfaces:**
- Consumes: works state(既有 `{id,title,png,comboId?,createdAt}` — 以 JianzhiGame 现有 works 结构为准,执行时核对);`getCombo`。
- Produces: `buildShareCard({ workPng, title, phrase }): Promise<Blob>`(1080×1350);`GalleryWall({ works, onShare, onClose? })`。

- [ ] **Step 1: 写失败测试**

```ts
// tests/jianzhi-gallery-share.test.ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('shareCard builds 1080x1350 branded card with watermark', () => {
  const src = readFileSync(new URL('src/games/jianzhi/theater/shareCard.ts', root), 'utf8');
  assert.match(src, /1080/);
  assert.match(src, /1350/);
  assert.match(src, /REX-GAME/);
  assert.match(src, /纸上生花/);
  assert.match(src, /toBlob/);
});

test('GalleryWall frames works with spotlights and share action', () => {
  const src = readFileSync(new URL('src/games/jianzhi/theater/GalleryWall.tsx', root), 'utf8');
  assert.match(src, /th-wall/);
  assert.match(src, /th-frame/);
  assert.match(src, /分享|share/i);
  const game = readFileSync(new URL('src/games/jianzhi/JianzhiGame.tsx', root), 'utf8');
  assert.match(game, /GalleryWall/);
});
```

- [ ] **Step 2: 红 → Step 3: 实现**

```ts
// shareCard.ts — 作品分享卡:1080×1350 暗场金框 + 吉语 + 水印(离屏 canvas)
export async function buildShareCard({
  workPng,
  title,
  phrase,
}: {
  workPng: string;
  title: string;
  phrase?: string | null;
}): Promise<Blob> {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas unsupported');

  // 暗场底 + 朱红光晕
  ctx.fillStyle = '#0A0705';
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W * 0.72, H * 0.12, 60, W * 0.72, H * 0.12, 620);
  glow.addColorStop(0, 'rgba(200,46,33,0.4)');
  glow.addColorStop(1, 'rgba(200,46,33,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  //  eyebrow
  ctx.fillStyle = '#C9A24B';
  ctx.font = '30px serif';
  ctx.textAlign = 'center';
  try { (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '10px'; } catch { /* 旧内核忽略 */ }
  ctx.fillText('纸上生花 · 剪纸剧场', W / 2, 110);

  // 金框 + 作品
  const work = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = workPng;
  });
  const frame = 16;
  const boxSize = 880;
  const bx = (W - boxSize) / 2;
  const by = 190;
  ctx.fillStyle = '#F7F1E6';
  ctx.fillRect(bx - frame, by - frame, boxSize + frame * 2, boxSize + frame * 2);
  ctx.strokeStyle = '#C9A24B';
  ctx.lineWidth = 3;
  ctx.strokeRect(bx - frame - 6, by - frame - 6, boxSize + frame * 2 + 12, boxSize + frame * 2 + 12);
  ctx.drawImage(work, bx, by, boxSize, boxSize);

  // 标题与吉语
  ctx.fillStyle = '#F5EDE0';
  ctx.font = '700 64px serif';
  ctx.fillText(title, W / 2, by + boxSize + 130);
  if (phrase) {
    ctx.fillStyle = '#E8452F';
    ctx.font = '700 54px serif';
    ctx.fillText(phrase, W / 2, by + boxSize + 215);
  }

  // 水印
  ctx.fillStyle = '#C9A24B';
  ctx.font = '26px sans-serif';
  ctx.fillText('REX-GAME · 纸上生花 · game.rexai.top', W / 2, H - 60);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))), 'image/png');
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
```

```tsx
// GalleryWall.tsx
import type { JianzhiWork } from '../core/types';

export function GalleryWall({
  works,
  phraseOf,
  onShare,
}: {
  works: JianzhiWork[];
  phraseOf: (work: JianzhiWork) => string | null;
  onShare: (work: JianzhiWork) => void;
}) {
  if (!works.length) {
    return (
      <div className="th-wall-empty">
        <p>剪完第一课,这里会亮起第一盏灯。</p>
      </div>
    );
  }
  return (
    <div className="th-wall">
      {works.map((work) => (
        <figure key={work.id} className="th-frame">
          <span className="th-spot" aria-hidden="true" />
          <img src={work.png} alt={work.title} />
          <figcaption>
            <span className="th-frame-title">{work.title}</span>
            {phraseOf(work) ? <span className="th-frame-phrase">{phraseOf(work)}</span> : null}
            <button type="button" onClick={() => onShare(work)}>
              分享卡 ↓
            </button>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
```

CSS(wall):

```css
/* 民艺馆作品墙 */
.th-wall {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.6rem;
  padding: 1.4rem 0;
}
.th-frame {
  position: relative;
  margin: 0;
  padding: 12px 12px 0;
  background: #f7f1e6;
  border: 3px solid #8a6b2f;
  outline: 1px solid rgba(201, 162, 75, 0.5);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.55);
}
.th-frame img {
  display: block;
  width: 100%;
}
.th-spot {
  position: absolute;
  left: 50%;
  top: -34px;
  transform: translateX(-50%);
  width: 140%;
  height: 46px;
  background: radial-gradient(ellipse at 50% 0%, rgba(245, 225, 170, 0.3), transparent 70%);
  pointer-events: none;
}
.th-frame figcaption {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 4px 12px;
  background: #f7f1e6;
}
.th-frame-title {
  font-family: var(--g-font-display);
  font-size: 15px;
  color: #1a120b;
}
.th-frame-phrase {
  font-size: 12px;
  color: #a6332b;
}
.th-frame button {
  align-self: flex-start;
  margin-top: 4px;
  background: none;
  border: 1px solid rgba(166, 51, 43, 0.5);
  border-radius: 2px;
  padding: 4px 12px;
  font-size: 11px;
  color: #a6332b;
  cursor: pointer;
}
.th-wall-empty {
  padding: 4rem 0;
  text-align: center;
  color: var(--g-text-dim);
  font-family: var(--g-font-display);
  letter-spacing: 0.1em;
}
```

JianzhiGame:codex `works` tab JSX 替换为 `<GalleryWall works={works} phraseOf={(w) => getCombo(w.comboId ?? '')?.phrase ?? null} onShare={handleShareWork} />`;`handleShareWork` 调 `buildShareCard` + `downloadBlob`(文件名 `纸上生花-<title>.png`);仪式定格帧(UnfoldCeremony `stage-done` 时 skip 按钮旁)同样加「分享卡 ↓」复用同 handler。works 的 `JianzhiWork` 类型以 `core/types.ts` 为准(执行时核对字段名,如为 `image` 而非 `png` 则按其修正)。

- [ ] **Step 4: 跑测试 → 绿 → Commit**

```bash
git add src/games/jianzhi/theater src/games/jianzhi/JianzhiGame.tsx tests/jianzhi-gallery-share.test.ts
git commit -m "feat(jianzhi): 民艺馆作品墙与作品分享卡"
```

---

### Task 5: AI 场景大图 + 纸纹理 + 全量验收

**Files:**
- Create: `public/assets/jianzhi/scenes/scene-{newyear,wedding,silk,reunion}.webp`(AI 生成或 SVG 回落)
- Create: `public/assets/jianzhi/paper-red.webp`(纸纹理)
- Modify: `src/games/jianzhi/content/acts.ts`(scene.image 填入)
- Modify: `src/games/jianzhi/theater/theater.css`(纸纹理叠加)
- Test: `tests/jianzhi-scenes.test.ts`

- [ ] **Step 1: 生成场景大图(优先 AI,失败回落)**

尝试 rexai-image-generation 技能/工具生成 4 张(统一提示词):
`dark lacquer background, warm golden light, Chinese paper-cut theater scene, <场景词>, folk art, cinnabar red and antique gold palette, no text, cinematic`。
场景词:newyear=`snowy night outside a glowing wooden window lattice, fu character paper-cut on window`;wedding=`wedding chamber with red candles and double-happy paper-cut`;silk=`silk road night, lantern and distant dunes`;reunion=`family reunion under warm lamp, round table glow`。

生成 → `sharp` 压 webp(≤1600px,quality 78)→ `public/assets/jianzhi/scenes/`。**任一失败/超时**:回落方案 = 把 SceneArt 的四段 SVG 用 sharp 渲成 PNG 放同路径(SVG→PNG 管线同 OG),acts.ts 的 `scene.image` 照常填入——视觉一致且零外部依赖。

- [ ] **Step 2: 写测试**

```ts
// tests/jianzhi-scenes.test.ts
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('every act scene image exists on disk when configured', async () => {
  const { ACTS } = await import('../src/games/jianzhi/content/acts.ts');
  for (const act of ACTS) {
    assert.ok(act.scene.image, `${act.id} scene.image not configured`);
    const p = new URL(`../public${act.scene.image}`, import.meta.url);
    assert.ok(existsSync(p), `${act.scene.image} missing`);
  }
});
```

- [ ] **Step 3: acts.ts 填入 scene.image 并跑测试**

每个 act 的 scene 加 `image: '/assets/jianzhi/scenes/scene-<art>.webp'`(silk → `scene-silk.webp`)。

Run: `pnpm test`
Expected: PASS

- [ ] **Step 4: 纸纹理叠加(theater.css)**

```css
/* 纸纹理(剪纸台/卡片低透明叠加) */
.th-paper::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url('/assets/jianzhi/paper-red.webp');
  background-size: 420px;
  opacity: 0.08;
  pointer-events: none;
}
.th-paper { position: relative; }
.th-paper > * { position: relative; }
```

纸纹理生成:AI(洒金红纸平铺纹理)或 sharp 程序化生成(红底+随机金点 SVG);入 `public/assets/jianzhi/paper-red.webp`。

- [ ] **Step 5: 全量验收**

Run: `pnpm test`(全绿)
Run: `git worktree add /tmp/rex-game-s3 HEAD && cd /tmp/rex-game-s3 && pnpm install --prefer-offline --silent && pnpm build`;随后 `git worktree remove --force /tmp/rex-game-s3`
目检(dev 3030):4 幕通关流程、揭幕/点亮、台词、展开仪式、分享卡下载、作品墙;reduced-motion 模拟;移动端布局。

- [ ] **Step 6: Commit**

```bash
git add public/assets/jianzhi src/games/jianzhi/content/acts.ts src/games/jianzhi/theater/theater.css tests/jianzhi-scenes.test.ts
git commit -m "feat(jianzhi): 剧场场景大图与纸纹理,纸上剧场全量上线"
```

---

## Self-Review 记录

- **Spec 覆盖:** §4.1 幕布地图 → T1;§4.2 幕内界面 → T2;§4.3 课程映射 → T1 acts.ts(已按校准后映射);§4.4 解锁点亮 → T1 buildActStates;§5.1 展开仪式 → T3;§5.2 分享卡 → T4;§5.3 作品墙 → T4;§6 美术资产 → T5;§7 进度迁移 → 经勘探确认**无需迁移**(幕状态全部由既有 progress 派生,v2 schema 不变),以 `buildActStates` 测试锁定;§8 任务划分 → T1–T5 对应;§9 验收 → T5 Step 5。
- **占位符:** 无;JianzhiGame 接入点给了行号锚与替换 JSX,执行时按现状微调。
- **类型一致:** `ActState` 在 T1 定义、T2/T3 消费一致;`scene.image` 在 T1 类型预留、T5 填入、测试验证存在;`UnfoldCeremony` props 与现有 `revealPhrase/revealPrinciple/settings.reducedMotion` 对齐;works 字段以 `core/types.ts` 为唯一准。
