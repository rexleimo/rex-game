import type { CulturePage } from './types.ts';

const DATE = '2026-07-20';
const GAME = {
  gameHref: '/games/chaoshan-yingge/',
  gameName: '合槌成阵：潮汕英歌',
} as const;

const SOURCES = [
  { name: '中国非物质文化遗产网', href: 'https://www.ihchina.cn/' },
  { name: '广东省文化和旅游厅', href: 'https://whly.gd.gov.cn/' },
] as const;

const sharedFaq = [
  {
    question: '潮汕英歌是什么？',
    answer:
      '英歌是流行于广东潮汕等地的群体表演艺术，以锣鼓节奏、击槌动作与队形变化形成强烈气势。各地队伍在速度、人物与画法上存在差异。',
  },
  {
    question: '游戏里的鼓点是真实演出谱吗？',
    answer:
      '不是。本作 BPM 与谱面是交互化教学设计，帮助识别重拍与合槌，不冒充某一队伍的完整演出谱。',
  },
  {
    question: '脸谱是否都对应梁山好汉？',
    answer:
      '民间常有英雄叙事与角色扮相，但各地人物、色彩与画法并不统一。本站将相关说法标为流传/资料记载，不写成唯一历史起源。',
  },
  {
    question: '英歌只是「打架表演」吗？',
    answer:
      '不是。英歌强调合槌、队形与社区节庆中的群体协作。游戏把个人准度与全队整齐度分开呈现，正是为了贴近「成队而行」的气质。',
  },
];

