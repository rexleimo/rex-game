import type { ShapePiece } from '../core/types';

const BR = { fill: '#6B7F6A', stroke: '#2C3A2C' };
const BR2 = { fill: '#7A8F72', stroke: '#2C3A2C' };
const BR3 = { fill: '#5E7260', stroke: '#2C3A2C' };
const GOLD = { fill: '#C4A35A', stroke: '#3D3420' };
const JADE = { fill: '#7FAE9A', stroke: '#2A4A3C' };
const CLAY = { fill: '#B8956A', stroke: '#5A4030' };

function p(
  id: string,
  label: string,
  target: { x: number; y: number },
  start: { x: number; y: number },
  path: string,
  style: { fill: string; stroke: string },
  snap = 0.07,
): ShapePiece {
  return { id, label, target, start, path, snap, ...style };
}

/** 三足两耳重器（鼎类） */
export function kitDing(): ShapePiece[] {
  return [
    p('ear-l', '左耳', { x: 0.32, y: 0.22 }, { x: 0.12, y: 0.72 }, 'M -18 -8 L -6 -22 L 8 -18 L 4 10 L -14 12 Z', BR),
    p('ear-r', '右耳', { x: 0.68, y: 0.22 }, { x: 0.86, y: 0.68 }, 'M 18 -8 L 6 -22 L -8 -18 L -4 10 L 14 12 Z', BR),
    p('body', '器腹', { x: 0.5, y: 0.48 }, { x: 0.55, y: 0.82 }, 'M -52 -28 Q -58 10 -40 38 L 40 38 Q 58 10 52 -28 Q 20 -40 -52 -28 Z', BR2, 0.08),
    p('leg-l', '左足', { x: 0.34, y: 0.78 }, { x: 0.18, y: 0.38 }, 'M -10 -6 L 10 -4 L 6 36 L -8 34 Z', BR3),
    p('leg-r', '右足', { x: 0.66, y: 0.78 }, { x: 0.8, y: 0.4 }, 'M -10 -4 L 10 -6 L 8 34 L -6 36 Z', BR3),
    p('leg-c', '后足', { x: 0.5, y: 0.8 }, { x: 0.42, y: 0.2 }, 'M -8 -4 L 8 -4 L 5 32 L -5 32 Z', { fill: '#556854', stroke: '#2C3A2C' }),
  ];
}

/** 兽面：双目 + 角 + 鼻 */
export function kitShoumian(): ShapePiece[] {
  return [
    p('eye-l', '左目', { x: 0.34, y: 0.42 }, { x: 0.15, y: 0.75 }, 'M -22 -14 Q 0 -22 22 -14 Q 0 18 -22 -14 Z', GOLD, 0.08),
    p('eye-r', '右目', { x: 0.66, y: 0.42 }, { x: 0.85, y: 0.78 }, 'M -22 -14 Q 0 -22 22 -14 Q 0 18 -22 -14 Z', GOLD, 0.08),
    p('bridge', '鼻梁', { x: 0.5, y: 0.48 }, { x: 0.5, y: 0.18 }, 'M -8 -28 L 8 -28 L 6 30 L -6 30 Z', BR2),
    p('horn-l', '左角', { x: 0.28, y: 0.22 }, { x: 0.2, y: 0.55 }, 'M 0 16 L -28 -24 L -4 -28 L 12 8 Z', BR, 0.08),
    p('horn-r', '右角', { x: 0.72, y: 0.22 }, { x: 0.78, y: 0.55 }, 'M 0 16 L 28 -24 L 4 -28 L -12 8 Z', BR, 0.08),
  ];
}

/** 爵：流、尾、柱、足 */
export function kitJue(): ShapePiece[] {
  return [
    p('stream', '流', { x: 0.28, y: 0.32 }, { x: 0.12, y: 0.7 }, 'M 0 0 L 40 -8 L 36 8 L 4 12 Z', BR2, 0.08),
    p('tail', '尾', { x: 0.72, y: 0.34 }, { x: 0.88, y: 0.72 }, 'M 0 0 L -32 -10 L -28 10 L 4 8 Z', BR2, 0.08),
    p('body', '爵身', { x: 0.5, y: 0.48 }, { x: 0.48, y: 0.18 }, 'M -22 -20 L 22 -18 L 18 28 L -18 28 Z', BR, 0.08),
    p('post', '柱', { x: 0.42, y: 0.22 }, { x: 0.2, y: 0.45 }, 'M -4 -18 L 4 -18 L 3 16 L -3 16 Z', GOLD),
    p('leg-a', '足甲', { x: 0.38, y: 0.78 }, { x: 0.15, y: 0.35 }, 'M -6 -4 L 6 -2 L 4 28 L -5 26 Z', BR3),
    p('leg-b', '足乙', { x: 0.62, y: 0.78 }, { x: 0.85, y: 0.4 }, 'M -6 -2 L 6 -4 L 5 26 L -4 28 Z', BR3),
  ];
}

/** 簋：腹 + 双耳 + 圈足 */
export function kitGui(): ShapePiece[] {
  return [
    p('ear-l', '左耳', { x: 0.22, y: 0.45 }, { x: 0.1, y: 0.75 }, 'M 0 -16 Q -22 0 0 16 L 8 8 L 8 -8 Z', BR, 0.08),
    p('ear-r', '右耳', { x: 0.78, y: 0.45 }, { x: 0.9, y: 0.72 }, 'M 0 -16 Q 22 0 0 16 L -8 8 L -8 -8 Z', BR, 0.08),
    p('body', '簋腹', { x: 0.5, y: 0.42 }, { x: 0.5, y: 0.15 }, 'M -40 -10 Q -44 20 -28 36 L 28 36 Q 44 20 40 -10 Q 0 -28 -40 -10 Z', BR2, 0.08),
    p('foot', '圈足', { x: 0.5, y: 0.72 }, { x: 0.3, y: 0.85 }, 'M -28 -6 L 28 -6 L 24 16 L -24 16 Z', BR3, 0.08),
  ];
}

