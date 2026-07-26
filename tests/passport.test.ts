import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { PASSPORT_CARDS, PASSPORT_GAME_ORDER, cardsForGame } from '../src/core/passport/cards.ts';
import { buildPassport, emptyPassport } from '../src/core/passport/store.ts';
import type { PassportSnapshot } from '../src/core/passport/types.ts';
import { games } from '../src/core/gamesRegistry.ts';
import {
  CHAPTER_COUNT,
  LEGACY_PROGRESS_KEY,
  loadCampaignProgress,
  PROGRESS_KEY,
} from '../src/games/chaoshan-yingge/core/progress.ts';
import { createInitialJianzhiProgress } from '../src/games/jianzhi/core/progress.ts';
import { parseProgress as parseJiaobei, recordRun } from '../src/games/shantou-jiaobei/core/progress.ts';

function blankSnapshot(): PassportSnapshot {
  return {
    'shantou-jiaobei': { version: 1, seenCups: [], seenVerdicts: [], completedRuns: 0 },
    'chaoshan-yingge': { unlocked: 1, bestSpirit: {} },
    jiaguwen: {
      version: 1,
      knownIds: [],
      readIds: [],
      runs: { match: 0, sense: 0, omen: 0, daily: 0 },
      bestMatchMoves: null,
      correctTotal: 0,
    },
    jianzhi: createInitialJianzhiProgress(),
    'shanhai-shiyi': {
      version: 1,
      artifacts: {},
      museumSlots: [],
      learnedIds: [],
      hintLevel: 'guide',
      visitedMap: false,
    },
    'ershisi-jieqi': {
      version: 1,
      sortCleared: [],
      matchBestMoves: null,
      quizCorrect: 0,
      quizRuns: 0,
      readTermIds: [],
    },
  };
}

describe('passport card registry', () => {
  it('covers every registered game', () => {
    for (const game of PASSPORT_GAME_ORDER) {
      assert.ok(cardsForGame(game).length > 0, `${game} 没有任何卡牌`);
      assert.ok(games.some((g) => g.id === game), `${game} 不在 gamesRegistry 里`);
    }
    assert.equal(PASSPORT_GAME_ORDER.length, games.length, '有展品没被护照收录');
  });

  it('gives every game between three and five cards', () => {
    for (const game of PASSPORT_GAME_ORDER) {
      const count = cardsForGame(game).length;
      assert.ok(count >= 3 && count <= 5, `${game} 有 ${count} 张卡，超出 3-5 的设计区间`);
    }
  });

  it('uses globally unique card ids', () => {
    const ids = PASSPORT_CARDS.map((c) => c.id);
    assert.equal(new Set(ids).size, ids.length, '卡牌 id 重复，分享与统计会串');
  });

  it('always tells the player how to earn an unearned card', () => {
    for (const card of PASSPORT_CARDS) {
      assert.ok(card.hint.length > 0, `${card.id} 缺少获取提示`);
      assert.ok(card.blurb.length > 0, `${card.id} 缺少文化说明`);
    }
  });
});