export const YINGGE_PAGES: CulturePage[] = [
  {
    kind: 'hub',
    hub: 'yingge',
    slug: 'yingge',
    path: '/culture/yingge/',
    title: '潮汕英歌是什么｜合槌、锣鼓与在线节奏体验',
    description:
      '认识潮汕英歌的群体表演特质、锣鼓与队形，了解地方差异与游戏化演绎边界，并进入浏览器节奏互动。',
    h1: '潮汕英歌是什么？',
    keywords: ['潮汕英歌', '英歌舞', '锣鼓', '队形', '非遗', '潮阳', '普宁'],
    quickAnswer: [
      '英歌是潮汕地区重要的群体表演形式，以锣鼓组织情绪，以击槌与队形变化形成气势。',
      '它强调「合槌而舞、成队而行」，不是个人炫技独舞。',
      '各地在速度风格、脸谱人物与演出结构上存在差异，不宜用单一版本概括全部传统。',
      '本站游戏用节奏关卡帮助感受重拍与协作，文化说明与玩法设计分层标注。',
    ],
    sections: [
      {
        id: 'collective',
        title: '合槌而舞，成队而行',
        paragraphs: [
          '英歌的视觉冲击来自整齐与力量：个人动作准，还要与队伍同呼吸。',
          '社区队伍、节庆巡游与代际训练，使英歌成为仍在发生的活态实践，而非博物馆里的静态名词。',
        ],
      },
      {
        id: 'game',
        title: '本站如何「可玩」',
        paragraphs: [
          '游戏将个人击槌准确度与全队整齐度分开反馈，并设置由慢到快的章节，服务学习曲线。',
          '音频与动作若未获授权，不会伪装成某支真实队伍的录谱；文化档案条目会标注证据等级。',
        ],
      },
    ],
    terms: [
      { name: '合槌', meaning: '击槌动作与同伴、鼓点对齐', evidence: 'recorded' },
      { name: '变阵', meaning: '队形与走位变化，强化整体气势', evidence: 'recorded' },
      { name: '交互 BPM', meaning: '本游戏教学用速度，非完整演出谱', evidence: 'game-design' },
    ],
    faq: sharedFaq,
    sources: [...SOURCES],
    relatedPaths: [
      '/culture/yingge/rhythm-and-formation/',
      '/culture/yingge/faces-and-roles/',
      '/games/chaoshan-yingge/',
    ],
    ...GAME,
    dateModified: DATE,
    howToSteps: [
      { name: '听鼓', text: '先抓住重拍与稳定节奏。' },
      { name: '落槌', text: '按提示完成左右击槌。' },
      { name: '变阵', text: '在节奏中完成队形相关提示。' },
      { name: '成队', text: '兼顾个人准度与整体整齐感。' },
    ],
  },
  {
    kind: 'topic',
    hub: 'yingge',
    slug: 'rhythm-and-formation',
    path: '/culture/yingge/rhythm-and-formation/',
    title: '英歌的鼓点节奏与队形｜先听锣鼓再看槌步',
    description:
      '说明英歌中锣鼓如何组织动作与情绪，队形与合槌为何重要，并区分真实演出与游戏教学谱。',
    h1: '英歌的鼓点节奏与队形如何理解？',
    keywords: ['英歌鼓点', '英歌队形', '锣鼓', '合槌', 'BPM'],
    quickAnswer: [
      '锣鼓既给节拍，也推动队伍情绪与段落转换。',
      '槌步与变阵要落在可被共同听见的时间格上，才有「成阵」之感。',
      '不同地区有快、中、慢等气韵，不能用一套速度代表全部英歌。',
      '本游戏章节 BPM 是教学分层，服务上手，不冒充某次真实会演谱面。',
    ],
    sections: [
      {
        id: 'drum',
        title: '先听锣鼓，再看槌步',
        paragraphs: [
          '入门时优先练「听见重拍」，再谈花式动作。失去共同节拍，队形再复杂也容易散。',
          '巡游与舞台场景对耐力、转身与连续段落的要求不同，游戏用关卡长度做简化模拟。',
        ],
      },
      {
        id: 'formation',
        title: '一人准，众人齐',
        paragraphs: [
          '队形变化让观者看见整体造型，也要求每一位成员在同一时间完成换位或击打。',
          '评分上把「个人」与「整齐」拆开，是为了让玩家理解英歌的协作属性。',
        ],
      },
    ],
    faq: sharedFaq,
    sources: [...SOURCES],
    relatedPaths: ['/culture/yingge/', '/culture/yingge/faces-and-roles/', '/games/chaoshan-yingge/'],
    ...GAME,
    dateModified: DATE,
  },
  {
    kind: 'topic',
    hub: 'yingge',
    slug: 'faces-and-roles',
    path: '/culture/yingge/faces-and-roles/',
    title: '英歌脸谱与角色表达｜地方差异与流传说法',
    description:
      '介绍英歌脸谱与角色表达的地方性，说明英雄叙事多为流传说法，避免把单一故事写成唯一历史起源，并链到在线节奏体验。',
    h1: '英歌脸谱与角色表达如何理解？',
    keywords: ['英歌脸谱', '英歌角色', '潮阳英歌', '普宁英歌'],
    quickAnswer: [
      '脸谱服务角色识别与气势表达，不是随处可套的通用面具。',
      '潮阳、普宁等地在人物选择、色彩与画法上常有差异。',
      '与梁山等叙事相关的说法多属民间流传，需与可核对资料分开标注。',
      '本站展示经过资料核对的说明，并在游戏中避免把单一故事写成唯一起源。',
    ],
    sections: [
      {
        id: 'local',
        title: '地方版本优先',
        paragraphs: [
          '看到某一套脸谱照片，先问「这是哪支队伍、哪个村落的传统」，再谈象征。',
          '颜色与线条往往和角色性格、出场功能相关，但细节以当地画师与传承为准。',
        ],
      },
      {
        id: 'narrative',
        title: '叙事与证据',
        paragraphs: [
          '民间英雄叙事能增强表演感染力，却不等于经严密考证的唯一史实。',
          '文化页与游戏档案会尽量区分「资料记载 / 口头传统 / 游戏演绎」。',
        ],
      },
    ],
    faq: sharedFaq,
    sources: [...SOURCES],
    relatedPaths: ['/culture/yingge/', '/culture/yingge/rhythm-and-formation/', '/games/chaoshan-yingge/'],
    ...GAME,
    dateModified: DATE,
  },
];