/** 编钟：梁 + 三枚钟 */
export function kitChime(): ShapePiece[] {
  return [
    p('beam', '横梁', { x: 0.5, y: 0.22 }, { x: 0.2, y: 0.15 }, 'M -70 -6 L 70 -6 L 70 6 L -70 6 Z', GOLD, 0.08),
    p('bell-l', '低音钟', { x: 0.28, y: 0.55 }, { x: 0.12, y: 0.8 }, 'M -16 -28 L 16 -28 L 20 28 L -20 28 Z', BR2, 0.08),
    p('bell-m', '中音钟', { x: 0.5, y: 0.52 }, { x: 0.55, y: 0.82 }, 'M -14 -24 L 14 -24 L 17 24 L -17 24 Z', BR, 0.08),
    p('bell-h', '高音钟', { x: 0.72, y: 0.5 }, { x: 0.88, y: 0.78 }, 'M -12 -20 L 12 -20 L 14 20 L -14 20 Z', BR3, 0.08),
  ];
}

/** 玉璧：环分三弧 */
export function kitBi(): ShapePiece[] {
  return [
    p('arc-a', '上弧', { x: 0.5, y: 0.28 }, { x: 0.15, y: 0.2 }, 'M -36 10 Q 0 -28 36 10 L 24 18 Q 0 -8 -24 18 Z', JADE, 0.08),
    p('arc-b', '左下弧', { x: 0.32, y: 0.62 }, { x: 0.12, y: 0.78 }, 'M 10 -28 Q -30 0 10 28 L 18 16 Q -8 0 18 -16 Z', JADE, 0.08),
    p('arc-c', '右下弧', { x: 0.68, y: 0.62 }, { x: 0.88, y: 0.78 }, 'M -10 -28 Q 30 0 -10 28 L -18 16 Q 8 0 -18 -16 Z', { fill: '#8FBEAA', stroke: '#2A4A3C' }, 0.08),
  ];
}

/** 尊/壶类长颈 */
export function kitZun(): ShapePiece[] {
  return [
    p('mouth', '器口', { x: 0.5, y: 0.18 }, { x: 0.2, y: 0.15 }, 'M -28 -8 L 28 -8 L 24 10 L -24 10 Z', BR, 0.08),
    p('neck', '长颈', { x: 0.5, y: 0.38 }, { x: 0.8, y: 0.35 }, 'M -14 -18 L 14 -18 L 12 22 L -12 22 Z', BR2),
    p('belly', '鼓腹', { x: 0.5, y: 0.62 }, { x: 0.25, y: 0.75 }, 'M -36 -16 Q -40 16 -20 28 L 20 28 Q 40 16 36 -16 Q 0 -32 -36 -16 Z', BR, 0.08),
    p('foot', '圈足', { x: 0.5, y: 0.82 }, { x: 0.75, y: 0.85 }, 'M -22 -4 L 22 -4 L 18 14 L -18 14 Z', BR3),
  ];
}

/** 盘：宽沿浅腹 */
export function kitPan(): ShapePiece[] {
  return [
    p('rim', '宽沿', { x: 0.5, y: 0.35 }, { x: 0.15, y: 0.25 }, 'M -60 -6 L 60 -6 L 52 10 L -52 10 Z', BR, 0.08),
    p('basin', '盘心', { x: 0.5, y: 0.52 }, { x: 0.8, y: 0.55 }, 'M -40 -8 Q -42 16 0 22 Q 42 16 40 -8 Z', BR2, 0.08),
    p('foot', '圈足', { x: 0.5, y: 0.72 }, { x: 0.4, y: 0.85 }, 'M -24 -4 L 24 -4 L 20 12 L -20 12 Z', BR3),
  ];
}

/** 戈：援、胡、内 */
export function kitGe(): ShapePiece[] {
  return [
    p('yuan', '援', { x: 0.38, y: 0.42 }, { x: 0.15, y: 0.2 }, 'M -40 0 L 30 -10 L 32 10 L -40 8 Z', BR2, 0.08),
    p('hu', '胡', { x: 0.55, y: 0.55 }, { x: 0.7, y: 0.8 }, 'M -6 -20 L 8 -18 L 6 28 L -8 26 Z', BR, 0.08),
    p('nei', '内', { x: 0.72, y: 0.42 }, { x: 0.88, y: 0.25 }, 'M -4 -12 L 28 -8 L 28 10 L -4 12 Z', GOLD, 0.08),
  ];
}

/** 圭：长条尖首 */
export function kitGuiBlade(): ShapePiece[] {
  return [
    p('tip', '圭首', { x: 0.5, y: 0.22 }, { x: 0.2, y: 0.2 }, 'M 0 -22 L 16 10 L -16 10 Z', JADE, 0.08),
    p('body', '圭身', { x: 0.5, y: 0.5 }, { x: 0.8, y: 0.5 }, 'M -14 -28 L 14 -28 L 12 32 L -12 32 Z', { fill: '#8FBEAA', stroke: '#2A4A3C' }, 0.08),
    p('base', '圭末', { x: 0.5, y: 0.78 }, { x: 0.35, y: 0.85 }, 'M -16 -8 L 16 -8 L 14 14 L -14 14 Z', JADE),
  ];
}

