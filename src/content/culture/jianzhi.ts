import type { CulturePage } from './types.ts';

const DATE = '2026-07-20';
const GAME = {
  gameHref: '/games/jianzhi/',
  gameName: '纸上生花：中国剪纸',
} as const;

const SOURCES = [
  { name: '中国非物质文化遗产网', href: 'https://www.ihchina.cn/' },
] as const;

const sharedFaq = [
  {
    question: '中国剪纸是什么？',
    answer:
      '剪纸是以剪刀或刻刀在纸上镂空造型的民间艺术。纸普及后广泛用于窗花、喜花、节庆装饰等，并发展出丰富的吉祥纹样与谐音吉语。',
  },
  {
    question: '什么是「看图说吉话」？',
    answer:
      '把纹样按谐音或象征拼成一句祝福，例如莲谐「连」、鱼谐「余」，合为「连年有余」。这是理解剪纸语义的重要门径。',
  },
  {
    question: '南北剪纸风格一样吗？',
    answer:
      '不一样。常有「南秀北雄」的概括：北方多粗犷大块面，南方多精巧细刻与套色。具体流派远比两分法丰富。',
  },
  {
    question: '游戏里的折剪步骤等于传统工艺全流程吗？',
    answer:
      '不完全等于。本作以「折 → 剪 → 展」帮助理解对称与成型惊喜，是教学化互动；真实工艺在刀具、纸张、刻法与题材上更复杂。',
  },
];

