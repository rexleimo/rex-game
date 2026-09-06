/**
 * 日课任务注册表。
 *
 * 这里只登记「今天该做什么」的静态元信息（标题、引导语、深链），供首页
 * 「今日」板块与测试引用；任务的实际内容（选哪道题、修哪件器物）由各展品
 * 用 dailyRng(day, gameId) 自己播种，保证同一天全站一致。
 *
 * 深链约定：/games/<id>/?mode=daily —— 各展品挂载时读 query，直接进入当日任务。
 */

export type DailyTaskGameId =
  | 'jiaguwen'
  | 'ershisi-jieqi'
  | 'shanhai-shiyi'
  | 'shantou-jiaobei'
  | 'chaoshan-yingge'
  | 'jianzhi'
  | 'shanhai-wenshou';

export interface DailyTaskMeta {
  gameId: DailyTaskGameId;
  /** 任务名，带「今日」前缀。 */
  label: string;
  /** 一句引导语（未完成时显示）。 */
  task: string;
  /** 深链，含 ?mode=daily。 */
  href: string;
}

export function dailyTaskHref(gameId: DailyTaskGameId): string {
  return `/games/${gameId}/?mode=daily`;
}

export const DAILY_TASKS: DailyTaskMeta[] = [
  {
    gameId: 'jiaguwen',
    label: '今日三契',
    task: '辨形、契意、卜辞，一局走通三种读骨方式。',
    href: dailyTaskHref('jiaguwen'),
  },
  {
    gameId: 'ershisi-jieqi',
    label: '今日问农',
    task: '三道小题，都围着今天的节气。',
    href: dailyTaskHref('ershisi-jieqi'),
  },
  {
    gameId: 'shanhai-shiyi',
    label: '今日修复',
    task: '修复一件今日选定的器物。',
    href: dailyTaskHref('shanhai-shiyi'),
  },
  {
    gameId: 'shantou-jiaobei',
    label: '今日请愿',
    task: '带着今日馆祝，掷一次筊。',
    href: dailyTaskHref('shantou-jiaobei'),
  },
  {
    gameId: 'chaoshan-yingge',
    label: '今日巡游',
    task: '按日历走一段今日战线。',
    href: dailyTaskHref('chaoshan-yingge'),
  },
  {
    gameId: 'jianzhi',
    label: '今日一剪',
    task: '重剪一件今日功课，练手即练心。',
    href: dailyTaskHref('jianzhi'),
  },
  {
    gameId: 'shanhai-wenshou',
    label: '今日巡山',
    task: '一只按日历点名的山中兽——图志里有它，就出海。',
    href: dailyTaskHref('shanhai-wenshou'),
  },
];
