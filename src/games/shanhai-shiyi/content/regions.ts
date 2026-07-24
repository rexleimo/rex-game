import type { ExhibitStop, LearnPoint } from '../core/types';
import {
  EXHIBIT_ROUTES as R01_ROUTES,
  LEARN_POINTS as R01_LEARN,
  REGION_BLURB as R01_BLURB,
  REGION_NAME as R01_NAME,
  REGION_SUMMARY as R01_SUMMARY,
} from './region.ts';

export interface RegionDef {
  id: string;
  name: string;
  blurb: readonly string[];
  learnPoints: LearnPoint[];
  summary: readonly string[];
  routes: { id: string; title: string; intro: string; stops: ExhibitStop[] }[];
  /** 展厅强调色（CSS 可用） */
  accent: string;
  /** 展区主视觉（生图） */
  art?: string;
}

const R02_LEARN: LearnPoint[] = [
  {
    id: 'R02-L01',
    goal: '能说出楚地装饰里常见的凤鸟母题',
    checkQuestion: '楚地纹样里，哪种神鸟形象很醒目？',
  },
  {
    id: 'R02-L02',
    goal: '知道漆器是「木+漆」的温润工艺，耳杯是亲切入口',
    checkQuestion: '耳杯和青铜鼎给人的触感印象有何不同？',
  },
  {
    id: 'R02-L03',
    goal: '理解「楚地」作为江汉文化气质展区，而非单一现代行政区',
    checkQuestion: '本展区楚地主要指什么？',
  },
  {
    id: 'R02-L04',
    goal: '知道鼓与凤架等组合是楚地「看得见的乐」',
    checkQuestion: '虎座凤架鼓大概长什么样？',
  },
  {
    id: 'R02-L05',
    goal: '对帛画有印象：丝帛也能承载图像叙事',
    checkQuestion: '帛画画在什么材料上？',
  },
  {
    id: 'R02-L06',
    goal: '知道《楚辞》是南方诗歌传统入口，并能联系端午记忆',
    checkQuestion: '楚辞和屈原、端午有什么文化关联？',
  },
];

const R02_SUMMARY = [
  '楚地这一路，凤鸟的翅膀张得更开，漆器的红黑也更烫眼。',
  '鼓在凤架之间，帛在丝上展开——乐与画都带着南方的流动。',
  '楚辞把香草与江水写进诗里；与中原礼乐对照，中国更完整。',
] as const;

const R02_ROUTES: RegionDef['routes'] = [
  {
    id: 'r02-feng',
    title: '路线甲 · 凤与漆',
    intro: '从凤鸟与耳杯进入楚地的眼睛与手感。',
    stops: [
      {
        id: 'c2-plaque',
        kind: 'plaque',
        title: '说明牌 · 江风',
        body: '江汉之间，风从水面来。器物上的线条，也好像被风吹开了。',
      },
      { id: 'c2-chu', kind: 'lore', title: '书院 · 楚地知一张', artifactId: 'A-R02-N-003' },
      { id: 'c2-feng', kind: 'lore', title: '遗宝台 · 凤鸟纹饰', artifactId: 'A-R02-SR-001' },
      { id: 'c2-cup', kind: 'lore', title: '遗宝台 · 漆耳杯', artifactId: 'A-R02-R-002' },
      { id: 'c2-qi', kind: 'lore', title: '书院 · 漆：木与光', artifactId: 'A-R02-N-013' },
    ],
  },
  {
    id: 'r02-yue',
    title: '路线乙 · 乐与画',
    intro: '虎座凤架、建鼓与帛画——声音与图像的南方写法。',
    stops: [
      { id: 'c2-tiger', kind: 'lore', title: '遗宝台 · 虎座凤架鼓', artifactId: 'A-R02-SR-004' },
      { id: 'c2-drum', kind: 'lore', title: '遗宝台 · 建鼓', artifactId: 'A-R02-R-005' },
      { id: 'c2-bell', kind: 'lore', title: '遗宝台 · 编钟南音', artifactId: 'A-R02-R-012' },
      { id: 'c2-silk', kind: 'lore', title: '遗宝台 · 帛画卷', artifactId: 'A-R02-R-006' },
      { id: 'c2-longfeng', kind: 'lore', title: '书院 · 龙凤组合', artifactId: 'A-R02-R-015' },
    ],
  },
  {
    id: 'r02-shi',
    title: '路线丙 · 诗与江',
    intro: '楚辞、香草、屈原印象与端午记忆；对照中原，收束楚地。',
    stops: [
      { id: 'c2-boat', kind: 'lore', title: '见闻 · 江上舟', artifactId: 'A-R02-R-009' },
      { id: 'c2-ci', kind: 'lore', title: '书院 · 楚辞入门', artifactId: 'A-R02-N-007' },
      { id: 'c2-herb', kind: 'lore', title: '书院 · 香草意象', artifactId: 'A-R02-R-008' },
      { id: 'c2-qu', kind: 'lore', title: '书院 · 屈原印象', artifactId: 'A-R02-N-018' },
      { id: 'c2-duan', kind: 'lore', title: '岁时 · 端午记忆', artifactId: 'A-R02-N-019' },
      {
        id: 'c2-sum',
        kind: 'summary',
        title: '小结亭 · 楚地三句',
        body: R02_SUMMARY.join('\n'),
      },
    ],
  },
];

