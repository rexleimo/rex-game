import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { BEASTS, getBeast, scaleBeast } from '../src/games/shanhai-wenshou/content/beasts.ts';
import { MOUNTAINS, getMountain, mountainBeasts, rollEncounter, wildLevel } from '../src/games/shanhai-wenshou/content/mountains.ts';
import { QUESTIONS, finalRitePool, mountainGatePool, questionsFor } from '../src/games/shanhai-wenshou/content/questions.ts';
import { SKILLS, ITEMS, getSkill, getItem } from '../src/games/shanhai-wenshou/content/items.ts';
import { STORY_BEATS } from '../src/games/shanhai-wenshou/content/story.ts';
import {
  applyInsight,
  initBattle,
  playerFirst,
  resolvePlayerAction,
  spawnBeast,
  spawnPlayer,
  tameChance,
} from '../src/games/shanhai-wenshou/core/battle.ts';
import { codexCount, deriveStats, expToNext, grantExp, partyCap } from '../src/games/shanhai-wenshou/core/progression.ts';
import { createInitialSave, parseSave } from '../src/games/shanhai-wenshou/core/save.ts';
import { getGame } from '../src/core/gamesRegistry.ts';
import { cardsForGame } from '../src/core/passport/cards.ts';

/** 《山海经·南山经》鹊山首脉原文（ctext.org 收录本），内容锚定的基准。 */
const NANSHAN_QUE = [
  '南山经之首曰䧿山。其首曰招摇之山，临于西海之上，多桂，多金玉。有草焉，其状如韭而青华，其名曰祝余，食之不饥。有木焉，其状如榖而黑理，其华四照，其名曰迷榖，佩之不迷。有兽焉，其状如禺而白耳，伏行人走，其名曰狌狌，食之善走。丽麂之水出焉，而西流注于海，其中多育沛，佩之无瘕疾。',
  '又东三百里，曰堂庭之山，多棪木，多白猿，多水玉，多黄金。',
  '又东三百八十里，曰猿翼之山，其中多怪兽，水多怪鱼，多白玉，多蝮虫，多怪蛇，多怪木，不可以上。',
  '又东三百七十里，曰杻阳之山，其阳多赤金，其阴多白金。有兽焉，其状如马而白首，其文如虎而赤尾，其音如谣，其名曰鹿蜀，佩之宜子孙。怪水出焉，而东流注于宪翼之水。其中多玄龟，其状如龟而鸟首虺尾，其名曰旋龟，其音如判木，佩之不聋，可以为底。',
  '又东三百里柢山，多水，无草木。有鱼焉，其状如牛，陵居，蛇尾有翼，其羽在魼下，其音如留牛，其名曰鯥，冬死而夏生，食之无肿疾。',
  '又东四百里，曰亶爰之山，多水，无草木，不可以上。有兽焉，其状如狸而有髦，其名曰类，自为牝牡，食者不妒。',
  '又东三百里，曰基山，其阳多玉，其阴多怪木。有兽焉，其状如羊，九尾四耳，其目在背，其名曰猼訑，佩之不畏。有鸟焉，其状如鸡而三首、六目、六足、三翼，其名曰𪁺𩿧，食之无卧。',
  '又东三百里，曰青丘之山，其阳多玉，其阴多青雘。有兽焉，其状如狐而九尾，其音如婴儿，能食人，食者不蛊。有鸟焉，其状如鸠，其音如呵，名曰灌灌，佩之不惑。英水出焉，南流注于即翼之泽。其中多赤鱬，其状如鱼而人面，其音如鸯鸳，食之不疥。',
  '又东三百五十里，曰箕尾之山，其尾踆于东海，多沙石。汸水出焉，而南流注于淯，其中多白玉。',
  '凡䧿山之首，自招摇之山以至箕尾之山，凡十山，二千九百五十里，其神状皆鸟身而龙首。其祠之礼：毛用一璋玉瘗，糈用稌米，一璧稻米、白菅为席。',
].join('\n');

