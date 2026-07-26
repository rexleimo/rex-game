/**
 * 六个核心事件的具名封装。
 *
 * 游戏侧一律调用这里的函数而非直接 track()，好处是事件名与属性形状收敛在
 * 一处：以后改名或补字段只动这个文件，不用回头翻五个游戏。
 */

import { track } from './track.ts';
import type { GameId } from '../gamesRegistry.ts';

/** 展品页挂载。漏斗第一层，分母。 */
export function trackGameOpen(game: GameId) {
  track('game_open', { game });
}

/** 玩家真正开始一局（点了"开始"，而非只是看到页面）。 */
export function trackGameStart(game: GameId, mode: string) {
  track('game_start', { game, mode });
}

/** 局内里程碑。用来定位玩家在第几步流失。 */
export function trackStepComplete(game: GameId, mode: string, step: string) {
  track('step_complete', { game, mode, step });
}

/** 一局结束。outcome 用 'win' | 'lose' | 'quit' 或游戏自定义结局键。 */
export function trackGameFinish(game: GameId, mode: string, outcome: string) {
  track('game_finish', { game, mode, outcome });
}

/** 分享入口点击。静态站唯一的自然增长杠杆，必须单独看。 */
export function trackShareClick(game: GameId, surface: string) {
  track('share_click', { game, surface });
}

/** 跳往文化页。衡量"玩完愿不愿意读"。 */
export function trackCultureClick(from: string, to: string) {
  track('culture_click', { from, to });
}
