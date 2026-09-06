/**
 * 《山海问兽》核心类型。
 *
 * 战斗引擎（core/battle.ts）是纯函数状态机：所有类型以可序列化为前提，
 * 战斗中途的状态可以直接进存档（来电话、切后台不丢局）。
 */

/** 《南山经》首脉九座有名之山 + 终章「无名之山」。 */
export type MountainId =
  | 'zhaoyao'
  | 'tangting'
  | 'yuanyi'
  | 'niuyang'
  | 'dishan'
  | 'danyuan'
  | 'jishan'
  | 'qingqiu'
  | 'jiwei'
  | 'wuming';

export type BeastId =
  | 'xingxing'    // 狌狌
  | 'baiyuan'     // 白猿
  | 'fuchong'     // 蝮虫
  | 'guaishe'     // 怪蛇
  | 'lushu'       // 鹿蜀
  | 'xuangui'     // 旋龟
  | 'lu'          // 鯥
  | 'lei'         // 类
  | 'boyi'        // 猼訑
  | 'changfu'     // 𪁺𩿧
  | 'guanguan'    // 灌灌
  | 'chiru'       // 赤鱬
  | 'jiuwei';     // 九尾狐

export type StatusId = 'zhang' | 'mi' | 'ju' | 'nu' | 'xuanjia' | 'huke' | 'fuxing' | 'dongzhe';

/** 玩家/兽共用的战斗属性快照。 */
export interface CombatStats {
  maxHp: number;
  hp: number;
  atk: number;
  def: number;
  spd: number;
}

export interface PlayerCombatState extends CombatStats {
  maxQi: number;
  qi: number;
  /** 本场已用次数受限的技能计数（技能 id → 已用次数）。 */
  limited: Record<string, number>;
  guarding: boolean;
  /** 兽灵护体挂起的增益，回合数倒计时。 */
  effects: Partial<Record<StatusId, number>>;
}

export interface BeastCombatState extends CombatStats {
  beastId: BeastId;
  name: string;
  level: number;
  effects: Partial<Record<StatusId, number>>;
  /** 问兽识破层数：0-3。层数越高易伤越深、线索越多。 */
  insight: number;
  /** 已揭示的线索轴。 */
  revealed: { shape: boolean; sound: boolean; nature: boolean };
  /** 本场已经问过的题干（防重复）。 */
  asked: string[];
}

export type PlayerAction =
  | { type: 'attack' }
  | { type: 'skill'; skillId: string }
  | { type: 'beastSkill'; beastId: string }
  | { type: 'item'; itemId: string }
  | { type: 'question' }
  | { type: 'tame' }
  | { type: 'guard' };

export interface BattleLogLine {
  side: 'player' | 'beast' | 'system';
  text: string;
}

export type BattlePhase = 'choose' | 'question' | 'won' | 'lost' | 'tamed';

export interface BattleState {
  beast: BeastCombatState;
  player: PlayerCombatState;
  round: number;
  phase: BattlePhase;
  log: BattleLogLine[];
  /** 本场战斗经验（结算时用）。 */
  expGained: number;
  /** 掉落（结算时用）。 */
  drops: string[];
  /** 驯化尝试次数。 */
  tameAttempts: number;
  /** 出战兽（主动技一次/场）。 */
  activeBeasts: BeastId[];
  /** 本场已用过的兽技。 */
  usedBeastSkills: string[];
  terrain: string;
}

/** 玩家技能（巫祝槌法 + 灵息）。 */
export interface SkillDef {
  id: string;
  name: string;
  desc: string;
  qiCost: number;
  /** 伤害倍率；0 表示非攻击技能。 */
  mult: number;
  /** 解锁等级。 */
  level: number;
  /** 每场限用次数；缺省不限。 */
  perBattle?: number;
  /** 附加效果。 */
  effect?: 'heal' | 'qiReturn' | 'fear' | 'pierce' | 'double' | 'selfHarm' | 'reveal';
}

/** 出战兽的被动与主动技。 */
export interface BeastKitDef {
  passive: string;
  passiveDesc: string;
  active?: { name: string; desc: string };
}

/** 异兽图鉴模板。 */
export interface BeastTemplate {
  id: BeastId;
  name: string;
  /** 生僻字注音。 */
  pinyin?: string;
  /** 南山经原文（截取相关句）。 */
  quote: string;
  /** 白话直译。 */
  plain: string;
  /** 问兽视角的一句话「性」。 */
  nature: string;
  /** 线索：形 / 声 / 性。 */
  shape: string;
  sound: string;
  /** 原文功效（食之/佩之），决定掉落与被动。 */
  effect: string;
  tier: 1 | 2 | 3 | 4 | 5;
  base: { hp: number; atk: number; def: number; spd: number };
  exp: number;
  /** 出现的山。 */
  mountains: MountainId[];
  kit: BeastKitDef;
  /** 掉落物 id 池。 */
  drops: string[];
  art: BeastArtSpec;
  /** 不可驯服的敌意兽（环境兽/山神使）。 */
  untamable?: boolean;
}

