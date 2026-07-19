import type { RebusCombo } from '../core/types';

const IH_CHINA = 'https://www.ihchina.cn/';

/**
 * 吉语组合库 —— 剪纸「看图说吉话」的谐音与象征语法。
 *
 * 剪纸真正的文化底蕴，不在单个纹样，而在它们如何被拼成一句祝福：
 * 莲（连）+ 鱼（余）＝连年有余，喜鹊 + 梅（眉）＝喜上眉梢……
 * 古人用同音与象征，把说不出口的心愿，剪成看得见的句子。
 *
 * 每条组合都标注了「成句原理」，让玩家在拼合的那一刻真正读懂它。
 */
export const JIANZHI_COMBOS: RebusCombo[] = [
  {
    id: 'lian-nian-you-yu',
    phrase: '连年有余',
    motifIds: ['lotus', 'fish'],
    principle:
      '莲谐音「连」，鱼谐音「余」，一朵莲配一尾鱼，便读作「连年有余」——年年都有富足的盈余。这是北方窗花里最经典的一句吉话。',
    tagline: '莲=连 · 鱼=余，盼的是年年不缺。',
    evidence: 'recorded',
    sourceLabel: '中国非物质文化遗产网',
    sourceUrl: IH_CHINA,
  },
  {
    id: 'xi-shang-mei-shao',
    phrase: '喜上眉梢',
    motifIds: ['magpie', 'plum'],
    principle:
      '喜鹊登上梅枝：喜鹊民间视为「报喜鸟」，梅（méi）谐音「眉」，鹊立梅梢即「喜上眉梢」——喜悦爬上眉头。谐音与画面在此合而为一。',
    tagline: '梅=眉，喜鹊报喜，喜到眉梢。',
    evidence: 'recorded',
    sourceLabel: '中国非物质文化遗产网',
    sourceUrl: IH_CHINA,
  },
  {
    id: 'fu-shou-shuang-quan',
    phrase: '福寿双全',
    motifIds: ['bat', 'peach'],
    principle:
      '蝙蝠的「蝠」谐音「福」，寿桃象征「寿」，两者相配便是「福寿双全」。以象征代吉字，是剪纸避直说、图彩头的常法。',
    tagline: '蝠=福 · 桃=寿，福与寿一并求全。',
    evidence: 'recorded',
    sourceLabel: '中国非物质文化遗产网',
    sourceUrl: IH_CHINA,
  },
  {
    id: 'fu-zai-yan-qian',
    phrase: '福在眼前',
    motifIds: ['bat', 'coin'],
    principle:
      '蝠谐「福」，古钱外圆内方、方孔如「眼」，钱又谐「前」，蝙蝠衔钱即「福在眼前」——福气近在眼前。商铺新春最爱贴这一式。',
    tagline: '蝠=福 · 钱=眼前，福气就在跟前。',
    evidence: 'oral-tradition',
    sourceLabel: '中国非物质文化遗产网',
    sourceUrl: IH_CHINA,
  },
  {
    id: 'lian-sheng-gui-zi',
    phrase: '连生贵子',
    motifIds: ['lotus', 'pomegranate'],
    principle:
      '莲谐「连」，又莲蓬多子；石榴籽实繁多，象征多子。莲与石榴同剪，寓「连生贵子」——子孙接连而来。婚俗喜花里的祝愿。',
    tagline: '莲=连生 · 榴多子，盼子孙绵延。',
    evidence: 'recorded',
    sourceLabel: '中国非物质文化遗产网',
    sourceUrl: IH_CHINA,
  },
  {
    id: 'fu-gui-shuang-xi',
    phrase: '富贵双喜',
    motifIds: ['peony', 'double-happy'],
    principle:
      '牡丹为「花中之王」，象征富贵；「囍」是婚嫁专属的双喜。牡丹簇拥囍字，便是「富贵双喜」——既贺新婚，又祝荣华。',
    tagline: '牡丹=富贵 · 囍=双喜，喜上加荣华。',
    evidence: 'recorded',
    sourceLabel: '中国非物质文化遗产网',
    sourceUrl: IH_CHINA,
  },
  {
    id: 'die-lian-hua',
    phrase: '蝶恋花开',
    motifIds: ['butterfly', 'peony'],
    principle:
      '蝴蝶绕花，取「蝶恋花」的缠绵，喻美好爱情；牡丹又添富贵。团花里蝶绕牡丹，是「花开富贵、蝶恋成双」的双重祝福。',
    tagline: '蝶恋花 · 花富贵，情与荣并盛。',
    evidence: 'oral-tradition',
    sourceLabel: '中国非物质文化遗产网',
    sourceUrl: IH_CHINA,
  },
  {
    id: 'yu-tu-ying-chun',
    phrase: '玉兔迎春',
    motifIds: ['rabbit', 'plum'],
    principle:
      '玉兔是月宫与生肖的化身，梅为报春第一花。兔配梅，寓「玉兔迎春」——生肖守岁、寒梅报春，把新年剪进红纸。',
    tagline: '玉兔守岁 · 寒梅报春，一起迎新。',
    evidence: 'oral-tradition',
    sourceLabel: '中国非物质文化遗产网',
    sourceUrl: IH_CHINA,
  },
  {
    id: 'fu-lu-zhao-cai',
    phrase: '福禄招财',
    motifIds: ['gourd', 'coin'],
    principle:
      '葫芦谐音「福禄」，古钱象征财富，两者相合即「福禄招财」。葫芦口小肚大能「收」，与钱同剪，寄望聚财纳福。',
    tagline: '葫芦=福禄 · 钱招财，聚财又纳福。',
    evidence: 'oral-tradition',
    sourceLabel: '中国非物质文化遗产网',
    sourceUrl: IH_CHINA,
  },
];

export const COMBO_MAP: Record<string, RebusCombo> = Object.fromEntries(
  JIANZHI_COMBOS.map((c) => [c.id, c]),
);

export function getCombo(id: string): RebusCombo | undefined {
  return COMBO_MAP[id];
}