const R03_LEARN: LearnPoint[] = [
  { id: 'R03-L01', goal: '能描述纵目/神树等古蜀青铜的奇异视觉', checkQuestion: '纵目面具最醒目的特征是什么？' },
  { id: 'R03-L02', goal: '知道黄金可用于面部礼仪，与青铜分工', checkQuestion: '金面在古蜀语境里意味着什么？' },
  { id: 'R03-L03', goal: '理解巴蜀作为西南区域文化展区与三星堆公共入口', checkQuestion: '巴蜀展区主要指什么？' },
  { id: 'R03-L04', goal: '知道蜀锦是重要织锦传统', checkQuestion: '蜀锦属于哪类工艺？' },
  { id: 'R03-L05', goal: '理解蜀道/栈道与山地交通的文化记忆', checkQuestion: '栈道解决了什么问题？' },
  { id: 'R03-L06', goal: '能把「震撼」转化为可核对的问题意识', checkQuestion: '面对奇闻应如何对待证据？' },
];

const R03_SUMMARY = [
  '巴蜀这一路，纵目把目光伸得很长，金面把礼仪擦得很亮。',
  '神树伸向天空，栈道钉在悬崖——工艺与地理一样大胆。',
  '蜀锦柔软，诗句险峻：文明可以既奇异又温暖。',
] as const;

const R03_ROUTES: RegionDef['routes'] = [
  {
    id: 'r03-yan',
    title: '路线甲 · 纵目与金',
    intro: '从面具与黄金进入古蜀最强的视觉记忆。',
    stops: [
      { id: 'b-plaque', kind: 'plaque', title: '说明牌 · 盆地的光', body: '群山围合的盆地里，铜与金曾被铸成另一种面孔与树枝。' },
      { id: 'b-know', kind: 'lore', title: '书院 · 巴蜀知一张', artifactId: 'A-R03-N-003' },
      { id: 'b-eye', kind: 'lore', title: '遗宝台 · 纵目面具', artifactId: 'A-R03-SR-001' },
      { id: 'b-gold', kind: 'lore', title: '遗宝台 · 黄金面罩', artifactId: 'A-R03-SR-002' },
      { id: 'b-mat', kind: 'lore', title: '书院 · 金与铜', artifactId: 'A-R03-N-009' },
    ],
  },
  {
    id: 'r03-shu',
    title: '路线乙 · 神树与锦',
    intro: '神树的宇宙想象，蜀锦的柔软文明。',
    stops: [
      { id: 'b-tree', kind: 'lore', title: '遗宝台 · 青铜神树', artifactId: 'A-R03-R-004' },
      { id: 'b-ren', kind: 'lore', title: '遗宝台 · 立人意象', artifactId: 'A-R03-R-010' },
      { id: 'b-jin', kind: 'lore', title: '遗宝台 · 蜀锦', artifactId: 'A-R03-R-005' },
      { id: 'b-sx', kind: 'lore', title: '书院 · 三星堆印象', artifactId: 'A-R03-N-008' },
      { id: 'b-ev', kind: 'lore', title: '公教 · 想象与证据', artifactId: 'A-R03-N-013' },
    ],
  },
  {
    id: 'r03-dao',
    title: '路线丙 · 蜀道',
    intro: '栈道、诗句与地理：路如何成为文化。',
    stops: [
      { id: 'b-plank', kind: 'lore', title: '见闻 · 栈道', artifactId: 'A-R03-R-006' },
      { id: 'b-poem', kind: 'lore', title: '书院 · 蜀道难', artifactId: 'A-R03-N-007' },
      { id: 'b-geo', kind: 'lore', title: '书院 · 盆地与山', artifactId: 'A-R03-N-011' },
      { id: 'b-salt', kind: 'lore', title: '书院 · 盐与交通', artifactId: 'A-R03-N-012' },
      {
        id: 'b-sum',
        kind: 'summary',
        title: '小结亭 · 巴蜀三句',
        body: R03_SUMMARY.join('\n'),
      },
    ],
  },
];

