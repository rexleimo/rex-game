import type { CulturePage } from './types.ts';

const DATE = '2026-07-20';
const GAME = {
  gameHref: '/games/shantou-jiaobei/',
  gameName: '潮汕圣杯占卜',
} as const;

const SOURCES = [
  {
    name: '国立台湾历史博物馆典藏：筊杯',
    href: 'https://collections.nmth.gov.tw/CollectionContent.aspx?a=132&rno=2006.003.0191.0001',
  },
  {
    name: '教育百科：掷筊',
    href: 'https://pedia.cloud.edu.tw/Entry/Detail/?title=%E6%93%B2%E7%AD%8A',
  },
  {
    name: '国家文化记忆库：掷筊相关文化记录',
    href: 'https://tcmb.culture.tw/zh-tw/detail?id=247158&indexCode=Culture_Place',
  },
] as const;

const sharedFaq = [
  {
    question: '潮汕掷筊、跋杯和掷杯是一回事吗？',
    answer:
      '它们通常都指向用一对筊杯请示的民俗实践，但不同地区、庙宇和家庭的称呼、礼序与判读方式可能不同。本文以潮汕常见说法作文化介绍，不把地方差异简化成唯一标准。',
  },
  {
    question: '圣杯、阴杯、笑杯分别是什么意思？',
    answer:
      '常见解释是：一平一凸为圣杯，多被理解为允准或肯定；两面皆凸为阴杯，多被理解为否定或时机未到；两面皆平为笑杯，多被理解为问题不清、神意未定或带有笑意。具体解释应尊重当地传统。',
  },
  {
    question: '为什么在线体验要连续掷三次？',
    answer:
      '三次投掷是本游戏用来形成节奏与综合结果的互动设计，不代表所有现实仪式都必须如此。现实中的次数、追问方式和有效判定会随场合及传承而变化。',
  },
  {
    question: '使用摄像头是必须的吗？',
    answer:
      '不是。摄像头只用于识别抬手与落手动作，画面在本地浏览器中处理；你也可以关闭摄像头，直接点击按钮完成投掷。',
  },
  {
    question: '在线筊杯结果可以替我做重要决定吗？',
    answer:
      '不建议。本页面是文化展示与互动体验，不构成宗教、医疗、法律、财务或人生决策建议。涉及重要选择时，请结合事实、专业意见与自己的判断。',
  },
];

