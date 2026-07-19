import type { JianzhiChapter, JianzhiCultureEntry } from '../core/types';

const IH_CHINA = 'https://www.ihchina.cn/';

/** 章节级文化档案：随章节完成解锁，呈现于「文化档案」。 */
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

export const JIANZHI_CHAPTERS: JianzhiChapter[] = [
  {
    id: 'awaken',
    order: 1,
    title: '红纸初醒',
    subtitle: '折一折，剪一个「福」',
    region: '序章 · 入门演绎',
    foldSuggestion: 'book',
    narrative: [
      '纸灵：欢迎来到剪纸的世界。我是守着红纸的小剪匠「纸灵」。',
      '传说周成王「剪桐封弟」，汉代蔡伦造纸后，人们才把祈愿剪进薄薄的纸上。',
      '先学最基础的一招——把红纸对折，剪一个「福」字。展开的那一刻，福就醒了。',
    ],
    reading: {
      origin:
        '剪纸的源头可追至西周「剪桐封弟」与战国的金银箔镂空，蔡伦造纸后才真正落在纸上。它从一开始就不是画，而是「剪出来的祈愿」。',
      technique:
        '对折（书折）是入门第一法：红纸左右对折，只在折面剪一半，展开即得左右对称的完整图形——一剪成双，是剪纸对称之美的起点。',
      focus:
        '「福」是剪纸的灵魂字。先读懂一个字如何承载整份心愿，再学纹样如何拼成句子。',
    },
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
    id: 'north-window',
    order: 2,
    title: '北方窗花',
    subtitle: '莲配鱼，连年有余',
    region: '陕北 · 粗犷窗花',
    foldSuggestion: 'four',
    narrative: [
      '纸灵：随我北上，来到黄土塬上的村落。这里的窗花线条粗、块面大，最是豪爽。',
      '老奶奶说，过年忘了贴窗花，年味就缺了一角。她要一张「连年有余」——剪一朵莲，配一尾鱼。',
      '四折剪出的窗花最对称。莲谐「连」，鱼谐「余」，两样凑齐，一句吉话就成了。',
    ],
    reading: {
      origin:
        '黄土高原的窗花是「北雄」的代表：线条粗犷、造型夸张，多为妇女口耳相传的样式。一到春节，红窗花贴满窗棂，是最浓的年味。',
      technique:
        '四折让纸对称四次，一剪即得满窗放射的花样，最适合表现窗花的饱满热闹。',
      focus:
        '这一章第一次拼句：莲（连）+ 鱼（余）＝连年有余。记住——剪纸是把同音字摆在一起「读」出来的。',
    },
    objectiveMotifIds: ['lotus', 'fish'],
    targetComboId: 'lian-nian-you-yu',
    quiz: {
      question: '「连年有余」里，鱼纹靠什么表达「余」？',
      options: ['鱼会游动象征灵活', '鱼(yú)与「余」同音，谐音取义', '鱼是北方的常见食物'],
      answer: 1,
      explain:
        '鱼谐音「余」，莲谐音「连」。剪纸用谐音把「连年有余」摆成一幅画——这就是「看图说吉话」的组合语法。',
    },
    culturalFocus: '北雄风格 · 谐音组合 · 连年有余',
    cultureEntryIds: ['north-south', 'window-flower'],
    reward: '解锁文化档案：南秀北雄 · 窗花与春节',
  },
  {
    id: 'south-fine',
    order: 3,
    title: '江南细刻',
    subtitle: '牡丹簇囍，富贵双喜',
    region: '扬州 · 婚嫁喜花',
    foldSuggestion: 'book',
    narrative: [
      '纸灵：南下扬州，水软风轻。这里的剪刀更细，能套出层层颜色。',
      '一户人家要办喜事，正缺一对喜花。替他们剪个「囍」，再簇一朵牡丹。',
      '牡丹主富贵，囍字主双喜——合起来，就是「富贵双喜」的祝福。',
    ],
    reading: {
      origin:
        '江南的扬州、南京细刻是「南秀」的代表：纤巧秀丽，善用套色与戏曲人物。婚嫁喜花更是明清以来的固定礼俗。',
      technique:
        '对折剪「囍」最为顺手——半个「喜」沿折线剪开，展开即成对称的双喜，一如婚姻的成双成对。',
      focus:
        '象征也是一种语法：牡丹（富贵）+ 囍（双喜）＝富贵双喜。谐音之外，纹样本身的寓意同样能拼句。',
    },
    objectiveMotifIds: ['peony', 'double-happy'],
    targetComboId: 'fu-gui-shuang-xi',
    quiz: {
      question: '喜花里牡丹表达的是哪一层寓意？',
      options: ['富贵荣华', '多子多孙', '长寿安康'],
      answer: 0,
      explain:
        '牡丹为「花中之王」，自唐代起象征富贵。它与囍字相配，便把「富贵」与「双喜」两个愿望拼成一句——这靠的是象征，而非谐音。',
    },
    culturalFocus: '南秀细刻 · 象征组合 · 富贵双喜',
    cultureEntryIds: ['wedding-flower', 'north-south'],
    reward: '解锁文化档案：喜花与婚俗',
  },
  {
    id: 'silk-rosette',
    order: 4,
    title: '丝路团花',
    subtitle: '蝶恋牡丹，花开富贵',
    region: '敦煌 · 丝路交融',
    foldSuggestion: 'rosette',
    narrative: [
      '纸灵：向西，去敦煌。丝路上的商旅带来异域的花样，都收进了团花里。',
      '把纸折成放射的楔形，剪一朵牡丹，再让蝴蝶绕着它飞。',
      '蝶恋花的缠绵，配牡丹的富贵——旋转一圈，便是「蝶恋花开」的圆满。',
    ],
    reading: {
      origin:
        '团花以折叠旋转剪出，呈完美放射对称，常饰于器物中心。敦煌与北朝丝路实物中都有它的身影，融合了中原、西域与佛教艺术。',
      technique:
        '团花折法把纸折成放射楔形，一次落剪、旋转复制，展开即得一朵向四周盛放的团花——这是古人「一剪得圆满」的智慧。',
      focus:
        '蝴蝶（蝶恋花，喻爱情）+ 牡丹（富贵）＝蝶恋花开。看它如何在旋转对称里被复制成一整圈祝福。',
    },
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
    id: 'zodiac',
    order: 5,
    title: '生肖传奇',
    subtitle: '玉兔配梅，玉兔迎春',
    region: '年俗 · 十二生肖',
    foldSuggestion: 'book',
    narrative: [
      '纸灵：又到辞旧迎新。十二生肖轮流坐庄，每一年都有它的守护动物。',
      '今年剪一只玉兔——月宫捣药的精灵；再添一枝寒梅，报一报春信。',
      '玉兔守岁，寒梅报春，合起来便是「玉兔迎春」，把新年剪进红纸。',
    ],
    reading: {
      origin:
        '生肖文化自汉代系统化，春节剪当年生肖是普遍年俗。本命动物被剪得格外醒目，配上花草云纹，既应景又纳福。',
      technique:
        '对折剪生肖，既保对称的端庄，又便于在一侧添加梅枝、花草，让画面更有生气。',
      focus:
        '玉兔（生肖 / 守岁）+ 梅（报春第一花）＝玉兔迎春。生肖与时令，在这里拼成一句迎新的话。',
    },
    objectiveMotifIds: ['rabbit', 'plum'],
    targetComboId: 'yu-tu-ying-chun',
    quiz: {
      question: '为什么梅花常用来「报春」？',
      options: ['梅花色彩最鲜艳', '梅凌寒先开，是报春第一花', '梅花最容易剪'],
      answer: 1,
      explain:
        '梅凌寒独开，是一年里最早的花，故称「报春」。它与玉兔相配，把生肖与时令一起剪成「玉兔迎春」。',
    },
    culturalFocus: '生肖文化 · 时令组合 · 玉兔迎春',
    cultureEntryIds: ['zodiac'],
    reward: '解锁文化档案：生肖剪纸',
  },
  {
    id: 'legacy',
    order: 6,
    title: '纸上传承',
    subtitle: '随心拼句，百花齐放',
    region: '尾声 · 自由创作',
    foldSuggestion: 'four',
    narrative: [
      '纸灵：你已走过南北与丝路，也学会了「看图说吉话」。最后的卷轴，交给你自己。',
      '试着自己拼句：蝠配桃是福寿双全，喜鹊配梅是喜上眉梢……换纹样、换折法，读出你自己的祝福。',
      '剪纸从不是标本。它活在每一次展开的红纸里，也活在你愿意分享的瞬间。',
    ],
    reading: {
      origin:
        '2006 年中国剪纸列入国家级非遗，2009 年入选人类非遗代表作。今天它与游戏、设计、展览相融，在年轻人手里继续生长。',
      technique:
        '四折、团花、对折、单面——任你自由切换。不同折法配不同纹样，能拼出千变万化的吉语。',
      focus:
        '这一章没有固定答案：在工坊里自由拼合纹样，凑齐一句吉语，图谱就会为你记下。',
    },
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
    reward: '解锁文化档案：活态的非遗',
  },
];

export function getChapter(id: string): JianzhiChapter | undefined {
  return JIANZHI_CHAPTERS.find((c) => c.id === id);
}
