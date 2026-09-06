import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DIFFICULTIES,
  PLAYER_FRAMES,
  calcDamage,
  canAskName,
  favorTier,
  hitstopMs,
  insightCount,
  knockbackVelocity,
  telegraphFramesOk,
} from '../src/games/shanhai-wenshou/action/frameData.ts';
import { MOVESETS, WUMING_MOVESET, getMoveset } from '../src/games/shanhai-wenshou/action/moves.ts';
import {
  evalNatureAxis,
  evalShapeAxis,
  evalSoundAxis,
  initInsight,
  refreshInsight,
  registerMercy,
  settleBattle,
} from '../src/games/shanhai-wenshou/action/rules.ts';
import { buildLevel } from '../src/games/shanhai-wenshou/action/levels.ts';
import { MOUNTAINS } from '../src/games/shanhai-wenshou/content/mountains.ts';
import { BEASTS } from '../src/games/shanhai-wenshou/content/beasts.ts';
import type { MountainId } from '../src/games/shanhai-wenshou/core/types.ts';

describe('shanhai action frame data (GDD §4.2/§4.4)', () => {
  it('keeps light combo windup readable and heavy charging at spec', () => {
    for (const f of PLAYER_FRAMES.light) {
      assert.ok(f.windup >= 4 && f.windup <= 12, '轻攻前摇应为短帧');
      assert.ok(f.active >= 2 && f.active <= 8);
      assert.ok(f.recover >= f.windup, '收招不短于前摇（可读）');
    }
    assert.equal(PLAYER_FRAMES.heavy.chargeMax, 48, '满蓄 0.8s = 48 帧');
    assert.ok(PLAYER_FRAMES.roll.total === 20 && PLAYER_FRAMES.roll.iframeFrom < PLAYER_FRAMES.roll.iframeTo);
    assert.equal(PLAYER_FRAMES.parry.window, 8, '弹反窗口 8 帧');
  });

  it('hitstop follows the 60-90/120/200 rule', () => {
    assert.ok(hitstopMs(false) >= 60 && hitstopMs(false) <= 90);
    assert.equal(hitstopMs(true), 120);
    assert.equal(hitstopMs(true, true), 200);
  });

  it('damage respects floor, insight amp and variance bounds', () => {
    const base = { atk: 20, mult: 1, def: 4 };
    const min = calcDamage({ ...base, variance: 0 });
    const max = calcDamage({ ...base, variance: 1 });
    assert.ok(min >= 1);
    assert.ok(max > min, '方差应拉开伤害');
    const amped = calcDamage({ ...base, variance: 0.5, insightLayers: 3 });
    const plain = calcDamage({ ...base, variance: 0.5 });
    assert.ok(amped > plain, '识破层应增伤');
    assert.equal(calcDamage({ atk: 1, mult: 0.1, def: 99 }), 1, '保底 1 点');
  });

  it('knockback scales down with weight and up with heavy', () => {
    const light = knockbackVelocity('light', false, 1);
    const ancient = knockbackVelocity('ancient', false, 1);
    const heavyLight = knockbackVelocity('light', true, 1);
    assert.ok(Math.abs(light.vx) > Math.abs(ancient.vx));
    assert.ok(Math.abs(heavyLight.vx) > Math.abs(light.vx));
  });

  it('name-asking gate requires layers and low hp', () => {
    assert.equal(canAskName(3, 3, 0.5), false, '血量未低不可问名');
    assert.equal(canAskName(3, 3, 0.2), true);
    assert.equal(canAskName(2, 3, 0.1), false, '层数不足不可问名');
    assert.equal(canAskName(2, 2, 0.45, 0.5), true, '简明档两印+半血即可问名');
    assert.equal(canAskName(2, 2, 0.4, 0.35), false, '标准档 35% 血线未到');
  });

  it('difficulty profiles: assist widens parry, simple halves insight need', () => {
    assert.equal(DIFFICULTIES.standard.parryWindow, 8);
    assert.equal(DIFFICULTIES.simple.parryWindow, 16);
    assert.equal(DIFFICULTIES.assist.layersToName, 2);
    assert.ok(DIFFICULTIES.simple.playerDamageTaken < 1);
  });

  it('telegraph frames stay in the readable 20-44 band', () => {
    assert.equal(telegraphFramesOk(24), true);
    assert.equal(telegraphFramesOk(12), false);
    assert.equal(telegraphFramesOk(50), false);
  });

  it('favor tiers order by value', () => {
    assert.equal(favorTier(7), 'devoted');
    assert.equal(favorTier(4), 'warm');
    assert.equal(favorTier(-3), 'cold');
    assert.equal(favorTier(0), 'wary');
  });

  it('insightCount sums axes', () => {
    assert.equal(insightCount({ shape: true, sound: false, nature: true }), 2);
  });
});

