import type { BeastId, WenshouSave } from './types.ts';
import { getBeast } from '../content/beasts.ts';
import { getSkill, ITEMS } from '../content/items.ts';
import type { StatusId } from './types.ts';

/**
 * 等级、经验与属性派生。
 *
 * 存档只存「基础值 + 等级 + 佩饰 + 出战兽」，实战属性由 deriveStats() 现算，
 * 免得升级/换佩饰后四处回写。
 */

/** 升到下一级所需经验。 */
export function expToNext(level: number): number {
  return Math.round(20 * Math.pow(level, 1.55));
}

export interface DerivedStats {
  maxHp: number;
  maxQi: number;
  atk: number;
  def: number;
  spd: number;
  immunes: StatusId[];
}

export function deriveStats(save: WenshouSave): DerivedStats {
  const lv = save.level;
  const maxHp = Math.round(60 + lv * 12 + lv * lv * 0.6);
  const maxQi = Math.round(12 + lv * 3.2) + save.shrine.qi * 8;
  const atk = Math.round(10 + lv * 1.9 + lv * lv * 0.05);
  const def = Math.round(6 + lv * 1.35);
  const spd = Math.round(8 + lv * 0.75);

  const immunes: StatusId[] = [];
  let bonus = { maxHpPct: 0, atkPct: 0, defFlat: 0, spdFlat: 0, maxQiFlat: 0 };

  // 佩饰槽 ×3（GDD §3.3）：旧档单 charm 由 parseSave 迁入 charms[0]
  const charmIds = (save.charms && save.charms.length > 0 ? save.charms : save.charm ? [save.charm] : []).slice(0, 3);
  for (const cid of charmIds) {
    const charm = ITEMS.find((i) => i.id === cid);
    if (!charm?.charm) continue;
    if (charm.charm.immune) immunes.push(...charm.charm.immune);
    bonus.maxHpPct += charm.charm.maxHp ?? 0;
    bonus.atkPct += charm.charm.atk ?? 0;
    bonus.defFlat += charm.charm.def ?? 0;
    bonus.spdFlat += charm.charm.spd ?? 0;
    bonus.maxQiFlat += charm.charm.maxQi ?? 0;
  }

  // 出战兽被动
  for (const id of save.party) {
    if (id === 'lushu') bonus.maxHpPct += 0.1;
    if (id === 'xingxing') bonus.spdFlat += 2;
    if (id === 'xuangui') bonus.defFlat += 3;
    if (id === 'lei') bonus.maxQiFlat += 6;
    if (id === 'changfu') bonus.spdFlat += 3;
    if (id === 'jiuwei') bonus.atkPct += 0.1;
  }

  return {
    maxHp: Math.round(maxHp * (1 + bonus.maxHpPct)),
    maxQi: maxQi + bonus.maxQiFlat,
    atk: Math.round(atk * (1 + bonus.atkPct)),
    def: def + bonus.defFlat,
    spd: spd + bonus.spdFlat,
    immunes,
  };
}

export interface LevelUpResult {
  levels: number;
  newSkills: string[];
}

/** 发经验，连升处理。返回解锁的新技能。 */
export function grantExp(save: WenshouSave, exp: number): LevelUpResult {
  save.exp += exp;
  let levels = 0;
  const newSkills: string[] = [];
  while (save.level < 30 && save.exp >= expToNext(save.level)) {
    save.exp -= expToNext(save.level);
    save.level += 1;
    levels += 1;
    for (const skill of ['strike', 'lingxi', 'lieshi', 'wenxin', 'shanguixiao', 'tagang', 'guiyuan', 'zhenyue', 'longyin', 'wuwu']) {
      const def = getSkill(skill);
      if (def && def.level <= save.level && !save.skills.includes(skill)) {
        save.skills.push(skill);
        newSkills.push(skill);
      }
    }
    if (save.level === 6 && save.party.length < 2) save.party.push('xingxing');
    if (save.level === 14 && save.party.length < 3) save.party.push('lushu');
  }
  return { levels, newSkills };
}

/** 出战位说明（UI 用）。 */
export function partyCap(level: number): number {
  if (level >= 14) return 3;
  if (level >= 6) return 2;
  return 1;
}

/** 收服兽入图鉴 + 统计。 */
export function registerTame(save: WenshouSave, beastId: BeastId): void {
  save.beasts[beastId] = (save.beasts[beastId] ?? 0) + 1;
  save.stats.tamedCount += 1;
  if (!save.encountered.includes(beastId)) save.encountered.push(beastId);
}

export function registerEncounter(save: WenshouSave, beastId: BeastId): void {
  if (!save.encountered.includes(beastId)) save.encountered.push(beastId);
}

/** 图鉴完成度（收服的兽种数）。 */
export function codexCount(save: WenshouSave): number {
  return Object.keys(save.beasts).filter((id) => (save.beasts[id as BeastId] ?? 0) > 0).length;
}

export function codexTotal(): number {
  return 11; // 可收服的兽种（白猿可收；蝮虫、怪蛇亦可收）
}

export function beastName(id: BeastId): string {
  return getBeast(id)?.name ?? id;
}

/** 全脉山望总和（差分结局判定用）。 */
export function favorSum(save: WenshouSave): number {
  return Object.values(save.favor ?? {}).reduce((a, b) => a + (b ?? 0), 0);
}

/** 驯向指数：收服占战斗的比例（0–1）。 */
export function tameRate(save: WenshouSave): number {
  if (save.stats.battlesWon <= 0) return 1;
  return save.stats.tamedCount / save.stats.battlesWon;
}
