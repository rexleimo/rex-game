import type { BeastId, MountainId } from '../core/types.ts';
import { getMountain, MOUNTAINS } from '../content/mountains.ts';
import { getItem } from '../content/items.ts';

/**
 * 委托板（GDD §2.2：每山 2–3 条村民支线，约 1.5h）。
 * 三类委托，全部挂原文与山产：
 *  寻物——替村民采交山产（交货消耗）；
 *  清巢——替村子清剿瘴化兽（击倒/收服皆计）；
 *  拓印——把该山界碑原文拓回来（引文收集联动）。
 * 同一山的委托按山序确定性生成；奖励金玉/材料/山望/经验。
 */

export type CommissionKind = 'gather' | 'cull' | 'stele';

export interface CommissionDef {
  id: string;
  mountain: MountainId;
  kind: CommissionKind;
  name: string;
  giver: string;
  desc: string;
  /** 寻物：交货物品与数量。 */
  item?: string;
  amount?: number;
  /** 清巢：目标兽与数量。 */
  beast?: BeastId;
  /** 奖励。 */
  jade: number;
  rewardItem?: string;
  exp: number;
  favor: number;
}

const GIVERS = ['阿果', '石叔', '婆婆', '珠娘', '老羊', '守祠老人', '牧童', '渔人', '采药人', '樵夫'];

function lcg(seed: number): () => number {
  let s = seed * 2654435761 % 4294967296;
  if (s <= 0) s += 4294967295;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function buildFor(mountain: MountainId): CommissionDef[] {
  const m = getMountain(mountain)!;
  const rng = lcg(m.order * 104729 + 7);
  const giver = GIVERS[(m.order - 1) % GIVERS.length]!;
  const gatherEntries = Object.entries(m.gathers);
  const wild = m.encounters;

  // —— 委托一：寻物（交货；无名之山无山产，改寻界碑旁的白玉璜）——
  const fallbackGather: [string, number] = gatherEntries.length > 0
    ? (gatherEntries[m.order % gatherEntries.length]! as [string, number])
    : ['yupai', 2];
  const [gItem, gQty] = fallbackGather;
  const amount = Math.max(2, Math.min(4, Number(gQty ?? 2) + 1));
  const c1: CommissionDef = {
    id: `c-${mountain}-1`,
    mountain,
    kind: 'gather',
    name: `寻物 · ${getItem(gItem)?.name ?? gItem}`,
    giver,
    desc: `${giver}托你带${amount}份「${getItem(gItem)?.name ?? gItem}」回来——山里就有，路上当心兽。`,
    item: gItem,
    amount,
    jade: 18 + m.order * 4,
    rewardItem: wild.length > 0 ? wild[0]!.beastId : 'yupai',
    exp: 10 + m.order * 4,
    favor: 1,
  };

  // —— 委托二：清巢（无名之山无野外池，回退到狌狌——崖底这些年被瘴化的老邻居）——
  const fallback = (wild.length > 0 ? wild[Math.floor(rng() * wild.length)]!.beastId : 'xingxing') as BeastId;
  const target = fallback;
  const k = 3;
  const c2: CommissionDef = {
    id: `c-${mountain}-2`,
    mountain,
    kind: 'cull',
    name: `清巢 · 瘴化的${beastLabel(target)}`,
    giver: GIVERS[m.order % GIVERS.length]!,
    desc: `村口这几日被瘴化的${beastLabel(target)}搅得不安生。替我们料理 ${k} 只（收服也算——它们不闹了就行）。`,
    beast: target,
    amount: k,
    jade: 22 + m.order * 5,
    rewardItem: undefined,
    exp: 14 + m.order * 5,
    favor: 1,
  };

  // —— 委托三：拓印（引文联动）——
  const c3: CommissionDef = {
    id: `c-${mountain}-3`,
    mountain,
    kind: 'stele',
    name: '拓印 · 界碑原文',
    giver: '守祠老人',
    desc: '山祠界碑刻着这一山的经文。走近站定读一遍，算是替藏馆拓了一份——原文要有人记，山才不会忘。',
    jade: 14 + m.order * 3,
    exp: 8 + m.order * 3,
    favor: 1,
  };

  return [c1, c2, c3];
}

function beastLabel(id: BeastId): string {
  // 避免依赖 beasts.ts 造成循环：委托文案用山定义里的遭遇名（简表）
  const names: Record<string, string> = {
    xingxing: '狌狌', baiyuan: '白猿', fuchong: '蝮虫', guaishe: '怪蛇', lushu: '鹿蜀',
    xuangui: '旋龟', lu: '鯥', lei: '类', boyi: '猼訑', changfu: '𪁺𩿧', guanguan: '灌灌',
    chiru: '赤鱬', jiuwei: '九尾狐',
  };
  return names[id] ?? id;
}

const CACHE = new Map<MountainId, CommissionDef[]>();

/** 某山的委托（确定性）。 */
export function commissionsFor(mountain: MountainId): CommissionDef[] {
  let list = CACHE.get(mountain);
  if (!list) {
    list = buildFor(mountain);
    CACHE.set(mountain, list);
  }
  return list;
}

export function allCommissions(): CommissionDef[] {
  return MOUNTAINS.flatMap((m) => commissionsFor(m.id));
}

export interface CommissionState {
  def: CommissionDef;
  /** 进度（0–1 与剩余量）。 */
  progress: number;
  remaining: number;
  done: boolean;
  claimed: boolean;
}

/** 委托进度结算（纯函数）。 */
export function commissionState(
  def: CommissionDef,
  save: { items: Record<string, number>; commissionProgress?: Record<string, number>; claimedCommissions?: Record<string, 1>; stelesRead?: Partial<Record<MountainId, 1>> },
): CommissionState {
  const claimed = Boolean(save.claimedCommissions?.[def.id]);
  let progress = 0;
  if (def.kind === 'gather') {
    progress = Math.min(def.amount ?? 1, save.items[def.item!] ?? 0);
  } else if (def.kind === 'cull') {
    progress = Math.min(def.amount ?? 1, save.commissionProgress?.[`cull:${def.mountain}:${def.beast}`] ?? 0);
  } else {
    progress = save.stelesRead?.[def.mountain] ? 1 : 0;
  }
  const need = def.amount ?? 1;
  return { def, progress, remaining: Math.max(0, need - progress), done: progress >= need, claimed };
}

/** 交割奖励描述（UI 用）。 */
export function commissionRewardText(def: CommissionDef): string {
  const bits = [`${def.jade} 金玉`, `经验 ${def.exp}`, `山望 +${def.favor}`];
  if (def.rewardItem) bits.push(getItem(def.rewardItem)?.name ?? def.rewardItem);
  return bits.join(' · ');
}
