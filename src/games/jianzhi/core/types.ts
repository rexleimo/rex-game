export type FoldMode = 'single' | 'book' | 'four' | 'rosette';

export type JianzhiLessonId =
  | 'awaken'
  | 'symmetry'
  | 'rebus-intro'
  | 'window-four'
  | 'silk-rosette'
  | 'fu-shou'
  | 'graduate';

export type JianzhiCommissionId = 'spring-window' | 'wedding-xi';

export type EvidenceKind = 'recorded' | 'oral-tradition' | 'game-interpretation';
export type MotifCategory = 'animal' | 'plant' | 'character' | 'object' | 'symbol';

export interface MotifDef {
  id: string;
  name: string;
  pinyin: string;
  meaning: string;
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

export interface RebusCombo {
  id: string;
  phrase: string;
  motifIds: string[];
  principle: string;
  tagline: string;
  evidence: EvidenceKind;
  sourceLabel: string;
  sourceUrl: string;
}

export interface LessonReading {
  origin: string;
  technique: string;
  focus: string;
}

export interface LessonQuiz {
  question: string;
  options: string[];
  answer: number;
  explain: string;
}

/** motifs: 必须集齐 objectiveMotifIds；any-combo: 拼出库内任意一句吉语即过 */
export type ObjectiveMode = 'motifs' | 'any-combo';

export interface JianzhiLesson {
  id: JianzhiLessonId;
  order: number;
  title: string;
  subtitle: string;
  region: string;
  foldSuggestion: FoldMode;
  narrative: string[];
  reading: LessonReading;
  objectiveMode: ObjectiveMode;
  objectiveMotifIds: string[];
  targetComboId?: string;
  quiz?: LessonQuiz;
  culturalFocus: string;
  cultureEntryIds: string[];
  reward: string;
}

export interface JianzhiCommission {
  id: JianzhiCommissionId;
  title: string;
  season: string;
  brief: string;
  foldSuggestion: FoldMode;
  objectiveMode: ObjectiveMode;
  objectiveMotifIds: string[];
  targetComboId?: string;
  cultureEntryIds: string[];
  reward: string;
  reading: LessonReading;
  narrative: string[];
  quiz?: LessonQuiz;
}

export interface JianzhiSettings {
  reducedMotion: boolean;
  muted: boolean;
}

export interface JianzhiProgress {
  version: 2;
  curriculumUnlocked: number;
  completedLessons: JianzhiLessonId[];
  completedCommissions: JianzhiCommissionId[];
  collectedMotifIds: string[];
  discoveredCombos: string[];
  cultureEntryIds: string[];
  graduated: boolean;
}

export interface SavedWork {
  id: string;
  name: string;
  dataUrl: string;
  fold: FoldMode;
  motifIds: string[];
  createdAt: number;
}

export interface ObjectiveEvaluation {
  passed: boolean;
  missing: string[];
}

export type PaperMark =
  | { type: 'stroke'; points: Array<{ x: number; y: number }>; width: number }
  | { type: 'motif'; id: string; def: MotifDef; x: number; y: number; scale: number };
