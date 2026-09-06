import * as Phaser from 'phaser';
import type { MountainId } from '../core/types.ts';
import { paletteOf, type MountainPalette } from './levels.ts';
import type { DecorKind } from './levels.ts';

/**
 * 像素平台美术（明亮马里奥风 + 山水意象）：
 * 背景=亮色渐变天穹/云带/雪峰/圆丘/树线五层视差（每山一套调色板）；
 * 装饰=树/松/灌/石/花/芦/草簇/路牌，随山调色板烘焙；
 * 人/兽=外部素材包贴图（override）或自产像素。全部可整层替换。
 */

export const TEX = {
  sky: (m: string) => `sky_${m}`,
  clouds: 'clouds_band',
  ridgeFar: (m: string) => `rf_${m}`,
  ridgeMid: (m: string) => `rm_${m}`,
  ridgeNear: (m: string) => `rn_${m}`,
  ground: (m: string) => `gd_${m}`,
  platform: (m: string) => `pf_${m}`,
  mist: (m: string) => `mi_${m}`,
  water: (m: string) => `wt_${m}`,
  decoTree: (m: string) => `dtree_${m}`,
  decoPine: (m: string) => `dpine_${m}`,
  decoBush: (m: string) => `dbush_${m}`,
  decoRock: (m: string) => `drock_${m}`,
  decoFlower: (m: string) => `dflower_${m}`,
  decoReed: (m: string) => `dreed_${m}`,
  decoTuft: (m: string) => `dtuft_${m}`,
  decoSign: (m: string) => `dsign_${m}`,
  grain: 'grain',
  inkDrop: 'inkdrop',
  inkBlob: 'inkblob',
  goldFlake: 'goldflake',
  swoosh: 'swoosh',
  ring: 'ring',
  spark: 'spark',
  glow: 'glow',
  herb: 'herb',
  jade: 'jade',
  clue: 'clue',
  lantern: 'lantern',
  shrine: 'shrine',
  stele: 'stele',
  projFruit: 'pj_fruit',
  projVenom: 'pj_venom',
  projFeather: 'pj_feather',
  projSound: 'pj_sound',
  plHead: 'pl_head',
  plBody: 'pl_body',
  plArm: 'pl_arm',
  plLeg: 'pl_leg',
  plStaff: 'pl_staff',
  npc: 'npc_villager',
  npcElder: 'npc_elder',
  npcKeeper: 'npc_keeper',
} as const;

/** 兽贴图键：按 silhouette 命名。 */
export const beastTexKey = (silhouette: string) => `beast_${silhouette}`;

/** 装饰类型 → 每山贴图键。 */
export const DECO_TEX: Record<DecorKind, (m: MountainId) => string> = {
  tree: (m) => TEX.decoTree(m),
  pine: (m) => TEX.decoPine(m),
  bush: (m) => TEX.decoBush(m),
  rock: (m) => TEX.decoRock(m),
  flower: (m) => TEX.decoFlower(m),
  reed: (m) => TEX.decoReed(m),
  tuft: (m) => TEX.decoTuft(m),
  sign: (m) => TEX.decoSign(m),
};

