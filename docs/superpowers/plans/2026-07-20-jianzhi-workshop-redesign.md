# 纸上生花 · 学徒工坊一体重做 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将剪纸游戏重做为「非遗工坊学徒」体验：材质优先的红纸视觉、七课线性功课 + 出师后时令委托、单课「拜帖→折→剪→展开揭晓→巩固」循环，进度 v2 与吉语顿悟层。

**Architecture:** 纯逻辑层（types / progress / evaluate / content）先 TDD 落地；再重写 `JianzhiGame.tsx` 视图状态机（map | lesson | practice | commission | codex | settings）与 CSS 材质语言；画布引擎 `paperCanvas` 只做材质与展开增强，不改对外 handle 形状。纹样/吉语库（`motifs.ts` / `combos.ts`）保留 id 与 draw。

**Tech Stack:** Next.js 15 (App Router, static export), React 19, CSS Modules, Canvas 2D, Node test runner (`node --experimental-strip-types --test`).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-20-jianzhi-workshop-redesign-design.md`
- 阶段一固定 **7 课**；出师后解锁委托；一期含 **2 委托**（`spring-window`, `wedding-xi`）
- 进度 key: `rex-game:jianzhi:progress:v2`；作品/设置 v1 键沿用
- 视觉：材质优先；禁止 Georgia 巨型英文水印与默认实心偏移黑阴影按钮
- 字体：`var(--font-display)` / `var(--font-body)`；金箔仅点缀
- 保留 `createPaperCanvas` API 形状与 `createPaperAudio`
- 测试：`pnpm test` 或 `node --experimental-strip-types --test tests/*.test.ts`
- 不改首页/圣杯/英歌全局皮肤；仅剪纸页内对齐 token

---

## File Structure

| Path | Responsibility |
|------|----------------|
| `src/games/jianzhi/core/types.ts` | FoldMode, MotifDef, RebusCombo 保留；Lesson / Commission / Progress v2；弃用 Chapter 主键 |
| `src/games/jianzhi/core/progress.ts` | v2 创建/解析/迁移/完成功课/完成委托/收集 |
| `src/games/jianzhi/core/evaluate.ts` | `evaluateObjective`：motif 集合或 any-combo |
| `src/games/jianzhi/core/rebus.ts` | 不变 |
| `src/games/jianzhi/content/lessons.ts` | 7 课数据 + getLesson |
| `src/games/jianzhi/content/commissions.ts` | 2 委托 + getCommission |
| `src/games/jianzhi/content/culture.ts` | 从 chapters 拆出的文化档案 |
| `src/games/jianzhi/content/chapters.ts` | **删除**（由 lessons + culture 替代） |
| `src/games/jianzhi/content/motifs.ts` | 保留 |
| `src/games/jianzhi/content/combos.ts` | 保留 |
| `src/games/jianzhi/JianzhiGame.tsx` | 视图状态机 + 五段循环 + 揭晓层 |
| `src/games/jianzhi/JianzhiGame.module.css` | 红纸材质工坊视觉 |
| `src/games/jianzhi/runtime/paperCanvas.ts` | 纸面噪点、折痕、展开时长 |
| `src/games/jianzhi/runtime/audio.ts` | 保留 |
| `app/games/jianzhi/page.tsx` | SEO 文案对齐学徒工坊 |
| `tests/jianzhi-progress.test.ts` | 进度 v2 + 迁移 |
| `tests/jianzhi-content.test.ts` | 7 课、委托、motif/combo 引用完整性 |
| `tests/jianzhi-evaluate.test.ts` | 目标判定 |

---

### Task 1: Types — Lesson / Commission / Progress v2

**Files:**
- Modify: `src/games/jianzhi/core/types.ts`
- Test: (types covered by Task 2–3 imports)

**Interfaces:**
- Produces: `JianzhiLessonId`, `JianzhiLesson`, `JianzhiCommission`, `JianzhiProgress` (v2), `LessonReading`, `LessonQuiz`, `ObjectiveMode`, `ChapterEvaluation` renamed usage as `ObjectiveEvaluation`

- [ ] **Step 1: Replace chapter-centric types with lesson/commission model**

Rewrite `src/games/jianzhi/core/types.ts` so that:

```ts
export type FoldMode = 'single' | 'book' | 'four' | 'rosette';

export type JianzhiLessonId =
  | 'awaken'
  | 'symmetry'
  | 'rebus-intro'
  | 'window-four'
  | 'silk-rosette'
  | 'fu-shou'
  | 'graduate';

export type JianzhiCommissionId = 'spring-window' | 'wedding-xi';

export type EvidenceKind = 'recorded' | 'oral-tradition' | 'game-interpretation';
export type MotifCategory = 'animal' | 'plant' | 'character' | 'object' | 'symbol';

export interface MotifDef {
  id: string;
  name: string;
  pinyin: string;
  meaning: string;
  lesson: string;
  region: string;
  category: MotifCategory;
  evidence: EvidenceKind;
  sourceLabel: string;
  sourceUrl: string;
  draw: (ctx: CanvasRenderingContext2D) => void;
}

export interface JianzhiCultureEntry {
  id: string;
  title: string;
  region: string;
  category: 'history' | 'regional' | 'festival' | 'heritage' | 'symbol';
  summary: string;
  detail: string;
  evidence: EvidenceKind;
  sourceLabel: string;
  sourceUrl: string;
}

export interface RebusCombo {
  id: string;
  phrase: string;
  motifIds: string[];
  principle: string;
  tagline: string;
  evidence: EvidenceKind;
  sourceLabel: string;
  sourceUrl: string;
}

export interface LessonReading {
  origin: string;
  technique: string;
  focus: string;
}

export interface LessonQuiz {
  question: string;
  options: string[];
  answer: number;
  explain: string;
}

/** motifs: 必须集齐 objectiveMotifIds；any-combo: 拼出库内任意一句吉语即过 */
export type ObjectiveMode = 'motifs' | 'any-combo';