/** 陶鬲：袋足 */
export function kitLi(): ShapePiece[] {
  return [
    p('rim', '口沿', { x: 0.5, y: 0.22 }, { x: 0.15, y: 0.18 }, 'M -32 -6 L 32 -6 L 28 8 L -28 8 Z', CLAY),
    p('body', '鬲腹', { x: 0.5, y: 0.42 }, { x: 0.75, y: 0.4 }, 'M -36 -12 Q -38 12 -16 20 L 16 20 Q 38 12 36 -12 Z', { fill: '#C4A57A', stroke: '#5A4030' }, 0.08),
    p('leg-l', '袋足左', { x: 0.32, y: 0.7 }, { x: 0.15, y: 0.8 }, 'M -12 -8 Q -16 20 0 28 Q 10 16 8 -6 Z', CLAY, 0.08),
    p('leg-r', '袋足右', { x: 0.68, y: 0.7 }, { x: 0.85, y: 0.8 }, 'M 12 -8 Q 16 20 0 28 Q -10 16 -8 -6 Z', CLAY, 0.08),
    p('leg-c', '袋足中', { x: 0.5, y: 0.74 }, { x: 0.5, y: 0.9 }, 'M -8 -6 Q -6 22 0 28 Q 6 22 8 -6 Z', { fill: '#A67C52', stroke: '#5A4030' }, 0.08),
  ];
}

/** 镜：圆钮 + 缘 */
export function kitMirror(): ShapePiece[] {
  return [
    p('rim', '镜缘', { x: 0.5, y: 0.5 }, { x: 0.15, y: 0.25 }, 'M 0 -48 A 48 48 0 1 1 0 48 A 48 48 0 1 1 0 -48 M 0 -32 A 32 32 0 1 0 0 32 A 32 32 0 1 0 0 -32', BR2, 0.09),
    p('knob', '镜钮', { x: 0.5, y: 0.5 }, { x: 0.8, y: 0.75 }, 'M -10 -8 L 10 -8 L 8 10 L -8 10 Z', GOLD, 0.08),
  ];
}

/** 云雷纹单元：两段回旋 */
export function kitYunlei(): ShapePiece[] {
  return [
    p('curl-a', '云部', { x: 0.38, y: 0.42 }, { x: 0.15, y: 0.7 }, 'M -20 0 Q -10 -24 12 -12 Q 8 8 -8 12 Q -24 8 -20 0 Z', GOLD, 0.08),
    p('curl-b', '雷部', { x: 0.62, y: 0.55 }, { x: 0.85, y: 0.25 }, 'M 20 0 Q 10 24 -12 12 Q -8 -8 8 -12 Q 24 -8 20 0 Z', { fill: '#D4B56A', stroke: '#3D3420' }, 0.08),
    p('frame', '地纹框', { x: 0.5, y: 0.48 }, { x: 0.5, y: 0.15 }, 'M -50 -30 L 50 -30 L 50 30 L -50 30 Z M -40 -20 L 40 -20 L 40 20 L -40 20 Z', BR, 0.09),
  ];
}

const LACQUER = { fill: '#8B2E2E', stroke: '#3D1515' };
const LACQUER_GOLD = { fill: '#D4B56A', stroke: '#5A4020' };
const SILK = { fill: '#C4B59A', stroke: '#5A5040' };
const PHOENIX = { fill: '#C45C4A', stroke: '#4A2018' };

/** 凤鸟剪影：首、翼、尾 */
export function kitPhoenix(): ShapePiece[] {
  return [
    p('head', '凤首', { x: 0.32, y: 0.32 }, { x: 0.12, y: 0.2 }, 'M 0 8 L 22 -16 L 8 -4 L 28 4 L 4 14 Z', PHOENIX, 0.08),
    p('wing', '羽翼', { x: 0.55, y: 0.42 }, { x: 0.8, y: 0.25 }, 'M -28 0 Q 0 -36 36 -8 Q 10 8 -8 20 Z', { fill: '#E07A5F', stroke: '#4A2018' }, 0.08),
    p('body', '身', { x: 0.48, y: 0.55 }, { x: 0.35, y: 0.8 }, 'M -16 -18 Q -20 10 0 28 Q 18 8 14 -16 Z', LACQUER, 0.08),
    p('tail', '长尾', { x: 0.7, y: 0.68 }, { x: 0.88, y: 0.75 }, 'M -8 -12 Q 20 -28 40 8 Q 16 16 -4 10 Z', LACQUER_GOLD, 0.08),
  ];
}

/** 漆耳杯（羽觞） */
export function kitEarCup(): ShapePiece[] {
  return [
    p('ear-l', '左耳', { x: 0.22, y: 0.48 }, { x: 0.1, y: 0.75 }, 'M 0 -14 Q -20 0 0 14 L 10 6 L 10 -6 Z', LACQUER_GOLD, 0.08),
    p('ear-r', '右耳', { x: 0.78, y: 0.48 }, { x: 0.9, y: 0.72 }, 'M 0 -14 Q 20 0 0 14 L -10 6 L -10 -6 Z', LACQUER_GOLD, 0.08),
    p('bowl', '杯身', { x: 0.5, y: 0.5 }, { x: 0.5, y: 0.18 }, 'M -36 -8 Q -40 18 0 28 Q 40 18 36 -8 Q 0 -24 -36 -8 Z', LACQUER, 0.08),
  ];
}

/** 鼓：面 + 身 + 座 */
export function kitDrum(): ShapePiece[] {
  return [
    p('skin', '鼓面', { x: 0.5, y: 0.28 }, { x: 0.2, y: 0.15 }, 'M -40 0 A 40 14 0 1 0 40 0 A 40 14 0 1 0 -40 0', { fill: '#C4A57A', stroke: '#5A4030' }, 0.08),
    p('body', '鼓身', { x: 0.5, y: 0.52 }, { x: 0.8, y: 0.55 }, 'M -36 -18 L 36 -18 L 32 28 L -32 28 Z', LACQUER, 0.08),
    p('base', '鼓座', { x: 0.5, y: 0.78 }, { x: 0.4, y: 0.88 }, 'M -28 -4 L 28 -4 L 24 14 L -24 14 Z', BR3),
  ];
}

