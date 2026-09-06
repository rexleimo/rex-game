/**
 * 按日期播种的确定性随机。
 *
 * 日课的承诺是「同一天，所有人拿到同一份功课」。因此任何随机都来自
 * `dailyRng(dayKey, gameId)`，绝不用 Math.random——后者只属于可自由重玩的普通模式。
 */

export type Rng = () => number;

/** xmur3 字符串哈希 —— 把 `dayKey:gameId` 折叠成 32 位种子。 */
function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i += 1) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

/** mulberry32 —— 小而均匀的 PRNG，够日课用且跨平台一致。 */
function mulberry32(seed: number): Rng {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 某天某展品的独立随机流：换一天换一份，同一天内各展品互不干扰。 */
export function dailyRng(day: string, gameId: string): Rng {
  return mulberry32(xmur3(`${day}::${gameId}`)());
}

/** Fisher-Yates，洗牌方向由 rng 决定。 */
export function seededShuffle<T>(rng: Rng, arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

export function seededPick<T>(rng: Rng, arr: readonly T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(rng() * arr.length)]!;
}
