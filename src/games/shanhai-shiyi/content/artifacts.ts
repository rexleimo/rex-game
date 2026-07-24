import type { LoreCard, QuizOption } from '../core/types';
import { BASHU_ARTIFACTS } from './artifactsBashu.ts';
import { CHU_ARTIFACTS } from './artifactsChu.ts';
import { HAISI_ARTIFACTS } from './artifactsHaisi.ts';
import { JIANGNAN_ARTIFACTS } from './artifactsJiangnan.ts';
import { SAIBEI_ARTIFACTS } from './artifactsSaibei.ts';
import { SEASONAL_ARTIFACTS } from './artifactsSeasonal.ts';
import { XIANSHAN_ARTIFACTS } from './artifactsXianshan.ts';
import {
  BOARD,
  kitBi,
  kitChime,
  kitDing,
  kitGe,
  kitGui,
  kitGuiBlade,
  kitJue,
  kitLi,
  kitMirror,
  kitPan,
  kitShoumian,
  kitYunlei,
  kitZun,
} from './shapeKits.ts';

/**
 * 中原30+楚20+巴蜀20+江南20+塞北20+仙山20+岁时16+海丝20 = 166
 * 形状为几何示意，非正式考古复原；史证表述为通识再创作。
 */

function shape(pieces: ReturnType<typeof kitDing>): LoreCard['restore'] {
  return { kind: 'shape', board: { ...BOARD }, pieces };
}

function quiz(prompt: string, options: QuizOption[], explain: string): LoreCard['restore'] {
  return { kind: 'quiz', prompt, options, explain };
}

const SRC_BRONZE = '中国古代青铜器通识；公开博物馆展签与图录中的器类说明。本展示为再创作示意，非正式馆藏复制。';
const SRC_JADE = '中国古代玉器通识；经典训释与博物馆公教文本。本展示为再创作示意。';
const SRC_CONCEPT = '历史学与博物馆公共教育通识表述。';

