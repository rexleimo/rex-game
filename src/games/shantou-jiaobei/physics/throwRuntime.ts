import { PhysicsEventType } from '@babylonjs/core';
import type { PhysicsBody } from '@babylonjs/core/Physics/v2/physicsBody.js';

export const THROW_GROUND_SIZE = 14;
export const THROW_GROUND_THICKNESS = 0.4;
export const THROW_MAX_DURATION_MS = 3200;
export const THROW_RENDER_WATCHDOG_MS = 5000;
export const THROW_MAX_PHYSICS_STEP_MS = 100;
export const THROW_PHYSICS_SUBSTEP_MS = 1000 / 960;
export const THROW_SETTLEMENT_SAMPLE_MS = 1000 / 60;
export const THROW_STILL_CHECKS = 3;
export const THROW_LANDING_LINEAR_DAMPING = 0.08;
export const THROW_LANDING_ANGULAR_DAMPING = 0.9;
export const THROW_FACE_CONTACT_LINEAR_DAMPING = 6;
export const THROW_FACE_CONTACT_ANGULAR_DAMPING = 12;
export const THROW_FACE_CONTACT_MAX_LINEAR_SPEED = 1.2;
export const THROW_FACE_CONTACT_MAX_ANGULAR_SPEED = 3;
export const THROW_FACE_DOT_THRESHOLD = 0.9;
export const THROW_FACE_CONTACT_RELEASE_DOT_THRESHOLD = 0.895;
export const THROW_EDGE_STALL_CHECKS = 3;
export const THROW_ASSIST_ROLL_MIN_SPEED = 0.05;
export const THROW_ASSIST_MIN_REMAINING_MS = 700;

const THROW_GROUND_HALF_SIZE = THROW_GROUND_SIZE / 2;
const THROW_RECOVERY_FLOOR_Y = -0.5;
const THROW_LINEAR_SETTLE_SPEED = 0.3;
const THROW_ANGULAR_SETTLE_SPEED = 0.75;

export interface ThrowPosition {
  x: number;
  y: number;
  z: number;
}

export interface ThrowMotionSample {
  position: ThrowPosition;
  linearSpeed: number;
  angularSpeed: number;
}

export type RollSign = -1 | 0 | 1;

export interface ThrowPieceMotionSample extends ThrowMotionSample {
  rollSpeed: number;
}

export interface ThrowPieceAssistState {
  edgeChecks: number;
  assistUsed: boolean;
  lastRollSign: RollSign;
  fallbackSign: Exclude<RollSign, 0>;
}

export type ThrowAction =
  | { type: 'continue' }
  | { type: 'tip'; pieceIndices: number[] }
  | { type: 'settled' }
  | {
    type: 'retry';
    reason: 'out-of-bounds' | 'deadline' | 'late-edge-stall' | 'edge-after-assist';
  };

export interface ThrowSettlementInput {
  samples: readonly ThrowPieceMotionSample[];
  landed: readonly boolean[];
  faceUpDots: readonly number[];
  pieceStates: readonly ThrowPieceAssistState[];
  stillChecks: number;
  elapsedMs: number;
  pageHidden: boolean;
}

export interface ThrowSettlementStep {
  action: ThrowAction;
  pieceStates: ThrowPieceAssistState[];
  stillChecks: number;
}

export type ThrowProgress = 'continue' | 'settled' | 'retry';
export type CupFace = 'sheng-face' | 'yin-face';
export type CupOrientation = CupFace | 'edge';

/** Babylon Physics v2 caps each submitted world step at 0.1 seconds. */
export function getSubmittedPhysicsDeltaMs(renderDeltaMs: number): number {
  return Math.min(THROW_MAX_PHYSICS_STEP_MS, Math.max(1, renderDeltaMs));
}

export function classifyCupFace(upDot: number): CupOrientation {
  if (upDot >= THROW_FACE_DOT_THRESHOLD) return 'sheng-face';
  if (upDot <= -THROW_FACE_DOT_THRESHOLD) return 'yin-face';
  return 'edge';
}

export function shouldApplyFaceContactBraking(
  landed: boolean,
  upDot: number,
  sample: ThrowMotionSample,
  brakeActive = false,
): boolean {
  const faceDotThreshold = brakeActive
    ? THROW_FACE_CONTACT_RELEASE_DOT_THRESHOLD
    : THROW_FACE_DOT_THRESHOLD;
  return landed
    && Math.abs(upDot) >= faceDotThreshold
    && sample.linearSpeed <= THROW_FACE_CONTACT_MAX_LINEAR_SPEED
    && sample.angularSpeed <= THROW_FACE_CONTACT_MAX_ANGULAR_SPEED;
}

export function isThrowOutOfBounds(position: ThrowPosition): boolean {
  return position.y < THROW_RECOVERY_FLOOR_Y
    || Math.abs(position.x) > THROW_GROUND_HALF_SIZE
    || Math.abs(position.z) > THROW_GROUND_HALF_SIZE;
}

export function isThrowMoving(samples: readonly ThrowMotionSample[]): boolean {
  return samples.some((sample) => (
    sample.linearSpeed > THROW_LINEAR_SETTLE_SPEED
    || sample.angularSpeed > THROW_ANGULAR_SETTLE_SPEED
  ));
}

