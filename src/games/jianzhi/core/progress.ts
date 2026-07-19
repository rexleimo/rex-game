import type { FoldMode, JianzhiChapterId, JianzhiProgress, SavedWork } from './types';

const CHAPTER_COUNT = 6; // 与 content/chapters.ts 中 JIANZHI_CHAPTERS 长度保持一致

export function createInitialJianzhiProgress(): JianzhiProgress {
  return {
    unlocked: 1,
    collectedMotifIds: [],
    cultureEntryIds: [],
    completedChapters: [],
    discoveredCombos: [],
  };
}

/** 从 localStorage 字符串安全解析进度；格式损坏时回退到初始值。 */
export function parseJianzhiProgress(value: string | null): JianzhiProgress {
  const base = createInitialJianzhiProgress();
  if (!value) return base;
  try {
    const parsed = JSON.parse(value) as Partial<JianzhiProgress>;
    return {
      unlocked: Number.isFinite(parsed.unlocked)
        ? Math.max(1, Math.min(CHAPTER_COUNT, Math.round(parsed.unlocked!)))
        : 1,
      collectedMotifIds: Array.isArray(parsed.collectedMotifIds) ? parsed.collectedMotifIds : [],
      cultureEntryIds: Array.isArray(parsed.cultureEntryIds) ? parsed.cultureEntryIds : [],
      completedChapters: Array.isArray(parsed.completedChapters)
        ? (parsed.completedChapters as JianzhiChapterId[])
        : [],
      discoveredCombos: Array.isArray(parsed.discoveredCombos) ? parsed.discoveredCombos : [],
    };
  } catch {
    return base;
  }
}

/** 记录一次章节完成：聚合已解锁章节、已收集纹样与文化档案，并推进解锁进度。 */
export function recordChapterCompletion(
  progress: JianzhiProgress,
  chapterId: JianzhiChapterId,
  order: number,
  cultureEntryIds: string[],
  motifIds: string[],
  totalChapters: number,
  comboIds: string[] = [],
): JianzhiProgress {
  const completedChapters = progress.completedChapters.includes(chapterId)
    ? progress.completedChapters
    : [...progress.completedChapters, chapterId];
  const collectedMotifIds = [...new Set([...progress.collectedMotifIds, ...motifIds])];
  const culture = [...new Set([...progress.cultureEntryIds, ...cultureEntryIds])];
  const discoveredCombos = [...new Set([...progress.discoveredCombos, ...comboIds])];
  const unlocked = Math.max(progress.unlocked, Math.min(totalChapters, order + 1));
  return { unlocked, collectedMotifIds, cultureEntryIds: culture, completedChapters, discoveredCombos };
}

/** 自由创作时收集纹样，推进图鉴解锁（不产生完成记录）。 */
export function collectMotifs(progress: JianzhiProgress, motifIds: string[]): JianzhiProgress {
  if (!motifIds.length) return progress;
  return { ...progress, collectedMotifIds: [...new Set([...progress.collectedMotifIds, ...motifIds])] };
}

/** 记录一次或多次「拼读成句」，推进吉语图谱解锁。 */
export function discoverCombos(progress: JianzhiProgress, comboIds: string[]): JianzhiProgress {
  if (!comboIds.length) return progress;
  const discoveredCombos = [...new Set([...progress.discoveredCombos, ...comboIds])];
  if (discoveredCombos.length === progress.discoveredCombos.length) return progress;
  return { ...progress, discoveredCombos };
}

export interface CreateWorkInput {
  dataUrl: string;
  fold: FoldMode;
  motifIds: string[];
  name: string;
}

/** 构造一件作品记录（分配 id 与时间戳），把"造数据"从视图层抽离。 */
export function createWork(input: CreateWorkInput): SavedWork {
  return {
    id: `w-${Date.now()}`,
    name: input.name,
    dataUrl: input.dataUrl,
    fold: input.fold,
    motifIds: input.motifIds,
    createdAt: Date.now(),
  };
}

export function addWork(works: SavedWork[], work: SavedWork, limit = 30): SavedWork[] {
  return [work, ...works].slice(0, limit);
}

export function removeWork(works: SavedWork[], id: string): SavedWork[] {
  return works.filter((w) => w.id !== id);
}