describe('shanhai beast movesets (GDD §4.3)', () => {
  it('covers all 13 beasts with 3 readable moves each', () => {
    assert.equal(Object.keys(MOVESETS).length, 13);
    for (const b of BEASTS) {
      const set = MOVESETS[b.id];
      assert.ok(set, `缺 ${b.name} 的招式表`);
      assert.equal(set.moves.length, 3, `${b.name} 应有 3 招`);
      for (const mv of set.moves) {
        assert.ok(mv.windup >= 20 && mv.windup <= 44, `${b.name}·${mv.name} 前摇 ${mv.windup} 不可读`);
        assert.ok(mv.active > 0 && mv.recover > 0);
        assert.ok(mv.cd > 0);
        assert.ok(mv.note.length >= 6, `${b.name}·${mv.name} 缺弱点提示`);
      }
      assert.ok(set.aggression >= 0 && set.aggression <= 1);
    }
  });

  it('gives ancient-weight bosses and a wuming variant', () => {
    assert.equal(MOVESETS.xuangui.weight, 'ancient');
    assert.equal(MOVESETS.jiuwei.weight, 'ancient');
    assert.ok(MOVESETS.jiuwei.phase2, 'boss 应有二阶段');
    assert.equal(WUMING_MOVESET.moves.length, 3);
    assert.equal(getMoveset('jiuwei', true), WUMING_MOVESET);
    assert.equal(getMoveset('xingxing', false), MOVESETS.xingxing);
  });

  it('marks sound-tell moves so parries can award the sound seal', () => {
    for (const id of ['xuangui', 'jiuwei', 'boyi', 'guanguan'] as const) {
      assert.ok(
        MOVESETS[id].moves.some((m) => m.soundTell),
        `${id} 应有可弹反的声兆技`,
      );
    }
  });
});

describe('shanhai insight rules (GDD §4.6)', () => {
  it('shape: witnessed all moves or a single parry', () => {
    const p = initInsight();
    assert.equal(evalShapeAxis(p, 3), false);
    p.seenMoves.add('a');
    p.seenMoves.add('b');
    assert.equal(evalShapeAxis(p, 3), false);
    p.seenMoves.add('c');
    assert.equal(evalShapeAxis(p, 3), true, '看全三招得形印');
    const q = initInsight();
    q.parryCount = 1;
    assert.equal(evalShapeAxis(q, 3), true, '弹反一次也得形印');
  });

  it('sound: only a sound-tell parry counts', () => {
    const p = initInsight();
    p.parryCount = 2;
    assert.equal(evalSoundAxis(p), false, '普通弹反不给声印');
    p.soundParries = 1;
    assert.equal(evalSoundAxis(p), true);
  });

  it('nature: two clues or one mercy', () => {
    const p = initInsight();
    p.clues = 1;
    assert.equal(evalNatureAxis(p), false);
    p.clues = 2;
    assert.equal(evalNatureAxis(p), true);
    const q = initInsight();
    assert.equal(registerMercy(q, 'lu_bow'), true);
    assert.equal(registerMercy(q, 'lu_bow'), false, '同一慈悲不重复记');
    assert.equal(evalNatureAxis(q), true, '慈悲即情报');
  });

  it('refreshInsight reports newly gained axes only via axis flags', () => {
    const p = initInsight();
    p.parryCount = 1;
    p.soundParries = 1;
    p.clues = 2;
    const gained = refreshInsight(p, 3);
    assert.deepEqual(gained.sort(), ['nature', 'shape', 'sound'].sort());
    assert.deepEqual(refreshInsight(p, 3), [], '重复刷新不再报');
  });

  it('settle: slain doubles drops and costs favor; tame grants favor', () => {
    const slain = settleBattle('xingxing', 'slain');
    assert.equal(slain.drops.length, 2, '材料 ×2');
    assert.equal(slain.favorDelta, -1);
    const tamed = settleBattle('xingxing', 'tamed');
    assert.equal(tamed.drops.length, 1);
    assert.equal(tamed.favorDelta, 2);
    assert.ok(tamed.exp > 0);
  });
});