/** 帛画卷：轴 + 画心 */
export function kitScroll(): ShapePiece[] {
  return [
    p('rod-t', '天杆', { x: 0.5, y: 0.18 }, { x: 0.15, y: 0.2 }, 'M -50 -5 L 50 -5 L 50 5 L -50 5 Z', GOLD, 0.08),
    p('cloth', '画心', { x: 0.5, y: 0.5 }, { x: 0.75, y: 0.55 }, 'M -38 -36 L 38 -36 L 38 36 L -38 36 Z', SILK, 0.08),
    p('rod-b', '地杆', { x: 0.5, y: 0.82 }, { x: 0.25, y: 0.85 }, 'M -50 -5 L 50 -5 L 50 5 L -50 5 Z', GOLD, 0.08),
  ];
}

/** 舟：船体 + 桨 */
export function kitBoat(): ShapePiece[] {
  return [
    p('hull', '船体', { x: 0.5, y: 0.55 }, { x: 0.2, y: 0.75 }, 'M -60 0 Q -40 28 0 32 Q 40 28 60 0 Q 20 12 -60 0 Z', { fill: '#6B5A48', stroke: '#3A2E24' }, 0.08),
    p('prow', '船首', { x: 0.22, y: 0.42 }, { x: 0.12, y: 0.25 }, 'M 0 12 L 28 -16 L 16 8 Z', BR2, 0.08),
    p('oar', '桨', { x: 0.7, y: 0.38 }, { x: 0.88, y: 0.2 }, 'M -4 -28 L 4 -28 L 3 24 L -8 32 L -3 24 Z', CLAY, 0.08),
  ];
}

/** 虎座凤架意象：座 + 立鸟 */
export function kitTigerPhoenix(): ShapePiece[] {
  return [
    p('base', '虎座', { x: 0.5, y: 0.72 }, { x: 0.2, y: 0.85 }, 'M -40 -8 Q -36 16 0 18 Q 36 16 40 -8 Z', { fill: '#8A7355', stroke: '#3A2E24' }, 0.08),
    p('post', '立柱', { x: 0.5, y: 0.48 }, { x: 0.75, y: 0.5 }, 'M -6 -28 L 6 -28 L 5 28 L -5 28 Z', LACQUER_GOLD),
    p('bird', '凤鸟', { x: 0.5, y: 0.28 }, { x: 0.5, y: 0.12 }, 'M 0 12 L -18 -8 L 0 -20 L 18 -8 Z', PHOENIX, 0.08),
  ];
}

const GOLD_MASK = { fill: '#E8C96A', stroke: '#6A5018' };
const BRONZE_DARK = { fill: '#4A5A4C', stroke: '#1E2A20' };
const PORCELAIN = { fill: '#E8F0F2', stroke: '#4A6A78' };
const PORCELAIN_BLUE = { fill: '#3A6A8A', stroke: '#1A3040' };
const GARDEN = { fill: '#6A8A6A', stroke: '#2A3A2A' };

/** 纵目面具意象：面 + 双目柱 */
export function kitVerticalEyes(): ShapePiece[] {
  return [
    p('face', '面庞', { x: 0.5, y: 0.5 }, { x: 0.2, y: 0.75 }, 'M -36 -40 L 36 -40 L 40 36 L -40 36 Z', BRONZE_DARK, 0.08),
    p('eye-l', '左纵目', { x: 0.34, y: 0.38 }, { x: 0.12, y: 0.2 }, 'M -6 20 L -6 -36 L 6 -36 L 6 20 Z', GOLD_MASK, 0.08),
    p('eye-r', '右纵目', { x: 0.66, y: 0.38 }, { x: 0.88, y: 0.22 }, 'M -6 20 L -6 -36 L 6 -36 L 6 20 Z', GOLD_MASK, 0.08),
    p('mouth', '阔口', { x: 0.5, y: 0.68 }, { x: 0.55, y: 0.88 }, 'M -22 -6 L 22 -6 L 18 12 L -18 12 Z', { fill: '#3A4A3C', stroke: '#1E2A20' }, 0.08),
  ];
}

/** 黄金面罩意象：额、颊、颏 */
export function kitGoldMask(): ShapePiece[] {
  return [
    p('brow', '额', { x: 0.5, y: 0.28 }, { x: 0.2, y: 0.15 }, 'M -34 8 Q 0 -28 34 8 L 24 16 Q 0 -8 -24 16 Z', GOLD_MASK, 0.08),
    p('cheek-l', '左颊', { x: 0.32, y: 0.52 }, { x: 0.12, y: 0.7 }, 'M 8 -22 L -18 0 L 8 24 L 14 8 Z', { fill: '#F0D78A', stroke: '#6A5018' }, 0.08),
    p('cheek-r', '右颊', { x: 0.68, y: 0.52 }, { x: 0.88, y: 0.7 }, 'M -8 -22 L 18 0 L -8 24 L -14 8 Z', { fill: '#F0D78A', stroke: '#6A5018' }, 0.08),
    p('chin', '颏', { x: 0.5, y: 0.72 }, { x: 0.5, y: 0.88 }, 'M -20 -8 L 20 -8 L 12 16 L -12 16 Z', GOLD_MASK, 0.08),
  ];
}

