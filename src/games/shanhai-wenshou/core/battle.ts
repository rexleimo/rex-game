import type {
  BattleLogLine,
  BattleState,
  BeastCombatState,
  BeastId,
  PlayerAction,
  PlayerCombatState,
  StatusId,
} from './types.ts';
import { getBeast, scaleBeast } from '../content/beasts.ts';
import { getItem, getSkill } from '../content/items.ts';
import { getMountain } from '../content/mountains.ts';

/**
 * 回合制战斗引擎 —— 纯函数状态机。
 *
 * 约束：
 * - resolve() 每次推进「玩家行动 + 兽的回击 + 回合结算」一整步；
 * - 「问兽」答题不在此判定，UI 拿题给玩家，答完调 applyInsight()；
 * - 随机数经 rng 参数注入，单测里用固定 rng 复现整场战斗。
 */

export type Rng = () => number;

export function variance(rng: Rng): number {
  return 0.88 + rng() * 0.24;
}

export function spawnBeast(beastId: BeastId, level: number, elite = false, terrain?: string): BeastCombatState {
  const template = getBeast(beastId);
  if (!template) throw new Error(`Unknown beast: ${beastId}`);
  const scaled = scaleBeast(template.base, level, elite);
  return {
    beastId,
    name: elite ? `狂化的${template.name}` : template.name,
    level,
    maxHp: scaled.maxHp,
    hp: scaled.maxHp,
    atk: scaled.atk,
    def: scaled.def,
    spd: scaled.spd,
    effects: {},
    insight: 0,
    revealed: { shape: false, sound: false, nature: false },
    asked: [],
  };
}

export function spawnPlayer(init: { maxHp: number; hp: number; maxQi: number; qi: number; atk: number; def: number; spd: number }): PlayerCombatState {
  return {
    ...init,
    limited: {},
    guarding: false,
    effects: {},
  };
}

export function initBattle(player: PlayerCombatState, beast: BeastCombatState, activeBeasts: BeastId[], terrain?: string): BattleState {
  const state: BattleState = {
    beast,
    player,
    round: 1,
    phase: 'choose',
    log: [{ side: 'system', text: `${beast.name}出现了！` }],
    expGained: 0,
    drops: [],
    tameAttempts: 0,
    activeBeasts,
    usedBeastSkills: [],
    terrain: terrain ?? '',
  };
  // 地形开局状态（猿翼之瘴、青丘之迷、无名之瘴）
  if (terrain) {
    const openStatus = getMountain(terrain as never).terrain?.openStatus;
    for (const [status, turns] of Object.entries(openStatus ?? {})) {
      const n = turns ?? 0;
      if (n <= 0) continue;
      if (playerImmune(state, status as StatusId)) continue;
      state.player.effects[status as StatusId] = n;
      const names: Record<string, string> = { zhang: '瘴', mi: '迷' };
      state.log.push({ side: 'system', text: `${names[status] ?? status}气缠身（${n} 回合）。` });
    }
  }
  return state;
}

function playerImmune(state: BattleState, status: StatusId): boolean {
  // 佩饰免疫由外部在构建 player 时折算为 immune 列表；这里查effects承载
  return state.player.effects[status] === -1;
}

function markImmune(state: BattleState, status: StatusId) {
  state.player.effects[status] = -1;
}

/** 出战兽的被动折算成免疫/增益，在开战前调用。 */
export function applyPassives(state: BattleState, immunes: StatusId[]) {
  for (const status of immunes) markImmune(state, status);
}

function effectiveDef(def: number): number {
  return def;
}

export function computeDamage(
  atk: number,
  def: number,
  mult: number,
  insight: number,
  piercing: boolean,
  rng: Rng,
): number {
  const base = atk * mult;
  const mitigated = base * (piercing ? 1 - (def * 0.5) / (effectiveDef(def) * 0.5 + 60) : 1 - def / (def + 60));
  const insightBoost = 1 + insight * 0.2; // 识破每层 +20% 易伤
  return Math.max(1, Math.round(mitigated * insightBoost * variance(rng)));
}

function beastTakeDamage(state: BattleState, amount: number): void {
  state.beast.hp = Math.max(0, state.beast.hp - amount);
}

