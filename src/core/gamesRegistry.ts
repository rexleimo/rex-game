/**
 * 游戏注册表 —— 多游戏可扩展机制。
 * 新增游戏 = 加一条记录 + 创建 app/games/<id>/page.tsx。
 */

export type GameId = 'shantou-jiaobei' | (string & {});

export interface GameMeta {
  id: GameId;
  /** 展品标题 */
  name: string;
  /** 副标题 / 一句话介绍 */
  tagline: string;
  /** 展品主视觉 */
  cover: string;
  /** 路由（对应 app/games/<id>） */
  href: string;
  /** 展品角标（如 "新" / "热门"） */
  badge?: string;
  /** 主题色 */
  accent: string;
}

export const games: GameMeta[] = [
  {
    id: 'shantou-jiaobei',
    name: '潮汕圣杯占卜',
    tagline: '双手合十，掷筊问愿 —— 圣杯、笑杯、阴杯，神明如何回你？',
    cover: '/assets/jiaobei-hero.png',
    href: '/games/shantou-jiaobei',
    badge: '新',
    accent: '#A6332B',
  },
];

export function getGame(id: GameId): GameMeta | undefined {
  return games.find((g) => g.id === id);
}