export const JIAOBEI_PAGES: CulturePage[] = [
  {
    kind: 'hub',
    hub: 'jiaobei',
    slug: 'jiaobei',
    path: '/culture/jiaobei/',
    title: '潮汕掷筊（跋杯）是什么｜文化说明与在线体验',
    description:
      '了解潮汕掷筊、跋杯的常见说法与杯象含义，区分地区差异与游戏设计，并在浏览器中体验电影感 3D 筊杯投掷。',
    h1: '潮汕掷筊（跋杯）是什么？',
    keywords: ['潮汕掷筊', '跋杯', '掷杯', '筊杯', '圣杯', '阴杯', '笑杯', '民俗文化'],
    quickAnswer: [
      '潮汕民间常把掷筊称为「跋杯」或「掷杯」，是用一对筊杯请示意愿的民俗实践。',
      '一对筊杯各有红漆凸面与木质平面；两杯落地后，一平一凸、双凸、双平分别形成圣杯、阴杯与笑杯。',
      '不同庙宇、地区和家庭的称法与礼序可能不同，本站仅作文化互动展示，不替代真实仪式。',
      '你可在本站 3D 场景中完成三次在线投掷，摄像头可选，画面仅在本地处理。',
    ],
    sections: [
      {
        id: 'names',
        title: '称法因时因地而异',
        paragraphs: [
          '「掷筊」「跋杯」「掷杯」在口语与文献中常指向同一类实践：以一对两面形制不同的杯具落地，观察正反组合。',
          '本站以潮汕地区常见说法为线索介绍，并明确标注：名称、次数与判读礼序会随场合变化，不宜写成唯一标准。',
        ],
      },
      {
        id: 'form',
        title: '筊杯形制：一凸一平',
        paragraphs: [
          '常见筊杯一面髹红漆呈凸起，一面为木质平面。落地后两杯各自朝上的面，组成三种最常被讨论的杯象。',
          '博物馆藏品与地方记录显示，材质、大小与纹饰并不统一；游戏中的模型是为可读性与物理表现做的交互化呈现。',
        ],
      },
      {
        id: 'play',
        title: '本站在线体验如何设计',
        paragraphs: [
          '游戏采用连续三掷形成节奏与综合说明，属于「本游戏设计」，不等于所有现实仪式都必须三掷。',
          '可选手势识别仅用于抬手与落手反馈；你也可直接点击按钮完成投掷。结果仅供文化体验，请勿作重大决策依据。',
        ],
      },
    ],
    terms: [
      { name: '圣杯', meaning: '一平一凸；常见解释为允准与肯定', evidence: 'oral-tradition' },
      { name: '阴杯', meaning: '两面皆凸；常见解释为否定或时机未到', evidence: 'oral-tradition' },
      { name: '笑杯', meaning: '两面皆平；常见解释为问题未明或带有笑意', evidence: 'oral-tradition' },
      { name: '三掷节奏', meaning: '本游戏用于综合体验的互动设计', evidence: 'game-design' },
    ],
    faq: sharedFaq,
    sources: [...SOURCES],
    relatedPaths: [
      '/culture/jiaobei/sheng-yin-xiao/',
      '/culture/jiaobei/how-to-read/',
      '/culture/jiaobei/online-vs-ritual/',
      '/games/shantou-jiaobei/',
    ],
    ...GAME,
    dateModified: DATE,
    howToSteps: [
      { name: '静心默念', text: '在心中整理一个清楚、具体的问题。' },
      { name: '选择方式', text: '使用摄像头手势，或直接点击投掷按钮。' },
      { name: '完成三掷', text: '观察两枚筊杯每一次落地后的平面与凸面组合。' },
      { name: '阅读结果', text: '结合三次杯象查看本次互动的综合说明。' },
    ],
  },
  {
    kind: 'topic',
    hub: 'jiaobei',
    slug: 'sheng-yin-xiao',
    path: '/culture/jiaobei/sheng-yin-xiao/',
    title: '圣杯、阴杯、笑杯分别是什么意思｜潮汕掷筊杯象',
    description:
      '用一平一凸、双凸、双平说明圣杯、阴杯与笑杯的常见解释，并提醒地区差异与游戏设计边界。',
    h1: '圣杯、阴杯、笑杯分别是什么意思？',
    keywords: ['圣杯', '阴杯', '笑杯', '杯象', '掷筊含义', '跋杯'],
    quickAnswer: [
      '圣杯通常指一平一凸，民间常见解释为允准或肯定。',
      '阴杯通常指两面皆凸，常见解释为否定或时机未到。',
      '笑杯通常指两面皆平，常见解释为问题不清、神意未定或带有笑意。',
      '上述为常见说法；庙宇与家庭传统可能不同，本站不做唯一裁决。',
    ],
    sections: [
      {
        id: 'three-signs',
        title: '三种杯象怎么记',
        paragraphs: [
          '记住「凸」与「平」的组合比死记名称更稳：一平一凸、双凸、双平分别对应圣、阴、笑的常见称法。',
          '有的场合会对连续结果、追问方式另有约定；阅读任何「标准答案」表时，都要问一句：这是谁的传统？',
        ],
      },
      {
        id: 'caution',
        title: '解释的边界',
        paragraphs: [
          '把杯象写成绝对吉凶或人生指令，会偏离文化介绍的本意。',
          '本站在结果页提供的是可读的文化说明与体验反馈，并附娱乐声明。',
        ],
      },
    ],
    terms: [
      { name: '圣杯', meaning: '一平一凸 · 允准/肯定（常见说法）', evidence: 'oral-tradition' },
      { name: '阴杯', meaning: '双凸 · 否定/未到时（常见说法）', evidence: 'oral-tradition' },
      { name: '笑杯', meaning: '双平 · 未明/笑意（常见说法）', evidence: 'oral-tradition' },
    ],
    faq: sharedFaq,
    sources: [...SOURCES],
    relatedPaths: ['/culture/jiaobei/', '/culture/jiaobei/how-to-read/', '/games/shantou-jiaobei/'],
    ...GAME,
    dateModified: DATE,
  },
  {
    kind: 'topic',
    hub: 'jiaobei',
    slug: 'how-to-read',
    path: '/culture/jiaobei/how-to-read/',
    title: '掷筊怎么看正反面与杯象｜读杯入门',
    description:
      '从筊杯凸面与平面出发，说明如何观察落地组合，并区分常见说法与本游戏的可读性设计。',
    h1: '掷筊怎么看正反面与杯象？',
    keywords: ['掷筊怎么看', '筊杯正反', '读杯', '杯象判读'],
    quickAnswer: [
      '先分清每一枚筊杯的凸面（常髹红）与平面（木质）。',
      '两杯都落地后，数「朝上有几枚平面、几枚凸面」，再对照圣/阴/笑的常见组合。',
      '若杯沿卡住、叠压或未静定，现实场合可能重掷；规则因场而异。',
      '本游戏用物理模拟与结果判定服务可读体验，不冒充某一庙宇的完整礼序。',
    ],
    sections: [
      {
        id: 'observe',
        title: '观察顺序',
        paragraphs: [
          '建议顺序：确认两杯均已静止 → 分别看每杯朝上面 → 组合判断 → 再谈含义。',
          '光线、桌面材质与杯形都会影响「一眼可读性」；线上 3D 场景为清晰展示做了材质与对比强化，属于交互呈现。',
        ],
      },
      {
        id: 'edge-cases',
        title: '边缘情况',
        paragraphs: [
          '现实中若出现立杯、叠杯等少见状态，处理方式随地方传统而定，不宜用单一网络说法覆盖。',
          '本游戏对边缘姿态有辅助与归类策略，目标是可玩与可解释，不是复刻所有仪轨细节。',
        ],
      },
    ],
    faq: sharedFaq,
    sources: [...SOURCES],
    relatedPaths: [
      '/culture/jiaobei/',
      '/culture/jiaobei/sheng-yin-xiao/',
      '/culture/jiaobei/online-vs-ritual/',
      '/games/shantou-jiaobei/',
    ],
    ...GAME,
    dateModified: DATE,
    howToSteps: [
      { name: '辨面', text: '认出每枚筊杯的凸面与平面。' },
      { name: '待静', text: '等两杯都静止后再读。' },
      { name: '组合', text: '记录一平一凸、双凸或双平。' },
      { name: '对照', text: '用常见说法理解圣、阴、笑，并保留地区差异空间。' },
    ],
  },
  {
    kind: 'topic',
    hub: 'jiaobei',
    slug: 'online-vs-ritual',
    path: '/culture/jiaobei/online-vs-ritual/',
    title: '在线掷筊与真实仪式的区别｜文化体验说明',
    description:
      '说明浏览器掷筊体验与庙宇、家庭仪式的差异：礼序、场域、传承与决策边界，避免把游戏当成仪式替代。',
    h1: '在线掷筊与真实仪式有什么区别？',
    keywords: ['在线掷筊', '真实仪式', '跋杯区别', '文化体验'],
    quickAnswer: [
      '真实仪式发生在具体场域与人际关系中，常有香火、祝祷、礼序与地方传承。',
      '在线体验强调可读、可玩与文化说明，是展示与互动，不是完整仪轨复刻。',
      '本游戏的三掷节奏、镜头与结果文案属于游戏设计层。',
      '重要决定请勿依赖任何在线杯象；请回归事实、专业意见与自身判断。',
    ],
    sections: [
      {
        id: 'context',
        title: '场域与关系',
        paragraphs: [
          '庙宇或家庭中的请示，往往嵌在节庆、还愿、问事传统与人的信任关系里，这些无法被网页一键替代。',
          '线上页面可以传播「形制与杯象常识」，却带不走现场的气味、声音与礼生引导。',
        ],
      },
      {
        id: 'design',
        title: '本站如何自处',
        paragraphs: [
          '我们把摄像头处理限制在本地浏览器，把娱乐声明写进页面，并把资料来源列出供核对。',
          '若你因兴趣想进一步了解地方传统，请向当地可信任的文化持有者请教，而不是只依赖游戏结果。',
        ],
      },
    ],
    faq: sharedFaq,
    sources: [...SOURCES],
    relatedPaths: ['/culture/jiaobei/', '/culture/jiaobei/how-to-read/', '/games/shantou-jiaobei/', '/about/'],
    ...GAME,
    dateModified: DATE,
  },
];
