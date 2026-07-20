import type { CulturePage } from './types.ts';

const DATE = '2026-07-20';
const GAME = {
  gameHref: '/games/jianzhi/',
  gameName: '纸上生花:中国剪纸',
} as const;

const SOURCES = [
  { name: '中国非物质文化遗产网', href: 'https://www.ihchina.cn/' },
  { name: '中国美术馆', href: 'https://www.namoc.org/' },
  { name: '维基百科:剪纸', href: 'https://zh.wikipedia.org/wiki/%E5%89%AA%E7%BA%B8' },
] as const;

const sharedFaq = [
  {
    question: '中国剪纸是什么?',
    answer:
      '剪纸是以剪刀或刻刀在纸上镂空造型的民间艺术。纸普及后广泛用于窗花、喜花、节庆装饰等,并发展出丰富的吉祥纹样与谐音吉语。',
  },
  {
    question: '什么是「看图说吉话」?',
    answer:
      '把纹样按谐音或象征拼成一句祝福,例如莲谐「连」、鱼谐「余」,合为「连年有余」。这是理解剪纸语义的重要门径。',
  },
  {
    question: '南北剪纸风格一样吗?',
    answer:
      '不一样。常有「南秀北雄」的概括:北方多粗犷大块面,南方多精巧细刻与套色。具体流派远比两分法丰富。',
  },
  {
    question: '游戏里的折剪步骤等于传统工艺全流程吗?',
    answer:
      '不完全等于。本作以「折 → 剪 → 展」帮助理解对称与成型惊喜,是教学化互动;真实工艺在刀具、纸张、刻法与题材上更复杂。',
  },
];

const extraFaq = [
  {
    question: '剪纸一定要用红纸吗?',
    answer:
      '红纸最通行,因为红色在年俗与婚俗中象征喜庆;但剪纸并不局限于红——祭祀、丧葬等场合有用白纸、黄纸的传统,现代创作更是色彩自由。入门练习用普通红纸即可。',
  },
  {
    question: '剪纸和刻纸有什么区别?',
    answer:
      '常见说法是工具不同:剪纸用剪刀,一次一两层,线条灵活;刻纸用刻刀垫蜡盘,一次可刻十几层,适合批量与精细图案。民间常统称剪纸,南方多刻、北方多剪只是粗略印象。',
  },
];

