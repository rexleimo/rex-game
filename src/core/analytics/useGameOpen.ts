'use client';

/**
 * 展品页曝光埋点。
 *
 * 放在每个游戏的客户端根组件里，挂载即上报一次 game_open —— 这是整条漏斗的
 * 分母。用 ref 守卫是因为 React 18+ 严格模式下开发环境会双挂载，不守会把
 * 本地调试的重复曝光混进真实数据。
 */

import { useEffect, useRef } from 'react';

import { trackGameOpen } from './events.ts';
import type { GameId } from '../gamesRegistry.ts';

export function useGameOpen(game: GameId) {
  const reported = useRef(false);

  useEffect(() => {
    if (reported.current) return;
    reported.current = true;
    trackGameOpen(game);
  }, [game]);
}
