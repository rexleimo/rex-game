/** 岁时专题目录 —— 按公历提示 + 可玩卡片 */

export interface FestivalTopic {
  id: string;
  name: string;
  /** 公历月日大致窗口（提示用，非精确天文） */
  monthHint: string;
  oneLiner: string;
  blurb: string[];
  learnFocus: string;
  /** 关联文化卡 id */
  artifactIds: string[];
}

export const FESTIVAL_TOPICS: FestivalTopic[] = [
  {
    id: 'spring',
    name: '春节',
    monthHint: '约 1–2 月（农历正月）',
    oneLiner: '辞旧迎新，把门写成诗。',
    blurb: [
      '春节是最重要的团圆节点之一。',
      '春联、扫尘、年夜饭……各地细节不同，心气相通。',
    ],
    learnFocus: '团圆、更新、春联文字',
    artifactIds: ['A-R07-SR-001', 'A-R07-N-002', 'A-R07-R-014'],
  },
  {
    id: 'lantern',
    name: '元宵',
    monthHint: '约 2–3 月（正月十五）',
    oneLiner: '灯火与圆子，把正月推向高潮。',
    blurb: ['观灯、食圆、灯谜，是常见的欢乐组合。', '夜游本身就是一种公共艺术。'],
    learnFocus: '花灯、团圆食俗、灯谜',
    artifactIds: ['A-R07-R-003', 'A-R07-N-004'],
  },
  {
    id: 'qingming',
    name: '清明',
    monthHint: '约 4 月',
    oneLiner: '纪念与踏青，写在同一阵春风里。',
    blurb: ['慎终追远，也走向新绿。', '文明祭扫与生态保护是当代功课。'],
    learnFocus: '纪念礼仪与时令踏青',
    artifactIds: ['A-R07-N-010'],
  },
  {
    id: 'duanwu',
    name: '端午',
    monthHint: '约 5–6 月（五月初五）',
    oneLiner: '叶、鼓、江——夏天的仪式感。',
    blurb: ['粽子、龙舟与多元起源叙事。', '可与楚地楚辞记忆互相参照。'],
    learnFocus: '食俗、龙舟协作、文学记忆',
    artifactIds: ['A-R07-R-005', 'A-R07-R-006', 'A-R07-N-007', 'A-R02-N-019'],
  },
  {
    id: 'qixi',
    name: '七夕',
    monthHint: '约 8 月（七月初七）',
    oneLiner: '星桥传说，谈等待与重逢。',
    blurb: ['文学与民俗交织的情感节日。', '尊重与承诺比形式更重要。'],
    learnFocus: '传说与情感主题',
    artifactIds: ['A-R07-N-011'],
  },
  {
    id: 'midautumn',
    name: '中秋',
    monthHint: '约 9–10 月（八月十五）',
    oneLiner: '月与饼，把团圆做得可看见、可分享。',
    blurb: ['赏月、思乡、月饼。', '小份分享更接近节日本意。'],
    learnFocus: '赏月、团圆、月饼',
    artifactIds: ['A-R07-R-008', 'A-R07-N-009'],
  },
  {
    id: 'chongyang',
    name: '重阳',
    monthHint: '约 10 月（九月初九）',
    oneLiner: '登高与敬老，写在秋天。',
    blurb: ['九九登高的时令，与当代敬老主题相遇。'],
    learnFocus: '登高、敬老',
    artifactIds: ['A-R07-N-012'],
  },
  {
    id: 'dongzhi',
    name: '冬至',
    monthHint: '约 12 月',
    oneLiner: '白昼最短处，光开始回来。',
    blurb: ['重要节气与节日，食俗南北有别。', '「一阳来复」是古典的希望修辞。'],
    learnFocus: '节气转折与冬日食俗',
    artifactIds: ['A-R07-N-013'],
  },
  {
    id: 'solar',
    name: '二十四节气',
    monthHint: '贯穿全年',
    oneLiner: '更细的物候时间表。',
    blurb: [
      '节气是观察太阳与物候的知识体系。',
      '可与具体节日叠加理解「大节 + 小节气」。',
    ],
    learnFocus: '节气作为时间知识',
    artifactIds: ['A-R07-N-015', 'A-R07-SR-016'],
  },
];

export function getFestival(id: string): FestivalTopic | undefined {
  return FESTIVAL_TOPICS.find((f) => f.id === id);
}

/** 粗略：按本地月份提示「近期可关注」的专题（非精确农历） */
export function suggestFestivalIds(d = new Date()): string[] {
  const m = d.getMonth() + 1;
  if (m === 1 || m === 2) return ['spring', 'lantern'];
  if (m === 3 || m === 4) return ['qingming', 'solar'];
  if (m === 5 || m === 6) return ['duanwu'];
  if (m === 7 || m === 8) return ['qixi', 'midautumn'];
  if (m === 9 || m === 10) return ['midautumn', 'chongyang'];
  if (m === 11 || m === 12) return ['dongzhi', 'solar'];
  return ['solar'];
}
