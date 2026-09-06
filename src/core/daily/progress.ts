/**
 * 日课存档 —— 全站唯一的「今天练过什么」账本。
 *
 * 独立于六个游戏的各自存档：游戏存档记能力（认识了哪些字、通了哪关），
 * 日课账本记节律（哪天做了哪件功课）。两者不混写，删一边不影响另一边。
 *
 * days 只保留最近约 400 天：连击要靠「昨天之前是否连续」判断，
 * 更久远的记录对玩法没有意义，只白占 localStorage。
 */

import { dayDiff, shiftDayKey, todayKey } from './date.ts';

export const DAILY_PROGRESS_KEY = 'rex-game:daily:v1';

/** 完成记录的最长保留天数。 */
const KEEP_DAYS = 400;

export interface DailyProgress {
  version: 1;
  /** dayKey → 当天完成的展品 gameId 列表。 */
  days: Record<string, string[]>;
  /** 历史最长连击（天）。 */
  bestStreak: number;
}

export function createInitialDaily(): DailyProgress {
  return { version: 1, days: {}, bestStreak: 0 };
}

export function parseDaily(raw: string | null): DailyProgress {
  if (!raw) return createInitialDaily();
  try {
    const data = JSON.parse(raw) as Partial<DailyProgress>;
    if (data.version !== 1 || typeof data.days !== 'object' || data.days === null) {
      return createInitialDaily();
    }
    const days: Record<string, string[]> = {};
    for (const [key, games] of Object.entries(data.days)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) continue;
      if (!Array.isArray(games)) continue;
      const ids = [...new Set(games.filter((g): g is string => typeof g === 'string'))];
      if (ids.length > 0) days[key] = ids;
    }
    return {
      version: 1,
      days,
      bestStreak: typeof data.bestStreak === 'number' && data.bestStreak >= 0 ? data.bestStreak : 0,
    };
  } catch {
    return createInitialDaily();
  }
}

export function loadDaily(): DailyProgress {
  if (typeof window === 'undefined') return createInitialDaily();
  try {
    return parseDaily(window.localStorage.getItem(DAILY_PROGRESS_KEY));
  } catch {
    return createInitialDaily();
  }
}

export function saveDaily(p: DailyProgress): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(DAILY_PROGRESS_KEY, JSON.stringify(p));
  } catch {
    /* quota / private mode —— 日课进度丢了也不该影响游玩 */
  }
}

export function isDayDone(p: DailyProgress, day: string, gameId: string): boolean {
  return p.days[day]?.includes(gameId) ?? false;
}

/** 截至某天为止的连击。当天未完成时连击仍在（从昨天起算），补完即续上。 */
export function streakOn(p: DailyProgress, day: string): number {
  const hasAny = (key: string) => (p.days[key]?.length ?? 0) > 0;
  const anchor = hasAny(day) ? day : shiftDayKey(day, -1);
  let streak = 0;
  let cursor = anchor;
  while (hasAny(cursor)) {
    streak += 1;
    cursor = shiftDayKey(cursor, -1);
  }
  return streak;
}

export interface DailyStreak {
  /** 当前连击（含今天则今天已完成）。 */
  current: number;
  /** 历史最长。 */
  best: number;
  /** 今天是否已完成任一日课。 */
  doneToday: boolean;
}

export function dailyStreak(p: DailyProgress, day: string): DailyStreak {
  const doneToday = (p.days[day]?.length ?? 0) > 0;
  return { current: streakOn(p, day), best: Math.max(p.bestStreak, streakOn(p, day)), doneToday };
}

/** 记一笔完成。幂等：同一天同一展品重复记不产生副作用。 */
export function markDayDone(p: DailyProgress, day: string, gameId: string): DailyProgress {
  const existing = p.days[day] ?? [];
  if (existing.includes(gameId)) return p;

  const cutoff = shiftDayKey(day, -KEEP_DAYS);
  const days: Record<string, string[]> = {};
  for (const [key, ids] of Object.entries(p.days)) {
    if (key !== day && dayDiff(cutoff, key) < 0) continue;
    days[key] = ids;
  }
  days[day] = [...existing, gameId];

  const bestStreak = Math.max(p.bestStreak, streakOn({ ...p, days }, day));
  return { version: 1, days, bestStreak };
}

/** 便捷封装：今天的日课完成。返回新存档（已含持久化副作用）。 */
export function completeToday(gameId: string): DailyProgress {
  const next = markDayDone(loadDaily(), todayKey(), gameId);
  saveDaily(next);
  return next;
}
