import type { BeastId } from '../core/types.ts';
import type { WeightClass } from './frameData.ts';
import { telegraphFramesOk } from './frameData.ts';

/**
 * 13 兽招式表（GDD §4.3）：每兽 3 招 + 预备 + 弱点，全部由 beasts.ts 的
 * 「性」轴（nature/shape/sound）推演。战斗即阅读——预备动作 + 部位红闪 +
 * 声兆音效先行，玩家读招后才有胜负。
 */

/** 招式行为种类（WorldScene 按此驱动）。 */
export type MoveKind =
  | 'melee'      // 原地弧形判定
  | 'dash'       // 向前突进判定
  | 'leap'       // 跃起砸落
  | 'projectile' // 投掷物
  | 'aoe'        // 以自身为中心的范围
  | 'howl'       // 声兆技：可弹反；命中附加控制效果
  | 'heal'       // 自回复
  | 'fakeDeath'  // 冬蛰假死（鯥专属）
  | 'summon';    // 召唤小兽（boss 限定）

/** 声兆音色（audio.ts 映射；也是「听音辨招」的签名）。 */
export type SoundCue =
  | 'thud' | 'whoosh' | 'hiss' | 'woodknock' | 'cry' | 'song' | 'moo' | 'screech' | 'chirp';

export interface BeastMove {
  id: string;
  name: string;
  kind: MoveKind;
  /** 预备（可读）帧：20–44。 */
  windup: number;
  active: number;
  recover: number;
  /** 判定距离（px，中心到中心）。 */
  range: number;
  dmgMult: number;
  /** 冷却帧（放完才再进池）。 */
  cd: number;
  /** 声兆：预备期出声，弹反它=声识破。 */
  soundTell?: boolean;
  cue: SoundCue;
  /** 命中附加。 */
  onHit?: 'poison' | 'invert' | 'knockback' | 'drain';
  /** 投掷物速度 px/s。 */
  projSpeed?: number;
  /** 原文/性轴依据（HUD 弱点提示）。 */
  note: string;
}

export interface BeastMoveset {
  beastId: BeastId;
  weight: WeightClass;
  moves: BeastMove[];
  /** 逼近欲望 0–1：越高越贴脸。 */
  aggression: number;
  /** 假死血线（0–1，0=无）。 */
  fakeDeathAt?: number;
  /** 召唤冷却（帧，仅 boss）。 */
  summonCd?: number;
  /** boss 二阶段 50% 血换语汇。 */
  phase2?: { speedMult: number; extraMove?: string };
}

const m = (mv: BeastMove): BeastMove => {
  if (!telegraphFramesOk(mv.windup)) throw new Error(`${mv.id} 前摇 ${mv.windup} 不可读（需 20–44）`);
  return mv;
};

