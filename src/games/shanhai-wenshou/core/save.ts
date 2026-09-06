import type { BeastId, MountainId, WenshouSave } from './types.ts';

/**
 * 存档。沿用站内约定：localStorage key + 版本号 + 宽松解析。
 * 玩家清档不丢命——解析失败一律回落初始档。
 */

export const SAVE_KEY = 'rex-game:shanhai-wenshou:save:v1';
export const SETTINGS_KEY = 'rex-game:shanhai-wenshou:settings:v1';

export function createInitialSave(): WenshouSave {
  return {
    version: 1,
    level: 1,
    exp: 0,
    hp: 72,
    qi: 15,
    skills: ['strike', 'lingxi'],
    party: [],
    beasts: {},
    encountered: [],
    items: { zhuyu: 2, tumi: 3 },
    jade: 20,
    charm: undefined,
    mountainIndex: 0,
    mountains: {},
    seenStory: [],
    favor: {},
    ngPlus: 0,
    charms: [],
    claimedCommissions: {},
    commissionProgress: {},
    stelesRead: {},
    hidden: {},
    shrine: { qi: 0, satchel: 0, tame: 0, blessing: 0 },
    stats: { playtimeMs: 0, battlesWon: 0, tamedCount: 0, questionsCorrect: 0, startedAt: Date.now() },
    chapterDone: false,
  };
}

const MOUNTAIN_IDS: MountainId[] = [
  'zhaoyao',
  'tangting',
  'yuanyi',
  'niuyang',
  'dishan',
  'danyuan',
  'jishan',
  'qingqiu',
  'jiwei',
  'wuming',
];

const BEAST_IDS: BeastId[] = [
  'xingxing',
  'baiyuan',
  'fuchong',
  'guaishe',
  'lushu',
  'xuangui',
  'lu',
  'lei',
  'boyi',
  'changfu',
  'guanguan',
  'chiru',
  'jiuwei',
];

export function parseSave(raw: string | null): WenshouSave {
  if (!raw) return createInitialSave();
  try {
    const data = JSON.parse(raw) as Partial<WenshouSave>;
    if (data.version !== 1) return createInitialSave();
    const base = createInitialSave();
    const save: WenshouSave = {
      ...base,
      ...data,
      version: 1,
      level: clamp(Number(data.level) || 1, 1, 30),
      exp: Math.max(0, Number(data.exp) || 0),
      hp: Math.max(1, Number(data.hp) || base.hp),
      qi: Math.max(0, Number(data.qi) || base.qi),
      skills: strings(data.skills),
      party: strings(data.party).filter((id): id is BeastId => BEAST_IDS.includes(id as BeastId)).slice(0, 3),
      beasts: record(data.beasts, BEAST_IDS),
      encountered: strings(data.encountered).filter((id): id is BeastId => BEAST_IDS.includes(id as BeastId)),
      items: record(data.items, null),
      jade: Math.max(0, Number(data.jade) || 0),
      mountainIndex: clamp(Number(data.mountainIndex) || 0, 0, MOUNTAIN_IDS.length),
      seenStory: strings(data.seenStory),
      shrine: {
        qi: clampInt(data.shrine?.qi, 0, 4),
        satchel: clampInt(data.shrine?.satchel, 0, 3),
        tame: clampInt(data.shrine?.tame, 0, 3),
        blessing: clampInt(data.shrine?.blessing, 0, 3),
      },
      stats: {
        playtimeMs: Math.max(0, Number(data.stats?.playtimeMs) || 0),
        battlesWon: Math.max(0, Number(data.stats?.battlesWon) || 0),
        tamedCount: Math.max(0, Number(data.stats?.tamedCount) || 0),
        questionsCorrect: Math.max(0, Number(data.stats?.questionsCorrect) || 0),
        startedAt: Number(data.stats?.startedAt) || Date.now(),
      },
      favor: (() => {
        const raw = (data as { favor?: Record<string, unknown> }).favor;
        const out: Partial<Record<MountainId, number>> = {};
        if (raw && typeof raw === 'object') {
          for (const id of MOUNTAIN_IDS) {
            const v = Number(raw[id]);
            if (Number.isFinite(v)) out[id] = Math.max(-10, Math.min(20, Math.round(v)));
          }
        }
        return out;
      })(),
      ngPlus: Math.max(0, Math.min(9, Math.floor(Number(data.ngPlus) || 0))),
      charms: (() => {
        const raw = data.charms;
        const list = Array.isArray(raw) ? strings(raw) : (data.charm ? [data.charm] : []);
        return list.slice(0, 3);
      })(),
      claimedCommissions: (() => { const r = record(data.claimedCommissions, null); const o: Record<string, 1> = {}; for (const k of Object.keys(r)) if (r[k] > 0) o[k] = 1; return o; })(),
      commissionProgress: record(data.commissionProgress, null),
      stelesRead: (() => {
        const raw = data.stelesRead;
        const out: Partial<Record<MountainId, 1>> = {};
        if (raw && typeof raw === 'object') {
          for (const id of MOUNTAIN_IDS) if (raw[id]) out[id] = 1;
        }
        return out;
      })(),
      hidden: {
        yaoyin: (data.hidden?.yaoyin ? 1 : undefined) as 1 | undefined,
        chuzhi: (data.hidden?.chuzhi ? 1 : undefined) as 1 | undefined,
      },
      chapterDone: Boolean(data.chapterDone),
      mountains: {},
    };
    for (const id of MOUNTAIN_IDS) {
      const m = data.mountains?.[id];
      if (m) {
        save.mountains[id] = {
          cleared: Boolean(m.cleared),
          gathered: strings(m.gathered),
          npcs: strings(m.npcs),
          gatePassed: Boolean(m.gatePassed),
          bossDefeated: Boolean(m.bossDefeated),
          eliteDefeated: Boolean(m.eliteDefeated),
        };
      }
    }
    return save;
  } catch {
    return createInitialSave();
  }
}

export function loadSave(): WenshouSave {
  if (typeof window === 'undefined') return createInitialSave();
  try {
    return parseSave(window.localStorage.getItem(SAVE_KEY));
  } catch {
    return createInitialSave();
  }
}

export function persistSave(save: WenshouSave): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    /* quota / private mode */
  }
}

export function wipeSave(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(SAVE_KEY);
  } catch {
    /* ignore */
  }
}

export interface WenshouSettings {
  reducedMotion: boolean;
  muted: boolean;
}

export function loadSettings(): WenshouSettings {
  if (typeof window === 'undefined') return { reducedMotion: false, muted: false };
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { reducedMotion: false, muted: false };
    const parsed = JSON.parse(raw) as Partial<WenshouSettings>;
    return { reducedMotion: Boolean(parsed.reducedMotion), muted: Boolean(parsed.muted) };
  } catch {
    return { reducedMotion: false, muted: false };
  }
}

export function persistSettings(s: WenshouSettings): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((x): x is string => typeof x === 'string') : [];
}

function record(value: unknown, allowed: readonly string[] | null): Record<string, number> {
  const out: Record<string, number> = {};
  if (typeof value === 'object' && value !== null) {
    for (const [key, count] of Object.entries(value as Record<string, unknown>)) {
      if (allowed && !allowed.includes(key)) continue;
      const n = Number(count);
      if (Number.isFinite(n) && n > 0) out[key] = Math.floor(n);
    }
  }
  return out;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function clampInt(value: unknown, min: number, max: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? clamp(Math.floor(n), min, max) : min;
}
