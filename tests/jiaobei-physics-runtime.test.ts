import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import HavokPhysics from '@babylonjs/havok';
import {
  HavokPlugin,
  Mesh,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsEventType,
  PhysicsShapeType,
  Scene,
  Vector3,
} from '@babylonjs/core';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import type { PhysicsBody } from '@babylonjs/core/Physics/v2/physicsBody.js';
import '@babylonjs/core/Physics/physicsEngineComponent.js';
import { JiaobeiMesh } from '../src/games/shantou-jiaobei/physics/JiaobeiMesh.ts';
import {
  classifyCupFace,
  createThrowPieceAssistState,
  decideThrowProgress,
  isGroundCollision,
  isRenderWatchdogExpired,
  isThrowMoving,
  isThrowOutOfBounds,
  shouldApplyFaceContactBraking,
  stepThrowSettlement,
  THROW_FACE_CONTACT_ANGULAR_DAMPING,
  THROW_FACE_CONTACT_LINEAR_DAMPING,
  THROW_FACE_CONTACT_MAX_ANGULAR_SPEED,
  THROW_FACE_CONTACT_MAX_LINEAR_SPEED,
  THROW_FACE_CONTACT_RELEASE_DOT_THRESHOLD,
  THROW_FACE_DOT_THRESHOLD,
  THROW_MAX_DURATION_MS,
  THROW_GROUND_SIZE,
  THROW_GROUND_THICKNESS,
  THROW_LANDING_ANGULAR_DAMPING,
  THROW_LANDING_LINEAR_DAMPING,
  THROW_SETTLEMENT_SAMPLE_MS,
  THROW_STILL_CHECKS,
} from '../src/games/shantou-jiaobei/physics/throwRuntime.ts';
import { createThrowSetup } from '../src/games/shantou-jiaobei/physics/throwSetup.ts';
import { runSeededThrows } from './helpers/jiaobeiPhysicsHarness.ts';

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

test('throw runtime defines a safe table and recovery boundary', () => {
  assert.equal(THROW_GROUND_SIZE, 14);
  assert.equal(THROW_GROUND_THICKNESS, 0.4);
  assert.equal(isThrowOutOfBounds({ x: 0, y: 0, z: 0 }), false);
  assert.equal(isThrowOutOfBounds({ x: 7, y: -0.5, z: -7 }), false);
  assert.equal(isThrowOutOfBounds({ x: 7.001, y: 0, z: 0 }), true);
  assert.equal(isThrowOutOfBounds({ x: 0, y: 0, z: -7.001 }), true);
  assert.equal(isThrowOutOfBounds({ x: 0, y: -0.501, z: 0 }), true);
});

test('cup faces use a three-state classifier so an edge cannot become a result', () => {
  assert.equal(THROW_FACE_DOT_THRESHOLD, 0.9);
  assert.equal(classifyCupFace(0.9), 'sheng-face');
  assert.equal(classifyCupFace(0.89), 'edge');
  assert.equal(classifyCupFace(-0.89), 'edge');
  assert.equal(classifyCupFace(-0.9), 'yin-face');
  assert.equal(classifyCupFace(0), 'edge');
});

test('settlement confirms a stable face over three rendered frames', () => {
  assert.equal(THROW_SETTLEMENT_SAMPLE_MS, 1000 / 60);
  assert.equal(THROW_STILL_CHECKS, 3);
});

test('face contact braking only engages for a clear landed face at bounded speed', () => {
  assert.equal(THROW_FACE_CONTACT_LINEAR_DAMPING, 6);
  assert.equal(THROW_FACE_CONTACT_ANGULAR_DAMPING, 12);
  assert.equal(THROW_FACE_CONTACT_MAX_LINEAR_SPEED, 1.2);
  assert.equal(THROW_FACE_CONTACT_MAX_ANGULAR_SPEED, 3);
  assert.equal(THROW_FACE_CONTACT_RELEASE_DOT_THRESHOLD, 0.895);
  const sample = {
    position: { x: 0, y: 0.2, z: 0 },
    linearSpeed: 1.2,
    angularSpeed: 3,
    rollSpeed: 1,
  };

  assert.equal(shouldApplyFaceContactBraking(true, 0.95, sample), true);
  assert.equal(shouldApplyFaceContactBraking(false, 0.95, sample), false);
  assert.equal(shouldApplyFaceContactBraking(true, 0.89, sample), false);
  assert.equal(shouldApplyFaceContactBraking(true, 0.895, sample, true), true);
  assert.equal(shouldApplyFaceContactBraking(true, 0.895, sample, false), false);
  assert.equal(shouldApplyFaceContactBraking(true, 0.894, sample, true), false);
  assert.equal(shouldApplyFaceContactBraking(true, 0.95, {
    ...sample,
    linearSpeed: 1.201,
  }), false);
  assert.equal(shouldApplyFaceContactBraking(true, 0.95, {
    ...sample,
    angularSpeed: 3.001,
  }), false);
});

