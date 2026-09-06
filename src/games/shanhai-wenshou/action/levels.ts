import type { BeastId, MountainId, MountainDef } from '../core/types.ts';
import { getMountain, MOUNTAINS } from '../content/mountains.ts';

/**
 * 十山关卡构建（GDD §5.2）：每山五拍同构——
 * 山脚村(闻) → 采集径(备/迹) → 变奏段(迹) → 精英门(遇) → 山祠(决)。
 * 布局由山序号确定性生成（同一种子永远同一张图），素材层另配调色板。
 */

export interface PlatformDef {
  x: number;
  y: number;
  w: number;
  h: number;
  /** 一侧可攀爬（猿翼/亶爰「不可以上」的补偿）。 */
  climbable?: boolean;
}

export interface WaterDef {
  x: number;
  w: number;
}

export interface SpawnDef {
  beastId: BeastId;
  x: number;
  level: number;
  zone: 'wild' | 'elite' | 'boss';
  title?: string;
}

export type PickupKind = 'herb' | 'jade' | 'clue' | 'yupei';

export interface PickupDef {
  kind: PickupKind;
  itemId?: string;
  /** 采集量（herb 用）。 */
  amount: number;
  x: number;
  y: number;
}

export interface NpcDef {
  id: string;
  name: string;
  x: number;
  lines: string[];
}

/** 知识机关门（GDD「迹拍」落地）：原文知识点即开门机制，不做答题弹窗。 */
export type GateKind = 'item' | 'jade' | 'clue' | 'still' | 'parry' | 'tide' | 'tame';

export interface GateDef {
  kind: GateKind;
  x: number;
  /** item：需持有的物品；jade/clue/tame：所需数量。 */
  item?: string;
  need?: number;
  /** 门额短句（原文锚）。 */
  canon: string;
  /** 未满足时的提示。 */
  hint: string;
}

export interface ThornDef {
  x: number;
  w: number;
}

/** 场景装饰（无碰撞，纯观感）：树/松/灌/石/花/芦/草簇/路牌。 */
export type DecorKind = 'tree' | 'pine' | 'bush' | 'rock' | 'flower' | 'reed' | 'tuft' | 'sign';

export interface DecorDef {
  kind: DecorKind;
  x: number;
  /** 基线 y（装饰以此为脚底锚点）。 */
  y: number;
  flip?: boolean;
  /** sign 专用：牌面短词（段落名）。 */
  label?: string;
}

export interface LevelDef {
  mountain: MountainId;
  width: number;
  groundY: number;
  platforms: PlatformDef[];
  waters: WaterDef[];
  spawns: SpawnDef[];
  pickups: PickupDef[];
  gates: GateDef[];
  thorns: ThornDef[];
  decos: DecorDef[];
  checkpoints: number[];
  npcs: NpcDef[];
  steles: { x: number; text: string }[];
  eliteGate?: { x: number; spawn: SpawnDef };
  boss: { arenaX: number; arenaW: number; spawn: SpawnDef; intro: string; untamable?: boolean; isWuming?: boolean };
  /** 瘴浓度 0–1（渲染雾层 + 呼吸音）。 */
  fog: number;
  night: boolean;
  segmentLabels: { x: number; label: string }[];
}

/** 每山调色板（由原文推色：黛青/赭石/朱砂/鎏金四主色内取）。 */
export interface MountainPalette {
  skyTop: string;
  skyBot: string;
  ridgeFar: string;
  ridgeMid: string;
  ridgeNear: string;
  ground: string;
  groundTop: string;
  mist: string;
  accent: string;
  water: string;
}

