/** 《二十四节气 · 农时拼图》核心类型 */

export type SeasonId = 'spring' | 'summer' | 'autumn' | 'winter';

export type ViewId = 'home' | 'sort' | 'match' | 'quiz' | 'codex' | 'result';

export type ModeId = 'sort' | 'match' | 'quiz';

export interface SolarTerm {
  id: string;
  /** 节气名 */
  name: string;
  /** 全年顺序 1-24 */
  order: number;
  season: SeasonId;
  /** 公历大致日期 */
  dateHint: string;
  /** 一句话 */
  oneLiner: string;
  /** 代表物候（用于配对） */
  phenology: string;
  /** 农事提示 */
  farming: string;
  /** 诗句或谚语 */
  verse: string;
  /** 短文化说明 */
  lore: string;
  /** 视觉符号（emoji 作轻量图标） */
  glyph: string;
  /** 季节色点缀 */
  tint: string;
}

export interface QuizItem {
  id: string;
  prompt: string;
  options: string[];
  /** 正确选项下标 */
  answer: number;
  explain: string;
  termId?: string;
}

export interface SortRun {
  season: SeasonId | 'year';
  /** 本局目标顺序 term ids */
  targetIds: string[];
  /** 玩家当前排列 */
  slots: string[];
  checked: boolean;
  correct: boolean;
  score: number;
}

export interface MatchCard {
  key: string;
  pairId: string;
  face: 'name' | 'phenology';
  label: string;
  flipped: boolean;
  matched: boolean;
}

export interface MatchRun {
  cards: MatchCard[];
  flips: string[];
  moves: number;
  matchedPairs: number;
  totalPairs: number;
  done: boolean;
}

export interface QuizRun {
  items: QuizItem[];
  index: number;
  picks: Array<number | null>;
  score: number;
  done: boolean;
}

export interface JieqiProgress {
  version: 1;
  /** 已通关的排序关卡 */
  sortCleared: Array<SeasonId | 'year'>;
  /** 配对最佳步数（越小越好） */
  matchBestMoves: number | null;
  /** 问答累计正确数 */
  quizCorrect: number;
  /** 问答完成局数 */
  quizRuns: number;
  /** 图鉴已读 term id */
  readTermIds: string[];
  /** 最近一次结果摘要 */
  lastResult?: {
    mode: ModeId;
    title: string;
    detail: string;
    scoreLabel: string;
  };
}

export const SEASON_META: Record<
  SeasonId,
  { name: string; order: number; blurb: string; tint: string }
> = {
  spring: { name: '春', order: 1, blurb: '东风解冻，万物苏醒', tint: '#6B9B6E' },
  summer: { name: '夏', order: 2, blurb: '阳气正盛，农事繁忙', tint: '#C9A24B' },
  autumn: { name: '秋', order: 3, blurb: '收获时令，天高气清', tint: '#C87A3A' },
  winter: { name: '冬', order: 4, blurb: '闭藏蓄势，一阳将复', tint: '#6A8CA8' },
};