/** 神树意象：干 + 枝 */
export function kitSacredTree(): ShapePiece[] {
  return [
    p('trunk', '树干', { x: 0.5, y: 0.58 }, { x: 0.2, y: 0.8 }, 'M -8 -40 L 8 -40 L 10 40 L -10 40 Z', BR2, 0.08),
    p('branch-l', '左枝', { x: 0.32, y: 0.32 }, { x: 0.12, y: 0.25 }, 'M 16 8 L -28 -16 L -8 4 L -24 20 Z', GOLD_MASK, 0.08),
    p('branch-r', '右枝', { x: 0.68, y: 0.3 }, { x: 0.88, y: 0.22 }, 'M -16 8 L 28 -16 L 8 4 L 24 20 Z', GOLD_MASK, 0.08),
    p('base', '座', { x: 0.5, y: 0.82 }, { x: 0.7, y: 0.88 }, 'M -28 -4 L 28 -4 L 22 12 L -22 12 Z', BR3),
  ];
}

/** 蜀锦：经纬色块 */
export function kitShuJin(): ShapePiece[] {
  return [
    p('warp', '经线区', { x: 0.38, y: 0.5 }, { x: 0.15, y: 0.3 }, 'M -16 -40 L 16 -40 L 16 40 L -16 40 Z', { fill: '#C45C4A', stroke: '#4A2018' }, 0.08),
    p('weft', '纬线区', { x: 0.62, y: 0.5 }, { x: 0.85, y: 0.7 }, 'M -40 -16 L 40 -16 L 40 16 L -40 16 Z', { fill: '#E8C96A', stroke: '#6A5018' }, 0.08),
    p('motif', '纹样结', { x: 0.5, y: 0.5 }, { x: 0.5, y: 0.15 }, 'M 0 -18 L 18 0 L 0 18 L -18 0 Z', GOLD_MASK, 0.08),
  ];
}

/** 栈道：崖壁 + 木梁 */
export function kitPlankRoad(): ShapePiece[] {
  return [
    p('cliff', '崖壁', { x: 0.35, y: 0.5 }, { x: 0.15, y: 0.75 }, 'M -20 -50 L 20 -50 L 28 50 L -28 50 Z', { fill: '#6A6A5A', stroke: '#3A3A30' }, 0.08),
    p('beam-a', '木梁上', { x: 0.62, y: 0.35 }, { x: 0.85, y: 0.2 }, 'M -36 -5 L 36 -5 L 36 5 L -36 5 Z', CLAY, 0.08),
    p('beam-b', '木梁下', { x: 0.62, y: 0.55 }, { x: 0.8, y: 0.8 }, 'M -36 -5 L 36 -5 L 36 5 L -36 5 Z', { fill: '#A67C52', stroke: '#5A4030' }, 0.08),
  ];
}

/** 瓷瓶：口、腹、足 */
export function kitPorcelainVase(): ShapePiece[] {
  return [
    p('mouth', '瓶口', { x: 0.5, y: 0.18 }, { x: 0.2, y: 0.15 }, 'M -18 -6 L 18 -6 L 14 10 L -14 10 Z', PORCELAIN, 0.08),
    p('neck', '颈', { x: 0.5, y: 0.32 }, { x: 0.8, y: 0.3 }, 'M -10 -12 L 10 -12 L 8 14 L -8 14 Z', PORCELAIN),
    p('belly', '鼓腹', { x: 0.5, y: 0.55 }, { x: 0.25, y: 0.7 }, 'M -32 -16 Q -36 16 0 28 Q 36 16 32 -16 Q 0 -32 -32 -16 Z', PORCELAIN, 0.08),
    p('foot', '圈足', { x: 0.5, y: 0.8 }, { x: 0.7, y: 0.88 }, 'M -16 -4 L 16 -4 L 14 12 L -14 12 Z', { fill: '#D0DCE0', stroke: '#4A6A78' }),
  ];
}

/** 青花纹样块 */
export function kitBlueWhite(): ShapePiece[] {
  return [
    p('ground', '白地', { x: 0.5, y: 0.5 }, { x: 0.2, y: 0.75 }, 'M -48 -36 L 48 -36 L 48 36 L -48 36 Z', PORCELAIN, 0.09),
    p('motif-a', '青花花头', { x: 0.42, y: 0.4 }, { x: 0.15, y: 0.25 }, 'M 0 -16 Q 16 0 0 16 Q -16 0 0 -16 Z', PORCELAIN_BLUE, 0.08),
    p('motif-b', '缠枝', { x: 0.62, y: 0.58 }, { x: 0.85, y: 0.7 }, 'M -24 0 Q 0 -20 24 0 Q 0 20 -24 0 Z', PORCELAIN_BLUE, 0.08),
  ];
}

/** 折扇 */
export function kitFan(): ShapePiece[] {
  return [
    p('leaf', '扇面', { x: 0.5, y: 0.4 }, { x: 0.2, y: 0.2 }, 'M 0 24 L -48 -20 L 48 -20 Z', SILK, 0.08),
    p('rib-l', '左骨', { x: 0.38, y: 0.55 }, { x: 0.15, y: 0.7 }, 'M -2 -28 L 2 -28 L 4 28 L -4 28 Z', CLAY),
    p('rib-r', '右骨', { x: 0.62, y: 0.55 }, { x: 0.85, y: 0.7 }, 'M -2 -28 L 2 -28 L 4 28 L -4 28 Z', CLAY),
    p('pivot', '扇钉', { x: 0.5, y: 0.72 }, { x: 0.5, y: 0.88 }, 'M -8 -8 L 8 -8 L 8 8 L -8 8 Z', GOLD, 0.08),
  ];
}

