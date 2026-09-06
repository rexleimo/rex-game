import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { allCommissions, commissionState, commissionsFor } from '../src/games/shanhai-wenshou/action/commissions.ts';
import { BEASTS } from '../src/games/shanhai-wenshou/content/beasts.ts';
import { buildLevel } from '../src/games/shanhai-wenshou/action/levels.ts';
import { corpusSize, litCount, quoteCorpus } from '../src/games/shanhai-wenshou/content/quotes.ts';
import { ENDINGS, pickEnding } from '../src/games/shanhai-wenshou/content/story.ts';
import { deriveStats, favorSum, tameRate } from '../src/games/shanhai-wenshou/core/progression.ts';
import { parseSave } from '../src/games/shanhai-wenshou/core/save.ts';
import { getMountain, MOUNTAINS } from '../src/games/shanhai-wenshou/content/mountains.ts';

describe('shanhai commissions board (GDD §2.2 委托板)', () => {
  it('gives every mountain exactly 3 deterministic commissions of 3 kinds', () => {
    for (const m of MOUNTAINS) {
      const list = commissionsFor(m.id);
      assert.equal(list.length, 3, `${m.name} 应有 3 条委托`);
      assert.deepEqual(list.map((c) => c.kind).sort(), ['cull', 'gather', 'stele']);
      for (const c of list) {
        assert.ok(c.id.startsWith(`c-${m.id}-`));
        assert.ok(c.jade > 0 && c.exp > 0);
        assert.ok(c.desc.length > 8);
      }
      // 确定性
      assert.equal(JSON.stringify(list), JSON.stringify(commissionsFor(m.id)));
    }
    const all = allCommissions();
    assert.equal(all.length, 30);
    assert.equal(new Set(all.map((c) => c.id)).size, 30, '委托 id 全局唯一');
  });

  it('gather commissions turn in real mountain goods', () => {
    for (const m of MOUNTAINS) {
      const g = commissionsFor(m.id).find((c) => c.kind === 'gather')!;
      const mountain = getMountain(m.id)!;
      const fromMountain = Boolean(mountain.gathers[g.item!]);
      const fallback = m.id === 'wuming' && g.item === 'yupai';
      assert.ok(fromMountain || fallback, `${m.name} 寻物委托应来自本山山产（或无名回退）`);
      assert.ok((g.amount ?? 0) >= 2);
    }
  });

  it('cull commissions count kills per mountain+beast', () => {
    const list = commissionsFor('zhaoyao');
    const cull = list.find((c) => c.kind === 'cull')!;
    const empty = commissionState(cull, { items: {} });
    assert.equal(empty.done, false);
    const partial = commissionState(cull, { items: {}, commissionProgress: { [`cull:zhaoyao:${cull.beast}`]: 2 } });
    assert.equal(partial.progress, 2);
    assert.equal(partial.done, false);
    const full = commissionState(cull, { items: {}, commissionProgress: { [`cull:zhaoyao:${cull.beast}`]: 5 } });
    assert.equal(full.done, true);
    assert.equal(full.remaining, 0);
  });

  it('stele commissions follow rub state and claims gate on done', () => {
    const st = commissionsFor('jiwei').find((c) => c.kind === 'stele')!;
    assert.equal(commissionState(st, { items: {} }).done, false);
    const done = commissionState(st, { items: {}, stelesRead: { jiwei: 1 } });
    assert.equal(done.done, true);
    const claimed = { ...done, claimed: true } as ReturnType<typeof commissionState>;
    assert.equal(claimed.claimed, true);
  });
});