describe('shanhai-wenshou content anchors to the Nanshanjing text', () => {
  it('has 13 beasts with unique ids', () => {
    assert.equal(BEASTS.length, 13);
    assert.equal(new Set(BEASTS.map((b) => b.id)).size, 13);
  });

  it('quotes every beast verbatim from the canonical text', () => {
    for (const beast of BEASTS) {
      assert.ok(
        NANSHAN_QUE.includes(beast.quote),
        `${beast.name} 的引文不是原文子串：${beast.quote}`,
      );
      assert.ok(beast.plain.length > 10);
      assert.ok(beast.effect.length > 0);
      assert.ok(beast.shape.length > 0);
      assert.ok(beast.sound.length > 0);
    }
  });

  it('quotes every mountain verbatim, ten mountains in order', () => {
    assert.equal(MOUNTAINS.length, 10);
    MOUNTAINS.forEach((m, i) => {
      assert.equal(m.order, i + 1);
      assert.ok(NANSHAN_QUE.includes(m.quote), `${m.name} 的引文不是原文子串`);
      assert.ok(m.plain.length > 10);
      assert.ok(m.god.name.length > 0);
      assert.ok(m.scenery.length >= 3);
    });
  });

  it('routes every encounter/elite/boss to a real beast', () => {
    for (const mountain of MOUNTAINS) {
      for (const e of mountain.encounters) {
        assert.ok(getBeast(e.beastId), `${mountain.name} 遭遇池引用了未知兽 ${e.beastId}`);
        assert.ok(e.weight > 0);
      }
      if (mountain.eliteFight) assert.ok(getBeast(mountain.eliteFight.beastId));
      assert.ok(getBeast(mountain.boss.beastId));
      assert.ok(mountainBeasts(mountain.id).length >= 1);
    }
  });

  it('has valid quiz banks: answers in range, every beast covered, gates answerable', () => {
    assert.equal(QUESTIONS.length >= 50, true, '题库不足 50 题');
    for (const q of QUESTIONS) {
      assert.ok(q.answer >= 0 && q.answer < q.options.length, `${q.id} 答案越界`);
      assert.ok(q.explain.length > 4, `${q.id} 缺讲解`);
      assert.ok(new Set(q.options).size === q.options.length, `${q.id} 选项重复`);
    }
    for (const beast of BEASTS) {
      assert.ok(questionsFor('beast', beast.id).length >= 2, `${beast.name} 问兽题不足两道`);
    }
    for (const mountain of MOUNTAINS) {
      const pool = mountainGatePool(mountain.id, mountainBeasts(mountain.id) as never);
      assert.ok(pool.length >= 3, `${mountain.name} 小考题池不足`);
    }
    assert.ok(finalRitePool().length >= 10, '大祭题池不足十问');
  });

  it('covers the story: chapter open/end, every mountain, every tame beat', () => {
    assert.ok(STORY_BEATS.some((b) => b.at.kind === 'chapterOpen'));
    assert.ok(STORY_BEATS.filter((b) => b.at.kind === 'chapterEnd').length >= 3);
    for (const mountain of MOUNTAINS) {
      for (const kind of ['mountainOpen', 'beforeBoss', 'afterBoss'] as const) {
        assert.ok(
          STORY_BEATS.some((b) => b.at.kind === kind && 'mountain' in b.at && b.at.mountain === mountain.id),
          `${mountain.name} 缺 ${kind} 剧情`,
        );
      }
      if (mountain.id !== 'wuming') {
        assert.ok(
          STORY_BEATS.some((b) => b.at.kind === 'mountainCleared' && b.at.mountain === mountain.id),
          `${mountain.name} 缺通关剧情`,
        );
      }
    }
    const ids = new Set(STORY_BEATS.map((b) => b.id));
    assert.equal(ids.size, STORY_BEATS.length, '剧情 id 重复');
  });

  it('items and skills reference each other consistently', () => {
    assert.equal(SKILLS.length, 10);
    const ids = new Set(SKILLS.map((s) => s.id));
    assert.equal(ids.size, SKILLS.length);
    for (const item of ITEMS) {
      if (item.craft) {
        for (const input of Object.keys(item.craft.inputs)) {
          assert.ok(getItem(input), `${item.name} 的原料 ${input} 未定义`);
        }
      }
    }
    for (const beast of BEASTS) {
      for (const drop of beast.drops) {
        assert.ok(getItem(drop), `${beast.name} 的掉落 ${drop} 未定义`);
      }
    }
    assert.ok(getSkill('strike')!.level === 1);
  });
});