const restingAssistSamples = [
  { position: { x: -1, y: 0.2, z: 0 }, linearSpeed: 0, angularSpeed: 0, rollSpeed: 0 },
  { position: { x: 1, y: 0.2, z: 0 }, linearSpeed: 0, angularSpeed: 0, rollSpeed: 0 },
];

test('three low-speed edge samples request one explicit tip action', () => {
  let states = [createThrowPieceAssistState(1), createThrowPieceAssistState(-1)];
  let stillChecks = 0;
  let step;

  for (let sample = 0; sample < 3; sample++) {
    step = stepThrowSettlement({
      samples: restingAssistSamples,
      landed: [true, true],
      faceUpDots: [0.2, 0.95],
      pieceStates: states,
      stillChecks,
      elapsedMs: 1200 + sample * 33,
      pageHidden: false,
    });
    states = step.pieceStates;
    stillChecks = step.stillChecks;
  }

  assert.deepEqual(step!.action, { type: 'tip', pieceIndices: [0] });
  assert.equal(step!.pieceStates[0].assistUsed, true);
  assert.equal(step!.pieceStates[0].edgeChecks, 0);
  assert.equal(step!.stillChecks, 0);
});

test('a second edge stall after assist requests retry', () => {
  const assisted = {
    ...createThrowPieceAssistState(1),
    edgeChecks: 2,
    assistUsed: true,
  };
  const step = stepThrowSettlement({
    samples: restingAssistSamples,
    landed: [true, true],
    faceUpDots: [0.1, -0.95],
    pieceStates: [assisted, createThrowPieceAssistState(-1)],
    stillChecks: 0,
    elapsedMs: 1800,
    pageHidden: false,
  });

  assert.deepEqual(step.action, { type: 'retry', reason: 'edge-after-assist' });
});

test('hidden settlement sampling is a strict no-op', () => {
  const states = [
    { ...createThrowPieceAssistState(1), edgeChecks: 2 },
    createThrowPieceAssistState(-1),
  ];
  const step = stepThrowSettlement({
    samples: restingAssistSamples,
    landed: [true, true],
    faceUpDots: [0.1, 0.95],
    pieceStates: states,
    stillChecks: 4,
    elapsedMs: THROW_MAX_DURATION_MS,
    pageHidden: true,
  });

  assert.deepEqual(step.action, { type: 'continue' });
  assert.deepEqual(step.pieceStates, states);
  assert.equal(step.stillChecks, 4);
});

test('late edge stalls retry without applying an impulse', () => {
  const step = stepThrowSettlement({
    samples: restingAssistSamples,
    landed: [true, true],
    faceUpDots: [0.1, 0.95],
    pieceStates: [
      { ...createThrowPieceAssistState(1), edgeChecks: 2 },
      createThrowPieceAssistState(-1),
    ],
    stillChecks: 0,
    elapsedMs: THROW_MAX_DURATION_MS - 699,
    pageHidden: false,
  });

  assert.deepEqual(step.action, { type: 'retry', reason: 'late-edge-stall' });
});

test('only a started collision against the ground counts as landing', () => {
  const ground = {} as PhysicsBody;
  const other = {} as PhysicsBody;

  assert.equal(isGroundCollision(PhysicsEventType.COLLISION_STARTED, ground, ground), true);
  assert.equal(isGroundCollision(PhysicsEventType.COLLISION_CONTINUED, ground, ground), false);
  assert.equal(isGroundCollision(PhysicsEventType.COLLISION_STARTED, other, ground), false);
});

