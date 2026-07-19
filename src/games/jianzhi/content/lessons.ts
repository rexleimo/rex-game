import type { JianzhiLesson } from '../core/types';

export const LESSON_COUNT = 7;

/**
 * 基础功课 7 课（线性）。
 * 完成 graduate 后解锁时令委托。
 */
export const JIANZHI_LESSONS: JianzhiLesson[] = [
  {
    id: 'awaken',
    order: 1,
    title: '红纸初醒',
    subtitle: '折一折，剪一个「福」',
    region: '序章 · 入门',
    foldSuggestion: 'book',
    narrative: [
      '纸灵：欢迎来到工坊。我是守着红纸的小剪匠「纸灵」。',
      '师傅：别急着求全。先学最基础的一招——把红纸对折，剪一个「福」字。',
      '纸灵：展开的那一刻，福就醒了。这一剪，是你学徒路上的第一印。',
    ],
    reading: {
      origin:
        '剪纸的源头可追至西周「剪桐封弟」与战国的金银箔镂空，蔡伦造纸后才真正落在纸上。它从一开始就不是画，而是「剪出来的祈愿」。',
      technique:
        '对折（书折）是入门第一法：红纸左右对折，只在折面剪一半，展开即得左右对称的完整图形——一剪成双，是剪纸对称之美的起点。',
      focus:
        '「福」是剪纸的灵魂字。先读懂一个字如何承载整份心愿，再学纹样如何拼成句子。',
    },
    objectiveMode: 'motifs',
    objectiveMotifIds: ['fu'],
    quiz: {
      question: '为什么过年常把「福」字倒着贴？',
      options: ['纸张不够方正', '取「福倒（到）了」的谐音彩头', '古时印刷失误流传下来'],
      answer: 1,
      explain:
        '「倒」谐音「到」，福字倒贴即「福到了」。这正是剪纸最核心的智慧——用同音字，把抽象的心愿变成看得见、说得出的彩头。',
    },
    culturalFocus: '剪纸起源 · 对折对称 · 谐音彩头',
    cultureEntryIds: ['origin'],
    reward: '解锁文化档案：剪纸从何而来',
  },
  {
    id: 'symmetry',
    order: 2,
    title: '一剪成双',
    subtitle: '对折剪鱼，对称即技法',
    region: '工坊 · 对称课',
    foldSuggestion: 'book',
    narrative: [
      '师傅：剪纸最要紧的，不是花样多，而是「对」。',
      '纸灵：再对折一次，剪一尾鱼。展开看——两边一样，才叫功夫到家。',
      '师傅：北方窗花豪爽、南方细刻秀气，都离不开对称这一门底子。',
    ],
    reading: {
      origin:
        '剪纸有「南秀北雄」之说：陕北窗花线条粗犷、块面大；扬州细刻纤巧套色。同一门手艺，因水土而生出两种气质，对称却是共通的骨架。',
      technique:
        '继续练书折：只在折面剪半边鱼身，展开即成完整对称。折痕越准，边线越齐。',
      focus:
        '对称不是装饰，是技法本身。一剪成双，是你之后拼句、贴窗的基本功。',
    },
    objectiveMode: 'motifs',
    objectiveMotifIds: ['fish'],
    quiz: {
      question: '「南秀北雄」主要指剪纸的什么差异？',
      options: ['纸张产地不同', '南北风格：北粗犷、南纤巧', '只有南方才剪动物'],
      answer: 1,
      explain:
        '北方黄土高原窗花粗犷夸张，江南细刻纤巧套色——风格与水土相连，合称「南秀北雄」。',
    },
    culturalFocus: '对称技法 · 南秀北雄',
    cultureEntryIds: ['north-south'],
    reward: '解锁文化档案：南秀北雄',
  },
  {
    id: 'rebus-intro',
    order: 3,
    title: '看图说吉话',
    subtitle: '莲配鱼，连年有余',
    region: '工坊 · 谐音入门',
    foldSuggestion: 'book',
    narrative: [
      '纸灵：剪纸真正好玩的地方来了——把纹样拼成一句吉话。',
      '师傅：莲谐「连」，鱼谐「余」。一朵莲、一尾鱼，凑齐就是「连年有余」。',
      '纸灵：这叫「看图说吉话」。以后你见窗花，先读它说什么。',
    ],
    reading: {
      origin:
        '春节糊新窗、贴窗花，是北方延续千年的年俗。红纸剪出的鱼、花鸟贴在窗棂上，把祈福交给新的一年。',
      technique:
        '对折剪纹样后摆到纸上。过关不靠花样多，而靠目标纹样是否凑齐——莲与鱼缺一不可。',
      focus:
        '谐音是剪纸拼句的第一法：莲（连）+ 鱼（余）＝连年有余。记住同音，就能读懂大半窗花。',
    },
    objectiveMode: 'motifs',
    objectiveMotifIds: ['lotus', 'fish'],
    targetComboId: 'lian-nian-you-yu',
    quiz: {
      question: '「连年有余」里，鱼纹靠什么表达「余」？',
      options: ['鱼会游动象征灵活', '鱼(yú)与「余」同音，谐音取义', '鱼是北方的常见食物'],
      answer: 1,
      explain:
        '鱼谐音「余」，莲谐音「连」。剪纸用谐音把「连年有余」摆成一幅画——这就是「看图说吉话」的组合语法。',
    },
    culturalFocus: '谐音组合 · 连年有余 · 窗花年俗',
    cultureEntryIds: ['window-flower'],
    reward: '解锁文化档案：窗花与春节',
  },
  {
    id: 'window-four',
    order: 4,
    title: '四时窗花',
    subtitle: '四折剪梅，窗满春信',
    region: '北方 · 窗花课',
    foldSuggestion: 'four',
    narrative: [
      '师傅：窗花要满、要对称。今天学四折——纸折四次，一剪四面齐开。',
      '纸灵：剪一枝梅。梅凌寒先开，是报春第一花，贴在窗上最应景。',
      '师傅：展开那一瞬，四向对称的花样铺满窗格——这才是年味。',
    ],
    reading: {
      origin:
        '窗花多为对称折叠剪出。春节贴窗花，既装点院落，也把纳祥的心愿交给新的一年；展开瞬间的惊喜，是许多人童年的年味。',
      technique:
        '四折让纸对称四次，一剪即得满窗放射的花样，最适合表现窗花的饱满热闹。',
      focus:
        '四折是窗花的常用折法。本课目标：把「梅」稳稳剪上红纸，体会四面齐开的节奏。',
    },
    objectiveMode: 'motifs',
    objectiveMotifIds: ['plum'],
    quiz: {
      question: '为什么梅花常用来「报春」？',
      options: ['梅花色彩最鲜艳', '梅凌寒先开，是报春第一花', '梅花最容易剪'],
      answer: 1,
      explain:
        '梅凌寒独开，是一年里最早的花，故称「报春」。窗花剪梅，正是把春信贴上窗棂。',
    },
    culturalFocus: '四折技法 · 窗花年俗 · 梅报春',
    cultureEntryIds: ['window-flower'],
    reward: '巩固文化档案：窗花与春节',
  },
  {
    id: 'silk-rosette',
    order: 5,
    title: '团花丝路',
    subtitle: '蝶恋牡丹，花开富贵',
    region: '敦煌 · 丝路交融',
    foldSuggestion: 'rosette',
    narrative: [
      '纸灵：向西，去敦煌。丝路上的花样，都收进了团花里。',
      '师傅：把纸折成放射的楔形，剪牡丹，再让蝴蝶绕着它飞。',
      '纸灵：蝶恋花的缠绵，配牡丹的富贵——旋转一圈，便是「蝶恋花开」。',
    ],
    reading: {
      origin:
        '团花以折叠旋转剪出，呈完美放射对称，常饰于器物中心。敦煌与北朝丝路实物中都有它的身影，融合了中原、西域与佛教艺术。',
      technique:
        '团花折法把纸折成放射楔形，一次落剪、旋转复制，展开即得一朵向四周盛放的团花——古人「一剪得圆满」的智慧。',
      focus:
        '蝴蝶（蝶恋花，喻爱情）+ 牡丹（富贵）＝蝶恋花开。看它如何在旋转对称里被复制成一整圈祝福。',
    },
    objectiveMode: 'motifs',
    objectiveMotifIds: ['butterfly', 'peony'],
    targetComboId: 'die-lian-hua',
    quiz: {
      question: '团花「旋转对称」的美，来自哪种折法？',
      options: ['单面不折', '左右对折', '放射团花折'],
      answer: 2,
      explain:
        '团花折把纸折成放射楔形，一剪旋转复制成整圈。丝路团花正是这种技法与多元纹样交融的结晶。',
    },
    culturalFocus: '旋转对称 · 丝路交融 · 蝶恋花开',
    cultureEntryIds: ['rosette-silk'],
    reward: '解锁文化档案：团花与丝路',
  },
  {
    id: 'fu-shou',
    order: 6,
    title: '福寿双全',
    subtitle: '蝠配桃，象征成句',
    region: '工坊 · 象征法',
    foldSuggestion: 'book',
    narrative: [
      '师傅：谐音会了，还得会「象征」——有的纹样不靠同音，靠本身的意思。',
      '纸灵：蝙蝠的「蝠」谐「福」，寿桃象征「寿」。两样一配，就是福寿双全。',
      '师傅：以后见蝠见桃，别只当好看——它在替人祈寿祈福。',
    ],
    reading: {
      origin:
        '剪纸避直说、图彩头：有时用谐音，有时用象征。蝠谐福、桃表寿，是民间最常见的象征配对之一。',
      technique:
        '对折剪蝠与桃，摆到同一张红纸上。过关看目标纹样是否凑齐，展开后吉语图谱会记下成句。',
      focus:
        '象征法：蝠（福）+ 桃（寿）＝福寿双全。谐音之外，纹样本身的寓意同样能拼句。',
    },
    objectiveMode: 'motifs',
    objectiveMotifIds: ['bat', 'peach'],
    targetComboId: 'fu-shou-shuang-quan',
    quiz: {
      question: '「福寿双全」里，寿桃表达的是哪一层寓意？',
      options: ['财富滚滚', '长寿安康', '多子多孙'],
      answer: 1,
      explain:
        '寿桃象征「寿」。蝙蝠谐「福」，两者相配即「福寿双全」——靠象征与谐音并用，而不是写两个字。',
    },
    culturalFocus: '象征组合 · 福寿双全',
    cultureEntryIds: [],
    reward: '掌握象征拼句：福寿双全',
  },
  {
    id: 'graduate',
    order: 7,
    title: '出师一剪',
    subtitle: '随心拼句，活态传承',
    region: '尾声 · 出师',
    foldSuggestion: 'four',
    narrative: [
      '纸灵：你已走过对折、四折、团花，也学会了谐音与象征。',
      '师傅：最后一课，没有固定答案——在纸上拼出库内任意一句吉语，便算出师。',
      '纸灵：剪纸从不是标本。它活在每一次展开的红纸里，也活在你愿意分享的瞬间。',
    ],
    reading: {
      origin:
        '2006 年中国剪纸列入国家级非遗，2009 年入选人类非遗代表作。今天它与游戏、设计、展览相融，在年轻人手里继续生长。',
      technique:
        '四折、团花、对折、单面——任你自由切换。不同折法配不同纹样，能拼出千变万化的吉语。',
      focus:
        '本课目标：拼出吉语库中任意一句成句即可出师。之后可接时令委托，或回自习台随心剪。',
    },
    objectiveMode: 'any-combo',
    objectiveMotifIds: [],
    quiz: {
      question: '剪纸「看图说吉话」最根本的两种手法是？',
      options: ['写实与抽象', '谐音与象征', '套色与镂空'],
      answer: 1,
      explain:
        '谐音（鱼=余、梅=眉）与象征（牡丹=富贵、桃=寿）是剪纸拼句的两大手法。掌握它们，你就读懂了红纸上的祝福语法。',
    },
    culturalFocus: '自由拼句 · 谐音与象征 · 活态传承',
    cultureEntryIds: ['heritage'],
    reward: '出师 · 解锁文化档案：活态的非遗 · 开放时令委托',
  },
];

export function getLesson(id: string): JianzhiLesson | undefined {
  return JIANZHI_LESSONS.find((l) => l.id === id);
}