export interface BeastArtSpec {
  /** 主色。 */
  tint: string;
  /** 剪影字形 key，由 BeastArt 组件映射成 path 组。 */
  silhouette: 'ape' | 'horse' | 'turtle' | 'fish' | 'cat' | 'ram' | 'bird' | 'serpent' | 'fox' | 'humanface';
  /** 轮廓上的标记数（九尾、三首等），交给美术组件演绎。 */
  marks?: number;
}

export interface ItemDef {
  id: string;
  name: string;
  desc: string;
  /** 原文出处（功效句）。 */
  source: string;
  kind: 'herb' | 'tame' | 'cure' | 'material' | 'charm';
  /** 战斗/探索中使用效果。 */
  use?: { hp?: number; qi?: number; cure?: StatusId[]; tameBonus?: number; shield?: number };
  /** 佩戴效果。 */
  charm?: { atk?: number; def?: number; spd?: number; maxHp?: number; maxQi?: number; immune?: StatusId[] };
  /** 原料合成表。 */
  craft?: { inputs: Record<string, number>; kind: 'herb' | 'tame' | 'cure' | 'charm' };
  /** 可在祠以金玉购得的价格。 */
  price?: number;
}

/** 山川关卡定义。 */
export interface MountainDef {
  id: MountainId;
  order: number;
  name: string;
  /** 原文段落。 */
  quote: string;
  /** 白话大意。 */
  plain: string;
  /** 山野一句景语（探索时 randomly 显示）。 */
  scenery: string[];
  /** 地形效果描述与战斗开局的状态。 */
  terrain?: { desc: string; openStatus?: Partial<Record<StatusId, number>>; enemyOpenStatus?: Partial<Record<StatusId, number>> };
  /** 采集点池：itemId → 基础数量。 */
  gathers: Record<string, number>;
  /** 野外遭遇池（按权重）。 */
  encounters: { beastId: BeastId; weight: number; elite?: boolean }[];
  /** 必经精英战（推进门槛）。 */
  eliteFight?: { beastId: BeastId; level: number; elite: true; title: string };
  /** 山主（Boss）。 */
  boss: { beastId: BeastId; level: number; title: string; intro: string; elite?: boolean };
  /** 祠祭小考：出题池标记。 */
  gate: { title: string; questions: string[] };
  /** 山神。 */
  god: { name: string; desc: string };
}

/** 剧情指令流。 */
export interface StoryBeat {
  id: string;
  /** 触发时机。 */
  at:
    | { kind: 'chapterOpen' }
    | { kind: 'mountainOpen'; mountain: MountainId }
    | { kind: 'beforeBoss'; mountain: MountainId }
    | { kind: 'afterBoss'; mountain: MountainId }
    | { kind: 'mountainCleared'; mountain: MountainId }
    | { kind: 'tamed'; beast: BeastId }
    | { kind: 'chapterEnd' };
  speaker: string;
  text: string;
  /** 舞台指示（旁白体）。 */
  aside?: boolean;
  /** 二周目专属节拍（仅 ngPlus>0 时演出）。 */
  ng?: boolean;
}

/** 玩家存档。 */
export interface WenshouSave {
  version: 1;
  level: number;
  exp: number;
  /** 当前 HP/气（探索态）。 */
  hp: number;
  qi: number;
  /** 已解锁技能 id。 */
  skills: string[];
  /** 出战兽（最多 3）。 */
  party: BeastId[];
  /** 收服图鉴：兽 id → 收服数。 */
  beasts: Partial<Record<BeastId, number>>;
  /** 见过但未收服（图鉴灰卡）。 */
  encountered: BeastId[];
  items: Record<string, number>;
  /** 金玉。 */
  jade: number;
  /** 佩戴的佩饰。 */
  charm?: string;
  /** 当前所在山（推进序号）。 */
  mountainIndex: number;
  /** 每山状态。 */
  mountains: Partial<Record<MountainId, {
    cleared: boolean;
    gathered: string[];
    npcs: string[];
    gatePassed: boolean;
    bossDefeated: boolean;
    eliteDefeated: boolean;
  }>>;
  /** 已播过的剧情 beat。 */
  seenStory: string[];
  /** 山望（每山独立，驯/杀/祭增减；缺省 0）。 */
  favor?: Partial<Record<MountainId, number>>;
  /** 周目数（0=首周）。二周目起兽强化、结局差分。 */
  ngPlus?: number;
  /** 佩饰槽 ×3（GDD §3.3）。旧档 charm 迁移到 charms[0]。 */
  charms?: string[];
  /** 已交割的委托（委托板）。 */
  claimedCommissions?: Record<string, 1>;
  /** 清巢类委托计数：键 `cull:${mountain}:${beastId}` → 累计击倒数。 */
  commissionProgress?: Record<string, number>;
  /** 已拓印的界碑（引文收集）。 */
  stelesRead?: Partial<Record<MountainId, 1>>;
  /** 隐藏 boss 战绩。 */
  hidden?: { yaoyin?: 1; chuzhi?: 1 };
  /** 祠祭升级等级。 */
  shrine: { qi: number; satchel: number; tame: number; blessing: number };
  /** 统计与时长。 */
  stats: { playtimeMs: number; battlesWon: number; tamedCount: number; questionsCorrect: number; startedAt: number };
  chapterDone: boolean;
}