/** 园林一角：墙 + 窗 + 石 */
export function kitGardenCorner(): ShapePiece[] {
  return [
    p('wall', '粉墙', { x: 0.4, y: 0.48 }, { x: 0.15, y: 0.75 }, 'M -30 -40 L 30 -40 L 30 40 L -30 40 Z', { fill: '#F2EDE3', stroke: '#6A6A5A' }, 0.08),
    p('window', '漏窗', { x: 0.42, y: 0.42 }, { x: 0.25, y: 0.2 }, 'M 0 -18 A 18 18 0 1 0 0 18 A 18 18 0 1 0 0 -18', GARDEN, 0.08),
    p('rock', '湖石', { x: 0.7, y: 0.62 }, { x: 0.88, y: 0.8 }, 'M -16 16 Q -24 -8 0 -20 Q 22 -4 16 16 Z', { fill: '#7A8A8A', stroke: '#3A4A4A' }, 0.08),
  ];
}

/** 茶盏 */
export function kitTeacup(): ShapePiece[] {
  return [
    p('rim', '盏沿', { x: 0.5, y: 0.35 }, { x: 0.2, y: 0.2 }, 'M -32 -4 L 32 -4 L 28 10 L -28 10 Z', PORCELAIN, 0.08),
    p('body', '盏身', { x: 0.5, y: 0.55 }, { x: 0.75, y: 0.6 }, 'M -28 -12 Q -30 16 0 24 Q 30 16 28 -12 Z', { fill: '#D8E4E8', stroke: '#4A6A78' }, 0.08),
    p('foot', '足', { x: 0.5, y: 0.75 }, { x: 0.5, y: 0.88 }, 'M -12 -4 L 12 -4 L 10 10 L -10 10 Z', PORCELAIN),
  ];
}

const FELT = { fill: '#8A7A5A', stroke: '#3A3020' };
const SKY = { fill: '#6A8AAA', stroke: '#2A3A4A' };
const SADDLE = { fill: '#8B2E2E', stroke: '#3D1515' };

/** 马：头颈身腿 */
export function kitHorse(): ShapePiece[] {
  return [
    p('head', '马首', { x: 0.28, y: 0.35 }, { x: 0.12, y: 0.2 }, 'M 0 10 L 28 -16 L 12 -4 L 32 8 L 4 16 Z', FELT, 0.08),
    p('neck', '颈', { x: 0.4, y: 0.42 }, { x: 0.25, y: 0.7 }, 'M -8 -20 L 10 -16 L 6 22 L -10 18 Z', { fill: '#9A8A6A', stroke: '#3A3020' }, 0.08),
    p('body', '身', { x: 0.58, y: 0.5 }, { x: 0.8, y: 0.55 }, 'M -28 -16 Q -32 12 0 20 Q 32 10 28 -14 Q 0 -28 -28 -16 Z', FELT, 0.08),
    p('leg', '腿', { x: 0.55, y: 0.75 }, { x: 0.7, y: 0.88 }, 'M -6 -8 L 6 -8 L 4 28 L -4 28 Z', BR3),
  ];
}

/** 骆驼：双峰 */
export function kitCamel(): ShapePiece[] {
  return [
    p('hump-a', '前峰', { x: 0.4, y: 0.32 }, { x: 0.15, y: 0.2 }, 'M -16 12 Q 0 -24 16 12 Z', FELT, 0.08),
    p('hump-b', '后峰', { x: 0.6, y: 0.34 }, { x: 0.85, y: 0.22 }, 'M -16 12 Q 0 -22 16 12 Z', { fill: '#9A8A6A', stroke: '#3A3020' }, 0.08),
    p('body', '身', { x: 0.5, y: 0.55 }, { x: 0.5, y: 0.8 }, 'M -40 -10 Q -44 16 0 22 Q 44 16 40 -10 Z', FELT, 0.08),
    p('head', '驼首', { x: 0.22, y: 0.45 }, { x: 0.12, y: 0.65 }, 'M 0 8 L 20 -12 L 8 0 L 18 14 Z', { fill: '#A89870', stroke: '#3A3020' }, 0.08),
  ];
}

/** 关隘：墙 + 门洞 */
export function kitPassGate(): ShapePiece[] {
  return [
    p('wall-l', '左墙', { x: 0.28, y: 0.5 }, { x: 0.12, y: 0.75 }, 'M -16 -40 L 16 -40 L 16 40 L -16 40 Z', { fill: '#7A6A5A', stroke: '#3A3020' }, 0.08),
    p('wall-r', '右墙', { x: 0.72, y: 0.5 }, { x: 0.88, y: 0.75 }, 'M -16 -40 L 16 -40 L 16 40 L -16 40 Z', { fill: '#7A6A5A', stroke: '#3A3020' }, 0.08),
    p('arch', '门洞', { x: 0.5, y: 0.55 }, { x: 0.5, y: 0.2 }, 'M -20 24 L -20 -8 Q 0 -36 20 -8 L 20 24 Z', SKY, 0.08),
    p('tower', '敌楼', { x: 0.5, y: 0.22 }, { x: 0.25, y: 0.15 }, 'M -28 8 L 0 -16 L 28 8 Z', BR3, 0.08),
  ];
}

/** 马鞍 */
export function kitSaddle(): ShapePiece[] {
  return [
    p('seat', '鞍座', { x: 0.5, y: 0.45 }, { x: 0.2, y: 0.25 }, 'M -32 8 Q 0 -24 32 8 L 24 16 Q 0 0 -24 16 Z', SADDLE, 0.08),
    p('flap-l', '左障泥', { x: 0.32, y: 0.62 }, { x: 0.12, y: 0.8 }, 'M 4 -16 L -16 8 L 8 20 Z', { fill: '#A04040', stroke: '#3D1515' }, 0.08),
    p('flap-r', '右障泥', { x: 0.68, y: 0.62 }, { x: 0.88, y: 0.8 }, 'M -4 -16 L 16 8 L -8 20 Z', { fill: '#A04040', stroke: '#3D1515' }, 0.08),
  ];
}

