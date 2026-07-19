import type {
  FoldMode,
  JianzhiCommissionId,
  JianzhiLessonId,
  JianzhiProgress,
  SavedWork,
} from './types';

export const PROGRESS_KEY_V2 = 'rex-game:jianzhi:progress:v2';
export const PROGRESS_KEY_V1 = 'rex-game:jianzhi:progress:v1';

const LESSON_COUNT = 7;

const V1_CHAPTER_TO_LESSON: Record<string, JianzhiLessonId | undefined> = {
  awaken: 'awaken',
  'north-window': 'rebus-intro',
  'south-fine': 'window-four',
  'silk-rosette': 'silk-rosette',
  zodiac: 'fu-shou',
  legacy: 'graduate',
};

export function createInitialJianzhiProgress(): JianzhiProgress {
  return {
    version: 2,
    curriculumUnlocked: 1,
    completedLessons: [],
    completedCommissions: [],
    collectedMotifIds: [],
    discoveredCombos: [],
    cultureEntryIds: [],
    graduated: false,
  };
}

function isLessonId(id: string): id is JianzhiLessonId {
  return (
    id === 'awaken' ||
    id === 'symmetry' ||
    id === 'rebus-intro' ||
    id === 'window-four' ||
    id === 'silk-rosette' ||
    id === 'fu-shou' ||
    id === 'graduate'
  );
}

function isCommissionId(id: string): id is JianzhiCommissionId {
  return id === 'spring-window' || id === 'wedding-xi';
}

export function migrateV1ToV2(parsed: Record<string, unknown>): JianzhiProgress {
  const base = createInitialJianzhiProgress();
  const chapters = Array.isArray(parsed.completedChapters)
    ? (parsed.completedChapters as string[])
    : [];
  const completedLessons = [
    ...new Set(
      chapters
        .map((c) => V1_CHAPTER_TO_LESSON[c])
        .filter((x): x is JianzhiLessonId => Boolean(x)),
    ),
  ];
  const fromUnlock = Number.isFinite(Number(parsed.unlocked))
    ? Math.max(1, Math.min(LESSON_COUNT, Math.round(Number(parsed.unlocked))))
    : 1;
  const fromCompleted = Math.min(LESSON_COUNT, completedLessons.length + 1);
  const curriculumUnlocked = Math.max(fromUnlock, fromCompleted);

  return {
    ...base,
    curriculumUnlocked,
    completedLessons,
    collectedMotifIds: Array.isArray(parsed.collectedMotifIds)
      ? (parsed.collectedMotifIds as string[])
      : [],
    cultureEntryIds: Array.isArray(parsed.cultureEntryIds)
      ? (parsed.cultureEntryIds as string[])
      : [],
    discoveredCombos: Array.isArray(parsed.discoveredCombos)
      ? (parsed.discoveredCombos as string[])
      : [],
    graduated: completedLessons.includes('graduate'),
  };
}

export function parseJianzhiProgress(value: string | null): JianzhiProgress {
  const base = createInitialJianzhiProgress();
  if (!value) return base;
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    if (parsed.version === 2 || Array.isArray(parsed.completedLessons)) {
      const completedLessons = Array.isArray(parsed.completedLessons)
        ? (parsed.completedLessons as string[]).filter(isLessonId)
        : [];
      const completedCommissions = Array.isArray(parsed.completedCommissions)
        ? (parsed.completedCommissions as string[]).filter(isCommissionId)
        : [];
      const unlockedRaw = Number(parsed.curriculumUnlocked ?? parsed.unlocked);
      return {
        version: 2,
        curriculumUnlocked: Number.isFinite(unlockedRaw)
          ? Math.max(1, Math.min(LESSON_COUNT, Math.round(unlockedRaw)))
          : 1,
        completedLessons,
        completedCommissions,
        collectedMotifIds: Array.isArray(parsed.collectedMotifIds)
          ? (parsed.collectedMotifIds as string[])
          : [],
        cultureEntryIds: Array.isArray(parsed.cultureEntryIds)
          ? (parsed.cultureEntryIds as string[])
          : [],
        discoveredCombos: Array.isArray(parsed.discoveredCombos)
          ? (parsed.discoveredCombos as string[])
          : [],
        graduated: Boolean(parsed.graduated) || completedLessons.includes('graduate'),
      };
    }
    // v1 shape
    if (Array.isArray(parsed.completedChapters) || parsed.unlocked != null) {
      return migrateV1ToV2(parsed);
    }
    return base;
  } catch {
    return base;
  }
}

export function recordLessonCompletion(
  progress: JianzhiProgress,
  lessonId: JianzhiLessonId,
  order: number,
  cultureEntryIds: string[],
  motifIds: string[],
  totalLessons: number,
  comboIds: string[] = [],
): JianzhiProgress {
  const completedLessons = progress.completedLessons.includes(lessonId)
    ? progress.completedLessons
    : [...progress.completedLessons, lessonId];
  const collectedMotifIds = [...new Set([...progress.collectedMotifIds, ...motifIds])];
  const culture = [...new Set([...progress.cultureEntryIds, ...cultureEntryIds])];
  const discoveredCombos = [...new Set([...progress.discoveredCombos, ...comboIds])];
  const curriculumUnlocked = Math.max(
    progress.curriculumUnlocked,
    Math.min(totalLessons, order + 1),
  );
  const graduated = progress.graduated || lessonId === 'graduate' || order >= totalLessons;
  return {
    version: 2,
    curriculumUnlocked: graduated ? totalLessons : curriculumUnlocked,
    completedLessons,
    completedCommissions: progress.completedCommissions,
    collectedMotifIds,
    cultureEntryIds: culture,
    discoveredCombos,
    graduated,
  };
}

export function recordCommissionCompletion(
  progress: JianzhiProgress,
  commissionId: JianzhiCommissionId,
  cultureEntryIds: string[],
  motifIds: string[],
  comboIds: string[] = [],
): JianzhiProgress {
  const completedCommissions = progress.completedCommissions.includes(commissionId)
    ? progress.completedCommissions
    : [...progress.completedCommissions, commissionId];
  return {
    ...progress,
    version: 2,
    completedCommissions,
    collectedMotifIds: [...new Set([...progress.collectedMotifIds, ...motifIds])],
    cultureEntryIds: [...new Set([...progress.cultureEntryIds, ...cultureEntryIds])],
    discoveredCombos: [...new Set([...progress.discoveredCombos, ...comboIds])],
  };
}

/** 自由创作时收集纹样，推进图鉴解锁（不产生完成记录）。 */
export function collectMotifs(progress: JianzhiProgress, motifIds: string[]): JianzhiProgress {
  if (!motifIds.length) return progress;
  return {
    ...progress,
    collectedMotifIds: [...new Set([...progress.collectedMotifIds, ...motifIds])],
  };
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
