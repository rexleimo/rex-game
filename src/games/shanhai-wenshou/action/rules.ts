import type { BeastId } from '../core/types.ts';
import { getBeast } from '../content/beasts.ts';
import type { InsightAxis, InsightState } from './frameData.ts';
import { FAVOR, insightCount } from './frameData.ts';

/**
 * 问兽规则（GDD §4.5 / §4.6）：识破三层=形/声/性，全部「打出来/查出来」。
 * 层齐 + 血量 <25% → 可问名（收服）；否则打死（了断，材料 ×2，山望 −）。
 */

export interface InsightProgress {
  axes: InsightState;
  /** 已完整目睹（活到最后）的招式 id。 */
  seenMoves: Set<string>;
  parryCount: number;
  /** 声兆弹反/打断次数。 */
  soundParries: number;
  /** 「迹」拍线索数（本场景内对该兽）。 */
  clues: number;
  /** 慈悲事件（鯥假死行礼、狌狌学步停手等）。 */
  mercy: string[];
}

export function initInsight(): InsightProgress {
  return { axes: { shape: false, sound: false, nature: false }, seenMoves: new Set<string>(), parryCount: 0, soundParries: 0, clues: 0, mercy: [] };
}

/**
 * 形：目睹并存活该兽每个招式组 ≥1 次，或弹反成功 1 次。
 * `moveCount` 为该兽招式总数。
 */
export function evalShapeAxis(p: InsightProgress, moveCount: number): boolean {
  if (p.axes.shape) return true;
  if (p.parryCount >= 1 || p.seenMoves.size >= moveCount) {
    p.axes.shape = true;
  }
  return p.axes.shape;
}

/** 声：在它的声兆阶段完成弹反/打断。 */
export function evalSoundAxis(p: InsightProgress): boolean {
  if (p.axes.sound) return true;
  if (p.soundParries >= 1) p.axes.sound = true;
  return p.axes.sound;
}

/** 性：「迹」拍现场线索 ×2，或一次慈悲行为（慈悲即情报）。 */
export function evalNatureAxis(p: InsightProgress): boolean {
  if (p.axes.nature) return true;
  if (p.clues >= 2 || p.mercy.length >= 1) p.axes.nature = true;
  return p.axes.nature;
}

export function refreshInsight(p: InsightProgress, moveCount: number): InsightAxis[] {
  const gained: InsightAxis[] = [];
  const before = { ...p.axes };
  if (evalShapeAxis(p, moveCount) && !before.shape) gained.push('shape');
  if (evalSoundAxis(p) && !before.sound) gained.push('sound');
  if (evalNatureAxis(p) && !before.nature) gained.push('nature');
  return gained;
}

export function layersOf(p: InsightProgress): number {
  return insightCount(p.axes);
}

/** 慈悲事件登记：同一事件只记一次。 */
export function registerMercy(p: InsightProgress, event: string): boolean {
  if (p.mercy.includes(event)) return false;
  p.mercy.push(event);
  return true;
}

export type BattleEndKind = 'tamed' | 'slain';

export interface BattleOutcome {
  kind: BattleEndKind;
  beastId: BeastId;
  exp: number;
  /** 掉落（杀=材料 ×2；驯=兽伴 + 一份材料）。 */
  drops: string[];
  favorDelta: number;
}

/** 结算（GDD §4.5：杀=材料×2、山望−；驯=兽伴、山望+）。 */
export function settleBattle(beastId: BeastId, kind: BattleEndKind, expBonus = 0): BattleOutcome {
  const beast = getBeast(beastId);
  const exp = (beast?.exp ?? 10) + expBonus;
  const drops = [...(beast?.drops ?? [])];
  if (kind === 'slain') {
    for (const d of [...drops]) drops.push(d);
    return { kind, beastId, exp, drops, favorDelta: FAVOR.kill };
  }
  return { kind, beastId, exp, drops, favorDelta: FAVOR.tame };
}

/** 精英过门 = 清瘴源，山望 +1。 */
export function eliteFavor(): number {
  return FAVOR.elite;
}

/** 祭礼 +2（GDD：祭则山安）。 */
export function riteFavor(): number {
  return FAVOR.rite;
}

export function favorLabel(tier: string): string {
  switch (tier) {
    case 'devoted': return '山民亲善';
    case 'warm': return '山望温热';
    case 'cold': return '山民侧目';
    default: return '山望冷淡';
  }
}
