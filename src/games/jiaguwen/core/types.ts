/** 《甲骨问契 · 字与卜》核心类型 */

export type JiaguModeId = 'match' | 'sense' | 'omen' | 'daily' | 'craft' | 'review' | 'reference';

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
  tags: Array<'nature' | 'body' | 'action' | 'ritual' | 'object' | 'sky' | 'land' | 'animal' | 'direction' | 'tool' | 'building' | 'cloth' | 'vehicle' | 'power' | 'farm'>;
  /** 字形图片路径（优先使用） */
  image?: string;
  /** SVG 路径字符串；无 image 时 fallback 绘制 */
  svgPath?: string;
  /** 字形视图框 */
  viewBox?: string;
  /** 字形演变：甲骨文 → 金文 → 小篆 → 楷书 */
  evolution?: GlyphEvolution | null;
}

export type OracleReadingStatus = 'editorial-game-label' | 'source-label' | 'uncertain' | 'unread';

export type OracleConfidence = 'high' | 'medium' | 'unreviewed';

export interface OracleGlyphForm {
  /** Stable source-local id for one attested or reference glyph form. */
  id: string;
  image: string;
  sourceId: OracleSourceId;
  /** The evidence class must stay visible when multiple variants share a headword. */
  formType: 'teaching-rendering' | 'reference-glyph';
  license?: string;
  sourceRecordUrl?: string;
  retrievedAt?: string;
}

export interface OracleHeadword {
  /** Product-local concept id, distinct from individual glyph-form ids. */
  id: string;
  modern: string;
  readingStatus: OracleReadingStatus;
  confidence: OracleConfidence;
  formIds: string[];
  /** Only reviewed entries may be used to manufacture teaching questions. */
  gameSafe: boolean;
}

export interface OracleCatalogForm extends OracleGlyphForm {
  /** Upstream modern-character label; may be a scholarly reading rather than a settled identification. */
  modern: string;
}

export type OracleSourceId = 'curriculum' | 'jgw-open' | 'xiaoxue';

export interface OracleSource {
  id: OracleSourceId;
  name: string;
  url: string;
  license: string;
  /** Exact role in the product: curriculum, browse-only reference, or import candidate. */
  role: 'curriculum' | 'reference';
  note: string;
}

export interface GlyphEvolution {
  oracle?: string;
  jinwen?: string;
  xiaozhuan?: string;
  kaishu?: string;
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
  runs: { match: number; sense: number; omen: number; daily: number; craft: number; review: number; reference: number };
  /** 辨形最佳步数（按题量归一化较难，MVP 只记 4 对局最佳原始步数） */
  bestMatchMoves: number | null;
  /** 累计正确题数 */
  correctTotal: number;
  /** 答错或没有一次答对的字 id，用于错题复习 */
  mistakeIds: string[];
}

export interface CompoundRecipe {
  id: string;
  /** 目标现代字 */
  result: string;
  /** 组成目标字所需的甲骨部件 id 列表 */
  parts: string[];
  /** 可选：目标字在甲骨文中是否真实存在 */
  oracleExists?: boolean;
  /** 提示说明 */
  hint: string;
  /** 文化/字理说明 */
  lore: string;
}