const PALETTES: Record<MountainId, MountainPalette> = {
  zhaoyao: { skyTop: '#4aa8e0', skyBot: '#bfe8f8', ridgeFar: '#7ec4d8', ridgeMid: '#58b45e', ridgeNear: '#2e7a42', ground: '#8a5a34', groundTop: '#62b84e', mist: '#e8fcff', accent: '#ffd24a', water: '#38a0e0' },
  tangting: { skyTop: '#58b0e8', skyBot: '#ffe8b0', ridgeFar: '#e0c890', ridgeMid: '#8ab050', ridgeNear: '#4a7838', ground: '#a06a3a', groundTop: '#d8b060', mist: '#fff4d8', accent: '#f0603a', water: '#48b0a8' },
  yuanyi: { skyTop: '#8a7ac8', skyBot: '#dcd0f4', ridgeFar: '#b0a0dc', ridgeMid: '#7a68b0', ridgeNear: '#4a3f7a', ground: '#4a4166', groundTop: '#7a6aa8', mist: '#e4daff', accent: '#c07af0', water: '#6a5a9a' },
  niuyang: { skyTop: '#f0955a', skyBot: '#ffd8a8', ridgeFar: '#e0a878', ridgeMid: '#a06a3f', ridgeNear: '#6a4028', ground: '#7a4a2c', groundTop: '#c8803f', mist: '#ffe8cc', accent: '#f04f2e', water: '#4a90b0' },
  dishan: { skyTop: '#3fa8c8', skyBot: '#c8f4f0', ridgeFar: '#8ac8cc', ridgeMid: '#48a088', ridgeNear: '#2a6a5a', ground: '#3f5a54', groundTop: '#5aa88a', mist: '#e0fcf8', accent: '#f0c04a', water: '#2f95c4' },
  danyuan: { skyTop: '#6890d0', skyBot: '#dceeff', ridgeFar: '#a8c0e4', ridgeMid: '#7088b8', ridgeNear: '#48587f', ground: '#4f607a', groundTop: '#88a0c0', mist: '#f0f8ff', accent: '#9ac8f0', water: '#4a80b8' },
  jishan: { skyTop: '#141f4a', skyBot: '#3a5a9a', ridgeFar: '#4a6599', ridgeMid: '#32406e', ridgeNear: '#202a4a', ground: '#252e48', groundTop: '#3d4f78', mist: '#8fa8d8', accent: '#f0d04a', water: '#2a4a78' },
  qingqiu: { skyTop: '#d878b8', skyBot: '#ffd8ec', ridgeFar: '#e8a8cc', ridgeMid: '#b06090', ridgeNear: '#7a3a62', ground: '#5f3a52', groundTop: '#a8688f', mist: '#ffe4f2', accent: '#ffb0d0', water: '#8a5a90' },
  jiwei: { skyTop: '#48b8e0', skyBot: '#d8fcf4', ridgeFar: '#90d0d4', ridgeMid: '#50a880', ridgeNear: '#2f7858', ground: '#4f6a54', groundTop: '#78b868', mist: '#e8fff8', accent: '#f2e08a', water: '#2f9fd0' },
  wuming: { skyTop: '#6a6880', skyBot: '#cfcde0', ridgeFar: '#a8a6c0', ridgeMid: '#78768e', ridgeNear: '#504e62', ground: '#464452', groundTop: '#6e6c80', mist: '#e0deea', accent: '#e8e6f0', water: '#6a7888' },
};

export function paletteOf(mountain: MountainId): MountainPalette {
  return PALETTES[mountain];
}

const SCREEN = 1150;
const GROUND_Y = 460;