describe('passport derivation', () => {
  it('starts empty for a player who has never played', () => {
    const passport = buildPassport(blankSnapshot());
    assert.equal(passport.earnedCount, 0);
    assert.equal(passport.visitedGames, 0);
    assert.equal(passport.totalCount, PASSPORT_CARDS.length);
  });

  it('derives jiaobei cups from the real progress writer', () => {
    const snapshot = blankSnapshot();
    // 走一遍游戏真正调用的写入函数，而不是手捏存档
    snapshot['shantou-jiaobei'] = recordRun(
      snapshot['shantou-jiaobei'],
      ['sheng', 'sheng', 'sheng'],
      'all-sheng',
    );
    const section = buildPassport(snapshot).sections.find((s) => s.game === 'shantou-jiaobei')!;
    const earned = section.cards.filter((c) => c.earned).map((c) => c.id);
    assert.deepEqual(earned.sort(), ['jiaobei-sheng', 'jiaobei-three-sheng']);
  });

  it('survives a corrupted save without losing the whole passport', () => {
    const snapshot = blankSnapshot();
    // 模拟被手改坏的存档：seenCups 不是数组
    (snapshot['shantou-jiaobei'] as unknown as { seenCups: unknown }).seenCups = null;
    const passport = buildPassport(snapshot);
    const section = passport.sections.find((s) => s.game === 'shantou-jiaobei')!;
    assert.equal(section.earnedCount, 0, '坏存档应判为未获得');
    assert.equal(passport.sections.length, PASSPORT_GAME_ORDER.length, '其余展品不应被牵连');
  });

  it('counts a game as visited only once it has yielded a card', () => {
    const snapshot = blankSnapshot();
    snapshot['ershisi-jieqi'].quizRuns = 1;
    const passport = buildPassport(snapshot);
    assert.equal(passport.visitedGames, 1);
    assert.equal(passport.earnedCount, 1);
  });

  it('reflects a full clear across every game', () => {
    const snapshot = blankSnapshot();
    snapshot['shantou-jiaobei'] = {
      version: 1,
      seenCups: ['sheng', 'xiao', 'yin'],
      seenVerdicts: ['all-sheng'],
      completedRuns: 3,
    };
    snapshot['chaoshan-yingge'] = { unlocked: 5, bestSpirit: { 'drum-basics': 90 } };
    snapshot.jianzhi = {
      ...createInitialJianzhiProgress(),
      completedLessons: ['graduate'],
      completedCommissions: ['x'] as never,
      collectedMotifIds: Array.from({ length: 14 }, (_, i) => `m${i}`),
      discoveredCombos: ['c1'],
      graduated: true,
    };
    snapshot['shanhai-shiyi'] = {
      version: 1,
      artifacts: Object.fromEntries(
        Array.from({ length: 17 }, (_, i) => [
          `a${i}`,
          { restored: true, score: 100, grade: 'S' as const, readCore: true },
        ]),
      ),
      museumSlots: [],
      learnedIds: ['l1', 'l2', 'l3', 'l4', 'l5'],
      hintLevel: 'self',
      visitedMap: true,
    };
    snapshot['ershisi-jieqi'] = {
      version: 1,
      sortCleared: ['year'],
      matchBestMoves: 12,
      quizCorrect: 10,
      quizRuns: 2,
      readTermIds: Array.from({ length: 24 }, (_, i) => `t${i}`),
    };
    snapshot.jiaguwen = {
      version: 1,
      knownIds: Array.from({ length: 24 }, (_, i) => `g${i}`),
      readIds: Array.from({ length: 24 }, (_, i) => `g${i}`),
      runs: { match: 1, sense: 1, omen: 1, daily: 1 },
      bestMatchMoves: 6,
      correctTotal: 24,
    };

    const passport = buildPassport(snapshot);
    assert.equal(passport.visitedGames, PASSPORT_GAME_ORDER.length);
    assert.equal(
      passport.earnedCount,
      passport.totalCount,
      `应集齐 ${passport.totalCount} 张，实际 ${passport.earnedCount}`,
    );
  });

  it('does not read localStorage during derivation', () => {
    // buildPassport 必须是纯函数：护照页每次渲染都会跑它
    const source = PASSPORT_CARDS.map((c) => c.earned.toString()).join('\n');
    assert.doesNotMatch(source, /localStorage/);
    assert.doesNotMatch(source, /window/);
  });
});

describe('passport hydration safety', () => {
  it('emptyPassport matches the shape of a real passport', () => {
    const empty = emptyPassport();
    const real = buildPassport(blankSnapshot());
    assert.deepEqual(empty, real, '首帧占位与真实空护照必须一致，否则 hydration 会不匹配');
  });

  it('parses a missing jiaobei save into a usable blank', () => {
    const parsed = parseJiaobei(null);
    assert.equal(parsed.completedRuns, 0);
    assert.deepEqual(parsed.seenCups, []);
  });

  it('gives every section a trailing-slash href for static export', () => {
    const passport = emptyPassport();
    for (const section of passport.sections) {
      assert.ok(section.href.endsWith('/'), `${section.game} href 缺尾斜杠: ${section.href}`);
    }
  });
});

describe('yingge progress for passport', () => {
  it('falls back to the legacy unlocked key so old saves still earn cards', () => {
    const originalWindow = globalThis.window;
    const store = new Map<string, string>();
    store.set(LEGACY_PROGRESS_KEY, '4');

    // @ts-expect-error minimal localStorage stub for node tests
    globalThis.window = {
      localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => {
          store.set(key, value);
        },
        removeItem: (key: string) => {
          store.delete(key);
        },
      },
    };

    try {
      assert.equal(store.has(PROGRESS_KEY), false, 'fixture 不应预先写入 v2 键');
      const progress = loadCampaignProgress();
      assert.equal(progress.unlocked, 4);
      assert.ok(progress.unlocked <= CHAPTER_COUNT);

      const snapshot = blankSnapshot();
      snapshot['chaoshan-yingge'] = progress;
      const section = buildPassport(snapshot).sections.find((s) => s.game === 'chaoshan-yingge')!;
      // unlocked=4 → 通关前三章，应拿到「初闻鼓点」与「阵列初成」
      const earned = section.cards.filter((c) => c.earned).map((c) => c.id).sort();
      assert.deepEqual(earned, ['yingge-first-drum', 'yingge-formation']);
    } finally {
      globalThis.window = originalWindow;
    }
  });
});
