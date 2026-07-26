import type { GameId } from '../gamesRegistry.ts';
import type { CampaignProgress } from '../../games/chaoshan-yingge/core/types.ts';
import type { JianzhiProgress } from '../../games/jianzhi/core/types.ts';
import type { JieqiProgress } from '../../games/ershisi-jieqi/core/types.ts';
import type { ShanhaiProgress } from '../../games/shanhai-shiyi/core/types.ts';
import type { JiaobeiProgress } from '../../games/shantou-jiaobei/core/progress.ts';

/**
 * 五个游戏的存档快照。
 *
 * 护照刻意不新建存储：卡牌是各游戏既有进度的纯函数。这样做的代价是护照要认识
 * 五种互不相同的存档形状；换来的是零迁移、零数据丢失风险，以及玩家清掉某个
 * 游戏的存档时护照自动跟着退回——不会出现"游戏说没玩过、护照说集齐了"。
 */
export interface PassportSnapshot {
  'shantou-jiaobei': JiaobeiProgress;
  'chaoshan-yingge': CampaignProgress;
  jianzhi: JianzhiProgress;
  'shanhai-shiyi': ShanhaiProgress;
  'ershisi-jieqi': JieqiProgress;
}

export type PassportGameId = keyof PassportSnapshot;

export interface PassportCard {
  /** 全站唯一，作为分享与统计的稳定标识。 */
  id: string;
  game: PassportGameId;
  /** 卡名。 */
  name: string;
  /** 一句文化说明，集到之后显示。 */
  blurb: string;
  /** 未集到时显示：告诉玩家怎么拿。这是跨游戏流转的唯一动力。 */
  hint: string;
}

export interface PassportCardState extends PassportCard {
  earned: boolean;
}

export interface PassportGameSection {
  game: PassportGameId;
  /** 展品名，取自 gamesRegistry。 */
  name: string;
  href: string;
  accent: string;
  cards: PassportCardState[];
  earnedCount: number;
  totalCount: number;
}

export interface PassportState {
  sections: PassportGameSection[];
  earnedCount: number;
  totalCount: number;
  /** 已经至少集到一张卡的展品数——衡量跨游戏流转的核心指标。 */
  visitedGames: number;
}

export type { GameId };
