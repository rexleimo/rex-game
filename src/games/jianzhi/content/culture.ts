import type { JianzhiCultureEntry } from '../core/types';

const IH_CHINA = 'https://www.ihchina.cn/';

/** 文化档案：随功课/委托完成解锁，呈现于「文化档案」。 */
export const JIANZHI_CULTURE_ENTRIES: JianzhiCultureEntry[] = [
  {
    id: 'origin',
    title: '剪纸从何而来',
    region: '中原 · 全国',
    category: 'history',
    summary: '剪纸前身是早于纸张的镂空艺术，蔡伦造纸后才有了纸上的剪刻。',
    detail:
      '剪纸的源头可追溯至西周「剪桐封弟」的传说与战国金银箔镂空。东汉蔡伦改进造纸术后，真正的纸本剪纸才流行。新疆吐鲁番阿斯塔那古墓出土的北朝对马、对猴团花，是现存最早的剪纸实物，证明当时对称折叠技法已成熟。',
    evidence: 'recorded',
    sourceLabel: '中国非物质文化遗产网',
    sourceUrl: IH_CHINA,
  },
  {
    id: 'north-south',
    title: '南秀北雄',
    region: '陕北 / 扬州',
    category: 'regional',
    summary: '北方粗犷大块面，南方精巧多层套色，风格与水土相连。',
    detail:
      '剪纸有「南秀北雄」之说。黄土高原上的陕北窗花线条粗犷、造型夸张，多护童驱邪的抓髻娃娃；江南水乡的扬州、南京细刻则纤巧秀丽，善用套色与戏曲人物。同一门手艺，因地域而生出两种气质。',
    evidence: 'recorded',
    sourceLabel: '中国非物质文化遗产网',
    sourceUrl: IH_CHINA,
  },
  {
    id: 'window-flower',
    title: '窗花与春节',
    region: '北方民居',
    category: 'festival',
    summary: '新春贴窗花，是辞旧迎新里最温暖的仪式。',
    detail:
      '春节糊新窗、贴窗花，是北方延续千年的习俗。红纸剪出的福字、鱼、花鸟贴在窗棂上，既装点院落，也把祈福纳祥的心愿交给新的一年。窗花多为对称折叠剪出，展开瞬间的惊喜，是许多人童年的年味。',
    evidence: 'oral-tradition',
    sourceLabel: '中国非物质文化遗产网',
    sourceUrl: IH_CHINA,
  },
  {
    id: 'wedding-flower',
    title: '喜花与婚俗',
    region: '江南婚嫁',
    category: 'festival',
    summary: '囍字、鸳鸯、牡丹，是婚嫁喜花里的固定班底。',
    detail:
      '明清以来，婚嫁必用喜花：剪囍字贴于箱笼门窗，剪牡丹喻富贵，剪鸳鸯、蝴蝶喻恩爱。喜花不只是装饰，更是一套关于「成双成对、富贵绵长」的视觉祝福语。',
    evidence: 'recorded',
    sourceLabel: '中国非物质文化遗产网',
    sourceUrl: IH_CHINA,
  },
  {
    id: 'rosette-silk',
    title: '团花与丝路',
    region: '敦煌 · 西域',
    category: 'history',
    summary: '旋转对称的团花，藏着丝路上的多元交融。',
    detail:
      '团花以折叠旋转剪出，呈完美的放射对称，常饰于器物中心。敦煌壁画与北朝丝路实物里都能见到这类纹样，融合了中原、西域与佛教艺术的元素，是文化交流的剪影。',
    evidence: 'recorded',
    sourceLabel: '中国非物质文化遗产网',
    sourceUrl: IH_CHINA,
  },
  {
    id: 'zodiac',
    title: '生肖剪纸',
    region: '全国 · 年俗',
    category: 'festival',
    summary: '十二生肖入剪，把时序与祈福剪进每一年。',
    detail:
      '生肖文化自汉代系统化，春节剪当年生肖是普遍习俗。本命年的动物被剪得格外醒目，配上云纹、花草，既应景又纳福。一套生肖剪完，便是一部可握在手中的岁时记。',
    evidence: 'oral-tradition',
    sourceLabel: '中国非物质文化遗产网',
    sourceUrl: IH_CHINA,
  },
  {
    id: 'heritage',
    title: '活态的非遗',
    region: '全国',
    category: 'heritage',
    summary: '2006 年列入国家级非遗，2009 年入选人类非遗代表作。',
    detail:
      '中国剪纸于 2006 年列入第一批国家级非物质文化遗产名录，2009 年作为「中国剪纸」入选联合国教科文组织人类非物质文化遗产代表作名录。今天，它与游戏、设计、展览相融，在年轻人手里继续生长。',
    evidence: 'recorded',
    sourceLabel: '中国非物质文化遗产网',
    sourceUrl: IH_CHINA,
  },
];
