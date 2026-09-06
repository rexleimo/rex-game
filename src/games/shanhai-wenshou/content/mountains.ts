import type { MountainDef, MountainId } from '../core/types.ts';

/**
 * 鹊山首脉十关。quote 逐字取《山海经·南山经》；
 * encounters/boss 的「狂化」「瘴化」为本作游戏化演绎，UI 中会明确标注。
 */

export const MOUNTAINS: MountainDef[] = [
  {
    id: 'zhaoyao',
    order: 1,
    name: '招摇之山',
    quote:
      '南山经之首曰䧿山。其首曰招摇之山，临于西海之上，多桂，多金玉。有草焉，其状如韭而青华，其名曰祝余，食之不饥。有木焉，其状如榖而黑理，其华四照，其名曰迷榖，佩之不迷。有兽焉，其状如禺而白耳，伏行人走，其名曰狌狌，食之善走。丽麂之水出焉，而西流注于海，其中多育沛，佩之无瘕疾。',
    plain:
      '南山首脉叫鹊山。鹊山的第一座是招摇山，临在西海边上，多桂树，多金玉。有种草像韭菜开青花，叫祝余，吃了不饿。有种树像构树有黑色纹理，光华照四方，叫迷榖，佩了不迷路。有种兽像猿猴生白耳，能伏行也能人立而行，叫狌狌，吃了善走。丽麂之水从这里流出西注入海，水中多育沛，佩了不生腹疾。',
    scenery: [
      '桂香浮海风，金玉气在岩缝里闪。',
      '祝余草开着青色小花，一小丛一小丛贴着崖根。',
      '丽麂之水向西入海，水湾里偶尔有莹润的东西一闪。',
      '迷榖的枝桠在暮色里微微发亮，像有人提着灯走在前面。',
    ],
    gathers: { zhuyu_cao: 3, migu_zhi: 2, yupei_yuan: 2, yupai: 2 },
    encounters: [
      { beastId: 'xingxing', weight: 6 },
      { beastId: 'baiyuan', weight: 2 },
    ],
    eliteFight: { beastId: 'xingxing', level: 3, elite: true, title: '白耳长者' },
    boss: {
      beastId: 'xingxing',
      level: 4,
      title: '招摇山守祠兽·白耳翁',
      intro: '老狌狌挡在山祠前，白耳一抖一抖——它在等你先「问」。',
    },
    gate: { title: '招摇祠祭小考', questions: [] },
    god: { name: '鸟身龙首之神（招摇主祭）', desc: '鹊山首脉诸神皆鸟身龙首，招摇之祠用璋玉瘗毛、稌米为糈。' },
  },
  {
    id: 'tangting',
    order: 2,
    name: '堂庭之山',
    quote: '又东三百里，曰堂庭之山，多棪木，多白猿，多水玉，多黄金。',
    plain: '向东三百里是堂庭山，多棪木，多白猿，多水玉，多黄金。',
    scenery: [
      '棪木成林，果子红得发亮，白猿在树冠间荡来荡去。',
      '溪底水玉一颗颗露出来，像谁把星星撒进了水里。',
      '黄金砂混在河滩石缝里，晒得人眼花。',
      '白猿的啸声从头顶掠过，一声比一声远。',
    ],
    gathers: { yanmu_shi: 3, shuiyu: 2, yupai: 1 },
    encounters: [
      { beastId: 'baiyuan', weight: 7 },
      { beastId: 'xingxing', weight: 2 },
    ],
    eliteFight: { beastId: 'baiyuan', level: 5, elite: true, title: '棪木老猿' },
    boss: {
      beastId: 'baiyuan',
      level: 6,
      title: '堂庭山守祠兽·白猿王',
      intro: '白猿王把棪木果一颗颗码在你面前——先答题，答错可要挨它的长臂。',
    },
    gate: { title: '堂庭祠祭小考', questions: [] },
    god: { name: '鸟身龙首之神', desc: '同脉同祠，堂庭之祭亦以璋玉、稌米、白菅为礼。' },
  },
  {
    id: 'yuanyi',
    order: 3,
    name: '猿翼之山',
    quote:
      '又东三百八十里，曰猿翼之山，其中多怪兽，水多怪鱼，多白玉，多蝮虫，多怪蛇，多怪木，不可以上。',
    plain:
      '再向东三百八十里是猿翼山，山中多怪兽，水里多怪鱼，多白玉、蝮虫、怪蛇、怪木——山势险恶，人不可攀上。',
    terrain: {
      desc: '瘴气蒸腾（「多蝮虫」）：每场战斗开局你将染瘴 3 回合，多备育沛。',
      openStatus: { zhang: 3 },
    },
    scenery: [
      '怪木盘根错节，白玉在瘴气深处泛光。',
      '落叶下有东西沙沙游走——不要用脚去探。',
      '水声很近，但看不见水面。',
      '山壁陡得像被刀削过，藤蔓是唯一的路。',
    ],
    gathers: { feidian: 2, shedai: 2, baibai: 1 },
    encounters: [
      { beastId: 'fuchong', weight: 6 },
      { beastId: 'guaishe', weight: 5 },
      { beastId: 'baiyuan', weight: 1 },
    ],
    eliteFight: { beastId: 'guaishe', level: 7, elite: true, title: '盘涧巨蛇' },
    boss: {
      beastId: 'fuchong',
      level: 8,
      title: '猿翼蝮母',
      intro: '最大的那只蝮虫从石隙里立了起来——整座山的瘴，都从它领地的「失祀」里漫出来。',
    },
    gate: { title: '猿翼祠祭小考', questions: [] },
    god: { name: '鸟身龙首之神', desc: '猿翼「不可以上」，山民遂在山口设祭，遥祭而已。' },
  },
  {
    id: 'niuyang',
    order: 4,
    name: '杻阳之山',
    quote:
      '又东三百七十里，曰杻阳之山，其阳多赤金，其阴多白金。有兽焉，其状如马而白首，其文如虎而赤尾，其音如谣，其名曰鹿蜀，佩之宜子孙。怪水出焉，而东流注于宪翼之水。其中多玄龟，其状如龟而鸟首虺尾，其名曰旋龟，其音如判木，佩之不聋，可以为底。',
    plain:
      '再向东三百七十里是杻阳山，阳面多赤金，阴面多白金。有兽像马而白头，虎纹赤尾，叫声像唱歌，叫鹿蜀，佩了宜子孙。怪水从这里流出东注入宪翼之水，水中多玄龟——龟身鸟头蛇尾，叫旋龟，叫声像劈木头，佩了不聋，还能治足茧。',
    scenery: [
      '阳坡的赤金在日头下泛红，阴坡的白金却泛着冷光。',
      '远处有人唱歌——走近了，是一匹白首的马形兽在饮水。',
      '怪水东流，浅滩上有玄色的龟影一动不动。',
      '劈木头的闷响一声声传来，不知是樵夫还是龟。',
    ],
    gathers: { yupai: 2 },
    encounters: [
      { beastId: 'lushu', weight: 6 },
      { beastId: 'xuangui', weight: 4 },
    ],
    eliteFight: { beastId: 'lushu', level: 9, elite: true, title: '谣音之主' },
    boss: {
      beastId: 'xuangui',
      level: 10,
      elite: true,
      title: '瘴化旋龟',
      intro: '玄龟的甲缝里渗着黑瘴——它守的怪水被失祀之瘴泡久了。问清它的底细，别硬碰。',
    },
    gate: { title: '杻阳祠祭小考', questions: [] },
    god: { name: '鸟身龙首之神', desc: '杻阳之祭如常礼。山民说：龟鸣如判木，是在替山神报更。' },
  },
  {
    id: 'dishan',
    order: 5,
    name: '柢山',
    quote:
      '又东三百里柢山，多水，无草木。有鱼焉，其状如牛，陵居，蛇尾有翼，其羽在魼下，其音如留牛，其名曰鯥，冬死而夏生，食之无肿疾。',
    plain:
      '再向东三百里是柢山，多水，无草木。有种鱼形状像牛，却住在山坡上，蛇尾带翼，胁下生羽，叫声像犁牛，叫鯥——冬天蛰伏如死，夏天复活。吃了它不生肿疾。',
    scenery: [
      '满山是水洼与草皮，一棵树都没有。',
      '山坡上伏着牛一样的影子，胁下的羽随呼吸轻轻颤。',
      '水洼映着云，云映着一条会飞的鱼。',
      '低低的哞声从坡上传来，像谁家走失的牛。',
    ],
    gathers: { zhuyu_cao: 1, yupai: 1 },
    encounters: [
      { beastId: 'lu', weight: 6 },
      { beastId: 'xuangui', weight: 2 },
    ],
    eliteFight: { beastId: 'lu', level: 11, elite: true, title: '伏坡之鱼' },
    boss: {
      beastId: 'lu',
      level: 12,
      elite: true,
      title: '冬醒之鯥',
      intro: '传说鯥「冬死而夏生」——打赢它一次，它还会再站起来。记住：它蛰伏时不是死了，是活着等春天。',
    },
    gate: { title: '柢山祠祭小考', questions: [] },
    god: { name: '鸟身龙首之神', desc: '柢山之祠简：无草木可伐，唯以水奠神。' },
  },
  {
    id: 'danyuan',
    order: 6,
    name: '亶爰之山',
    quote:
      '又东四百里，曰亶爰之山，多水，无草木，不可以上。有兽焉，其状如狸而有髦，其名曰类，自为牝牡，食者不妒。',
    plain:
      '再向东四百里是亶爰山，多水，无草木，不可攀上。有兽像野猫而头上有长毛，叫类——一身兼具雌雄。吃了它，人不生妒心。',
    terrain: {
      desc: '水汽弥山（「多水」）：无瘴，但探索所得减半，遇战更稀——此山本就不为杀伐而设。',
    },
    scenery: [
      '整座山静得出奇，水声从每块石头底下渗出来。',
      '你在这里更容易想起家里的饭桌，而不是山外的仇怨。',
      '一只狸形兽坐在石上梳理头顶的长毛，浑不在意你。',
      '无草木的山竟不荒凉——水把石缝洗得干干净净。',
    ],
    gathers: { yupai: 1 },
    encounters: [
      { beastId: 'lei', weight: 7 },
      { beastId: 'lu', weight: 1 },
    ],
    boss: {
      beastId: 'lei',
      level: 13,
      title: '类的试探',
      intro: '类挡在水口，鬃毛笔直——它不打算打，它打算考你三道题。',
    },
    gate: { title: '亶爰祠祭小考', questions: [] },
    god: { name: '鸟身龙首之神', desc: '亶爰不可上，祭以遥礼。山民说此山「自为牝牡」，独阴独阳在此俱足。' },
  },
  {
    id: 'jishan',
    order: 7,
    name: '基山',
    quote:
      '又东三百里，曰基山，其阳多玉，其阴多怪木。有兽焉，其状如羊，九尾四耳，其目在背，其名曰猼訑，佩之不畏。有鸟焉，其状如鸡而三首、六目、六足、三翼，其名曰𪁺𩿧，食之无卧。',
    plain:
      '再向东三百里是基山，阳面多玉，阴面多怪木。有兽像羊，九尾四耳，眼睛长在背上，叫猼訑，佩了不害怕。有鸟像鸡，三个头、六只眼、六只脚、三只翅膀，叫𪁺𩿧，吃了不必多睡。',
    scenery: [
      '阳坡的玉脉在草皮下发青光，阴坡的怪木形状狰狞。',
      '九条尾巴从灌木后扫出来——先看到尾，后看到羊。',
      '三只鸟头在同一只身上吵架，吵着吵着自己打起瞌睡。',
      '怪木的影子拼出一张人脸，你数了数，是六只眼。',
    ],
    gathers: { changyu: 2, yupai: 2, shuiyu: 1 },
    encounters: [
      { beastId: 'boyi', weight: 6 },
      { beastId: 'changfu', weight: 6 },
    ],
    eliteFight: { beastId: 'changfu', level: 14, elite: true, title: '三首之争' },
    boss: {
      beastId: 'boyi',
      level: 15,
      elite: true,
      title: '背目之猼訑',
      intro: '它转过身去——不是为了逃，是为了用背上的眼睛看你。佩之不畏的东西，自己先要无畏。',
    },
    gate: { title: '基山祠祭小考', questions: [] },
    god: { name: '鸟身龙首之神', desc: '基山之祭如常礼。玉匠说：阳坡玉好，阴坡木怪，山神一手管材，一手管怪。' },
  },
  {
    id: 'qingqiu',
    order: 8,
    name: '青丘之山',
    quote:
      '又东三百里，曰青丘之山，其阳多玉，其阴多青雘。有兽焉，其状如狐而九尾，其音如婴儿，能食人，食者不蛊。有鸟焉，其状如鸠，其音如呵，名曰灌灌，佩之不惑。英水出焉，南流注于即翼之泽。其中多赤鱬，其状如鱼而人面，其音如鸯鸳，食之不疥。',
    plain:
      '再向东三百里是青丘山，阳面多玉，阴面多青雘。有兽像狐而生九尾，叫声像婴儿，能吃人——吃了它的肉，人不受蛊惑。有鸟像斑鸠，叫声像呵斥，叫灌灌，佩了不惑。英水南流入即翼之泽，水中多赤鱬——鱼身人面，叫声像鸳鸯，吃了不生疥疮。',
    scenery: [
      '英水声就在前面，可雾里什么都看不真切。',
      '婴儿啼声远远近近——别循声走，先问杖。',
      '青雘矿彩染绿了半面山壁。',
      '呵斥声从头顶劈下来，灌灌在替你驱散什么。',
    ],
    terrain: {
      desc: '惑音迷林（「其音如婴儿」）：探索时偶染「迷」，有迷榖佩则无碍。',
      openStatus: { mi: 2 },
    },
    gathers: { qingkou: 2, yupai: 1 },
    encounters: [
      { beastId: 'guanguan', weight: 6 },
      { beastId: 'chiru', weight: 5 },
      { beastId: 'jiuwei', weight: 2 },
    ],
    eliteFight: { beastId: 'chiru', level: 16, elite: true, title: '英水之悯' },
    boss: {
      beastId: 'jiuwei',
      level: 17,
      title: '青丘九尾',
      intro: '九条尾巴在雾里散开如焰。它叫了一声——像婴儿，也像邀请。这一战，问比打重要。',
    },
    gate: { title: '青丘祠祭小考', questions: [] },
    god: { name: '鸟身龙首之神', desc: '青丘之祭最丰：玉与青雘并献。山民说九尾是山神的影子，敬之则安。' },
  },
  {
    id: 'jiwei',
    order: 9,
    name: '箕尾之山',
    quote:
      '又东三百五十里，曰箕尾之山，其尾踆于东海，多沙石。汸水出焉，而南流注于淯，其中多白玉。',
    plain:
      '再向东三百五十里是箕尾山，山尾蹲踞在东海里，多沙石。汸水从这里流出南注入淯水，水中多白玉。',
    scenery: [
      '山尾真的伸进海里了——浪拍在山根上，白玉被浪推到脚边。',
      '沙石滩一望无际，汸水在滩上写字一样拐了个弯。',
      '海风咸涩，图志的纸页哗哗作响。',
      '最后一座有名之山。图志上写：凡十山。',
    ],
    gathers: { yupai: 2, shuiyu: 2, baijian_cao: 2 },
    encounters: [
      { beastId: 'chiru', weight: 6 },
      { beastId: 'guanguan', weight: 2 },
      { beastId: 'xuangui', weight: 2 },
    ],
    eliteFight: { beastId: 'chiru', level: 18, elite: true, title: '汸水长老' },
    boss: {
      beastId: 'guanguan',
      level: 19,
      elite: true,
      title: '海尾灌灌群首',
      intro: '成群的灌灌在海风里呵斥——它们守着通往无名之山的最后路口。',
    },
    gate: { title: '箕尾祠祭小考', questions: [] },
    god: { name: '鸟身龙首之神', desc: '箕尾踆海，祭礼加海产：璋玉瘗毛，稌米为糈，白菅为席。' },
  },
  {
    id: 'wuming',
    order: 10,
    name: '无名之山',
    quote:
      '凡䧿山之首，自招摇之山以至箕尾之山，凡十山，二千九百五十里，其神状皆鸟身而龙首。其祠之礼：毛用一璋玉瘗，糈用稌米，一璧稻米、白菅为席。',
    plain:
      '总揽鹊山首脉：从招摇山到箕尾山，共十座山，二千九百五十里，山神都是鸟身龙首。祠祭之礼：祭肉用一块璋玉随葬瘗埋，精米用稌米，再用一块玉璧与稻米、白菅铺成祭席。——原文只记了九座山的名字，第十山失载。',
    scenery: [
      '这里没有名字。图志摊开，正好空着一页。',
      '失祀的瘴在这里最浓——浓得能听见山神翅膀收拢的声音。',
      '你把自己走成第十座山的记号：一座山忘了自己，就由走过它的人记住它。',
      '鸟身龙首的影子覆下来，像一整座山俯身看你。',
    ],
    terrain: {
      desc: '失祀之瘴（全脉瘴气之源）：开局染瘴且敌方更凶——带上你一路问来的所有底细。',
      openStatus: { zhang: 3 },
    },
    gathers: {},
    encounters: [],
    boss: {
      beastId: 'xuangui',
      level: 20,
      elite: true,
      title: '失祀之瘴核',
      intro: '盘踞在无名之地的瘴，裹着一只鸟身龙首的轮廓——山神不是敌，失祀才是。',
    },
    gate: { title: '祭山大典·十问', questions: [] },
    god: { name: '鸟身龙首之神', desc: '「其神状皆鸟身而龙首」——全脉山神以同一副形貌受祭。' },
  },
];

