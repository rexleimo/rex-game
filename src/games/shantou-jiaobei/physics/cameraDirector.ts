export interface CameraPosition {
  x: number;
  y: number;
  z: number;
}

export interface CameraGoal {
  target: CameraPosition;
  alpha: number;
  beta: number;
  radius: number;
}

const FLIGHT_BETA = 0.62;
const LANDED_BETA = 0.84;
const CAMERA_ALPHA = -Math.PI / 2;
const MIN_TARGET_Y = 0.45;
const MAX_TARGET_Y = 2.6;

const clamp = (value: number, minimum: number, maximum: number) => (
  Math.min(maximum, Math.max(minimum, value))
);

const lerp = (start: number, end: number, amount: number) => (
  start + (end - start) * amount
);

/** Returns a live ArcRotateCamera goal without depending on Babylon runtime objects. */
export function computeCameraGoal(
  positions: readonly CameraPosition[],
  aspect: number,
  landedCount: number,
): CameraGoal {
  const samples = positions.length > 0 ? positions : [{ x: 0, y: 0, z: 0 }];
  let sumX = 0;
  let sumY = 0;
  let sumZ = 0;
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  let maxY = -Infinity;

  for (const position of samples) {
    sumX += position.x;
    sumY += position.y;
    sumZ += position.z;
    minX = Math.min(minX, position.x);
    maxX = Math.max(maxX, position.x);
    minZ = Math.min(minZ, position.z);
    maxZ = Math.max(maxZ, position.z);
    maxY = Math.max(maxY, position.y);
  }

  const midpoint = {
    x: sumX / samples.length,
    y: sumY / samples.length,
    z: sumZ / samples.length,
  };
  const landingProgress = clamp(landedCount / 2, 0, 1);
  const beta = lerp(FLIGHT_BETA, LANDED_BETA, landingProgress);
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;
  const narrowness = clamp((1.2 - safeAspect) / 0.4, 0, 1);
  const horizontalSpread = Math.hypot(maxX - minX, maxZ - minZ);
  const targetY = clamp(midpoint.y, MIN_TARGET_Y, MAX_TARGET_Y);
  const safetyOffsetX = 0.18 + narrowness * 0.52;

  const baseRadius = lerp(4.7, 4.2, landingProgress);
  const spreadRadius = baseRadius + Math.max(0.6, horizontalSpread) * 0.55;
  const viewportRadius = spreadRadius * (1 + narrowness * 0.3);
  const overheadRadius = (maxY - targetY + 0.8) / Math.cos(beta);

  return {
    target: {
      x: midpoint.x + safetyOffsetX,
      y: targetY,
      z: midpoint.z,
    },
    alpha: CAMERA_ALPHA,
    beta,
    radius: Math.max(viewportRadius, overheadRadius),
  };
}

export function cameraHeight(goal: CameraGoal): number {
  return goal.target.y + goal.radius * Math.cos(goal.beta);
}
