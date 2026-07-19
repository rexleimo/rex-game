import type { RebusCombo } from './types';

/**
 * 从已落剪的纹样集合中识别所有「已成句」的吉语组合。
 * 一个组合成立，当且仅当它所需的全部纹样都出现在纸上。
 *
 * 纯函数：不依赖 React / Canvas / localStorage，便于推理与单测。
 */
export function detectCombos(placedMotifIds: string[], combos: RebusCombo[]): RebusCombo[] {
  const placed = new Set(placedMotifIds);
  return combos.filter((combo) => combo.motifIds.every((id) => placed.has(id)));
}

/** 判断某个具体组合是否已在纸上成句。 */
export function isComboFormed(combo: RebusCombo, placedMotifIds: string[]): boolean {
  const placed = new Set(placedMotifIds);
  return combo.motifIds.every((id) => placed.has(id));
}

/** 返回相对已知集合「新成句」的组合（用于工坊即时提示，不重复报旧句）。 */
export function newlyFormedCombos(
  placedMotifIds: string[],
  combos: RebusCombo[],
  known: string[],
): RebusCombo[] {
  const knownSet = new Set(known);
  return detectCombos(placedMotifIds, combos).filter((c) => !knownSet.has(c.id));
}
