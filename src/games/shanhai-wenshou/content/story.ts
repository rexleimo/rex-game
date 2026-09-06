import type { StoryBeat } from '../core/types.ts';

/**
 * 《鹊山首经》主线剧情。
 *
 * 顺序：序章（南山馆入卷）→ 十山 → 终章（祭山）。
 * 每座山固定节点：open / beforeBoss / afterBoss / cleared；
 * 另有 13 条「收服」小回放。所有引文出《山海经·南山经》。
 */

export const STORY_BEATS: StoryBeat[] = [
  // ============ 序章 ============
  {
    id: 'open-1',
    at: { kind: 'chapterOpen' },
    speaker: '南山馆',
    aside: true,
    text: '展柜里只有半卷图志。纸色很旧，第一页写着：「凡䧿山之首，自招摇之山以至箕尾之山，凡十山，二千九百五十里。」你伸手去翻，指尖一凉——海风了。',
  },
  {
    id: 'open-2',
    at: { kind: 'chapterOpen' },
    speaker: '图志',
    text: '别翻那么快！我是灵鵌的图志，他是我主人的爷爷，把我留给了徒弟阿蘅——也就是你。眼下写进来的只有九座山，可总纲明明记着「凡十山」。少的那一座，我们一路找过去。',
  },
  {
    id: 'open-3',
    at: { kind: 'chapterOpen' },
    speaker: '阿蘅',
    text: '师父前年沿南山经采药，说要把十山走全。两年了，只有这一卷图志寄回山门，后面是空的。',
  },
  {
    id: 'open-4',
    at: { kind: 'chapterOpen' },
    speaker: '图志',
    text: '他把问兽的本事留在了批注里。记住第一条：「问兽问的是性，不是命。原文写『食之善走』『佩之不畏』，是共生之约，不是猎杀之令。」',
  },
  {
    id: 'open-5',
    at: { kind: 'chapterOpen' },
    speaker: '图志',
    text: '路上遇兽，先「问」后打：答对它的底细，它就会露出破绽；答错，它可要发怒的。问透了的兽，可以收服。走吧，第一座山在等你——招摇之山，临西海之上。',
  },

  // ============ 一 · 招摇之山 ============
  {
    id: 'zy-open-1',
    at: { kind: 'mountainOpen', mountain: 'zhaoyao' },
    speaker: '图志',
    text: '「南山经之首曰䧿山。其首曰招摇之山，临于西海之上，多桂，多金玉。」听，桂香混着海风。这座山最好认：祝余草贴着崖根开青花，迷榖的枝子在暮色里发光。',
  },
  {
    id: 'zy-open-2',
    at: { kind: 'mountainOpen', mountain: 'zhaoyao' },
    speaker: '图志',
    text: '采药先采这两样：祝余「食之不饥」是路上的干粮；迷榖「佩之不迷」，青丘那种瘴林里能救命。育沛生在水边，「佩之无瘕疾」——到了猿翼你就知道它多要紧。',
  },
  {
    id: 'zy-open-3',
    at: { kind: 'mountainOpen', mountain: 'zhaoyao' },
    speaker: '阿蘅',
    text: '山径上有伏行的影子——白耳朵，动作轻得像一阵风。',
  },
  {
    id: 'zy-open-4',
    at: { kind: 'mountainOpen', mountain: 'zhaoyao' },
    speaker: '图志',
    text: '「有兽焉，其状如禺而白耳，伏行人走，其名曰狌狌，食之善走。」狌狌性灵而怯，见人先观望。第一课：探索山野会遇到兽，打赢是本事，问明是功课。',
  },
  {
    id: 'zy-boss',
    at: { kind: 'beforeBoss', mountain: 'zhaoyao' },
    speaker: '图志',
    text: '山祠在桂树下。守祠的老狌狌拦住你，白耳一抖一抖。批注里写：「守祠兽必问三题，此问兽士之礼。」——答对，祠门为你开。',
  },
  {
    id: 'zy-after',
    at: { kind: 'afterBoss', mountain: 'zhaoyao' },
    speaker: '白耳翁',
    text: '（老狌狌人立而起，行了个拙拙的礼）……伏行，人走。山门开了。少年人，替我们把这些名字记下去。',
  },
  {
    id: 'zy-clear',
    at: { kind: 'mountainCleared', mountain: 'zhaoyao' },
    speaker: '图志',
    text: '招摇毕。你在祠里种下一枝迷榖，学了祠祭的头一课：璋玉瘗毛，稌米为糈。向东三百里——堂庭之山。',
  },

  // ============ 二 · 堂庭之山 ============
  {
    id: 'tt-open-1',
    at: { kind: 'mountainOpen', mountain: 'tangting' },
    speaker: '图志',
    text: '「又东三百里，曰堂庭之山，多棪木，多白猿，多水玉，多黄金。」原文就这么一句，短得像赶路。可山上的白猿，能把一句话吵成一整座林子。',
  },
  {
    id: 'tt-open-2',
    at: { kind: 'mountainOpen', mountain: 'tangting' },
    speaker: '牧童阿果',
    text: '喂！你也是来拾水玉的？白猿抢了我两回果子了，扔石头又打不着——你那杖子看着厉害，帮我要回来呗？',
  },
  {
    id: 'tt-open-3',
    at: { kind: 'mountainOpen', mountain: 'tangting' },
    speaker: '图志',
    text: '白猿臂长过膝，好戏闹、无恶意。碰上了先别慌着动手——「问」清了再定。棪木实是他们最护的东西，你采的时候留两颗在枝上，山有山的规矩。',
  },
  {
    id: 'tt-boss',
    at: { kind: 'beforeBoss', mountain: 'tangting' },
    speaker: '白猿王',
    text: '（白猿王把棪木果码成一排，指指果子，又指指你——先答题，答错，长臂伺候。）',
  },
  {
    id: 'tt-after',
    at: { kind: 'afterBoss', mountain: 'tangting' },
    speaker: '牧童阿果',
    text: '赢了？！那……那我的果子呢？哎，它把一整枝都折给你了！白猿王的果，整个堂庭就我阿哥受过一回！',
  },
  {
    id: 'tt-clear',
    at: { kind: 'mountainCleared', mountain: 'tangting' },
    speaker: '图志',
    text: '堂庭毕。水玉装了小半袋。批注：「山有产，人有分，祭有余。」这就是原文连着写「多棪木，多白猿，多水玉，多黄金」的意思——一座山的家底。',
  },

  // ============ 三 · 猿翼之山 ============
  {
    id: 'yy-open-1',
    at: { kind: 'mountainOpen', mountain: 'yuanyi' },
    speaker: '图志',
    text: '「又东三百八十里，曰猿翼之山，其中多怪兽，水多怪鱼，多白玉，多蝮虫，多怪蛇，多怪木，不可以上。」先记住最后四个字：不可以上。',
  },
  {
    id: 'yy-open-2',
    at: { kind: 'mountainOpen', mountain: 'yuanyi' },
    speaker: '采药婆婆',
    text: '后生，也敢进猿翼？瘴气从里头漫出来，蛇比落叶还多。你若是来寻人，倒有个信儿：前年有个高个子的巫，背着一卷图，往瘴深处去了。多带上几瓶育沛，佩之无瘕疾——婆婆的话不哄你。',
  },
  {
    id: 'yy-open-3',
    at: { kind: 'mountainOpen', mountain: 'yuanyi' },
    speaker: '阿蘅',
    text: '（杖尖挑开一片腐叶，下面压着半枚玉牌——是师父拴杖穗的那种。）师父果然到过这里。',
  },
  {
    id: 'yy-open-4',
    at: { kind: 'mountainOpen', mountain: 'yuanyi' },
    speaker: '图志',
    text: '瘴入骨，战斗一开始你就要染瘴。别贪进，打两场回祠歇一场。批注：「蝮虫蛇虫，皆山之浊气所钟——浊气有源，寻源去瘴。」',
  },
  {
    id: 'yy-boss',
    at: { kind: 'beforeBoss', mountain: 'yuanyi' },
    speaker: '图志',
    text: '最大的蝮虫盘在白石上，周身瘴气打旋——猿翼的瘴，源头多半在它领着的那片「失祀」的洞窟。问清它，或是压服它，山口能松一口气。',
  },
  {
    id: 'yy-after',
    at: { kind: 'afterBoss', mountain: 'yuanyi' },
    speaker: '采药婆婆',
    text: '瘴退了半分！好后生。那洞窟深处还在冒——你倒是把婆婆的育沛都喝完了。去吧去吧，往东，别回头。',
  },
  {
    id: 'yy-clear',
    at: { kind: 'mountainCleared', mountain: 'yuanyi' },
    speaker: '图志',
    text: '猿翼毕。「不可以上」的山，我们到底用「问」上去了。记下：瘴不是兽的错，是失祀的错。东边三百七十里，杻阳之山。',
  },

  // ============ 四 · 杻阳之山 ============
  {
    id: 'ny-open-1',
    at: { kind: 'mountainOpen', mountain: 'niuyang' },
    speaker: '图志',
    text: '「其阳多赤金，其阴多白金。」一座山，阳面走红运，阴面走财运。听见唱歌了吗？「其音如谣」——那不是人，是鹿蜀。',
  },
  {
    id: 'ny-open-2',
    at: { kind: 'mountainOpen', mountain: 'niuyang' },
    speaker: '渔户阿潮',
    text: '怪水的水位又涨了，旋龟好些天没浮上来晒背。往年这时候，龟背驮着日头，水里金晃晃的……今年那龟浮上来的时候，甲缝里都是黑的。',
  },
  {
    id: 'ny-open-3',
    at: { kind: 'mountainOpen', mountain: 'niuyang' },
    speaker: '图志',
    text: '「其状如龟而鸟首虺尾，其名曰旋龟，其音如判木，佩之不聋，可以为底。」旋龟守水，水浊则龟病。批注：「兽染瘴而形狂，其名不改，其性犹可问。」——瘴化的兽，也要问，不要只顾着打。',
  },
  {
    id: 'ny-boss',
    at: { kind: 'beforeBoss', mountain: 'niuyang' },
    speaker: '图志',
    text: '来了。旋龟浮上怪水，甲缝里黑瘴直冒——「瘴化」是失祀之瘴泡出来的狂态。它已不认歌声，但图志记得它的底细：问透它，再下手，轻重你拿。',
  },
  {
    id: 'ny-after',
    at: { kind: 'afterBoss', mountain: 'niuyang' },
    speaker: '渔户阿潮',
    text: '龟背上的黑气散了！它……它朝我点头了！阿蘅，今晚别走，潮家煮鱼——用怪水炖的，鲜！',
  },
  {
    id: 'ny-clear',
    at: { kind: 'mountainCleared', mountain: 'niuyang' },
    speaker: '图志',
    text: '杻阳毕。你收了旋龟——「佩之不聋」，往后山鬼之啸也震不浊你的耳。往东三百里，柢山。那是一座没有树的山。',
  },

  // ============ 五 · 柢山 ============
  {
    id: 'di-open-1',
    at: { kind: 'mountainOpen', mountain: 'dishan' },
    speaker: '图志',
    text: '「又东三百里柢山，多水，无草木。」一座会发光的秃山——水洼连着水洼，把天上的云全接住了。',
  },
  {
    id: 'di-open-2',
    at: { kind: 'mountainOpen', mountain: 'dishan' },
    speaker: '守祠人',
    text: '莫踩草皮。坡上那些伏着喘气的影子，是鯥。冬天你来看，它们硬得像石头，山里人都当它们死了；开春，羽先动，再睁眼，一声哞——满坡都活了。老话讲：山有鯥，春来早。',
  },
  {
    id: 'di-open-3',
    at: { kind: 'mountainOpen', mountain: 'dishan' },
    speaker: '图志',
    text: '「其状如牛，陵居，蛇尾有翼，其羽在魼下，其音如留牛，其名曰鯥，冬死而夏生，食之无肿疾。」记住这四个字——冬死夏生。等下打了你就明白。',
  },
  {
    id: 'di-boss',
    at: { kind: 'beforeBoss', mountain: 'dishan' },
    speaker: '守祠人',
    text: '要过柢山，先过冬醒之鯥这一关。丑话在前：它倒下去，未必是真倒。你问它三问，问透了，它站起来时才会朝你哞一声。',
  },
  {
    id: 'di-after',
    at: { kind: 'afterBoss', mountain: 'dishan' },
    speaker: '图志',
    text: '看见了吗——它倒下，气若游丝；片刻，羽动，再起！「冬死而夏生」不是传说，是它的活法。批注：「蛰伏非死，勿扰其眠。」问兽士对蛰伏之兽，行礼即可。',
  },
  {
    id: 'di-clear',
    at: { kind: 'mountainCleared', mountain: 'dishan' },
    speaker: '图志',
    text: '柢山毕。鯥脯入囊，「食之无肿疾」。往东四百里，亶爰之山——那座山连原文都说「不可以上」。可我们还是要上。',
  },

  // ============ 六 · 亶爰之山 ============
  {
    id: 'dy-open-1',
    at: { kind: 'mountainOpen', mountain: 'danyuan' },
    speaker: '图志',
    text: '「又东四百里，曰亶爰之山，多水，无草木，不可以上。有兽焉，其状如狸而有髦，其名曰类，自为牝牡，食者不妒。」',
  },
  {
    id: 'dy-open-2',
    at: { kind: 'mountainOpen', mountain: 'danyuan' },
    speaker: '阿蘅',
    text: '这座山安静得……听得见自己心跳。师父的批注说，亶爰的静，是把人心里吵的东西一层层洗掉。',
  },
  {
    id: 'dy-open-3',
    at: { kind: 'mountainOpen', mountain: 'danyuan' },
    speaker: '图志',
    text: '类就在水口坐着。它不逃，也不攻——「自为牝牡」，一身俱足，无须争抢。此山之关，不在刀杖，在你答不答得上来它的问题。批注：「食者不妒——不妒，方能入此山。」',
  },
  {
    id: 'dy-boss',
    at: { kind: 'beforeBoss', mountain: 'danyuan' },
    speaker: '类',
    text: '（它抬起头，鬃毛笔直。没有敌意，只有三道题。）',
  },
  {
    id: 'dy-after',
    at: { kind: 'afterBoss', mountain: 'danyuan' },
    speaker: '类',
    text: '（答完了。它转身没入水汽，尾梢一点，像盖了个印。）',
  },
  {
    id: 'dy-clear',
    at: { kind: 'mountainCleared', mountain: 'danyuan' },
    speaker: '图志',
    text: '亶爰毕。你在这座山上学会的不是打——是不妒。批注：「问兽先问己。」往东三百里，基山。那里有九条尾巴的羊，和三颗脑袋的鸡。',
  },

  // ============ 七 · 基山 ============
  {
    id: 'ji-open-1',
    at: { kind: 'mountainOpen', mountain: 'jishan' },
    speaker: '图志',
    text: '「其阳多玉，其阴多怪木。」阳坡养玉，阴坡养怪——基山把好脾气和坏脾气都摆在明面上。',
  },
  {
    id: 'ji-open-2',
    at: { kind: 'mountainOpen', mountain: 'jishan' },
    speaker: '玉匠石叔',
    text: '小伙子，阳坡的玉随便看，阴坡的木别去碰。前年有个货郎不服气，非说怪木能雕器——进去半日，出来时鬓角全白了。夜里别看阴坡，影子会拼成人脸，六只眼。',
  },
  {
    id: 'ji-open-3',
    at: { kind: 'mountainOpen', mountain: 'jishan' },
    speaker: '图志',
    text: '「其状如鸡而三首、六目、六足、三翼，其名曰𪁺𩿧，食之无卧。」三颗头各想各的，吵到天亮。它在树杈上睡着了都睁着眼——六只，全睁着。',
  },
  {
    id: 'ji-boss',
    at: { kind: 'beforeBoss', mountain: 'jishan' },
    speaker: '图志',
    text: '猼訑转过身去——不是逃，是用背上的眼睛看你。「其目在背」，它从不正眼看人，可谁也躲不开它的注视。石叔说：敢与背目对望的人，佩它皮毛才有用。',
  },
  {
    id: 'ji-after',
    at: { kind: 'afterBoss', mountain: 'jishan' },
    speaker: '玉匠石叔',
    text: '好小子！猼訑把九条尾巴都甩给你看了——那是不怕你的意思。山里老话：佩之不畏的人，先得自己不畏。',
  },
  {
    id: 'ji-clear',
    at: { kind: 'mountainCleared', mountain: 'jishan' },
    speaker: '图志',
    text: '基山毕。𪁺𩿧的羽毛别贪多，三颗头会记仇。往东三百里——青丘之山。批注到这一页，师父的字突然潦草：「其音如婴儿。夜里，别循声走。」',
  },

  // ============ 八 · 青丘之山 ============
  {
    id: 'qq-open-1',
    at: { kind: 'mountainOpen', mountain: 'qingqiu' },
    speaker: '图志',
    text: '「其阳多玉，其阴多青雘。」玉与矿彩，青丘的家底。可全篇原文里，人只记住了下一句——「有兽焉，其状如狐而九尾」。',
  },
  {
    id: 'qq-open-2',
    at: { kind: 'mountainOpen', mountain: 'qingqiu' },
    speaker: '山民老羊',
    text: '又是问兽的？听我一回：夜里听见婴儿哭，千万、千万别循声走。去年冬天，村里丢了三只羊——兽是狐形，尾影分了九股。它没伤人，可谁也不敢往深处去了。',
  },
  {
    id: 'qq-open-3',
    at: { kind: 'mountainOpen', mountain: 'qingqiu' },
    speaker: '图志',
    text: '批注里师父写：「能食人，食者不蛊——先问其名，再问其性。」九尾之名吓人，原文却记了「食者不蛊」：它的肉能让人不受妖邪蛊惑。凶与祥，写在同一句里。问兽士的功课，是把这句话读全。',
  },
  {
    id: 'qq-open-4',
    at: { kind: 'mountainOpen', mountain: 'qingqiu' },
    speaker: '阿蘅',
    text: '头顶有呵斥声劈下来——灌灌在替谁守林？雾里有婴儿啼，近了，又远了。',
  },
  {
    id: 'qq-boss',
    at: { kind: 'beforeBoss', mountain: 'qingqiu' },
    speaker: '九尾狐',
    text: '（雾散开一线。九条尾如焰铺展。它叫了一声——像婴儿，也像在问：你为什么要来？）',
  },
  {
    id: 'qq-after',
    at: { kind: 'afterBoss', mountain: 'qingqiu' },
    speaker: '图志',
    text: '它收了尾，蹲坐在你面前——不是臣服，是认可。批注最后一行，师父写：「其音如婴儿，是它的话；其状如狐，是你的怕。问兽，问的是话与怕之间的那条路。」',
  },
  {
    id: 'qq-clear',
    at: { kind: 'mountainCleared', mountain: 'qingqiu' },
    speaker: '山民老羊',
    text: '九尾……九尾朝村口叫了三声，清清亮亮，像娃娃笑！老汉我说句道谢的话：往后夜里再有婴儿声，我挑灯出门看一眼，不再锁门了。',
  },

  // ============ 九 · 箕尾之山 ============
  {
    id: 'jw-open-1',
    at: { kind: 'mountainOpen', mountain: 'jiwei' },
    speaker: '图志',
    text: '「又东三百五十里，曰箕尾之山，其尾踆于东海，多沙石。」山尾踆于东海——你看，山是真的把脚伸进海里了。浪一拍，白玉就在滩上滚。',
  },
  {
    id: 'jw-open-2',
    at: { kind: 'mountainOpen', mountain: 'jiwei' },
    speaker: '海女珠娘',
    text: '你是第九个走到海尾的人？前十山我数得清：招摇起，箕尾住。可爷爷传下的歌里唱的是十座山——歌比经文多一座，怪吧？歌里那座没名字，只在潮最低的时候露半面崖。',
  },
  {
    id: 'jw-open-3',
    at: { kind: 'mountainOpen', mountain: 'jiwei' },
    speaker: '图志',
    text: '「汸水出焉，而南流注于淯，其中多白玉。」白菅生在祠旁，糈要稌米——祭山的家什，这一站配齐。师父的杖记在滩头最东的礁石上：箭头，指着潮线之外。',
  },
  {
    id: 'jw-boss',
    at: { kind: 'beforeBoss', mountain: 'jiwei' },
    speaker: '图志',
    text: '灌灌群守着最后的滩口。领头的呵斥声又急又哑——它们替山神守路，也替那座失了名的山守门。问过，礼过，它们会让开。',
  },
  {
    id: 'jw-after',
    at: { kind: 'afterBoss', mountain: 'jiwei' },
    speaker: '海女珠娘',
    text: '潮退了！看——正东海面，露出来了，半面崖！歌里唱的第十山！阿蘅，你真把它找着了。',
  },
  {
    id: 'jw-clear',
    at: { kind: 'mountainCleared', mountain: 'jiwei' },
    speaker: '图志',
    text: '箕尾毕。有名之山，到此走全。最后一步不在原文里，在你脚下——趁潮，上那座无名的山。',
  },

  // ============ 终章 · 无名之山 ============
  {
    id: 'wm-open-1',
    at: { kind: 'mountainOpen', mountain: 'wuming' },
    speaker: '图志',
    text: '「凡䧿山之首，自招摇之山以至箕尾之山，凡十山，二千九百五十里，其神状皆鸟身而龙首。」原文记得清清楚楚：十山。可走过来的，只有九座有名有姓。第十座山不是没有——是没人记得它了。',
  },
  {
    id: 'wm-open-2',
    at: { kind: 'mountainOpen', mountain: 'wuming' },
    speaker: '阿蘅',
    text: '瘴从四面八方拢过来，比猿翼浓十倍。可瘴的中心不是兽——是山本身在漏气。一座山被忘得太久，连山神都聚不拢形。',
  },
  {
    id: 'wm-open-3',
    at: { kind: 'mountainOpen', mountain: 'wuming' },
    speaker: '师父·灵鵌',
    text: '（雾里一点火光，有人靠崖而坐，须发结霜，膝上一卷熟悉的图——）阿蘅？……两年了。为师被困在这失祀的雾里，走不出去。每日向兽问名、依礼投糈，才换得一口活气。你……把十山走全了？',
  },
  {
    id: 'wm-open-4',
    at: { kind: 'mountainOpen', mountain: 'wuming' },
    speaker: '师父·灵鵌',
    text: '好，好。祭山的家什带齐了吗——璋玉、稌米、白菅。雾核不破，谁也出不去；破雾不用杖，用礼。先清了那团瘴核，再随我行祭。',
  },
  {
    id: 'wm-boss',
    at: { kind: 'beforeBoss', mountain: 'wuming' },
    speaker: '图志',
    text: '瘴核裹着鸟身龙首的轮廓——那不是敌人，那是山神散掉的形。问它，答它，用你一路上问来的所有底细。它在等一个记得它的人。',
  },
  {
    id: 'wm-after',
    at: { kind: 'afterBoss', mountain: 'wuming' },
    speaker: '山神·鸟身龙首',
    text: '（雾散。鸟身龙首的形貌在空中缓缓聚拢，双翼覆下，如一整座山俯身。）——凡十山。今日，十山俱全。',
  },
  {
    id: 'wm-rite',
    at: { kind: 'mountainCleared', mountain: 'wuming' },
    speaker: '师父·灵鵌',
    text: '依礼来——毛用一璋玉瘗，糈用稌米，一璧稻米、白菅为席。十问祭成，此山复明。它叫什么名字？经上没写……阿蘅，你来。',
  },
  {
    id: 'end-1',
    at: { kind: 'chapterEnd' },
    speaker: '图志',
    text: '你在空页上落笔：其名曰「问」。师父看着那两个字，笑了：好名字。山不语，人问之；问而志之，山遂有名。',
  },
  {
    id: 'end-2',
    at: { kind: 'chapterEnd' },
    speaker: '师父·灵鵌',
    text: '南山经第一脉，你从头读到了尾——不是用眼睛，是用脚。二千九百五十里，十座山，十三种兽，一整篇祭礼。往后翻，还有西山经、北山经、东山经、中山经……图志先收好，路还长。',
  },
  {
    id: 'end-3',
    at: { kind: 'chapterEnd' },
    speaker: '图志',
    text: '通关之后，山径不会关——「巡山」每日一道新遭遇，按着日历来。图鉴里灰着名字的兽，也还等你问全。展品到这里，可山海经远没完。',
  },
  {
    id: 'end-4',
    at: { kind: 'chapterEnd' },
    speaker: '南山馆',
    aside: true,
    text: '展柜的玻璃上多了一层海雾，你的指尖还留着潮气。第一页的原文轻轻发亮：「凡十山，二千九百五十里。」——现在你知道，每一里都走过。',
  },

  // ============ 收服回放（13 条） ============
  { id: 'tame-xingxing', at: { kind: 'tamed', beast: 'xingxing' }, speaker: '图志', text: '狌狌入栏！「食之善走」——往后它伏在你杖头，走路都带风。' },
  { id: 'tame-baiyuan', at: { kind: 'tamed', beast: 'baiyuan' }, speaker: '图志', text: '白猿入栏！臂长过膝，摘果子、递物件都好使——就是会偷吃你囊里的棪木实。' },
  { id: 'tame-fuchong', at: { kind: 'tamed', beast: 'fuchong' }, speaker: '图志', text: '蝮虫入栏！毒涎成了以毒攻毒的引子——婆婆若知道，怕要念你半宿。' },
  { id: 'tame-guaishe', at: { kind: 'tamed', beast: 'guaishe' }, speaker: '图志', text: '怪蛇入栏！蜕下的皮正好补你那面旧鼓。' },
  { id: 'tame-lushu', at: { kind: 'tamed', beast: 'lushu' }, speaker: '图志', text: '鹿蜀入栏！「其音如谣」——夜里扎营，它唱歌，你睡得香。' },
  { id: 'tame-xuangui', at: { kind: 'tamed', beast: 'xuangui' }, speaker: '图志', text: '旋龟入栏！「佩之不聋」——山鬼之啸、婴啼之惑，都浊不了你的耳朵。' },
  { id: 'tame-lu', at: { kind: 'tamed', beast: 'lu' }, speaker: '图志', text: '鯥入栏！「冬死而夏生」——危急时它替你蛰一次，再还你一条命。' },
  { id: 'tame-lei', at: { kind: 'tamed', beast: 'lei' }, speaker: '图志', text: '类入栏！「食者不妒」——有它卧在囊上，你夜里连梦都清净。' },
  { id: 'tame-boyi', at: { kind: 'tamed', beast: 'boyi' }, speaker: '图志', text: '猼訑入栏！「佩之不畏」——背上那双眼睛，从此替你看身后。' },
  { id: 'tame-changfu', at: { kind: 'tamed', beast: 'changfu' }, speaker: '图志', text: '𪁺𩿧入栏！「食之无卧」——三颗头轮着值夜，你赚了个整觉。' },
  { id: 'tame-guanguan', at: { kind: 'tamed', beast: 'guanguan' }, speaker: '图志', text: '灌灌入栏！「佩之不惑」——它的呵斥声，专治雾里走神。' },
  { id: 'tame-chiru', at: { kind: 'tamed', beast: 'chiru' }, speaker: '图志', text: '赤鱬入栏！人面有悲喜，「其音如鸯鸳」——它和鸣的时候，你也会跟着笑。' },
  { id: 'tame-jiuwei', at: { kind: 'tamed', beast: 'jiuwei' }, speaker: '图志', text: '九尾狐入栏！！「食者不蛊」——凶名之下是句吉语。师父知道了，该把那一页批注念给你听。' },
];

