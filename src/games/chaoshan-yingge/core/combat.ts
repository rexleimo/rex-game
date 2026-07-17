import type {
  CombatAttackInput,
  CombatAttackKind,
  CombatAttackResult,
  CombatBeatJudgment,
  FormationKind,
  FormationModifiers,
} from './types';

const ATTACKS: Record<CombatAttackKind, {
  damage: number;
  knockback: number;
  morale: number;
  range: number;
}> = {
  thrust: { damage: 18, knockback: 34, morale: 2, range: 118 },
  sweep: { damage: 24, knockback: 58, morale: 3, range: 168 },
  smash: { damage: 38, knockback: 92, morale: 5, range: 132 },
  counter: { damage: 46, knockback: 108, morale: 10, range: 142 },
  ultimate: { damage: 120, knockback: 180, morale: 0, range: 520 },
};

const FORMATIONS: Record<FormationKind, FormationModifiers> = {
  snake: {
    damageMultiplier: 1.15,
    damageTakenMultiplier: 1,
    guardWindowMultiplier: 1,
    moraleMultiplier: 1,
    rangeMultiplier: 1.08,
    speedMultiplier: 1.16,
  },
  circle: {
    damageMultiplier: 0.92,
    damageTakenMultiplier: 0.65,
    guardWindowMultiplier: 1.3,
    moraleMultiplier: 1,
    rangeMultiplier: 0.92,
    speedMultiplier: 0.82,
  },
  goose: {
    damageMultiplier: 1,
    damageTakenMultiplier: 1.08,
    guardWindowMultiplier: 0.95,
    moraleMultiplier: 1.25,
    rangeMultiplier: 1.35,
    speedMultiplier: 0.96,
  },
};

const FORMATION_ORDER: FormationKind[] = ['snake', 'circle', 'goose'];

export function judgeCombatBeat(deltaSeconds: number): CombatBeatJudgment {
  const delta = Math.abs(deltaSeconds);
  if (delta <= 0.07) return 'perfect';
  if (delta <= 0.15) return 'on-beat';
  return 'free';
}

export function getFormationModifiers(formation: FormationKind): FormationModifiers {
  return FORMATIONS[formation];
}

export function cycleFormation(formation: FormationKind): FormationKind {
  const index = FORMATION_ORDER.indexOf(formation);
  return FORMATION_ORDER[(index + 1) % FORMATION_ORDER.length];
}

export function applyMorale(current: number, delta: number) {
  const morale = Math.max(0, Math.min(100, Math.round(current + delta)));
  return { morale, ultimateReady: morale >= 100 };
}

export function resolveCombatAttack(input: CombatAttackInput): CombatAttackResult {
  const attack = ATTACKS[input.attack];
  const formation = FORMATIONS[input.formation];
  const judgment = judgeCombatBeat(input.beatDeltaSeconds);
  const rhythmMultiplier = judgment === 'perfect' ? 1.35 : judgment === 'on-beat' ? 1.15 : 1;
  const comboMultiplier = 1 + Math.min(Math.max(input.combo, 0), 20) * 0.012;
  const moraleMultiplier = judgment === 'perfect' ? 4 : judgment === 'on-beat' ? 2 : 1;

  return {
    damage: Math.round(attack.damage * formation.damageMultiplier * rhythmMultiplier * comboMultiplier),
    judgment,
    moraleGain: Math.round(attack.morale * moraleMultiplier * formation.moraleMultiplier),
    knockback: Math.round(attack.knockback * (judgment === 'perfect' ? 1.18 : 1)),
    range: Math.round(attack.range * formation.rangeMultiplier),
  };
}