describe('shanhai level builder (GDD §5.2)', () => {
  const IDS = MOUNTAINS.map((m) => m.id) as MountainId[];

  it('builds all ten mountains with five-beat structure', () => {
    for (const id of IDS) {
      const lv = buildLevel(id);
      assert.equal(lv.mountain, id);
      assert.equal(lv.width, 1150 * 5, `${id} 应为五屏宽`);
      assert.ok(lv.platforms.length >= 3, `${id} 缺平台`);
      assert.ok(lv.checkpoints.length >= 2, `${id} 缺祠座`);
      assert.ok(lv.boss.arenaW > 500, `${id} boss 场太小`);
      assert.ok(lv.boss.spawn.x > lv.boss.arenaX, `${id} boss 应在场地内`);
      assert.ok(lv.npcs.length >= 1, `${id} 缺 NPC`);
      assert.ok(lv.steles.length >= 1, `${id} 缺界碑`);
      // 山产每项恰一个点位（村口赠药等额外拾取不计入）
      const itemPicks = lv.pickups.filter((p) => p.itemId);
      const m = MOUNTAINS.find((x) => x.id === id)!;
      const gatherIds = Object.keys(m.gathers);
      const gatherPicks = itemPicks.filter((p) => gatherIds.includes(p.itemId!));
      assert.equal(new Set(gatherPicks.map((p) => p.itemId)).size, gatherIds.length, `${id} 山产点位重复或缺`);
      // 线索点 ≥3（迹拍）
      assert.ok(lv.pickups.filter((p) => p.kind === 'clue').length >= 3, `${id} 线索点不足`);
      // 装饰层：路牌 + 树/灌/石/花至少铺满一路
      assert.ok(lv.decos.length >= 20, `${id} 装饰过少（${lv.decos.length}）`);
      assert.ok(lv.decos.some((d) => d.kind === 'sign'), `${id} 缺段落路牌`);
    }
  });

  it('routes spawns to real beasts and puts an elite on the gate when defined', () => {
    for (const m of MOUNTAINS) {
      const lv = buildLevel(m.id);
      for (const s of lv.spawns) {
        assert.ok(BEASTS.some((b) => b.id === s.beastId), `${m.name} 野生点引用未知兽`);
        assert.equal(s.zone, 'wild');
      }
      if (m.eliteFight) {
        assert.ok(lv.eliteGate, `${m.name} 有精英战但无门`);
        assert.equal(lv.eliteGate!.spawn.beastId, m.eliteFight.beastId);
      }
      assert.equal(lv.boss.spawn.beastId, m.boss.beastId);
    }
  });

  it('applies terrain variations from the canonical text', () => {
    const yuanyi = buildLevel('yuanyi');
    assert.ok(yuanyi.fog > 0.5, '猿翼瘴浓');
    assert.ok(yuanyi.platforms.some((p) => p.climbable), '猿翼应有攀爬壁');
    const jishan = buildLevel('jishan');
    assert.equal(jishan.night, true, '基山夜战');
    assert.equal(buildLevel('qingqiu').night, true);
    assert.ok(buildLevel('dishan').waters.length > 0, '柢山多水');
    const wuming = buildLevel('wuming');
    assert.equal(wuming.boss.untamable, true, '无名吞名者不可驯');
    assert.equal(wuming.boss.isWuming, true);
    assert.ok(buildLevel('zhaoyao').waters.length > 0, '招摇临西海');
  });

  it('gives every mountain one canon knowledge gate (知识点入关)', () => {
    const expect: Record<string, { kind: string; item?: string; need?: number }> = {
      zhaoyao: { kind: 'item', item: 'zhuyu_cao' },
      tangting: { kind: 'jade', need: 1 },
      yuanyi: { kind: 'clue', need: 1 },
      niuyang: { kind: 'parry' },
      dishan: { kind: 'clue', need: 2 },
      danyuan: { kind: 'still' },
      jishan: { kind: 'item', item: 'migu_zhi' },
      qingqiu: { kind: 'clue', need: 2 },
      jiwei: { kind: 'tide' },
      wuming: { kind: 'tame', need: 3 },
    };
    for (const m of MOUNTAINS) {
      const lv = buildLevel(m.id);
      assert.equal(lv.gates.length, 1, `${m.name} 应恰有一道知识门`);
      const g = lv.gates[0]!;
      const e = expect[m.id]!;
      assert.equal(g.kind, e.kind, `${m.name} 门型应为 ${e.kind}`);
      if (e.item) assert.equal(g.item, e.item);
      if (e.need != null) assert.equal(g.need, e.need);
      assert.ok(g.canon.length >= 4 && g.hint.length > 8, `${m.name} 门缺原文锚或提示`);
      assert.ok(g.x < lv.boss.arenaX, `${m.name} 门应在 boss 场之前`);
    }
  });

  it('keeps every platform reachable and every gate passable (跳得上/过得去)', () => {
    // 满跳 163px，常规步进 ≤100（留容错）；可攀爬台阶 ≤100（含攀爬补偿）。
    // 校验逐阶可达：每台必有下家（地面或其他台）在水平边隙 ≤140 且垂直 ≤100 范围内。
    const maxRise = (700 * 700) / (2 * 1500);
    assert.ok(maxRise > 140, '满跳应 >140px');
    for (const m of MOUNTAINS) {
      const lv = buildLevel(m.id);
      const ground = { x: 0, w: lv.width, y: lv.groundY };
      for (const p of lv.platforms) {
        const rise = lv.groundY - p.y;
        // 绝对顶高放宽到 390（垂直三连顶），逐阶校验保证可达
        assert.ok(rise <= 390, `${m.name} 平台 x${Math.round(p.x)} rise ${Math.round(rise)} 过高`);
        // 找下家：地面恒可踩；或其他台在水平边隙内且更低
        let bestGap = Infinity;
        // 地面：只要平台不高过 115 即直达，否则靠中继
        if (rise <= 115) bestGap = rise;
        for (const q of lv.platforms) {
          if (q === p || q.y <= p.y) continue; // q 必须更低（y 更大）
          const gapX = Math.max(0, Math.max(q.x, p.x) - Math.min(q.x + q.w, p.x + p.w));
          if (gapX > 140) continue;
          const gapY = q.y - p.y;
          if (gapY < bestGap) bestGap = gapY;
        }
        // 地面兜底：水平投影在地面上恒成立，gap 即 rise（已计）
        assert.ok(bestGap <= 100 + 15, `${m.name} 平台 x${Math.round(p.x)} y${Math.round(p.y)} 无中继可达（最近下家 ${Math.round(bestGap)}px）`);
      }
      // 精英应在门西同侧（玩家可打到），门在东防跳关
      if (lv.eliteGate) {
        assert.ok(lv.eliteGate.spawn.x < lv.eliteGate.x, `${m.name} 精英应在门西侧`);
      }
      // need=2 的线索门必须在第二线索之后
      const clueXs = lv.pickups.filter((p) => p.kind === 'clue').map((p) => p.x).sort((a, b) => a - b);
      const gate = lv.gates[0]!;
      if ((gate.need ?? 0) >= 2 && gate.kind === 'clue') {
        assert.ok(clueXs.filter((x) => x < gate.x).length >= 2, `${m.name} 门前线索不足2`);
      }
    }
  });

  it('adds thorn hazards and scales wild density by mountain order', () => {
    let withThorns = 0;
    for (const m of MOUNTAINS) {
      const lv = buildLevel(m.id);
      if (lv.thorns.length > 0) withThorns += 1;
      const wilds = lv.spawns.filter((sp) => sp.zone === 'wild').length;
      const want = m.order <= 3 ? 6 : m.order <= 7 ? 8 : 10;
      // 底线 = 采集径数 + 变奏段 4 只（无精英门再 +2）；无名之山遭遇池为空，作终局走廊
      const floor = m.id === 'wuming' ? 0 : want + 4 + (m.eliteFight ? 0 : 2);
      assert.ok(wilds >= floor, `${m.name} 野生兽应 ≥${floor}（实得 ${wilds}）`);
      // 野生点不得落在水湾里
      for (const sp of lv.spawns) {
        const hit = lv.waters.find((w) => sp.x > w.x && sp.x < w.x + w.w);
        assert.ok(!hit, `${m.name} 野生兽落在水湾 x=${sp.x}`);
      }
    }
    assert.ok(withThorns >= 6, `荆棘段应覆盖至少 6 座山（实得 ${withThorns}）`);
  });

  it('deals every canonical species instead of mono-rolls (一山多兽)', () => {
    for (const m of MOUNTAINS) {
      if (m.encounters.length <= 1) continue;
      const lv = buildLevel(m.id);
      const species = new Set(lv.spawns.filter((sp) => sp.zone === 'wild').map((sp) => sp.beastId));
      for (const e of m.encounters) {
        assert.ok(species.has(e.beastId), `${m.name} 野生池缺 ${e.beastId}（实得 ${[...species].join(',')}）`);
      }
    }
  });

  it('marks the last trail beast as a rare yizhong (压轴异种)', () => {
    for (const m of MOUNTAINS) {
      if (m.encounters.length === 0) continue;
      const lv = buildLevel(m.id);
      const rares = lv.spawns.filter((sp) => sp.zone === 'wild' && sp.title === '异种');
      assert.equal(rares.length, 1, `${m.name} 应恰有一只异种`);
    }
  });

  it('is deterministic per mountain (same seed → same layout)', () => {
    const a = buildLevel('niuyang');
    const b = buildLevel('niuyang');
    assert.equal(JSON.stringify(a), JSON.stringify(b));
  });
});