const R04_LEARN: LearnPoint[] = [
  { id: 'R04-L01', goal: '认识瓷器与青花作为江南/中国工艺的公共面孔', checkQuestion: '瓷是怎样「火成」的？' },
  { id: 'R04-L02', goal: '理解江南作为水乡市镇与诗意气质的展区', checkQuestion: '江南只等于园林吗？' },
  { id: 'R04-L03', goal: '知道园林以有限空间营造山水意境', checkQuestion: '粉墙漏窗在做什么？' },
  { id: 'R04-L04', goal: '了解雅集与书画卷轴的文人生活美学', checkQuestion: '雅集大致做什么？' },
  { id: 'R04-L05', goal: '把茶盏/紫砂与日常仪式感联系起来', checkQuestion: '茶器为何也值得看？' },
  { id: 'R04-L06', goal: '尊重丝绣等工艺传承', checkQuestion: '如何支持传统手艺？' },
];

const R04_SUMMARY = [
  '江南这一路，瓷光像被水洗过的玉，园林把山水请到墙里。',
  '扇与卷轴让手和眼睛学会慢慢打开；茶盏把日常变成可停留的片刻。',
  '市井与雅致并存——江南的完整，是静与闹的二重奏。',
] as const;

const R04_ROUTES: RegionDef['routes'] = [
  {
    id: 'r04-ci',
    title: '路线甲 · 窑火',
    intro: '从瓷瓶与青花认识土与火的文明。',
    stops: [
      { id: 'j-plaque', kind: 'plaque', title: '说明牌 · 水气', body: '湿润的风里，窑火曾经把泥土烧成会发光的器皿。' },
      { id: 'j-know', kind: 'lore', title: '书院 · 江南知一张', artifactId: 'A-R04-N-003' },
      { id: 'j-vase', kind: 'lore', title: '遗宝台 · 青白瓷瓶', artifactId: 'A-R04-SR-001' },
      { id: 'j-bw', kind: 'lore', title: '遗宝台 · 青花', artifactId: 'A-R04-R-002' },
      { id: 'j-fire', kind: 'lore', title: '书院 · 窑火分工', artifactId: 'A-R04-N-009' },
    ],
  },
  {
    id: 'r04-yuan',
    title: '路线乙 · 园与雅',
    intro: '园林、折扇、雅集与卷轴。',
    stops: [
      { id: 'j-garden', kind: 'lore', title: '遗宝台 · 园林一角', artifactId: 'A-R04-SR-004' },
      { id: 'j-fan', kind: 'lore', title: '遗宝台 · 折扇', artifactId: 'A-R04-R-005' },
      { id: 'j-ya', kind: 'lore', title: '书院 · 文人雅集', artifactId: 'A-R04-N-007' },
      { id: 'j-scroll', kind: 'lore', title: '遗宝台 · 卷轴', artifactId: 'A-R04-R-008' },
      { id: 'j-wen', kind: 'lore', title: '书院 · 文房四宝', artifactId: 'A-R04-N-016' },
    ],
  },
  {
    id: 'r04-cha',
    title: '路线丙 · 茶与丝',
    intro: '茶盏、紫砂、丝绣与四区对照。',
    stops: [
      { id: 'j-cup', kind: 'lore', title: '遗宝台 · 茶盏', artifactId: 'A-R04-R-006' },
      { id: 'j-zisha', kind: 'lore', title: '书院 · 紫砂', artifactId: 'A-R04-R-015' },
      { id: 'j-si', kind: 'lore', title: '书院 · 丝与绣', artifactId: 'A-R04-N-010' },
      { id: 'j-cmp', kind: 'lore', title: '书院 · 四区对照', artifactId: 'A-R04-N-019' },
      {
        id: 'j-sum',
        kind: 'summary',
        title: '小结亭 · 江南三句',
        body: R04_SUMMARY.join('\n'),
      },
    ],
  },
];