export const JIANZHI_PAGES: CulturePage[] = [
  {
    kind: 'hub',
    hub: 'jianzhi',
    slug: 'jianzhi',
    path: '/culture/jianzhi/',
    title: '中国剪纸入门｜窗花、吉语与在线学徒工坊',
    description:
      '从剪纸源流、对称折剪与吉祥纹样入门，理解「看图说吉话」，并在浏览器学徒工坊中体验折剪展读。',
    h1: '中国剪纸入门：从一张红纸到一句吉话',
    keywords: ['中国剪纸', '窗花', '团花', '剪纸入门', '非遗', '看图说吉话'],
    quickAnswer: [
      '剪纸用镂空在纸上造形，常见于春节窗花、婚嫁喜花与节庆装饰。',
      '许多纹样靠谐音与象征「说」出祝福，例如莲鱼→连年有余。',
      '南北风格、地方题材差异显著；入门先抓对称折剪与常见吉语即可。',
      '本站「学徒工坊」用读帖、折剪、展读与拼纹样，帮助把纹样读成句子。',
    ],
    sections: [
      {
        id: 'origin',
        title: '纸上镂空的漫长前史',
        paragraphs: [
          '镂空造型早于纸张；造纸普及后，剪纸才真正「落在纸上」。',
          '出土与传世材料表明，对称折叠等技法很早就服务于装饰与祈愿，并在丝路与各地生活中演化出多样面貌。',
        ],
      },
      {
        id: 'language',
        title: '剪纸是一种吉语视觉',
        paragraphs: [
          '单个纹样可美，组合往往才成「话」：蝠与桃、莲与鱼、双喜与鸳鸯，各有通行象征。',
          '游戏把「拼成目标吉语」作为关卡目标，是为了让语义结构可被练习，而非宣称穷尽所有地方暗语。',
        ],
      },
    ],
    terms: [
      { name: '窗花', meaning: '贴于窗棂的节庆剪纸，北方年俗常见', evidence: 'oral-tradition' },
      { name: '团花', meaning: '旋转对称的圆形构图纹样', evidence: 'recorded' },
      { name: '看图说吉话', meaning: '以谐音/象征把纹样读成祝福句', evidence: 'oral-tradition' },
      { name: '折剪展读', meaning: '本游戏教学流程：折→剪→展', evidence: 'game-design' },
    ],
    faq: sharedFaq,
    sources: [...SOURCES],
    relatedPaths: [
      '/culture/jianzhi/fold-and-cut/',
      '/culture/jianzhi/auspicious-motifs/',
      '/games/jianzhi/',
    ],
    ...GAME,
    dateModified: DATE,
    howToSteps: [
      { name: '读帖', text: '先了解题材与吉语目标。' },
      { name: '折叠', text: '按对称需要折叠纸面。' },
      { name: '剪刻', text: '镂空出纹样结构。' },
      { name: '展开', text: '展开读对称与成句关系。' },
    ],
  },
  {
    kind: 'topic',
    hub: 'jianzhi',
    slug: 'fold-and-cut',
    path: '/culture/jianzhi/fold-and-cut/',
    title: '对称折剪基本法｜剪纸入门技法说明',
    description:
      '解释对称折叠如何服务于团花与对鸟等结构，并说明游戏中「折剪展」教学与真实工艺的差别。',
    h1: '对称折剪基本法是什么？',
    keywords: ['剪纸折叠', '对称剪纸', '团花折法', '折剪展'],
    quickAnswer: [
      '对称折剪先折叠再剪，展开后得到镜像或放射对称图形。',
      '它对窗花、团花、对马对猴一类题材特别关键。',
      '折叠层数与剪口位置决定最终节奏，新手可从两折、四折练起。',
      '本游戏把流程简化为可交互步骤，帮助建立直觉，不等于完整刀法体系。',
    ],
    sections: [
      {
        id: 'why-fold',
        title: '为什么要先折',
        paragraphs: [
          '折叠让一次剪刻同时作用于多层纸面，天然产生对称，降低「两边画不像」的难度。',
          '展开瞬间的完整图形，是剪纸体验中最容易记住的「惊喜点」，也是教学上的高光。',
        ],
      },
      {
        id: 'limits',
        title: '技法边界',
        paragraphs: [
          '阴刻、阳刻、套色、多色拼贴等路线各有体系；入门对称折剪只是大门之一。',
          '若你进入真实工坊学习，请以传承人示范的纸张、刀具与安全规范为准。',
        ],
      },
    ],
    faq: sharedFaq,
    sources: [...SOURCES],
    relatedPaths: ['/culture/jianzhi/', '/culture/jianzhi/auspicious-motifs/', '/games/jianzhi/'],
    ...GAME,
    dateModified: DATE,
    howToSteps: [
      { name: '选纸', text: '选用适合折叠的薄而韧的纸。' },
      { name: '定对称', text: '决定两折、四折或更多。' },
      { name: '剪主形', text: '先大胆剪出大结构，再修细节。' },
      { name: '展开修正', text: '展开检查连接点是否断开。' },
    ],
  },
  {
    kind: 'topic',
    hub: 'jianzhi',
    slug: 'auspicious-motifs',
    path: '/culture/jianzhi/auspicious-motifs/',
    title: '吉祥纹样与吉语｜莲鱼蝠桃如何成句',
    description:
      '介绍剪纸常见吉祥纹样与谐音象征，说明「看图说吉话」的组合逻辑与证据分层，并链到学徒工坊在线体验。',
    h1: '吉祥纹样与吉语如何读？',
    keywords: ['剪纸吉语', '连年有余', '福寿双全', '剪纸纹样', '谐音'],
    quickAnswer: [
      '许多剪纸纹样通过谐音或象征表达祝福，而不是写字说明。',
      '例如莲≈连、鱼≈余，合为连年有余；蝠≈福、桃≈寿，合为福寿双全。',
      '囍、鸳鸯、牡丹等在婚俗与节庆中高频出现，含义相对通行但仍有地方变体。',
      '本站对组合原理分级标注资料记载、民间流传与游戏化演绎。',
    ],
    sections: [
      {
        id: 'combo',
        title: '从单纹到成句',
        paragraphs: [
          '学习时先记高频部件，再练组合：部件像字，组合像词组。',
          '游戏关卡以目标吉语驱动收集与拼合，是为了让语义结构可被反复练习。',
        ],
      },
      {
        id: 'festival',
        title: '节庆与人生礼仪',
        paragraphs: [
          '窗花多在春节更新，喜花服务婚嫁，生肖题材对应岁时。',
          '同一吉语在不同礼仪中的载体与配色可能变化，阅读实物时要连同场合一起看。',
        ],
      },
    ],
    terms: [
      { name: '莲 + 鱼', meaning: '连年有余（谐音）', evidence: 'oral-tradition' },
      { name: '蝠 + 桃', meaning: '福寿双全（谐音/象征）', evidence: 'oral-tradition' },
      { name: '囍', meaning: '双喜，婚嫁高频', evidence: 'recorded' },
    ],
    faq: sharedFaq,
    sources: [...SOURCES],
    relatedPaths: ['/culture/jianzhi/', '/culture/jianzhi/fold-and-cut/', '/games/jianzhi/'],
    ...GAME,
    dateModified: DATE,
  },
];