export const MOVESETS: Record<BeastId, BeastMoveset> = {
  xingxing: {
    beastId: 'xingxing',
    weight: 'light',
    aggression: 0.75,
    moves: [
      m({ id: 'xx_dash', name: '伏行突进', kind: 'dash', windup: 24, active: 14, recover: 16, range: 150, dmgMult: 1.0, cd: 150, cue: 'whoosh', note: '冲完必回头看祠门——耳侧黑瘴即破绽' }),
      m({ id: 'xx_mimic', name: '学步诱敌', kind: 'melee', windup: 36, active: 8, recover: 30, range: 70, dmgMult: 0.7, cd: 260, cue: 'chirp', note: '它停下学你走路时——停手即是慈悲，亦是识破（3 秒不动手=性）' }),
      m({ id: 'xx_swing', name: '祠柱荡击', kind: 'melee', windup: 28, active: 8, recover: 18, range: 105, dmgMult: 1.2, cd: 190, soundTell: true, cue: 'thud', note: '双手举过头顶时向它怀里滚' }),
    ],
  },
  baiyuan: {
    beastId: 'baiyuan',
    weight: 'light',
    aggression: 0.8,
    moves: [
      m({ id: 'by_hop', name: '长臂连打', kind: 'dash', windup: 22, active: 12, recover: 14, range: 130, dmgMult: 0.9, cd: 120, cue: 'whoosh', note: '臂长过膝，贴近反而打不到脚边' }),
      m({ id: 'by_throw', name: '掷果', kind: 'projectile', windup: 26, active: 4, recover: 16, range: 460, dmgMult: 0.8, cd: 210, projSpeed: 380, cue: 'chirp', note: '摘果时往侧面翻滚' }),
      m({ id: 'by_sweep', name: '荡枝横扫', kind: 'melee', windup: 30, active: 10, recover: 20, range: 120, dmgMult: 1.3, cd: 240, soundTell: true, cue: 'whoosh', note: '啸声一起它就荡枝——蹲下可避' }),
    ],
  },
  fuchong: {
    beastId: 'fuchong',
    weight: 'light',
    aggression: 0.6,
    moves: [
      m({ id: 'fc_bite', name: '啮', kind: 'dash', windup: 26, active: 10, recover: 20, range: 110, dmgMult: 1.1, cd: 140, onHit: 'poison', cue: 'hiss', note: '鳞擦石响之后半秒才咬——响声就是拍点' }),
      m({ id: 'fc_spit', name: '毒涎', kind: 'projectile', windup: 30, active: 4, recover: 18, range: 380, dmgMult: 0.7, cd: 220, projSpeed: 300, onHit: 'poison', cue: 'hiss', note: '仰头吸气时它会吐涎' }),
      m({ id: 'fc_coil', name: '盘身蓄势', kind: 'melee', windup: 34, active: 8, recover: 24, range: 85, dmgMult: 1.4, cd: 260, soundTell: true, cue: 'hiss', note: '盘成一圈时别靠近——它在绷劲' }),
    ],
  },
  guaishe: {
    beastId: 'guaishe',
    weight: 'fierce',
    aggression: 0.55,
    moves: [
      m({ id: 'gs_wind', name: '缠绞', kind: 'melee', windup: 32, active: 12, recover: 22, range: 95, dmgMult: 1.2, cd: 200, onHit: 'drain', cue: 'hiss', note: '被缠住会抽气——连续轻攻打断它' }),
      m({ id: 'gs_slither', name: '滑行冲撞', kind: 'dash', windup: 28, active: 18, recover: 22, range: 210, dmgMult: 1.1, cd: 190, cue: 'whoosh', note: '起身昂头即是冲锋预备' }),
      m({ id: 'gs_boil', name: '沸信', kind: 'projectile', windup: 30, active: 4, recover: 20, range: 400, dmgMult: 0.9, cd: 240, projSpeed: 330, cue: 'hiss', note: '嘶嘶如沸——吐信双响后弹反' }),
    ],
  },
  lushu: {
    beastId: 'lushu',
    weight: 'light',
    aggression: 0.35,
    moves: [
      m({ id: 'ls_kick', name: '后蹄踢', kind: 'melee', windup: 26, active: 8, recover: 18, range: 90, dmgMult: 1.0, cd: 200, soundTell: true, cue: 'thud', note: '它本无攻意——先退开三步可避免交手' }),
      m({ id: 'ls_song', name: '谣音', kind: 'heal', windup: 40, active: 10, recover: 24, range: 0, dmgMult: 0, cd: 420, cue: 'song', note: '其音如谣——听满一段它就回血，快打断' }),
      m({ id: 'ls_gallop', name: '惊奔', kind: 'dash', windup: 24, active: 16, recover: 22, range: 240, dmgMult: 0.9, cd: 260, cue: 'whoosh', note: '白首一低就是起奔' }),
    ],
  },
  xuangui: {
    beastId: 'xuangui',
    weight: 'ancient',
    aggression: 0.5,
    moves: [
      m({ id: 'xg_charge', name: '玄甲冲撞', kind: 'dash', windup: 34, active: 20, recover: 26, range: 220, dmgMult: 1.3, cd: 230, cue: 'thud', note: '霸体——只能弹反或破架式' }),
      m({ id: 'xg_tail', name: '虺尾抽打', kind: 'melee', windup: 26, active: 10, recover: 20, range: 115, dmgMult: 1.1, cd: 170, cue: 'whoosh', note: '蛇尾后掠时贴身最安全' }),
      m({ id: 'xg_boom', name: '音爆「如判木」', kind: 'howl', windup: 36, active: 6, recover: 30, range: 260, dmgMult: 1.2, cd: 300, soundTell: true, onHit: 'knockback', cue: 'woodknock', note: '音爆后 30 帧张口僵直；弹反音爆=听·识破' }),
    ],
  },
  lu: {
    beastId: 'lu',
    weight: 'fierce',
    aggression: 0.4,
    fakeDeathAt: 0.5,
    moves: [
      m({ id: 'lu_sweep', name: '蛇尾横扫', kind: 'melee', windup: 30, active: 12, recover: 22, range: 130, dmgMult: 1.2, cd: 190, soundTell: true, cue: 'whoosh', note: '胁下羽先张后扫' }),
      m({ id: 'lu_moo', name: '哞音召唤', kind: 'summon', windup: 44, active: 8, recover: 30, range: 0, dmgMult: 0, cd: 560, cue: 'moo', note: '低哞一声，同类循声而来——先清小兽' }),
      m({ id: 'lu_leap', name: '陵居坠击', kind: 'leap', windup: 32, active: 10, recover: 26, range: 200, dmgMult: 1.5, cd: 300, cue: 'thud', note: '跃起时脚下有影子——离开影子' }),
    ],
  },
  lei: {
    beastId: 'lei',
    weight: 'light',
    aggression: 0.65,
    moves: [
      m({ id: 'lei_still', name: '以静制动', kind: 'melee', windup: 42, active: 6, recover: 14, range: 100, dmgMult: 1.6, cd: 240, soundTell: true, cue: 'thud', note: '静得越久咬得越狠——预备期贴身打断' }),
      m({ id: 'lei_dual', name: '双身抓击', kind: 'dash', windup: 24, active: 12, recover: 16, range: 140, dmgMult: 0.9, cd: 150, cue: 'whoosh', note: '一体两面，出手两次' }),
      m({ id: 'lei_pounce', name: '狸扑', kind: 'leap', windup: 28, active: 8, recover: 20, range: 180, dmgMult: 1.2, cd: 260, cue: 'whoosh', note: '压低身子时它要扑' }),
    ],
  },
  boyi: {
    beastId: 'boyi',
    weight: 'fierce',
    aggression: 0.45,
    moves: [
      m({ id: 'bo_glare', name: '背目慑', kind: 'howl', windup: 36, active: 6, recover: 24, range: 320, dmgMult: 0.6, cd: 280, soundTell: true, onHit: 'invert', cue: 'cry', note: '背上眼睛睁开的瞬间弹反——不然方向倒转' }),
      m({ id: 'bo_spin', name: '九尾扫尘', kind: 'aoe', windup: 32, active: 14, recover: 26, range: 150, dmgMult: 1.3, cd: 300, cue: 'whoosh', note: '九条尾一起竖起时离远' }),
      m({ id: 'bo_ram', name: '低头冲顶', kind: 'dash', windup: 30, active: 16, recover: 24, range: 200, dmgMult: 1.2, cd: 220, cue: 'thud', note: '四耳先动，头随后低' }),
    ],
  },
  changfu: {
    beastId: 'changfu',
    weight: 'light',
    aggression: 0.7,
    moves: [
      m({ id: 'cf_dive', name: '三首齐扑', kind: 'dash', windup: 26, active: 14, recover: 18, range: 170, dmgMult: 1.1, cd: 160, cue: 'screech', note: '三个头吵出声就是扑击拍点' }),
      m({ id: 'cf_feather', name: '落羽乱掷', kind: 'projectile', windup: 30, active: 4, recover: 16, range: 420, dmgMult: 0.8, cd: 230, projSpeed: 340, cue: 'chirp', note: '三翼齐振时羽毛会来' }),
      m({ id: 'cf_hop', name: '六足乱踏', kind: 'aoe', windup: 28, active: 12, recover: 22, range: 110, dmgMult: 1.0, cd: 240, soundTell: true, cue: 'thud', note: '落地即踏，起跳可避' }),
    ],
  },
  guanguan: {
    beastId: 'guanguan',
    weight: 'light',
    aggression: 0.6,
    moves: [
      m({ id: 'gg_he', name: '呵音', kind: 'howl', windup: 30, active: 6, recover: 20, range: 300, dmgMult: 0.5, cd: 220, soundTell: true, onHit: 'knockback', cue: 'screech', note: '其音如呵——这一喝会把你推出去，弹反它' }),
      m({ id: 'gg_dive', name: '护巢俯冲', kind: 'dash', windup: 24, active: 12, recover: 16, range: 180, dmgMult: 1.2, cd: 150, cue: 'whoosh', note: '护巢极凶，靠近巢点它必俯冲' }),
      m({ id: 'gg_peck', name: '连喙三啄', kind: 'melee', windup: 26, active: 10, recover: 18, range: 85, dmgMult: 0.9, cd: 180, cue: 'chirp', note: '第一啄落空后有两记追啄' }),
    ],
  },
  chiru: {
    beastId: 'chiru',
    weight: 'light',
    aggression: 0.3,
    moves: [
      m({ id: 'cr_slap', name: '鳍拍', kind: 'melee', windup: 28, active: 8, recover: 20, range: 88, dmgMult: 0.9, cd: 220, cue: 'thud', note: '人面有悲喜——它拍人前会先露出愁容' }),
      m({ id: 'cr_duet', name: '鸯鸳和鸣', kind: 'heal', windup: 40, active: 10, recover: 26, range: 0, dmgMult: 0, cd: 460, cue: 'song', note: '双双和鸣时它在疗伤，快打断' }),
      m({ id: 'cr_flop', name: '鱼尾翻身', kind: 'aoe', windup: 30, active: 10, recover: 24, range: 105, dmgMult: 1.1, cd: 280, soundTell: true, cue: 'thud', note: '侧身倾斜就是要翻身压人' }),
    ],
  },
  jiuwei: {
    beastId: 'jiuwei',
    weight: 'ancient',
    aggression: 0.7,
    phase2: { speedMult: 1.25, extraMove: 'jw_wheel' },
    moves: [
      m({ id: 'jw_cry', name: '婴啼惑', kind: 'howl', windup: 40, active: 8, recover: 34, range: 420, dmgMult: 0.6, cd: 340, soundTell: true, onHit: 'invert', cue: 'cry', note: '啼声以旋龟佩（不聋）或弹反破' }),
      m({ id: 'jw_wheel', name: '九尾轮扫', kind: 'aoe', windup: 30, active: 16, recover: 28, range: 175, dmgMult: 1.4, cd: 260, cue: 'whoosh', note: '九尾立起如焰——翻滚出圈' }),
      m({ id: 'jw_fog', name: '雾隐分身', kind: 'melee', windup: 36, active: 12, recover: 24, range: 140, dmgMult: 1.2, cd: 380, soundTell: true, cue: 'cry', note: '分身无尾影——打带尾影的真身' }),
    ],
  },
};

