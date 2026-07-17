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

const ESTABLISHING_BETA = 0.62;
const CAMERA_ALPHA = -Math.PI / 2;
const TARGET_Y = 0.62;
const TARGET_Z = 0.34;
const DESKTOP_RADIUS = 8.4;

const clamp = (value: number, minimum: number, maximum: number) => (
  Math.min(maximum, Math.max(minimum, value))
);

/**
 * Keeps the altar as the hero of the shot. Cup motion is allowed to make only
 * a tiny framing correction so impacts feel alive without collapsing into a close-up.
 */
export function computeCameraGoal(
  positions: readonly CameraPosition[],
  aspect: number,
  _landedCount: number,
): CameraGoal {
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;
  const narrowness = clamp((1.34 - safeAspect) / 0.5, 0, 1);
  const samples = positions.length > 0 ? positions : [{ x: 0, y: 0, z: 0 }];
  const midpoint = samples.reduce(
    (sum, position) => ({ x: sum.x + position.x, z: sum.z + position.z }),
    { x: 0, z: 0 },
  );
  midpoint.x /= samples.length;
  midpoint.z /= samples.length;

  const correctionX = clamp(midpoint.x * 0.08, -0.12, 0.12);
  const correctionZ = clamp(midpoint.z * 0.06, -0.08, 0.08);

  return {
    target: {
      x: 0.28 + narrowness * 0.48 + correctionX,
      y: TARGET_Y,
      z: TARGET_Z + correctionZ,
    },
    alpha: CAMERA_ALPHA,
    beta: ESTABLISHING_BETA,
    radius: DESKTOP_RADIUS + narrowness * 2.6,
  };
}

export function cameraHeight(goal: CameraGoal): number {
  return goal.target.y + goal.radius * Math.cos(goal.beta);
}