const ZHONGYUAN_ARTIFACTS: LoreCard[] = [
  // —— 必学核心 ——
  {
    id: 'A-R01-SR-001',
    name: '云雷纹铜鼎',
    rarity: 'SR',
    types: ['bronze'],
    authTag: 'historic_inspired',
    region: 'R01',
    learnIds: ['R01-L01', 'R01-L02'],
    oneLiner: '三足两耳的青铜重器，腹上环绕云雷纹。',
    coreLore:
      '鼎是中国古代重要的青铜器类型，常见三足、两耳。在通识叙述中，鼎不仅可与烹煮相关，更常被放在礼制与祭祀的语境里理解，是认识「礼器」的入门形象。',
    source: SRC_BRONZE,
    todayLink: '今天我们在博物馆里看到鼎，多半是在借一件器物，理解古代礼制、工匠与审美。',
    tellable: '我修过一只画着云雷纹的鼎——古人把礼，也铸进了青铜里。',
    extraLore: '云雷纹呈回旋几何，像云与雷的连续母题，常见于商周器表。',
    restore: shape(kitDing()),
  },
  {
    id: 'A-R01-R-002',
    name: '兽面纹残饰',
    rarity: 'R',
    types: ['bronze', 'pattern'],
    authTag: 'historic_inspired',
    region: 'R01',
    learnIds: ['R01-L03'],
    oneLiner: '一块铸着兽面纹的青铜残片，像器表的「面孔」。',
    coreLore:
      '兽面纹（过去也常称饕餮纹）是商周青铜器上极具识别度的装饰主题：对称的目、角展开于器表，让人感到庄重与震慑。认识兽面纹，是读懂青铜器装饰语言的第一步。',
    source: SRC_BRONZE,
    todayLink: '看展览时，不妨先找「眼睛」——许多兽面纹以双目为中心展开。',
    tellable: '我拼过青铜上的兽面纹：先认眼睛，就能认出它的对称面孔。',
    restore: shape(kitShoumian()),
  },
  {
    id: 'A-R01-N-003',
    name: '礼器知一张',
    rarity: 'N',
    types: ['concept'],
    authTag: 'historic_inspired',
    region: 'R01',
    learnIds: ['R01-L02'],
    oneLiner: '一张帮你分清：有的青铜器，主要出现在礼仪场合。',
    coreLore:
      '「礼器」在通识里指主要用于祭祀、朝会、丧葬等礼仪场合的器物。理解关键不只是「奢侈品」，而是古人如何用物表达秩序、身份与对天地祖先的态度。',
    source: SRC_CONCEPT,
    todayLink: '尊重文物，也是在尊重一种把「规矩与心意」放进物里的传统。',
    tellable: '礼器不一定是厨房用具——它更常提醒我们：古人用器物说话。',
    restore: quiz(
      '下面哪一句更接近「礼器」的通识含义？',
      [
        { id: 'a', text: '只用于厨房日常炒菜的锅', correct: false },
        { id: 'b', text: '常与祭祀、朝会等礼仪场合相关的器物', correct: true },
        { id: 'c', text: '现代工厂流水线上的量产餐具', correct: false },
      ],
      '礼器强调礼仪语境中的用器，先建立这个印象即可。',
    ),
  },
  {
    id: 'A-R01-SR-004',
    name: '编钟',
    rarity: 'SR',
    types: ['bronze', 'musical'],
    authTag: 'historic_inspired',
    region: 'R01',
    learnIds: ['R01-L04'],
    oneLiner: '成组悬挂的钟，敲出不同音高，是礼乐的声音形象。',
    coreLore:
      '编钟是按音高编组的击奏乐器，常与祭祀、宴享等礼仪场合联系在一起。认识编钟，是理解中国古代「礼乐」——礼与乐相互配合——的一把声音钥匙。',
    source: SRC_BRONZE + ' 著名出土如曾侯乙编钟等可作为延伸阅读目标。',
    todayLink: '音乐厅与博物馆里仍能听到编钟音色，让千年之声进入今天的耳朵。',
    tellable: '编钟不是一只钟，而是一组会「唱歌」的青铜。',
    restore: shape(kitChime()),
  },
  {
    id: 'A-R01-SR-005',
    name: '铭文拓影簋',
    rarity: 'SR',
    types: ['bronze', 'inscription'],
    authTag: 'historic_inspired',
    region: 'R01',
    learnIds: ['R01-L05'],
    oneLiner: '圆腹双耳的食器意象，内壁映出铸刻文字的拓影。',
    coreLore:
      '许多青铜器上铸有铭文，可能记述家族、赏赐、事件等。即便一时读不全字，也要先建立印象：器上有字，字在记事。这是青铜器重要的文化信息层。',
    source: SRC_BRONZE,
    todayLink: '看展时若见「铭文拓片」，那是让字从弧面走到纸上的老办法。',
    tellable: '青铜器肚子里有时藏着字——那是铸在金属里的记事。',
    restore: shape(kitGui()),
  },
  {
    id: 'A-R01-R-006',
    name: '子子孙孙永宝用',
    rarity: 'R',
    types: ['inscription', 'concept'],
    authTag: 'historic_inspired',
    region: 'R01',
    learnIds: ['R01-L06'],
    oneLiner: '青铜铭文里常见的祝愿：让后代永珍用此器。',
    coreLore:
      '不少青铜器铭文末尾会出现希望世代珍用的套语。广为人知的印象句是「子子孙孙永宝用」一类——把器物与家族记忆绑在一起，让「物」成为「传」。',
    source: '商周金文常见套语；通识读物与铭文著录中多有举例。',
    todayLink: '我们今天说「传家宝」，情感上仍有「希望被好好记住」的回声。',
    tellable: '古人铸鼎时，常盼着子子孙孙都还记得这件宝。',
    restore: quiz(
      '「子子孙孙永宝用」一类铭文套语，主要表达什么心情？',
      [
        { id: 'a', text: '希望这件器物被后代珍惜、记忆延续', correct: true },
        { id: 'b', text: '规定这件器物只能用一天', correct: false },
        { id: 'c', text: '说明器物是现代工业量产编号', correct: false },
      ],
      '套语指向传承与珍用的愿望。',
    ),
  },

  // —— 器形拓展：青铜 ——
  {
    id: 'A-R01-R-007',
    name: '青铜爵',
    rarity: 'R',
    types: ['bronze'],
    authTag: 'historic_inspired',
    region: 'R01',
    learnIds: ['R01-X-wine'],
    oneLiner: '前有流、后有尾、下有足的酒器形象，辨识度极高。',
    coreLore:
      '爵是特征鲜明的古代青铜酒器形象：有流、有尾、有足等。在礼制叙述中，酒器常与礼仪场合相关。先学会「认出爵」，再谈复杂礼制。',
    source: SRC_BRONZE,
    todayLink: '认器形像认字：流与足的轮廓，是青铜世界的「偏旁」。',
    tellable: '长嘴三足的爵，是我认铜器时最不容易认错的一种。',
    restore: shape(kitJue()),
  },
  {
    id: 'A-R01-R-011',
    name: '青铜尊',
    rarity: 'R',
    types: ['bronze'],
    authTag: 'historic_inspired',
    region: 'R01',
    learnIds: ['R01-X-wine'],
    oneLiner: '大口或长颈的盛酒器形象，常出现在礼制用器组合里。',
    coreLore:
      '尊是古代重要的青铜酒器类型之一，器形有高低变化，但「盛酒以礼」的印象是通识入口。与爵、卣等一起，构成酒礼器物的家族。',
    source: SRC_BRONZE,
    todayLink: '博物馆说明牌上的「酒器」，往往指向礼仪，而不只是「喝酒的杯子」。',
    tellable: '尊提醒我：青铜酒器，常常是礼的一部分。',
    restore: shape(kitZun()),
  },
  {
    id: 'A-R01-R-012',
    name: '青铜盘',
    rarity: 'R',
    types: ['bronze'],
    authTag: 'historic_inspired',
    region: 'R01',
    learnIds: ['R01-X-water'],
    oneLiner: '宽沿浅腹的水器形象，常与沃盥之礼相关。',
    coreLore:
      '盘在通识中多属水器。古代礼仪中有沃盥等洁手环节，盘（常与匜等配合）参与其中。看见盘，可把它和「洁净与礼」联系起来。',
    source: SRC_BRONZE,
    todayLink: '今天洗手是卫生习惯；在古代语境里，洁手也可以是礼仪的一部分。',
    tellable: '青铜盘让我想到：礼，有时从洁手开始。',
    restore: shape(kitPan()),
  },
  {
    id: 'A-R01-R-013',
    name: '青铜戈',
    rarity: 'R',
    types: ['bronze', 'weapon'],
    authTag: 'historic_inspired',
    region: 'R01',
    learnIds: ['R01-X-weapon'],
    oneLiner: '勾击兵器，援、胡、内构成经典轮廓。',
    coreLore:
      '戈是中国古代典型的勾击兵器，青铜时代常见。认识援（锋刃部）、胡、内等部位名称，有助于读懂兵戈文物说明，也理解「干戈」一词从何而来。',
    source: SRC_BRONZE,
    todayLink: '成语里的「化干戈为玉帛」，干戈就指向兵器与冲突。',
    tellable: '戈的一横一勾，是青铜时代战争记忆的符号。',
    restore: shape(kitGe()),
  },
  {
    id: 'A-R01-N-014',
    name: '食器·酒器·水器',
    rarity: 'N',
    types: ['concept'],
    authTag: 'historic_inspired',
    region: 'R01',
    learnIds: ['R01-L02'],
    oneLiner: '青铜礼器常按用途粗分为几大类。',
    coreLore:
      '通识上，青铜器可粗分为食器、酒器、水器、兵器、乐器等。分类是帮助记忆的架子，不是考试标准答案；同一器类在礼仪中的角色比死记名单更重要。',
    source: SRC_CONCEPT,
    todayLink: '逛博物馆时，先问「它大概盛什么、用在哪」，比背型号更轻松。',
    tellable: '我先把铜器分成吃的、喝的、洗的、响的——就好记多了。',
    restore: quiz(
      '编钟在粗分类里，更接近哪一类？',
      [
        { id: 'a', text: '乐器', correct: true },
        { id: 'b', text: '水器', correct: false },
        { id: 'c', text: '农具', correct: false },
      ],
      '编钟属击奏乐器，是礼乐的声音部分。',
    ),
  },
  {
    id: 'A-R01-R-015',
    name: '云雷纹单元',
    rarity: 'R',
    types: ['pattern'],
    authTag: 'historic_inspired',
    region: 'R01',
    learnIds: ['R01-L03'],
    oneLiner: '回旋的几何母题，像云与雷的节奏。',
    coreLore:
      '云雷纹是商周青铜器上常见的几何纹样，以回旋线条组成。它不一定画某一朵具体的云，而像一种重复的节奏——帮助器表显得庄重、满密而有秩序。',
    source: SRC_BRONZE,
    todayLink: '设计里的「底纹」，有时也在做同样的事：铺气氛，不抢主题。',
    tellable: '云雷纹是转圈的节奏，不是天气预报。',
    restore: shape(kitYunlei()),
  },
  {
    id: 'A-R01-N-016',
    name: '方鼎与圆鼎',
    rarity: 'N',
    types: ['concept', 'bronze'],
    authTag: 'historic_inspired',
    region: 'R01',
    learnIds: ['R01-L01'],
    oneLiner: '鼎有圆有方，都是「鼎」家族。',
    coreLore:
      '鼎的器形有圆鼎、方鼎等变化。对初学者，先抓住「三足（或四足）+ 承物之腹 + 常有耳」的家族特征，再去分圆方，就不会被外形吓到。',
    source: SRC_CONCEPT,
    todayLink: '名物常有变体：先认家族，再认亚种。',
    tellable: '方的圆的，只要是鼎，都在跟我说「礼器」。',
    restore: quiz(
      '关于鼎，下列哪句更合适作为入门印象？',
      [
        { id: 'a', text: '只有圆形才叫鼎，方形另有别名且完全无关', correct: false },
        { id: 'b', text: '鼎有圆有方等变体，但同属重要青铜器类型', correct: true },
        { id: 'c', text: '鼎只是现代火锅的商标', correct: false },
      ],
      '先认家族特征，再记变体。',
    ),
  },

  // —— 玉与石 ——
  {
    id: 'A-R01-R-008',
    name: '玉璧',
    rarity: 'R',
    types: ['jade'],
    authTag: 'historic_inspired',
    region: 'R01',
    learnIds: ['R01-X-jade'],
    oneLiner: '扁平圆形、中心有孔的玉器，是经典礼玉形象。',
    coreLore:
      '璧是中心有孔的圆形玉器。在传统叙述中，玉器常与品德、礼仪等观念相连。先记住「圆而有孔曰璧」的形态，再理解「君子比德于玉」会更容易。',
    source: SRC_JADE,
    todayLink: '现代礼赠设计里仍常见圆环中空的轮廓。',
    tellable: '玉璧是圆的，中间有一个孔——像一枚被轻轻握住的月亮。',
    restore: shape(kitBi()),
  },
  {
    id: 'A-R01-R-017',
    name: '玉圭',
    rarity: 'R',
    types: ['jade'],
    authTag: 'historic_inspired',
    region: 'R01',
    learnIds: ['R01-X-jade'],
    oneLiner: '长条片状、一端可呈尖首的瑞玉形象。',
    coreLore:
      '圭是古代重要的玉器类型之一，常与瑞信、礼仪相关。对初学者，可先建立「长条玉片、不同于圆形璧」的对比记忆。',
    source: SRC_JADE,
    todayLink: '成语「奉为圭臬」里的圭，指向准则与法度的比喻传统。',
    tellable: '圭是长的，璧是圆的——玉也有自己的「字形」。',
    restore: shape(kitGuiBlade()),
  },
  {
    id: 'A-R01-N-018',
    name: '君子比德于玉',
    rarity: 'N',
    types: ['concept', 'jade'],
    authTag: 'historic_inspired',
    region: 'R01',
    learnIds: ['R01-X-jade'],
    oneLiner: '古人常以玉的品质比喻人的美德。',
    coreLore:
      '「君子比德于玉」是中国文化里常见的比喻传统：以玉的温润、坚洁等感知，映射理想人格。它说明玉不仅是材料，也是道德想象的媒介。',
    source: '儒家经典及相关通识阐释传统。',
    todayLink: '今天说「冰清玉洁」，仍在用玉说话。',
    tellable: '古人夸人，有时不直接说好，而说像玉。',
    restore: quiz(
      '「君子比德于玉」主要在做什么？',
      [
        { id: 'a', text: '用玉的品质比喻理想人格', correct: true },
        { id: 'b', text: '教人如何鉴别假玉价格', correct: false },
        { id: 'c', text: '规定只有国王能碰玉', correct: false },
      ],
      '这是比喻传统，不是珠宝鉴定课。',
    ),
  },

  // —— 陶与日用印象 ——
  {
    id: 'A-R01-R-019',
    name: '陶鬲',
    rarity: 'R',
    types: ['ceramic'],
    authTag: 'historic_inspired',
    region: 'R01',
    learnIds: ['R01-X-ceramic'],
    oneLiner: '袋足炊器，是史前到青铜时代常见的陶器形象。',
    coreLore:
      '鬲是一种常见的袋足炊器，空足便于受火。它提醒我们：礼器之前，先有吃饭的烟火。认识陶鬲，能把「文明」从庙堂拉回灶台。',
    source: '中国新石器时代与青铜时代陶器通识。',
    todayLink: '现代锅具变了形，但「受热、煮熟、分享」仍是生活核心。',
    tellable: '陶鬲的三条空腿，是为了让火更好地拥抱食物。',
    restore: shape(kitLi()),
  },
  {
    id: 'A-R01-N-020',
    name: '礼器与日用',
    rarity: 'N',
    types: ['concept'],
    authTag: 'historic_inspired',
    region: 'R01',
    learnIds: ['R01-L02'],
    oneLiner: '不是所有古物都是礼器，日用与礼仪可以并存。',
    coreLore:
      '古代器物有的偏日用，有的偏礼仪，有的一身二任。学习时不必把所有漂亮的东西都叫成礼器；看场合、看组合、看铭文与出土情境，判断会更准确。',
    source: SRC_CONCEPT,
    todayLink: '家里的碗和仪式上的杯，今天也仍然不同。',
    tellable: '礼器很隆重，但文明同样住在陶鬲的烟火里。',
    restore: quiz(
      '下列哪句更稳妥？',
      [
        { id: 'a', text: '凡是青铜做的都一定是礼器', correct: false },
        { id: 'b', text: '器物可能日用、礼仪或兼有，需结合情境理解', correct: true },
        { id: 'c', text: '陶器都与礼仪无关', correct: false },
      ],
      '情境比材料标签更重要。',
    ),
  },

  // —— 乐与声 ——
  {
    id: 'A-R01-N-021',
    name: '礼乐一字卡',
    rarity: 'N',
    types: ['concept', 'musical'],
    authTag: 'historic_inspired',
    region: 'R01',
    learnIds: ['R01-L04'],
    oneLiner: '礼与乐常常成对出现。',
    coreLore:
      '在中国古代文化叙述中，「礼乐」常连用：礼规范秩序与行为，乐以声音与节奏配合场合。编钟、磬等乐器文物，是理解「乐」如何参与公共礼仪的物证入口。',
    source: SRC_CONCEPT,
    todayLink: '典礼上的奏乐，今天仍在用声音标记庄重时刻。',
    tellable: '礼是规矩的骨架，乐是它的呼吸。',
    restore: quiz(
      '「礼乐」连用时，乐大致指什么？',
      [
        { id: 'a', text: '与礼仪场合相配合的音乐与节奏', correct: true },
        { id: 'b', text: '只有流行歌曲', correct: false },
        { id: 'c', text: '禁止发声', correct: false },
      ],
      '乐参与场合，不单是娱乐。',
    ),
  },
  {
    id: 'A-R01-R-022',
    name: '石磬印象',
    rarity: 'R',
    types: ['musical'],
    authTag: 'historic_inspired',
    region: 'R01',
    learnIds: ['R01-L04'],
    oneLiner: '石制击奏体鸣乐器，常与钟并称「钟磬」。',
    coreLore:
      '磬是石（或玉）质击奏乐器，常成组编列。与编钟一起，构成「钟磬」这一礼乐声音的经典组合印象。',
    source: '中国古代乐器通识。',
    todayLink: '「钟磬齐鸣」仍用来形容盛大、庄重的声音场面。',
    tellable: '有铜的钟，也有石的磬——礼乐是两种音色的合唱。',
    restore: quiz(
      '「钟磬」组合主要关联什么主题？',
      [
        { id: 'a', text: '礼乐与礼仪场合的声音', correct: true },
        { id: 'b', text: '仅用于农耕计时', correct: false },
        { id: 'c', text: '现代摇滚乐队编制', correct: false },
      ],
      '钟磬是礼乐意象。',
    ),
  },

  // —— 镜与工艺 ——
  {
    id: 'A-R01-R-023',
    name: '铜镜',
    rarity: 'R',
    types: ['bronze'],
    authTag: 'historic_inspired',
    region: 'R01',
    learnIds: ['R01-X-craft'],
    oneLiner: '圆形照面之器，背面常有钮与纹饰。',
    coreLore:
      '铜镜以青铜照面，背面多有钮便于系绳，并铸纹饰。它连接日常生活与工艺审美，也是博物馆里极常见的青铜器类型之一。',
    source: SRC_BRONZE,
    todayLink: '玻璃镜普及前，铜镜曾长期照见人的面容。',
    tellable: '铜镜的背面讲故事，正面讲人。',
    restore: shape(kitMirror()),
  },
  {
    id: 'A-R01-N-024',
    name: '范铸小常识',
    rarity: 'N',
    types: ['concept', 'craft'],
    authTag: 'historic_inspired',
    region: 'R01',
    learnIds: ['R01-X-craft'],
    oneLiner: '青铜器多用陶范等工艺浇铸而成。',
    coreLore:
      '中国古代青铜器常用范铸法：以范（模具）成形再浇注铜液。理解「铸」而不是「凿石头」，能更好想象纹饰何以浮起、铭文何以凹陷。',
    source: SRC_CONCEPT,
    todayLink: '现代工业铸造与之原理相通，只是材料与精度不同。',
    tellable: '鼎上的花纹，很多是「浇」出来的，不是一刀刀雕出来的。',
    restore: quiz(
      '商周青铜礼器纹饰的常见成形方式更接近？',
      [
        { id: 'a', text: '范铸浇注', correct: true },
        { id: 'b', text: '3D 打印塑料', correct: false },
        { id: 'c', text: '纯手工揉面成型', correct: false },
      ],
      '范铸是关键通识。',
    ),
  },

  // —— 价值与典籍 ——
  {
    id: 'A-R01-N-009',
    name: '考古与盗掘的边界',
    rarity: 'N',
    types: ['concept', 'ethics'],
    authTag: 'public_edu',
    region: 'R01',
    learnIds: ['R01-X-ethics'],
    oneLiner: '拾遗是修复与理解，不是盗取与破坏。',
    coreLore:
      '文物属于公共文化记忆。科学考古有记录、有层位、有保护；盗掘破坏信息，造成不可逆损失。山海拾遗者的工作是「看见与读懂」，并尊重保护与法律。',
    source: '文物保护法公共宣传口径；考古通识公教。',
    todayLink: '参观遗址与博物馆时守秩序，就是参与保护。',
    tellable: '真正的拾遗，是让故事留下，而不是把土里的东西偷偷拿走。',
    restore: quiz(
      '面对出土文物，更正确的态度是？',
      [
        { id: 'a', text: '支持科学考古与公共保护，拒绝盗掘', correct: true },
        { id: 'b', text: '私下挖掘拿回家收藏最光荣', correct: false },
        { id: 'c', text: '损坏层位也无所谓', correct: false },
      ],
      '保护信息与物，同样重要。',
    ),
  },
  {
    id: 'A-R01-N-010',
    name: '山海册·中原页',
    rarity: 'N',
    types: ['classic', 'concept'],
    authTag: 'classic_shanhai',
    region: 'R01',
    learnIds: ['R01-L06', 'R01-X-shanhai'],
    oneLiner: '把《山海经》当作古老的博物与奇闻笔记来打开。',
    coreLore:
      '《山海经》是中国先秦典籍中极具想象力的一部，混有地理、物产、神话与奇闻。它不必被当成现代精确地图，却深深影响了后世神兽与山川想象。先识礼器的真实感，再对照经载的奇幻感。',
    source: '《山海经》文本及通行注本；公教介绍。',
    todayLink: '今天的国风设计与影视神兽，常能在这部书的阅读传统里找到源头。',
    tellable: '《山海经》不像地图那么「准」，却像梦一样影响了中国人的想象。',
    restore: quiz(
      '关于《山海经》，哪句更合适？',
      [
        { id: 'a', text: '它混有地理、物产与神话奇闻，影响后世想象', correct: true },
        { id: 'b', text: '它是现代 GPS 导航说明书', correct: false },
        { id: 'c', text: '它禁止任何艺术再创作', correct: false },
      ],
      '以开放而谨慎的态度读经典。',
    ),
  },
  {
    id: 'A-R01-N-025',
    name: '中原在哪里',
    rarity: 'N',
    types: ['concept'],
    authTag: 'historic_inspired',
    region: 'R01',
    learnIds: ['R01-X-geo'],
    oneLiner: '「中原」是文化地理概念，不只有一个点。',
    coreLore:
      '中原在不同历史语境中范围有别，大致与黄河中下游的文明核心区相关。本游戏用「中原」作为礼乐青铜主题的展区名，帮助建立文化印象，而非精确行政区划课。',
    source: SRC_CONCEPT,
    todayLink: '旅行时听到「中原文化」，多指这一文明传统，而非单一城市。',
    tellable: '中原不是一个点，而是一片被反复讲述的文明腹地。',
    restore: quiz(
      '本展区「中原」主要用来做什么？',
      [
        { id: 'a', text: '作为礼乐青铜主题的文化展区', correct: true },
        { id: 'b', text: '替代国家地图测绘', correct: false },
        { id: 'c', text: '推销房地产楼盘名', correct: false },
      ],
      '游戏分区服务学习主题。',
    ),
  },
  {
    id: 'A-R01-N-026',
    name: '铭文为什么重要',
    rarity: 'N',
    types: ['concept', 'inscription'],
    authTag: 'historic_inspired',
    region: 'R01',
    learnIds: ['R01-L05'],
    oneLiner: '字把器物变成可核对的历史线索。',
    coreLore:
      '铭文使器物不止于造型与纹饰：它可能留下人名、事件、族氏与祝愿。对研究者，铭文是关键史料；对公众，先建立「器上可能有字」的意识，就已迈进门槛。',
    source: SRC_CONCEPT,
    todayLink: '像读一枚会说话的名片。',
    tellable: '有铭文的鼎，像自带说明书的古代重器。',
    restore: quiz(
      '青铜器铭文对今人最直接的价值是？',
      [
        { id: 'a', text: '可能提供记事与族氏等历史信息', correct: true },
        { id: 'b', text: '保证器物永远不会生锈', correct: false },
        { id: 'c', text: '自动翻译成英文', correct: false },
      ],
      '铭文是信息层。',
    ),
  },
  {
    id: 'A-R01-R-027',
    name: '乳钉纹印象',
    rarity: 'R',
    types: ['pattern'],
    authTag: 'historic_inspired',
    region: 'R01',
    learnIds: ['R01-L03'],
    oneLiner: '器表成排的乳突状装饰。',
    coreLore:
      '乳钉纹以突起的圆点状装饰排列于器表，是青铜器常见纹样之一。与云雷纹、兽面纹一样，它帮助我们分辨「器表在说话」——装饰不是随便抹的泥。',
    source: SRC_BRONZE,
    todayLink: '现代产品上的点阵肌理，有时也在做「摸得着的秩序」。',
    tellable: '乳钉纹像一排安静的鼓点，敲在青铜上。',
    restore: quiz(
      '乳钉纹的直观特征是？',
      [
        { id: 'a', text: '成排的乳突状圆点装饰', correct: true },
        { id: 'b', text: '只有彩色绘画', correct: false },
        { id: 'c', text: '必须写成整篇铭文', correct: false },
      ],
      '先认形态。',
    ),
  },
  {
    id: 'A-R01-N-028',
    name: '组合与场景',
    rarity: 'N',
    types: ['concept'],
    authTag: 'historic_inspired',
    region: 'R01',
    learnIds: ['R01-L02'],
    oneLiner: '礼器常常成组出现，而不是孤零零一件。',
    coreLore:
      '礼仪场合的器物往往成组配合：食器、酒器、水器、乐器各司其职。理解「组合」，比只记住单件名称更能接近古人用器场景。',
    source: SRC_CONCEPT,
    todayLink: '像一桌筵席的碗盘杯盏，各有位置。',
    tellable: '礼器喜欢结伴——场景比单品更完整。',
    restore: quiz(
      '理解古代礼器，更推荐哪一种视角？',
      [
        { id: 'a', text: '关注它们在场景中的组合与分工', correct: true },
        { id: 'b', text: '只背最贵那一件的拍卖价', correct: false },
        { id: 'c', text: '忽略乐器与水器', correct: false },
      ],
      '组合即场景。',
    ),
  },
  {
    id: 'A-R01-N-029',
    name: '今日一器·怎么看展',
    rarity: 'N',
    types: ['concept'],
    authTag: 'public_edu',
    region: 'R01',
    learnIds: ['R01-X-museum'],
    oneLiner: '看展三问：叫什么、干什么、为何美。',
    coreLore:
      '面对一件文物，可先问：它叫什么？可能做什么用？纹饰或造型为何打动你？这三问能把「打卡拍照」变成「真正看见」。本游戏的文化卡，就是按类似结构写的。',
    source: '博物馆公共教育常用方法。',
    todayLink: '下次逛展，试着只对一件东西问完三问。',
    tellable: '看展不一定看很多，把一件看明白就很值。',
    restore: quiz(
      '看展「三问」更接近哪组？',
      [
        { id: 'a', text: '名称、用途、何以打动你', correct: true },
        { id: 'b', text: '价格、折扣、包邮', correct: false },
        { id: 'c', text: '只问能不能摸', correct: false },
      ],
      '三问培养看见的能力。',
    ),
  },
  {
    id: 'A-R01-SR-030',
    name: '中原礼器小谱',
    rarity: 'SR',
    types: ['concept', 'bronze'],
    authTag: 'historic_inspired',
    region: 'R01',
    learnIds: ['R01-L01', 'R01-L04', 'R01-L06'],
    oneLiner: '把本区学过的印象收成一张总谱。',
    coreLore:
      '中原展区希望你带走：鼎等礼器形象；云雷/兽面等纹样名字；编钟与礼乐；铭文记事与祝福套语。它们共同勾勒「礼与乐、物与字」交织的文明印象——这是再创作展览的学习目标，而非穷尽考古报告。',
    source: '本区域课程纲要汇总。',
    todayLink: '学完可以去博物馆「对线」：看见真器时会心一笑。',
    tellable: '中原这一路，我记住了鼎、纹、钟和器上的字。',
    restore: quiz(
      '中原展区最核心的学习主题更接近？',
      [
        { id: 'a', text: '礼乐青铜：器、纹、乐、铭文印象', correct: true },
        { id: 'b', text: '现代智能手机维修', correct: false },
        { id: 'c', text: '只用英语讲希腊神话', correct: false },
      ],
      '礼乐青铜是本区主轴。',
    ),
  },
];