export interface JianzhiLesson {
  id: JianzhiLessonId;
  order: number;
  title: string;
  subtitle: string;
  region: string;
  foldSuggestion: FoldMode;
  narrative: string[];
  reading: LessonReading;
  objectiveMode: ObjectiveMode;
  objectiveMotifIds: string[];
  targetComboId?: string;
  quiz?: LessonQuiz;
  culturalFocus: string;
  cultureEntryIds: string[];
  reward: string;
}

export interface JianzhiCommission {
  id: JianzhiCommissionId;
  title: string;
  season: string;
  brief: string;
  foldSuggestion: FoldMode;
  objectiveMode: ObjectiveMode;
  objectiveMotifIds: string[];
  targetComboId?: string;
  cultureEntryIds: string[];
  reward: string;
  reading: LessonReading;
  narrative: string[];
  quiz?: LessonQuiz;
}

export interface JianzhiSettings {
  reducedMotion: boolean;
  muted: boolean;
}

export interface JianzhiProgress {
  version: 2;
  curriculumUnlocked: number;
  completedLessons: JianzhiLessonId[];
  completedCommissions: JianzhiCommissionId[];
  collectedMotifIds: string[];
  discoveredCombos: string[];
  cultureEntryIds: string[];
  graduated: boolean;
}

export interface SavedWork {
  id: string;
  name: string;
  dataUrl: string;
  fold: FoldMode;
  motifIds: string[];
  createdAt: number;
}

export interface ObjectiveEvaluation {
  passed: boolean;
  missing: string[];
}

export type PaperMark =
  | { type: 'stroke'; points: Array<{ x: number; y: number }>; width: number }
  | { type: 'motif'; id: string; def: MotifDef; x: number; y: number; scale: number };
```

Remove `JianzhiChapter`, `JianzhiChapterId`, `ChapterReading`, `ChapterQuiz`, `ChapterEvaluation` (replace with Lesson* / ObjectiveEvaluation). Keep temporary type aliases only if a mid-task compile needs them — prefer clean break and fix imports in later tasks same commit batch.

- [ ] **Step 2: Commit types**

```bash
git add src/games/jianzhi/core/types.ts
git commit -m "refactor(jianzhi): introduce lesson/commission progress types"
```

---

### Task 2: Progress v2 + migration (TDD)

**Files:**
- Create: `tests/jianzhi-progress.test.ts`
- Modify: `src/games/jianzhi/core/progress.ts`

**Interfaces:**
- Consumes: `JianzhiProgress`, `JianzhiLessonId`, `JianzhiCommissionId` from types
- Produces:
  - `PROGRESS_KEY_V2 = 'rex-game:jianzhi:progress:v2'`
  - `PROGRESS_KEY_V1 = 'rex-game:jianzhi:progress:v1'`
  - `createInitialJianzhiProgress(): JianzhiProgress`
  - `parseJianzhiProgress(value: string | null): JianzhiProgress`
  - `migrateV1ToV2(raw: unknown): JianzhiProgress`
  - `recordLessonCompletion(progress, lessonId, order, cultureEntryIds, motifIds, totalLessons, comboIds): JianzhiProgress`
  - `recordCommissionCompletion(progress, commissionId, cultureEntryIds, motifIds, comboIds): JianzhiProgress`
  - `collectMotifs`, `discoverCombos`, `createWork`, `addWork`, `removeWork` (keep)

- [ ] **Step 1: Write failing tests**

Create `tests/jianzhi-progress.test.ts`:

```ts
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createInitialJianzhiProgress,
  parseJianzhiProgress,
  recordLessonCompletion,
  recordCommissionCompletion,
  collectMotifs,
  discoverCombos,
} from '../src/games/jianzhi/core/progress.ts';

test('initial progress is v2 locked to lesson 1', () => {
  const p = createInitialJianzhiProgress();
  assert.equal(p.version, 2);
  assert.equal(p.curriculumUnlocked, 1);
  assert.deepEqual(p.completedLessons, []);
  assert.deepEqual(p.completedCommissions, []);
  assert.equal(p.graduated, false);
});

test('recordLessonCompletion unlocks next and sets graduated on last lesson', () => {
  let p = createInitialJianzhiProgress();
  p = recordLessonCompletion(p, 'awaken', 1, ['origin'], ['fu'], 7, []);
  assert.ok(p.completedLessons.includes('awaken'));
  assert.equal(p.curriculumUnlocked, 2);
  assert.ok(p.cultureEntryIds.includes('origin'));
  assert.ok(p.collectedMotifIds.includes('fu'));

  p = recordLessonCompletion(p, 'graduate', 7, ['heritage'], [], 7, ['lian-nian-you-yu']);
  assert.equal(p.graduated, true);
  assert.equal(p.curriculumUnlocked, 7);
  assert.ok(p.discoveredCombos.includes('lian-nian-you-yu'));
});

test('recordCommissionCompletion does not change curriculumUnlocked', () => {
  let p = createInitialJianzhiProgress();
  p = { ...p, graduated: true, curriculumUnlocked: 7 };
  p = recordCommissionCompletion(p, 'spring-window', ['window-flower'], ['fu', 'fish'], []);
  assert.ok(p.completedCommissions.includes('spring-window'));
  assert.equal(p.curriculumUnlocked, 7);
});

