export interface ThrowSetup {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  angularVelocity: { x: number; y: number; z: number };
}

/**
 * 让两片筊杯向台面两侧展开。落定朝向仍由物理引擎决定，
 * 这里只避免两片重叠而让正反组合无法被玩家看见。
 */
export function createThrowSetup(index: number, random = Math.random): ThrowSetup {
  const side = index === 0 ? -1 : 1;
  const jitter = () => random() - 0.5;

  return {
    position: {
      x: side * 0.76,
      y: 3.2 + index * 0.18,
      z: side * 0.24,
    },
    rotation: {
      x: jitter() * 1.1,
      y: random() * Math.PI,
      z: jitter() * 1.1,
    },
    velocity: {
      x: side * (0.72 + random() * 0.22),
      y: 1.45 + random() * 0.35,
      z: -side * 0.18 + jitter() * 0.22,
    },
    angularVelocity: {
      x: side * (6.5 + random() * 3.5),
      y: jitter() * 4.5,
      z: jitter() * 4.5,
    },
  };
}
