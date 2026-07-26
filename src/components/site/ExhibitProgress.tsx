'use client';

/**
 * 展品上的集卡角标。
 *
 * 首页原本对回访玩家和第一次来的人说同一句话。这个角标让回访者一眼看到
 * "这件我集了 2/4"，把首页从静态目录变成进度看板。
 *
 * 水合前渲染 null：进度只在 localStorage 里，服务端渲染不出来，
 * 硬渲染会造成 hydration mismatch。
 */

import { usePassport } from '@/core/passport';
import type { PassportGameId } from '@/core/passport';

export function ExhibitProgress({ game }: { game: string }) {
  const { passport, hydrated } = usePassport();
  if (!hydrated) return null;

  const section = passport.sections.find((s) => s.game === (game as PassportGameId));
  if (!section || section.earnedCount === 0) return null;

  const complete = section.earnedCount === section.totalCount;

  return (
    <span className="exhibit__progress" data-complete={complete || undefined}>
      {complete ? '已集齐' : `文化卡 ${section.earnedCount}/${section.totalCount}`}
    </span>
  );
}
