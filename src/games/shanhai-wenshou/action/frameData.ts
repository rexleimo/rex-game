/**
 * 动作层帧数据与战斗数学 —— 纯函数，可单测（GDD §4.2 / §4.4）。
 *
 * 60fps 固定步长；1 帧 = 1/60 秒。这里只放「数字与规则」，
 * Phaser 场景只消费这些结果，不自行发明数值。
 */

/** 逻辑帧率。 */
export const FPS = 60;
/** 逻辑分辨率（GDD §6）。 */
export const VIEW_W = 960;
export const VIEW_H = 540;

/** 玩家动作帧表（帧数，60fps）。 */
export const PLAYER_FRAMES = {
  /** 轻攻三连段：前摇 / 判定 / 收招（GDD：轻1 前6/判4/收8）。 */
  light: [
    { windup: 6, active: 4, recover: 8, lunge: 26, mult: 1.0, chainFrom: 2 },
    { windup: 5, active: 4, recover: 8, lunge: 30, mult: 1.05, chainFrom: 2 },
    { windup: 8, active: 5, recover: 14, lunge: 46, mult: 1.5, chainFrom: 0 },
  ] as const,
  /** 蓄力重击：满蓄 0.8s=48 帧；释放前摇 14 帧 / 判定 6 / 收招 18；破架式 ×3。 */
  heavy: { chargeMax: 48, windup: 14, active: 6, recover: 18, lunge: 40, mult: 2.6, stanceMult: 3 },
  /** 翻滚：20 帧，第 6–14 帧无敌（GDD：20 帧 / 无敌 8–14，前移 2 帧容错）。 */
  roll: { total: 20, iframeFrom: 6, iframeTo: 14, speed: 340 },
  /** 弹反窗口 8 帧（辅助档 ×2=16）。 */
  parry: { window: 8, total: 22, enemyStagger: 40 },
  /** 受身 30 帧。 */
  getup: 30,
  /** 受击硬直 / 重伤踉跄。 */
  hurt: 14,
  stagger: 32,
  /** 跳跃（伊苏 3 式可跳上窄台）：满跳 ≈163px，平台步距按 ≤110px 设计，留容错。 */
  jump: { vy: -700, gravity: 1500, cutGravity: 2600, maxFall: 640, coyote: 9 },
  /** 判定盒尺寸与钩点（渲染用）。 */
  playerBox: { w: 20, h: 44 },
  /** 跑动。 */
  run: { speed: 235, accel: 2000, friction: 2600 },
  climb: { speed: 140 },
} as const;

/** 命中顿帧毫秒（GDD：轻 60–90 / 重 120 / 处决 200）。 */
export function hitstopMs(heavy: boolean, killing = false): number {
  if (killing) return 200;
  return heavy ? 120 : 75;
}

/** 震屏像素（2–4px 随机向；重击加强）。 */
export function shakePx(heavy: boolean): number {
  return heavy ? 4 : 2;
}

/** 兽的重量级三档（GDD §4.3）。 */
export type WeightClass = 'light' | 'fierce' | 'ancient';

export interface WeightProfile {
  /** 普通命中是否被打断（踉跄）。 */
  interruptible: boolean;
  /** 架式条上限；0 = 无架式条。 */
  stanceMax: number;
  /** 击退系数。 */
  knockback: number;
}

export const WEIGHTS: Record<WeightClass, WeightProfile> = {
  light: { interruptible: true, stanceMax: 0, knockback: 1.0 },
  fierce: { interruptible: false, stanceMax: 100, knockback: 0.55 },
  ancient: { interruptible: false, stanceMax: 140, knockback: 0.25 },
};

export interface DamageInput {
  atk: number;
  mult: number;
  def: number;
  /** 识破层数 0–3，每层 +12% 易伤。 */
  insightLayers?: number;
  /** 随机数 0–1（±10% 方差），测试可注入。 */
  variance?: number;
}