export function isRenderWatchdogExpired(
  lastRenderAtMs: number,
  nowMs: number,
  pageHidden: boolean,
  armed = true,
): boolean {
  return armed && !pageHidden && nowMs - lastRenderAtMs >= THROW_RENDER_WATCHDOG_MS;
}

export function createThrowPieceAssistState(
  fallbackSign: Exclude<RollSign, 0>,
): ThrowPieceAssistState {
  return {
    edgeChecks: 0,
    assistUsed: false,
    lastRollSign: 0,
    fallbackSign,
  };
}

export function stepThrowSettlement(input: ThrowSettlementInput): ThrowSettlementStep {
  if (input.pageHidden) {
    return {
      action: { type: 'continue' },
      pieceStates: input.pieceStates.map((state) => ({ ...state })),
      stillChecks: input.stillChecks,
    };
  }

  if (input.samples.some((sample) => isThrowOutOfBounds(sample.position))) {
    return {
      action: { type: 'retry', reason: 'out-of-bounds' },
      pieceStates: input.pieceStates.map((state) => ({ ...state })),
      stillChecks: input.stillChecks,
    };
  }

  const allLanded = input.samples.length > 0
    && input.landed.length === input.samples.length
    && input.landed.every(Boolean);
  const allFacesClear = input.faceUpDots.length === input.samples.length
    && input.faceUpDots.every((upDot) => classifyCupFace(upDot) !== 'edge');
  const nextStillChecks = allLanded && !isThrowMoving(input.samples)
    ? input.stillChecks + 1
    : 0;
  const pieceStates = input.pieceStates.map((state, index) => {
    const sample = input.samples[index];
    const edgeStalled = allLanded
      && classifyCupFace(input.faceUpDots[index]) === 'edge'
      && sample.linearSpeed <= THROW_LINEAR_SETTLE_SPEED
      && sample.angularSpeed <= THROW_ANGULAR_SETTLE_SPEED;
    const lastRollSign: RollSign = Math.abs(sample.rollSpeed) > THROW_ASSIST_ROLL_MIN_SPEED
      ? (sample.rollSpeed > 0 ? 1 : -1)
      : state.lastRollSign;

    return {
      ...state,
      edgeChecks: edgeStalled ? state.edgeChecks + 1 : 0,
      lastRollSign,
    };
  });

  if (input.elapsedMs >= THROW_MAX_DURATION_MS) {
    return {
      action: allLanded && allFacesClear
        ? { type: 'settled' }
        : { type: 'retry', reason: 'deadline' },
      pieceStates,
      stillChecks: nextStillChecks,
    };
  }

  const stalled = pieceStates
    .map((state, index) => ({ state, index }))
    .filter(({ state }) => state.edgeChecks >= THROW_EDGE_STALL_CHECKS);
  if (stalled.length > 0) {
    if (input.elapsedMs > THROW_MAX_DURATION_MS - THROW_ASSIST_MIN_REMAINING_MS) {
      return {
        action: { type: 'retry', reason: 'late-edge-stall' },
        pieceStates,
        stillChecks: 0,
      };
    }
    if (stalled.some(({ state }) => state.assistUsed)) {
      return {
        action: { type: 'retry', reason: 'edge-after-assist' },
        pieceStates,
        stillChecks: 0,
      };
    }

    const pieceIndices = stalled.map(({ index }) => index);
    return {
      action: { type: 'tip', pieceIndices },
      pieceStates: pieceStates.map((state, index) => (
        pieceIndices.includes(index)
          ? { ...state, assistUsed: true, edgeChecks: 0 }
          : state
      )),
      stillChecks: 0,
    };
  }

  if (!allLanded || nextStillChecks < THROW_STILL_CHECKS) {
    return {
      action: { type: 'continue' },
      pieceStates,
      stillChecks: nextStillChecks,
    };
  }

  return {
    action: allFacesClear ? { type: 'settled' } : { type: 'continue' },
    pieceStates,
    stillChecks: nextStillChecks,
  };
}

export function decideThrowProgress(
  samples: readonly ThrowMotionSample[],
  landed: readonly boolean[],
  stillChecks: number,
  elapsedMs: number,
  faceUpDots?: readonly number[],
): ThrowProgress {
  if (samples.some((sample) => isThrowOutOfBounds(sample.position))) return 'retry';

  const allLanded = samples.length > 0
    && landed.length === samples.length
    && landed.every(Boolean);
  const allFacesClear = !faceUpDots || (
    faceUpDots.length === samples.length
    && faceUpDots.every((upDot) => classifyCupFace(upDot) !== 'edge')
  );

  if (elapsedMs >= THROW_MAX_DURATION_MS) {
    return allLanded && allFacesClear ? 'settled' : 'retry';
  }
  if (!allLanded) return 'continue';
  if (stillChecks < THROW_STILL_CHECKS) return 'continue';
  return allFacesClear ? 'settled' : 'retry';
}

export function isGroundCollision(
  eventType: PhysicsEventType,
  collidedAgainst: PhysicsBody,
  groundBody: PhysicsBody,
): boolean {
  return eventType === PhysicsEventType.COLLISION_STARTED
    && collidedAgainst === groundBody;
}
