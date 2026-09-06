import type { BeastId, MountainId } from '../core/types.ts';

/**
 * 「问兽」题库。
 *
 * 每道题都锚定《南山经》原文，explain 里回放原文依据。
 * 问兽战斗中按 refId（兽）抽题；祠祭小考按山抽（subject: 'mountain'）；
 * 终章大祭十问从 'rite' 与全章混抽。
 */

export type QuestionSubject = 'beast' | 'mountain' | 'rite';

export interface QuestionDef {
  id: string;
  subject: QuestionSubject;
  /** 兽 id / 山 id / 'que'（鹊山首脉总纲）。 */
  refId: string;
  prompt: string;
  options: string[];
  answer: number;
  explain: string;
}

export const QUESTIONS: QuestionDef[] = [
  // —— 狌狌 ——
  {
    id: 'q-xx-1',
    subject: 'beast',
    refId: 'xingxing',
    prompt: '眼前这只白耳小兽，原文说它「其状如」什么？',
    options: ['禺（猿猴）', '马', '狸', '羊'],
    answer: 0,
    explain: '「其状如禺而白耳，伏行人走」——禺即猿猴类。',
  },
  {
    id: 'q-xx-2',
    subject: 'beast',
    refId: 'xingxing',
    prompt: '狌狌的耳朵是什么颜色？',
    options: ['黑色', '白色', '赤色', '青色'],
    answer: 1,
    explain: '「其状如禺而白耳」——白耳是它的标志。',
  },
  {
    id: 'q-xx-3',
    subject: 'beast',
    refId: 'xingxing',
    prompt: '吃了狌狌，会得到什么好处？',
    options: ['食之不饥', '食之善走', '食之无肿疾', '食者不妒'],
    answer: 1,
    explain: '「食之善走」——脚力变好，所以采药人常寻它。',
  },
  {
    id: 'q-xx-4',
    subject: 'beast',
    refId: 'xingxing',
    prompt: '狌狌的行止是什么样？',
    options: ['伏行人走', '凌空而飞', '伏于水底', '昼伏夜鸣'],
    answer: 0,
    explain: '「伏行人走」——既能趴着走，也能像人一样站起来走。',
  },

  // —— 白猿 ——
  {
    id: 'q-by-1',
    subject: 'beast',
    refId: 'baiyuan',
    prompt: '堂庭山上与白猿同生的果树是？',
    options: ['迷榖', '棪木', '桂', '祝余'],
    answer: 1,
    explain: '「多棪木，多白猿」——棪木之实正是白猿的食物。',
  },
  {
    id: 'q-by-2',
    subject: 'beast',
    refId: 'baiyuan',
    prompt: '堂庭山还多产什么美石？',
    options: ['青雘', '水玉', '白金', '赤金'],
    answer: 1,
    explain: '「多水玉，多黄金」——水玉即水色的美玉。',
  },

  // —— 蝮虫 / 怪蛇 ——
  {
    id: 'q-fc-1',
    subject: 'beast',
    refId: 'fuchong',
    prompt: '猿翼山为什么「不可以上」？',
    options: ['山太高', '多怪兽怪鱼蝮虫怪蛇，山势险恶', '被山神封禁', '无路可循'],
    answer: 1,
    explain: '「其中多怪兽，水多怪鱼，多白玉，多蝮虫，多怪蛇，多怪木，不可以上。」',
  },
  {
    id: 'q-fc-2',
    subject: 'beast',
    refId: 'fuchong',
    prompt: '进入瘴重的猿翼山，最好备着哪种东西？',
    options: ['育沛', '迷榖佩', '璋玉', '棪木实'],
    answer: 0,
    explain: '「佩之无瘕疾」——育沛正是克制瘴疾之物。',
  },
  {
    id: 'q-gs-1',
    subject: 'beast',
    refId: 'guaishe',
    prompt: '猿翼山中，与怪蛇并列「多」的是哪一项？',
    options: ['白玉', '祝余', '迷榖', '棪木'],
    answer: 0,
    explain: '「多白玉，多蝮虫，多怪蛇，多怪木」——祝余迷榖在招摇，棪木在堂庭。',
  },
  {
    id: 'q-gs-2',
    subject: 'beast',
    refId: 'guaishe',
    prompt: '原文说猿翼之山「不可以上」，它紧接在哪句之后？',
    options: ['多蝮虫，多怪蛇，多怪木', '多桂，多金玉', '多水，无草木', '其尾踆于东海'],
    answer: 0,
    explain: '「多白玉，多蝮虫，多怪蛇，多怪木，不可以上。」——险恶之物列尽，方接「不可以上」。',
  },

  // —— 鹿蜀 ——
  {
    id: 'q-ls-1',
    subject: 'beast',
    refId: 'lushu',
    prompt: '鹿蜀的叫声像什么？',
    options: ['劈木头', '人在唱歌', '鸳鸯和鸣', '婴儿啼哭'],
    answer: 1,
    explain: '「其音如谣」——像有人在唱山谣。',
  },
  {
    id: 'q-ls-2',
    subject: 'beast',
    refId: 'lushu',
    prompt: '佩戴鹿蜀的皮毛，原文说能带来什么？',
    options: ['佩之不聋', '佩之不畏', '佩之宜子孙', '佩之不迷'],
    answer: 2,
    explain: '「佩之宜子孙」——家道兴旺、多子多孙的吉兆。',
  },
  {
    id: 'q-ls-3',
    subject: 'beast',
    refId: 'lushu',
    prompt: '鹿蜀的长相，下列哪项是对的？',
    options: ['状如马而白首，文如虎而赤尾', '状如羊，九尾四耳', '状如狐而九尾', '状如鱼而人面'],
    answer: 0,
    explain: '「其状如马而白首，其文如虎而赤尾」。',
  },

  // —— 旋龟 ——
  {
    id: 'q-xg-1',
    subject: 'beast',
    refId: 'xuangui',
    prompt: '旋龟的头和尾分别像什么？',
    options: ['鸟首虺尾', '龙首鸟身', '马首蛇尾', '人面鱼身'],
    answer: 0,
    explain: '「其状如龟而鸟首虺尾」——龟身、鸟头、毒蛇尾。',
  },
  {
    id: 'q-xg-2',
    subject: 'beast',
    refId: 'xuangui',
    prompt: '旋龟的叫声像什么？',
    options: ['判木（劈木）', '谣歌', '婴儿', '留牛'],
    answer: 0,
    explain: '「其音如判木」——像劈开木头的闷响。',
  },
  {
    id: 'q-xg-3',
    subject: 'beast',
    refId: 'xuangui',
    prompt: '「佩之不聋」说的是哪一只？',
    options: ['鹿蜀', '旋龟', '灌灌', '类'],
    answer: 1,
    explain: '「其名曰旋龟……佩之不聋，可以为底。」',
  },

  // —— 鯥 ——
  {
    id: 'q-l-1',
    subject: 'beast',
    refId: 'lu',
    prompt: '鯥最神异的地方是？',
    options: ['冬死而夏生', '自为牝牡', '能食人', '三首六目'],
    answer: 0,
    explain: '「冬死而夏生」——冬天蛰伏如死，夏天再活过来。',
  },
  {
    id: 'q-l-2',
    subject: 'beast',
    refId: 'lu',
    prompt: '鯥住在什么地方？',
    options: ['深潭水底', '陵居（山坡上）', '东海之尾', '沼泽之中'],
    answer: 1,
    explain: '「有鱼焉，其状如牛，陵居」——鱼却住在山坡上。',
  },
  {
    id: 'q-l-3',
    subject: 'beast',
    refId: 'lu',
    prompt: '吃了鯥，能防什么病？',
    options: ['疥', '肿疾', '瘕疾', '聋'],
    answer: 1,
    explain: '「食之无肿疾」。',
  },
  {
    id: 'q-l-4',
    subject: 'beast',
    refId: 'lu',
    prompt: '柢山的地貌特点是？',
    options: ['多水，无草木', '多金玉', '多怪木', '多沙石'],
    answer: 0,
    explain: '「又东三百里柢山，多水，无草木。」',
  },

  // —— 类 ——
  {
    id: 'q-lei-1',
    subject: 'beast',
    refId: 'lei',
    prompt: '「类」最奇特的地方是？',
    options: ['九尾四耳', '自为牝牡（一身兼具雌雄）', '冬死夏生', '目在背'],
    answer: 1,
    explain: '「其名曰类，自为牝牡」。',
  },
  {
    id: 'q-lei-2',
    subject: 'beast',
    refId: 'lei',
    prompt: '吃了类，人会变得怎样？',
    options: ['不饥', '不妒', '不惑', '不疥'],
    answer: 1,
    explain: '「食者不妒」——不生妒忌之心。',
  },
  {
    id: 'q-lei-3',
    subject: 'beast',
    refId: 'lei',
    prompt: '类的外形像什么，头上有什么？',
    options: ['像狸而有髦（长毛）', '像羊而有角', '像鸡而有冠', '像马而有鬃'],
    answer: 0,
    explain: '「其状如狸而有髦」。',
  },

  // —— 猼訑 ——
  {
    id: 'q-byi-1',
    subject: 'beast',
    refId: 'boyi',
    prompt: '猼訑有几条尾巴、几只耳朵？',
    options: ['九尾四耳', '三首六目', '六足三翼', '一尾双耳'],
    answer: 0,
    explain: '「其状如羊，九尾四耳，其目在背」。',
  },
  {
    id: 'q-byi-2',
    subject: 'beast',
    refId: 'boyi',
    prompt: '猼訑的眼睛长在哪里？',
    options: ['额上', '背上', '尾上', '耳后'],
    answer: 1,
    explain: '「其目在背」——所以它从不正眼视人。',
  },
  {
    id: 'q-byi-3',
    subject: 'beast',
    refId: 'boyi',
    prompt: '佩戴猼訑，人就不……？',
    options: ['不迷', '不畏', '不惑', '不蛊'],
    answer: 1,
    explain: '「佩之不畏」——勇气的来源。',
  },
  {
    id: 'q-byi-4',
    subject: 'beast',
    refId: 'boyi',
    prompt: '基山的阴阳两面各多产什么？',
    options: ['阳多玉，阴多怪木', '阳多金，阴多玉', '阳多桂，阴多金', '阳多青雘，阴多白玉'],
    answer: 0,
    explain: '「其阳多玉，其阴多怪木」。',
  },

  // —— 𪁺𩿧 ——
  {
    id: 'q-cf-1',
    subject: 'beast',
    refId: 'changfu',
    prompt: '𪁺𩿧有几个头、几只眼、几只脚、几只翅膀？',
    options: ['三首、六目、六足、三翼', '九首、九目、九足、九翼', '一首、二目、四足、二翼', '六首、六目、六足、六翼'],
    answer: 0,
    explain: '「其状如鸡而三首、六目、六足、三翼」。',
  },
  {
    id: 'q-cf-2',
    subject: 'beast',
    refId: 'changfu',
    prompt: '吃了𪁺𩿧会怎样？',
    options: ['食之无卧（不必多睡）', '食之善走', '食之不饥', '食者不蛊'],
    answer: 0,
    explain: '「食之无卧」——精神百倍，不必贪睡。',
  },

  // —— 灌灌 ——
  {
    id: 'q-gg-1',
    subject: 'beast',
    refId: 'guanguan',
    prompt: '灌灌的叫声像什么？',
    options: ['如谣', '如呵', '如判木', '如鸯鸳'],
    answer: 1,
    explain: '「其音如呵」——像人厉声喝止。',
  },
  {
    id: 'q-gg-2',
    subject: 'beast',
    refId: 'guanguan',
    prompt: '佩戴灌灌，能免于什么？',
    options: ['不迷', '不畏', '不惑', '不聋'],
    answer: 2,
    explain: '「佩之不惑」——不受迷惑。',
  },

  // —— 赤鱬 ——
  {
    id: 'q-cr-1',
    subject: 'beast',
    refId: 'chiru',
    prompt: '赤鱬的长相是什么样？',
    options: ['状如鱼而人面', '状如牛而蛇尾', '状如龟而鸟首', '状如鸡而三首'],
    answer: 0,
    explain: '「其状如鱼而人面」——鱼身人面。',
  },
  {
    id: 'q-cr-2',
    subject: 'beast',
    refId: 'chiru',
    prompt: '赤鱬的叫声像什么？',
    options: ['鸯鸳（鸳鸯）', '婴儿', '呵斥', '判木'],
    answer: 0,
    explain: '「其音如鸯鸳」——双双和鸣。',
  },
  {
    id: 'q-cr-3',
    subject: 'beast',
    refId: 'chiru',
    prompt: '吃了赤鱬，防的是什么？',
    options: ['疥', '肿疾', '妒', '卧'],
    answer: 0,
    explain: '「食之不疥」。',
  },
  {
    id: 'q-cr-4',
    subject: 'beast',
    refId: 'chiru',
    prompt: '赤鱬栖居的英水流向哪里？',
    options: ['西海', '东海', '即翼之泽', '宪翼之水'],
    answer: 2,
    explain: '「英水出焉，南流注于即翼之泽」。',
  },

  // —— 九尾狐 ——
  {
    id: 'q-jw-1',
    subject: 'beast',
    refId: 'jiuwei',
    prompt: '九尾狐的叫声像什么？',
    options: ['婴儿', '鸳鸯', '谣歌', '呵斥'],
    answer: 0,
    explain: '「其音如婴儿」——夜里听来最要小心。',
  },
  {
    id: 'q-jw-2',
    subject: 'beast',
    refId: 'jiuwei',
    prompt: '原文说九尾狐「能食人」，但吃了它的人会……？',
    options: ['食者不蛊', '食者不妒', '食之善走', '食之无卧'],
    answer: 0,
    explain: '「能食人，食者不蛊」——凶与祥一体两面。',
  },
  {
    id: 'q-jw-3',
    subject: 'beast',
    refId: 'jiuwei',
    prompt: '九尾狐住在哪座山？',
    options: ['基山', '青丘之山', '杻阳之山', '箕尾之山'],
    answer: 1,
    explain: '「青丘之山……有兽焉，其状如狐而九尾」。',
  },
  {
    id: 'q-jw-4',
    subject: 'beast',
    refId: 'jiuwei',
    prompt: '青丘之山阴面多产什么矿彩？',
    options: ['青雘', '水玉', '白金', '赤金'],
    answer: 0,
    explain: '「其阳多玉，其阴多青雘」。',
  },

  // —— 山川总纲（祠祭小考 / 大祭用）——
  {
    id: 'q-m-zy',
    subject: 'mountain',
    refId: 'zhaoyao',
    prompt: '招摇之山临于哪片海？',
    options: ['西海', '东海', '南海', '北海'],
    answer: 0,
    explain: '「其首曰招摇之山，临于西海之上」。',
  },
  {
    id: 'q-m-zy2',
    subject: 'mountain',
    refId: 'zhaoyao',
    prompt: '迷榖的华（花）有什么异象？',
    options: ['其华四照', '其华如血', '其华夜明', '其华如雪'],
    answer: 0,
    explain: '「其华四照，其名曰迷榖，佩之不迷」。',
  },
  {
    id: 'q-m-tt',
    subject: 'mountain',
    refId: 'tangting',
    prompt: '堂庭山「又东三百里」——它距上一山约多少里？',
    options: ['三百里', '三百八十里', '四百里', '三百五十里'],
    answer: 0,
    explain: '「又东三百里，曰堂庭之山」。',
  },
  {
    id: 'q-m-yy',
    subject: 'mountain',
    refId: 'yuanyi',
    prompt: '猿翼山中不产下列哪项？',
    options: ['白玉', '蝮虫', '怪蛇', '祝余'],
    answer: 3,
    explain: '猿翼「多白玉，多蝮虫，多怪蛇，多怪木」；祝余只在招摇。',
  },
  {
    id: 'q-m-ny',
    subject: 'mountain',
    refId: 'niuyang',
    prompt: '杻阳之山阳面多什么？',
    options: ['赤金', '白金', '黄金', '水玉'],
    answer: 0,
    explain: '「其阳多赤金，其阴多白金」。',
  },
  {
    id: 'q-m-ny2',
    subject: 'mountain',
    refId: 'niuyang',
    prompt: '从怪水流出的玄龟叫什么？',
    options: ['旋龟', '玄龟', '三足龟', '陵龟'],
    answer: 0,
    explain: '「其中多玄龟……其名曰旋龟」。',
  },
  {
    id: 'q-m-di',
    subject: 'mountain',
    refId: 'dishan',
    prompt: '柢山的山体特征是？',
    options: ['多水，无草木', '多玉，多怪木', '多沙石', '不可以上'],
    answer: 0,
    explain: '「又东三百里柢山，多水，无草木。」',
  },
  {
    id: 'q-m-dy',
    subject: 'mountain',
    refId: 'danyuan',
    prompt: '亶爰之山「不可以上」的原因与哪句对应？',
    options: ['多水，无草木，不可以上', '多怪兽，不可以上', '其尾踆于东海', '其阴多怪木'],
    answer: 0,
    explain: '「曰亶爰之山，多水，无草木，不可以上。」',
  },
  {
    id: 'q-m-ji',
    subject: 'mountain',
    refId: 'jishan',
    prompt: '基山阴面多的是？',
    options: ['怪木', '青雘', '白金', '棪木'],
    answer: 0,
    explain: '「其阳多玉，其阴多怪木」。',
  },
  {
    id: 'q-m-qq',
    subject: 'mountain',
    refId: 'qingqiu',
    prompt: '英水从青丘出，流向哪里？',
    options: ['即翼之泽', '宪翼之水', '东海', '淯水'],
    answer: 0,
    explain: '「英水出焉，南流注于即翼之泽」。',
  },
  {
    id: 'q-m-jw',
    subject: 'mountain',
    refId: 'jiwei',
    prompt: '箕尾之山的山尾「踆于」何处？',
    options: ['东海', '西海', '即翼之泽', '淯水'],
    answer: 0,
    explain: '「其尾踆于东海，多沙石」——山尾蹲踞在东海里。',
  },
  {
    id: 'q-m-jw2',
    subject: 'mountain',
    refId: 'jiwei',
    prompt: '汸水中多产什么？',
    options: ['白玉', '赤金', '水玉', '青雘'],
    answer: 0,
    explain: '「汸水出焉，而南流注于淯，其中多白玉」。',
  },
  {
    id: 'q-m-wm',
    subject: 'mountain',
    refId: 'wuming',
    prompt: '「凡䧿山之首，自招摇之山以至箕尾之山，凡几山？」',
    options: ['十山', '九山', '八山', '十二山'],
    answer: 0,
    explain: '「凡十山，二千九百五十里」——但有名可考者九，第十山失载。',
  },
  {
    id: 'q-m-wm2',
    subject: 'mountain',
    refId: 'wuming',
    prompt: '鹊山首脉的山神，其状如何？',
    options: ['鸟身而龙首', '人面而马身', '龙身而鸟首', '人面蛇身'],
    answer: 0,
    explain: '「其神状皆鸟身而龙首」。',
  },

  // —— 祭祀礼（大祭十问核心）——
  {
    id: 'q-r-1',
    subject: 'rite',
    refId: 'que',
    prompt: '祠祭鹊山诸神，「毛」（祭肉）用什么盛瘗？',
    options: ['一璋玉瘗', '一璧瘗', '白菅为席', '稌米瘗'],
    answer: 0,
    explain: '「其祠之礼：毛用一璋玉瘗」。',
  },
  {
    id: 'q-r-2',
    subject: 'rite',
    refId: 'que',
    prompt: '「糈」用什么米？',
    options: ['稌米', '稻米', '黍米', '菰米'],
    answer: 0,
    explain: '「糈用稌米」——糈是祭神用的精米。',
  },
  {
    id: 'q-r-3',
    subject: 'rite',
    refId: 'que',
    prompt: '祭席用什么植物铺设？',
    options: ['白菅', '桂叶', '迷榖枝', '棪木叶'],
    answer: 0,
    explain: '「一璧稻米、白菅为席」。',
  },
  {
    id: 'q-r-4',
    subject: 'rite',
    refId: 'que',
    prompt: '鹊山首脉全长多少里？',
    options: ['二千九百五十里', '一千九百里', '三千二百里', '二千里'],
    answer: 0,
    explain: '「凡十山，二千九百五十里」。',
  },
  {
    id: 'q-r-5',
    subject: 'rite',
    refId: 'que',
    prompt: '问兽士的功课是什么？',
    options: ['识其性，不惧其名', '降其形，夺其魄', '避其踪，闭其声', '记其害，除之后快'],
    answer: 0,
    explain: '问兽问的是「性」——原文记「食之」「佩之」，是共生之约，不是猎杀之令。',
  },
  {
    id: 'q-r-6',
    subject: 'rite',
    refId: 'que',
    prompt: '「又东」在《南山经》里是什么意思？',
    options: ['向东又行若干里（下一座山）', '再往东走三步', '东山再起', '地名'],
    answer: 0,
    explain: '南山经以「又东X里」串联十山——原文本身就是一条向东的巡山路线。',
  },
];

export function questionsFor(subject: QuestionSubject, refId: string): QuestionDef[] {
  return QUESTIONS.filter((q) => q.subject === subject && q.refId === refId);
}

export function getQuestion(id: string): QuestionDef | undefined {
  return QUESTIONS.find((q) => q.id === id);
}

/** 祠祭小考：山内所有兽题 + 山题合并抽样。 */
export function mountainGatePool(mountain: MountainId, mountainBeasts: BeastId[]): QuestionDef[] {
  const pool = [...questionsFor('mountain', mountain)];
  for (const beast of mountainBeasts) pool.push(...questionsFor('beast', beast));
  return pool;
}

/** 大祭十问：全章混合。 */
export function finalRitePool(): QuestionDef[] {
  return QUESTIONS.filter((q) => q.refId === 'que' || q.subject === 'rite' || q.subject === 'mountain');
}
