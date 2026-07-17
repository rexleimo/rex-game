export type YinggeChapterId =
  | 'drum-basics'
  | 'heroes-enter'
  | 'formation'
  | 'village-parade'
  | 'grand-performance';

export type NoteKind = 'left' | 'right' | 'formation';
export type TimingJudgment = 'perfect' | 'great' | 'good' | 'miss';
export type EvidenceKind = 'recorded' | 'oral-tradition' | 'game-interpretation';
export type CombatAttackKind = 'thrust' | 'sweep' | 'smash' | 'counter' | 'ultimate';
export type CombatBeatJudgment = 'perfect' | 'on-beat' | 'free';
export type FormationKind = 'snake' | 'circle' | 'goose';
export type EnemyKind = 'ash-wisp' | 'flanker' | 'pouncer' | 'swarm' | 'tile-guard' | 'miasma-chief';
export type StageTheme = 'village-road' | 'ancestral-hall' | 'temple-square' | 'lantern-street' | 'grand-stage';

export interface BeatEvent {
  id: string;
  at: number;
  kind: NoteKind;
  label: string;
}

export interface BeatMap {
  bpm: number;
  duration: number;
  leadIn: number;
  events: BeatEvent[];
}

export interface ChapterDefinition {
  id: YinggeChapterId;
  order: number;
  title: string;
  subtitle: string;
  region: string;
  tempoLabel: string;
  culturalFocus: string;
  cultureEntryIds: string[];
  palette: [string, string, string];
  beatMap: BeatMap;
}

export interface CultureEntry {
  id: string;
  title: string;
  region: string;
  category: 'history' | 'face-paint' | 'costume' | 'music' | 'formation' | 'heritage';
  summary: string;
  detail: string;
  evidence: EvidenceKind;
  sourceLabel: string;
  sourceUrl: string;
}

export interface YinggeGameConfig {
  latencyOffsetMs: number;
  reducedMotion: boolean;
  muted: boolean;
}

export interface PerformanceResult {
  accuracy: number;
  continuity: number;
  formation: number;
  spirit: number;
  maxCombo: number;
  grade: '甲' | '乙' | '丙' | '习';
  judgments: Record<TimingJudgment, number>;
}

export interface PerformanceInput {
  judgments: TimingJudgment[];
  maxCombo: number;
  formationHits: number;
  formationTotal: number;
}

export interface FormationModifiers {
  damageMultiplier: number;
  damageTakenMultiplier: number;
  guardWindowMultiplier: number;
  moraleMultiplier: number;
  rangeMultiplier: number;
  speedMultiplier: number;
}

export interface CombatAttackInput {
  attack: CombatAttackKind;
  formation: FormationKind;
  beatDeltaSeconds: number;
  combo: number;
}

export interface CombatAttackResult {
  damage: number;
  judgment: CombatBeatJudgment;
  moraleGain: number;
  knockback: number;
  range: number;
}

export interface EnemyProfile {
  label: string;
  hp: number;
  speed: number;
  strikeDamage: number;
  strikeInterval: number;
  damageReduction: number;
  displaySize: [number, number];
}

export interface StageWave {
  at: number;
  enemies: EnemyKind[];
  cue: string;
}

export interface BossPhase {
  threshold: number;
  speedMultiplier: number;
  strikeIntervalMultiplier: number;
  cue: string;
}

export interface StageDefinition {
  chapterId: YinggeChapterId;
  theme: StageTheme;
  durationSeconds: number;
  processionSpeed: number;
  objective: string;
  culturalMission: string;
  tutorialCues: Array<{ at: number; text: string }>;
  waves: StageWave[];
  boss: {
    kind: EnemyKind;
    label: string;
    hp: number;
    speed: number;
    strikeDamage: number;
    strikeInterval: number;
    phases: BossPhase[];
  };
}

export interface ChapterOutcome {
  victory: boolean;
  result: PerformanceResult;
  score: number;
  remainingHp: number;
}

export interface CampaignProgress {
  unlocked: number;
  bestSpirit: Partial<Record<YinggeChapterId, number>>;
}
