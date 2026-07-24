/** 《山海拾遗》核心类型 — 对齐 GDD v2.2（文化展气质 · 无登录商城） */

export type AuthTag =
  | 'historic_inspired'
  | 'folk'
  | 'classic_shanhai'
  | 'seasonal'
  | 'public_edu';

export type Rarity = 'N' | 'R' | 'SR' | 'SSR' | 'UR';

export type RestoreKind = 'shape' | 'quiz';

export interface LoreCard {
  id: string;
  name: string;
  rarity: Rarity;
  types: string[];
  authTag: AuthTag;
  region: string;
  learnIds: string[];
  /** 所属岁时专题 id，见 festivals.ts */
  festivalIds?: string[];
  oneLiner: string;
  coreLore: string;
  source: string;
  todayLink: string;
  tellable: string;
  extraLore?: string;
  restore: RestoreDef;
}

export type RestoreDef =
  | { kind: 'shape'; pieces: ShapePiece[]; board: { w: number; h: number } }
  | { kind: 'quiz'; prompt: string; options: QuizOption[]; explain: string };

export interface ShapePiece {
  id: string;
  label: string;
  /** 目标中心（相对 board 0–1） */
  target: { x: number; y: number };
  /** 吸附半径（相对 board 短边比例） */
  snap: number;
  /** 初始乱序位置 */
  start: { x: number; y: number };
  /** SVG path，以 0,0 为局部中心附近 */
  path: string;
  fill: string;
  stroke?: string;
}

export interface QuizOption {
  id: string;
  text: string;
  correct: boolean;
}

export type ViewId =
  | 'home'
  | 'map'
  | 'restore'
  | 'card'
  | 'codex'
  | 'museum'
  | 'festival'
  | 'about';

export interface ArtifactProgress {
  restored: boolean;
  score: number;
  grade: RestoreGrade;
  readCore: boolean;
  restoredAt?: string;
}

export type RestoreGrade = 'none' | 'C' | 'B' | 'A' | 'S' | 'SS';

export interface ShanhaiProgress {
  version: 1;
  /** artifactId → 进度 */
  artifacts: Record<string, ArtifactProgress>;
  /** 藏馆展位上的 artifactId 列表（有序） */
  museumSlots: string[];
  /** 已完成的必学点 */
  learnedIds: string[];
  hintLevel: 'guide' | 'read' | 'self';
  visitedMap: boolean;
  /** 当前展区 R01/R02… */
  regionId?: string;
}

export interface LearnPoint {
  id: string;
  goal: string;
  checkQuestion: string;
}

export interface ExhibitStop {
  id: string;
  kind: 'lore' | 'plaque' | 'summary';
  title: string;
  body?: string;
  artifactId?: string;
}
