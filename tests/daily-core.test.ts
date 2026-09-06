import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { dayDiff, dayKey, shiftDayKey, todayKey } from '../src/core/daily/date.ts';
import { dailyRng, seededPick, seededShuffle } from '../src/core/daily/seed.ts';
import {
  createInitialDaily,
  dailyStreak,
  isDayDone,
  markDayDone,
  parseDaily,
  streakOn,
} from '../src/core/daily/progress.ts';
import { DAILY_TASKS, dailyTaskHref } from '../src/core/daily/tasks.ts';
import { solarTermOn } from '../src/core/daily/solarTerms.ts';
import { games } from '../src/core/gamesRegistry.ts';

describe('daily date utils', () => {
  it('formats local day keys', () => {
    assert.equal(dayKey(new Date(2026, 8, 4)), '2026-09-04');
    assert.equal(dayKey(new Date(2026, 0, 1)), '2026-01-01');
    assert.match(todayKey(), /^\d{4}-\d{2}-\d{2}$/);
  });

  it('computes day diffs across month boundaries', () => {
    assert.equal(dayDiff('2026-08-31', '2026-09-01'), 1);
    assert.equal(dayDiff('2026-09-04', '2026-09-04'), 0);
    assert.equal(dayDiff('2026-02-28', '2026-03-01'), 1); // 2026 非闰年
  });

  it('shifts keys backwards and forwards', () => {
    assert.equal(shiftDayKey('2026-09-04', -1), '2026-09-03');
    assert.equal(shiftDayKey('2026-01-01', -1), '2025-12-31');
    assert.equal(shiftDayKey('2026-12-31', 1), '2027-01-01');
  });
});

describe('daily seeded rng', () => {
  it('is deterministic per day+game and independent across games', () => {
    const a = dailyRng('2026-09-04', 'shanhai-wenshou');
    const b = dailyRng('2026-09-04', 'shanhai-wenshou');
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    assert.deepEqual(seqA, seqB);

    const c = dailyRng('2026-09-05', 'shanhai-wenshou');
    assert.notDeepEqual([c(), c()], [seqA[0], seqA[1]]);

    const d = dailyRng('2026-09-04', 'jiaguwen');
    assert.notDeepEqual([d(), d()], [seqA[0], seqA[1]]);
  });

  it('shuffles without loss and picks safely', () => {
    const rng = dailyRng('2026-09-04', 'test');
    const arr = [1, 2, 3, 4, 5, 6];
    const shuffled = seededShuffle(rng, arr);
    assert.deepEqual([...shuffled].sort((x, y) => x - y), arr);
    assert.equal(seededPick(rng, arr) != null, true);
    assert.equal(seededPick(rng, []), undefined);
  });
});

describe('daily progress & streaks', () => {
  it('marks and reads done days idempotently', () => {
    let p = createInitialDaily();
    p = markDayDone(p, '2026-09-04', 'shanhai-wenshou');
    p = markDayDone(p, '2026-09-04', 'shanhai-wenshou');
    assert.deepEqual(p.days['2026-09-04'], ['shanhai-wenshou']);
    assert.equal(isDayDone(p, '2026-09-04', 'shanhai-wenshou'), true);
    assert.equal(isDayDone(p, '2026-09-04', 'jiaguwen'), false);
  });

  it('counts streaks across consecutive days, alive but frozen when today is pending', () => {
    let p = createInitialDaily();
    p = markDayDone(p, '2026-09-01', 'a');
    p = markDayDone(p, '2026-09-02', 'a');
    p = markDayDone(p, '2026-09-03', 'b');
    assert.equal(streakOn(p, '2026-09-03'), 3);
    // 当天没做：连击仍是 3（从昨天算），不涨不断
    assert.equal(streakOn(p, '2026-09-04'), 3);
    // 补上今天：变 4
    p = markDayDone(p, '2026-09-04', 'a');
    assert.equal(streakOn(p, '2026-09-04'), 4);
    // 断一天重置
    p = markDayDone(p, '2026-09-07', 'a');
    assert.equal(streakOn(p, '2026-09-07'), 1);
  });

  it('tracks best streak and prunes ancient days', () => {
    let p = createInitialDaily();
    for (let i = 0; i < 5; i++) {
      p = markDayDone(p, shiftDayKey('2026-09-04', -i), 'a');
    }
    assert.ok(p.bestStreak >= 1);
    // 数据集真正的最长连击：从 09-04 向前数五天
    assert.ok(streakOn(p, '2026-09-04') >= 5);
    // 写入新的一天时，保留窗（400 天）外的旧记录被修剪
    const far = shiftDayKey('2026-09-04', -500);
    p = markDayDone(p, far, 'a');
    assert.ok(p.days[far], '写入当天自身必然保留');
    // 幂等：同一天重复记不产生副作用；修剪发生在写入「新的一天」时
    p = markDayDone(p, '2026-09-05', 'a');
    assert.equal(p.days[far], undefined, '400 天外的记录应被修剪');
    assert.ok(p.days['2026-09-04'], '窗内记录保留');
  });

  it('parses garbage safely', () => {
    assert.deepEqual(parseDaily(null), createInitialDaily());
    assert.deepEqual(parseDaily('garbage'), createInitialDaily());
    assert.equal(parseDaily('{"version":1,"days":{"2026-09-04":["a"]},"bestStreak":2}').bestStreak, 2);
  });
});

describe('daily task registry', () => {
  it('lists one task per registered game with deep links', () => {
    assert.equal(DAILY_TASKS.length, games.length, '日课任务数应与展品数一致');
    for (const task of DAILY_TASKS) {
      assert.ok(games.some((g) => g.id === task.gameId), `${task.gameId} 未注册`);
      assert.equal(task.href, dailyTaskHref(task.gameId));
      assert.match(task.href, /\?mode=daily$/);
      assert.ok(task.label.startsWith('今日'));
      assert.ok(task.task.length > 4);
    }
  });
});

describe('today solar term lookup', () => {
  it('resolves terms within the coverage window', () => {
    const lichun = solarTermOn(new Date(2026, 1, 4));
    assert.equal(lichun?.current.term.id, 'lichun');
    const chushu = solarTermOn(new Date(2026, 8, 4));
    assert.equal(chushu?.current.term.id, 'chushu');
    assert.equal(chushu?.next?.term.id, 'bailu');
    assert.ok((chushu?.daysToNext ?? 99) > 0);
    // 交节当天算新节气
    const bailu = solarTermOn(new Date(2026, 8, 7));
    assert.equal(bailu?.current.term.id, 'bailu');
  });

  it('resolves new-year days to the previous winter solstice', () => {
    const jan1 = solarTermOn(new Date(2026, 0, 1));
    assert.equal(jan1?.current.term.id, 'dongzhi');
  });

  it('returns null outside the table coverage', () => {
    assert.equal(solarTermOn(new Date(1990, 5, 1)), null);
    assert.equal(solarTermOn(new Date(2099, 5, 1)), null);
  });
});
