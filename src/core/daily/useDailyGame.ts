'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  dailyStreak,
  isDayDone,
  loadDaily,
  markDayDone,
  saveDaily,
  todayKey,
  type DailyProgress,
} from './index.ts';

/**
 * 展品侧的日课状态与落账入口。
 *
 * - `done`：今天的日课是否已完成（驱动卡片打勾、按钮禁用）；
 * - `streak`：当前连击天数（含今天则已计入）；
 * - `complete()`：任务达成时调用，幂等，内部直接持久化。
 *
 * 读取放在 effect 里而非 useState 初始化：静态导出下 SSR 首帧必须与
 * 客户端首帧一致，否则水合报错。
 */
export function useDailyGame(gameId: string) {
  const [progress, setProgress] = useState<DailyProgress | null>(null);

  useEffect(() => {
    setProgress(loadDaily());
  }, []);

  const day = todayKey();
  const done = progress ? isDayDone(progress, day, gameId) : false;
  const streak = progress ? dailyStreak(progress, day) : { current: 0, best: 0, doneToday: false };

  const complete = useCallback(() => {
    setProgress((prev) => {
      const next = markDayDone(prev ?? loadDaily(), todayKey(), gameId);
      saveDaily(next);
      return next;
    });
  }, [gameId]);

  return { day, done, streak: streak.current, bestStreak: streak.best, complete };
}
