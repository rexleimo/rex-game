/** 《甲骨问契 · 字与卜》核心类型 */

export type JiaguModeId = 'match' | 'sense' | 'omen' | 'daily';

export interface OracleGlyph {
  id: string;
  /** 现代汉字 */
  modern: string;
  /** 2–6 字义项 */
  gloss: string;
  /** 象形提示 */
  shapeHint: string;
  /** 文化说明 */
  lore: string;
  /** 教学分层 1 入门 / 2 进阶 / 3 深入 */
  tier: 1 | 2 | 3;
  /** 标签分类 */
  tags: Array<'nature' | 'body' | 'action' | 'ritual' | 'object'>;
  /** SVG 路径字符串；如为 '' 则 fallback 绘制 */
  svgPath: string;
  /** 字形视图框 */
  viewBox: string;
  /** 来源声明 */
  sourcesNote: string;
}

export interface SenseItem {
  id: string;
  glyphId: string;
  prompt: string;
  options: string[];
  answer: number;
  explain: string;
}

export interface OmenItem {
  id: string;
  /** 缺字处占位，如「□」 */
  oracleText: string;
  /** 缺失的甲骨字 id */
  blankId: string;
  options: string[];
  answer: number;
  /** 白话翻译 */
  vernacular: string;
  /** 古人为什么问 */
  whyAsked: string;
}

export interface MatchCard {
  key: string;
  pairId: string;
  /** 'glyph' 面是甲骨形，'modern' 面是现代字 */
  face: 'glyph' | 'modern';
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

export interface SenseRun {
  items: SenseItem[];
  index: number;
  picks: Array<number | null>;
  score: number;
  done: boolean;
}

export interface OmenRun {
  items: OmenItem[];
  index: number;
  picks: Array<number | null>;
  score: number;
  done: boolean;
}

export type ViewId = 'home' | JiaguModeId | 'codex' | 'result';

export interface JiaguProgress {
  version: 1;
  /** 已正确辨识的字 id */
  knownIds: string[];
  /** 图鉴已读字 id */
  readIds: string[];
  /** 各模式完成次数 */
  runs: { match: number; sense: number; omen: number; daily: number };
  /** 辨形最佳步数（按题量归一化较难，MVP 只记 4 对局最佳原始步数） */
  bestMatchMoves: number | null;
  /** 累计正确题数 */
  correctTotal: number;
}
