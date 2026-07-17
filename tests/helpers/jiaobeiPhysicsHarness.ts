import { readFileSync } from 'node:fs';
import HavokPhysics from '@babylonjs/havok';
import {
  HavokPlugin,
  MeshBuilder,
  PhysicsActivationControl,
  PhysicsAggregate,
  PhysicsShapeType,
  Scene,
  Vector3,
} from '@babylonjs/core';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import '@babylonjs/core/Physics/physicsEngineComponent.js';
import {
  createEdgeAssistImpulse,
  measureEdgeRoll,
  NEGATIVE_FACE_EDGE_IMPULSE,
  POSITIVE_FACE_EDGE_IMPULSE,
} from '../../src/games/shantou-jiaobei/physics/edgeAssist.ts';
import { JiaobeiMesh } from '../../src/games/shantou-jiaobei/physics/JiaobeiMesh.ts';
import {
  classifyCupFace,
  createThrowPieceAssistState,
  isGroundCollision,
  shouldApplyFaceContactBraking,
  stepThrowSettlement,
  THROW_FACE_CONTACT_ANGULAR_DAMPING,
  THROW_FACE_CONTACT_LINEAR_DAMPING,
  THROW_GROUND_SIZE,
  THROW_GROUND_THICKNESS,
  THROW_LANDING_ANGULAR_DAMPING,
  THROW_LANDING_LINEAR_DAMPING,
  THROW_MAX_DURATION_MS,
  THROW_PHYSICS_SUBSTEP_MS,
  THROW_SETTLEMENT_SAMPLE_MS,
} from '../../src/games/shantou-jiaobei/physics/throwRuntime.ts';
import { createThrowSetup } from '../../src/games/shantou-jiaobei/physics/throwSetup.ts';

export interface SeededPieceReport {
  finalPosition: { x: number; y: number; z: number };
  finalUpDot: number;
  firstImpactMs: number;
  assistCount: number;
  finalLinearSpeed: number;
  finalAngularSpeed: number;
  maximumPenetration: number;
  finalContactGap: number;
}

export interface SeededThrowReport {
  seed: number;
  attemptCount: 1 | 2;
  retryReasons: string[];
  retrySnapshots: SeededRetrySnapshot[];
  settledMs: number;
  maxAssistPerPiecePerAttempt: number;
  pieces: [SeededPieceReport, SeededPieceReport];
  result: 'sheng' | 'xiao' | 'yin';
  attemptTraces?: SeededAttemptTrace[];
}

export interface SeededAttemptTracePiece {
  landed: boolean;
  upDot: number;
  linearSpeed: number;
  angularSpeed: number;
  rollSpeed: number;
  assistCount: number;
  edgeChecks: number;
  assistUsed: boolean;
}

export interface SeededAttemptTraceSample {
  elapsedMs: number;
  action: string;
  pieces: [SeededAttemptTracePiece, SeededAttemptTracePiece];
}

export interface SeededAttemptTrace {
  attempt: 1 | 2;
  reason: string;
  samples: SeededAttemptTraceSample[];
}

export interface SeededRetrySnapshot {
  attempt: 1 | 2;
  reason: string;
  elapsedMs: number;
  landed: boolean[];
  upDots: number[];
  linearSpeeds: number[];
  angularSpeeds: number[];
  assistCounts: number[];
  edgeChecks: number[];
  assistUsed: boolean[];
}

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function getFaceNormalWorld(piece: JiaobeiMesh): Vector3 {
  piece.mesh.computeWorldMatrix(true);
  const localNormal = piece.mesh.metadata.convexLocalNormal as Vector3;
  return Vector3.Normalize(Vector3.TransformNormal(
    localNormal,
    piece.mesh.getWorldMatrix(),
  ));
}

function getMinimumWorldY(piece: JiaobeiMesh): number {
  const positions = piece.mesh.getVerticesData('position');
  if (!positions) throw new Error('Jiaobei visual vertices are unavailable');
  piece.mesh.computeWorldMatrix(true);
  const matrix = piece.mesh.getWorldMatrix().m;
  let minimumY = Infinity;
  for (let offset = 0; offset < positions.length; offset += 3) {
    const worldY = positions[offset] * matrix[1]
      + positions[offset + 1] * matrix[5]
      + positions[offset + 2] * matrix[9]
      + matrix[13];
    minimumY = Math.min(minimumY, worldY);
  }
  return minimumY;
}

function getResult(dots: readonly number[]): 'sheng' | 'xiao' | 'yin' {
  const faces = dots.map(classifyCupFace);
  if (faces.some((face) => face === 'edge')) {
    throw new Error(`Cannot settle edge dots ${dots.join(', ')}`);
  }
  if (faces[0] !== faces[1]) return 'sheng';
  return faces[0] === 'sheng-face' ? 'yin' : 'xiao';
}

