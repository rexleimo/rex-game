import type { JiaguProgress } from './types.ts';

/**
 * 甲骨展品最小存档。
 *
 * 只记录「认过哪些字、图鉴读到哪」——玩法本身是静态题目，
 * 不需要记对局中间状态。
 */

export const PROGRESS_KEY = 'rex-game:jiaguwen:progress:v1';

export function createInitialProgress(): JiaguProgress {
  return {
    version: 1,
    knownIds: [],
    readIds: [],
    runs: { match: 0, sense: 0, omen: 0, daily: 0, craft: 0, review: 0, reference: 0 },
    bestMatchMoves: null,
    correctTotal: 0,
    mistakeIds: [],
  };
}

export function parseProgress(raw: string | null): JiaguProgress {
  if (!raw) return createInitialProgress();
  try {
    const data = JSON.parse(raw) as Partial<JiaguProgress>;
    if (data.version !== 1) return createInitialProgress();
    const runs = data.runs && typeof data.runs === 'object' ? (data.runs as Partial<Record<'match' | 'sense' | 'omen' | 'daily' | 'craft' | 'review' | 'reference', unknown>>) : {};
    return {
      version: 1,
      knownIds: Array.isArray(data.knownIds) ? data.knownIds.filter((x): x is string => typeof x === 'string') : [],
      readIds: Array.isArray(data.readIds) ? data.readIds.filter((x): x is string => typeof x === 'string') : [],
      runs: {
        match: typeof runs.match === 'number' ? runs.match : 0,
        sense: typeof runs.sense === 'number' ? runs.sense : 0,
        omen: typeof runs.omen === 'number' ? runs.omen : 0,
        daily: typeof runs.daily === 'number' ? runs.daily : 0,
        craft: typeof runs.craft === 'number' ? runs.craft : 0,
        review: typeof runs.review === 'number' ? runs.review : 0,
        reference: typeof runs.reference === 'number' ? runs.reference : 0,
      },
      bestMatchMoves: typeof data.bestMatchMoves === 'number' ? data.bestMatchMoves : null,
      correctTotal: typeof data.correctTotal === 'number' ? data.correctTotal : 0,
      mistakeIds: Array.isArray(data.mistakeIds) ? data.mistakeIds.filter((x): x is string => typeof x === 'string') : [],
    };
  } catch {
    return createInitialProgress();
  }
}

export function loadProgress(): JiaguProgress {
  if (typeof window === 'undefined') return createInitialProgress();
  try {
    return parseProgress(window.localStorage.getItem(PROGRESS_KEY));
  } catch {
    return createInitialProgress();
  }
}

export function saveProgress(p: JiaguProgress) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {
    /* quota / private */
  }
}

/** 合并新认识的字，保持唯一与稳定顺序 */
export function recordKnownIds(p: JiaguProgress, ids: string[]): JiaguProgress {
  const nextKnown = [...new Set([...p.knownIds, ...ids])];
  return { ...p, knownIds: nextKnown };
}

/** 记录错题 id（去重） */
export function recordMistakeIds(p: JiaguProgress, ids: string[]): JiaguProgress {
  const nextMistakes = [...new Set([...p.mistakeIds, ...ids])];
  return { ...p, mistakeIds: nextMistakes };
}

/** 从错题本移除已掌握的字 */
export function clearMistakeIds(p: JiaguProgress, ids: string[]): JiaguProgress {
  const remove = new Set(ids);
  return { ...p, mistakeIds: p.mistakeIds.filter((id) => !remove.has(id)) };
}

/** Fisher-Yates 洗牌 */
export function shuffle<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
