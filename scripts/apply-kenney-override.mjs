/**
 * 《山海问兽》Kenney 覆盖包合成器。
 * 把 resources/kenney-src（CC0 源文件，小体积 vendor）合成为
 * public/assets/shanhai-wenshou/override/ 的 68 个运行时文件 + manifest.json。
 * 输出文件名/切片与自产 pixel/ 管线完全一致，游戏代码零改动。
 *
 * 来源（均为 CC0-1.0，LICENSE 见 resources/kenney-src/）：
 * - New Platformer Pack 1.1（人物/兽/地块/水/道具）
 * - 自产 pixel/（5 种无 Kenney 对应兽 + 三层视差山，见 MAPPING_KEEP）
 *
 * 用法：node scripts/apply-kenney-override.mjs
 */
import sharp from 'sharp';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const SRC = 'resources/kenney-src/new-platformer';
const PIXEL = 'public/assets/shanhai-wenshou/pixel';
const OUT = 'public/assets/shanhai-wenshou/override';
mkdirSync(OUT, { recursive: true });

const MOUNTAINS = ['zhaoyao', 'tangting', 'yuanyi', 'niuyang', 'dishan', 'danyuan', 'jishan', 'qingqiu', 'jiwei', 'wuming'];
/** 山 → Kenney 地形砖（tileSprite 平铺，要求无缝；horizontal_middle 天然无缝）。 */
const BIOME = {
  zhaoyao: 'grass', tangting: 'sand', yuanyi: 'purple', niuyang: 'dirt', dishan: 'stone',
  danyuan: 'snow', jishan: 'stone', qingqiu: 'grass', jiwei: 'sand', wuming: 'snow',
};
/** 山 → 地形砖染色（乘法 tint，把 Kenney 原色揉进每山调色板；null = 原色直出）。 */
const TINT = {
  zhaoyao: null,
  tangting: { r: 255, g: 236, b: 196 },
  yuanyi: { r: 226, g: 208, b: 255 },
  niuyang: { r: 255, g: 216, b: 176 },
  dishan: { r: 191, g: 234, b: 224 },
  danyuan: { r: 208, g: 224, b: 246 },
  jishan: { r: 140, g: 164, b: 214 },
  qingqiu: { r: 255, g: 198, b: 220 },
  jiwei: { r: 216, g: 242, b: 232 },
  wuming: { r: 214, g: 214, b: 222 },
};

/** 抠透明边 → contain 缩进目标框（最近邻，保持像素风）→ 居中。 */
async function fitCell(src, boxW, boxH, opts = {}) {
  let img = sharp(src).trim({ threshold: opts.trimThreshold ?? 10 });
  if (opts.hue) img = img.modulate({ hue: opts.hue });
  const buf = await img.toBuffer();
  const meta = await sharp(buf).metadata();
  const scale = Math.min(boxW / meta.width, boxH / meta.height);
  const w = Math.max(1, Math.round(meta.width * scale));
  const h = Math.max(1, Math.round(meta.height * scale));
  const resized = await sharp(buf).resize(w, h, { kernel: 'nearest' }).png().toBuffer();
  return { input: resized, left: Math.round((boxW - w) / 2) + (opts.dx ?? 0), top: Math.round((boxH - h) / 2) + (opts.dy ?? 0) };
}

