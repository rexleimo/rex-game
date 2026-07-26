import type { OmenItem } from '../core/types.ts';

/**
 * 卜辞填空题库。
 * 句式极短，重在让用户体验「甲骨文首先是问事的工具」。
 */
export const OMENS: OmenItem[] = [
  {
    id: 'omen-rain',
    oracleText: '贞：今日□？',
    blankId: 'yu-rain',
    options: ['日', '雨', '月'],
    answer: 1,
    vernacular: '问：今天会下雨吗？',
    whyAsked: '雨水决定农时与出行，是卜辞中最常见的天气之问。',
  },
  {
    id: 'omen-hunt',
    oracleText: '王往□，擒？',
    blankId: 'shou-hunt',
    options: ['田', '狩', '车'],
    answer: 1,
    vernacular: '大王去打猎，能捕获猎物吗？',
    whyAsked: '田猎既是获取资源，也是训练军事与祭祀准备。',
  },
  {
    id: 'omen-sacrifice',
    oracleText: '贞：翌日燎于□？',
    blankId: 'wang',
    options: ['王', '火', '羊'],
    answer: 2,
    vernacular: '问：明天用羊来燎祭吗？',
    whyAsked: '羊是常见祭牲，燎祭以烟气上达神明。',
  },
  {
    id: 'omen-crop',
    oracleText: '贞：今岁□受年？',
    blankId: 'he',
    options: ['禾', '水', '山'],
    answer: 0,
    vernacular: '问：今年庄稼会有好收成吗？',
    whyAsked: '「受年」是农业社会最关心的问题之一。',
  },
  {
    id: 'omen-sun',
    oracleText: '贞：□不蔽，明？',
    blankId: 'ri',
    options: ['月', '日', '火'],
    answer: 1,
    vernacular: '问：太阳不会被遮蔽，会明亮吗？',
    whyAsked: '日食或异常天象常引发占卜，反映对天时的重视。',
  },
  {
    id: 'omen-travel',
    oracleText: '贞：王□往，来无祸？',
    blankId: 'che',
    options: ['车', '犬', '人'],
    answer: 0,
    vernacular: '问：大王乘车前往，往返没有灾祸吗？',
    whyAsked: '商王出行常事前占卜，以确保路途平安。',
  },
];

export function getOmenById(id: string): OmenItem | undefined {
  return OMENS.find((o) => o.id === id);
}