/** 角杯 / 酒器 */
export function kitHornCup(): ShapePiece[] {
  return [
    p('rim', '口', { x: 0.42, y: 0.28 }, { x: 0.15, y: 0.2 }, 'M -14 -6 L 14 -6 L 10 8 L -10 8 Z', GOLD, 0.08),
    p('body', '角身', { x: 0.55, y: 0.55 }, { x: 0.8, y: 0.55 }, 'M -12 -28 L 8 -24 L 28 28 L -4 24 Z', { fill: '#C4A57A', stroke: '#5A4030' }, 0.08),
    p('tip', '角尖', { x: 0.72, y: 0.78 }, { x: 0.7, y: 0.9 }, 'M -6 -8 L 10 -4 L 4 14 Z', GOLD, 0.08),
  ];
}

/** 灯笼（岁时） */
export function kitLantern(): ShapePiece[] {
  return [
    p('top', '灯盖', { x: 0.5, y: 0.22 }, { x: 0.2, y: 0.15 }, 'M -24 6 L 0 -14 L 24 6 Z', GOLD, 0.08),
    p('body', '灯身', { x: 0.5, y: 0.5 }, { x: 0.75, y: 0.55 }, 'M -28 -20 Q -32 0 -28 20 L 28 20 Q 32 0 28 -20 Z', SADDLE, 0.08),
    p('tassel', '穗', { x: 0.5, y: 0.78 }, { x: 0.5, y: 0.9 }, 'M -4 -8 L 4 -8 L 2 20 L -2 20 Z', GOLD, 0.08),
  ];
}

/** 粽子（岁时） */
export function kitZongzi(): ShapePiece[] {
  return [
    p('leaf-a', '箬叶甲', { x: 0.4, y: 0.45 }, { x: 0.15, y: 0.25 }, 'M 0 -24 L 20 16 L -8 12 Z', GARDEN, 0.08),
    p('leaf-b', '箬叶乙', { x: 0.6, y: 0.48 }, { x: 0.85, y: 0.3 }, 'M 0 -24 L -20 16 L 8 12 Z', { fill: '#5A7A5A', stroke: '#2A3A2A' }, 0.08),
    p('body', '米心', { x: 0.5, y: 0.55 }, { x: 0.5, y: 0.8 }, 'M 0 -16 L 14 12 L -14 12 Z', { fill: '#E8D9A0', stroke: '#6A5A30' }, 0.08),
  ];
}

/** 月饼 */
export function kitMooncake(): ShapePiece[] {
  return [
    p('crust', '饼皮', { x: 0.5, y: 0.5 }, { x: 0.2, y: 0.75 }, 'M 0 -36 A 36 36 0 1 0 0 36 A 36 36 0 1 0 0 -36', { fill: '#E8C96A', stroke: '#6A5018' }, 0.09),
    p('pattern', '花模', { x: 0.5, y: 0.5 }, { x: 0.8, y: 0.25 }, 'M 0 -14 L 8 -4 L 16 -8 L 10 4 L 14 14 L 0 8 L -14 14 L -10 4 L -16 -8 L -8 -4 Z', { fill: '#C4A35A', stroke: '#5A4020' }, 0.08),
  ];
}

/** 春联条幅 */
export function kitCouplet(): ShapePiece[] {
  return [
    p('strip', '联幅', { x: 0.5, y: 0.5 }, { x: 0.2, y: 0.75 }, 'M -14 -48 L 14 -48 L 14 48 L -14 48 Z', SADDLE, 0.08),
    p('char-a', '上字', { x: 0.5, y: 0.32 }, { x: 0.8, y: 0.2 }, 'M -10 -10 L 10 -10 L 10 10 L -10 10 Z', GOLD, 0.08),
    p('char-b', '下字', { x: 0.5, y: 0.62 }, { x: 0.75, y: 0.8 }, 'M -10 -10 L 10 -10 L 10 10 L -10 10 Z', GOLD, 0.08),
  ];
}

const CLOUD = { fill: '#C8D4E0', stroke: '#4A5A6A' };
const MYTH = { fill: '#7A6A9A', stroke: '#2A2040' };
const SEA = { fill: '#3A6A8A', stroke: '#1A3040' };
const SAIL = { fill: '#F2EDE3', stroke: '#6A6A5A' };

/** 昆仑/仙山：峰 + 云 */
export function kitImmortalPeak(): ShapePiece[] {
  return [
    p('peak', '主峰', { x: 0.5, y: 0.42 }, { x: 0.5, y: 0.15 }, 'M 0 -40 L 36 28 L -36 28 Z', { fill: '#6A7A8A', stroke: '#2A3A4A' }, 0.08),
    p('cloud-l', '左云', { x: 0.28, y: 0.55 }, { x: 0.12, y: 0.75 }, 'M -24 0 Q -8 -16 8 0 Q -4 12 -24 0 Z', CLOUD, 0.08),
    p('cloud-r', '右云', { x: 0.72, y: 0.52 }, { x: 0.88, y: 0.78 }, 'M 24 0 Q 8 -16 -8 0 Q 4 12 24 0 Z', CLOUD, 0.08),
    p('base', '山麓', { x: 0.5, y: 0.78 }, { x: 0.3, y: 0.88 }, 'M -40 -4 L 40 -4 L 32 14 L -32 14 Z', BR3),
  ];
}