const R05_LEARN = [
  { id: 'R05-L01', goal: '认识马与鞍在塞北生活中的核心地位', checkQuestion: '马为什么重要？' },
  { id: 'R05-L02', goal: '理解骆驼与丝路作为交通网络', checkQuestion: '丝路是一条直线吗？' },
  { id: 'R05-L03', goal: '知道关隘既分隔又连接', checkQuestion: '关的门槛意味着什么？' },
  { id: 'R05-L04', goal: '了解角杯、皮毛等边地物用与技艺', checkQuestion: '御寒与宴饮器物说明什么？' },
  { id: 'R05-L05', goal: '把塞北理解为边地互市与多元交往的气质', checkQuestion: '边地只有冲突吗？' },
  { id: 'R05-L06', goal: '能借助边塞诗进入情感记忆', checkQuestion: '边塞诗写什么？' },
];

const R05_SUMMARY = [
  '塞北这一路，马蹄与驼铃把距离量成节奏。',
  '关隘是门槛，互市是对话，丝路是一张网。',
  '边塞诗让风沙有了可背诵的温度。',
] as const;

const R05_ROUTES: RegionDef['routes'] = [
  {
    id: 'r05-ma',
    title: '路线甲 · 马与驼',
    intro: '运力与移动的文明。',
    stops: [
      { id: 's-plaque', kind: 'plaque', title: '说明牌 · 风', body: '风从关外长驱直入。能跟上它的，先是马，后是驼。' },
      { id: 's-know', kind: 'lore', title: '书院 · 塞北知一张', artifactId: 'A-R05-N-006' },
      { id: 's-horse', kind: 'lore', title: '遗宝台 · 胡马', artifactId: 'A-R05-SR-001' },
      { id: 's-saddle', kind: 'lore', title: '遗宝台 · 马鞍', artifactId: 'A-R05-R-004' },
      { id: 's-camel', kind: 'lore', title: '遗宝台 · 骆驼', artifactId: 'A-R05-R-002' },
    ],
  },
  {
    id: 'r05-guan',
    title: '路线乙 · 关与市',
    intro: '门槛、长城与交换。',
    stops: [
      { id: 's-pass', kind: 'lore', title: '遗宝台 · 关隘', artifactId: 'A-R05-SR-003' },
      { id: 's-wall', kind: 'lore', title: '书院 · 长城', artifactId: 'A-R05-N-015' },
      { id: 's-market', kind: 'lore', title: '书院 · 互市', artifactId: 'A-R05-N-008' },
      { id: 's-road', kind: 'lore', title: '书院 · 丝路网络', artifactId: 'A-R05-N-007' },
      { id: 's-ethics', kind: 'lore', title: '公教 · 胡汉表述', artifactId: 'A-R05-N-010' },
    ],
  },
  {
    id: 'r05-shi',
    title: '路线丙 · 诗与声',
    intro: '边塞诗、关名与长调印象。',
    stops: [
      { id: 's-poem', kind: 'lore', title: '书院 · 边塞诗', artifactId: 'A-R05-N-009' },
      { id: 's-yg', kind: 'lore', title: '书院 · 玉门阳关', artifactId: 'A-R05-R-016' },
      { id: 's-song', kind: 'lore', title: '书院 · 长调', artifactId: 'A-R05-N-013' },
      { id: 's-five', kind: 'lore', title: '书院 · 五区对照', artifactId: 'A-R05-N-014' },
      {
        id: 's-sum',
        kind: 'summary',
        title: '小结亭 · 塞北三句',
        body: R05_SUMMARY.join('\n'),
      },
    ],
  },
];

const R07_LEARN = [
  { id: 'R07-L01', goal: '理解春节团圆与春联文字进入日常生活', checkQuestion: '春联贴在哪里、做什么？' },
  { id: 'R07-L02', goal: '知道元宵灯与圆的公共欢乐', checkQuestion: '元宵常见哪些活动？' },
  { id: 'R07-L03', goal: '认识端午粽与龙舟的协作与多元叙事', checkQuestion: '端午有哪些标志物？' },
  { id: 'R07-L04', goal: '理解中秋赏月与月饼的团圆象征', checkQuestion: '中秋为何看月？' },
  { id: 'R07-L05', goal: '了解清明、七夕、重阳、冬至等节点主题', checkQuestion: '这些节日各强调什么？' },
  { id: 'R07-L06', goal: '知道二十四节气是更细的物候时间表', checkQuestion: '节气依据什么？' },
];

