import type { ChapterEvaluation, JianzhiChapter } from './types';

/**
 * 判定本章是否达成目标：目标纹样需全部出现在已落剪的纹样集合中。
 * 纯函数，不依赖 React / Canvas / localStorage，便于推理与测试。
 */
export function evaluateChapter(chapter: JianzhiChapter, placedMotifIds: string[]): ChapterEvaluation {
  const missing = chapter.objectiveMotifIds.filter((id) => !placedMotifIds.includes(id));
  return { passed: missing.length === 0, missing };
}