function pushLog(state: BattleState, side: BattleLogLine['side'], text: string) {
  state.log.push({ side, text });
  if (state.log.length > 60) state.log.splice(0, state.log.length - 60);
}

export function insightMultiplier(beast: BeastCombatState): number {
  return 1 + beast.insight * 0.2;
}

/** 玩家先手判定：抢得先机则兽的回击减力，反之兽占上风。狌狌「伏行」必定先机。 */
export function playerFirst(state: BattleState, rng: Rng): boolean {
  if (state.player.effects.fuxing != null) return true;
  if (state.player.spd >= state.beast.spd * 1.25) return true;
  return rng() < 0.6;
}

/** 兽的行动：血少则凶，被惧则怯；先机影响回击力度。 */
function beastAct(state: BattleState, rng: Rng, first: boolean): void {
  const beast = state.beast;
  if (beast.hp <= 0) return;
  const fearful = (beast.effects.ju ?? 0) > 0;
  const enraged = (beast.effects.nu ?? 0) > 0;
  const guarded = state.player.guarding;
  const dodge = (state.player.effects.huke ?? 0) > 0 && rng() < 0.5; // 灌灌「呵音」

  let atk = beast.atk;
  if (enraged) atk = Math.round(atk * 1.3);
  if (fearful) atk = Math.round(atk * 0.7);
  if (!first) atk = Math.round(atk * 1.1);

  let damage = computeDamage(atk, state.player.def, 1, 0, false, rng);
  if (first) damage = Math.round(damage * 0.65);
  if (guarded) damage = Math.round(damage * 0.4);
  if (state.player.effects.xuanjia && state.player.effects.xuanjia > 0) damage = Math.round(damage * 0.55);
  if (dodge) {
    pushLog(state, 'system', '呵音未散，兽的攻势落了空！');
    return;
  }

  state.player.hp = Math.max(0, state.player.hp - damage);
  pushLog(state, 'beast', `${beast.name}攻了过来，你受到 ${damage} 点伤害。`);

  if (state.player.hp <= 0 && (state.player.effects.dongzhe ?? 0) > 0) {
    state.player.effects.dongzhe = 0;
    state.player.hp = Math.max(1, Math.round(state.player.maxHp * 0.25));
    pushLog(state, 'system', '鯥的「冬死夏生」发动——你从昏厥中缓了过来！');
  }
}