/** 伤害公式：atk × 倍率 × 方差 − 防守 × 0.55，至少 1。 */
export function calcDamage({ atk, mult, def, insightLayers = 0, variance = 0.5 }: DamageInput): number {
  const amp = 1 + insightLayers * 0.12;
  const raw = atk * mult * amp * (0.9 + variance * 0.2) - def * 0.55;
  return Math.max(1, Math.round(raw));
}

/** 击退向量：按重量级与攻击轻重（水平速度 px/s + 上挑）。 */
export function knockbackVelocity(weight: WeightClass, heavy: boolean, dir: 1 | -1): { vx: number; vy: number } {
  const k = WEIGHTS[weight].knockback * (heavy ? 1.6 : 1);
  return { vx: dir * 190 * k, vy: weight === 'light' && heavy ? -160 * k : -40 * k };
}

/** 难度三档（GDD §4.7）。 */
export type Difficulty = 'simple' | 'standard' | 'assist';

export interface DifficultyProfile {
  parryWindow: number;
  playerDamageTaken: number;
  /** 问名所需的识破层数（辅助档 2 层）。 */
  layersToName: number;
  /** 问名血线：低于此比例才可问名（弱兽血薄，25% 窗口会被连段跳过）。 */
  askHpRatio: number;
  beastDamage: number;
}

export const DIFFICULTIES: Record<Difficulty, DifficultyProfile> = {
  simple: { parryWindow: PLAYER_FRAMES.parry.window * 2, playerDamageTaken: 0.65, layersToName: 2, askHpRatio: 0.5, beastDamage: 0.8 },
  standard: { parryWindow: PLAYER_FRAMES.parry.window, playerDamageTaken: 1, layersToName: 3, askHpRatio: 0.35, beastDamage: 1 },
  assist: { parryWindow: PLAYER_FRAMES.parry.window * 2, playerDamageTaken: 0.6, layersToName: 2, askHpRatio: 0.5, beastDamage: 0.7 },
};

/** 识破三轴（GDD §4.6）。 */
export type InsightAxis = 'shape' | 'sound' | 'nature';

export interface InsightState {
  shape: boolean;
  sound: boolean;
  nature: boolean;
}

export function insightCount(s: InsightState): number {
  return (s.shape ? 1 : 0) + (s.sound ? 1 : 0) + (s.nature ? 1 : 0);
}

/**
 * 问名（收服）条件：三轴齐 + 兽血 < 25%（辅助档 2 轴即可）。
 * `layers` 为已得轴数，`required` 来自难度档。
 */
export function canAskName(layers: number, required: number, hpRatio: number, askHpRatio = 0.25): boolean {
  return layers >= required && hpRatio < askHpRatio;
}

/** 山望增减（GDD §4.5）：驯 +2、杀 −1、清瘴源(过精英) +1、采护 +。 */
export const FAVOR = { tame: 2, kill: -1, elite: 1, rite: 2 } as const;

export type FavorTier = 'cold' | 'wary' | 'warm' | 'devoted';

export function favorTier(favor: number): FavorTier {
  if (favor >= 6) return 'devoted';
  if (favor >= 3) return 'warm';
  if (favor <= -2) return 'cold';
  return 'wary';
}

/** 输入模型（键鼠 / 触屏共用；由 React 壳与键盘监听填充）。 */
export interface InputFrame {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  light: boolean;
  heavy: boolean;
  roll: boolean;
  parry: boolean;
  /** 命名收服。 */
  ask: boolean;
  /** 兽伴技 1/2/3。 */
  beast1: boolean;
  beast2: boolean;
  beast3: boolean;
  /** 用药（丹膳）。 */
  item: boolean;
}

export function emptyInput(): InputFrame {
  return {
    left: false, right: false, up: false, down: false, jump: false,
    light: false, heavy: false, roll: false, parry: false, ask: false,
    beast1: false, beast2: false, beast3: false, item: false,
  };
}

/** 帧数据合理性：预备帧必须可读（GDD §4.3 前摇可读铁律 24–40 帧）。 */
export function telegraphFramesOk(windup: number): boolean {
  return windup >= 20 && windup <= 44;
}
