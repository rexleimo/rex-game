/**
 * 「今日节气」查询。
 *
 * 日期来自香港天文台对照表（solarTermDates.generated.ts，2024–2030），内容注解
 * 来自节气展品的图鉴词条。超出覆盖年份返回 null——宁可不展示，也不给错日期。
 */

import { getTerm } from '../../games/ershisi-jieqi/content/terms.ts';
import type { SolarTerm } from '../../games/ershisi-jieqi/core/types.ts';
import { dayKey } from './date.ts';
import { SOLAR_TERM_COVERAGE, SOLAR_TERM_DATES } from './solarTermDates.generated.ts';

export interface TermMoment {
  term: SolarTerm;
  /** 该节气交节日（本地时区零点）。 */
  since: Date;
}

export interface SolarTermWindow {
  /** 今天正处在哪个节气。 */
  current: TermMoment;
  /** 下一个节气（可能属于下一年）。 */
  next: TermMoment | null;
  /** 距下一节气还差几天（0 = 今天就是交节日）。 */
  daysToNext: number | null;
}

/** 某年的节气日期表（MM-DD）；年份未覆盖时返回 null。 */
function yearTable(year: number): Record<string, string> | null {
  if (year < SOLAR_TERM_COVERAGE.firstYear || year > SOLAR_TERM_COVERAGE.lastYear) return null;
  return SOLAR_TERM_DATES[year] ?? null;
}

/** 把某年表里的每个节气展开成（交节日，词条）序列，按交节日升序。 */
function termMoments(year: number): TermMoment[] | null {
  const table = yearTable(year);
  if (!table) return null;
  const moments: TermMoment[] = [];
  for (const [termId, mmdd] of Object.entries(table)) {
    const term = getTerm(termId);
    if (!term) continue;
    const [m, d] = mmdd.split('-').map(Number);
    moments.push({ term, since: new Date(year, (m ?? 1) - 1, d ?? 1) });
  }
  moments.sort((a, b) => a.since.getTime() - b.since.getTime());
  return moments.length > 0 ? moments : null;
}

/**
 * 查询某个本地日期所处的节气区间。
 *
 * 年初小寒之前属于上一年的冬至；上一年也不在表内时（如 2024-01-01）返回 null。
 */
export function solarTermOn(date: Date): SolarTermWindow | null {
  const year = date.getFullYear();
  const currentYear = termMoments(year);
  if (!currentYear) return null;

  let current: TermMoment | null = null;
  for (const moment of currentYear) {
    if (moment.since.getTime() <= date.getTime()) current = moment;
  }

  if (!current) {
    const previousYear = termMoments(year - 1);
    if (!previousYear) return null;
    current = previousYear[previousYear.length - 1]!;
  }

  const upcoming = currentYear.filter((m) => m.since.getTime() > date.getTime());
  let next: TermMoment | null = upcoming[0] ?? null;
  if (!next) {
    const nextYear = termMoments(year + 1);
    next = nextYear?.[0] ?? null;
  }

  const daysToNext =
    next == null ? null : Math.round((next.since.getTime() - new Date(dayKey(date) + 'T00:00:00').getTime()) / 86_400_000);

  return { current, next, daysToNext };
}
