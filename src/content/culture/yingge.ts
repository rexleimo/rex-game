import type { CulturePage } from './types.ts';

const DATE = '2026-07-20';
const GAME = {
  gameHref: '/games/chaoshan-yingge/',
  gameName: '合槌成阵:潮汕英歌',
} as const;

const SOURCES = [
  { name: '中国非物质文化遗产网', href: 'https://www.ihchina.cn/' },
  { name: '广东省文化和旅游厅', href: 'https://whly.gd.gov.cn/' },
  { name: '中华人民共和国文化和旅游部', href: 'https://www.mct.gov.cn/' },
  { name: '维基百科:英歌舞', href: 'https://zh.wikipedia.org/wiki/%E8%8B%B1%E6%AD%8C%E8%88%9E' },
] as const;

const sharedFaq = [
  {
    question: '潮汕英歌是什么?',
    answer:
      '英歌是流行于广东潮汕等地的群体表演艺术,以锣鼓节奏、击槌动作与队形变化形成强烈气势。各地队伍在速度、人物与画法上存在差异。',
  },
  {
    question: '游戏里的鼓点是真实演出谱吗?',
    answer:
      '不是。本作 BPM 与谱面是交互化教学设计,帮助识别重拍与合槌,不冒充某一队伍的完整演出谱。',
  },
  {
    question: '脸谱是否都对应梁山好汉?',
    answer:
      '民间常有英雄叙事与角色扮相,但各地人物、色彩与画法并不统一。本站将相关说法标为流传/资料记载,不写成唯一历史起源。',
  },
  {
    question: '英歌只是「打架表演」吗?',
    answer:
      '不是。英歌强调合槌、队形与社区节庆中的群体协作。游戏把个人准度与全队整齐度分开呈现,正是为了贴近「成队而行」的气质。',
  },
];

const extraFaq = [
  {
    question: '英歌一般在什么场合能看到?',
    answer:
      '常见场合是节庆巡游与社区庆典,尤以春节、元宵及地方神诞期间最为集中;近年来也频繁出现在非遗展演与舞台演出中。具体时间以各地村社与文旅活动安排为准。',
  },
  {
    question: '英歌的槌是什么形制?',
    answer:
      '常见说法是成对的短木槌,便于双手对击与舞花;长度、粗细与装饰因队伍而异。游戏中的槌形为可读性做了风格化处理,不代表某一队伍的定制形制。',
  },
];

