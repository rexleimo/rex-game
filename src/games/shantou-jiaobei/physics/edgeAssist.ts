import { Vector3 } from '@babylonjs/core';
import type { RollSign } from './throwRuntime.ts';

export const POSITIVE_FACE_EDGE_IMPULSE = 0.24;
export const NEGATIVE_FACE_EDGE_IMPULSE = 0.38;

const AXIS_EPSILON = 1e-6;
const DOT_EPSILON = 1e-6;

export interface EdgeRollMeasurement {
  axis: Vector3;
  rollSpeed: number;
}

export interface EdgeAssistInput {
  faceNormalWorld: Vector3;
  upDot: number;
  angularVelocityWorld: Vector3;
  lastRollSign: RollSign;
  fallbackSign: Exclude<RollSign, 0>;
}

export interface EdgeAssistImpulse extends EdgeRollMeasurement {
  impulse: Vector3;
  rollSign: Exclude<RollSign, 0>;
  magnitude: number;
}

export function measureEdgeRoll(
  faceNormalWorld: Vector3,
  angularVelocityWorld: Vector3,
): EdgeRollMeasurement | null {
  const axis = Vector3.Cross(faceNormalWorld, Vector3.Up());
  const length = axis.length();
  if (!Number.isFinite(length) || length <= AXIS_EPSILON) return null;

  axis.scaleInPlace(1 / length);
  const rollSpeed = Vector3.Dot(angularVelocityWorld, axis);
  if (!Number.isFinite(rollSpeed)) return null;
  return { axis, rollSpeed };
}

export function createEdgeAssistImpulse(
  input: EdgeAssistInput,
): EdgeAssistImpulse | null {
  const measurement = measureEdgeRoll(
    input.faceNormalWorld,
    input.angularVelocityWorld,
  );
  if (!measurement || !Number.isFinite(input.upDot)) return null;

  const rollSign: Exclude<RollSign, 0> = input.lastRollSign !== 0
    ? input.lastRollSign
    : Math.abs(input.upDot) > DOT_EPSILON
      ? (input.upDot > 0 ? 1 : -1)
      : input.fallbackSign;
  const magnitude = rollSign > 0
    ? POSITIVE_FACE_EDGE_IMPULSE
    : NEGATIVE_FACE_EDGE_IMPULSE;

  return {
    ...measurement,
    impulse: measurement.axis.scale(rollSign * magnitude),
    rollSign,
    magnitude,
  };
}