/** 轻量确定性随机（同序号 → 同布局）。 */
function lcg(seed: number): () => number {
  let s = seed * 2654435761 % 4294967296;
  if (s <= 0) s += 4294967295;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

interface FeatureFlags {
  water: boolean;
  vertical: boolean;
  night: boolean;
  fog: number;
}

function featuresOf(m: MountainDef): FeatureFlags {
  switch (m.id) {
    case 'zhaoyao': return { water: true, vertical: false, night: false, fog: 0 };
    case 'tangting': return { water: false, vertical: false, night: false, fog: 0.08 };
    case 'yuanyi': return { water: false, vertical: true, night: false, fog: 0.72 };
    case 'niuyang': return { water: true, vertical: false, night: false, fog: 0 };
    case 'dishan': return { water: true, vertical: false, night: false, fog: 0.1 };
    case 'danyuan': return { water: true, vertical: true, night: false, fog: 0.06 };
    case 'jishan': return { water: false, vertical: false, night: true, fog: 0.25 };
    case 'qingqiu': return { water: false, vertical: false, night: true, fog: 0.4 };
    case 'jiwei': return { water: true, vertical: false, night: false, fog: 0.05 };
    case 'wuming': return { water: false, vertical: false, night: true, fog: 0.15 };
  }
}

const VILLAGER_LINES: Record<string, string[]> = {
  zhaoyao: [
    '阿果：从山脚到山祠要过四段路。野兽盯上你就打，识破了「问名」能收它做伴。',
    '阿果：祠座可以歇脚存身——倒下会回到最近一座祠。',
  ],
  tangting: [
    '采药人：白猿爱抢果子。看它摘果就往旁边翻，掷完了它会愣一下。',
    '采药人：棪木果是好东西，路上见着别漏。',
  ],
  yuanyi: [
    '石叔：这山「不可以上」，瘴里要贴着崖根走。蓄力杖能砸开凶兽的架式。',
    '石叔：蝮虫咬人带瘴毒，中了找赤鱬珠或回祠歇。',
  ],
  niuyang: [
    '牧童：鹿蜀唱歌别打断——它本不伤人。旋龟的「判木」响是音爆，弹反它能听出破绽。',
    '牧童：阳坡赤金阴坡白金，怪水里有龟影。',
  ],
  dishan: [
    '渔人：鯥冬死夏生。它假死时别补刀——行个礼（Q），它记你的情。',
    '渔人：水洼走不快，跳台过去。',
  ],
  danyuan: [
    '珠娘：亶爰静得很，「类」不先动手。你不动手，它也不动。',
    '珠娘：崖壁可以攀，往上走有水玉。',
  ],
  jishan: [
    '老羊：夜里的基山双凶同行。猼訑背上的眼睛会慑人，看它背眼亮就弹反。',
    '老羊：𪁺𩿧三首吵嘴，吵出声就是扑过来的时候。',
  ],
  qingqiu: [
    '婆婆：青丘雾紫。灌灌一「呵」能推人老远，弹反它。九尾……听到婴儿哭声捂住耳朵。',
    '婆婆：分身没有尾影。带尾影的才是真的。',
  ],
  jiwei: [
    '珠娘：箕尾踆于东海。潮涨潮落都在这条路上。',
    '珠娘：灌灌护巢，赤鱬近灯火——各走各的路吧。',
  ],
  wuming: [
    '无名客：……师父还在问。往里走吧，把问回来的名字，一个一个还回去。',
  ],
};

/** 生成某山的关卡（确定性）。 */
export function buildLevel(mountain: MountainId, opts?: { hidden?: boolean }): LevelDef {
  const m = getMountain(mountain);
  if (!m) throw new Error(`unknown mountain ${mountain}`);
  const flags = featuresOf(m);
  const rng = lcg(m.order * 7919 + 13);
  const width = SCREEN * 5;
  const platforms: PlatformDef[] = [];
  const waters: WaterDef[] = [];
  const spawns: SpawnDef[] = [];
  const pickups: PickupDef[] = [];
  const npcs: NpcDef[] = [];
  const steles: { x: number; text: string }[] = [];
  const segmentLabels: { x: number; label: string }[] = [];

  const wildPool = m.encounters;

  // —— 拍一：山脚村（闻） ——
  const seg1 = 0;
  segmentLabels.push({ x: seg1 + 60, label: '山脚' });
  npcs.push({ id: `${m.id}-villager`, name: m.order === 1 ? '阿果' : '山民', x: 240, lines: VILLAGER_LINES[m.id] ?? ['山民：路上小心。'] });
  steles.push({ x: 120, text: m.quote.slice(0, 60) + (m.quote.length > 60 ? '……' : '') });
  pickups.push({ kind: 'jade', amount: 1, x: 520, y: GROUND_Y - 26 });
  pickups.push({ kind: 'herb', itemId: 'zhuyu', amount: 1, x: 860, y: GROUND_Y - 24 });
  if (flags.water) waters.push({ x: seg1 + 950, w: 200 });

  // —— 拍二：采集径（备/迹）——
  const seg2 = SCREEN;
  segmentLabels.push({ x: seg2 + 60, label: '采集径' });
  // 平台阶梯：确定性轮换，垂直步距 ≤110px 保证满跳（≈163px，留容错）可达
  const style = m.order % 3;
  let prevY = GROUND_Y;
  for (let i = 0; i < 4; i += 1) {
    const px = seg2 + 150 + i * 230;
    const tier = (i + style) % 3;
    const rise = 70 + tier * 20; // 70 / 90 / 110
    const py = Math.min(prevY - 20, GROUND_Y - rise);
    const pw = 130 + Math.floor(rng() * 80);
    platforms.push({ x: px, y: py, w: pw, h: 22 });
    prevY = py;
    // 高层平台补一级踏板，避免 100+ 台阶手感紧
    if (rise >= 100 && i > 0) {
      platforms.push({ x: px - 110, y: py + 85, w: 100, h: 22 });
    }
  }
  // 采集点：每项山产一个点位（拾取即得全量，与存档 gathered 的 itemId 语义一致）
  let gx = seg2 + 220;
  for (const [itemId, qty] of Object.entries(m.gathers)) {
    const onPlatform = rng() < 0.55;
    const plat = platforms[(itemId.length + m.order) % platforms.length]!;
    pickups.push({
      kind: itemId === 'yupai' || itemId.startsWith('yu') ? 'jade' : 'herb',
      itemId,
      amount: Math.min(qty, 3),
      x: onPlatform ? plat.x + plat.w / 2 : gx,
      y: onPlatform ? plat.y - 24 : GROUND_Y - 24,
    });
    gx += 200;
    if (gx > seg2 + SCREEN - 120) gx = seg2 + 200;
  }
  // 野生兽：随山序加密（6 → 8 → 10），全程高密度遭遇（马里奥式踩怪节奏）；
  // 末位固定一只「异种」（高 2 级，皮更厚）
  const wildCount = m.order <= 3 ? 6 : m.order <= 7 ? 8 : 10;
  // 发牌器：加权洗牌后循环发——一山之内物种轮着出，杜绝整山同种
  const deal = makeDealer(wildPool, rng);
  for (let i = 0; i < wildCount; i += 1) {
    const enc = deal();
    if (!enc) break;
    const rare = i === wildCount - 1;
    const sx = seg2 + 260 + (i * (SCREEN - 460)) / Math.max(1, wildCount - 1);
    spawns.push({
      beastId: enc.beastId as BeastId,
      x: sx,
      level: wildLevelOf(m) + (rare ? 2 : 0),
      zone: 'wild',
      title: rare ? '异种' : undefined,
    });
  }

  // —— 拍三：变奏段（迹）——
  const seg3 = SCREEN * 2;
  segmentLabels.push({ x: seg3 + 60, label: flags.vertical ? '攀升崖径' : flags.water ? '水湾' : '深径' });
  if (flags.vertical) {
    // 攀升崖径：交错高台 + 可攀爬壁。水平边隙 ≤100px、垂直 ≤95px，保证 235 速度 + 163 跳可达。
    // 末台西移与前一台边隙 90px（测试阈值 140/115 内），避免猿翼/亶爰顶台孤立。
    for (let i = 0; i < 3; i += 1) {
      platforms.push({ x: seg3 + 140 + i * 210, y: GROUND_Y - 110 - i * 95, w: 150, h: 22, climbable: true });
    }
    platforms.push({ x: seg3 + SCREEN - 350, y: GROUND_Y - 380, w: 200, h: 22, climbable: true });
    pickups.push({ kind: 'jade', amount: 1, x: seg3 + 560, y: GROUND_Y - 390 });
  } else {
    for (let i = 0; i < 3; i += 1) {
      const px = seg3 + 180 + i * 330;
      const py = GROUND_Y - (75 + Math.floor(rng() * 35)); // 75–110，满跳必达
      platforms.push({ x: px, y: py, w: 120 + Math.floor(rng() * 80), h: 22 });
    }
  }
  if (flags.water) waters.push({ x: seg3 + 420, w: 260 });
  // 线索点 ×1（迹拍：爪迹/折桂/湿印）
  pickups.push({ kind: 'clue', amount: 1, x: seg3 + 320, y: GROUND_Y - 22 });
  // 变奏段兽群 ×4：双前哨 + 双压阵，接住采集径的密度
  for (let i = 0; i < 4; i += 1) {
    const enc = deal();
    if (!enc) break;
    spawns.push({
      beastId: enc.beastId as BeastId,
      x: seg3 + 340 + i * 240,
      level: wildLevelOf(m) + (i % 2 === 0 ? 1 : 0),
      zone: 'wild',
    });
  }

  // —— 拍四：精英门（遇）——
  const seg4 = SCREEN * 3;
  segmentLabels.push({ x: seg4 + 60, label: '瘴口' });
  pickups.push({ kind: 'clue', amount: 1, x: seg4 + 200, y: GROUND_Y - 22 });
  let eliteGate: LevelDef['eliteGate'];
  if (m.eliteFight) {
    const gateX = seg4 + 620;
    // 精英在门西侧（玩家同侧），墙在东侧防跳关：先战后过，不会隔墙打不着。
    eliteGate = {
      x: gateX,
      spawn: { beastId: m.eliteFight.beastId as BeastId, x: gateX - 140, level: m.eliteFight.level, zone: 'elite', title: m.eliteFight.title },
    };
    platforms.push({ x: seg4 + 140, y: GROUND_Y - 95, w: 160, h: 22 });
  } else {
    // 无精英门的山（亶爰/无名）：瘴口前放双哨，避免精英段空白
    for (let i = 0; i < 2; i += 1) {
      const enc = deal();
      if (!enc) break;
      spawns.push({ beastId: enc.beastId as BeastId, x: seg4 + 320 + i * 160, level: wildLevelOf(m) + 1, zone: 'wild' });
    }
  }

  // —— 拍五：山祠（决）——
  const seg5 = SCREEN * 4;
  segmentLabels.push({ x: seg5 + 60, label: '山祠' });
  const arenaX = seg5 + 160;
  const arenaW = SCREEN - 160 - 60;
  const boss = m.boss;
  pickups.push({ kind: 'clue', amount: 1, x: arenaX + 60, y: GROUND_Y - 22 });
  steles.push({ x: arenaX - 70, text: m.quote });
  npcs.push({
    id: `${m.id}-shrinekeeper`,
    name: '守祠老人',
    x: arenaX - 130,
    lines: [boss.intro, `山神：${m.god.name}。${m.god.desc}`],
  });

  // —— 知识机关门（每山一门，机制各异，原文即钥匙）——
  // 门放在 seg4 线索之后（seg4+280），保证 need=2 的门在门前能凑齐两条线索，不会未见先卡。
  const gateX = seg4 + 280;
  const gates: GateDef[] = [];
  const thorns: ThornDef[] = [];
  switch (m.id) {
    case 'zhaoyao':
      gates.push({ kind: 'item', x: gateX, item: 'zhuyu_cao', canon: '「食之不饥」', hint: '祝余的青华花在身，荒径的饿意追不上你——采一株祝余再过。' });
      thorns.push({ x: seg2 + 760, w: 130 });
      break;
    case 'tangting':
      // 重访时山产已采会只剩村口玉，need=1 保证永可过；首访多拿即多得。
      gates.push({ kind: 'jade', x: gateX, need: 1, canon: '「多水玉，多黄金」', hint: '滩上金玉闪着光——拾一枚，村里即信你走过这条水湾。' });
      break;
    case 'yuanyi':
      gates.push({ kind: 'clue', x: gateX, need: 1, canon: '迹 · 不可以上', hint: '瘴口认得读山的人——先拓一条线索（迹）。' });
      thorns.push({ x: seg3 + 700, w: 150 });
      break;
    case 'niuyang':
      gates.push({ kind: 'parry', x: gateX, canon: '「其音如判木」', hint: '判木锣响时弹反（I），两响即开——听音辨招。' });
      thorns.push({ x: seg2 + 640, w: 120 });
      break;
    case 'dishan':
      gates.push({ kind: 'clue', x: gateX, need: 2, canon: '「冬死而夏生」', hint: '线索拼齐，方见山祠——再拓一条（迹）。' });
      thorns.push({ x: seg2 + 800, w: 130 });
      break;
    case 'danyuan':
      gates.push({ kind: 'still', x: gateX, canon: '「食者不妒 · 以静制动」', hint: '类不争。在门前收杖静立三息（别按 J/K），门自开。' });
      break;
    case 'jishan':
      gates.push({ kind: 'item', x: gateX, item: 'migu_zhi', canon: '「佩之不迷」', hint: '夜雾认得迷榖。身上没有迷榖枝，就回招摇山采一枝（或炼迷榖佩）。' });
      break;
    case 'qingqiu':
      gates.push({ kind: 'clue', x: gateX, need: 2, canon: '「其阳多玉，其阴多青雘」', hint: '雾紫认线索——拼齐两条（迹），雾让路。' });
      thorns.push({ x: seg3 + 520, w: 140 });
      break;
    case 'jiwei':
      gates.push({ kind: 'tide', x: gateX, canon: '「其尾踆于东海」', hint: '潮涨淹门，潮退通行——观潮者得其隙。' });
      thorns.push({ x: seg2 + 700, w: 140 });
      break;
    case 'wuming':
      gates.push({ kind: 'tame', x: gateX, need: 3, canon: '名缚之门', hint: '问回来的名字是钥匙。收服满三只兽，此门自解。' });
      break;
  }

  // —— 隐藏 boss（GDD §2.2：狂化鹿蜀「谣音之主」完整版 / 无名崖底「初齿」）——
  if (opts?.hidden) {
    if (mountain === 'niuyang') {
      spawns.push({ beastId: 'lushu', x: seg5 + SCREEN / 2, level: m.order * 3 + 2, zone: 'elite', title: '谣音之主 · 狂化鹿蜀' });
      pickups.push({ kind: 'jade', amount: 3, x: seg5 + SCREEN / 2 - 90, y: GROUND_Y - 24 });
    } else if (mountain === 'wuming') {
      // 崖底：祠后两阶高台（95+90），跳攀而上可见「初齿」。均可攀，跳+攀双保险。
      platforms.push({ x: arenaX + arenaW - 260, y: GROUND_Y - 95, w: 150, h: 22, climbable: true });
      platforms.push({ x: arenaX + arenaW - 140, y: GROUND_Y - 185, w: 170, h: 22, climbable: true });
      spawns.push({ beastId: 'xingxing', x: arenaX + arenaW - 60, level: m.order * 3 + 4, zone: 'elite', title: '初齿 · 无名崖底' });
      pickups.push({ kind: 'jade', amount: 3, x: arenaX + arenaW - 200, y: GROUND_Y - 209 });
    }
  }

  // —— 兽点避水：野生点落在水湾里的平移到岸边（兽不下水）——
  for (const s of spawns) {
    if (s.zone !== 'wild') continue;
    const hit = waters.find((w) => s.x > w.x - 36 && s.x < w.x + w.w + 36);
    if (hit) s.x = s.x < hit.x + hit.w / 2 ? hit.x - 44 : hit.x + hit.w + 44;
  }

  // —— 装饰散布（确定性）：先圈“禁摆区”，再按节奏撒树/松/灌/石/花；水湾边补芦苇 ——
  const decos: DecorDef[] = [];
  const busy: { x: number; r: number }[] = [
    ...steles.map((s) => ({ x: s.x, r: 70 })),
    ...npcs.map((n) => ({ x: n.x, r: 80 })),
    ...[140, arenaX - 190].map((x) => ({ x, r: 70 })),
    ...gates.map((g) => ({ x: g.x, r: 90 })),
    ...(eliteGate ? [{ x: eliteGate.x, r: 90 }, { x: eliteGate.spawn.x, r: 90 }] : []),
    ...thorns.map((t) => ({ x: t.x, r: t.w / 2 + 40 })),
    { x: arenaX + arenaW - 80, r: 130 },
  ];
  const blocked = (x: number): boolean => busy.some((b) => Math.abs(b.x - x) < b.r);
  // 段落路牌：优先贴段落起点，被占则依次换位
  for (const seg of segmentLabels) {
    const cand = [seg.x + 40, seg.x - 90, seg.x + 190, seg.x - 220].map((x) => Math.max(60, Math.min(width - 90, x)));
    const sx = cand.find((x) => !blocked(x)) ?? cand[0]!;
    decos.push({ kind: 'sign', x: sx, y: GROUND_Y, label: seg.label });
    busy.push({ x: sx, r: 60 });
  }
  for (let x = 300; x < width - 140; x += 150) {
    const jx = Math.round(x + (rng() - 0.5) * 100);
    if (blocked(jx)) continue;
    const inWater = waters.some((w) => jx > w.x - 26 && jx < w.x + w.w + 26);
    const roll = rng();
    if (inWater) {
      decos.push({ kind: 'reed', x: jx, y: GROUND_Y, flip: rng() < 0.5 });
      continue;
    }
    if (roll < 0.3) decos.push({ kind: rng() < 0.55 ? 'tree' : 'pine', x: jx, y: GROUND_Y, flip: rng() < 0.5 });
    else if (roll < 0.56) decos.push({ kind: 'bush', x: jx, y: GROUND_Y, flip: rng() < 0.5 });
    else if (roll < 0.7) decos.push({ kind: 'rock', x: jx, y: GROUND_Y, flip: rng() < 0.5 });
    else if (roll < 0.94) decos.push({ kind: 'flower', x: jx, y: GROUND_Y, flip: rng() < 0.5 });
  }
  // 平台顶草簇/小花：给跳跃层添生机
  for (const p of platforms) {
    const n = Math.max(1, Math.floor(p.w / 80));
    for (let i = 0; i < n; i += 1) {
      if (rng() < 0.4) continue;
      decos.push({ kind: rng() < 0.72 ? 'tuft' : 'flower', x: Math.round(p.x + 16 + rng() * (p.w - 32)), y: p.y, flip: rng() < 0.5 });
    }
  }
  // 山祠迎宾双树 + 祠前花径
  decos.push({ kind: 'tree', x: arenaX + 46, y: GROUND_Y });
  decos.push({ kind: 'tree', x: arenaX + arenaW - 210, y: GROUND_Y, flip: true });
  decos.push({ kind: 'flower', x: arenaX + 120, y: GROUND_Y });
  decos.push({ kind: 'flower', x: arenaX + arenaW - 150, y: GROUND_Y });

  return {
    mountain: m.id,
    width,
    groundY: GROUND_Y,
    platforms,
    waters,
    spawns,
    pickups,
    gates,
    thorns,
    decos,
    checkpoints: [140, arenaX - 190],
    npcs,
    steles,
    eliteGate,
    boss: {
      arenaX,
      arenaW,
      spawn: { beastId: boss.beastId as BeastId, x: arenaX + arenaW - 200, level: boss.level, zone: 'boss', title: boss.title },
      intro: boss.intro,
      untamable: m.id === 'wuming',
      isWuming: m.id === 'wuming',
    },
    fog: flags.fog,
    night: flags.night,
    segmentLabels,
  };
}

function makeDealer(pool: MountainDef['encounters'], rng: () => number): () => { beastId: string } | null {
  const shuffled = <T>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j]!, a[i]!];
    }
    return a;
  };
  // 首轮物种各一张（全覆盖），之后加权循环（常见多种，稀有偶见）
  const first = shuffled(pool.map((e) => e.beastId));
  const bag: string[] = [];
  for (const e of pool) for (let i = 0; i < Math.max(1, Math.round(e.weight)); i += 1) bag.push(e.beastId);
  const rest = shuffled(bag);
  if (first.length === 0) return () => null;
  let k = 0;
  return () => {
    if (k < first.length) return { beastId: first[k++]! };
    const id = rest.length > 0 ? rest[(k - first.length) % rest.length]! : first[(k - first.length) % first.length]!;
    k += 1;
    return { beastId: id };
  };
}

function wildLevelOf(m: MountainDef): number {
  return Math.max(1, m.order * 2 - 1);
}

export function allMountainIds(): MountainId[] {
  return MOUNTAINS.map((m) => m.id);
}
