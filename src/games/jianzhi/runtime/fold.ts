import type { FoldMode } from '../core/types';

export type Pt = { x: number; y: number };
export type Transform = (x: number, y: number) => Pt;

/** 某种折法对应的几何：如何判定"活动折面"、把任意点映射回活动折面、以及由此派生的对称变换集合与裁剪形态。 */
export interface FoldConfig {
  /** 给定点是否落在"可剪的活动折面"内 */
  inActive: (x: number, y: number) => boolean;
  /** 把画布任意点映射回活动折面内的等价点 */
  toActive: (x: number, y: number) => Pt;
  /** 在活动折面上剪一笔后，向全纸派生的所有对称变换 */
  transforms: Transform[];
  /** 折叠态裁剪形态：full=整张可见，rect=矩形折面，sector=团花扇形 */
  clip: 'full' | 'rect' | 'sector';
  /** clip==='rect' 时的活动折面区域 [x0,y0,x1,y1]（归一化） */
  rect?: [number, number, number, number];
}

export const ROSETTE_N = 6;

function identity(x: number, y: number): Pt {
  return { x, y };
}
function reflectX(x: number, y: number): Pt {
  return { x: 1 - x, y };
}
function reflectY(x: number, y: number): Pt {
  return { x, y: 1 - y };
}

/**
 * 把"折法"翻译为一组对称几何参数。这是纯函数，不触碰任何 Canvas / DOM，
 * 引擎只在渲染与指针命中时消费其产物。
 */
export function getFoldConfig(fold: FoldMode): FoldConfig {
  switch (fold) {
    case 'single':
      return { inActive: () => true, toActive: identity, transforms: [identity], clip: 'full' };
    case 'book':
      return {
        inActive: (x: number) => x >= 0.5,
        toActive: identity,
        transforms: [identity, reflectX],
        clip: 'rect',
        rect: [0.5, 0, 1, 1],
      };
    case 'four':
      return {
        inActive: (x: number, y: number) => x >= 0.5 && y >= 0.5,
        toActive: identity,
        transforms: [identity, reflectX, reflectY, (x, y) => ({ x: 1 - x, y: 1 - y })],
        clip: 'rect',
        rect: [0.5, 0.5, 1, 1],
      };
    case 'rosette': {
      const step = (2 * Math.PI) / ROSETTE_N;
      const toActive = (x: number, y: number): Pt => {
        const dx = x - 0.5;
        const dy = y - 0.5;
        const r = Math.hypot(dx, dy);
        const a = Math.atan2(dy, dx);
        let a2 = ((a % step) + step) % step;
        if (a2 > step / 2) a2 = step - a2;
        return { x: 0.5 + r * Math.cos(a2), y: 0.5 + r * Math.sin(a2) };
      };
      const transforms: Transform[] = [];
      for (let k = 0; k < ROSETTE_N; k += 1) {
        const base = k * step;
        transforms.push((x, y) => {
          const dx = x - 0.5;
          const dy = y - 0.5;
          const r = Math.hypot(dx, dy);
          const a = Math.atan2(dy, dx) + base;
          return { x: 0.5 + r * Math.cos(a), y: 0.5 + r * Math.sin(a) };
        });
        transforms.push((x, y) => {
          const dx = x - 0.5;
          const dy = y - 0.5;
          const r = Math.hypot(dx, dy);
          const a = -Math.atan2(dy, dx) + base;
          return { x: 0.5 + r * Math.cos(a), y: 0.5 + r * Math.sin(a) };
        });
      }
      return { inActive: () => true, toActive, transforms, clip: 'sector' };
    }
    default:
      return { inActive: () => true, toActive: identity, transforms: [identity], clip: 'full' };
  }
}