describe('shanhai-wenshou battle engine', () => {
  const fixedRng = () => 0.99; // 高值：方差最大、兽先手、驯化失败
  const lowRng = () => 0.01;

  function freshBattle() {
    const player = spawnPlayer({ maxHp: 72, hp: 72, maxQi: 15, qi: 15, atk: 10, def: 6, spd: 8 });
    const beast = spawnBeast('xingxing', 1);
    return initBattle(player, beast, []);
  }

  it('spawns and scales beasts', () => {
    const b1 = spawnBeast('jiuwei', 1);
    assert.equal(b1.maxHp, 130);
    const b30 = spawnBeast('jiuwei', 30);
    assert.ok(b30.maxHp > b1.maxHp * 2.5);
    const elite = spawnBeast('jiuwei', 30, true);
    assert.ok(elite.maxHp > b30.maxHp);
    assert.ok(scaleBeast({ hp: 10, atk: 1, def: 1, spd: 1 }, 1).maxHp === 10);
  });

  it('resolves an attack and a counter, then wins on beast ko', () => {
    const state = freshBattle();
    const hpBefore = state.beast.hp;
    resolvePlayerAction(state, { type: 'attack' }, fixedRng);
    assert.ok(state.beast.hp < hpBefore, '攻击应造成伤害');
    assert.ok(state.player.hp < state.player.maxHp, '兽应回击');
    assert.equal(state.phase, 'choose');

    // 打空兽血直接胜利
    state.beast.hp = 1;
    resolvePlayerAction(state, { type: 'attack' }, fixedRng);
    assert.equal(state.phase, 'won');
    assert.ok(state.expGained > 0);
  });

  it('applies insight and rage', () => {
    const state = freshBattle();
    applyInsight(state, true);
    assert.equal(state.beast.insight, 1);
    assert.equal(state.beast.revealed.shape, true);
    applyInsight(state, false);
    assert.equal(state.beast.effects.nu, 3);
    applyInsight(state, true, 'sound');
    assert.equal(state.beast.insight, 2);
    assert.equal(state.beast.revealed.sound, true);
  });

  it('guard restores qi and halves incoming damage', () => {
    const state = freshBattle();
    state.player.qi = 0;
    const hpBefore = state.player.hp;
    resolvePlayerAction(state, { type: 'guard' }, fixedRng);
    assert.ok(state.player.qi >= 2, '守势应回气');
    assert.ok(state.player.hp < hpBefore || state.player.hp === hpBefore);
  });

  it('costs qi for skills and rejects underfunded ones', () => {
    const state = freshBattle();
    state.player.qi = 2;
    resolvePlayerAction(state, { type: 'skill', skillId: 'shanguixiao' }, fixedRng);
    assert.equal(state.player.qi, 2, '气不足时技能不放、不耗气');
    state.player.qi = 15;
    resolvePlayerAction(state, { type: 'skill', skillId: 'shanguixiao' }, fixedRng);
    assert.equal(state.player.qi, 9, '山鬼啸耗 6 气');
  });

  it('tames when chance allows and pays exp', () => {
    const state = freshBattle();
    state.beast.hp = 1;
    state.beast.insight = 3;
    const chance = tameChance(state.beast);
    assert.ok(chance > 0.6);
    resolvePlayerAction(state, { type: 'tame' }, lowRng);
    assert.equal(state.phase, 'tamed');
  });

  it('items heal in battle', () => {
    const state = freshBattle();
    state.player.hp = 20;
    resolvePlayerAction(state, { type: 'item', itemId: 'zhuyu' }, fixedRng);
    assert.ok(state.player.hp > 20);
  });

  it('applies yuanyi terrain miasma on open', () => {
    const player = spawnPlayer({ maxHp: 72, hp: 72, maxQi: 15, qi: 15, atk: 10, def: 6, spd: 8 });
    const beast = spawnBeast('fuchong', 5);
    const state = initBattle(player, beast, [], 'yuanyi');
    assert.equal(state.player.effects.zhang, 3, '猿翼山开局染瘴');
  });

  it('playerFirst respects speed dominance', () => {
    const state = freshBattle();
    state.player.spd = 30;
    state.beast.spd = 10;
    assert.equal(playerFirst(state, lowRng), true);
  });
});