/** 玩家行动 → 兽回击 → 回合收尾。返回 updated state（同一引用）。 */
export function resolvePlayerAction(state: BattleState, action: PlayerAction, rng: Rng): BattleState {
  if (state.phase !== 'choose') return state;
  const player = state.player;

  const consumeQi = (n: number) => {
    player.qi = Math.max(0, player.qi - n);
  };

  if (action.type === 'guard') {
    player.guarding = true;
    player.qi = Math.min(player.maxQi, player.qi + 2);
    pushLog(state, 'player', '你收杖守势，回气两点。');
  } else if (action.type === 'attack') {
    const dmg = computeDamage(player.atk, state.beast.def, 1, state.beast.insight, false, rng);
    beastTakeDamage(state, dmg);
    consumeQi(0);
    pushLog(state, 'player', `你执杖一击，造成 ${dmg} 点伤害。`);
  } else if (action.type === 'skill') {
    const skill = getSkill(action.skillId);
    if (!skill) return state;
    const used = player.limited[skill.id] ?? 0;
    if (skill.perBattle && used >= skill.perBattle) {
      pushLog(state, 'system', `${skill.name}今日气力已尽。`);
      return state;
    }
    if (player.qi < skill.qiCost) {
      pushLog(state, 'system', '气力不够，先守一回吧。');
      return state;
    }
    if (skill.perBattle) player.limited[skill.id] = used + 1;
    consumeQi(skill.qiCost);

    switch (skill.effect) {
      case 'heal': {
        const heal = Math.round(player.maxHp * 0.25);
        player.hp = Math.min(player.maxHp, player.hp + heal);
        pushLog(state, 'player', `${skill.name}——回复 ${heal} 点生命。`);
        break;
      }
      case 'qiReturn': {
        const back = Math.round(player.maxQi * 0.45);
        player.qi = Math.min(player.maxQi, player.qi + back);
        pushLog(state, 'player', `${skill.name}——回复 ${back} 点气。`);
        break;
      }
      case 'reveal': {
        const axis = nextHiddenAxis(state.beast);
        if (axis) {
          state.beast.revealed[axis] = true;
          pushLog(state, 'player', `${skill.name}——你看清了它的一条底细。`);
        } else {
          pushLog(state, 'player', `${skill.name}——它的底细你已了然。`);
        }
        if (skill.mult > 0) {
          const dmg = computeDamage(player.atk, state.beast.def, skill.mult, state.beast.insight, false, rng);
          beastTakeDamage(state, dmg);
          pushLog(state, 'player', `并造成 ${dmg} 点伤害。`);
        }
        break;
      }
      case 'fear': {
        const dmg = computeDamage(player.atk, state.beast.def, skill.mult, state.beast.insight, false, rng);
        beastTakeDamage(state, dmg);
        state.beast.effects.ju = 3;
        pushLog(state, 'player', `${skill.name}——造成 ${dmg} 点伤害，山鬼之啸令它生惧。`);
        break;
      }
      case 'double': {
        const d1 = computeDamage(player.atk, state.beast.def, skill.mult, state.beast.insight, false, rng);
        const d2 = computeDamage(player.atk, state.beast.def, skill.mult, state.beast.insight, false, rng);
        beastTakeDamage(state, d1 + d2);
        pushLog(state, 'player', `${skill.name}——两段连击，共造成 ${d1 + d2} 点伤害。`);
        break;
      }
      case 'pierce': {
        const dmg = computeDamage(player.atk, state.beast.def, skill.mult, state.beast.insight, true, rng);
        beastTakeDamage(state, dmg);
        pushLog(state, 'player', `${skill.name}——龙吟破甲，造成 ${dmg} 点伤害。`);
        break;
      }
      case 'selfHarm': {
        const dmg = computeDamage(player.atk, state.beast.def, skill.mult, state.beast.insight, false, rng);
        beastTakeDamage(state, dmg);
        const self = Math.max(1, Math.round(player.maxHp * 0.1));
        player.hp = Math.max(1, player.hp - self);
        pushLog(state, 'player', `${skill.name}——倾力一击造成 ${dmg} 点伤害，你自损 ${self} 点。`);
        break;
      }
      default: {
        const dmg = computeDamage(player.atk, state.beast.def, skill.mult, state.beast.insight, false, rng);
        beastTakeDamage(state, dmg);
        pushLog(state, 'player', `${skill.name}——造成 ${dmg} 点伤害。`);
      }
    }
  } else if (action.type === 'beastSkill') {
    if (state.usedBeastSkills.includes(action.beastId)) {
      pushLog(state, 'system', '这只兽灵已在旁边打了个盹。');
      return state;
    }
    const beastKit = getBeast(action.beastId);
    if (!beastKit || !beastKit.kit.active) return state;
    state.usedBeastSkills.push(action.beastId);
    pushLog(state, 'player', `${beastKit.name}发动「${beastKit.kit.active.name}」——${beastKit.kit.active.desc}`);

    // 各兽技效果
    if (action.beastId === 'lushu') {
      const heal = Math.round(player.maxHp * 0.18);
      player.hp = Math.min(player.maxHp, player.hp + heal);
      pushLog(state, 'system', `谣音袅袅，回复 ${heal} 点生命。`);
    } else if (action.beastId === 'xuangui') {
      player.effects.xuanjia = 2;
    } else if (action.beastId === 'xingxing') {
      player.effects.fuxing = 1; // 本回合必得先机
      const dmg = computeDamage(Math.round(player.atk * 0.6), state.beast.def, 1.2, state.beast.insight, false, rng);
      beastTakeDamage(state, dmg);
      pushLog(state, 'system', `伏行近身，补了一记 ${dmg} 点伤害。`);
    } else if (action.beastId === 'changfu') {
      const dmg = computeDamage(Math.round(player.atk * 0.7), state.beast.def, 1.5, state.beast.insight, false, rng);
      beastTakeDamage(state, dmg);
      pushLog(state, 'system', `三首齐扑，造成 ${dmg} 点伤害。`);
    } else if (action.beastId === 'jiuwei') {
      state.beast.effects.nu = 0;
      state.beast.effects.ju = Math.max(state.beast.effects.ju ?? 0, 0);
      state.beast.atk = Math.round(state.beast.atk * 0.75);
      pushLog(state, 'system', '婴啼声里，它的爪势软了。');
    } else if (action.beastId === 'lu') {
      player.effects.dongzhe = 1;
      player.qi = Math.min(player.maxQi, player.qi + 3);
      pushLog(state, 'system', '冬蛰护体：下次致命伤将化为一线生机，并回复三点气。');
    } else if (action.beastId === 'boyi') {
      state.beast.insight = Math.min(3, state.beast.insight + 1);
      state.beast.revealed.nature = true;
      pushLog(state, 'system', '背上的眼睛一睁——识破 +1，它的底细又清楚了一层。');
    } else if (action.beastId === 'guanguan') {
      player.effects.huke = 2;
      pushLog(state, 'system', '呵音护体：敌方下次攻击可能落空。');
    } else if (action.beastId === 'chiru') {
      delete state.player.effects.zhang;
      const heal = Math.round(player.maxHp * 0.12);
      player.hp = Math.min(player.maxHp, player.hp + heal);
      pushLog(state, 'system', `瘴气涤净，回复 ${heal} 点生命。`);
    } else if (action.beastId === 'lei') {
      const back = Math.round(player.maxQi * 0.4);
      player.qi = Math.min(player.maxQi, player.qi + back);
      pushLog(state, 'system', `阴阳自化，回复 ${back} 点气。`);
    } else if (action.beastId === 'fuchong') {
      state.beast.effects.zhang = 3;
      pushLog(state, 'system', '毒涎溅上它的皮毛。（瘴 3 回合）');
    } else if (action.beastId === 'guaishe') {
      state.beast.atk = Math.round(state.beast.atk * 0.85);
      pushLog(state, 'system', '缠绞之下，它的攻势迟了。');
    } else if (action.beastId === 'baiyuan') {
      const dmg = computeDamage(Math.round(player.atk * 0.4), state.beast.def, 1.1, state.beast.insight, false, rng);
      beastTakeDamage(state, dmg);
      player.qi = Math.min(player.maxQi, player.qi + 2);
      pushLog(state, 'system', `掷果命中，造成 ${dmg} 点伤害，回复两点气。`);
    }
  } else if (action.type === 'item') {
    const item = getItem(action.itemId);
    if (!item?.use) {
      pushLog(state, 'system', '这东西现在用不上。');
      return state;
    }
    if (item.use.hp) {
      const heal = Math.round(player.maxHp * item.use.hp);
      player.hp = Math.min(player.maxHp, player.hp + heal);
      pushLog(state, 'player', `${item.name}入腹，回复 ${heal} 点生命。`);
    }
    if (item.use.qi) {
      const back = Math.round(player.maxQi * item.use.qi);
      player.qi = Math.min(player.maxQi, player.qi + back);
      pushLog(state, 'player', `气力也续上了 ${back} 点。`);
    }
    if (item.use.cure) {
      for (const status of item.use.cure) delete player.effects[status];
      pushLog(state, 'player', `${item.name}涤去邪气。`);
    }
    if (item.use.shield) {
      player.effects.xuanjia = Math.max(player.effects.xuanjia ?? 0, 2);
      pushLog(state, 'player', `${item.name}护住了周身。`);
    }
  } else if (action.type === 'question') {
    // 问兽本身耗一回合；判分由 UI 调 applyInsight 后再推进
    pushLog(state, 'player', '你拄杖而立，凝神问兽……');
  } else if (action.type === 'tame') {
    state.tameAttempts += 1;
    const chance = tameChance(state.beast);
    if (rng() < chance) {
      state.phase = 'tamed';
      pushLog(state, 'system', `你唤它的名字，${state.beast.name}低头蹭了蹭你的杖头——问兽相认！`);
      return state;
    }
    pushLog(state, 'system', `${state.beast.name}甩尾避开了你的手印，再等等火候。（驯化率 ${Math.round(chance * 100)}%）`);
  }

  // 胜负先判：兽倒下则不需兽回击
  if (state.beast.hp <= 0 && state.phase === 'choose') {
    finishVictory(state);
    return state;
  }

  // 兽回击（先手判定）
  if (state.beast.hp > 0 && state.phase === 'choose') {
    beastAct(state, rng, playerFirst(state, rng));
  }

  // 回合收尾：状态结算
  state.round += 1;
  player.guarding = false;
  tickEffects(state);

  if (state.beast.hp <= 0 && state.phase === 'choose') finishVictory(state);
  else if (state.player.hp <= 0) {
    state.phase = 'lost';
    pushLog(state, 'system', '眼前一黑……醒来时你已在山祠的席上。');
  }
  return state;
}

