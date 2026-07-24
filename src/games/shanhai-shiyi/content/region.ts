import type { ExhibitStop, LearnPoint } from '../core/types';

export const REGION_ID = 'R01';
export const REGION_NAME = '中原';

export const REGION_BLURB = [
  '中原大地，礼乐与青铜留下很深的印记。',
  '鼎、钟、圭、璧……许多器物不只「好看」，还曾参与祭祀、朝会与秩序的表达。',
  '在这里拾遗，是从一件件器形和纹样里，轻轻摸到古代中国「礼」与「工」的温度。',
] as const;

/** 完整必学 6 点（对齐中原示范） */
export const LEARN_POINTS: LearnPoint[] = [
  {
    id: 'R01-L01',
    goal: '叫得出「鼎」，知道它是重要青铜器类型',
    checkQuestion: '鼎长什么样？古人为什么重视它？',
  },
  {
    id: 'R01-L02',
    goal: '知道「礼器」大致指什么（一句话）',
    checkQuestion: '礼器是厨房锅吗？它还可能和什么场合有关？',
  },
  {
    id: 'R01-L03',
    goal: '能认出或说出一种典型纹样名（云雷纹或兽面纹）',
    checkQuestion: '器表上的回旋纹或兽面，你能叫出名字吗？',
  },
  {
    id: 'R01-L04',
    goal: '知道编钟与「乐」相关，钟是成组音高乐器意象',
    checkQuestion: '编钟是一件还是一组？和礼乐有什么关系？',
  },
  {
    id: 'R01-L05',
    goal: '对「铭文」有印象：器上可能铸字记事',
    checkQuestion: '青铜器上的字可能用来记什么？',
  },
  {
    id: 'R01-L06',
    goal: '能讲 1 个与中原器物相关的短故事或名句印象',
    checkQuestion: '你最想讲给别人听的一句是什么？',
  },
];

export const REGION_SUMMARY = [
  '中原篇里，我们认识了鼎等礼器——它们承载的不只是使用，还有礼与秩序的观念。',
  '云雷纹、兽面纹帮助我们记住青铜器的「面孔」；钟磬之声提醒礼与乐相伴。',
  '铭文与祝福套语提醒我们：器物里，也铸着希望被记住的心意。',
] as const;

/**
 * 推荐观展：分三条短路线，降低疲劳；全部内容仍在山海册可直达。
 */
export const EXHIBIT_ROUTES: { id: string; title: string; intro: string; stops: ExhibitStop[] }[] =
  [
    {
      id: 'route-liqi',
      title: '路线甲 · 初识礼器',
      intro: '从鼎与礼器概念入门，建立本区最重要的印象。',
      stops: [
        {
          id: 'a-plaque',
          kind: 'plaque',
          title: '说明牌 · 礼与器',
          body: '黄土与麦浪之外，青铜反射着冷光。有人说，那是把「秩序」铸成了可以触摸的形。',
        },
        { id: 'a-ding', kind: 'lore', title: '遗宝台 · 云雷纹铜鼎', artifactId: 'A-R01-SR-001' },
        { id: 'a-liqi', kind: 'lore', title: '书院 · 什么是礼器', artifactId: 'A-R01-N-003' },
        { id: 'a-types', kind: 'lore', title: '书院 · 食酒水分类', artifactId: 'A-R01-N-014' },
        { id: 'a-jue', kind: 'lore', title: '遗宝台 · 青铜爵', artifactId: 'A-R01-R-007' },
      ],
    },
    {
      id: 'route-wenyang',
      title: '路线乙 · 纹样与乐',
      intro: '认兽面与云雷，再听编钟——礼也有面孔与声音。',
      stops: [
        { id: 'b-shoumian', kind: 'lore', title: '遗宝台 · 兽面纹', artifactId: 'A-R01-R-002' },
        { id: 'b-yunlei', kind: 'lore', title: '遗宝台 · 云雷纹单元', artifactId: 'A-R01-R-015' },
        { id: 'b-chime', kind: 'lore', title: '遗宝台 · 编钟', artifactId: 'A-R01-SR-004' },
        { id: 'b-yue', kind: 'lore', title: '书院 · 礼乐', artifactId: 'A-R01-N-021' },
        {
          id: 'b-plaque',
          kind: 'plaque',
          title: '说明牌 · 节奏',
          body: '云雷纹并不描绘某一朵云，它是重复的节奏，像礼仪本身：循环、克制、庄重。',
        },
      ],
    },
    {
      id: 'route-mingwen',
      title: '路线丙 · 字与传',
      intro: '器上有字，字在记事；也把祝福传给后代。',
      stops: [
        { id: 'c-gui', kind: 'lore', title: '遗宝台 · 铭文簋', artifactId: 'A-R01-SR-005' },
        { id: 'c-why', kind: 'lore', title: '书院 · 铭文为何重要', artifactId: 'A-R01-N-026' },
        { id: 'c-phrase', kind: 'lore', title: '拓影 · 子子孙孙', artifactId: 'A-R01-R-006' },
        { id: 'c-ethics', kind: 'lore', title: '公教 · 考古边界', artifactId: 'A-R01-N-009' },
        { id: 'c-shanhai', kind: 'lore', title: '典籍 · 山海册中原页', artifactId: 'A-R01-N-010' },
        {
          id: 'c-summary',
          kind: 'summary',
          title: '小结亭 · 中原三句',
          body: REGION_SUMMARY.join('\n'),
        },
      ],
    },
  ];

/** 兼容旧单路线引用：拼合为总览 */
export const EXHIBIT_ROUTE: ExhibitStop[] = EXHIBIT_ROUTES.flatMap((r) => r.stops);