test('normal settlement requires both cups to contact the table', () => {
  const resting = [
    { position: { x: -1, y: 0.2, z: 0 }, linearSpeed: 0, angularSpeed: 0 },
    { position: { x: 1, y: 0.2, z: 0 }, linearSpeed: 0, angularSpeed: 0 },
  ];

  assert.equal(isThrowMoving(resting), false);
  assert.equal(decideThrowProgress(resting, [true, false], 20, 2000), 'continue');
  assert.equal(decideThrowProgress(resting, [true, true], 20, 2000), 'settled');
});

test('a stable edge orientation requests a fresh physical throw instead of a result', () => {
  const resting = [
    { position: { x: -1, y: 0.2, z: 0 }, linearSpeed: 0, angularSpeed: 0 },
    { position: { x: 1, y: 0.2, z: 0 }, linearSpeed: 0, angularSpeed: 0 },
  ];

  assert.equal(
    decideThrowProgress(resting, [true, true], 20, 2000, [0, 0.92]),
    'retry',
  );
  assert.equal(
    decideThrowProgress(resting, [true, true], 0, THROW_MAX_DURATION_MS, [0, -0.93]),
    'retry',
  );
});

test('the safety deadline settles landed cups and retries invalid throws', () => {
  const moving = [
    { position: { x: -1, y: 0.3, z: 0 }, linearSpeed: 0.4, angularSpeed: 0.8 },
    { position: { x: 1, y: 0.3, z: 0 }, linearSpeed: 0.3, angularSpeed: 0.7 },
  ];
  const escaped = moving.map((sample, index) => (
    index === 0 ? { ...sample, position: { x: 8, y: 0.3, z: 0 } } : sample
  ));

  assert.equal(decideThrowProgress(moving, [true, true], 0, THROW_MAX_DURATION_MS), 'settled');
  assert.equal(decideThrowProgress(moving, [true, false], 0, THROW_MAX_DURATION_MS), 'retry');
  assert.equal(decideThrowProgress(escaped, [true, true], 0, 500), 'retry');
});

test('the render watchdog ignores short stalls and hidden tabs', () => {
  assert.equal(isRenderWatchdogExpired(0, 4000, false), false);
  assert.equal(isRenderWatchdogExpired(0, 5001, false), true);
  assert.equal(isRenderWatchdogExpired(0, 12000, true), false);
});