export const JIANZHI_PAGES: CulturePage[] = [
  {
    kind: 'hub',
    hub: 'jianzhi',
    slug: 'jianzhi',
    path: '/culture/jianzhi/',
    title: '中国剪纸入门|窗花、吉语与在线学徒工坊',
    description:
      '从剪纸源流、对称折剪与吉祥纹样入门,理解「看图说吉话」,并在浏览器学徒工坊中体验折剪展读。',
    h1: '中国剪纸入门:从一张红纸到一句吉话',
    keywords: ['中国剪纸', '窗花', '团花', '剪纸入门', '非遗', '看图说吉话'],
    quickAnswer: [
      '剪纸是以剪刀或刻刀在纸上镂空造型的民间艺术,常用于窗花喜花;许多纹样借谐音象征「说」祝福,南北风格差异显著。',
    ],
    sections: [
      {
        id: 'origin',
        title: '纸上镂空的漫长前史',
        paragraphs: [
          '镂空造型早于纸张:在纸普及之前,先民已在金箔、皮革、缣帛上镂花用于装饰。造纸术成熟后,廉价的纸让这门手艺走进千家万户,剪纸才真正「落在纸上」。',
          '出土与传世材料表明,对称折叠等技法很早就服务于装饰与祈愿;各地在节庆、婚嫁、祭祀中发展出多样的用纸习俗,剪纸由此成为覆盖面极广的民间艺术。',
          '2009 年,中国剪纸入选联合国教科文组织人类非物质文化遗产代表作名录——它既是手艺,也是被世界承认的文化表达。',
        ],
      },
      {
        id: 'occasions',
        title: '岁时与礼仪中的剪纸',
        paragraphs: [
          '春节贴窗花,是许多北方家庭最鲜明的年俗记忆;婚嫁贴喜花、剪双喜,是人生礼仪里的红色祝福;生肖、五谷、花鸟题材,则跟着岁时节令轮转。',
          '在潮汕等南方地区,剪纸还常见于祭祀供品装饰与刺绣底样——同一门手艺,在不同地方承担着不同的生活功能。',
        ],
      },
      {
        id: 'language',
        title: '剪纸是一种吉语视觉',
        paragraphs: [
          '单个纹样可美,组合往往才成「话」:蝠与桃、莲与鱼、双喜与鸳鸯,各有通行象征。读剪纸,很大程度是读一套「以形谐音」的民间语言。',
          '游戏把「拼成目标吉语」作为关卡目标,是为了让语义结构可被练习,而非宣称穷尽所有地方暗语——同一纹样在别处,可能还有别的讲法。',
        ],
      },
      {
        id: 'workshop',
        title: '本站学徒工坊怎么玩',
        paragraphs: [
          '「纸上生花」把入门拆成一条学徒路径:先读帖认识题材,再折纸定对称,然后落剪镂空,最后展开展读——每一步都对应真实工艺里的一个关键直觉。',
          '作品集与图鉴会收进你剪过的纹样与拼出的吉语;它们是你个人的练习册,不是工艺水平的认证。想真正练刀功,纸与剪刀永远在等你。',
        ],
      },
    ],
    terms: [
      { name: '窗花', meaning: '贴于窗棂的节庆剪纸,北方年俗常见', evidence: 'oral-tradition' },
      { name: '团花', meaning: '旋转对称的圆形构图纹样', evidence: 'recorded' },
      { name: '看图说吉话', meaning: '以谐音/象征把纹样读成祝福句', evidence: 'oral-tradition' },
      { name: '折剪展读', meaning: '本游戏教学流程:折→剪→展', evidence: 'game-design' },
    ],
    faq: [...sharedFaq, ...extraFaq],
    sources: [...SOURCES],
    relatedPaths: [
      '/culture/jianzhi/fold-and-cut/',
      '/culture/jianzhi/auspicious-motifs/',
      '/games/jianzhi/',
    ],
    ...GAME,
    dateModified: DATE,
    readingMinutes: 6,
    symbol: 'jianzhi',
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
    title: '对称折剪基本法|剪纸入门技法说明',
    description:
      '解释对称折叠如何服务于团花与对鸟等结构,并说明游戏中「折剪展」教学与真实工艺的差别。',
    h1: '对称折剪基本法是什么?',
    keywords: ['剪纸折叠', '对称剪纸', '团花折法', '折剪展'],
    quickAnswer: [
      '对称折剪先折后剪,展开即得镜像或放射对称图形;层数与剪口决定节奏,新手从两折四折练起,游戏流程为教学简化。',
    ],
    sections: [
      {
        id: 'why-fold',
        title: '为什么要先折',
        paragraphs: [
          '折叠让一次剪刻同时作用于多层纸面,天然产生对称,降低「两边画不像」的难度——这是剪纸对新手最友好的一点:对称感是折出来的,不是画出来的。',
          '展开瞬间的完整图形,是剪纸体验中最容易记住的「惊喜点」,也是教学上的高光。游戏里把「展开」做成一个小仪式,正是为了留住这一刻。',
        ],
      },
      {
        id: 'fold-types',
        title: '常见折法与对应题材',
        paragraphs: [
          '两折(对折)得到左右镜像,适合对鸟、对鱼、双喜一类题材;四折、八折得到放射对称,是团花的基础;更多折数则让图案更细密,但纸层变厚、走剪更难。',
          '常见说法里,折纸时讲究「折痕要实、边角要对」,否则展开后图案会歪。新手练习,建议从两折开始,先求完整,再求繁复。',
        ],
      },
      {
        id: 'limits',
        title: '技法边界',
        paragraphs: [
          '阴刻、阳刻、套色、多色拼贴等路线各有体系;入门对称折剪只是大门之一。剪与刻也是两路工具:剪刀灵活,刻刀利于精细与批量。',
          '若你进入真实工坊学习,请以传承人示范的纸张、刀具与安全规范为准——尤其是儿童练习,圆头剪刀与成人陪同是底线。',
        ],
      },
      {
        id: 'in-game',
        title: '游戏中的折剪设计',
        paragraphs: [
          '本作提供单面、对折、四折、团花四种折面,你在折面上落剪,系统按对称几何实时镜像,展开时合成完整窗花。',
          '这是教学化抽象:真实折剪的纸性、厚度与走剪手感无法完全模拟,但「折→剪→展」的思维节奏是一致的。',
        ],
      },
    ],
    faq: [...sharedFaq, ...extraFaq],
    sources: [...SOURCES],
    relatedPaths: ['/culture/jianzhi/', '/culture/jianzhi/auspicious-motifs/', '/games/jianzhi/'],
    ...GAME,
    dateModified: DATE,
    readingMinutes: 5,
    symbol: 'jianzhi',
    howToSteps: [
      { name: '选纸', text: '选用适合折叠的薄而韧的纸。' },
      { name: '定对称', text: '决定两折、四折或更多。' },
      { name: '剪主形', text: '先大胆剪出大结构,再修细节。' },
      { name: '展开修正', text: '展开检查连接点是否断开。' },
    ],
  },
  {
    kind: 'topic',
    hub: 'jianzhi',
    slug: 'auspicious-motifs',
    path: '/culture/jianzhi/auspicious-motifs/',
    title: '吉祥纹样与吉语|莲鱼蝠桃如何成句',
    description:
      '介绍剪纸常见吉祥纹样与谐音象征,说明「看图说吉话」的组合逻辑与证据分层,并链到学徒工坊在线体验。',
    h1: '吉祥纹样与吉语如何读?',
    keywords: ['剪纸吉语', '连年有余', '福寿双全', '剪纸纹样', '谐音'],
    quickAnswer: [
      '纹样靠谐音与象征成句:莲鱼≈连年有余,蝠桃≈福寿双全;组合与场合相连,各地有变体,本站分级标注证据。',
    ],
    sections: [
      {
        id: 'combo',
        title: '从单纹到成句',
        paragraphs: [
          '学习时先记高频部件,再练组合:部件像字,组合像词组。莲、鱼、蝠、桃、喜、梅、鹊,是这套视觉语言里最高频的「字」。',
          '游戏关卡以目标吉语驱动收集与拼合,是为了让语义结构可被反复练习——拼出「连年有余」的那一刻,你其实已经会读一门方言。',
        ],
      },
      {
        id: 'homophone',
        title: '谐音的规律与边界',
        paragraphs: [
          '谐音取的是普通话或方言里的近音:蝠谐「福」、鱼谐「余」、莲谐「连」、鸡谐「吉」。象征则取自物性:桃表长寿、鸳鸯表和美、牡丹表富贵。',
          '要注意的是,谐音因方言而异:在某一地讲得通的吉语,换个方言区可能并不谐音。通行的几条吉语是全国性的「最大公约数」,地方变体远比列表丰富。',
        ],
      },
      {
        id: 'festival',
        title: '节庆与人生礼仪',
        paragraphs: [
          '窗花多在春节更新,喜花服务婚嫁,生肖题材对应岁时。同一句吉语,在春节与婚礼上的载体、配色与贴法都可能不同。',
          '阅读实物时要连同场合一起看:一张「连年有余」贴在厨房窗上,与贴在婚房床头,讲的是同一个愿望在不同生活场景里的样子。',
        ],
      },
      {
        id: 'in-game',
        title: '游戏中的吉语拼合',
        paragraphs: [
          '游戏把「凑齐目标纹样 → 展开自动识别吉语」作为正向反馈:你在折面上组合莲与鱼,展开后系统读出「连年有余」并收进图鉴。',
          '图鉴里每条吉语都标注了证据层级:通行的谐音组合标为口头传统,为关卡设计的组合标为游戏演绎——好玩,也要明白。',
        ],
      },
    ],
    terms: [
      { name: '莲 + 鱼', meaning: '连年有余(谐音)', evidence: 'oral-tradition' },
      { name: '蝠 + 桃', meaning: '福寿双全(谐音/象征)', evidence: 'oral-tradition' },
      { name: '囍', meaning: '双喜,婚嫁高频', evidence: 'recorded' },
      { name: '梅 + 鹊', meaning: '喜上眉梢(谐音/象征)', evidence: 'oral-tradition' },
    ],
    faq: [...sharedFaq, ...extraFaq],
    sources: [...SOURCES],
    relatedPaths: ['/culture/jianzhi/', '/culture/jianzhi/fold-and-cut/', '/games/jianzhi/'],
    ...GAME,
    dateModified: DATE,
    readingMinutes: 5,
    symbol: 'jianzhi',
  },
];