describe('shanhai quote rubbings (引文拓印)', () => {
  it('corpus: 13 beast lines + 10 mountain passages + 10 rites + 1 colophon', () => {
    assert.equal(corpusSize(), 34);
    const corpus = quoteCorpus();
    assert.equal(new Set(corpus.map((q) => q.id)).size, 34);
  });

  it('lights by tame / cleared / chapterDone', () => {
    const save = parseSave(null);
    assert.equal(litCount(save), 0, '新档无拓印');
    save.beasts.xingxing = 1;
    assert.equal(litCount(save), 1, '收服点亮兽句');
    save.mountains.zhaoyao = { cleared: true, gathered: [], npcs: [], gatePassed: true, bossDefeated: true, eliteDefeated: true };
    assert.ok(litCount(save) >= 3, '祭成点亮山段+祠礼');
    for (const m of MOUNTAINS) {
      save.mountains[m.id] = { cleared: true, gathered: [], npcs: [], gatePassed: true, bossDefeated: true, eliteDefeated: true };
    }
    save.chapterDone = true;
    assert.equal(litCount(save), 22, '十山祭成=兽1+山段祠礼20+卷首1');
    for (const b of BEASTS) save.beasts[b.id] = 1;
    assert.equal(litCount(save), 34, '十三兽全收 → 通卷全亮');
  });
});

describe('shanhai endings (差分结局)', () => {
  it('picks by tame rate and favor sum; NG+ always takes the ng coda', () => {
    assert.equal(pickEnding(1, 0.9, 20), 'ng');
    assert.equal(pickEnding(0, 0.9, 12), 'tame');
    assert.equal(pickEnding(0, 0.1, 5), 'kill');
    assert.equal(pickEnding(0, 0.9, -5), 'kill');
    assert.equal(pickEnding(0, 0.4, 3), 'mid');
  });

  it('all four endings have beats with unique ids', () => {
    const ids = new Set<string>();
    for (const key of Object.keys(ENDINGS) as (keyof typeof ENDINGS)[]) {
      assert.ok(ENDINGS[key].length >= 2, `${key} 结局至少两拍`);
      for (const b of ENDINGS[key]) {
        assert.equal(b.at.kind, 'chapterEnd');
        assert.equal(b.ng, true, '结局拍标记为二周目可复用拍');
        ids.add(b.id);
      }
    }
    assert.equal(ids.size, 8);
  });
});

describe('shanhai multi-charm build (佩饰三槽)', () => {
  it('stacks up to three charms and migrates legacy single charm', () => {
    const save = parseSave(null);
    save.charms = ['migu_pei', 'lushu_pi', 'guijia'];
    const three = deriveStats(save);
    save.charms = [];
    const none = deriveStats(save);
    assert.ok(three.maxHp > none.maxHp, '鹿蜀佩叠加体上限');
    assert.ok(three.def > none.def, '旋龟佩叠加防御');
    assert.ok(three.spd >= none.spd);
  });

  it('parseSave migrates legacy charm field into charms', () => {
    const legacy = parseSave(JSON.stringify({ version: 1, charm: 'lushu_pi' }));
    assert.deepEqual(legacy.charms, ['lushu_pi']);
    const capped = parseSave(JSON.stringify({ version: 1, charms: ['a', 'b', 'c', 'd'] }));
    assert.equal(capped.charms?.length, 3, '佩饰槽上限 3');
  });

  it('hidden bosses inject on demand (谣音之主 / 初齿)', () => {
    const yaoyin = buildLevel('niuyang', { hidden: true });
    assert.ok(yaoyin.spawns.some((sp) => sp.title?.includes('谣音之主')), '杻阳应注入谣音之主');
    const plain = buildLevel('niuyang');
    assert.ok(!plain.spawns.some((sp) => sp.title?.includes('谣音之主')), '未开条件不注入');
    const chuzhi = buildLevel('wuming', { hidden: true });
    assert.ok(chuzhi.spawns.some((sp) => sp.title?.includes('初齿')), '无名应注入初齿');
    assert.ok(chuzhi.platforms.some((p) => p.climbable), '初齿应有崖底高台');
  });

  it('favorSum and tameRate serve the ending gate', () => {
    const save = parseSave(null);
    save.favor = { zhaoyao: 5, tangting: 4, yuanyi: -2 };
    assert.equal(favorSum(save), 7);
    save.stats.battlesWon = 10;
    save.stats.tamedCount = 6;
    assert.equal(tameRate(save), 0.6);
    save.stats.battlesWon = 0;
    assert.equal(tameRate(save), 1, '未战斗按驯向处理');
  });
});