function finishVictory(state: BattleState): void {
  state.phase = 'won';
  const template = getBeast(state.beast.beastId)!;
  const eliteK = state.beast.maxHp > template.base.hp * 2 ? 1.6 : 1;
  state.expGained = Math.round(template.exp * (1 + (state.beast.level - 1) * 0.08) * eliteK);
  pushLog(state, 'system', `${state.beast.name}伏下了身——胜了！`);
}

function tickEffects(state: BattleState): void {
  const player = state.player;
  if (player.effects.zhang && player.effects.zhang > 0) {
    const dmg = Math.max(2, Math.round(player.maxHp * 0.04));
    player.hp = Math.max(0, player.hp - dmg);
    pushLog(state, 'system', `瘴气蚀体，你损失 ${dmg} 点生命。`);
    if (player.hp <= 0 && (player.effects.dongzhe ?? 0) > 0) {
      player.effects.dongzhe = 0;
      player.hp = Math.max(1, Math.round(player.maxHp * 0.25));
      pushLog(state, 'system', '鯥的「冬死夏生」发动——你从昏厥中缓了过来！');
    }
  }
  if (state.beast.effects.zhang && state.beast.effects.zhang > 0) {
    const dmg = Math.max(2, Math.round(state.beast.maxHp * 0.03));
    state.beast.hp = Math.max(0, state.beast.hp - dmg);
    pushLog(state, 'system', `${state.beast.name}被瘴气所蚀，损失 ${dmg} 点生命。`);
  }
  for (const key of ['zhang', 'mi', 'ju', 'nu', 'xuanjia'] as const) {
    const value = player.effects[key];
    if (typeof value === 'number' && value > 0) {
      player.effects[key] = value - 1;
      if (player.effects[key] === 0) delete player.effects[key];
    }
    const bValue = state.beast.effects[key];
    if (typeof bValue === 'number' && bValue > 0) {
      state.beast.effects[key] = bValue - 1;
      if (state.beast.effects[key] === 0) delete state.beast.effects[key];
    }
  }
  // 伏行只保一回合
  delete player.effects.fuxing;
}

