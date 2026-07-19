import type { JianzhiCommission } from '../core/types';

/**
 * 时令委托（阶段二，出师后开放）。
 * 一期最小集：春节窗花、婚庆喜花。
 */
export const JIANZHI_COMMISSIONS: JianzhiCommission[] = [
  {
    id: 'spring-window',
    title: '春节窗花',
    season: '春节',
    brief: '剪一副新春窗花：福字配鱼，把「福」与「余」一起贴上窗棂。',
    foldSuggestion: 'four',
    objectiveMode: 'motifs',
    objectiveMotifIds: ['fu', 'fish'],
    cultureEntryIds: ['window-flower', 'zodiac'],
    reward: '完成春节窗花委托 · 巩固窗花档案',
    reading: {
      origin:
        '春节糊新窗、贴窗花，是北方延续千年的习俗。红纸剪出的福字、鱼、花鸟贴在窗棂上，既装点院落，也把祈福纳祥交给新的一年。',
      technique:
        '四折适合窗花：一剪四面齐开，满窗热闹。福与鱼可先后落剪，再摆成对称构图。',
      focus:
        '委托目标：凑齐「福」与「鱼」。鱼谐「余」，福字主纳祥——新春窗花最常见的一对搭档。',
    },
    narrative: [
      '纸灵：出师了？村里托你剪一副春节窗花。',
      '师傅：福字不能少，再配一尾鱼——盼年年有余。',
      '纸灵：四折展开，贴上窗棂，年味就齐了。',
    ],
    quiz: {
      question: '新春窗花为什么常同时出现「福」与「鱼」？',
      options: ['只是为了颜色好看', '福主纳祥，鱼谐「余」，合起来祈福又盼有余', '鱼代表南方水乡'],
      answer: 1,
      explain:
        '福字承载祈福，鱼谐音「余」。福与鱼同贴窗花，是辞旧迎新里最直白的双愿。',
    },
  },
  {
    id: 'wedding-xi',
    title: '婚庆喜花',
    season: '婚庆',
    brief: '剪一对喜花：牡丹簇囍，送上一句「富贵双喜」。',
    foldSuggestion: 'book',
    objectiveMode: 'motifs',
    objectiveMotifIds: ['peony', 'double-happy'],
    targetComboId: 'fu-gui-shuang-xi',
    cultureEntryIds: ['wedding-flower'],
    reward: '完成婚庆喜花委托 · 解锁文化档案：喜花与婚俗',
    reading: {
      origin:
        '明清以来，婚嫁必用喜花：剪囍字贴于箱笼门窗，剪牡丹喻富贵。喜花是一套关于「成双成对、富贵绵长」的视觉祝福语。',
      technique:
        '对折剪「囍」最为顺手——半个「喜」沿折线剪开，展开即成对称的双喜，一如婚姻的成双成对。',
      focus:
        '象征拼句：牡丹（富贵）+ 囍（双喜）＝富贵双喜。既贺新婚，又祝荣华。',
    },
    narrative: [
      '纸灵：喜事临门，东家缺一对喜花。',
      '师傅：剪个「囍」，再簇一朵牡丹——富贵双喜，成双又荣华。',
      '纸灵：贴上箱笼门窗，祝福就跟着红纸走了。',
    ],
    quiz: {
      question: '喜花里牡丹表达的是哪一层寓意？',
      options: ['富贵荣华', '多子多孙', '长寿安康'],
      answer: 0,
      explain:
        '牡丹为「花中之王」，自唐代起象征富贵。它与囍字相配，便把「富贵」与「双喜」两个愿望拼成一句——这靠的是象征，而非谐音。',
    },
  },
];

export function getCommission(id: string): JianzhiCommission | undefined {
  return JIANZHI_COMMISSIONS.find((c) => c.id === id);
}
