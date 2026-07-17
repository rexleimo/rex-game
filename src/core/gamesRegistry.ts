/**
 * 游戏注册表 —— 多游戏可扩展机制。
 * 新增游戏 = 加一条记录 + 创建 app/games/<id>/page.tsx。
 */

export type GameId = 'shantou-jiaobei' | 'chaoshan-yingge' | (string & {});

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
  {
    id: 'chaoshan-yingge',
    name: '合槌成阵：潮汕英歌',
    tagline: '听鼓落槌，随队而行——在节奏与队形中认识潮汕英歌。',
    cover: '/assets/yingge/cover.svg',
    href: '/games/chaoshan-yingge',
    badge: '新作',
    accent: '#9F251D',
  },
];

export function getGame(id: GameId): GameMeta | undefined {
  return games.find((g) => g.id === id);
}