export function beatsFor(predicate: (beat: StoryBeat) => boolean): StoryBeat[] {
  return STORY_BEATS.filter(predicate);
}

/* ============ 差分结局（GDD §4.5：终章结算差分结局） ============
 * 结局由「驯向指数 + 山望总和」决定：收服为主走「万兽同行」，
 * 杀伐为主走「无名之刃」，其间为「问名者」；二周目通关另有终笔。 */

export type EndingId = 'tame' | 'kill' | 'mid' | 'ng';

export const ENDINGS: Record<EndingId, StoryBeat[]> = {
  tame: [
    { id: 'end-tame-1', at: { kind: 'chapterEnd' }, ng: true, speaker: '师父·灵鵌', text: '（师父翻到最后一页，那里伏着十三个名字，一个比一个亮。）——你一路都在问，问到最后，兽先答了你。它们不是被收服的，阿蘅，它们是认了你。' },
    { id: 'end-tame-2', at: { kind: 'chapterEnd' }, ng: true, speaker: '图志', text: '十山祭遍，山望温热。往后的夜里，杖头有狌狌带路，营边有鹿蜀的歌，九尾替你守着雾——以名定形，以善终卷。这一脉，被你读成了「同行」。' },
  ],
  kill: [
    { id: 'end-kill-1', at: { kind: 'chapterEnd' }, ng: true, speaker: '师父·灵鵌', text: '（师父看着你杖上未干的墨，沉默了很久。）——了断也是问的一种答法。只是阿蘅，杖越用越快，名字就越记越少。下一脉，试试先问，再动手。' },
    { id: 'end-kill-2', at: { kind: 'chapterEnd' }, ng: true, speaker: '图志', text: '十山祭遍，山风里却少了些声音。材料入囊，皮毛御寒——你替村子清了瘴，也替图志添了几页再画不出的兽。这一脉，被你读成了「刀」。' },
  ],
  mid: [
    { id: 'end-mid-1', at: { kind: 'chapterEnd' }, ng: true, speaker: '师父·灵鵌', text: '（师父合上你带回来的图志，指腹在封皮上按了按。）——有的名字你问了回来，有的你替它们收了尾。问与断，都是礼。你已经是问兽的人了。' },
    { id: 'end-mid-2', at: { kind: 'chapterEnd' }, ng: true, speaker: '图志', text: '十山祭遍，山安民安。图志里亮着一些名字、空着一些名字——空着的地方不催你，山一直都在。这一脉，被你读成了「问」。' },
  ],
  ng: [
    { id: 'end-ng-1', at: { kind: 'chapterEnd' }, ng: true, speaker: '师父·灵鵌', text: '（第二遍走完，师父把你的图志倒过来又读了一遍，笑了。）——同一条路，第二遍走，兽变老了，你也是。可你问出来的东西不一样了——这一遍，你问的是「为什么记名字」。' },
    { id: 'end-ng-2', at: { kind: 'chapterEnd' }, ng: true, speaker: '南山馆', aside: true, text: '（展柜玻璃上的海雾退了。第一页的原文旁边，多了一行小字——是参观的孩子写下的：「原来山记得，是有人走过。」）' },
  ],
};

/** 结局选择（纯函数）：驯向/杀向/中庸；二周目固定 NG 终笔。 */
export function pickEnding(ngPlus: number, tameRateValue: number, favorTotal: number): EndingId {
  if (ngPlus > 0) return 'ng';
  if (favorTotal >= 8 && tameRateValue >= 0.55) return 'tame';
  if (favorTotal <= -3 || tameRateValue <= 0.2) return 'kill';
  return 'mid';
}

/* ============ 二周目开场（ngPlus>0 时替代首周序章） ============ */

export const NG_OPEN_BEATS: StoryBeat[] = [
  { id: 'ng-open-1', at: { kind: 'chapterOpen' }, ng: true, speaker: '图志', text: '第二遍展卷。图志里的名字都还亮着，可山把瘴又拢了回来——兽老了一轮，你也该老练一轮。十山，重问。' },
  { id: 'ng-open-2', at: { kind: 'chapterOpen' }, ng: true, speaker: '师父·灵鵌', text: '（师父把你的旧杖重新缠了穗。）——路没变，问法要变。这一遍，试试看看它们为什么守山。' },
];
