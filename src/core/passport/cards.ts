import type { PassportCard, PassportGameId, PassportSnapshot } from './types.ts';

/**
 * 卡牌注册表。
 *
 * 每张卡带一个 earned 判定，输入是对应游戏的存档、输出是布尔。判定必须是纯
 * 函数：护照页每次渲染都会跑一遍，不能有副作用，也不能读 localStorage。
 *
 * 设卡原则：每个展品的第一张卡必须"玩一局就能拿到"，最后一张要求通关或集齐。
 * 门槛太高的护照没人会想集第二个展品。
 */

interface CardDef<G extends PassportGameId> extends PassportCard {
  game: G;
  earned: (progress: PassportSnapshot[G]) => boolean;
}

export type AnyCardDef = {
  [G in PassportGameId]: CardDef<G>;
}[PassportGameId];

/** 山海器物 166 件、8 个展区，用比例而非绝对数设门槛，日后加器物不必改卡。 */
const SHANHAI_CURATOR_RATIO = 0.1;

const JIAOBEI_CARDS: CardDef<'shantou-jiaobei'>[] = [
  {
    id: 'jiaobei-sheng',
    game: 'shantou-jiaobei',
    name: '圣杯',
    blurb: '一平一凸，神明应允。三种杯象里唯一的「许」。',
    hint: '在潮汕圣杯里掷出一次圣杯。',
    earned: (p) => p.seenCups.includes('sheng'),
  },
  {
    id: 'jiaobei-xiao',
    game: 'shantou-jiaobei',
    name: '笑杯',
    blurb: '两面皆平，神明发笑——问题问得不够清楚，再问一次。',
    hint: '在潮汕圣杯里掷出一次笑杯。',
    earned: (p) => p.seenCups.includes('xiao'),
  },
  {
    id: 'jiaobei-yin',
    game: 'shantou-jiaobei',
    name: '阴杯',
    blurb: '两面皆凸，此路不通。答案是「不」，但不是「永远不」。',
    hint: '在潮汕圣杯里掷出一次阴杯。',
    earned: (p) => p.seenCups.includes('yin'),
  },
  {
    id: 'jiaobei-three-sheng',
    game: 'shantou-jiaobei',
    name: '三圣连筊',
    blurb: '连得三圣，庙里视为最明确的允准。',
    hint: '在一局三掷中连续掷出三次圣杯。',
    earned: (p) => p.seenVerdicts.includes('all-sheng'),
  },
];

const YINGGE_CARDS: CardDef<'chaoshan-yingge'>[] = [
  {
    id: 'yingge-first-drum',
    game: 'chaoshan-yingge',
    name: '初闻鼓点',
    blurb: '英歌的一切都从鼓点开始——槌落在拍上，队形才立得住。',
    hint: '通关英歌第一章「鼓点入门」。',
    earned: (p) => p.unlocked >= 2,
  },
  {
    id: 'yingge-formation',
    game: 'chaoshan-yingge',
    name: '阵列初成',
    blurb: '双龙出海、四虎归山——队形是英歌区别于一般舞蹈的骨架。',
    hint: '通关英歌前三章，解锁队形阵法。',
    earned: (p) => p.unlocked >= 4,
  },
  {
    id: 'yingge-grand-parade',
    game: 'chaoshan-yingge',
    name: '全阵通巡',
    blurb: '从练鼓到大巡游，一支英歌队的完整养成路径。',
    hint: '通关英歌全部五章。',
    earned: (p) => p.unlocked >= 5,
  },
  {
    id: 'yingge-high-spirit',
    game: 'chaoshan-yingge',
    name: '神采飞扬',
    blurb: '「气」是英歌的评判标准——不是打得准，是打得有精神。',
    hint: '任意章节的神采评分达到 80。',
    earned: (p) => Object.values(p.bestSpirit).some((s) => (s ?? 0) >= 80),
  },
];

const JIANZHI_CARDS: CardDef<'jianzhi'>[] = [
  {
    id: 'jianzhi-first-cut',
    game: 'jianzhi',
    name: '开剪',
    blurb: '折、画、剪、展——剪纸的四步，第一步永远是折。',
    hint: '完成剪纸的第一课。',
    earned: (p) => p.completedLessons.length >= 1,
  },
  {
    id: 'jianzhi-rebus',
    game: 'jianzhi',
    name: '吉语双关',
    blurb: '莲＋鱼＝连年有余。中国纹样靠谐音说话。',
    hint: '在剪纸中拼出任意一句吉语组合。',
    earned: (p) => p.discoveredCombos.length >= 1,
  },
  {
    id: 'jianzhi-motif-hall',
    game: 'jianzhi',
    name: '纹样满堂',
    blurb: '十四种传统纹样，各自对应一句说不出口但剪得出来的祝福。',
    hint: '收集全部 14 种剪纸纹样。',
    earned: (p) => p.collectedMotifIds.length >= 14,
  },
  {
    id: 'jianzhi-graduate',
    game: 'jianzhi',
    name: '出师',
    blurb: '学徒出师，才接得了别人的订单。',
    hint: '完成全部七课，从纸灵学徒出师。',
    earned: (p) => p.graduated,
  },
  {
    id: 'jianzhi-commissioned',
    game: 'jianzhi',
    name: '受托成作',
    blurb: '旧时剪花娘子接的就是这种活：按主顾的心愿定纹样。',
    hint: '出师后完成任意一份委托。',
    earned: (p) => p.completedCommissions.length >= 1,
  },
];

