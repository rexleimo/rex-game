import type { ItemDef, SkillDef } from '../core/types.ts';

/**
 * 巫祝槌法与百物。技能效果全部可从原文生发：
 * 槌法是问兽士的行杖，草药直接对应「食之/佩之」句。
 */

export const SKILLS: SkillDef[] = [
  { id: 'strike', name: '执杖', desc: '以问兽杖稳稳一击。', qiCost: 0, mult: 1, level: 1 },
  { id: 'lingxi', name: '灵息', desc: '调匀呼吸，回复两成半生命。', qiCost: 4, mult: 0, level: 1, effect: 'heal' },
  { id: 'lieshi', name: '裂石', desc: '杖锋裂石，伤害大增。', qiCost: 3, mult: 1.45, level: 3 },
  { id: 'wenxin', name: '问心', desc: '凝神一视，直接揭示兽的一条线索。', qiCost: 2, mult: 0.3, level: 5, effect: 'reveal' },
  { id: 'shanguixiao', name: '山鬼啸', desc: '长啸如山鬼，重创并使敌方生惧。', qiCost: 6, mult: 1.7, level: 8, effect: 'fear' },
  { id: 'tagang', name: '踏罡', desc: '踏步成罡，连击两段。', qiCost: 7, mult: 0.85, level: 12, effect: 'double' },
  { id: 'guiyuan', name: '归元', desc: '导气回元，回复近半气力。每场限两次。', qiCost: 0, mult: 0, level: 16, effect: 'qiReturn', perBattle: 2 },
  { id: 'zhenyue', name: '镇岳', desc: '如岳镇地，一击极重。', qiCost: 12, mult: 2.2, level: 20 },
  { id: 'longyin', name: '龙吟', desc: '杖上龙吟，无视大半守御。', qiCost: 10, mult: 1.6, level: 24, effect: 'pierce' },
  { id: 'wuwu', name: '巫舞', desc: '尽巫者之舞，倾力一击，反噬己身。', qiCost: 16, mult: 2.8, level: 28, effect: 'selfHarm', perBattle: 1 },
];

export function getSkill(id: string): SkillDef | undefined {
  return SKILLS.find((s) => s.id === id);
}