/** 九尾狐意象：身 + 多尾 */
export function kitNineTail(): ShapePiece[] {
  return [
    p('body', '身', { x: 0.42, y: 0.5 }, { x: 0.2, y: 0.7 }, 'M -20 -12 Q -24 16 0 22 Q 20 10 16 -14 Z', MYTH, 0.08),
    p('head', '首', { x: 0.28, y: 0.35 }, { x: 0.12, y: 0.2 }, 'M 0 8 L 18 -12 L 6 0 L 16 12 Z', { fill: '#9A8ABA', stroke: '#2A2040' }, 0.08),
    p('tail-a', '尾甲', { x: 0.62, y: 0.55 }, { x: 0.85, y: 0.4 }, 'M -4 0 Q 20 -24 36 8 Q 12 12 -4 0 Z', MYTH, 0.08),
    p('tail-b', '尾乙', { x: 0.65, y: 0.68 }, { x: 0.8, y: 0.85 }, 'M -4 0 Q 16 -16 32 12 Q 8 10 -4 0 Z', { fill: '#8A7AAA', stroke: '#2A2040' }, 0.08),
  ];
}

/** 山海册残页 */
export function kitClassicPage(): ShapePiece[] {
  return [
    p('page', '册页', { x: 0.5, y: 0.5 }, { x: 0.2, y: 0.75 }, 'M -36 -44 L 36 -44 L 36 44 L -36 44 Z', { fill: '#E8DFC8', stroke: '#5A5040' }, 0.08),
    p('title', '经题', { x: 0.5, y: 0.28 }, { x: 0.75, y: 0.2 }, 'M -28 -8 L 28 -8 L 28 8 L -28 8 Z', GOLD, 0.08),
    p('beast', '异兽图记', { x: 0.5, y: 0.58 }, { x: 0.5, y: 0.85 }, 'M 0 -16 L 16 0 L 0 16 L -16 0 Z', MYTH, 0.08),
  ];
}

/** 弱水/川流 */
export function kitMythRiver(): ShapePiece[] {
  return [
    p('wave-a', '浪甲', { x: 0.35, y: 0.45 }, { x: 0.15, y: 0.25 }, 'M -30 8 Q -10 -16 10 4 Q -5 16 -30 8 Z', SEA, 0.08),
    p('wave-b', '浪乙', { x: 0.65, y: 0.55 }, { x: 0.85, y: 0.75 }, 'M 30 8 Q 10 -16 -10 4 Q 5 16 30 8 Z', { fill: '#4A7A9A', stroke: '#1A3040' }, 0.08),
    p('bank', '岸', { x: 0.5, y: 0.75 }, { x: 0.5, y: 0.9 }, 'M -48 -4 L 48 -4 L 40 12 L -40 12 Z', BR3),
  ];
}

/** 海船：帆 + 船体 */
export function kitSeaShip(): ShapePiece[] {
  return [
    p('hull', '船体', { x: 0.5, y: 0.68 }, { x: 0.2, y: 0.85 }, 'M -50 0 Q -30 24 0 28 Q 30 24 50 0 Q 20 10 -50 0 Z', { fill: '#6B5A48', stroke: '#3A2E24' }, 0.08),
    p('mast', '桅', { x: 0.5, y: 0.4 }, { x: 0.75, y: 0.35 }, 'M -4 -36 L 4 -36 L 3 36 L -3 36 Z', CLAY),
    p('sail', '帆', { x: 0.58, y: 0.38 }, { x: 0.85, y: 0.2 }, 'M -6 -28 L 32 -20 L 28 20 L -4 24 Z', SAIL, 0.08),
  ];
}

/** 罗盘 */
export function kitCompass(): ShapePiece[] {
  return [
    p('dial', '盘面', { x: 0.5, y: 0.5 }, { x: 0.2, y: 0.75 }, 'M 0 -40 A 40 40 0 1 0 0 40 A 40 40 0 1 0 0 -40', { fill: '#E8DFC8', stroke: '#5A5040' }, 0.09),
    p('needle', '指针', { x: 0.5, y: 0.5 }, { x: 0.8, y: 0.25 }, 'M 0 -28 L 6 4 L 0 8 L -6 4 Z', SADDLE, 0.08),
    p('hub', '轴', { x: 0.5, y: 0.5 }, { x: 0.5, y: 0.88 }, 'M -6 -6 L 6 -6 L 6 6 L -6 6 Z', GOLD, 0.08),
  ];
}

/** 外销瓷盘 */
export function kitExportPorcelain(): ShapePiece[] {
  return [
    p('rim', '盘沿', { x: 0.5, y: 0.5 }, { x: 0.15, y: 0.25 }, 'M 0 -42 A 42 42 0 1 0 0 42 A 42 42 0 1 0 0 -42 M 0 -28 A 28 28 0 1 1 0 28 A 28 28 0 1 1 0 -28', PORCELAIN, 0.09),
    p('motif', '开光纹', { x: 0.5, y: 0.5 }, { x: 0.8, y: 0.7 }, 'M 0 -16 L 12 0 L 0 16 L -12 0 Z', PORCELAIN_BLUE, 0.08),
  ];
}

/** 香料囊 */
export function kitSpicePouch(): ShapePiece[] {
  return [
    p('bag', '囊身', { x: 0.5, y: 0.55 }, { x: 0.25, y: 0.75 }, 'M -22 -16 Q -26 12 0 28 Q 26 12 22 -16 Z', { fill: '#C45C4A', stroke: '#4A2018' }, 0.08),
    p('tie', '系绳', { x: 0.5, y: 0.32 }, { x: 0.75, y: 0.2 }, 'M -16 -4 L 16 -4 L 12 10 L -12 10 Z', GOLD, 0.08),
    p('leaf', '香叶', { x: 0.62, y: 0.42 }, { x: 0.85, y: 0.55 }, 'M 0 -14 Q 12 0 0 14 Q -8 0 0 -14 Z', GARDEN, 0.08),
  ];
}

export const BOARD = { w: 360, h: 360 } as const;