const SHANHAI_CARDS: CardDef<'shanhai-shiyi'>[] = [
  {
    id: 'shanhai-first-restore',
    game: 'shanhai-shiyi',
    name: '初次上手',
    blurb: '修复一件器物，比读十段说明更记得住它的形制。',
    hint: '在山海拾遗中修复第一件器物。',
    earned: (p) => Object.values(p.artifacts).some((a) => a?.restored),
  },
  {
    id: 'shanhai-read-lore',
    game: 'shanhai-shiyi',
    name: '识器',
    blurb: '器物的纹、形、用途——三者对上了，才算认识它。',
    hint: '读完任意五件器物的核心说明。',
    earned: (p) => p.learnedIds.length >= 5,
  },
  {
    id: 'shanhai-curator',
    game: 'shanhai-shiyi',
    name: '藏馆有主',
    blurb: '修满一馆，中原礼器的谱系就串起来了。',
    hint: `修复 ${Math.ceil(166 * SHANHAI_CURATOR_RATIO)} 件以上器物。`,
    earned: (p) =>
      Object.values(p.artifacts).filter((a) => a?.restored).length >=
      Math.ceil(166 * SHANHAI_CURATOR_RATIO),
  },
  {
    id: 'shanhai-cartographer',
    game: 'shanhai-shiyi',
    name: '按图索器',
    blurb: '器物不是孤立的——它属于某个地域、某个时代的一整套礼制。',
    hint: '打开区域图志，走完一次多区域路线。',
    earned: (p) => p.visitedMap,
  },
];

const JIEQI_CARDS: CardDef<'ershisi-jieqi'>[] = [
  {
    id: 'jieqi-first-sort',
    game: 'ershisi-jieqi',
    name: '时序初校',
    blurb: '节气不是农历，是太阳年——所以它每年落在几乎同一天。',
    hint: '完成任意一个季节的时序排序。',
    earned: (p) => p.sortCleared.length >= 1,
  },
  {
    id: 'jieqi-full-year',
    game: 'ershisi-jieqi',
    name: '全年归位',
    blurb: '四立分四季，二至二分定四极，其余十六个填满一年。',
    hint: '完成「全年」难度的时序排序。',
    earned: (p) => p.sortCleared.includes('year'),
  },
  {
    id: 'jieqi-phenology',
    game: 'ershisi-jieqi',
    name: '物候相认',
    blurb: '每个节气三候，古人用五天一变的物候把时间刻出来。',
    hint: '完成一次物候配对。',
    earned: (p) => p.matchBestMoves != null,
  },
  {
    id: 'jieqi-quiz',
    game: 'ershisi-jieqi',
    name: '农时小考',
    blurb: '节气最初是农书，不是诗——它要回答的是「该种什么了」。',
    hint: '完成一次节气问答。',
    earned: (p) => p.quizRuns >= 1,
  },
  {
    id: 'jieqi-codex',
    game: 'ershisi-jieqi',
    name: '图鉴通读',
    blurb: '二十四节气，二十四种看待同一年的方式。',
    hint: '在图鉴中读完全部 24 个节气。',
    earned: (p) => p.readTermIds.length >= 24,
  },
];

const JIAGU_CARDS: CardDef<'jiaguwen'>[] = [
  {
    id: 'jiagu-first-match',
    game: 'jiaguwen',
    name: '初识骨字',
    blurb: '甲骨文的每一笔都不是装饰，而是轮廓的简化。',
    hint: '在甲骨问契完成一次「辨形」配对。',
    earned: (p) => p.runs.match >= 1,
  },
  {
    id: 'jiagu-first-sense',
    game: 'jiaguwen',
    name: '见形象义',
    blurb: '日像太阳、月像弯钩——字形本身就是答案。',
    hint: '在甲骨问契完成一次「契意」选义。',
    earned: (p) => p.runs.sense >= 1,
  },
  {
    id: 'jiagu-first-omen',
    game: 'jiaguwen',
    name: '临骨而问',
    blurb: '卜辞不是咒语，而是三千年前的人向时间发问的格式。',
    hint: '在甲骨问契完成一次「卜辞」填空。',
    earned: (p) => p.runs.omen >= 1,
  },
  {
    id: 'jiagu-daily-run',
    game: 'jiaguwen',
    name: '今日三契',
    blurb: '辨形、契意、卜辞——一局串起三种读骨方式。',
    hint: '完成一次「今日三契」。',
    earned: (p) => p.runs.daily >= 1,
  },
  {
    id: 'jiagu-codex',
    game: 'jiaguwen',
    name: '字库通览',
    blurb: '24 字不多，但足以建立「象形字不是抽象符号」的直觉。',
    hint: '在字图鉴中浏览全部 24 个甲骨字。',
    earned: (p) => p.readIds.length >= 24,
  },
];

export const PASSPORT_CARDS: AnyCardDef[] = [
  ...JIAGU_CARDS,
  ...JIEQI_CARDS,
  ...SHANHAI_CARDS,
  ...JIAOBEI_CARDS,
  ...YINGGE_CARDS,
  ...JIANZHI_CARDS,
];

export const PASSPORT_GAME_ORDER: PassportGameId[] = [
  'jiaguwen',
  'ershisi-jieqi',
  'shanhai-shiyi',
  'shantou-jiaobei',
  'chaoshan-yingge',
  'jianzhi',
];

export function cardsForGame(game: PassportGameId): AnyCardDef[] {
  return PASSPORT_CARDS.filter((card) => card.game === game);
}
