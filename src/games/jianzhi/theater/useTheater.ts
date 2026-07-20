import { useMemo } from 'react';
import type { JianzhiLesson, JianzhiProgress } from '../core/types';
import { JIANZHI_LESSONS } from '../content/lessons.ts';
import { ACTS, type Act } from '../content/acts.ts';

export interface ActState extends Act {
  unlocked: boolean;
  lit: boolean;
  lessons: JianzhiLesson[];
}

export function buildActStates(progress: JianzhiProgress): ActState[] {
  return ACTS.map((act) => {
    const lessons = act.lessonIds
      .map((id) => JIANZHI_LESSONS.find((l) => l.id === id))
      .filter((l): l is JianzhiLesson => Boolean(l));
    const minOrder = Math.min(...lessons.map((l) => l.order));
    const unlocked = progress.curriculumUnlocked >= minOrder;
    const lit = lessons.length > 0 && lessons.every((l) => progress.completedLessons.includes(l.id));
    return { ...act, unlocked, lit, lessons };
  });
}

export function useTheater(progress: JianzhiProgress): ActState[] {
  return useMemo(() => buildActStates(progress), [progress]);
}
