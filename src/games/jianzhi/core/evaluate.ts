import type { ObjectiveEvaluation, ObjectiveMode, RebusCombo } from './types.ts';
import { detectCombos } from './rebus.ts';

export interface ObjectiveSpec {
  objectiveMode: ObjectiveMode;
  objectiveMotifIds: string[];
}

export function evaluateObjective(
  spec: ObjectiveSpec,
  placedMotifIds: string[],
  combos: RebusCombo[] = [],
): ObjectiveEvaluation {
  if (spec.objectiveMode === 'any-combo') {
    const formed = detectCombos(placedMotifIds, combos);
    return { passed: formed.length > 0, missing: formed.length ? [] : ['*any-combo*'] };
  }
  const missing = spec.objectiveMotifIds.filter((id) => !placedMotifIds.includes(id));
  return { passed: missing.length === 0, missing };
}
