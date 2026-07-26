import type { CampaignProgress, YinggeChapterId } from './types';

/**
 * 存储键放在这里而不是组件里，因为文化护照要跨游戏读取存档；
 * 键散落在 UI 组件中会让读取方被迫复制字面量，改名时必然对不上。
 */
export const PROGRESS_KEY = 'rex-game:yingge:campaign:v2';
export const LEGACY_PROGRESS_KEY = 'rex-game:yingge:unlocked:v1';

const CHAPTER_ORDER: Record<YinggeChapterId, number> = {
  'drum-basics': 1,
  'heroes-enter': 2,
  formation: 3,
  'village-parade': 4,
  'grand-performance': 5,
};
export const CHAPTER_COUNT = Object.keys(CHAPTER_ORDER).length;

export function createInitialCampaignProgress(): CampaignProgress {
  return { unlocked: 1, bestSpirit: {} };
}

/**
 * 从 localStorage 读取战役进度；SSR 与异常一律回落到初始值。
 *
 * 护照与游戏共用此函数。旧版只存一个 unlocked 数字（LEGACY_PROGRESS_KEY），
 * 若只读 v2 键，老玩家的护照会显示「从未玩过英歌」——所以这里必须回落。
 */
export function loadCampaignProgress(): CampaignProgress {
  if (typeof window === 'undefined') return createInitialCampaignProgress();
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (raw) return parseCampaignProgress(raw);

    const legacyUnlocked = Number(window.localStorage.getItem(LEGACY_PROGRESS_KEY));
    if (Number.isFinite(legacyUnlocked) && legacyUnlocked > 0) {
      return {
        unlocked: Math.max(1, Math.min(CHAPTER_COUNT, Math.round(legacyUnlocked))),
        bestSpirit: {},
      };
    }
    return createInitialCampaignProgress();
  } catch {
    return createInitialCampaignProgress();
  }
}

export function parseCampaignProgress(value: string | null): CampaignProgress {
  if (!value) return createInitialCampaignProgress();
  try {
    const parsed = JSON.parse(value) as Partial<CampaignProgress>;
    const unlocked = Number.isFinite(parsed.unlocked)
      ? Math.max(1, Math.min(CHAPTER_COUNT, Math.round(parsed.unlocked!)))
      : 1;
    return {
      unlocked,
      bestSpirit: parsed.bestSpirit && typeof parsed.bestSpirit === 'object' ? parsed.bestSpirit : {},
    };
  } catch {
    return createInitialCampaignProgress();
  }
}

export function recordChapterOutcome(
  progress: CampaignProgress,
  chapterId: YinggeChapterId,
  victory: boolean,
  spirit: number,
): CampaignProgress {
  if (!victory) return progress;
  const chapterOrder = CHAPTER_ORDER[chapterId];
  const previousBest = progress.bestSpirit[chapterId] ?? 0;
  return {
    unlocked: Math.min(CHAPTER_COUNT, Math.max(progress.unlocked, chapterOrder + 1)),
    bestSpirit: {
      ...progress.bestSpirit,
      [chapterId]: Math.max(previousBest, Math.max(0, Math.min(100, Math.round(spirit)))),
    },
  };
}