export function getMountain(id: MountainId): MountainDef {
  const found = MOUNTAINS.find((m) => m.id === id);
  if (!found) throw new Error(`Unknown mountain: ${id}`);
  return found;
}

export function mountainByOrder(index: number): MountainDef | undefined {
  return MOUNTAINS[index];
}

/** 某山的可收服兽种（图鉴/小考用）。 */
export function mountainBeasts(id: MountainId): string[] {
  const m = getMountain(id);
  const ids = new Set<string>();
  for (const e of m.encounters) ids.add(e.beastId);
  if (m.eliteFight) ids.add(m.eliteFight.beastId);
  ids.add(m.boss.beastId);
  return [...ids];
}

/** 野外遭遇抽取。 */
export function rollEncounter(id: MountainId, rng: () => number): { beastId: string; elite: boolean } | null {
  const m = getMountain(id);
  if (m.encounters.length === 0) return null;
  const total = m.encounters.reduce((sum, e) => sum + e.weight, 0);
  let roll = rng() * total;
  for (const e of m.encounters) {
    roll -= e.weight;
    if (roll <= 0) return { beastId: e.beastId, elite: Boolean(e.elite) };
  }
  const last = m.encounters[m.encounters.length - 1]!;
  return { beastId: last.beastId, elite: Boolean(last.elite) };
}

/** 野外遭遇等级：随山脉推进缓升。 */
export function wildLevel(mountain: MountainDef, rng: () => number): number {
  const base = 1 + (mountain.order - 1) * 1.7;
  return Math.max(1, Math.round(base + rng() * 1.6));
}
