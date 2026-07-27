'use client';

import { loadCampaignProgress } from '../../games/chaoshan-yingge/core/progress.ts';
import { loadProgress as loadJieqiProgress } from '../../games/ershisi-jieqi/core/progress.ts';
import { loadProgress as loadJiaguProgress } from '../../games/jiaguwen/core/progress.ts';
import {
  PROGRESS_KEY_V1,
  PROGRESS_KEY_V2,
  createInitialJianzhiProgress,
  parseJianzhiProgress,
} from '../../games/jianzhi/core/progress.ts';
import { loadProgress as loadShanhaiProgress } from '../../games/shanhai-shiyi/core/progress.ts';
import { loadProgress as loadJiaobeiProgress } from '../../games/shantou-jiaobei/core/progress.ts';
import { games } from '../gamesRegistry.ts';
import { PASSPORT_GAME_ORDER, cardsForGame } from './cards.ts';
import type {
  PassportCardState,
  PassportGameSection,
  PassportSnapshot,
  PassportState,
} from './types.ts';

/**
 * 剪纸的读取逻辑散在组件里（先 v2、回落 v1）。护照只读，不做 v1→v2 回写，
 * 免得玩家仅仅打开护照页就意外改写了游戏存档。
 */
function loadJianzhiProgress() {
  if (typeof window === 'undefined') return createInitialJianzhiProgress();
  try {
    const v2 = window.localStorage.getItem(PROGRESS_KEY_V2);
    if (v2) return parseJianzhiProgress(v2);
    return parseJianzhiProgress(window.localStorage.getItem(PROGRESS_KEY_V1));
  } catch {
    return createInitialJianzhiProgress();
  }
}

/** 读取六个游戏的存档。仅在客户端有意义；SSR 期间各自返回初始值。 */
export function readSnapshot(): PassportSnapshot {
  return {
    'shantou-jiaobei': loadJiaobeiProgress(),
    'chaoshan-yingge': loadCampaignProgress(),
    jiaguwen: loadJiaguProgress(),
    jianzhi: loadJianzhiProgress(),
    'shanhai-shiyi': loadShanhaiProgress(),
    'ershisi-jieqi': loadJieqiProgress(),
  };
}

/**
 * 由存档快照算出整本护照。
 *
 * 判定包在 try 里：某个游戏的存档一旦被手改成畸形结构，只应让那一张卡显示为
 * 未获得，而不该让整个护照页白屏。
 */
export function buildPassport(snapshot: PassportSnapshot): PassportState {
  const sections: PassportGameSection[] = [];

  for (const game of PASSPORT_GAME_ORDER) {
    const meta = games.find((g) => g.id === game);
    const cards: PassportCardState[] = cardsForGame(game).map((card) => {
      let earned = false;
      try {
        earned = (card.earned as (p: unknown) => boolean)(snapshot[game]);
      } catch {
        earned = false;
      }
      const { earned: _predicate, ...rest } = card;
      return { ...rest, earned };
    });

    // trailingSlash: true 的静态导出要求路径以 / 结尾，否则 GitHub Pages 会 404
    const rawHref = meta?.href ?? `/games/${game}`;
    const href = rawHref.endsWith('/') ? rawHref : `${rawHref}/`;

    sections.push({
      game,
      name: meta?.name ?? game,
      href,
      accent: meta?.accent ?? '#C9A24B',
      cards,
      earnedCount: cards.filter((c) => c.earned).length,
      totalCount: cards.length,
    });
  }

  const earnedCount = sections.reduce((sum, s) => sum + s.earnedCount, 0);
  const totalCount = sections.reduce((sum, s) => sum + s.totalCount, 0);

  return {
    sections,
    earnedCount,
    totalCount,
    visitedGames: sections.filter((s) => s.earnedCount > 0).length,
  };
}

/** 空护照：SSR 与首次水合前的稳定占位，保证服务端与客户端首帧一致。 */
export function emptyPassport(): PassportState {
  return buildPassport({
    'shantou-jiaobei': { version: 1, seenCups: [], seenVerdicts: [], completedRuns: 0 },
    'chaoshan-yingge': { unlocked: 1, bestSpirit: {} },
    jiaguwen: {
      version: 1,
      knownIds: [],
      readIds: [],
      runs: { match: 0, sense: 0, omen: 0, daily: 0, craft: 0, review: 0 },
      bestMatchMoves: null,
      correctTotal: 0,
      mistakeIds: [],
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
  });
}