export function nextHiddenAxis(beast: BeastCombatState): 'shape' | 'sound' | 'nature' | null {
  if (!beast.revealed.shape) return 'shape';
  if (!beast.revealed.sound) return 'sound';
  if (!beast.revealed.nature) return 'nature';
  return null;
}

/** 答对 → 识破+1 并揭示线索；答错 → 兽怒。 */
export function applyInsight(state: BattleState, correct: boolean, axis?: 'shape' | 'sound' | 'nature'): BattleState {
  if (correct) {
    state.beast.insight = Math.min(3, state.beast.insight + 1);
    const target = axis ?? nextHiddenAxis(state.beast);
    if (target) state.beast.revealed[target] = true;
    pushLog(state, 'player', '问中了！它的形貌底细被你拿捏住了。（识破 +1）');
  } else {
    state.beast.effects.nu = 3;
    pushLog(state, 'beast', '问错了——它被激怒了，爪牙更凶。（兽怒 3 回合）');
  }
  return state;
}

/** 驯化率：血越少、识破越深、糈米越足，越稳。 */
export function tameChance(beast: BeastCombatState): number {
  const hpFactor = 1 - beast.hp / beast.maxHp;
  const base = 0.3 + beast.insight * 0.12 + hpFactor * 0.3;
  return Math.min(0.95, Math.max(0.05, base));
}

/** 识破满三层的驯化奖励在 UI 提示。 */
export function insightFull(beast: BeastCombatState): boolean {
  return beast.insight >= 3;
}
