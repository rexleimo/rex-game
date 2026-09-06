/**
 * 《山海问兽》像素素材生成器（自包含，一次性产出）。
 * 管线：SVG 低分辨率渲染 → alpha 阈值 + 调色板量化 → 最近邻放大 → PNG（public/assets/shanhai-wenshou/pixel/）。
 * 全部程序自产（CC0），风格统一「水墨像素」。入库后 Phaser 走 spritesheet 动画。
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const OUT = 'public/assets/shanhai-wenshou/pixel';
mkdirSync(OUT, { recursive: true });

const PAL = {
  ink: [34, 28, 20], inkSoft: [58, 50, 38], paper: [239, 228, 200], skin: [232, 208, 168],
  straw: [168, 137, 78], robe: [61, 90, 107], robeDark: [40, 60, 72], sash: [166, 51, 43],
  gold: [228, 196, 121], wood: [122, 92, 56], grass: [74, 107, 90], stone: [74, 74, 66],
};
const toHex = (c) => c.map((v) => v.toString(16).padStart(2, '0')).join('');

function quantizeRaw(raw, w, h) {
  const out = Buffer.alloc(w * h * 4);
  const keys = Object.keys(PAL);
  for (let i = 0; i < w * h; i += 1) {
    const a = raw[i * 4 + 3];
    if (a < 128) { out[i * 4 + 3] = 0; continue; }
    const r = raw[i * 4], g = raw[i * 4 + 1], b = raw[i * 4 + 2];
    let nearest = PAL.ink, nd = Infinity;
    for (const key of keys) {
      const c = PAL[key];
      const d = (r - c[0]) ** 2 + (g - c[1]) ** 2 + (b - c[2]) ** 2;
      if (d < nd) { nd = d; nearest = c; }
    }
    out[i * 4] = nearest[0]; out[i * 4 + 1] = nearest[1]; out[i * 4 + 2] = nearest[2]; out[i * 4 + 3] = 255;
  }
  return out;
}

async function quantPng(svg, w, h, scale, file, colours = 16) {
  const raw = await sharp(Buffer.from(svg)).resize(w, h).ensureAlpha().raw().toBuffer();
  const quant = quantizeRaw(raw, w, h);
  await sharp(quant, { raw: { width: w, height: h, channels: 4 } })
    .resize(w * scale, h * scale, { kernel: 'nearest' })
    .png({ palette: true, colours })
    .toFile(path.join(OUT, file));
}

/* ---------- 主角 12 态 24 帧 ---------- */
const PL_FRAMES = [
  ['idle', 2], ['run', 6], ['jump', 2], ['roll', 4], ['light1', 2], ['light2', 2],
  ['light3', 2], ['heavy', 2], ['parry', 1], ['hurt', 1], ['climb', 2], ['dead', 1],
];