test('parse migrates v1 completedChapters to completedLessons best-effort', () => {
  const v1 = JSON.stringify({
    unlocked: 3,
    completedChapters: ['awaken', 'north-window'],
    collectedMotifIds: ['fu'],
    cultureEntryIds: ['origin'],
    discoveredCombos: ['lian-nian-you-yu'],
  });
  const p = parseJianzhiProgress(v1);
  assert.equal(p.version, 2);
  assert.ok(p.completedLessons.includes('awaken'));
  assert.equal(p.curriculumUnlocked, 3);
  assert.ok(p.collectedMotifIds.includes('fu'));
  assert.ok(p.discoveredCombos.includes('lian-nian-you-yu'));
});

test('parse v2 round-trip', () => {
  const raw = createInitialJianzhiProgress();
  raw.curriculumUnlocked = 4;
  raw.completedLessons = ['awaken', 'symmetry', 'rebus-intro'];
  const p = parseJianzhiProgress(JSON.stringify(raw));
  assert.equal(p.curriculumUnlocked, 4);
  assert.equal(p.completedLessons.length, 3);
});

test('collectMotifs and discoverCombos are idempotent unions', () => {
  let p = createInitialJianzhiProgress();
  p = collectMotifs(p, ['fu', 'fish']);
  p = collectMotifs(p, ['fu']);
  assert.deepEqual(p.collectedMotifIds.sort(), ['fish', 'fu']);
  p = discoverCombos(p, ['lian-nian-you-yu']);
  p = discoverCombos(p, ['lian-nian-you-yu']);
  assert.deepEqual(p.discoveredCombos, ['lian-nian-you-yu']);
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
node --experimental-strip-types --test tests/jianzhi-progress.test.ts
```

Expected: FAIL (missing exports / wrong shapes)

- [ ] **Step 3: Implement `progress.ts`**

```ts
import type {
  FoldMode,
  JianzhiCommissionId,
  JianzhiLessonId,
  JianzhiProgress,
  SavedWork,
} from './types';

export const PROGRESS_KEY_V2 = 'rex-game:jianzhi:progress:v2';
export const PROGRESS_KEY_V1 = 'rex-game:jianzhi:progress:v1';

const LESSON_COUNT = 7;

const V1_CHAPTER_TO_LESSON: Record<string, JianzhiLessonId | undefined> = {
  awaken: 'awaken',
  'north-window': 'rebus-intro',
  'south-fine': 'window-four',
  'silk-rosette': 'silk-rosette',
  zodiac: 'fu-shou',
  legacy: 'graduate',
};

export function createInitialJianzhiProgress(): JianzhiProgress {
  return {
    version: 2,
    curriculumUnlocked: 1,
    completedLessons: [],
    completedCommissions: [],
    collectedMotifIds: [],
    discoveredCombos: [],
    cultureEntryIds: [],
    graduated: false,
  };
}

function isLessonId(id: string): id is JianzhiLessonId {
  return (
    id === 'awaken' ||
    id === 'symmetry' ||
    id === 'rebus-intro' ||
    id === 'window-four' ||
    id === 'silk-rosette' ||
    id === 'fu-shou' ||
    id === 'graduate'
  );
}

function isCommissionId(id: string): id is JianzhiCommissionId {
  return id === 'spring-window' || id === 'wedding-xi';

export function migrateV1ToV2(parsed: Record<string, unknown>): JianzhiProgress {
  const base = createInitialJianzhiProgress();
  const chapters = Array.isArray(parsed.completedChapters)
    ? (parsed.completedChapters as string[])
    : [];
  const completedLessons = [
    ...new Set(
      chapters
        .map((c) => V1_CHAPTER_TO_LESSON[c])
        .filter((x): x is JianzhiLessonId => Boolean(x)),
    ),
  ];
  const unlockedRaw = Number(parsed.unlocked);
  const curriculumUnlocked = Number.isFinite(unlockedRaw)
    ? Math.max(1, Math.min(LESSON_COUNT, Math.round(unlockedRaw)))
    : Math.max(1, completedLessons.length + 1);

  return {
    ...base,
    curriculumUnlocked: Math.min(LESSON_COUNT, Math.max(curriculumUnlocked, completedLessons.length + 1 > LESSON_COUNT ? LESSON_COUNT : Math.max(curriculumUnlocked, completedLessons.length ? completedLessons.length : 1))),
    completedLessons,
    collectedMotifIds: Array.isArray(parsed.collectedMotifIds)
      ? (parsed.collectedMotifIds as string[])
      : [],
    cultureEntryIds: Array.isArray(parsed.cultureEntryIds)
      ? (parsed.cultureEntryIds as string[])
      : [],
    discoveredCombos: Array.isArray(parsed.discoveredCombos)
      ? (parsed.discoveredCombos as string[])
      : [],
    graduated: completedLessons.includes('graduate'),
  };
}

export function parseJianzhiProgress(value: string | null): JianzhiProgress {
  const base = createInitialJianzhiProgress();
  if (!value) return base;
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    if (parsed.version === 2 || Array.isArray(parsed.completedLessons)) {
      const completedLessons = Array.isArray(parsed.completedLessons)
        ? (parsed.completedLessons as string[]).filter(isLessonId)
        : [];
      const completedCommissions = Array.isArray(parsed.completedCommissions)
        ? (parsed.completedCommissions as string[]).filter(isCommissionId)
        : [];
      const unlockedRaw = Number(parsed.curriculumUnlocked ?? parsed.unlocked);
      return {
        version: 2,
        curriculumUnlocked: Number.isFinite(unlockedRaw)
          ? Math.max(1, Math.min(LESSON_COUNT, Math.round(unlockedRaw)))
          : 1,
        completedLessons,
        completedCommissions,
        collectedMotifIds: Array.isArray(parsed.collectedMotifIds)
          ? (parsed.collectedMotifIds as string[])
          : [],
        cultureEntryIds: Array.isArray(parsed.cultureEntryIds)
          ? (parsed.cultureEntryIds as string[])
          : [],
        discoveredCombos: Array.isArray(parsed.discoveredCombos)
          ? (parsed.discoveredCombos as string[])
          : [],
        graduated: Boolean(parsed.graduated) || completedLessons.includes('graduate'),
      };
    }
    // v1 shape
    if (Array.isArray(parsed.completedChapters) || parsed.unlocked != null) {
      return migrateV1ToV2(parsed);
    }
    return base;
  } catch {
    return base;
  }
}

export function recordLessonCompletion(
  progress: JianzhiProgress,
  lessonId: JianzhiLessonId,
  order: number,
  cultureEntryIds: string[],
  motifIds: string[],
  totalLessons: number,
  comboIds: string[] = [],
): JianzhiProgress {
  const completedLessons = progress.completedLessons.includes(lessonId)
    ? progress.completedLessons
    : [...progress.completedLessons, lessonId];
  const collectedMotifIds = [...new Set([...progress.collectedMotifIds, ...motifIds])];
  const culture = [...new Set([...progress.cultureEntryIds, ...cultureEntryIds])];
  const discoveredCombos = [...new Set([...progress.discoveredCombos, ...comboIds])];
  const curriculumUnlocked = Math.max(
    progress.curriculumUnlocked,
    Math.min(totalLessons, order + 1),
  );
  const graduated = progress.graduated || lessonId === 'graduate' || order >= totalLessons;
  return {
    version: 2,
    curriculumUnlocked: graduated ? totalLessons : curriculumUnlocked,
    completedLessons,
    completedCommissions: progress.completedCommissions,
    collectedMotifIds,
    cultureEntryIds: culture,
    discoveredCombos,
    graduated,
  };
}

export function recordCommissionCompletion(
  progress: JianzhiProgress,
  commissionId: JianzhiCommissionId,
  cultureEntryIds: string[],
  motifIds: string[],
  comboIds: string[] = [],
): JianzhiProgress {
  const completedCommissions = progress.completedCommissions.includes(commissionId)
    ? progress.completedCommissions
    : [...progress.completedCommissions, commissionId];
  return {
    ...progress,
    version: 2,
    completedCommissions,
    collectedMotifIds: [...new Set([...progress.collectedMotifIds, ...motifIds])],
    cultureEntryIds: [...new Set([...progress.cultureEntryIds, ...cultureEntryIds])],
    discoveredCombos: [...new Set([...progress.discoveredCombos, ...comboIds])],
  };
}

export function collectMotifs(progress: JianzhiProgress, motifIds: string[]): JianzhiProgress {
  if (!motifIds.length) return progress;
  return {
    ...progress,
    collectedMotifIds: [...new Set([...progress.collectedMotifIds, ...motifIds])],
  };
}

export function discoverCombos(progress: JianzhiProgress, comboIds: string[]): JianzhiProgress {
  if (!comboIds.length) return progress;
  const discoveredCombos = [...new Set([...progress.discoveredCombos, ...comboIds])];
  if (discoveredCombos.length === progress.discoveredCombos.length) return progress;
  return { ...progress, discoveredCombos };
}

export interface CreateWorkInput {
  dataUrl: string;
  fold: FoldMode;
  motifIds: string[];
  name: string;
}

export function createWork(input: CreateWorkInput): SavedWork {
  return {
    id: `w-${Date.now()}`,
    name: input.name,
    dataUrl: input.dataUrl,
    fold: input.fold,
    motifIds: input.motifIds,
    createdAt: Date.now(),
  };
}

export function addWork(works: SavedWork[], work: SavedWork, limit = 30): SavedWork[] {
  return [work, ...works].slice(0, limit);
}

export function removeWork(works: SavedWork[], id: string): SavedWork[] {
  return works.filter((w) => w.id !== id);
}
```

Simplify `migrateV1ToV2` curriculumUnlocked if the nested Math is hard to reason — implementer may use:

```ts
const fromUnlock = Number.isFinite(Number(parsed.unlocked))
  ? Math.max(1, Math.min(LESSON_COUNT, Math.round(Number(parsed.unlocked))))
  : 1;
const fromCompleted = Math.min(LESSON_COUNT, completedLessons.length + 1);
const curriculumUnlocked = Math.max(fromUnlock, fromCompleted > LESSON_COUNT ? LESSON_COUNT : fromCompleted);
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
node --experimental-strip-types --test tests/jianzhi-progress.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/games/jianzhi/core/progress.ts tests/jianzhi-progress.test.ts
git commit -m "feat(jianzhi): progress v2 with v1 migration"
```

---

### Task 3: Objective evaluate (TDD)

**Files:**
- Create: `tests/jianzhi-evaluate.test.ts`
- Modify: `src/games/jianzhi/core/evaluate.ts`

**Interfaces:**
- Consumes: `ObjectiveMode`, `ObjectiveEvaluation`, `RebusCombo`
- Produces: `evaluateObjective({ objectiveMode, objectiveMotifIds }, placedMotifIds, combos?: RebusCombo[]): ObjectiveEvaluation`

- [ ] **Step 1: Write failing tests**

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateObjective } from '../src/games/jianzhi/core/evaluate.ts';
import { JIANZHI_COMBOS } from '../src/games/jianzhi/content/combos.ts';

test('motifs mode requires all objective ids', () => {
  const r = evaluateObjective(
    { objectiveMode: 'motifs', objectiveMotifIds: ['lotus', 'fish'] },
    ['lotus'],
  );
  assert.equal(r.passed, false);
  assert.deepEqual(r.missing, ['fish']);
});

test('motifs mode passes when all present', () => {
  const r = evaluateObjective(
    { objectiveMode: 'motifs', objectiveMotifIds: ['fu'] },
    ['fu', 'fish'],
  );
  assert.equal(r.passed, true);
  assert.deepEqual(r.missing, []);
});

test('any-combo mode passes when any library combo is formed', () => {
  const fail = evaluateObjective(
    { objectiveMode: 'any-combo', objectiveMotifIds: [] },
    ['fu'],
    JIANZHI_COMBOS,
  );
  assert.equal(fail.passed, false);

  const ok = evaluateObjective(
    { objectiveMode: 'any-combo', objectiveMotifIds: [] },
    ['lotus', 'fish'],
    JIANZHI_COMBOS,
  );
  assert.equal(ok.passed, true);
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
node --experimental-strip-types --test tests/jianzhi-evaluate.test.ts
```

- [ ] **Step 3: Implement**

```ts
import type { ObjectiveEvaluation, ObjectiveMode, RebusCombo } from './types';
import { detectCombos } from './rebus';

export interface ObjectiveSpec {
  objectiveMode: ObjectiveMode;
  objectiveMotifIds: string[];
}

export function evaluateObjective(
  spec: ObjectiveSpec,
  placedMotifIds: string[],
  combos: RebusCombo[] = [],
): ObjectiveEvaluation {
  if (spec.objectiveMode === 'any-combo') {
    const formed = detectCombos(placedMotifIds, combos);
    return { passed: formed.length > 0, missing: formed.length ? [] : ['*any-combo*'] };
  }
  const missing = spec.objectiveMotifIds.filter((id) => !placedMotifIds.includes(id));
  return { passed: missing.length === 0, missing };
}
```

Remove old `evaluateChapter` or re-export wrapper that throws — do not leave dead chapter API.

- [ ] **Step 4: Run — PASS, commit**

```bash
node --experimental-strip-types --test tests/jianzhi-evaluate.test.ts
git add src/games/jianzhi/core/evaluate.ts tests/jianzhi-evaluate.test.ts
git commit -m "feat(jianzhi): objective evaluate for motifs and any-combo"
```

---

### Task 4: Culture + 7 lessons + 2 commissions content

**Files:**
- Create: `src/games/jianzhi/content/culture.ts`
- Create: `src/games/jianzhi/content/lessons.ts`
- Create: `src/games/jianzhi/content/commissions.ts`
- Create: `tests/jianzhi-content.test.ts`
- Delete: `src/games/jianzhi/content/chapters.ts` (after no imports remain — may wait until Task 5 if still imported)

**Interfaces:**
- Produces: `JIANZHI_CULTURE_ENTRIES`, `JIANZHI_LESSONS` (length 7), `JIANZHI_COMMISSIONS` (length 2), `getLesson`, `getCommission`, `LESSON_COUNT = 7`

- [ ] **Step 1: Write content contract tests**

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { JIANZHI_LESSONS, LESSON_COUNT, getLesson } from '../src/games/jianzhi/content/lessons.ts';
import { JIANZHI_COMMISSIONS } from '../src/games/jianzhi/content/commissions.ts';
import { JIANZHI_CULTURE_ENTRIES } from '../src/games/jianzhi/content/culture.ts';
import { getMotif } from '../src/games/jianzhi/content/motifs.ts';
import { getCombo } from '../src/games/jianzhi/content/combos.ts';

test('exactly 7 lessons ordered 1..7 with graduate last', () => {
  assert.equal(JIANZHI_LESSONS.length, LESSON_COUNT);
  assert.equal(LESSON_COUNT, 7);
  JIANZHI_LESSONS.forEach((l, i) => assert.equal(l.order, i + 1));
  assert.equal(JIANZHI_LESSONS[6].id, 'graduate');
  assert.equal(JIANZHI_LESSONS[6].objectiveMode, 'any-combo');
});

test('every lesson motif and combo id exists', () => {
  for (const l of JIANZHI_LESSONS) {
    for (const id of l.objectiveMotifIds) {
      assert.ok(getMotif(id), `missing motif ${id} in lesson ${l.id}`);
    }
    if (l.targetComboId) {
      assert.ok(getCombo(l.targetComboId), `missing combo ${l.targetComboId}`);
    }
    for (const cid of l.cultureEntryIds) {
      assert.ok(
        JIANZHI_CULTURE_ENTRIES.some((e) => e.id === cid),
        `missing culture ${cid}`,
      );
    }
  }
});

test('two commissions reference valid motifs', () => {
  assert.equal(JIANZHI_COMMISSIONS.length, 2);
  assert.ok(JIANZHI_COMMISSIONS.find((c) => c.id === 'spring-window'));
  assert.ok(JIANZHI_COMMISSIONS.find((c) => c.id === 'wedding-xi'));
  for (const c of JIANZHI_COMMISSIONS) {
    for (const id of c.objectiveMotifIds) {
      assert.ok(getMotif(id), id);
    }
  }
});

test('getLesson returns by id', () => {
  assert.equal(getLesson('awaken')?.title.includes('红纸') || getLesson('awaken')?.id, 'awaken');
});
```

- [ ] **Step 2: Move culture entries**

Copy `JIANZHI_CULTURE_ENTRIES` from old `chapters.ts` into `culture.ts` unchanged (same 7 entries: origin, north-south, window-flower, wedding-flower, rosette-silk, zodiac, heritage).

- [ ] **Step 3: Author 7 lessons in `lessons.ts`**

Required bindings (do not invent motif ids):

| order | id | fold | mode | motifs | targetCombo | culture |
|------|-----|------|------|--------|-------------|---------|
| 1 | awaken | book | motifs | fu | — | origin |
| 2 | symmetry | book | motifs | fish | — | north-south (or origin only — use `north-south` for 南秀北雄 intro via symmetry) |
| 3 | rebus-intro | book | motifs | lotus, fish | lian-nian-you-yu | window-flower |
| 4 | window-four | four | motifs | plum | — | window-flower (already ok) + keep |
| 5 | silk-rosette | rosette | motifs | butterfly, peony | die-lian-hua | rosette-silk |
| 6 | fu-shou | book | motifs | bat, peach | fu-shou-shuang-quan | wedding-flower optional → use empty extra; culture `zodiac` moved to commission — use no new or heritage later |
| 7 | graduate | four | any-combo | [] | — | heritage |

Narrative: 2–4 short 师傅/纸灵 lines each. Reading: origin/technique/focus. Quiz on lessons 1–6 and graduate. Reuse quiz text from old chapters where it still fits; rewrite for new order.

Export:

```ts
export const LESSON_COUNT = 7;
export const JIANZHI_LESSONS: JianzhiLesson[] = [ /* ... */ ];
export function getLesson(id: string): JianzhiLesson | undefined {
  return JIANZHI_LESSONS.find((l) => l.id === id);
}
```

- [ ] **Step 4: Author commissions**

```ts
// spring-window: fu + fish, fold four, culture window-flower
// wedding-xi: peony + double-happy, fold book, culture wedding-flower, targetCombo fu-gui-shuang-xi if exists
```

Verify `fu-gui-shuang-xi` exists in combos (old chapter used it). If missing, omit targetComboId.

- [ ] **Step 5: Run content tests PASS, commit**

```bash
node --experimental-strip-types --test tests/jianzhi-content.test.ts
git add src/games/jianzhi/content/culture.ts src/games/jianzhi/content/lessons.ts src/games/jianzhi/content/commissions.ts tests/jianzhi-content.test.ts
git commit -m "feat(jianzhi): seven lessons and seasonal commissions content"
```

---

### Task 5: CSS — material workshop shell (no React yet)

**Files:**
- Modify: `src/games/jianzhi/JianzhiGame.module.css` (full rewrite of visual language)

**Interfaces:**
- Produces class names used by Task 6–8 (list must match):

```
.root, .toast, .shell, .enter, .wordmark, .heroTitle, .heroLead, .primaryBtn, .ghostBtn,
.map, .mapHeader, .lessonTrack, .lessonCard, .lessonLocked, .lessonDone, .lessonCurrent,
.commissionSection, .commissionCard, .commissionDone, .subnav, .subnavBtn,
.workshop, .workshopBar, .barBack, .barTitle, .barFold, .workshopBody, .stage, .canvasFrame,
.canvasHost, .controls, .foldRow, .foldBtn, .foldActive, .toolRow, .toolBtn, .toolActive,
.toolHint, .actionRow, .actionBtn, .unfoldBtn, .unfoldReady, .saveRow, .side, .card,
.sideLabel, .objectiveList, .objectiveItem, .objectiveOk, .focusNote, .comboTarget,
.comboTargetLabel, .comboTargetPhrase, .comboPiece, .comboPieceOk, .comboLog, .comboLogItem,
.paletteGrid, .chip, .chipActive, .chipKnown, .reading, .readingTitle, .readingBlock,
.reveal, .revealInner, .revealPhrase, .revealPrinciple, .revealActions, .quiz, .quizOption,
.quizExplain, .result, .codex, .tabs, .tab, .tabActive, .motifGrid, .archiveCard, .worksGrid,
.workCard, .settings, .settingsRow, .backRow, .seal
```

- [ ] **Step 1: Rewrite CSS tokens and base**

Replace top of module with material workshop tokens (not editorial print):

```css
.root {
  --jz-ink: #1a120b;
  --jz-ink-soft: #6e5a46;
  --jz-paper: #e8dcc0;
  --jz-paper-2: #f4ecd8;
  --jz-wood: #2a1b12;
  --jz-red: #a6332b;
  --jz-red-deep: #872520;
  --jz-gold: #c9a24b;
  --jz-gold-line: rgba(201, 162, 75, 0.55);
  --jz-radius: 14px;
  --jz-radius-sm: 9px;
  --jz-shadow: 0 8px 24px -12px rgba(17, 10, 6, 0.45), 0 2px 6px -3px rgba(17, 10, 6, 0.35);
  position: relative;
  min-height: 100vh;
  color: var(--jz-ink);
  background:
    radial-gradient(ellipse 80% 50% at 50% 0%, rgba(166, 51, 43, 0.08), transparent 55%),
    linear-gradient(180deg, #efe4c8 0%, var(--jz-paper) 40%, #e0d2b0 100%);
  font-family: var(--font-body);
}
```

Rules:
- Buttons: `border-radius: var(--jz-radius-sm)` or pill; `box-shadow: var(--jz-shadow)`; **no** `box-shadow: 6px 6px 0`
- No `content: "JIANZHI"` pseudo watermark
- Stage: darker wood ring around red paper host
- Cards: paper-2 + 1px gold or ink hairline
- Keep focus-visible gold outline

Implement all listed class names with mobile-friendly layouts (`@media (max-width: 860px)` stack workshopBody).

- [ ] **Step 2: Visual grep self-check**

```bash
rg -n "6px 6px 0|JIANZHI|Georgia" src/games/jianzhi/JianzhiGame.module.css
```

Expected: no matches (or only comments explaining removal).

- [ ] **Step 3: Commit**

```bash
git add src/games/jianzhi/JianzhiGame.module.css
git commit -m "style(jianzhi): material red-paper workshop visual shell"
```

---

### Task 6: JianzhiGame shell — map, subnav, storage keys

**Files:**
- Modify: `src/games/jianzhi/JianzhiGame.tsx` (structural rewrite; can leave workshop body stub temporarily if compiling)

**Interfaces:**
- Consumes: lessons, commissions, progress v2, PROGRESS_KEY_V2
- View union: `'enter' | 'map' | 'workshop' | 'codex' | 'settings'`
- Workshop modes via state: `activeLesson | activeCommission | null` (null = practice)

- [ ] **Step 1: Replace imports and constants**

```ts
import { JIANZHI_LESSONS, LESSON_COUNT, getLesson } from './content/lessons';
import { JIANZHI_COMMISSIONS, getCommission } from './content/commissions';
import { JIANZHI_CULTURE_ENTRIES } from './content/culture';
import {
  PROGRESS_KEY_V2,
  PROGRESS_KEY_V1,
  createInitialJianzhiProgress,
  parseJianzhiProgress,
  recordLessonCompletion,
  recordCommissionCompletion,
  // ...
} from './core/progress';
```

Progress load:

```ts
function loadProgress(): JianzhiProgress {
  try {
    const v2 = window.localStorage.getItem(PROGRESS_KEY_V2);
    if (v2) return parseJianzhiProgress(v2);
    const v1 = window.localStorage.getItem(PROGRESS_KEY_V1);
    if (v1) {
      const migrated = parseJianzhiProgress(v1);
      window.localStorage.setItem(PROGRESS_KEY_V2, JSON.stringify(migrated));
      return migrated;
    }
  } catch { /* ignore */ }
  return createInitialJianzhiProgress();
}

function persistProgress(p: JianzhiProgress) {
  try {
    window.localStorage.setItem(PROGRESS_KEY_V2, JSON.stringify(p));
  } catch { /* ignore */ }
}
```

- [ ] **Step 2: Enter screen + map + subnav**

- `enter`: wordmark「纸上生花」、lead 学徒文案、主 CTA「进入工坊」→ `map`
- `map`: list 7 lessons with lock/current/done; if `progress.graduated`, show commission section; subnav buttons
- Subnav: 功课地图 | 自习台 | 纹样册 | 作品 | 设置

- [ ] **Step 3: Ensure TypeScript build for game file still mounts canvas only on workshop**

Keep existing canvas `useEffect` when `view === 'workshop'`.

- [ ] **Step 4: Commit**

```bash
git add src/games/jianzhi/JianzhiGame.tsx
git commit -m "feat(jianzhi): workshop enter map and subnav shell"
```

---

### Task 7: Five-step lesson flow + reveal layer

**Files:**
- Modify: `src/games/jianzhi/JianzhiGame.tsx`

**Interfaces:**
- Lesson phase: `'reading' | 'craft' | 'reveal' | 'quiz' | 'result'`
- On unfold pass → set reveal with combo principle (from `getCombo` or first detected)
- Quiz wrong: show explain, allow reselect; any selection can proceed to complete after explain shown
- Finalize: `recordLessonCompletion` / `recordCommissionCompletion`

- [ ] **Step 1: Reading gate**

When entering lesson/commission, `phase = 'reading'`. Overlay/panel shows reading.origin / technique / focus + narrative. Button「上工」→ `phase = 'craft'`, set fold from suggestion, clear canvas.

- [ ] **Step 2: Craft uses evaluateObjective**

```ts
const evaluation = evaluateObjective(
  { objectiveMode: active.objectiveMode, objectiveMotifIds: active.objectiveMotifIds },
  ids,
  JIANZHI_COMBOS,
);
```

- [ ] **Step 3: Reveal layer UI**

On pass:

```tsx
<div className={styles.reveal} role="dialog" aria-label="吉语揭晓">
  <div className={styles.revealInner}>
    <p>展开见花</p>
    <h2 className={styles.revealPhrase}>{phrase || '功课达成'}</h2>
    <p className={styles.revealPrinciple}>{principle}</p>
    <button type="button" className={styles.primaryBtn} onClick={goQuizOrResult}>继续</button>
  </div>
</div>
```

`phrase` / `principle`: if `targetComboId` use that combo; else if any-combo use first `detectCombos` result; else list objective motif meanings joined.

- [ ] **Step 4: Quiz then result**

Reuse quiz UI; on finish call finalize. Result shows reward + next lesson CTA.

- [ ] **Step 5: Manual smoke (dev)**

```bash
pnpm dev
# open /games/jianzhi/ — enter → lesson 1 reading → craft place 福 → unfold → reveal → quiz → map unlocks 2
```

- [ ] **Step 6: Commit**

```bash
git add src/games/jianzhi/JianzhiGame.tsx
git commit -m "feat(jianzhi): lesson reading craft reveal quiz loop"
```

---

### Task 8: Practice, codex, works, settings, commissions playable

**Files:**
- Modify: `src/games/jianzhi/JianzhiGame.tsx`

- [ ] **Step 1: Practice workshop**

`startPractice`: activeLesson=null, activeCommission=null, phase=craft, free fold, no reading required. Combos still discover via existing detect effect. Save/download keep.

- [ ] **Step 2: Codex tabs**

motif | combo | archive | works — data from MOTIFS, JIANZHI_COMBOS, JIANZHI_CULTURE_ENTRIES, works state. Remove dependency on deleted chapters.

- [ ] **Step 3: Commission entry**

Only if `progress.graduated`. Enter commission → same five-step with commission fields; finalize via `recordCommissionCompletion`.

- [ ] **Step 4: Settings**

reducedMotion, muted, clear progress (clear V2 key).

- [ ] **Step 5: Delete `content/chapters.ts` if unused**

```bash
rg -n "chapters|JIANZHI_CHAPTERS|getChapter" src/games/jianzhi app/games/jianzhi
```

Remove file when clean.

- [ ] **Step 6: Run all jianzhi tests + commit**

```bash
node --experimental-strip-types --test tests/jianzhi-*.test.ts
git add -A src/games/jianzhi tests/jianzhi-*.test.ts
git commit -m "feat(jianzhi): practice codex commissions and remove old chapters"
```

---

### Task 9: paperCanvas material pass

**Files:**
- Modify: `src/games/jianzhi/runtime/paperCanvas.ts`

- [ ] **Step 1: Paper fill with subtle noise**

After solid red gradient fill, overlay low-alpha turbulence or dotted noise (canvas pattern or `feTurbulence` pre-rendered is heavy — prefer simple loop of sparse pixels or `globalAlpha` grain rect once per frame is expensive; implement **static** noise canvas generated once:

```ts
function makeGrain(size: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const img = g.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 220 + Math.random() * 35;
    img.data[i] = v;
    img.data[i + 1] = v * 0.25;
    img.data[i + 2] = v * 0.2;
    img.data[i + 3] = Math.random() > 0.92 ? 28 : 0;
  }
  g.putImageData(img, 0, 0);
  return c;
}
```

Draw grain with `multiply` or `overlay` at low alpha on paper body.

- [ ] **Step 2: Fold crease**

When `folded`, draw a soft vertical (or fold-axis) shadow line on the fold boundary from `foldConfig`.

- [ ] **Step 3: Unfold duration**

If not reducedMotion, increase unfold animation toward ~900–1200ms (find existing `revealT` / raf loop and scale). If reducedMotion, keep near-instant.

- [ ] **Step 4: Commit**

```bash
git add src/games/jianzhi/runtime/paperCanvas.ts
git commit -m "feat(jianzhi): paper grain crease and slower unfold reveal"
```

---

### Task 10: SEO page + registry copy + full verification

**Files:**
- Modify: `app/games/jianzhi/page.tsx`
- Modify: `src/core/gamesRegistry.ts` (tagline if needed)
- Optionally: `src/styles/globals.css` footer blurb for jianzhi if present

- [ ] **Step 1: Update page metadata and footer culture copy**

Title/description emphasize 学徒工坊、折剪展读、看图说吉话. JSON-LD name aligned.

- [ ] **Step 2: Registry**

```ts
// name stays 纸上生花：中国剪纸
// tagline e.g. 跟纸灵学徒：读帖、折剪、展开读懂吉语
```

- [ ] **Step 3: Full test suite**

```bash
node --experimental-strip-types --test tests/*.test.ts
pnpm build
```

Expected: all tests pass; Next build succeeds for static export.

- [ ] **Step 4: Acceptance checklist (manual)**

From spec §7:

- [ ] No Georgia watermark / offset black buttons
- [ ] Enter → map → lesson 1 full loop works
- [ ] Linear lock works; after graduate commissions appear
- [ ] Practice does not advance curriculumUnlocked
- [ ] Reveal shows 纹样→吉语 principle
- [ ] v1 key migrates when only v1 present

- [ ] **Step 5: Final commit**

```bash
git add app/games/jianzhi/page.tsx src/core/gamesRegistry.ts
git commit -m "docs(jianzhi): align SEO and registry with apprentice workshop"
```

---

## Spec Coverage Self-Review

| Spec requirement | Task |
|------------------|------|
| 学徒身份 + 进入工坊主 CTA | 6 |
| 7 课线性 + 出师 | 4, 2, 7 |
| 时令委托 2 个 | 4, 8 |
| 五段循环 + 揭晓层 | 7 |
| 材质视觉 / 去版画壳 | 5, 9 |
| Progress v2 + 迁移 | 2, 6 |
| 自习不推进功课 | 8 |
| 图鉴/作品/设置 | 8 |
| 保留 canvas/audio/motifs/combos | 9 + untouched files |
| SEO | 10 |
| 验收 | 10 |

## Placeholder Scan

No TBD/TODO steps; lesson table ids and motif bindings fixed; evaluate modes fixed.

## Type Consistency

- `JianzhiLessonId` / `JianzhiCommissionId` shared across types, progress, content, UI
- `evaluateObjective` replaces `evaluateChapter`
- `ObjectiveEvaluation.missing` may include `'*any-combo*'` sentinel for UI copy mapping to「请拼出一句吉语」

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-20-jianzhi-workshop-redesign.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks  
2. **Inline Execution** — this session with executing-plans, batch + checkpoints  

Which approach?
