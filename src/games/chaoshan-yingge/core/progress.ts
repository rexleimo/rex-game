import type { CampaignProgress, YinggeChapterId } from './types';

const CHAPTER_ORDER: Record<YinggeChapterId, number> = {
  'drum-basics': 1,
  'heroes-enter': 2,
  formation: 3,
  'village-parade': 4,
  'grand-performance': 5,
};
const CHAPTER_COUNT = Object.keys(CHAPTER_ORDER).length;

export function createInitialCampaignProgress(): CampaignProgress {
  return { unlocked: 1, bestSpirit: {} };
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
