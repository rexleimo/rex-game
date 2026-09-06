'use client';

import { useEffect, useState } from 'react';

/**
 * 读取 `?mode=daily` 深链。
 *
 * 静态导出下 query 只存在于客户端，因此挂载后读取一次。返回 true 表示
 * 玩家从首页「今日」板块点进来，应直接落到当日任务视图。
 */
export function useDailyDeepLink(): boolean {
  const [daily, setDaily] = useState(false);
  useEffect(() => {
    setDaily(new URLSearchParams(window.location.search).get('mode') === 'daily');
  }, []);
  return daily;
}