const R07_SUMMARY = [
  '岁时把一年切成可过的故事：春联、花灯、粽与月。',
  '每个节日都有物、有仪式，也有可讲述的一句道理。',
  '节气更细——让我们与光和物候重新对表。',
] as const;

/** 岁时用「专题列表」为主，路线作导览备份 */
const R07_ROUTES: RegionDef['routes'] = [
  {
    id: 'r07-year',
    title: '导览 · 从春到冬',
    intro: '也可在「岁时」页按专题进入；此路线串联核心卡。',
    stops: [
      { id: 'f-spring', kind: 'lore', title: '春节 · 春联', artifactId: 'A-R07-SR-001' },
      { id: 'f-lantern', kind: 'lore', title: '元宵 · 花灯', artifactId: 'A-R07-R-003' },
      { id: 'f-duanwu', kind: 'lore', title: '端午 · 粽', artifactId: 'A-R07-R-005' },
      { id: 'f-moon', kind: 'lore', title: '中秋 · 月饼', artifactId: 'A-R07-R-008' },
      { id: 'f-solar', kind: 'lore', title: '节气名片', artifactId: 'A-R07-N-015' },
      {
        id: 'f-sum',
        kind: 'summary',
        title: '小结 · 岁时三句',
        body: R07_SUMMARY.join('\n'),
      },
    ],
  },
];

const R06_LEARN = [
  { id: 'R06-L01', goal: '认识昆仑等仙山坐标是典籍想象', checkQuestion: '昆仑在文化里意味着什么？' },
  { id: 'R06-L02', goal: '能举出九尾、精卫、夸父等公共神话', checkQuestion: '你能讲一个山海经故事吗？' },
  { id: 'R06-L03', goal: '把《山海经》理解为博物+奇闻的古典文本', checkQuestion: '山海经像什么样的书？' },
  { id: 'R06-L04', goal: '区分经载与史证标签', checkQuestion: '经载和史证有何不同？' },
  { id: 'R06-L05', goal: '了解山海想象的跨文化传播', checkQuestion: '故事如何出海？' },
  { id: 'R06-L06', goal: '以好奇、对照、不武断的态度读神话', checkQuestion: '读经三法是什么？' },
];

const R06_SUMMARY = [
  '仙山这一路，昆仑给出想象的海拔。',
  '异兽与英雄神话，是意志与敬畏的寓言。',
  '经载标签让我们诚实：诗很美，证据另册。',
] as const;

const R06_ROUTES: RegionDef['routes'] = [
  {
    id: 'r06-shan',
    title: '路线甲 · 山与册',
    intro: '昆仑、山海册与经载标签。',
    stops: [
      { id: 'x-plaque', kind: 'plaque', title: '说明牌 · 云上', body: '云散开时，山还在想象里。这里是经册的海拔。' },
      { id: 'x-know', kind: 'lore', title: '书院 · 仙山知一张', artifactId: 'A-R06-N-003' },
      { id: 'x-kun', kind: 'lore', title: '遗宝台 · 昆仑', artifactId: 'A-R06-SR-001' },
      { id: 'x-page', kind: 'lore', title: '遗宝台 · 山海册残页', artifactId: 'A-R06-R-004' },
      { id: 'x-tag', kind: 'lore', title: '书院 · 经载与史证', artifactId: 'A-R06-N-007' },
    ],
  },
  {
    id: 'r06-shou',
    title: '路线乙 · 兽与志',
    intro: '九尾、精卫、夸父与神鸟。',
    stops: [
      { id: 'x-fox', kind: 'lore', title: '遗宝台 · 九尾狐', artifactId: 'A-R06-R-002' },
      { id: 'x-bird', kind: 'lore', title: '遗宝台 · 神鸟', artifactId: 'A-R06-R-006' },
      { id: 'x-jw', kind: 'lore', title: '书院 · 精卫', artifactId: 'A-R06-N-010' },
      { id: 'x-qf', kind: 'lore', title: '书院 · 夸父', artifactId: 'A-R06-N-011' },
      { id: 'x-zh', kind: 'lore', title: '书院 · 烛龙', artifactId: 'A-R06-R-016' },
    ],
  },
  {
    id: 'r06-du',
    title: '路线丙 · 读法',
    intro: '读经方法、再创作伦理与合图。',
    stops: [
      { id: 'x-water', kind: 'lore', title: '遗宝台 · 弱水', artifactId: 'A-R06-R-005' },
      { id: 'x-3', kind: 'lore', title: '书院 · 读经三法', artifactId: 'A-R06-N-017' },
      { id: 'x-eth', kind: 'lore', title: '公教 · 勿迷信', artifactId: 'A-R06-N-013' },
      { id: 'x-cmp', kind: 'lore', title: '书院 · 与五区对照', artifactId: 'A-R06-N-014' },
      {
        id: 'x-sum',
        kind: 'summary',
        title: '小结亭 · 仙山三句',
        body: R06_SUMMARY.join('\n'),
      },
    ],
  },
];