export const ITEMS: ItemDef[] = [
  {
    id: 'zhuyu',
    name: '祝余',
    desc: '状如韭菜而开青花的草，吃下去很久不觉饥饿。',
    source: '有草焉……其名曰祝余，食之不饥。',
    kind: 'herb',
    use: { hp: 0.35 },
    craft: { inputs: { zhuyu_cao: 2 }, kind: 'herb' },
  },
  {
    id: 'zhuyu_cao',
    name: '祝余草',
    desc: '招摇山新采的青花小草，还没炼制。',
    source: '其状如韭而青华',
    kind: 'material',
  },
  {
    id: 'migu_pei',
    name: '迷榖佩',
    desc: '迷榖花纹的佩饰，戴上了便不会迷失方向。',
    source: '其华四照，其名曰迷榖，佩之不迷。',
    kind: 'charm',
    charm: { immune: ['mi'], spd: 1 },
    craft: { inputs: { migu_zhi: 1, yupai: 1 }, kind: 'charm' },
  },
  {
    id: 'migu_zhi',
    name: '迷榖枝',
    desc: '其花四照的神树枝条，幽幽发光。',
    source: '其华四照',
    kind: 'material',
  },
  {
    id: 'yupei',
    name: '育沛露',
    desc: '丽麂之水中生出的育沛炼成的露，服之瘕疾不生。',
    source: '其中多育沛，佩之无瘕疾。',
    kind: 'cure',
    use: { cure: ['zhang'], hp: 0.1 },
    craft: { inputs: { yupei_yuan: 2 }, kind: 'cure' },
  },
  {
    id: 'yupei_yuan',
    name: '育沛',
    desc: '水边拾得的育沛，莹润如蜡。',
    source: '其中多育沛',
    kind: 'material',
  },
  {
    id: 'yanmu_shi',
    name: '棪木实',
    desc: '堂庭山棪树的果子，白猿最爱。',
    source: '多棪木，多白猿',
    kind: 'herb',
    use: { hp: 0.2, qi: 0.25 },
  },
  {
    id: 'shuiyu',
    name: '水玉',
    desc: '水色的美玉，祠祭与炼器都要用。',
    source: '多水玉',
    kind: 'material',
  },
  {
    id:'tumi',
    name: '稌米糈',
    desc: '精白的稻米，祭神之糈；兽闻米香则驯。',
    source: '糈用稌米',
    kind: 'tame',
    use: { tameBonus: 0.25 },
    price: 30,
  },
  {
    id: 'baijian',
    name: '白菅席',
    desc: '白菅织的席，铺开可涤诸邪。',
    source: '白菅为席',
    kind: 'cure',
    use: { cure: ['zhang', 'mi', 'ju'], shield: 0.15 },
    price: 40,
  },
  {
    id: 'zhangyu',
    name: '璋玉',
    desc: '祭祀瘗埋所用的玉璋。',
    source: '毛用一璋玉瘗',
    kind: 'material',
    price: 60,
  },
  {
    id: 'lushu_pi',
    name: '鹿蜀纹佩',
    desc: '虎纹马身的皮毛，佩之宜子孙。',
    source: '佩之宜子孙',
    kind: 'charm',
    charm: { maxHp: 0.1 },
  },
  {
    id: 'guijia',
    name: '旋龟甲',
    desc: '玄龟蜕下的甲片，佩之不聋。',
    source: '佩之不聋',
    kind: 'charm',
    charm: { def: 3 },
  },
  {
    id: 'boyi_pi',
    name: '猼訑皮',
    desc: '背上生目的兽皮，佩之不畏。',
    source: '佩之不畏',
    kind: 'charm',
    charm: { immune: ['ju'], def: 1 },
  },
  {
    id: 'jiuwei_wei',
    name: '九尾帚',
    desc: '九尾狐自愿留下的一束尾毛，佩之不蛊。',
    source: '食者不蛊',
    kind: 'charm',
    charm: { atk: 0.1 },
  },
  {
    id: 'luyu',
    name: '鯥脯',
    desc: '冬死夏生的鯥鱼制成的干肉，食之无肿疾。',
    source: '食之无肿疾',
    kind: 'herb',
    use: { hp: 0.45 },
  },
  {
    id: 'leirou',
    name: '类肉干',
    desc: '食者不妒的兽肉干，行路人救急口粮。',
    source: '食者不妒',
    kind: 'herb',
    use: { hp: 0.3, qi: 0.2 },
  },
  {
    id: 'feidian',
    name: '蝮涎粉',
    desc: '蝮虫的涎晒成的粉，以毒攻毒的引子。',
    source: '多蝮虫',
    kind: 'material',
  },
  {
    id: 'shedai',
    name: '怪蛇蜕',
    desc: '怪蛇蜕下的皮，可制鼓面。',
    source: '多怪蛇',
    kind: 'material',
  },
  {
    id: 'changyu',
    name: '𪁺𩿧羽',
    desc: '三首鸟的羽，羽下生风。',
    source: '三翼',
    kind: 'material',
  },
  {
    id: 'guanyu',
    name: '灌灌翎',
    desc: '灌灌的翎羽，佩之不惑。',
    source: '佩之不惑',
    kind: 'charm',
    charm: { immune: ['mi'], spd: 2 },
  },
  {
    id: 'chiru_zhu',
    name: '赤鱬珠',
    desc: '赤鱬吐出的珠，食之不疥。',
    source: '食之不疥',
    kind: 'cure',
    use: { cure: ['zhang'], hp: 0.2 },
  },
  {
    id: 'yupai',
    name: '玉牌',
    desc: '随手打磨的挂牌，通用炼制引子。',
    source: '多金玉',
    kind: 'material',
  },
  {
    id: 'qingkou',
    name: '青雘',
    desc: '青丘产的青色矿彩，可绘符。',
    source: '其阴多青雘',
    kind: 'material',
  },
  {
    id: 'baibai',
    name: '白玉膏',
    desc: '白玉研成的膏，涂身护体。',
    source: '多白玉',
    kind: 'herb',
    use: { shield: 0.3, hp: 0.1 },
  },
];

export function getItem(id: string): ItemDef | undefined {
  return ITEMS.find((i) => i.id === id);
}

/** 祠祭升级表：等级 → 金玉花费。 */
export const SHRINE_COSTS = { qi: [40, 90, 170, 300], satchel: [30, 70, 140], tame: [35, 80, 160], blessing: [50, 110, 200] } as const;