export async function runSeededThrows(
  count: number,
  startSeed = 0,
  options: {
    landingLinearDamping?: number;
    landingAngularDamping?: number;
    positiveFaceImpulse?: number;
    negativeFaceImpulse?: number;
    launchAngularVelocityScale?: number;
    clearFaceAngularDamping?: number;
    clearFaceLinearDamping?: number;
    clearFaceBrakeMaxLinearSpeed?: number;
    clearFaceBrakeMaxAngularSpeed?: number;
    clearFaceBrakeReleaseDot?: number;
    captureAttemptTraces?: boolean;
    wakeBeforeAssist?: boolean;
    keepBodiesAwake?: boolean;
  } = {},
): Promise<SeededThrowReport[]> {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  const wasmBytes = readFileSync(new URL(
    '../../node_modules/@babylonjs/havok/lib/esm/HavokPhysics.wasm',
    import.meta.url,
  ));
  const havok = await HavokPhysics({
    wasmBinary: Uint8Array.from(wasmBytes).buffer,
  });
  scene.enablePhysics(new Vector3(0, -19.6, 0), new HavokPlugin(true, havok));

  const ground = MeshBuilder.CreateBox('seeded-ground', {
    width: THROW_GROUND_SIZE,
    height: THROW_GROUND_THICKNESS,
    depth: THROW_GROUND_SIZE,
  }, scene);
  ground.position.y = -THROW_GROUND_THICKNESS / 2;
  ground.computeWorldMatrix(true);
  const groundAggregate = new PhysicsAggregate(
    ground,
    PhysicsShapeType.BOX,
    { mass: 0 },
    scene,
  );
  const reports: SeededThrowReport[] = [];

  try {
    for (let offset = 0; offset < count; offset++) {
      const seed = startSeed + offset;
      const random = seededRandom(Math.imul(seed + 1, 0x9e3779b1));
      const retryReasons: string[] = [];
      const retrySnapshots: SeededRetrySnapshot[] = [];
      const attemptTraces: SeededAttemptTrace[] = [];
      let totalElapsedMs = 0;
      let completed: SeededThrowReport | null = null;
      let maxAssistPerPiecePerAttempt = 0;

      for (let attemptIndex = 0; attemptIndex < 2 && !completed; attemptIndex++) {
        const setups = [createThrowSetup(0, random), createThrowSetup(1, random)];
        const pieces = setups.map((setup, index) => (
          JiaobeiMesh.create(scene, seed * 4 + attemptIndex * 2 + index, setup)
        ));
        const pieceStates = pieces.map(() => (
          createThrowPieceAssistState(random() < 0.5 ? -1 : 1)
        ));
        const landedAt: Array<number | null> = [null, null];
        const assistCounts = [0, 0];
        const faceBrakeActive = [false, false];
        const maximumPenetrations = [0, 0];
        const collisionDisposers: Array<() => void> = [];
        let currentStates = pieceStates;
        let stillChecks = 0;
        let frame = 0;
        let attemptElapsedMs = 0;
        let retryReason = 'deadline';
        const traceSamples: SeededAttemptTraceSample[] = [];

        pieces.forEach((piece, index) => {
          const body = piece.aggregate.body;
          if (options.keepBodiesAwake !== false) {
            (scene.getPhysicsEngine()!.getPhysicsPlugin() as HavokPlugin).setActivationControl(
              body,
              PhysicsActivationControl.ALWAYS_ACTIVE,
            );
          }
          body.setCollisionCallbackEnabled(true);
          const observable = body.getCollisionObservable();
          const observer = observable.add((event) => {
            if (landedAt[index] !== null) return;
            if (!isGroundCollision(event.type, event.collidedAgainst, groundAggregate.body)) return;
            landedAt[index] = frame / 60 * 1000;
            body.setLinearDamping(
              options.landingLinearDamping ?? THROW_LANDING_LINEAR_DAMPING,
            );
            body.setAngularDamping(
              options.landingAngularDamping ?? THROW_LANDING_ANGULAR_DAMPING,
            );
          });
          collisionDisposers.push(() => {
            observable.remove(observer);
            body.setCollisionCallbackEnabled(false);
          });
          body.setLinearVelocity(new Vector3(
            setups[index].velocity.x,
            setups[index].velocity.y,
            setups[index].velocity.z,
          ));
          body.setAngularVelocity(new Vector3(
            setups[index].angularVelocity.x * (options.launchAngularVelocityScale ?? 1),
            setups[index].angularVelocity.y * (options.launchAngularVelocityScale ?? 1),
            setups[index].angularVelocity.z * (options.launchAngularVelocityScale ?? 1),
          ));
        });

        try {
          for (frame = 1; frame <= THROW_MAX_DURATION_MS / 1000 * 60; frame++) {
            const substeps = Math.round((1000 / 60) / THROW_PHYSICS_SUBSTEP_MS);
            for (let substep = 0; substep < substeps; substep++) {
              scene.getPhysicsEngine()!._step(THROW_PHYSICS_SUBSTEP_MS / 1000);
            }
            attemptElapsedMs = frame / 60 * 1000;
            const sampleEveryFrames = Math.max(
              1,
              Math.round(THROW_SETTLEMENT_SAMPLE_MS / (1000 / 60)),
            );
            if (frame % sampleEveryFrames !== 0) continue;

            pieces.forEach((piece, index) => {
              if (landedAt[index] === null) return;
              maximumPenetrations[index] = Math.max(
                maximumPenetrations[index],
                Math.max(0, -getMinimumWorldY(piece)),
              );
            });

            const bodySamples = pieces.map((piece) => {
              const body = piece.aggregate.body;
              const linearVelocity = body.getLinearVelocity();
              const angularVelocity = body.getAngularVelocity();
              const faceNormalWorld = getFaceNormalWorld(piece);
              const upDot = Vector3.Dot(faceNormalWorld, Vector3.Up());
              const roll = measureEdgeRoll(faceNormalWorld, angularVelocity);
              return {
                body,
                faceNormalWorld,
                upDot,
                angularVelocity,
                sample: {
                  position: piece.mesh.position,
                  linearSpeed: linearVelocity.length(),
                  angularSpeed: angularVelocity.length(),
                  rollSpeed: roll?.rollSpeed ?? 0,
                },
              };
            });
            bodySamples.forEach((bodySample, index) => {
              const defaultBrake = shouldApplyFaceContactBraking(
                landedAt[index] !== null,
                bodySample.upDot,
                bodySample.sample,
                faceBrakeActive[index],
              );
              const configuredSpeedBounded = options.clearFaceBrakeMaxLinearSpeed !== undefined
                && bodySample.sample.linearSpeed <= options.clearFaceBrakeMaxLinearSpeed
                && bodySample.sample.angularSpeed <= (
                  options.clearFaceBrakeMaxAngularSpeed ?? 3
                );
              const shouldBrake = defaultBrake || (
                landedAt[index] !== null
                && classifyCupFace(bodySample.upDot) !== 'edge'
                && configuredSpeedBounded
              ) || (
                faceBrakeActive[index]
                && landedAt[index] !== null
                && options.clearFaceBrakeReleaseDot !== undefined
                && Math.abs(bodySample.upDot) >= options.clearFaceBrakeReleaseDot
                && configuredSpeedBounded
              );
              if (faceBrakeActive[index] === shouldBrake) return;
              faceBrakeActive[index] = shouldBrake;
              bodySample.body.setLinearDamping(
                shouldBrake
                  ? options.clearFaceLinearDamping ?? THROW_FACE_CONTACT_LINEAR_DAMPING
                  : options.landingLinearDamping ?? THROW_LANDING_LINEAR_DAMPING,
              );
              bodySample.body.setAngularDamping(
                shouldBrake
                  ? options.clearFaceAngularDamping ?? THROW_FACE_CONTACT_ANGULAR_DAMPING
                  : options.landingAngularDamping ?? THROW_LANDING_ANGULAR_DAMPING,
              );
            });
            const step = stepThrowSettlement({
              samples: bodySamples.map(({ sample }) => sample),
              landed: landedAt.map((time) => time !== null),
              faceUpDots: bodySamples.map(({ upDot }) => upDot),
              pieceStates: currentStates,
              stillChecks,
              elapsedMs: attemptElapsedMs,
              pageHidden: false,
            });
            currentStates = step.pieceStates;
            stillChecks = step.stillChecks;
            if (options.captureAttemptTraces) {
              traceSamples.push({
                elapsedMs: attemptElapsedMs,
                action: step.action.type === 'retry'
                  ? `retry:${step.action.reason}`
                  : step.action.type,
                pieces: bodySamples.map((bodySample, index) => ({
                  landed: landedAt[index] !== null,
                  upDot: bodySample.upDot,
                  linearSpeed: bodySample.sample.linearSpeed,
                  angularSpeed: bodySample.sample.angularSpeed,
                  rollSpeed: bodySample.sample.rollSpeed,
                  assistCount: assistCounts[index],
                  edgeChecks: currentStates[index].edgeChecks,
                  assistUsed: currentStates[index].assistUsed,
                })) as [SeededAttemptTracePiece, SeededAttemptTracePiece],
              });
            }

            if (step.action.type === 'tip') {
              const plans = step.action.pieceIndices.map((pieceIndex) => {
                const sample = bodySamples[pieceIndex];
                const state = currentStates[pieceIndex];
                const plan = createEdgeAssistImpulse({
                  faceNormalWorld: sample.faceNormalWorld,
                  upDot: sample.upDot,
                  angularVelocityWorld: sample.angularVelocity,
                  lastRollSign: state.lastRollSign,
                  fallbackSign: state.fallbackSign,
                });
                if (!plan) return null;
                const calibratedMagnitude = plan.rollSign > 0
                  ? options.positiveFaceImpulse ?? POSITIVE_FACE_EDGE_IMPULSE
                  : options.negativeFaceImpulse ?? NEGATIVE_FACE_EDGE_IMPULSE;
                return {
                  pieceIndex,
                  body: sample.body,
                  impulse: plan.impulse.scale(calibratedMagnitude / plan.magnitude),
                };
              });
              if (plans.some((plan) => plan === null)) {
                retryReason = 'invalid-axis';
                break;
              }
              plans.forEach((plan) => {
                if (options.wakeBeforeAssist) {
                  (scene.getPhysicsEngine()!.getPhysicsPlugin() as HavokPlugin).setActivationControl(
                    plan!.body,
                    PhysicsActivationControl.ALWAYS_ACTIVE,
                  );
                }
                plan!.body.applyAngularImpulse(plan!.impulse);
                assistCounts[plan!.pieceIndex]++;
                maxAssistPerPiecePerAttempt = Math.max(
                  maxAssistPerPiecePerAttempt,
                  assistCounts[plan!.pieceIndex],
                );
              });
              continue;
            }

            if (step.action.type === 'retry') {
              retryReason = step.action.reason;
              retrySnapshots.push({
                attempt: (attemptIndex + 1) as 1 | 2,
                reason: retryReason,
                elapsedMs: attemptElapsedMs,
                landed: landedAt.map((time) => time !== null),
                upDots: bodySamples.map(({ upDot }) => upDot),
                linearSpeeds: bodySamples.map(({ sample }) => sample.linearSpeed),
                angularSpeeds: bodySamples.map(({ sample }) => sample.angularSpeed),
                assistCounts: [...assistCounts],
                edgeChecks: currentStates.map((state) => state.edgeChecks),
                assistUsed: currentStates.map((state) => state.assistUsed),
              });
              break;
            }
            if (step.action.type !== 'settled') continue;

            const finalDots = bodySamples.map(({ upDot }) => upDot);
            const finalGaps = pieces.map((piece) => Math.max(0, getMinimumWorldY(piece)));
            pieces.forEach((piece) => {
              piece.aggregate.body.setLinearVelocity(Vector3.Zero());
              piece.aggregate.body.setAngularVelocity(Vector3.Zero());
            });
            completed = {
              seed,
              attemptCount: (attemptIndex + 1) as 1 | 2,
              retryReasons: [...retryReasons],
              retrySnapshots: [...retrySnapshots],
              settledMs: totalElapsedMs + attemptElapsedMs,
              maxAssistPerPiecePerAttempt,
              pieces: pieces.map((piece, index) => ({
                finalPosition: {
                  x: piece.mesh.position.x,
                  y: piece.mesh.position.y,
                  z: piece.mesh.position.z,
                },
                finalUpDot: finalDots[index],
                firstImpactMs: landedAt[index] ?? Infinity,
                assistCount: assistCounts[index],
                finalLinearSpeed: bodySamples[index].sample.linearSpeed,
                finalAngularSpeed: bodySamples[index].sample.angularSpeed,
                maximumPenetration: maximumPenetrations[index],
                finalContactGap: finalGaps[index],
              })) as [SeededPieceReport, SeededPieceReport],
              result: getResult(finalDots),
              attemptTraces: options.captureAttemptTraces ? [] : undefined,
            };
            break;
          }
        } finally {
          collisionDisposers.forEach((dispose) => dispose());
          pieces.forEach((piece) => piece.dispose());
        }

        if (options.captureAttemptTraces) {
          attemptTraces.push({
            attempt: (attemptIndex + 1) as 1 | 2,
            reason: completed ? 'settled' : retryReason,
            samples: traceSamples,
          });
          if (completed) completed.attemptTraces = [...attemptTraces];
        }

        totalElapsedMs += attemptElapsedMs;
        if (!completed) retryReasons.push(retryReason);
      }

      if (!completed) {
        throw new Error(
          `seed ${seed} failed both attempts: ${retryReasons.join(', ')}`,
        );
      }
      reports.push(completed);
    }
    return reports;
  } finally {
    groundAggregate.dispose();
    ground.dispose();
    scene.dispose();
    engine.dispose();
  }
}