const R08_LEARN = [
  { id: 'R08-L01', goal: '认识海船与季风航海的基本印象', checkQuestion: '古人如何借风航海？' },
  { id: 'R08-L02', goal: '知道罗盘/指南对定向的意义', checkQuestion: '罗盘解决什么问题？' },
  { id: 'R08-L03', goal: '理解外销瓷等中国商品的海洋足迹', checkQuestion: '瓷器如何出海？' },
  { id: 'R08-L04', goal: '了解香料等贸易商品改变生活', checkQuestion: '香料为何重要？' },
  { id: 'R08-L05', goal: '把海丝理解为多港口网络与互鉴', checkQuestion: '海丝是单线吗？' },
  { id: 'R08-L06', goal: '看见翻译与侨批等「软基础设施」', checkQuestion: '语言与家书如何越洋？' },
];

const R08_SUMMARY = [
  '海丝这一路，帆吃进季风，针指出方向。',
  '瓷与香是货物，译与信是看不见的舱。',
  '互鉴双向，沉船有课，海洋是中国故事的一章。',
] as const;

const R08_ROUTES: RegionDef['routes'] = [
  {
    id: 'r08-chuan',
    title: '路线甲 · 船与针',
    intro: '海船、罗盘与季风。',
    stops: [
      { id: 'h-plaque', kind: 'plaque', title: '说明牌 · 潮', body: '潮涨潮落之间，人学会把家安在移动的甲板上。' },
      { id: 'h-know', kind: 'lore', title: '书院 · 海丝知一张', artifactId: 'A-R08-N-005' },
      { id: 'h-ship', kind: 'lore', title: '遗宝台 · 海船', artifactId: 'A-R08-SR-001' },
      { id: 'h-comp', kind: 'lore', title: '遗宝台 · 罗盘', artifactId: 'A-R08-R-002' },
      { id: 'h-wind', kind: 'lore', title: '书院 · 季风', artifactId: 'A-R08-N-006' },
    ],
  },
  {
    id: 'r08-huo',
    title: '路线乙 · 货与港',
    intro: '外销瓷、香料、港口与茶瓷丝。',
    stops: [
      { id: 'h-por', kind: 'lore', title: '遗宝台 · 外销瓷', artifactId: 'A-R08-R-003' },
      { id: 'h-sp', kind: 'lore', title: '遗宝台 · 香料囊', artifactId: 'A-R08-R-004' },
      { id: 'h-port', kind: 'lore', title: '书院 · 港口城市', artifactId: 'A-R08-N-007' },
      { id: 'h-tri', kind: 'lore', title: '书院 · 茶瓷丝', artifactId: 'A-R08-N-012' },
      { id: 'h-wreck', kind: 'lore', title: '公教 · 沉船考古', artifactId: 'A-R08-N-011' },
    ],
  },
  {
    id: 'r08-jian',
    title: '路线丙 · 译与鉴',
    intro: '翻译、互鉴、陆海对照与合图。',
    stops: [
      { id: 'h-tr', kind: 'lore', title: '书院 · 翻译通事', artifactId: 'A-R08-N-009' },
      { id: 'h-jh', kind: 'lore', title: '书院 · 郑和印象', artifactId: 'A-R08-N-008' },
      { id: 'h-lh', kind: 'lore', title: '书院 · 陆丝与海丝', artifactId: 'A-R08-N-013' },
      { id: 'h-yj', kind: 'lore', title: '公教 · 互鉴', artifactId: 'A-R08-N-015' },
      {
        id: 'h-sum',
        kind: 'summary',
        title: '小结亭 · 海丝三句',
        body: R08_SUMMARY.join('\n'),
      },
    ],
  },
];