test('the regression launch remains on the physical table and contacts it promptly', async () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  const wasmBytes = readFileSync(new URL(
    '../node_modules/@babylonjs/havok/lib/esm/HavokPhysics.wasm',
    import.meta.url,
  ));
  const wasmBinary = Uint8Array.from(wasmBytes).buffer;
  const havok = await HavokPhysics({ wasmBinary });
  scene.enablePhysics(new Vector3(0, -19.6, 0), new HavokPlugin(true, havok));

  const ground = MeshBuilder.CreateBox('ground', {
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

  const random = seededRandom(6);
  const setups = [createThrowSetup(0, random), createThrowSetup(1, random)];
  const pieces = await Promise.all(setups.map((setup, index) => (
    JiaobeiMesh.create(scene, index, setup)
  )));
  const landedAt: Array<number | null> = [null, null];

  pieces.forEach((piece, index) => {
    const setup = setups[index];
    const body = piece.aggregate.body;
    body.setCollisionCallbackEnabled(true);
    body.getCollisionObservable().add((event) => {
      if (landedAt[index] !== null) return;
      if (!isGroundCollision(event.type, event.collidedAgainst, groundAggregate.body)) return;
      landedAt[index] = frame / 60;
    });
    body.setLinearVelocity(new Vector3(
      setup.velocity.x,
      setup.velocity.y,
      setup.velocity.z,
    ));
    body.setAngularVelocity(new Vector3(
      setup.angularVelocity.x,
      setup.angularVelocity.y,
      setup.angularVelocity.z,
    ));
  });

  let frame = 0;
  let minimumY = Infinity;
  let wentOutOfBounds = false;
  for (frame = 1; frame <= 360; frame++) {
    scene.getPhysicsEngine()!._step(1 / 60);
    for (const piece of pieces) {
      minimumY = Math.min(minimumY, piece.mesh.position.y);
      wentOutOfBounds ||= isThrowOutOfBounds(piece.mesh.position);
    }
  }

  assert.equal(landedAt.every((time) => time !== null), true);
  assert.ok(Math.max(...landedAt as number[]) <= 1.2);
  assert.equal(wentOutOfBounds, false);
  assert.ok(minimumY > -0.5);
  assert.ok(pieces.every((piece) => piece.mesh.position.y > -0.5));

  pieces.forEach((piece) => piece.dispose());
  groundAggregate.dispose();
  ground.dispose();
  scene.dispose();
  engine.dispose();
});

test('physics uses the visible mesh as the owned convex-hull source', async () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  const wasmBytes = readFileSync(new URL(
    '../node_modules/@babylonjs/havok/lib/esm/HavokPhysics.wasm',
    import.meta.url,
  ));
  const havok = await HavokPhysics({ wasmBinary: Uint8Array.from(wasmBytes).buffer });
  scene.enablePhysics(new Vector3(0, -19.6, 0), new HavokPlugin(true, havok));
  const piece = JiaobeiMesh.create(scene, 0);
  try {
    assert.ok(
      piece.aggregate.type === PhysicsShapeType.CONVEX_HULL,
      'aggregate must be constructed directly from CONVEX_HULL',
    );
    assert.equal(piece.aggregate.shape.type, PhysicsShapeType.CONVEX_HULL);
    assert.equal(piece.aggregate.transformNode, piece.mesh);

    const visible = piece.mesh.getVerticesData('position')!;
    const physicsSource = (piece.aggregate.transformNode as Mesh).getVerticesData('position')!;
    for (let index = 0; index < 4096; index++) {
      const y = 1 - (2 * (index + 0.5)) / 4096;
      const radius = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = index * Math.PI * (3 - Math.sqrt(5));
      const direction = {
        x: Math.cos(theta) * radius,
        y,
        z: Math.sin(theta) * radius,
      };
      const support = (positions: ArrayLike<number>) => {
        let value = -Infinity;
        for (let offset = 0; offset < positions.length; offset += 3) {
          value = Math.max(
            value,
            positions[offset] * direction.x
              + positions[offset + 1] * direction.y
              + positions[offset + 2] * direction.z,
          );
        }
        return value;
      };
      assert.ok(Math.abs(support(visible) - support(physicsSource)) <= 1e-4);
    }
  } finally {
    piece.dispose();
    scene.dispose();
    engine.dispose();
  }
});

test('exact hull settles 512 seeded throws with clear faces and bounded contact error', async () => {
  const reports = await runSeededThrows(512);

  for (const report of reports) {
    assert.ok(report.pieces.every((piece) => Math.abs(piece.finalUpDot) >= 0.9));
    assert.ok(report.pieces.every((piece) => piece.firstImpactMs <= 1200));
    assert.ok(report.maxAssistPerPiecePerAttempt <= 1);
    assert.ok(report.pieces.every((piece) => piece.maximumPenetration <= 0.01));
    assert.ok(report.pieces.every((piece) => piece.finalContactGap <= 0.01));
  }
});

test('1024 seeded throws meet timing retry distribution and fairness gates', async () => {
  const reports = [
    ...await runSeededThrows(512, 0),
    ...await runSeededThrows(512, 512),
  ];
  const times = reports.map((report) => report.settledMs).sort((a, b) => a - b);
  const p95 = times[Math.ceil(times.length * 0.95) - 1];
  const retries = reports.filter((report) => report.attemptCount === 2).length;
  const dots = reports.flatMap((report) => (
    report.pieces.map((piece) => piece.finalUpDot)
  ));
  const positiveRatio = dots.filter((dot) => dot > 0).length / dots.length;
  const results = new Set(reports.map((report) => report.result));

  assert.ok(p95 <= 2600, `p95 ${p95}ms`);
  assert.ok(times.at(-1)! <= 3200, `max ${times.at(-1)}ms`);
  assert.ok(retries / reports.length <= 0.02, `retry ratio ${retries / reports.length}`);
  assert.ok(
    positiveRatio >= 0.35 && positiveRatio <= 0.65,
    `positive ratio ${positiveRatio}`,
  );
  assert.deepEqual([...results].sort(), ['sheng', 'xiao', 'yin']);
});
