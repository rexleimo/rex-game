/**
 * 埋点事件契约。
 *
 * 六个核心事件覆盖一条完整漏斗：
 *   进馆 game_open → 开玩 game_start → 过程 step_complete → 通关 game_finish
 * 外加两个分发信号：share_click（传播）、culture_click（文化页转化）。
 *
 * 约束：属性值只允许字符串/数字/布尔，且不得含个人信息。埋点只回答
 * "哪个展品留得住人"，不做用户画像。
 */

import type { GameId } from '../gamesRegistry.ts';

export type AnalyticsEvent =
  | 'game_open'
  | 'game_start'
  | 'step_complete'
  | 'game_finish'
  | 'share_click'
  | 'culture_click';

export type AnalyticsProps = Record<string, string | number | boolean>;

export interface GameOpenProps extends AnalyticsProps {
  game: GameId;
}

export interface GameStartProps extends AnalyticsProps {
  game: GameId;
  /** 游戏内玩法/章节标识，如 jieqi 的 sort/match/quiz。 */
  mode: string;
}

export interface StepCompleteProps extends AnalyticsProps {
  game: GameId;
  mode: string;
  /** 里程碑名，如 'fold'、'act-2'、'region-cleared'。 */
  step: string;
}

export interface GameFinishProps extends AnalyticsProps {
  game: GameId;
  mode: string;
  /** 'win' | 'lose' | 'quit'，或游戏自定义结局键（如圣杯的 sheng/xiao/yin）。 */
  outcome: string;
}

export interface ShareClickProps extends AnalyticsProps {
  game: GameId;
  /** 分享入口所在界面，如 'result'、'gallery'。 */
  surface: string;
}

export interface CultureClickProps extends AnalyticsProps {
  /** 来源页标识，如游戏 id 或 'home'、'culture-hub'。 */
  from: string;
  /** 目标文化页路径。 */
  to: string;
}

export interface EventPropsMap {
  game_open: GameOpenProps;
  game_start: GameStartProps;
  step_complete: StepCompleteProps;
  game_finish: GameFinishProps;
  share_click: ShareClickProps;
  culture_click: CultureClickProps;
}