export const REGIONS: RegionDef[] = [
  {
    id: 'R01',
    name: R01_NAME,
    blurb: R01_BLURB,
    learnPoints: R01_LEARN,
    summary: R01_SUMMARY,
    routes: R01_ROUTES,
    accent: '#6B7F6A',
    art: '/assets/shanhai/regions/r01.webp',
  },
  {
    id: 'R02',
    name: '楚地',
    blurb: [
      '江汉之间，凤鸟的翅膀张得更开。',
      '漆器的红与黑，像夜色里忽然亮起的心；鼓声在凤架之间回响。',
      '楚辞把香草与江水写进诗里——这里是更浪漫的一条文化支流。',
    ],
    learnPoints: R02_LEARN,
    summary: R02_SUMMARY,
    routes: R02_ROUTES,
    accent: '#8B2E2E',
    art: '/assets/shanhai/regions/r02.webp',
  },
  {
    id: 'R03',
    name: '巴蜀',
    blurb: [
      '盆地被群山围合，铜与金却铸出外凸的目光。',
      '神树伸向天空，栈道钉在悬崖——奇异与勇气并存。',
      '蜀锦柔软地继续讲故事，让文明不止有面具，也有温度。',
    ],
    learnPoints: R03_LEARN,
    summary: R03_SUMMARY,
    routes: R03_ROUTES,
    accent: '#C4A35A',
    art: '/assets/shanhai/regions/r03.webp',
  },
  {
    id: 'R04',
    name: '江南',
    blurb: [
      '水网与市镇之上，窑火把泥土烧成温润的光。',
      '园林把山水请入粉墙；扇与卷轴让时间慢慢展开。',
      '茶盏与丝绣提醒我们：雅致也可以是日常。',
    ],
    learnPoints: R04_LEARN,
    summary: R04_SUMMARY,
    routes: R04_ROUTES,
    accent: '#4A6A78',
    art: '/assets/shanhai/regions/r04.webp',
  },
  {
    id: 'R05',
    name: '塞北',
    blurb: [
      '风从关外长驱。马与驼把距离量成节奏。',
      '关隘是门槛，互市是对话，丝路是一张网。',
      '边塞诗让风沙有了可背诵的温度。',
    ],
    learnPoints: R05_LEARN,
    summary: R05_SUMMARY,
    routes: R05_ROUTES,
    accent: '#6A8AAA',
    art: '/assets/shanhai/regions/r05.webp',
  },
  {
    id: 'R07',
    name: '岁时',
    blurb: [
      '节日把一年切成可过的故事。',
      '春联、花灯、粽与月——物会说话，节有主题。',
      '节气更细，教我们与光和物候对表。',
    ],
    learnPoints: R07_LEARN,
    summary: R07_SUMMARY,
    routes: R07_ROUTES,
    accent: '#A6332B',
    art: '/assets/shanhai/regions/r07.webp',
  },
  {
    id: 'R06',
    name: '仙山',
    blurb: [
      '昆仑高处，云像可以走的路。',
      '异兽与神话是经册里的远方，滋养艺术与想象。',
      '请带上「经载」标签：精彩，且诚实。',
    ],
    learnPoints: R06_LEARN,
    summary: R06_SUMMARY,
    routes: R06_ROUTES,
    accent: '#7A6A9A',
    art: '/assets/shanhai/regions/r06.webp',
  },
  {
    id: 'R08',
    name: '海丝',
    blurb: [
      '帆影吃进季风，港口响起多种口音。',
      '瓷与香、针与译——海洋把中国接进世界网络。',
      '互鉴是双向的，文保是共同的。',
    ],
    learnPoints: R08_LEARN,
    summary: R08_SUMMARY,
    routes: R08_ROUTES,
    accent: '#3A6A8A',
    art: '/assets/shanhai/regions/r08.webp',
  },
];

export function getRegion(id: string): RegionDef {
  return REGIONS.find((r) => r.id === id) ?? REGIONS[0]!;
}