describe('shanhai-wenshou progression & save', () => {
  it('levels up, unlocks skills, caps at 30', () => {
    const save = createInitialSave();
    const before = save.level;
    grantExp(save, 1_000_000);
    assert.equal(save.level, 30);
    assert.ok(save.level > before);
    for (const skill of ['lieshi', 'zhenyue', 'wuwu']) {
      assert.ok(save.skills.includes(skill), `满级应解锁 ${skill}`);
    }
    assert.equal(partyCap(1), 1);
    assert.equal(partyCap(6), 2);
    assert.equal(partyCap(14), 3);
  });

  it('derives stats from level, charm and party', () => {
    const save = createInitialSave();
    save.level = 10;
    const base = deriveStats(save);
    save.charm = 'lushu_pi';
    save.party = ['lushu'];
    const buffed = deriveStats(save);
    assert.ok(buffed.maxHp > base.maxHp, '鹿蜀佩+出战被动应加体');
  });

  it('tracks codex counts', () => {
    const save = createInitialSave();
    assert.equal(codexCount(save), 0);
    save.beasts.xuangui = 1;
    save.beasts.jiuwei = 2;
    assert.equal(codexCount(save), 2);
  });

  it('round-trips a save through parse', () => {
    const save = createInitialSave();
    save.level = 12;
    save.beasts.jiuwei = 1;
    save.mountains.qingqiu = { cleared: false, gathered: ['qingkou'], npcs: [], gatePassed: false, bossDefeated: true, eliteDefeated: true };
    save.items.zhuyu = 5;
    const parsed = parseSave(JSON.stringify(save));
    assert.equal(parsed.level, 12);
    assert.equal(parsed.beasts.jiuwei, 1);
    assert.equal(parsed.mountains.qingqiu?.bossDefeated, true);
    assert.equal(parsed.items.zhuyu, 5);
    assert.equal(parseSave('not-json').level, 1, '坏档应回落初始');
    assert.equal(parseSave(null).level, 1);
  });
});

describe('shanhai-wenshou site wiring', () => {
  it('is registered with cover, href and passport cards', () => {
    const meta = getGame('shanhai-wenshou');
    assert.ok(meta, 'gamesRegistry 缺 shanhai-wenshou');
    assert.ok(meta.href === '/games/shanhai-wenshou');
    assert.ok(meta.cover.startsWith('/assets/'));
    assert.equal(cardsForGame('shanhai-wenshou').length, 5);
  });

  it('draws encounters from the mountain pools', () => {
    const rng = () => 0.25;
    const mountain = getMountain('niuyang');
    const encounter = rollEncounter('niuyang', rng);
    assert.ok(encounter && mountain.encounters.some((e) => e.beastId === encounter.beastId));
    const level = wildLevel(mountain, rng);
    assert.ok(level >= 1 && level <= 10);
    assert.equal(rollEncounter('wuming', rng), null, '无名之山无野外遭遇');
  });
});
