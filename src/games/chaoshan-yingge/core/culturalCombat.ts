import type {
  CombatAttackKind,
  CombatBeatJudgment,
  EnemyKind,
  FormationKind,
} from './types';

export const ATTACK_CULTURE_LABELS: Record<CombatAttackKind, string> = {
  thrust: '点槌·开路',
  sweep: '展槌·合围',
  smash: '震槌·定势',
  counter: '守势·回槌',
  ultimate: '众槌·同声',
};

export const FORMATION_CULTURE_LABELS: Record<FormationKind, string> = {
  snake: '长蛇阵·纵向开路',
  circle: '圆阵·护住队心',
  goose: '雁行阵·展开队面',
};

export interface EnemyCultureGuide {
  preferredAttack: CombatAttackKind;
  preferredFormation: FormationKind;
  lesson: string;
  successCue: string;
}

export interface CulturalResponseResult {
  attackMatch: boolean;
  formationMatch: boolean;
  rhythmMatch: boolean;
  damageMultiplier: number;
  moraleBonus: number;
  cultureScore: number;
  cue: string;
}

const GUIDES: Record<EnemyKind, EnemyCultureGuide> = {
  'ash-wisp': {
    preferredAttack: 'thrust',
    preferredFormation: 'snake',
    lesson: '先听鼓心，再以短促点槌为队伍开出前进路线。',
    successCue: '听鼓开路 · 一槌一进',
  },
  flanker: {
    preferredAttack: 'thrust',
    preferredFormation: 'goose',
    lesson: '队面展开后照应两翼，以点槌截住侧向扰动。',
    successCue: '展开队面 · 两翼相顾',
  },
  pouncer: {
    preferredAttack: 'counter',
    preferredFormation: 'circle',
    lesson: '全队先收拢护住队心，守住冲势后再整齐回槌。',
    successCue: '守中回槌 · 队形不散',
  },
  swarm: {
    preferredAttack: 'sweep',
    preferredFormation: 'goose',
    lesson: '面对分散阻障先展开队面，再用展槌维持横向整齐。',
    successCue: '雁行展开 · 众槌齐落',
  },
  'tile-guard': {
    preferredAttack: 'smash',
    preferredFormation: 'snake',
    lesson: '纵向聚势后在重拍落下震槌，表现开路而非乱打。',
    successCue: '聚势震槌 · 稳步开路',
  },
  'miasma-chief': {
    preferredAttack: 'smash',
    preferredFormation: 'circle',
    lesson: '先稳住全队阵脚，再随鼓心震槌，等待众槌同声。',
    successCue: '圆阵定势 · 合队而进',
  },
};

export function getEnemyCultureGuide(kind: EnemyKind): EnemyCultureGuide {
  return GUIDES[kind];
}

export function formatEnemyCultureGuide(kind: EnemyKind): string {
  const guide = getEnemyCultureGuide(kind);
  return `${ATTACK_CULTURE_LABELS[guide.preferredAttack]} + ${FORMATION_CULTURE_LABELS[guide.preferredFormation]}`;
}

export function evaluateCulturalResponse(
  enemy: EnemyKind,
  attack: CombatAttackKind,
  formation: FormationKind,
  judgment: CombatBeatJudgment,
): CulturalResponseResult {
  const guide = getEnemyCultureGuide(enemy);
  const attackMatch = attack === guide.preferredAttack || attack === 'ultimate';
  const formationMatch = formation === guide.preferredFormation;
  const rhythmMatch = judgment !== 'free';
  const matchedParts = Number(attackMatch) + Number(formationMatch) + Number(rhythmMatch);

  return {
    attackMatch,
    formationMatch,
    rhythmMatch,
    damageMultiplier: matchedParts === 3 ? 1.45 : matchedParts === 2 ? 1.12 : matchedParts === 1 ? 0.9 : 0.68,
    moraleBonus: matchedParts === 3 ? 8 : matchedParts === 2 ? 3 : 0,
    cultureScore: matchedParts,
    cue: matchedParts === 3
      ? guide.successCue
      : `看队形：${formatEnemyCultureGuide(enemy)}`,
  };
}
