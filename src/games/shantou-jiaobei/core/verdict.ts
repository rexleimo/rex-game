import type { CupResult } from '../JiaobeiGame';

export type VerdictKey = 'all-sheng' | 'mostly-sheng' | 'all-xiao' | 'mostly-yin' | 'mixed';

export interface Verdict {
  key: VerdictKey;
  tone: CupResult;
}

/**
 * 三掷汇总判定 → 整体结论。
 *
 * 从 ResultScene 提到独立模块，好让结果页渲染与 game_finish 埋点共用同一份
 * 判定，避免两处各写一遍导致数据和文案对不上。
 */
export function verdict(throws: CupResult[]): Verdict {
  const sheng = throws.filter((t) => t === 'sheng').length;
  const xiao = throws.filter((t) => t === 'xiao').length;
  if (sheng === 3) return { key: 'all-sheng', tone: 'sheng' };
  if (xiao === 3) return { key: 'all-xiao', tone: 'xiao' };
  if (sheng >= 2) return { key: 'mostly-sheng', tone: 'sheng' };
  if (throws.filter((t) => t === 'yin').length >= 2) return { key: 'mostly-yin', tone: 'yin' };
  return { key: 'mixed', tone: 'xiao' };
}
