import type { ArtifactProgress, RestoreGrade, ShanhaiProgress } from './types';

export const PROGRESS_KEY = 'rex-game:shanhai-shiyi:progress:v1';

export function createInitialProgress(): ShanhaiProgress {
  return {
    version: 1,
    artifacts: {},
    museumSlots: [],
    learnedIds: [],
    hintLevel: 'guide',
    visitedMap: false,
    regionId: 'R01',
  };
}

export function parseProgress(raw: unknown): ShanhaiProgress {
  if (!raw || typeof raw !== 'object') return createInitialProgress();
  const o = raw as Partial<ShanhaiProgress>;
  if (o.version !== 1) return createInitialProgress();
  return {
    version: 1,
    artifacts: isRecord(o.artifacts) ? (o.artifacts as Record<string, ArtifactProgress>) : {},
    museumSlots: Array.isArray(o.museumSlots)
      ? o.museumSlots.filter((x): x is string => typeof x === 'string')
      : [],
    learnedIds: Array.isArray(o.learnedIds)
      ? o.learnedIds.filter((x): x is string => typeof x === 'string')
      : [],
    hintLevel: o.hintLevel === 'read' || o.hintLevel === 'self' ? o.hintLevel : 'guide',
    visitedMap: Boolean(o.visitedMap),
    regionId: typeof o.regionId === 'string' && o.regionId ? o.regionId : 'R01',
  };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === 'object' && !Array.isArray(v);
}

export function loadProgress(): ShanhaiProgress {
  if (typeof window === 'undefined') return createInitialProgress();
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (!raw) return createInitialProgress();
    return parseProgress(JSON.parse(raw));
  } catch {
    return createInitialProgress();
  }
}

export function saveProgress(p: ShanhaiProgress): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {
    /* quota / private mode */
  }
}

export function gradeFromScore(score: number): RestoreGrade {
  if (score >= 97) return 'SS';
  if (score >= 90) return 'S';
  if (score >= 75) return 'A';
  if (score >= 60) return 'B';
  if (score > 0) return 'C';
  return 'none';
}

export function markRestored(
  progress: ShanhaiProgress,
  artifactId: string,
  score: number,
  learnIds: string[],
): ShanhaiProgress {
  const grade = gradeFromScore(score);
  const prev = progress.artifacts[artifactId];
  const nextScore = Math.max(prev?.score ?? 0, score);
  const nextGrade = gradeFromScore(nextScore);
  const artifacts = {
    ...progress.artifacts,
    [artifactId]: {
      restored: true,
      score: nextScore,
      grade: nextGrade,
      readCore: prev?.readCore ?? false,
      restoredAt: new Date().toISOString(),
    } satisfies ArtifactProgress,
  };

  const learned = new Set(progress.learnedIds);
  for (const id of learnIds) learned.add(id);

  let museumSlots = progress.museumSlots;
  if (!museumSlots.includes(artifactId)) {
    museumSlots = [...museumSlots, artifactId].slice(0, 48);
  }

  return {
    ...progress,
    artifacts,
    museumSlots,
    learnedIds: [...learned],
  };
}

export function markReadCore(progress: ShanhaiProgress, artifactId: string): ShanhaiProgress {
  const prev = progress.artifacts[artifactId];
  if (!prev) {
    return {
      ...progress,
      artifacts: {
        ...progress.artifacts,
        [artifactId]: {
          restored: false,
          score: 0,
          grade: 'none',
          readCore: true,
        },
      },
    };
  }
  return {
    ...progress,
    artifacts: {
      ...progress.artifacts,
      [artifactId]: { ...prev, readCore: true },
    },
  };
}

export function exportProgressJson(progress: ShanhaiProgress): string {
  return JSON.stringify(progress, null, 2);
}

export function importProgressJson(text: string): ShanhaiProgress {
  return parseProgress(JSON.parse(text));
}

export function restoredCount(progress: ShanhaiProgress): number {
  return Object.values(progress.artifacts).filter((a) => a.restored).length;
}

export function readCount(progress: ShanhaiProgress): number {
  return Object.values(progress.artifacts).filter((a) => a.readCore).length;
}
