import type { InputFrame } from './frameData.ts';
import { emptyInput } from './frameData.ts';
import type { BattleOutcome } from './rules.ts';

/**
 * React 壳 ↔ Phaser 场景 的解耦层：
 * bus 传事件，touchInput 是触屏覆盖层写入、场景读取的输入镜像。
 */

export type HudState = {
  hp: number;
  maxHp: number;
  qi: number;
  maxQi: number;
  layers: number;
  axes: { shape: boolean; sound: boolean; nature: boolean };
  nameReady: boolean;
  poison: boolean;
  inverted: boolean;
  shield: number;
  itemCd: number;
  beastCds: number[];
};

export type BossHud = {
  name: string;
  title: string;
  hp: number;
  maxHp: number;
  stance: number;
  stanceMax: number;
  phase: number;
  isBoss: boolean;
} | null;

export type SceneEvents = {
  hud: HudState;
  boss: BossHud;
  toast: string;
  /** NPC/碑文对话（冻结操作直到关闭）。 */
  dialog: { name: string; lines: string[] } | null;
  /** boss 结算：驯/杀。 */
  outcome: (BattleOutcome & { title: string; isBoss: boolean; quiet?: boolean }) | null;
  /** 玩家倒下（回到祠座）。 */
  died: undefined;
  /** 走进山祠 → 请求祭礼仪式。 */
  rite: undefined;
  /** 精英过门。 */
  gateOpen: undefined;
  /** 拾取（React 更新存档）。 */
  gained: { kind: string; itemId?: string; amount: number };
  /** 连败提示。 */
  adviseCamp: undefined;
};

type Handler<K extends keyof SceneEvents> = (payload: SceneEvents[K]) => void;

const listeners = new Map<keyof SceneEvents, Set<Handler<never>>>();

export const bus = {
  on<K extends keyof SceneEvents>(key: K, fn: Handler<K>): () => void {
    let set = listeners.get(key);
    if (!set) {
      set = new Set();
      listeners.set(key, set);
    }
    set.add(fn as Handler<never>);
    return () => set!.delete(fn as Handler<never>);
  },
  emit<K extends keyof SceneEvents>(key: K, payload: SceneEvents[K]): void {
    const set = listeners.get(key);
    if (!set) return;
    for (const fn of set) (fn as Handler<K>)(payload);
  },
  clear(): void {
    listeners.clear();
  },
};

/** 场景发给壳的指令（暂停/退出）。 */
export const sceneCmd = {
  paused: false,
  /** 触屏覆盖层写入的输入。 */
  touch: emptyInput() as InputFrame,
  /** React 请求退出场景（回营地/下一山）。 */
  exit: false,
  /** 对话浮层打开（场景冻结玩家操作）。 */
  dialogOpen: false,
};

export function touchInput(): InputFrame {
  return sceneCmd.touch;
}

export function resetTouch(): void {
  sceneCmd.touch = emptyInput();
  sceneCmd.paused = false;
  sceneCmd.exit = false;
  sceneCmd.dialogOpen = false;
}