/** 木杖覆盖层：以 (34,52) 为握点按角度画杖，盖出“持杖”身份。 */
async function staffLayer(angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  const x2 = 34 + Math.cos(rad) * 40;
  const y2 = 52 + Math.sin(rad) * 40;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="64" viewBox="0 0 48 64">
    <line x1="34" y1="52" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#7a5c38" stroke-width="3.4" stroke-linecap="round"/>
    <circle cx="${x2.toFixed(1)}" cy="${y2.toFixed(1)}" r="2.6" fill="#e4c479"/>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/* ---------- 主角 27 帧（顺序 = PL_FRAMES，索引与 WorldScene 动画表对齐） ---------- */
const CHAR = (n) => path.join(SRC, `character_yellow_${n}.png`);
const PLAYER_SPEC = [
  // [源, dx, dy, rot90, staff角|null]
  [CHAR('idle'), 0, 0, 0, 25], [CHAR('idle'), 0, 2, 0, 30],
  [CHAR('walk_a'), 0, 0, 0, 35], [CHAR('walk_b'), 0, 1, 0, 40], [CHAR('walk_a'), 0, 1, 0, 35],
  [CHAR('walk_b'), 0, 0, 0, 40], [CHAR('walk_a'), 0, 0, 0, 35], [CHAR('walk_b'), 0, 1, 0, 40],
  [CHAR('jump'), 0, 0, 0, 15], [CHAR('jump'), 0, 3, 0, 50],
  [CHAR('duck'), 0, 0, 0, null], [CHAR('duck'), 0, 0, 90, null],
  [CHAR('duck'), 0, 0, 180, null], [CHAR('duck'), 0, 0, 270, null],
  [CHAR('hit'), 0, 0, 0, -120], [CHAR('walk_a'), 0, 0, 0, 55],
  [CHAR('walk_b'), 0, 0, 0, -130], [CHAR('hit'), 0, 0, 0, 60],
  [CHAR('jump'), 0, 0, 0, -140], [CHAR('hit'), 0, 0, 0, 95],
  [CHAR('duck'), 0, 0, 0, -150], [CHAR('hit'), 0, 0, 0, 120],
  [CHAR('hit'), 0, 0, 0, 90],
  [CHAR('hit'), 0, 0, 0, 70],
  [CHAR('climb_a'), 0, 0, 0, null], [CHAR('climb_b'), 0, 0, 0, null],
  [CHAR('front'), 0, 0, 90, null],
];

async function genPlayer() {
  const FW = 48, FH = 64, COLS = 6;
  const layers = [];
  for (let i = 0; i < PLAYER_SPEC.length; i += 1) {
    const [src, dx, dy, rot, staff] = PLAYER_SPEC[i];
    let buf = await sharp(src).trim({ threshold: 10 }).toBuffer();
    if (rot) buf = await sharp(buf).rotate(rot).toBuffer();
    const meta = await sharp(buf).metadata();
    const scale = Math.min(40 / meta.width, 56 / meta.height);
    const w = Math.max(1, Math.round(meta.width * scale));
    const h = Math.max(1, Math.round(meta.height * scale));
    const cell = await sharp({
      create: { width: FW, height: FH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    })
      .composite([{ input: await sharp(buf).resize(w, h, { kernel: 'nearest' }).png().toBuffer(), left: Math.round((FW - w) / 2) + dx, top: Math.round((FH - h) / 2) + dy }])
      .png().toBuffer();
    const final = staff == null
      ? cell
      : await sharp(cell).composite([{ input: await staffLayer(staff) }]).png().toBuffer();
    layers.push({ input: final, left: (i % COLS) * FW, top: Math.floor(i / COLS) * FH });
  }
  const rows = Math.ceil(PLAYER_SPEC.length / COLS);
  await sharp({ create: { width: COLS * FW, height: rows * FH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(layers).png({ palette: true }).toFile(path.join(OUT, 'pl.png'));
  console.log(`pl.png ${PLAYER_SPEC.length} 帧 Kenney-ok`);
}

/* ---------- 兽 26 帧（顺序 = BEAST_PIXEL；5 种无对应物种沿用自产） ---------- */
const EN = (n) => path.join(SRC, `${n}.png`);
// null = 沿用 pixel/beasts.png 对应两帧；[a,b,hue?,boxW?,boxH?] = Kenney 两帧
const BEAST_MAP = {
  xingxing: null, baiyuan: null,
  fuchong: [EN('worm_normal_move_a'), EN('worm_normal_move_b')],
  guaishe: [EN('worm_ring_move_a'), EN('worm_ring_move_b')],
  lushu: null,
  xuangui: [EN('snail_walk_a'), EN('snail_walk_b'), 0, 60, 50],
  lu: [EN('fish_yellow_swim_a'), EN('fish_yellow_swim_b')],
  lei: [EN('mouse_walk_a'), EN('mouse_walk_b'), 0, 64, 64],
  boyi: null,
  changfu: [EN('bee_a'), EN('bee_b')],
  guanguan: [EN('fly_a'), EN('fly_b')],
  chiru: [EN('fish_yellow_swim_a'), EN('fish_yellow_swim_b'), -30], // 黄→赤
  jiuwei: null,
};
const BEAST_ORDER = ['xingxing', 'baiyuan', 'fuchong', 'guaishe', 'lushu', 'xuangui', 'lu', 'lei', 'boyi', 'changfu', 'guanguan', 'chiru', 'jiuwei'];

async function genBeasts() {
  const FW = 88, FH = 80;
  const kept = await sharp(path.join(PIXEL, 'beasts.png')).toBuffer();
  const keptMeta = await sharp(kept).metadata();
  const keptCellW = Math.round(keptMeta.width / 26);
  const layers = [];
  let col = 0;
  for (const id of BEAST_ORDER) {
    const spec = BEAST_MAP[id];
    for (let f = 0; f < 2; f += 1) {
      let cell;
      if (spec == null) {
        cell = await sharp(kept).extract({ left: (BEAST_ORDER.indexOf(id) * 2 + f) * keptCellW, top: 0, width: keptCellW, height: keptMeta.height }).png().toBuffer();
      } else {
        const [a, b, hue, boxW = 76, boxH = 68] = spec;
        const fitted = await fitCell(f === 0 ? a : b, boxW, boxH, hue ? { hue } : {});
        cell = await sharp({ create: { width: FW, height: FH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
          .composite([fitted]).png().toBuffer();
      }
      layers.push({ input: cell, left: col * FW, top: 0 });
      col += 1;
    }
  }
  await sharp({ create: { width: col * FW, height: FH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(layers).png({ palette: true }).toFile(path.join(OUT, 'beasts.png'));
  console.log(`beasts.png ${col} 帧（Kenney 8 种 + 自产保留 5 种）`);
}

/* ---------- 地块/平台/水 ---------- */
async function genTerrain() {
  for (const m of MOUNTAINS) {
    const tile = path.join(SRC, `terrain_${BIOME[m]}_horizontal_middle.png`);
    const tint = TINT[m];
    if (tint) {
      // 乘法染色：让 Kenney 砖揉进每山调色板（无缝平铺不受影响）
      const buf = await sharp(tile).tint(tint).png().toBuffer();
      for (const pre of ['ground', 'plat']) {
        await sharp(buf).toFile(path.join(OUT, `${pre}_${m}.png`));
      }
    } else {
      copyFileSync(tile, path.join(OUT, `ground_${m}.png`));
      copyFileSync(tile, path.join(OUT, `plat_${m}.png`));
    }
  }
  const top = await sharp(path.join(SRC, 'water_top.png')).resize(64, 20, { kernel: 'nearest' }).png().toBuffer();
  const body = await sharp(path.join(SRC, 'water.png')).resize(64, 44, { kernel: 'nearest' }).png().toBuffer();
  const water = await sharp({ create: { width: 64, height: 64, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: top, left: 0, top: 0 }, { input: body, left: 0, top: 20 }]).png().toBuffer();
  for (const m of MOUNTAINS) {
    await sharp(water).toFile(path.join(OUT, `water_${m}.png`));
  }
  console.log('terrain/water ok（10 山×3，砖按 biome+tint 调色）');
}

/* ---------- 视差山（沿用自产调色板，保证十山辨识度） ---------- */
function genRidges() {
  for (const m of MOUNTAINS) {
    for (const L of ['rf', 'rm', 'rn']) copyFileSync(path.join(PIXEL, `${L}_${m}.png`), path.join(OUT, `${L}_${m}.png`));
  }
  console.log('ridges ok（沿用自产 30 张）');
}

/* ---------- 道具 ---------- */
async function prop(src, names, boxW, boxH, extra = {}) {
  const fitted = await fitCell(path.join(SRC, src), boxW, boxH, extra);
  const out = await sharp({ create: { width: boxW, height: boxH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([fitted]).png().toBuffer();
  for (const n of names) await sharp(out).toFile(path.join(OUT, n));
}

async function genProps() {
  await prop('torch_on_a.png', ['lantern.png'], 52, 68);
  await prop('sign.png', ['clue.png'], 24, 28);
  await prop('rock.png', ['stele.png'], 44, 60);
  await prop('mushroom_red.png', ['herb.png'], 24, 28);
  await prop('gem_yellow.png', ['jade.png'], 20, 20);
  // 山祠 = 门楣 + 门扇叠放
  const top = await sharp(path.join(SRC, 'door_closed_top.png')).trim({ threshold: 10 }).toBuffer();
  const door = await sharp(path.join(SRC, 'door_closed.png')).trim({ threshold: 10 }).toBuffer();
  const tm = await sharp(top).metadata(); const dm = await sharp(door).metadata();
  const W = 128, s = Math.min(1, W / Math.max(tm.width, dm.width));
  const tw = Math.round(tm.width * s), th = Math.round(tm.height * s);
  const dw = Math.round(dm.width * s), dh = Math.round(dm.height * s);
  const H = th + dh;
  await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([
      { input: await sharp(top).resize(tw, th, { kernel: 'nearest' }).png().toBuffer(), left: Math.round((W - tw) / 2), top: 0 },
      { input: await sharp(door).resize(dw, dh, { kernel: 'nearest' }).png().toBuffer(), left: Math.round((W - dw) / 2), top: th },
    ]).png().toFile(path.join(OUT, 'shrine.png'));
  console.log('props ok（灯/牌/碑/菇/玉/祠门）');
}

/* ---------- manifest ---------- */
function genManifest() {
  const files = ['pl.png', 'beasts.png'];
  for (const m of MOUNTAINS) files.push(`ground_${m}.png`, `plat_${m}.png`, `water_${m}.png`, `rf_${m}.png`, `rm_${m}.png`, `rn_${m}.png`);
  files.push('lantern.png', 'shrine.png', 'stele.png', 'herb.png', 'jade.png', 'clue.png');
  const manifest = {
    pack: 'kenney-new-platformer-1.1',
    license: 'CC0-1.0',
    source: 'https://kenney.nl/assets/new-platformer-pack',
    note: '人物/8兽/地块/水/道具为 Kenney CC0；5 兽（猿×2/马/羊/狐）与三层视差山为自产（无对应物种，保辨识度）。合成器见 scripts/apply-kenney-override.mjs，源文件见 resources/kenney-src。',
    files,
  };
  writeFileSync(path.join(OUT, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  // 自检：清单每个文件必须存在
  const missing = files.filter((f) => {
    try { readFileSync(path.join(OUT, f)); return false; } catch { return true; }
  });
  if (missing.length > 0) { console.error(`MISSING: ${missing.join(', ')}`); process.exit(1); }
  console.log(`manifest ok（${files.length} 文件，override 已启用）`);
}

await genPlayer();
await genBeasts();
await genTerrain();
genRidges();
await genProps();
genManifest();
console.log('ALL DONE');