export const YINGGE_PAGES: CulturePage[] = [
  {
    kind: 'hub',
    hub: 'yingge',
    slug: 'yingge',
    path: '/culture/yingge/',
    title: '潮汕英歌是什么|合槌、锣鼓与在线节奏体验',
    description:
      '认识潮汕英歌的群体表演特质、锣鼓与队形,了解地方差异与游戏化演绎边界,并进入浏览器节奏互动。',
    h1: '潮汕英歌是什么?',
    keywords: ['潮汕英歌', '英歌舞', '锣鼓', '队形', '非遗', '潮阳', '普宁'],
    quickAnswer: [
      '英歌是流行于潮汕的群体表演艺术:锣鼓组织情绪,击槌与队形变化形成气势,强调合槌而舞、成队而行,各地风格差异显著。',
    ],
    sections: [
      {
        id: 'collective',
        title: '合槌而舞,成队而行',
        paragraphs: [
          '英歌的视觉冲击来自整齐与力量:数十人成队,双槌对击,步伐随锣鼓变换,个人的动作准,还要与队伍同呼吸。一个人再出色,也撑不起一支英歌——这是它区别于个人炫技舞蹈的根本。',
          '社区队伍、节庆巡游与代际训练,使英歌成为仍在发生的活态实践,而非博物馆里的静态名词。许多村社有自己的队伍,农闲时集训,节庆时上街,一代带一代。',
          '因此理解英歌,第一把钥匙不是「这是什么舞」,而是「这是一群人如何成为一体」。槌声齐处,队伍如一人。',
        ],
      },
      {
        id: 'drum-and-pace',
        title: '锣鼓与快慢风韵',
        paragraphs: [
          '锣鼓是英歌的指挥:它给出节拍,也推动段落情绪的起伏。听英歌先看锣鼓点如何组织全场,再看槌步如何落在点上,是入门的正确顺序。',
          '常见说法里,不同地区的英歌有快、中、慢等气韵之分:有的以急促刚猛取胜,有的以沉稳舒展见长。速度背后,是各村社自己的审美与训练传统。',
          '这也意味着,任何单一视频、单一速度都不能代表「英歌全貌」。本站介绍的是通行特征,具体到某支队伍,请以现场为准。',
        ],
      },
      {
        id: 'narrative',
        title: '英雄叙事与脸谱',
        paragraphs: [
          '英歌表演常见英雄扮相与叙事色彩,民间多将之与水浒人物等故事相联系,这也是「中华战舞」称谓流传开来的原因之一。',
          '需要诚实标注的是:这些叙事多属民间流传,各地的人物选择、脸谱画法与解释并不统一。本站把这类说法标为「口头传统」,与可核对的资料分开呈现。',
        ],
      },
      {
        id: 'game',
        title: '本站如何「可玩」',
        paragraphs: [
          '游戏将个人击槌准确度与全队整齐度分开反馈,并设置由慢到快的章节,服务学习曲线:先听鼓,再落槌,后变阵。',
          '音频与动作若未获授权,不会伪装成某支真实队伍的录谱;文化档案条目会标注证据等级(资料记载/口头传统/游戏演绎),让你知道每句话站在哪一层。',
        ],
      },
    ],
    terms: [
      { name: '合槌', meaning: '击槌动作与同伴、鼓点对齐', evidence: 'recorded' },
      { name: '变阵', meaning: '队形与走位变化,强化整体气势', evidence: 'recorded' },
      { name: '锣鼓点', meaning: '组织节拍与段落情绪的打击乐骨架', evidence: 'recorded' },
      { name: '交互 BPM', meaning: '本游戏教学用速度,非完整演出谱', evidence: 'game-design' },
    ],
    faq: [...sharedFaq, ...extraFaq],
    sources: [...SOURCES],
    relatedPaths: [
      '/culture/yingge/rhythm-and-formation/',
      '/culture/yingge/faces-and-roles/',
      '/games/chaoshan-yingge/',
    ],
    ...GAME,
    dateModified: DATE,
    readingMinutes: 6,
    symbol: 'yingge',
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
    title: '英歌的鼓点节奏与队形|先听锣鼓再看槌步',
    description:
      '说明英歌中锣鼓如何组织动作与情绪,队形与合槌为何重要,并区分真实演出与游戏教学谱。',
    h1: '英歌的鼓点节奏与队形如何理解?',
    keywords: ['英歌鼓点', '英歌队形', '锣鼓', '合槌', 'BPM'],
    quickAnswer: [
      '锣鼓给节拍也推情绪,槌步与变阵要落在共同时间格上才有「成阵」感;各地快慢气韵不同,游戏 BPM 仅为教学分层。',
    ],
    sections: [
      {
        id: 'drum',
        title: '先听锣鼓,再看槌步',
        paragraphs: [
          '入门时优先练「听见重拍」,再谈花式动作。失去共同节拍,队形再复杂也容易散——这是所有集体节奏艺术共通的基本功。',
          '锣鼓在英歌里不只是伴奏:它划分段落、提示转换、推动情绪。听得出锣鼓的「意图」,才跟得上队伍的变化。',
          '巡游与舞台场景对耐力、转身与连续段落的要求不同,游戏用关卡长度做简化模拟,帮助你在几分钟内体会一场巡游的节奏轮廓。',
        ],
      },
      {
        id: 'layers',
        title: '节奏的三个层次',
        paragraphs: [
          '第一层是鼓:稳定的骨架,所有人共同的时间轴。第二层是槌:双手对击落在鼓点或切分上,形成「声部」。第三层是步与阵:身体的移动把听觉的节奏翻译成视觉的图形。',
          '三层对齐时,观众会感到一种「整齐的轰鸣」——那不是音量,而是数十人共享同一时间格时产生的秩序感。',
          '练习的顺序也按三层走:先踩准鼓,再合上槌,最后照顾走位。游戏中三个章节正是按这个顺序展开。',
        ],
      },
      {
        id: 'formation',
        title: '一人准,众人齐',
        paragraphs: [
          '队形变化让观者看见整体造型,也要求每一位成员在同一时间完成换位或击打。变阵的难点不在动作本身,而在几十人同时开始、同时完成。',
          '评分上把「个人」与「整齐」拆开,是为了让玩家理解英歌的协作属性:个人满分而队伍散,仍不算一场好英歌。',
        ],
      },
      {
        id: 'in-game',
        title: '游戏中的节奏教学',
        paragraphs: [
          '本作把鼓点翻译成可视化的节拍提示,把合槌翻译成左右键的击槌判定,把变阵翻译成段落目标——三者都是教学化抽象。',
          '章节 BPM 由慢到快是教学分层,帮助建立肌肉记忆;它不对应、也不冒充任何一支真实队伍的演出谱面。',
        ],
      },
    ],
    faq: [...sharedFaq, ...extraFaq],
    sources: [...SOURCES],
    relatedPaths: ['/culture/yingge/', '/culture/yingge/faces-and-roles/', '/games/chaoshan-yingge/'],
    ...GAME,
    dateModified: DATE,
    readingMinutes: 5,
    symbol: 'yingge',
  },
  {
    kind: 'topic',
    hub: 'yingge',
    slug: 'faces-and-roles',
    path: '/culture/yingge/faces-and-roles/',
    title: '英歌脸谱与角色表达|地方差异与流传说法',
    description:
      '介绍英歌脸谱与角色表达的地方性,说明英雄叙事多为流传说法,避免把单一故事写成唯一历史起源,并链到在线节奏体验。',
    h1: '英歌脸谱与角色表达如何理解?',
    keywords: ['英歌脸谱', '英歌角色', '潮阳英歌', '普宁英歌'],
    quickAnswer: [
      '脸谱服务角色识别与气势表达,各地人物、色彩与画法不同;梁山好汉等叙事多为民间流传,需与可核资料分开标注。',
    ],
    sections: [
      {
        id: 'local',
        title: '地方版本优先',
        paragraphs: [
          '看到某一套脸谱照片,先问「这是哪支队伍、哪个村落的传统」,再谈象征。同一角色在不同地方可能画法迥异,这正是英歌脸谱的生命力所在。',
          '颜色与线条往往和角色性格、出场功能相关,但细节以当地画师与传承为准。网络上的「脸谱大全」多以某一支队伍为样本,不宜当成通用图谱。',
        ],
      },
      {
        id: 'common-roles',
        title: '常见角色类型',
        paragraphs: [
          '常见说法是,英歌队伍中有领舞带队的头槌角色、扮相鲜明的英雄人物,以及锣鼓唢呐等伴奏成员;角色数量与配置因队伍规模而异。',
          '民间常把扮相与水浒人物相联系:谁扮谁、怎么扮,各村有各村的讲究。本站介绍角色类型时只到「通行说法」层,具体对应请以当地队伍口径为准。',
        ],
      },
      {
        id: 'narrative',
        title: '叙事与证据',
        paragraphs: [
          '民间英雄叙事能增强表演感染力,却不等于经严密考证的唯一史实。把某一版本故事说成英歌的「真正起源」,对其他地方版本并不公平。',
          '文化页与游戏档案会尽量区分「资料记载 / 口头传统 / 游戏演绎」三层,让你在读每个说法时都知道它站在什么证据上。',
        ],
      },
      {
        id: 'in-game',
        title: '游戏档案的证据分层',
        paragraphs: [
          '游戏中可解锁的文化档案条目,都带有证据等级标注:能在公开资料中核对的标为「资料记载」,民间说法标为「口头传统」,为玩法服务的演绎标为「游戏演绎」。',
          '角色形象为美术风格化创作,不临摹任何一支真实队伍的脸谱谱式——这是尊重,也是边界。',
        ],
      },
    ],
    faq: [...sharedFaq, ...extraFaq],
    sources: [...SOURCES],
    relatedPaths: ['/culture/yingge/', '/culture/yingge/rhythm-and-formation/', '/games/chaoshan-yingge/'],
    ...GAME,
    dateModified: DATE,
    readingMinutes: 5,
    symbol: 'yingge',
  },
];
