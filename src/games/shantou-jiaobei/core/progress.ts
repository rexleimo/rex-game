import type { CupResult } from '../JiaobeiGame';
import type { VerdictKey } from './verdict';

/**
 * 圣杯的最小存档。
 *
 * 这个游戏原本是完全无状态的：掷三次、看结果、走人。加存档不是为了游戏本身
 * ——它不需要——而是为了文化护照能派生出「这位玩家见过哪几种杯象」。
 * 因此只记会变成卡牌的那点信息，不记心愿内容（那是隐私，且从不离开内存）。
 */

export const PROGRESS_KEY = 'rex-game:shantou-jiaobei:progress:v1';

export interface JiaobeiProgress {
  version: 1;
  /** 见过的单次杯象。 */
  seenCups: CupResult[];
  /** 见过的三掷总判。 */
  seenVerdicts: VerdictKey[];
  /** 完成的完整局数（三掷为一局）。 */
  completedRuns: number;
}

export function createInitialProgress(): JiaobeiProgress {
  return { version: 1, seenCups: [], seenVerdicts: [], completedRuns: 0 };
}

const CUPS: CupResult[] = ['sheng', 'xiao', 'yin'];
const VERDICTS: VerdictKey[] = ['all-sheng', 'mostly-sheng', 'all-xiao', 'mostly-yin', 'mixed'];

export function parseProgress(raw: string | null): JiaobeiProgress {
  if (!raw) return createInitialProgress();
  try {
    const data = JSON.parse(raw) as Partial<JiaobeiProgress>;
    if (data.version !== 1) return createInitialProgress();
    return {
      version: 1,
      // 过滤未知值：存档可能被手改，或来自往后的版本回滚
      seenCups: Array.isArray(data.seenCups) ? data.seenCups.filter((c) => CUPS.includes(c)) : [],
      seenVerdicts: Array.isArray(data.seenVerdicts)
        ? data.seenVerdicts.filter((v) => VERDICTS.includes(v))
        : [],
      completedRuns: Number.isFinite(data.completedRuns) ? Number(data.completedRuns) : 0,
    };
  } catch {
    return createInitialProgress();
  }
}

export function loadProgress(): JiaobeiProgress {
  if (typeof window === 'undefined') return createInitialProgress();
  try {
    return parseProgress(window.localStorage.getItem(PROGRESS_KEY));
  } catch {
    return createInitialProgress();
  }
}

export function saveProgress(p: JiaobeiProgress) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {
    /* 配额或隐私模式，忽略 */
  }
}

/** 记录一整局：三次杯象 + 总判。返回新对象，不改入参。 */
export function recordRun(
  p: JiaobeiProgress,
  throws: CupResult[],
  verdictKey: VerdictKey,
): JiaobeiProgress {
  return {
    version: 1,
    seenCups: [...new Set([...p.seenCups, ...throws])],
    seenVerdicts: [...new Set([...p.seenVerdicts, verdictKey])],
    completedRuns: p.completedRuns + 1,
  };
}