function playerFrameSvg(state, f) {
  let staffRot = 30, lean = 0, leg = 0, bob = 0, groupRot = 0, crouch = 0;
  switch (state) {
    case 'idle': bob = f === 1 ? 1 : 0; staffRot = 28 + bob * 4; break;
    case 'run': leg = Math.sin((f / 6) * Math.PI * 2) * 4; bob = f % 2; lean = 4; staffRot = 40 + leg * 2; break;
    case 'jump': lean = f === 0 ? -3 : 5; leg = f === 0 ? -2 : 3; staffRot = f === 0 ? 15 : 55; break;
    case 'roll': groupRot = f * 80 + 20; crouch = 4; leg = 3; break;
    case 'light1': staffRot = f === 0 ? -125 : 55; lean = f === 0 ? -4 : 8; leg = 2; break;
    case 'light2': staffRot = f === 0 ? -135 : 60; lean = f === 0 ? -5 : 9; leg = 2; break;
    case 'light3': staffRot = f === 0 ? -145 : 95; lean = f === 0 ? -6 : 12; leg = 4; break;
    case 'heavy': staffRot = f === 0 ? -150 : 120; lean = f === 0 ? -8 : 16; leg = 4; crouch = f === 0 ? 0 : 2; break;
    case 'parry': staffRot = 90; lean = -3; crouch = 1.5; break;
    case 'hurt': lean = -14; staffRot = 70; break;
    case 'climb': leg = f === 0 ? 3 : -3; staffRot = 70; break;
    case 'dead': groupRot = 88; staffRot = 60; break;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 24 32">
    <g transform="translate(12,${30 - bob}) rotate(${lean + groupRot} 0 0)">
      <line x1="-1" y1="0" x2="${-1 + leg}" y2="-7" stroke="#${toHex(PAL.ink)}" stroke-width="2.6"/>
      <line x1="1" y1="0" x2="${1 - leg}" y2="-7" stroke="#${toHex(PAL.inkSoft)}" stroke-width="2.6"/>
      <polygon points="-3,${-18 + crouch} 3,${-18 + crouch} 5,${-6 + crouch} -5,${-6 + crouch}" fill="#${toHex(PAL.robe)}" stroke="#${toHex(PAL.ink)}" stroke-width="0.7"/>
      <rect x="-5" y="${-13 + crouch}" width="10" height="1.4" fill="#${toHex(PAL.sash)}"/>
      <line x1="2" y1="${-16 + crouch}" x2="4" y2="${-11 + crouch}" stroke="#${toHex(PAL.robeDark)}" stroke-width="1.8"/>
      <circle cx="0" cy="${-20 + crouch}" r="2.6" fill="#${toHex(PAL.skin)}"/>
      <polygon points="-6,${-20 + crouch} 0,${-26 + crouch} 6,${-20 + crouch}" fill="#${toHex(PAL.straw)}" stroke="#${toHex(PAL.ink)}" stroke-width="0.7"/>
      <g transform="translate(4,${-12 + crouch}) rotate(${staffRot})">
        <line x1="0" y1="2" x2="0" y2="-16" stroke="#${toHex(PAL.wood)}" stroke-width="1.6"/>
        <rect x="-1" y="-15" width="2" height="1.6" fill="#${toHex(PAL.gold)}"/>
        <line x1="0" y1="2" x2="0" y2="4" stroke="#${toHex(PAL.sash)}" stroke-width="1.4"/>
      </g>
    </g>
  </svg>`;
}

async function genPlayer() {
  const FW = 24, FH = 32, S = 2, COLS = 6;
  const all = [];
  for (const [state, count] of PL_FRAMES) for (let f = 0; f < count; f += 1) all.push({ state, f });
  const rows = Math.ceil(all.length / COLS);
  const composite = [];
  for (let i = 0; i < all.length; i += 1) {
    const raw = await sharp(Buffer.from(playerFrameSvg(all[i].state, all[i].f))).resize(FW, FH).ensureAlpha().raw().toBuffer();
    const up = await sharp(quantizeRaw(raw, FW, FH), { raw: { width: FW, height: FH, channels: 4 } })
      .resize(FW * S, FH * S, { kernel: 'nearest' }).png().toBuffer();
    composite.push({ input: up, left: (i % COLS) * FW * S, top: Math.floor(i / COLS) * FH * S });
  }
  await sharp({ create: { width: COLS * FW * S, height: rows * FH * S, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(composite).png({ palette: true }).toFile(path.join(OUT, 'pl.png'));
  console.log(`pl.png ${all.length} 帧 (${COLS}列×${rows}行, ${FW * S}×${FH * S})`);
}

/* ---------- 兽 13×2 帧 ---------- */
const SIL = {
  ape: { body: 'M70 170 Q52 150 58 118 Q60 96 78 88 Q70 62 92 52 Q118 40 138 56 Q154 68 150 92 Q168 100 164 124 Q160 152 138 170 Z', head: 'M96 58 Q92 40 108 36 Q124 32 130 48 Q134 62 120 68 Q104 72 96 58 Z' },
  horse: { body: 'M40 150 Q36 118 62 104 Q96 88 132 96 Q162 102 166 126 Q168 146 148 152 L150 172 L136 172 L132 154 L96 156 L94 172 L80 172 L78 152 Q44 158 40 150 Z', head: 'M130 96 Q136 72 156 70 Q172 70 170 86 Q168 98 152 102 Z' },
  turtle: { body: 'M52 140 Q44 108 78 92 Q116 76 148 96 Q168 110 158 134 Q150 152 118 156 Q80 160 52 140 Z M66 138 L58 156 M148 138 L158 154', head: 'M150 96 Q162 74 176 80 Q184 86 176 98 Q168 106 154 104 Z' },
  fish: { body: 'M40 104 Q76 72 120 80 Q158 86 164 108 Q158 130 120 138 Q76 144 40 112 Z', head: 'M156 84 Q180 78 184 96 Q182 118 162 112 Z', extra: 'M118 80 L108 56 M132 82 L128 58 M96 86 L80 66' },
  cat: { body: 'M66 170 Q50 148 60 120 Q66 98 90 92 Q86 70 104 62 Q124 54 132 72 Q140 64 148 74 Q154 84 144 94 Q162 104 158 130 Q152 156 130 170 Z', head: 'M100 70 Q98 52 112 48 Q126 46 130 60 Q132 74 118 78 Q104 80 100 70 Z', extra: 'M112 46 L108 32 M124 46 L128 32' },
  ram: { body: 'M56 160 Q40 136 56 112 Q74 92 108 94 Q142 96 150 118 Q156 140 138 156 L142 172 L128 172 L124 158 L92 160 L90 172 L76 172 L76 158 Q60 166 56 160 Z', head: 'M108 94 Q104 68 124 62 Q144 58 146 76 Q146 92 128 96 Z' },
  bird: { body: 'M96 160 Q78 140 88 112 Q94 92 116 88 Q136 84 146 100 Q158 116 148 138 Q140 156 118 162 Z M118 88 L112 60 M132 88 L136 62 M108 92 L96 68', head: 'M112 60 Q108 42 124 40 Q140 40 140 54 Q138 66 124 66 Z' },
  serpent: { body: 'M48 164 Q40 138 64 130 Q92 122 96 100 Q100 78 124 76 Q148 74 152 92 Q156 112 132 116 Q110 120 112 138 Q114 158 140 164 Q150 166 156 158', head: 'M148 74 Q158 56 174 62 Q184 68 176 80 Q166 88 152 84 Z' },
  fox: { body: 'M70 166 Q52 146 60 118 Q68 94 94 90 Q90 66 108 58 Q126 52 132 70 Q136 64 142 72 Q148 82 140 92 Q158 102 152 128 Q146 154 124 166 Z', head: 'M102 64 Q98 46 114 42 Q130 40 134 56 Q136 70 122 74 Q106 76 102 64 Z' },
};
const BEAST_PIXEL = [
  ['xingxing', '#9c6b4a', 'ape'], ['baiyuan', '#e8e2d4', 'ape'], ['fuchong', '#6b7a45', 'serpent'],
  ['guaishe', '#4f5d3a', 'serpent'], ['lushu', '#c88a4e', 'horse'], ['xuangui', '#3c4a52', 'turtle'],
  ['lu', '#5a7d8c', 'fish'], ['lei', '#8c7a5e', 'cat'], ['boyi', '#b09a6a', 'ram'],
  ['changfu', '#a8552e', 'bird'], ['guanguan', '#4a7d6b', 'bird'], ['chiru', '#c25a4a', 'fish'],
  ['jiuwei', '#d8a24e', 'fox'],
];

function beastSvg(sil, tint, frame) {
  const lean = frame === 1 ? -4 : 0;
  const bob = frame === 1 ? 4 : 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="40" viewBox="8 ${20 + bob} 184 180">
    <g transform="rotate(${lean} 100 160)">
      <path d="${sil.body}" fill="${tint}" stroke="#${toHex(PAL.ink)}" stroke-width="6"/>
      ${sil.head ? `<path d="${sil.head}" fill="${tint}" stroke="#${toHex(PAL.ink)}" stroke-width="6"/>` : ''}
      ${sil.extra ? `<path d="${sil.extra}" fill="none" stroke="${tint}" stroke-width="8" stroke-linecap="round"/>` : ''}
      <circle cx="118" cy="66" r="5" fill="#${toHex(PAL.gold)}"/>
    </g>
  </svg>`;
}

async function genBeasts() {
  const FW = 44, FH = 40, S = 2;
  const composite = [];
  let col = 0;
  for (const [id, tint, sil] of BEAST_PIXEL) {
    for (let f = 0; f < 2; f += 1) {
      const raw = await sharp(Buffer.from(beastSvg(SIL[sil], tint, f))).resize(FW, FH).ensureAlpha().raw().toBuffer();
      const up = await sharp(quantizeRaw(raw, FW, FH), { raw: { width: FW, height: FH, channels: 4 } })
        .resize(FW * S, FH * S, { kernel: 'nearest' }).png().toBuffer();
      composite.push({ input: up, left: col * FW * S, top: 0 });
      col += 1;
    }
  }
  await sharp({ create: { width: col * FW * S, height: FH * S, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(composite).png({ palette: true }).toFile(path.join(OUT, 'beasts.png'));
  console.log(`beasts.png ${col} 帧`);
}

/* ---------- 每山地块/平台/水/三层视差 ----------
 * 调色板与 src/games/shanhai-wenshou/action/levels.ts 的 PALETTES 保持逐字一致：
 * 亮色像素风（马里奥式明快），十山各自时辰/色相区分。 */
const PALETTES = {
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
const MOUNTAIN_IDS = ['zhaoyao', 'tangting', 'yuanyi', 'niuyang', 'dishan', 'danyuan', 'jishan', 'qingqiu', 'jiwei', 'wuming'];

function mixHex(a, b, t) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `#${pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
}

/** 直出像素 PNG：alpha 硬阈值 + 最近邻放大，色彩交给 sharp 动态量化（保真亮色，不再压到水墨盘）。 */
async function pixelPng(svg, w, h, scale, file, colours = 24) {
  const raw = await sharp(Buffer.from(svg)).resize(w, h).ensureAlpha().raw().toBuffer();
  for (let i = 0; i < w * h; i += 1) raw[i * 4 + 3] = raw[i * 4 + 3] < 128 ? 0 : 255;
  await sharp(raw, { raw: { width: w, height: h, channels: 4 } })
    .resize(w * scale, h * scale, { kernel: 'nearest' })
    .png({ palette: true, colours })
    .toFile(path.join(OUT, file));
}

/* ---------- 三层视差（无缝平铺 240×135 → ×4 = 960×540，运行时 tileSprite 1:1） ---------- */
const RW = 240, RH = 135, RS = 4;

/** 三角波（整周期 → 首尾无缝）。 */
function tri(t) { return (2 / Math.PI) * Math.asin(Math.sin(t)); }
function lcg(seed) {
  let s = Math.floor(seed * 2654435761) % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

function svgPeaks(seed, fill, snow, line) {
  const pts = [];
  for (let x = 0; x <= RW; x += 2) {
    const h = Math.max(0, tri((x / RW) * Math.PI * 4 + seed)) + Math.max(0, tri((x / RW) * Math.PI * 10 + seed * 2.7)) * 0.42;
    pts.push([x, Math.round(124 - h * 66)]);
  }
  const top = `M${pts[0][0]} ${pts[0][1]} ` + pts.map(([x, y]) => `L${x} ${y}`).join(' ');
  const d = `${top} L${RW} ${RH} L0 ${RH} Z`;
  // 雪冠：峰顶高度超过雪线的连续段闭合成冠面
  const snowLine = 62;
  const runs = [];
  let cur = null;
  for (const pt of pts) {
    if (pt[1] < snowLine) { if (!cur) cur = []; cur.push(pt); }
    else if (cur) { runs.push(cur); cur = null; }
  }
  if (cur) runs.push(cur);
  const caps = runs
    .filter((r) => r.length > 3)
    .map((r) => `M${r[0][0]} ${snowLine} ${r.map(([x, y]) => `L${x} ${y}`).join(' ')} L${r[r.length - 1][0]} ${snowLine} Z`)
    .join(' ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${RW}" height="${RH}" viewBox="0 0 ${RW} ${RH}">
    <path d="${d}" fill="${fill}"/>
    ${caps ? `<path d="${caps}" fill="${snow}"/>` : ''}
    <path d="${top}" fill="none" stroke="${line}" stroke-width="1.4" opacity="0.5"/>
  </svg>`;
}

function svgHills(seed, fill, light, shade) {
  const pts = [];
  for (let x = 0; x <= RW; x += 2) {
    const t = (x / RW) * Math.PI * 2;
    const s1 = (Math.sin(t * 2 + seed) + 1) / 2;
    const s2 = (Math.sin(t * 3 + seed * 1.9 + 2.1) + 1) / 2;
    const y = Math.round(98 - (0.32 + 0.4 * s1 + 0.28 * s2) * 44);
    pts.push([x, y]);
  }
  const top = `M${pts[0][0]} ${pts[0][1]} ` + pts.map(([x, y]) => `L${x} ${y}`).join(' ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${RW}" height="${RH}" viewBox="0 0 ${RW} ${RH}">
    <path d="${top} L${RW} ${RH} L0 ${RH} Z" fill="${fill}"/>
    <path d="${top}" fill="none" stroke="${light}" stroke-width="3" opacity="0.85"/>
    <path d="${top}" fill="none" stroke="${shade}" stroke-width="1.2" opacity="0.5" transform="translate(0 3)"/>
  </svg>`;
}

function svgTreeline(seed, leafDark, leafLight, trunk) {
  const rnd = lcg(seed);
  let s = `<rect y="96" width="${RW}" height="${RH - 96}" fill="${leafDark}"/>`;
  // 越界回绕（i = -1..12）保证左右接缝连续
  for (let i = -1; i <= 12; i += 1) {
    const cx = i * 20 + 10 + (rnd() - 0.5) * 8;
    const kind = (i + 12) % 3;
    if (kind === 0) {
      const r = 10 + rnd() * 5;
      const cy = 95 - r * 0.5;
      s += `<circle cx="${cx - 2}" cy="${cy - 3}" r="${r}" fill="${leafLight}"/>`
        + `<circle cx="${cx + 1.5}" cy="${cy}" r="${r}" fill="${leafDark}"/>`
        + `<rect x="${cx - 2}" y="${cy + r * 0.55}" width="4" height="10" fill="${trunk}"/>`;
    } else if (kind === 1) {
      const r = 7 + rnd() * 4;
      const cy = 97 - r * 0.45;
      s += `<circle cx="${cx - 1.5}" cy="${cy - 2.5}" r="${r}" fill="${leafLight}"/>`
        + `<circle cx="${cx + 1}" cy="${cy}" r="${r}" fill="${leafDark}"/>`;
    } else {
      const h = 18 + rnd() * 10;
      const w = 7 + rnd() * 4;
      s += `<polygon points="${cx - w},${97} ${cx},${97 - h} ${cx + w},97" fill="${leafLight}"/>`
        + `<polygon points="${cx - w * 0.72},${97} ${cx + 1.5},${97 - h * 0.78} ${cx + w * 0.9},97" fill="${leafDark}"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${RW}" height="${RH}" viewBox="0 0 ${RW} ${RH}">${s}</svg>`;
}

async function genMountain(id, order) {
  const p = PALETTES[id];
  const seed = order * 3.7;
  await pixelPng(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="24" viewBox="0 0 32 24">
    <rect width="32" height="24" fill="${p.ground}"/>
    <rect width="32" height="7" fill="${p.groundTop}"/>
    <rect y="7" width="32" height="1.6" fill="${mixHex(p.groundTop, '#ffffff', 0.35)}"/>
    ${[3, 10, 17, 24, 29].map((x) => `<rect x="${x}" y="${9 + (x % 3) * 4}" width="3" height="1.6" fill="${mixHex(p.ground, '#000000', 0.35)}"/>`).join('')}
    ${[6, 14, 22, 28].map((x) => `<rect x="${x}" y="${13 + (x % 2) * 5}" width="2" height="2" fill="${mixHex(p.groundTop, '#ffffff', 0.2)}"/>`).join('')}
    <rect y="0" width="32" height="1.2" fill="${mixHex(p.groundTop, '#ffffff', 0.6)}"/>
  </svg>`, 32, 24, 1, `ground_${id}.png`, 10);
  await pixelPng(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="8" viewBox="0 0 32 8">
    <rect width="32" height="8" fill="${p.ground}"/>
    <rect width="32" height="2.6" fill="${p.groundTop}"/>
    <rect y="2.6" width="32" height="0.9" fill="${mixHex(p.groundTop, '#ffffff', 0.4)}"/>
    <rect y="7" width="32" height="1" fill="${mixHex(p.ground, '#000000', 0.4)}"/>
  </svg>`, 32, 8, 1, `plat_${id}.png`, 8);
  await pixelPng(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="24" viewBox="0 0 32 24">
    <rect width="32" height="24" fill="${p.water}"/>
    ${[4, 10, 16, 20].map((y) => `<path d="M0 ${y} Q8 ${y - 2.4} 16 ${y} T32 ${y}" stroke="${mixHex(p.water, '#ffffff', 0.65)}" stroke-width="1.2" fill="none" opacity="0.8"/>`).join('')}
    <rect y="0" width="32" height="2" fill="${mixHex(p.water, '#ffffff', 0.5)}"/>
  </svg>`, 32, 24, 1, `water_${id}.png`, 8);

  const night = ['jishan', 'qingqiu', 'wuming'].includes(id);
  const layers = [
    { file: `rf_${id}.png`, svg: svgPeaks(seed, mixHex(p.ridgeFar, p.skyBot, 0.3), night ? mixHex(p.ridgeFar, '#d8e4f8', 0.6) : mixHex(p.ridgeFar, '#ffffff', 0.82), mixHex(p.ridgeFar, '#ffffff', 0.6)) },
    { file: `rm_${id}.png`, svg: svgHills(seed * 1.3, p.ridgeMid, mixHex(p.ridgeMid, '#ffffff', 0.4), mixHex(p.ridgeMid, '#10141c', 0.45)) },
    { file: `rn_${id}.png`, svg: svgTreeline(seed * 2.1, p.ridgeNear, mixHex(p.ridgeNear, '#ffffff', 0.22), mixHex(p.ridgeNear, '#1a1208', 0.4)) },
  ];
  for (const L of layers) await pixelPng(L.svg, RW, RH, RS, L.file, 14);
  console.log(`mountain ${id} ok`);
}

/* ---------- 道具 ---------- */
async function genProps() {
  await quantPng(`<svg xmlns="http://www.w3.org/2000/svg" width="26" height="34" viewBox="0 0 26 34">
    <rect x="8" y="20" width="10" height="14" fill="#${toHex(PAL.stone)}"/>
    <rect x="11" y="12" width="4" height="9" fill="#${toHex(PAL.stone)}"/>
    <polygon points="4,13 13,4 22,13" fill="#${toHex(PAL.stone)}" stroke="#${toHex(PAL.ink)}" stroke-width="0.8"/>
    <circle cx="13" cy="17" r="3.4" fill="#${toHex(PAL.gold)}"/>
  </svg>`, 26, 34, 2, 'lantern.png');
  await quantPng(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="52" viewBox="0 0 64 52">
    <rect x="8" y="16" width="6" height="36" fill="#2e2a24"/><rect x="50" y="16" width="6" height="36" fill="#2e2a24"/>
    <rect x="2" y="12" width="60" height="6" fill="#3c362c"/>
    <polygon points="0,13 32,2 64,13 58,16 32,7 6,16" fill="#4a4438"/>
    <rect x="27" y="17" width="10" height="6" fill="#${toHex(PAL.gold)}"/>
  </svg>`, 64, 52, 2, 'shrine.png');
  await quantPng(`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="30" viewBox="0 0 22 30">
    <polygon points="4,3 18,3 18,26 4,26" fill="#${toHex(PAL.stone)}" stroke="#${toHex(PAL.ink)}" stroke-width="1"/>
    ${[7, 11, 15, 19].map((y) => `<line x1="7" y1="${y}" x2="15" y2="${y}" stroke="#${toHex(PAL.paper)}" stroke-width="1" opacity="0.7"/>`).join('')}
    <rect x="2" y="26" width="18" height="3" fill="#${toHex(PAL.stone)}"/>
  </svg>`, 22, 30, 2, 'stele.png');
  await quantPng(`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="14" viewBox="0 0 12 14">
    <line x1="6" y1="14" x2="6" y2="4" stroke="#8fd0a0" stroke-width="1.4"/>
    <line x1="6" y1="14" x2="2" y2="6" stroke="#7ab88a" stroke-width="1.2"/>
    <line x1="6" y1="14" x2="10" y2="6" stroke="#7ab88a" stroke-width="1.2"/>
    <circle cx="6" cy="3.4" r="1.6" fill="#a8e8c0"/>
  </svg>`, 12, 14, 2, 'herb.png');
  await quantPng(`<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10">
    <polygon points="5,0 10,5 5,10 0,5" fill="#${toHex(PAL.gold)}" stroke="#fff6d6" stroke-width="0.8"/>
  </svg>`, 10, 10, 2, 'jade.png');
  await quantPng(`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="14" viewBox="0 0 12 14">
    <rect x="1" y="1" width="10" height="12" fill="#${toHex(PAL.paper)}" stroke="#${toHex(PAL.ink)}" stroke-width="0.8"/>
    ${[4, 7, 10].map((y) => `<line x1="3" y1="${y}" x2="9" y2="${y}" stroke="#3c3226" stroke-width="0.8"/>`).join('')}
  </svg>`, 12, 14, 2, 'clue.png');
  console.log('props ok');
}

for (const [i, id] of MOUNTAIN_IDS.entries()) await genMountain(id, i + 1);
await genProps();
await genPlayer();
await genBeasts();
console.log('ALL DONE');
