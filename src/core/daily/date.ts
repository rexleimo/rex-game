/**
 * 本地日期工具 —— 全站「日课」的时间基座。
 *
 * 一律用本地时区的「自然日」，不用 UTC：日课的「今天」应该跟着玩家的钟走。
 * 跨日差值用 UTC 正午做锚点计算，避免夏令时导致的 ±1 天误差。
 */

/** 本地时区的 YYYY-MM-DD。 */
export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayKey(): string {
  return dayKey(new Date());
}

/** 解析 YYYY-MM-DD 为「该日正午（UTC）」的 Date，只用于差值计算。 */
function parseKeyAtNoon(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1, 12));
}

/** b - a 的自然日差。输入须为 YYYY-MM-DD。 */
export function dayDiff(a: string, b: string): number {
  return Math.round((parseKeyAtNoon(b).getTime() - parseKeyAtNoon(a).getTime()) / 86_400_000);
}

/** 从某天起向前（过去方向）数 n 天的 dayKey。 */
export function shiftDayKey(key: string, days: number): string {
  const base = parseKeyAtNoon(key);
  base.setUTCDate(base.getUTCDate() + days);
  return dayKey(new Date(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate()));
}