export const ARTIFACTS: LoreCard[] = [
  ...ZHONGYUAN_ARTIFACTS,
  ...CHU_ARTIFACTS,
  ...BASHU_ARTIFACTS,
  ...JIANGNAN_ARTIFACTS,
  ...SAIBEI_ARTIFACTS,
  ...XIANSHAN_ARTIFACTS,
  ...SEASONAL_ARTIFACTS,
  ...HAISI_ARTIFACTS,
];

export function getArtifact(id: string): LoreCard | undefined {
  return ARTIFACTS.find((a) => a.id === id);
}

export function listArtifactsByRegion(region: string): LoreCard[] {
  return ARTIFACTS.filter((a) => a.region === region);
}

export const AUTH_TAG_LABEL: Record<LoreCard['authTag'], string> = {
  historic_inspired: '史证·再创作',
  folk: '民俗',
  classic_shanhai: '经载',
  seasonal: '岁时',
  public_edu: '公教',
};

export const RARITY_LABEL: Record<LoreCard['rarity'], string> = {
  N: '寻常',
  R: '雅器',
  SR: '礼器',
  SSR: '珍遗',
  UR: '名物',
};

export const TYPE_LABEL: Record<string, string> = {
  bronze: '青铜',
  jade: '玉',
  ceramic: '陶',
  lacquer: '漆器',
  textile: '丝帛',
  painting: '绘画',
  pattern: '纹样',
  concept: '概念',
  inscription: '铭文',
  musical: '乐器',
  weapon: '兵器',
  craft: '工艺',
  classic: '典籍',
  ethics: '公教',
  folk: '民俗',
  seasonal: '岁时',
  gold: '金器',
  garden: '园林',
};