/** 无名吞名者（终章 boss）：以九尾语汇为底的山神形态。 */
export const WUMING_MOVESET: BeastMoveset = {
  beastId: 'jiuwei',
  weight: 'ancient',
  aggression: 0.8,
  phase2: { speedMult: 1.3, extraMove: 'jw_wheel' },
  moves: [
    m({ id: 'wm_cry', name: '万名同啼', kind: 'howl', windup: 40, active: 8, recover: 30, range: 460, dmgMult: 0.7, cd: 300, soundTell: true, onHit: 'invert', cue: 'cry', note: '被吞的名字在替它哭——弹反即还名' }),
    m({ id: 'wm_devour', name: '吞名', kind: 'dash', windup: 30, active: 16, recover: 24, range: 230, dmgMult: 1.4, cd: 220, onHit: 'drain', cue: 'whoosh', note: '张口时黑雾前涌——离它远些' }),
    m({ id: 'wm_wheel', name: '形散轮舞', kind: 'aoe', windup: 32, active: 18, recover: 30, range: 190, dmgMult: 1.5, cd: 280, cue: 'whoosh', note: '它正在散形——这就是空当' }),
  ],
};

export function getMoveset(beastId: BeastId, isWuming = false): BeastMoveset {
  return isWuming ? WUMING_MOVESET : MOVESETS[beastId];
}