function mixHex(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `#${pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
}

/* ---------- 基础笔触 ---------- */

function inkStroke(
  ctx: CanvasRenderingContext2D,
  pts: [number, number][],
  width: number,
  color: string,
  taper = 0.7,
): void {
  if (pts.length < 2) return;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let i = 0; i < pts.length - 1; i += 1) {
    const t = i / (pts.length - 1);
    const w = width * (1 - taper * t * 0.5);
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(0.8, w);
    ctx.globalAlpha = 0.92 - 0.15 * Math.random();
    ctx.beginPath();
    ctx.moveTo(pts[i]![0], pts[i]![1]);
    ctx.lineTo(pts[i + 1]![0], pts[i + 1]![1]);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function ensureCanvas(
  scene: Phaser.Scene,
  key: string,
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
): void {
  if (scene.textures.exists(key)) return;
  const tex = scene.textures.createCanvas(key, w, h);
  if (!tex) return;
  const ctx = tex.getContext();
  draw(ctx, w, h);
  tex.refresh();
}

/* ---------- 背景（可平铺正弦山脊） ---------- */

function ridgeY(x: number, w: number, baseY: number, amp: number, seed: number): number {
  const t = (x / w) * Math.PI * 2;
  return (
    baseY +
    Math.sin(t * 2 + seed) * amp * 0.5 +
    Math.sin(t * 5 + seed * 2.3) * amp * 0.3 +
    Math.sin(t * 9 + seed * 4.1) * amp * 0.2
  );
}

function drawRidge(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  baseY: number,
  amp: number,
  seed: number,
): void {
  ctx.clearRect(0, 0, w, h);
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 8) ctx.lineTo(x, ridgeY(x, w, baseY, amp, seed));
  ctx.lineTo(w, h);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, baseY - amp, 0, h);
  grad.addColorStop(0, color);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = color;
  ctx.fill();
  // 山脊描边（墨线）
  ctx.strokeStyle = 'rgba(240,235,220,0.14)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  for (let x = 0; x <= w; x += 8) {
    const y = ridgeY(x, w, baseY, amp, seed);
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  // 雾脚
  const mist = ctx.createLinearGradient(0, baseY + amp * 0.6, 0, h);
  mist.addColorStop(0, 'rgba(0,0,0,0)');
  mist.addColorStop(1, 'rgba(20,18,14,0.55)');
  ctx.fillStyle = mist;
  ctx.fillRect(0, baseY + amp * 0.6, w, h - baseY - amp * 0.6);
}

function drawTrees(ctx: CanvasRenderingContext2D, w: number, h: number, color: string, seed: number): void {
  // 塔柏剪影，确定性伪随机摆放（可平铺：越界回绕）
  let s = seed * 977 + 31;
  const rnd = () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
  ctx.fillStyle = color;
  for (let i = 0; i < 14; i += 1) {
    const x = rnd() * w;
    const baseY = h - 10 - rnd() * 26;
    const th = 44 + rnd() * 72;
    const tw = 10 + rnd() * 14;
    ctx.beginPath();
    ctx.moveTo(x, baseY - th);
    for (let k = 0; k < 4; k += 1) {
      const yk = baseY - th + (th * (k + 1)) / 4.4;
      const wk = tw * (k + 1) / 4.4;
      ctx.lineTo(x + wk / 2, yk);
      ctx.lineTo(x + wk * 0.18, yk + th / 9);
    }
    ctx.lineTo(x + tw * 0.12, baseY);
    ctx.lineTo(x - tw * 0.12, baseY);
    for (let k = 4; k > 0; k -= 1) {
      const yk = baseY - th + (th * k) / 4.4;
      const wk = tw * k / 4.4;
      ctx.lineTo(x - wk * 0.18, yk + th / 9);
      ctx.lineTo(x - wk / 2, yk);
    }
    ctx.closePath();
    ctx.fill();
  }
}

function drawCloudPuff(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  alpha: number,
  shade: string,
): void {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = shade;
  ctx.beginPath();
  ctx.roundRect(x - 46 * s, y + 2 * s, 92 * s, 16 * s, 8 * s);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(x - 44 * s, y - 2 * s, 88 * s, 15 * s, 7 * s);
  ctx.roundRect(x - 26 * s, y - 13 * s, 44 * s, 16 * s, 8 * s);
  ctx.roundRect(x - 4 * s, y - 8 * s, 36 * s, 13 * s, 6.5 * s);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawSky(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: MountainPalette,
  night: boolean,
): void {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, p.skyTop);
  grad.addColorStop(0.72, p.skyBot);
  grad.addColorStop(1, mixHex(p.skyBot, '#ffffff', 0.32));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  const shade = mixHex(p.skyBot, '#7286a0', 0.35);
  if (night) {
    // 星与弦月
    let s = 424242;
    const rnd = () => {
      s = (s * 1103515245 + 12345) % 2147483648;
      return s / 2147483648;
    };
    for (let i = 0; i < 90; i += 1) {
      const x = rnd() * w;
      const y = rnd() * h * 0.62;
      const big = rnd() > 0.86;
      ctx.fillStyle = big ? 'rgba(240,248,255,0.95)' : 'rgba(232,238,252,0.7)';
      ctx.fillRect(x, y, big ? 2.6 : 1.7, big ? 2.6 : 1.7);
    }
    const halo = ctx.createRadialGradient(w * 0.74, h * 0.2, 8, w * 0.74, h * 0.2, 110);
    halo.addColorStop(0, 'rgba(226,236,255,0.5)');
    halo.addColorStop(1, 'rgba(226,236,255,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#f2f0da';
    ctx.beginPath();
    ctx.arc(w * 0.74, h * 0.2, 27, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.skyTop;
    ctx.beginPath();
    ctx.arc(w * 0.74 + 12, h * 0.2 - 8, 23, 0, Math.PI * 2);
    ctx.fill();
    drawCloudPuff(ctx, w * 0.24, h * 0.3, 1.1, 0.22, shade);
    drawCloudPuff(ctx, w * 0.62, h * 0.44, 0.9, 0.16, shade);
  } else {
    // 亮日：外晕 + 日轮 + 日环
    const halo = ctx.createRadialGradient(w * 0.76, h * 0.21, 10, w * 0.76, h * 0.21, 190);
    halo.addColorStop(0, 'rgba(255,244,200,0.55)');
    halo.addColorStop(1, 'rgba(255,244,200,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,246,216,0.5)';
    ctx.beginPath();
    ctx.arc(w * 0.76, h * 0.21, 44, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff6d8';
    ctx.beginPath();
    ctx.arc(w * 0.76, h * 0.21, 30, 0, Math.PI * 2);
    ctx.fill();
    // 远景小云（近景云带单独一层滚动）
    drawCloudPuff(ctx, w * 0.2, h * 0.24, 1.3, 0.85, shade);
    drawCloudPuff(ctx, w * 0.52, h * 0.13, 0.9, 0.7, shade);
    drawCloudPuff(ctx, w * 0.86, h * 0.4, 1.05, 0.55, shade);
  }
  // 细噪点（避免色带）
  let s2 = 99173;
  const rnd2 = () => {
    s2 = (s2 * 1103515245 + 12345) % 2147483648;
    return s2 / 2147483648;
  };
  for (let i = 0; i < w * 0.35; i += 1) {
    ctx.fillStyle = rnd2() > 0.5 ? 'rgba(255,255,255,0.02)' : 'rgba(30,26,20,0.02)';
    ctx.fillRect(rnd2() * w, rnd2() * h, 2, 1.4);
  }
}

/* ---------- 装饰精灵（随山调色板烘焙，脚底锚点） ---------- */

function leafTones(p: MountainPalette): { a: string; b: string; dark: string } {
  return {
    a: p.ridgeMid,
    b: mixHex(p.ridgeMid, '#ffffff', 0.34),
    dark: mixHex(p.ridgeNear, '#0c1008', 0.3),
  };
}

function outlinedBlob(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, fill: string, line: string): void {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = line;
  ctx.lineWidth = 2.4;
  ctx.stroke();
}

function drawDecoTree(ctx: CanvasRenderingContext2D, w: number, h: number, p: MountainPalette): void {
  const { a, b, dark } = leafTones(p);
  ctx.fillStyle = '#7a5230';
  ctx.strokeStyle = '#3a2a1a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(w / 2 - 5, h - 26, 10, 26, 2);
  ctx.fill();
  ctx.stroke();
  outlinedBlob(ctx, w / 2, h * 0.48, 25, a, dark);
  outlinedBlob(ctx, w / 2 - 19, h * 0.6, 17, a, dark);
  outlinedBlob(ctx, w / 2 + 19, h * 0.6, 17, a, dark);
  ctx.globalAlpha = 0.8;
  outlinedBlob(ctx, w / 2 - 8, h * 0.4, 8, b, b);
  outlinedBlob(ctx, w / 2 + 10, h * 0.5, 6, b, b);
  ctx.globalAlpha = 1;
}

function drawDecoPine(ctx: CanvasRenderingContext2D, w: number, h: number, p: MountainPalette): void {
  const { a, b, dark } = leafTones(p);
  ctx.fillStyle = '#6a4a2c';
  ctx.strokeStyle = '#33241a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(w / 2 - 4, h - 18, 8, 18, 2);
  ctx.fill();
  ctx.stroke();
  const tier = (yTop: number, yBot: number, half: number): void => {
    ctx.beginPath();
    ctx.moveTo(w / 2, yTop);
    ctx.lineTo(w / 2 + half, yBot);
    ctx.lineTo(w / 2 - half, yBot);
    ctx.closePath();
    ctx.fillStyle = a;
    ctx.fill();
    ctx.strokeStyle = dark;
    ctx.lineWidth = 2.4;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w / 2, yTop + 4);
    ctx.lineTo(w / 2 + half * 0.55, yBot - 3);
    ctx.lineTo(w / 2 - half * 0.2, yBot - 3);
    ctx.closePath();
    ctx.fillStyle = b;
    ctx.globalAlpha = 0.55;
    ctx.fill();
    ctx.globalAlpha = 1;
  };
  tier(h * 0.02, h * 0.4, w * 0.34);
  tier(h * 0.22, h * 0.66, w * 0.42);
  tier(h * 0.46, h * 0.92, w * 0.5);
}

function drawDecoBush(ctx: CanvasRenderingContext2D, w: number, h: number, p: MountainPalette): void {
  const { a, b, dark } = leafTones(p);
  outlinedBlob(ctx, w * 0.28, h * 0.66, 12, a, dark);
  outlinedBlob(ctx, w * 0.72, h * 0.66, 12, a, dark);
  outlinedBlob(ctx, w * 0.5, h * 0.5, 13, a, dark);
  ctx.fillStyle = b;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.arc(w * 0.42, h * 0.38, 4.4, 0, Math.PI * 2);
  ctx.arc(w * 0.62, h * 0.46, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawDecoRock(ctx: CanvasRenderingContext2D, w: number, h: number, p: MountainPalette): void {
  const base = mixHex(p.ridgeNear, '#8a929c', 0.5);
  const lite = mixHex(base, '#ffffff', 0.35);
  ctx.beginPath();
  ctx.moveTo(3, h - 1);
  ctx.lineTo(7, h * 0.42);
  ctx.lineTo(w * 0.5, 2);
  ctx.lineTo(w - 8, h * 0.46);
  ctx.lineTo(w - 3, h - 1);
  ctx.closePath();
  ctx.fillStyle = base;
  ctx.fill();
  ctx.strokeStyle = mixHex(base, '#10141c', 0.5);
  ctx.lineWidth = 2.2;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(8, h * 0.42);
  ctx.lineTo(w * 0.5, 3);
  ctx.lineTo(w * 0.56, h * 0.34);
  ctx.lineTo(13, h * 0.6);
  ctx.closePath();
  ctx.fillStyle = lite;
  ctx.globalAlpha = 0.7;
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawDecoFlower(ctx: CanvasRenderingContext2D, w: number, h: number, p: MountainPalette): void {
  const stem = mixHex(p.ridgeMid, '#2a4a20', 0.35);
  inkStroke(ctx, [[w * 0.24, h], [w * 0.18, h * 0.34]], 1.8, stem, 0.3);
  inkStroke(ctx, [[w * 0.5, h], [w * 0.52, h * 0.2]], 1.8, stem, 0.3);
  inkStroke(ctx, [[w * 0.76, h], [w * 0.84, h * 0.4]], 1.8, stem, 0.3);
  const head = (x: number, y: number, c: string): void => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x, y, 3.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f0d060';
    ctx.beginPath();
    ctx.arc(x, y, 1.3, 0, Math.PI * 2);
    ctx.fill();
  };
  head(w * 0.17, h * 0.28, '#ff8aa0');
  head(w * 0.53, h * 0.14, p.accent);
  head(w * 0.86, h * 0.34, '#fdf6e0');
}

function drawDecoReed(ctx: CanvasRenderingContext2D, w: number, h: number, p: MountainPalette): void {
  const stalk = mixHex(p.ridgeMid, '#2a4a2a', 0.25);
  const cattail = '#c8a050';
  const reed = (bx: number, tipX: number, tipY: number): void => {
    inkStroke(ctx, [[bx, h], [tipX, tipY]], 2.2, stalk, 0.4);
    ctx.fillStyle = cattail;
    ctx.beginPath();
    ctx.roundRect(tipX - 2, tipY - 7, 4, 10, 2);
    ctx.fill();
  };
  reed(w * 0.22, w * 0.14, h * 0.2);
  reed(w * 0.46, w * 0.48, h * 0.08);
  reed(w * 0.7, w * 0.8, h * 0.26);
}

function drawDecoTuft(ctx: CanvasRenderingContext2D, w: number, h: number, p: MountainPalette): void {
  const { a, b } = leafTones(p);
  inkStroke(ctx, [[w * 0.5, h], [w * 0.2, 1]], 2, a, 0.4);
  inkStroke(ctx, [[w * 0.5, h], [w * 0.44, 0]], 2, b, 0.4);
  inkStroke(ctx, [[w * 0.5, h], [w * 0.68, 2]], 2, a, 0.4);
  inkStroke(ctx, [[w * 0.5, h], [w * 0.88, h * 0.3]], 2, b, 0.4);
}

function drawDecoSign(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = '#8a6240';
  ctx.strokeStyle = '#4a3220';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(w / 2 - 4, h * 0.42, 8, h * 0.58, 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#c89858';
  ctx.strokeStyle = '#5f3f22';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.roundRect(3, 3, w - 6, h * 0.4, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#5f3f22';
  ctx.fillRect(w * 0.16, h * 0.21, 2.6, 2.6);
  ctx.fillRect(w * 0.8, h * 0.21, 2.6, 2.6);
}

/* ---------- 地块 ---------- */

function drawGround(ctx: CanvasRenderingContext2D, w: number, h: number, p: MountainPalette): void {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, p.groundTop);
  grad.addColorStop(0.4, p.ground);
  grad.addColorStop(1, '#14120e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  // 顶部草头与墨线
  ctx.fillStyle = p.groundTop;
  ctx.fillRect(0, 0, w, 5);
  ctx.strokeStyle = 'rgba(240,235,218,0.22)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  for (let x = 0; x <= w; x += 14) {
    ctx.moveTo(x, 5);
    ctx.lineTo(x + 5, -0.5 + Math.sin(x * 0.7) * 2);
  }
  ctx.stroke();
  // 皴法纹理（横皴短线）
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 60; i += 1) {
    const x = (i * 97) % w;
    const y = 12 + ((i * 53) % (h - 20));
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 10 + (i % 3) * 6, y + 1.5);
    ctx.stroke();
  }
}

function drawPlatform(ctx: CanvasRenderingContext2D, w: number, h: number, p: MountainPalette): void {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, p.groundTop);
  grad.addColorStop(1, p.ground);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, 5);
  ctx.fill();
  ctx.strokeStyle = 'rgba(240,235,218,0.3)';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.fillStyle = 'rgba(240,235,218,0.2)';
  for (let x = 8; x < w; x += 22) ctx.fillRect(x, 2.5, 7, 2);
}

/* ---------- FX / 拾取 / 场景物 ---------- */

function radialBlob(ctx: CanvasRenderingContext2D, w: number, h: number, color: string, blobs: number, seed: number): void {
  let s = seed;
  const rnd = () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
  for (let i = 0; i < blobs; i += 1) {
    const x = w / 2 + (rnd() - 0.5) * w * 0.4;
    const y = h / 2 + (rnd() - 0.5) * h * 0.4;
    const r = (w / 2) * (0.4 + rnd() * 0.45);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
}

function drawSwoosh(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.strokeStyle = 'rgba(248,242,226,0.9)';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(w * 0.18, h / 2, w * 0.6, -1.1, 1.1);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(201,162,75,0.55)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(w * 0.18, h / 2, w * 0.66, -0.9, 0.9);
  ctx.stroke();
}

function drawRing(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.strokeStyle = 'rgba(240,235,218,0.85)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, w / 2 - 4, 0, Math.PI * 2);
  ctx.stroke();
}

function drawSpark(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.translate(w / 2, h / 2);
  ctx.strokeStyle = 'rgba(248,242,226,0.95)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 4, Math.sin(a) * 4);
    ctx.lineTo(Math.cos(a) * (w / 2 - 2), Math.sin(a) * (h / 2 - 2));
    ctx.stroke();
  }
}

function drawHerb(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  // 祝余：韭菜状青华小草
  inkStroke(ctx, [[w / 2, h], [w / 2 - 7, h * 0.4]], 2.6, '#7ab88a', 0.4);
  inkStroke(ctx, [[w / 2, h], [w / 2 + 1, h * 0.22]], 2.6, '#8fd0a0', 0.4);
  inkStroke(ctx, [[w / 2, h], [w / 2 + 8, h * 0.45]], 2.6, '#7ab88a', 0.4);
  ctx.fillStyle = '#a8e8c0';
  ctx.beginPath();
  ctx.arc(w / 2 + 1, h * 0.18, 3.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawJade(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  // 金玉：菱形金屑
  ctx.fillStyle = '#e4c479';
  ctx.beginPath();
  ctx.moveTo(w / 2, 2);
  ctx.lineTo(w - 3, h / 2);
  ctx.lineTo(w / 2, h - 2);
  ctx.lineTo(3, h / 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,246,214,0.9)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
}

function drawClue(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  // 迹拍线索：半张残页
  ctx.fillStyle = 'rgba(244,236,216,0.92)';
  ctx.beginPath();
  ctx.roundRect(3, 3, w - 6, h - 6, 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(60,50,36,0.7)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(60,50,36,0.55)';
  for (let y = 8; y < h - 6; y += 5) {
    ctx.beginPath();
    ctx.moveTo(7, y);
    ctx.lineTo(w - 7 - (y % 3), y);
    ctx.stroke();
  }
}

function drawLantern(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  // 祠座石灯
  ctx.fillStyle = '#3a3830';
  ctx.fillRect(w * 0.32, h * 0.62, w * 0.36, h * 0.38);
  ctx.fillRect(w * 0.42, h * 0.42, w * 0.16, h * 0.22);
  ctx.fillStyle = '#4a4840';
  ctx.beginPath();
  ctx.moveTo(w * 0.16, h * 0.42);
  ctx.lineTo(w * 0.5, h * 0.16);
  ctx.lineTo(w * 0.84, h * 0.42);
  ctx.closePath();
  ctx.fill();
  const g = ctx.createRadialGradient(w / 2, h * 0.52, 0, w / 2, h * 0.52, w * 0.3);
  g.addColorStop(0, 'rgba(232,180,90,0.95)');
  g.addColorStop(1, 'rgba(232,180,90,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function drawShrine(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  // 山祠门（鸟身龙首之祠）：双柱 + 屋檐墨瓦
  ctx.fillStyle = '#2e2a24';
  ctx.fillRect(w * 0.12, h * 0.3, w * 0.09, h * 0.7);
  ctx.fillRect(w * 0.79, h * 0.3, w * 0.09, h * 0.7);
  ctx.fillRect(w * 0.06, h * 0.24, w * 0.88, h * 0.09);
  ctx.beginPath();
  ctx.moveTo(w * 0.0, h * 0.26);
  ctx.quadraticCurveTo(w * 0.5, h * 0.02, w, h * 0.26);
  ctx.lineTo(w * 0.94, h * 0.3);
  ctx.quadraticCurveTo(w * 0.5, h * 0.09, w * 0.06, h * 0.3);
  ctx.closePath();
  ctx.fillStyle = '#3c362c';
  ctx.fill();
  ctx.strokeStyle = 'rgba(201,162,75,0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.26);
  ctx.quadraticCurveTo(w * 0.5, h * 0.02, w, h * 0.26);
  ctx.stroke();
  // 匾额
  ctx.fillStyle = 'rgba(201,162,75,0.85)';
  ctx.fillRect(w * 0.44, h * 0.34, w * 0.12, h * 0.1);
}

function drawStele(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  // 界碑：原文石碑
  ctx.fillStyle = '#42403a';
  ctx.beginPath();
  ctx.roundRect(w * 0.2, h * 0.06, w * 0.6, h * 0.86, [w * 0.3, w * 0.3, 3, 3]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(240,235,218,0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillRect(w * 0.1, h * 0.9, w * 0.8, h * 0.1);
  ctx.strokeStyle = 'rgba(244,236,216,0.5)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 6; i += 1) {
    const y = h * 0.16 + i * h * 0.11;
    ctx.beginPath();
    ctx.moveTo(w * 0.3, y);
    ctx.lineTo(w * 0.7, y);
    ctx.stroke();
  }
}

function drawProjectile(key: string, ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const c = ctx.canvas;
  if (key === TEX.projFruit) {
    ctx.fillStyle = '#c85a3a';
    ctx.beginPath();
    ctx.arc(c.width / 2, c.height / 2, c.width * 0.36, 0, Math.PI * 2);
    ctx.fill();
    inkStroke(ctx, [[c.width / 2, c.height * 0.2], [c.width / 2 + 4, c.height * 0.05]], 2, '#5a4a2e');
  } else if (key === TEX.projVenom) {
    radialBlob(ctx, w, h, 'rgba(140,190,80,0.85)', 2, 77);
  } else if (key === TEX.projFeather) {
    inkStroke(ctx, [[4, h - 4], [w - 4, 4]], 2.4, '#d8d2c0', 0.2);
    inkStroke(ctx, [[w * 0.3, h * 0.7], [w * 0.5, h * 0.5]], 1.6, '#b8b2a0');
  } else if (key === TEX.projSound) {
    drawRing(ctx, w, h);
  }
}

/* ---------- 玩家部件（笔触小人，总高约 46px） ---------- */

function drawPlayerParts(ctx: CanvasRenderingContext2D, key: string, w: number, h: number): void {
  const ink = '#241f18';
  if (key === TEX.plHead) {
    // 斗笠 + 脸
    ctx.fillStyle = '#e8d8b8';
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.62, w * 0.3, 0, Math.PI * 2);
    ctx.fill();
    inkStroke(ctx, [[w * 0.5, h * 0.62], [w * 0.5, h * 0.4]], 2.2, ink);
    // 斗笠
    ctx.fillStyle = '#8a744e';
    ctx.beginPath();
    ctx.moveTo(1, h * 0.52);
    ctx.lineTo(w / 2, h * 0.12);
    ctx.lineTo(w - 1, h * 0.52);
    ctx.quadraticCurveTo(w / 2, h * 0.42, 1, h * 0.52);
    ctx.fill();
    ctx.strokeStyle = 'rgba(36,31,24,0.7)';
    ctx.lineWidth = 1;
    ctx.stroke();
  } else if (key === TEX.plBody) {
    // 长袍（黛青）+ 朱砂腰带
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#3d5a6b');
    g.addColorStop(1, '#243642');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(w * 0.5 - 6, 2);
    ctx.lineTo(w * 0.5 + 6, 2);
    ctx.lineTo(w - 1, h - 1);
    ctx.lineTo(1, h - 1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(240,235,218,0.4)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.fillStyle = '#a6332b';
    ctx.fillRect(0, h * 0.42, w, 3.4);
  } else if (key === TEX.plArm) {
    inkStroke(ctx, [[w * 0.5, 2], [w * 0.5, h - 2]], 3.4, '#3d5a6b', 0.3);
  } else if (key === TEX.plLeg) {
    inkStroke(ctx, [[w * 0.5, 2], [w * 0.5, h - 2]], 3.8, ink, 0.5);
  } else if (key === TEX.plStaff) {
    // 采药杖：杖身 + 金环 + 杖穗
    inkStroke(ctx, [[w * 0.5, 2], [w * 0.5, h - 4]], 3, '#7a5c38', 0.15);
    ctx.fillStyle = '#e4c479';
    ctx.fillRect(w * 0.5 - 3, h * 0.16, 6, 3);
    ctx.strokeStyle = '#a6332b';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h - 3);
    ctx.lineTo(w * 0.5 - 4, h - 8);
    ctx.stroke();
  }
}

function drawNpc(ctx: CanvasRenderingContext2D, w: number, h: number, kind: 'villager' | 'elder' | 'keeper'): void {
  const robe = kind === 'elder' ? '#6b5a70' : kind === 'keeper' ? '#5a6b52' : '#7a6a4e';
  ctx.fillStyle = robe;
  ctx.beginPath();
  ctx.moveTo(w * 0.5 - 7, h * 0.32);
  ctx.lineTo(w * 0.5 + 7, h * 0.32);
  ctx.lineTo(w - 2, h - 1);
  ctx.lineTo(2, h - 1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#e8d8b8';
  ctx.beginPath();
  ctx.arc(w / 2, h * 0.22, w * 0.16, 0, Math.PI * 2);
  ctx.fill();
  if (kind === 'villager') {
    ctx.fillStyle = '#a89468';
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.12, w * 0.3, Math.PI, 0);
    ctx.fill();
  } else {
    inkStroke(ctx, [[w / 2, h * 0.3], [w / 2, h * 0.36]], 3, '#d8d2c0');
  }
}

/* ---------- 兽（剪纸剪影，复用 BeastArt 的 path） ---------- */

export function bakeBeastTexture(scene: Phaser.Scene, silhouette: string, paths: { body: string; head?: string; extra?: string }, tint: string): void {
  const key = beastTexKey(silhouette);
  ensureCanvas(scene, key, 200, 200, (ctx) => {
    // 底晕
    const g = ctx.createRadialGradient(100, 96, 8, 100, 96, 78);
    g.addColorStop(0, `${tint}88`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 200, 200);
    const path = new Path2D(paths.body);
    ctx.fillStyle = tint;
    ctx.fill(path);
    ctx.strokeStyle = 'rgba(244,236,216,0.55)';
    ctx.lineWidth = 2.4;
    ctx.stroke(path);
    if (paths.head) {
      const head = new Path2D(paths.head);
      ctx.fillStyle = tint;
      ctx.fill(head);
      ctx.stroke(head);
    }
    if (paths.extra) {
      const extra = new Path2D(paths.extra);
      ctx.strokeStyle = tint;
      ctx.lineWidth = 3.4;
      ctx.lineCap = 'round';
      ctx.stroke(extra);
    }
  });
}

/* ---------- 总装 ---------- */

export function buildMountainArt(scene: Phaser.Scene, mountain: MountainId, night: boolean): void {
  const p = paletteOf(mountain);
  const key = (m: MountainId) => m;
  const m = key(mountain);
  ensureCanvas(scene, TEX.sky(m), 960, 540, (ctx, w, h) => drawSky(ctx, w, h, p, night));
  ensureCanvas(scene, TEX.ridgeFar(m), 960, 420, (ctx, w, h) => drawRidge(ctx, w, h, p.ridgeFar, 200, 90, mountain.length * 3.1));
  ensureCanvas(scene, TEX.ridgeMid(m), 960, 430, (ctx, w, h) => drawRidge(ctx, w, h, p.ridgeMid, 240, 120, mountain.length * 5.7));
  ensureCanvas(scene, TEX.ridgeNear(m), 960, 330, (ctx, w, h) => {
    drawRidge(ctx, w, h, p.ridgeNear, 170, 80, mountain.length * 7.9);
    drawTrees(ctx, w, h, 'rgba(14,18,14,0.85)', mountain.length + 2);
  });
  ensureCanvas(scene, TEX.ground(m), 480, 120, (ctx, w, h) => drawGround(ctx, w, h, p));
  ensureCanvas(scene, TEX.platform(m), 240, 24, (ctx, w, h) => drawPlatform(ctx, w, h, p));
  ensureCanvas(scene, TEX.mist(m), 512, 200, (ctx, w, h) => radialBlob(ctx, w, h, `${p.mist}55`, 6, 313));
  ensureCanvas(scene, TEX.water(m), 256, 64, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, `${p.water}cc`);
    g.addColorStop(1, 'rgba(10,14,18,0.9)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(240,248,244,0.25)';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 5; i += 1) {
      const y = 8 + i * 11;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 16) ctx.lineTo(x, y + Math.sin(x * 0.11 + i) * 2.4);
      ctx.stroke();
    }
  });
  // 装饰精灵（随山调色，脚底锚点）
  ensureCanvas(scene, TEX.decoTree(m), 76, 96, (ctx, w, h) => drawDecoTree(ctx, w, h, p));
  ensureCanvas(scene, TEX.decoPine(m), 64, 96, (ctx, w, h) => drawDecoPine(ctx, w, h, p));
  ensureCanvas(scene, TEX.decoBush(m), 56, 30, (ctx, w, h) => drawDecoBush(ctx, w, h, p));
  ensureCanvas(scene, TEX.decoRock(m), 40, 26, (ctx, w, h) => drawDecoRock(ctx, w, h, p));
  ensureCanvas(scene, TEX.decoFlower(m), 24, 22, (ctx, w, h) => drawDecoFlower(ctx, w, h, p));
  ensureCanvas(scene, TEX.decoReed(m), 32, 46, (ctx, w, h) => drawDecoReed(ctx, w, h, p));
  ensureCanvas(scene, TEX.decoTuft(m), 24, 12, (ctx, w, h) => drawDecoTuft(ctx, w, h, p));
  ensureCanvas(scene, TEX.decoSign(m), 46, 58, (ctx, w, h) => drawDecoSign(ctx, w, h));
}

export function buildCommonArt(scene: Phaser.Scene): void {
  ensureCanvas(scene, 'px', 2, 2, (ctx) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 2, 2);
  });
  // 可平铺云带（近景慢速滚动；接缝处对称绘制保证无缝）
  ensureCanvas(scene, TEX.clouds, 480, 150, (ctx, w, h) => {
    const shade = '#d8e8f4';
    const puffs: [number, number, number][] = [
      [60, 52, 1.25], [190, 92, 0.85], [300, 40, 1.05], [420, 100, 0.7], [250, 126, 0.55], [30, 118, 0.6],
    ];
    for (const [x0, y, s] of puffs) {
      drawCloudPuff(ctx, x0, y, s, 0.96, shade);
      drawCloudPuff(ctx, x0 - w, y, s, 0.96, shade);
      drawCloudPuff(ctx, x0 + w, y, s, 0.96, shade);
    }
  });
  ensureCanvas(scene, TEX.grain, 256, 256, (ctx, w, h) => {
    let s = 13579;
    const rnd = () => {
      s = (s * 1103515245 + 12345) % 2147483648;
      return s / 2147483648;
    };
    const img = ctx.getImageData(0, 0, w, h);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = rnd() * 255;
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = rnd() * 22;
    }
    ctx.putImageData(img, 0, 0);
  });
  ensureCanvas(scene, TEX.inkDrop, 12, 12, (ctx, w, h) => radialBlob(ctx, w, h, 'rgba(28,24,20,0.95)', 1, 5));
  ensureCanvas(scene, TEX.inkBlob, 48, 48, (ctx, w, h) => radialBlob(ctx, w, h, 'rgba(28,24,20,0.8)', 3, 11));
  ensureCanvas(scene, TEX.goldFlake, 10, 10, (ctx) => {
    ctx.fillStyle = '#e4c479';
    ctx.fillRect(3, 1, 4, 8);
    ctx.fillRect(1, 3, 8, 4);
  });
  ensureCanvas(scene, TEX.swoosh, 96, 72, (ctx, w, h) => drawSwoosh(ctx, w, h));
  ensureCanvas(scene, TEX.ring, 72, 72, (ctx, w, h) => drawRing(ctx, w, h));
  ensureCanvas(scene, TEX.spark, 40, 40, (ctx, w, h) => drawSpark(ctx, w, h));
  ensureCanvas(scene, TEX.glow, 64, 64, (ctx, w, h) => radialBlob(ctx, w, h, 'rgba(228,196,121,0.75)', 1, 17));
  ensureCanvas(scene, TEX.herb, 22, 26, (ctx, w, h) => drawHerb(ctx, w, h));
  ensureCanvas(scene, TEX.jade, 16, 16, (ctx, w, h) => drawJade(ctx, w, h));
  ensureCanvas(scene, TEX.clue, 22, 26, (ctx, w, h) => drawClue(ctx, w, h));
  ensureCanvas(scene, TEX.lantern, 72, 96, (ctx, w, h) => drawLantern(ctx, w, h));
  ensureCanvas(scene, TEX.shrine, 260, 200, (ctx, w, h) => drawShrine(ctx, w, h));
  ensureCanvas(scene, TEX.stele, 90, 120, (ctx, w, h) => drawStele(ctx, w, h));
  ensureCanvas(scene, TEX.projFruit, 16, 16, (ctx, w, h) => drawProjectile(TEX.projFruit, ctx, w, h));
  ensureCanvas(scene, TEX.projVenom, 18, 18, (ctx, w, h) => drawProjectile(TEX.projVenom, ctx, w, h));
  ensureCanvas(scene, TEX.projFeather, 18, 18, (ctx, w, h) => drawProjectile(TEX.projFeather, ctx, w, h));
  ensureCanvas(scene, TEX.projSound, 40, 40, (ctx, w, h) => drawProjectile(TEX.projSound, ctx, w, h));
  ensureCanvas(scene, TEX.plHead, 24, 24, (ctx, w, h) => drawPlayerParts(ctx, TEX.plHead, w, h));
  ensureCanvas(scene, TEX.plBody, 24, 22, (ctx, w, h) => drawPlayerParts(ctx, TEX.plBody, w, h));
  ensureCanvas(scene, TEX.plArm, 6, 14, (ctx, w, h) => drawPlayerParts(ctx, TEX.plArm, w, h));
  ensureCanvas(scene, TEX.plLeg, 6, 12, (ctx, w, h) => drawPlayerParts(ctx, TEX.plLeg, w, h));
  ensureCanvas(scene, TEX.plStaff, 8, 40, (ctx, w, h) => drawPlayerParts(ctx, TEX.plStaff, w, h));
  ensureCanvas(scene, TEX.npc, 26, 46, (ctx, w, h) => drawNpc(ctx, w, h, 'villager'));
  ensureCanvas(scene, TEX.npcElder, 26, 46, (ctx, w, h) => drawNpc(ctx, w, h, 'elder'));
  ensureCanvas(scene, TEX.npcKeeper, 26, 46, (ctx, w, h) => drawNpc(ctx, w, h, 'keeper'));
}
