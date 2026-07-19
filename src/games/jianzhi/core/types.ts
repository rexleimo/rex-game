export type FoldMode = 'single' | 'book' | 'four' | 'rosette';

/** 故事章节的唯一标识（与 content/chapters.ts 中的 id 一一对应）。 */
export type JianzhiChapterId =
  | 'awaken'
  | 'north-window'
  | 'south-fine'
  | 'silk-rosette'
  | 'zodiac'
  | 'legacy';

export type EvidenceKind = 'recorded' | 'oral-tradition' | 'game-interpretation';

export type MotifCategory = 'animal' | 'plant' | 'character' | 'object' | 'symbol';

/** 一个剪纸纹样：绘制函数在一个以 (0,0) 为中心、跨度约 [-0.5,0.5] 的单位坐标系内画出剪影。 */
export interface MotifDef {
  id: string;
  name: string;
  pinyin: string;
  /** 一句话寓意，如「年年有余」 */
  meaning: string;
  /** 较长的文化讲解，用于图鉴与侧栏 */
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

/**
 * 吉语组合（剪纸的「看图说吉话」谐音/象征语法）。
 * 例如 莲 + 鱼 → 连年有余：莲谐「连」、鱼谐「余」。
 * 这是剪纸文化底蕴的核心——纹样并非孤立符号，而是可拼读的祝福句子。
 */
export interface RebusCombo {
  id: string;
  /** 成句吉语，如「连年有余」 */
  phrase: string;
  /** 构成该句所需的纹样 id（无序，需全部出现） */
  motifIds: string[];
  /** 成句原理：讲清每个纹样如何通过谐音或象征贡献词义 */
  principle: string;
  /** 一句话点睛，用于工坊成句瞬间的提示 */
  tagline: string;
  evidence: EvidenceKind;
  sourceLabel: string;
  sourceUrl: string;
}

/** 章节「读帖」——落剪前先识源流与技法，把文化前置为主动学习。 */
export interface ChapterReading {
  /** 源流：这一路剪纸从何而来 */
  origin: string;
  /** 技法：本章折法为什么这样折 */
  technique: string;
  /** 看点：拼读的吉语组合要领 */
  focus: string;
}

/** 章末理解题——用一道轻量选择题巩固谐音/象征原理。 */
export interface ChapterQuiz {
  question: string;
  options: string[];
  /** 正确项下标 */
  answer: number;
  /** 作答后的讲解，无论对错都呈现 */
  explain: string;
}

export interface JianzhiChapter {
  id: JianzhiChapterId;
  order: number;
  title: string;
  subtitle: string;
  region: string;
  foldSuggestion: FoldMode;
  /** 纸灵的叙述，逐段展示 */
  narrative: string[];
  /** 落剪前的读帖内容（源流 / 技法 / 看点） */
  reading: ChapterReading;
  /** 本章建议使用的纹样（用于目标判定与文化解锁） */
  objectiveMotifIds: string[];
  /** 本章要拼读出的吉语组合 id（可空，如序章只教单字） */
  targetComboId?: string;
  /** 章末理解题（可空） */
  quiz?: ChapterQuiz;
  culturalFocus: string;
  cultureEntryIds: string[];
  reward: string;
}

export interface JianzhiSettings {
  reducedMotion: boolean;
  muted: boolean;
}

export interface JianzhiProgress {
  unlocked: number;
  collectedMotifIds: string[];
  cultureEntryIds: string[];
  completedChapters: JianzhiChapterId[];
  /** 已在工坊中「拼读」出的吉语组合 id */
  discoveredCombos: string[];
}

export interface SavedWork {
  id: string;
  name: string;
  dataUrl: string;
  fold: FoldMode;
  motifIds: string[];
  createdAt: number;
}

/** 章节完成判定的纯结果。 */
export interface ChapterEvaluation {
  passed: boolean;
  /** 未集齐的目标纹样 id */
  missing: string[];
}

/** 画布上的一笔「剪」：自由笔触或纹样戳印，坐标均为 0..1 归一化纸张坐标。 */
export type PaperMark =
  | { type: 'stroke'; points: Array<{ x: number; y: number }>; width: number }
  | { type: 'motif'; id: string; def: MotifDef; x: number; y: number; scale: number };
