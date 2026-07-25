import type { JieqiProgress, ModeId, SeasonId } from './types.ts';

export const PROGRESS_KEY = 'rex-game:jieqi:progress:v1';

export function createInitialProgress(): JieqiProgress {
  return {
    version: 1,
    sortCleared: [],
    matchBestMoves: null,
    quizCorrect: 0,
    quizRuns: 0,
    readTermIds: [],
  };
}

export function parseProgress(raw: string | null): JieqiProgress {
  if (!raw) return createInitialProgress();
  try {
    const data = JSON.parse(raw) as Partial<JieqiProgress>;
    if (data.version !== 1) return createInitialProgress();
    return {
      ...createInitialProgress(),
      ...data,
      sortCleared: Array.isArray(data.sortCleared) ? data.sortCleared : [],
      readTermIds: Array.isArray(data.readTermIds) ? data.readTermIds : [],
    };
  } catch {
    return createInitialProgress();
  }
}

export function loadProgress(): JieqiProgress {
  if (typeof window === 'undefined') return createInitialProgress();
  try {
    return parseProgress(window.localStorage.getItem(PROGRESS_KEY));
  } catch {
    return createInitialProgress();
  }
}

export function saveProgress(p: JieqiProgress) {
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {
    /* ignore quota */
  }
}

export function markSortCleared(p: JieqiProgress, season: SeasonId | 'year'): JieqiProgress {
  if (p.sortCleared.includes(season)) return p;
  return { ...p, sortCleared: [...p.sortCleared, season] };
}

export function markMatchResult(p: JieqiProgress, moves: number): JieqiProgress {
  const best = p.matchBestMoves == null ? moves : Math.min(p.matchBestMoves, moves);
  return { ...p, matchBestMoves: best };
}

export function markQuizResult(p: JieqiProgress, correct: number): JieqiProgress {
  return {
    ...p,
    quizCorrect: p.quizCorrect + correct,
    quizRuns: p.quizRuns + 1,
  };
}

export function markTermRead(p: JieqiProgress, termId: string): JieqiProgress {
  if (p.readTermIds.includes(termId)) return p;
  return { ...p, readTermIds: [...p.readTermIds, termId] };
}

export function setLastResult(
  p: JieqiProgress,
  mode: ModeId,
  title: string,
  detail: string,
  scoreLabel: string,
): JieqiProgress {
  return { ...p, lastResult: { mode, title, detail, scoreLabel } };
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
