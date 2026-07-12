# Jiaobei Exact Hull and Edge Assist Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make both procedural jiaobei pieces fall, collide, roll, and settle as independent Havok bodies on an exact visual convex hull, while resolving genuine low-speed edge stalls with one physical angular impulse per piece.

**Architecture:** `throwRuntime.ts` remains the pure settlement state machine, a new `edgeAssist.ts` owns axis/direction/impulse math, and `JiaobeiThrower.ts` only samples Babylon bodies and executes returned actions. `JiaobeiMesh.ts` gives `PhysicsAggregate` the visible mesh directly as a `CONVEX_HULL`; a query-gated diagnostics store exposes read-only E2E evidence without affecting normal gameplay.

**Tech Stack:** TypeScript 5.7, Babylon.js 7.54, Havok 1.3, Node test runner, Next.js 15, Chrome DevTools Protocol.

## Global Constraints

- Use the visible procedural mesh itself as the Havok convex-hull source; no collision proxy, capsule, sphere, container, vertex clamp, scripted transform, or custom center of mass.
- Preserve `mass: 0.18`, `friction: 0.78`, `restitution: 0.12`, gravity, launch setup, three-result meanings, result copy, camera lifecycle, and mobile layout.
- A face is clear only at `upDot >= 0.90` or `upDot <= -0.90`; every intermediate value is `edge` and cannot reach `judgeCup()`.
- Edge assist is permitted only after both pieces contacted the ground and the same piece remained edge-oriented below `0.3` linear speed and `0.75` angular speed for three 33ms samples.
- Each piece receives at most one assist per attempt. A second edge stall, an invalid axis, or less than 700ms of remaining active physics time returns `retry` immediately.
- The positive-face candidate impulse is `0.24 N*m*s`; the negative-face candidate is `0.38 N*m*s`. Lock or adjust them only from the 1024-seed report, not from a single visual run.
- Hidden pages perform no settlement sampling, counter updates, assist, retry, or result decision. Active physics elapsed time advances only from rendered Havok steps.
- `throwOnce()` keeps at most two attempts. First-attempt retry rate must be at most 2%; complete throw failures must be zero.
- Add no dependency and do not modify camera, gesture, result, or page-layout source files.
- This workspace is not a Git repository. Replace commit steps with file-level checkpoints that record changed paths and fresh command output.
- Final verification commands are `npm test`, `npx tsc --noEmit`, and `npm run build`.

---

### Task 1: Pure Settlement State Machine With Explicit Tip Actions

**Files:**
- Modify: `src/games/shantou-jiaobei/physics/throwRuntime.ts`
- Modify: `tests/jiaobei-physics-runtime.test.ts`

**Interfaces:**
- Consumes: body samples, per-piece landed flags, face dots, roll speeds, per-attempt assist state, active physics elapsed time, and visibility.
- Produces: `stepThrowSettlement(input): ThrowSettlementStep` where `action.type` is exactly `continue | tip | settled | retry`.
- Produces: `ThrowPieceAssistState` with `edgeChecks`, `assistUsed`, `lastRollSign`, and immutable `fallbackSign`.

- [ ] **Step 1: Replace the old threshold and retry-only edge expectations with failing state-machine tests**

Add these imports and tests to `tests/jiaobei-physics-runtime.test.ts`:

```ts
import {
  classifyCupFace,
  createThrowPieceAssistState,
  stepThrowSettlement,
  THROW_FACE_DOT_THRESHOLD,
  THROW_MAX_DURATION_MS,
} from '../src/games/shantou-jiaobei/physics/throwRuntime.ts';

const restingSamples = [
  { position: { x: -1, y: 0.2, z: 0 }, linearSpeed: 0, angularSpeed: 0, rollSpeed: 0 },
  { position: { x: 1, y: 0.2, z: 0 }, linearSpeed: 0, angularSpeed: 0, rollSpeed: 0 },
];

test('only dots at or beyond 0.90 are clear faces', () => {
  assert.equal(THROW_FACE_DOT_THRESHOLD, 0.90);
  assert.equal(classifyCupFace(0.90), 'sheng-face');
  assert.equal(classifyCupFace(0.89), 'edge');
  assert.equal(classifyCupFace(-0.89), 'edge');
  assert.equal(classifyCupFace(-0.90), 'yin-face');
});

test('three low-speed edge samples request one explicit tip action', () => {
  let states = [createThrowPieceAssistState(1), createThrowPieceAssistState(-1)];
  let stillChecks = 0;
  let step;
  for (let sample = 0; sample < 3; sample++) {
    step = stepThrowSettlement({
      samples: restingSamples,
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
    samples: restingSamples,
    landed: [true, true],
    faceUpDots: [0.1, -0.95],
    pieceStates: [assisted, createThrowPieceAssistState(-1)],
    stillChecks: 0,
    elapsedMs: 1800,
    pageHidden: false,
  });
  assert.deepEqual(step.action, { type: 'retry', reason: 'edge-after-assist' });
});

test('hidden sampling is a strict no-op', () => {
  const states = [
    { ...createThrowPieceAssistState(1), edgeChecks: 2 },
    createThrowPieceAssistState(-1),
  ];
  const step = stepThrowSettlement({
    samples: restingSamples,
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
    samples: restingSamples,
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
```

- [ ] **Step 2: Run the focused test and capture RED**

Run:

```bash
node --experimental-strip-types --test tests/jiaobei-physics-runtime.test.ts
```

Expected: FAIL because the threshold is still `0.75`, `tip` does not exist, and hidden sampling is not represented in the pure decision API.

- [ ] **Step 3: Implement the explicit state transition in `throwRuntime.ts`**

Replace `ThrowProgress`/`decideThrowProgress` with these public contracts and logic while retaining bounds, watchdog, collision, and physics-delta helpers:

```ts
export const THROW_FACE_DOT_THRESHOLD = 0.90;
export const THROW_EDGE_STALL_CHECKS = 3;
export const THROW_ASSIST_ROLL_MIN_SPEED = 0.05;
export const THROW_ASSIST_MIN_REMAINING_MS = 700;

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
  | { type: 'retry'; reason: 'out-of-bounds' | 'deadline' | 'late-edge-stall' | 'edge-after-assist' };

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

export function createThrowPieceAssistState(
  fallbackSign: Exclude<RollSign, 0>,
): ThrowPieceAssistState {
  return { edgeChecks: 0, assistUsed: false, lastRollSign: 0, fallbackSign };
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
  const moving = isThrowMoving(input.samples);
  const allFacesClear = input.faceUpDots.length === input.samples.length
    && input.faceUpDots.every((dot) => classifyCupFace(dot) !== 'edge');
  const nextStillChecks = allLanded && !moving ? input.stillChecks + 1 : 0;
  const pieceStates = input.pieceStates.map((state, index) => {
    const sample = input.samples[index];
    const edgeStalled = allLanded
      && classifyCupFace(input.faceUpDots[index]) === 'edge'
      && sample.linearSpeed <= THROW_LINEAR_SETTLE_SPEED
      && sample.angularSpeed <= THROW_ANGULAR_SETTLE_SPEED;
    const rollSign: RollSign = Math.abs(sample.rollSpeed) > THROW_ASSIST_ROLL_MIN_SPEED
      ? (sample.rollSpeed > 0 ? 1 : -1)
      : state.lastRollSign;
    return {
      ...state,
      edgeChecks: edgeStalled ? state.edgeChecks + 1 : 0,
      lastRollSign: rollSign,
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
      return { action: { type: 'retry', reason: 'late-edge-stall' }, pieceStates, stillChecks: 0 };
    }
    if (stalled.some(({ state }) => state.assistUsed)) {
      return { action: { type: 'retry', reason: 'edge-after-assist' }, pieceStates, stillChecks: 0 };
    }
    const pieceIndices = stalled.map(({ index }) => index);
    const assistedStates = pieceStates.map((state, index) => (
      pieceIndices.includes(index)
        ? { ...state, assistUsed: true, edgeChecks: 0 }
        : state
    ));
    return { action: { type: 'tip', pieceIndices }, pieceStates: assistedStates, stillChecks: 0 };
  }
  if (!allLanded || nextStillChecks < THROW_STILL_CHECKS) {
    return { action: { type: 'continue' }, pieceStates, stillChecks: nextStillChecks };
  }
  return {
    action: allFacesClear ? { type: 'settled' } : { type: 'continue' },
    pieceStates,
    stillChecks: nextStillChecks,
  };
}
```

- [ ] **Step 4: Run the focused test and capture GREEN**

Run the same focused command. Expected: all pure state, collision, watchdog, and existing Havok regression tests pass after their call sites are migrated from `decideThrowProgress` to `stepThrowSettlement`.

- [ ] **Step 5: Record the file checkpoint**

Record `throwRuntime.ts`, `jiaobei-physics-runtime.test.ts`, the RED failure, and the GREEN output in the task notes before touching mesh construction.

---

### Task 2: Exact Visual Convex Hull and Natural Mass Properties

**Files:**
- Modify: `src/games/shantou-jiaobei/physics/JiaobeiMesh.ts`
- Modify: `tests/jiaobei-mesh.test.ts`
- Modify: `tests/jiaobei-physics-runtime.test.ts`

**Interfaces:**
- Consumes: the sealed mesh returned by `createJiaobeiVisual()`.
- Produces: `PhysicsAggregate(mesh, PhysicsShapeType.CONVEX_HULL, options, scene)` owned by the aggregate.
- Preserves: `JiaobeiMesh.mesh`, `JiaobeiMesh.aggregate`, and existing `dispose()` call sites.

- [ ] **Step 1: Write failing ownership and 4096-direction support tests**

Add a real-Havok test that creates one piece and asserts:

```ts
test('physics uses the visible mesh as the owned convex-hull source', async () => {
  const { engine, scene } = await createPhysicsScene();
  const piece = JiaobeiMesh.create(scene, 0);
  assert.equal(piece.aggregate.type, PhysicsShapeType.CONVEX_HULL);
  assert.equal(piece.aggregate.shape.type, PhysicsShapeType.CONVEX_HULL);
  assert.equal(piece.aggregate.transformNode, piece.mesh);
  assert.equal(piece.aggregate.shape.getNumChildren(), 0);

  const visible = piece.mesh.getVerticesData('position')!;
  const physicsSource = (piece.aggregate.transformNode as Mesh).getVerticesData('position')!;
  for (let index = 0; index < 4096; index++) {
    const y = 1 - (2 * (index + 0.5)) / 4096;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = index * Math.PI * (3 - Math.sqrt(5));
    const direction = { x: Math.cos(theta) * radius, y, z: Math.sin(theta) * radius };
    const support = (positions: readonly number[]) => {
      let value = -Infinity;
      for (let offset = 0; offset < positions.length; offset += 3) {
        value = Math.max(value,
          positions[offset] * direction.x
          + positions[offset + 1] * direction.y
          + positions[offset + 2] * direction.z);
      }
      return value;
    };
    assert.ok(Math.abs(support(visible) - support(physicsSource)) <= 1e-4);
  }

  piece.dispose();
  scene.dispose();
  engine.dispose();
});
```

Also assert the source no longer contains proxy geometry:

```ts
test('jiaobei physics source contains no invisible stabilizer geometry', () => {
  const source = readFileSync(new URL(
    '../src/games/shantou-jiaobei/physics/JiaobeiMesh.ts',
    import.meta.url,
  ), 'utf8');
  assert.doesNotMatch(source, /PhysicsShapeCapsule|PhysicsShapeContainer|COLLISION_CHORD_INSET/);
  assert.doesNotMatch(source, /setMassProperties/);
});
```

- [ ] **Step 2: Run mesh and physics tests and capture RED**

```bash
node --experimental-strip-types --test tests/jiaobei-mesh.test.ts tests/jiaobei-physics-runtime.test.ts
```

Expected: FAIL because the aggregate currently owns a container built from a clamped proxy plus capsule and overrides the center of mass.

- [ ] **Step 3: Replace the proxy/container construction with the exact hull**

Use only these physics imports in `JiaobeiMesh.ts`:

```ts
import {
  Color3,
  Mesh,
  MultiMaterial,
  PBRMaterial,
  PhysicsAggregate,
  PhysicsShapeType,
  Quaternion,
  Scene,
  SubMesh,
  VertexData,
} from '@babylonjs/core';
```

Replace all proxy fields and construction with:

```ts
export class JiaobeiMesh {
  readonly mesh!: Mesh;
  readonly aggregate!: PhysicsAggregate;
  readonly body!: Mesh;

  static create(scene: Scene, index: number, initialPose?: JiaobeiInitialPose): JiaobeiMesh {
    const instance = Object.create(JiaobeiMesh.prototype) as JiaobeiMesh;
    const mesh = createJiaobeiVisual(scene, index, initialPose);
    const aggregate = new PhysicsAggregate(
      mesh,
      PhysicsShapeType.CONVEX_HULL,
      { mass: 0.18, friction: 0.78, restitution: 0.12 },
      scene,
    );
    (instance as any).mesh = mesh;
    (instance as any).body = mesh;
    (instance as any).aggregate = aggregate;
    return instance;
  }

  dispose() {
    this.aggregate.dispose();
    this.mesh.dispose();
  }
}
```

Delete `createJiaobeiCollisionProxy`, all `COLLISION_*` constants, all explicit shape fields, and the custom `setMassProperties` call. Do not alter visual vertices, materials, transforms, or launch setup.

- [ ] **Step 4: Run the focused tests and capture GREEN**

Run the command from Step 2. Expected: support error is at most `1e-4`, the shape has zero children, and all baseline visual/launch tests pass.

- [ ] **Step 5: Record the file checkpoint**

Record both changed files and the exact shape type/ownership assertions. Do not tune impulses in this task.

---

### Task 3: Directional Edge Assist and Thrower Integration

**Files:**
- Create: `src/games/shantou-jiaobei/physics/edgeAssist.ts`
- Create: `tests/jiaobei-edge-assist.test.ts`
- Modify: `src/games/shantou-jiaobei/physics/JiaobeiThrower.ts`
- Modify: `tests/jiaobei-thrower-runtime.test.ts`

**Interfaces:**
- Produces: `measureEdgeRoll(faceNormalWorld, angularVelocityWorld): EdgeRollMeasurement | null`.
- Produces: `createEdgeAssistImpulse(input): EdgeAssistImpulse | null`.
- Consumes: `ThrowAction` and `ThrowPieceAssistState` from `throwRuntime.ts`.
- Executes: `PhysicsBody.applyAngularImpulse(Vector3)` only for indices returned by a `tip` action.

- [ ] **Step 1: Write failing pure impulse tests**

Create `tests/jiaobei-edge-assist.test.ts` with:

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { Vector3 } from '@babylonjs/core';
import {
  createEdgeAssistImpulse,
  measureEdgeRoll,
  NEGATIVE_FACE_EDGE_IMPULSE,
  POSITIVE_FACE_EDGE_IMPULSE,
} from '../src/games/shantou-jiaobei/physics/edgeAssist.ts';

test('the edge axis is faceNormal cross worldUp and remains finite', () => {
  const measurement = measureEdgeRoll(new Vector3(0, 0, 1), new Vector3(2, 0, 0));
  assert.ok(measurement);
  assert.deepEqual(measurement.axis.asArray(), [-1, 0, 0]);
  assert.equal(measurement.rollSpeed, -2);
});

test('recent roll direction is preserved and selects the destination magnitude', () => {
  const positive = createEdgeAssistImpulse({
    faceNormalWorld: new Vector3(0, 0, 1),
    upDot: -0.1,
    angularVelocityWorld: new Vector3(-0.2, 0, 0),
    lastRollSign: 1,
    fallbackSign: -1,
  });
  assert.ok(positive);
  assert.equal(positive.rollSign, 1);
  assert.equal(positive.magnitude, POSITIVE_FACE_EDGE_IMPULSE);

  const negative = createEdgeAssistImpulse({
    faceNormalWorld: new Vector3(0, 0, 1),
    upDot: 0.1,
    angularVelocityWorld: Vector3.Zero(),
    lastRollSign: -1,
    fallbackSign: 1,
  });
  assert.ok(negative);
  assert.equal(negative.rollSign, -1);
  assert.equal(negative.magnitude, NEGATIVE_FACE_EDGE_IMPULSE);
});

test('upDot chooses the nearest face before the random fallback', () => {
  const towardPositive = createEdgeAssistImpulse({
    faceNormalWorld: new Vector3(0, 0, 1),
    upDot: 0.2,
    angularVelocityWorld: Vector3.Zero(),
    lastRollSign: 0,
    fallbackSign: -1,
  });
  assert.equal(towardPositive?.rollSign, 1);

  const neutral = createEdgeAssistImpulse({
    faceNormalWorld: new Vector3(0, 0, 1),
    upDot: 0,
    angularVelocityWorld: Vector3.Zero(),
    lastRollSign: 0,
    fallbackSign: -1,
  });
  assert.equal(neutral?.rollSign, -1);
});

test('parallel or non-finite normals produce no impulse', () => {
  assert.equal(createEdgeAssistImpulse({
    faceNormalWorld: Vector3.Up(),
    upDot: 1,
    angularVelocityWorld: Vector3.Zero(),
    lastRollSign: 0,
    fallbackSign: 1,
  }), null);
});
```

- [ ] **Step 2: Run the new test and capture RED**

```bash
node --experimental-strip-types --test tests/jiaobei-edge-assist.test.ts
```

Expected: FAIL because `edgeAssist.ts` does not exist.

- [ ] **Step 3: Implement the complete impulse math in the new module**

```ts
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

export function createEdgeAssistImpulse(input: EdgeAssistInput): EdgeAssistImpulse | null {
  const measurement = measureEdgeRoll(input.faceNormalWorld, input.angularVelocityWorld);
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
```

- [ ] **Step 4: Add failing Thrower integration tests**

Extend `tests/jiaobei-thrower-runtime.test.ts` with controlled bodies and a captured interval callback. Assert all four contracts:

```ts
test('waitUntilSettled applies one angular impulse only to a tipped piece', async () => {
  const impulses: Vector3[][] = [[], []];
  const { thrower, internals, tick, restore } = createControlledSettlement({
    landed: [true, true],
    dots: [0.2, 0.95],
    impulses,
  });
  try {
    const settlement = internals.waitUntilSettled();
    tick(3);
    assert.equal(impulses[0].length, 1);
    assert.equal(impulses[1].length, 0);
    tick(3);
    assert.equal(await settlement, 'retry');
  } finally {
    restore();
    thrower.dispose();
  }
});

test('hidden interval ticks neither sample bodies nor resolve settlement', async () => {
  const reads = { linear: 0, angular: 0 };
  const controlled = createControlledSettlement({
    landed: [true, true],
    dots: [0.2, 0.95],
    hidden: true,
    velocityReads: reads,
  });
  let resolved = false;
  try {
    const settlement = controlled.internals.waitUntilSettled();
    void settlement.then(() => { resolved = true; });
    controlled.tick(8);
    await Promise.resolve();
    assert.deepEqual(reads, { linear: 0, angular: 0 });
    assert.equal(resolved, false);
    controlled.internals.cancelSettling();
    await settlement;
  } finally {
    controlled.restore();
    controlled.thrower.dispose();
  }
});
```

The test helper must restore `document`, `setInterval`, and `clearInterval` in `finally`; its body stubs expose `getLinearVelocity`, `getAngularVelocity`, and `applyAngularImpulse` with deterministic vectors.

- [ ] **Step 5: Integrate the state machine and impulse execution into `JiaobeiThrower`**

Make these exact structural changes:

```ts
private pieceAssistStates: ThrowPieceAssistState[] = [];

private getCupFaceNormalWorld(piece: JiaobeiMesh): Vector3 {
  piece.mesh.computeWorldMatrix(true);
  const local = piece.mesh.metadata.convexLocalNormal as Vector3;
  return Vector3.Normalize(Vector3.TransformNormal(local, piece.mesh.getWorldMatrix()));
}

private getCupFaceUpDot(piece: JiaobeiMesh): number {
  return Vector3.Dot(this.getCupFaceNormalWorld(piece), Vector3.Up());
}
```

In `createThrowAttempt`, create the fallback signs only after both launch setups have been generated:

```ts
this.pieceAssistStates = this.pieces.map(() => (
  createThrowPieceAssistState(Math.random() < 0.5 ? -1 : 1)
));
```

In the 33ms callback, return immediately while hidden, then sample each body once, calculate its world normal and `rollSpeed`, and call `stepThrowSettlement`. Store returned states and group still count. For `{ type: 'tip' }`, build an impulse with `createEdgeAssistImpulse` and call `body.applyAngularImpulse(plan.impulse)` exactly once. If any plan is null or the piece/body no longer belongs to the current attempt, finish with `retry`; otherwise continue the interval without stopping motion. For `settled` or `retry`, call the existing `finish` path. Clear `pieceAssistStates` in `clearPieces()`.

The interval ordering must be:

```ts
if (pageHidden) {
  this.renderWatchdogArmed = false;
  return;
}
if (disposedOrAttemptChanged) return finish('retry');
if (watchdogExpired) return finish('retry');
const step = sampleAndDecide();
this.pieceAssistStates = step.pieceStates;
stillChecks = step.stillChecks;
if (step.action.type === 'tip') applyTipOrRetry(step.action.pieceIndices);
else if (step.action.type !== 'continue') finish(step.action.type);
```

- [ ] **Step 6: Run focused tests and capture GREEN**

```bash
node --experimental-strip-types --test tests/jiaobei-edge-assist.test.ts tests/jiaobei-thrower-runtime.test.ts tests/jiaobei-physics-runtime.test.ts
```

Expected: the pure axis/direction tests pass; one piece gets one finite impulse; a second stall retries; hidden ticks perform zero velocity reads; lifecycle/dispose tests remain green.

- [ ] **Step 7: Record the file checkpoint**

Record the four changed paths, impulse vectors from the focused test, and the no-sampling hidden-tab assertion.

---

### Task 4: Deterministic Havok Calibration and Geometry Contact Acceptance

**Files:**
- Create: `tests/helpers/jiaobeiPhysicsHarness.ts`
- Modify: `tests/jiaobei-physics-runtime.test.ts`
- Modify only if evidence requires calibration: `src/games/shantou-jiaobei/physics/edgeAssist.ts`

**Interfaces:**
- Produces: `runSeededThrow(seed, options): Promise<SeededThrowReport>` using the production mesh, state transition, edge-assist math, damping, ground, and at most two attempts.
- Produces metrics for attempts, assists, impacts, result time, final dots, face counts, penetration, and final contact gap.

- [ ] **Step 1: Extract a reusable deterministic integration harness**

Use this report contract in `tests/helpers/jiaobeiPhysicsHarness.ts`:

```ts
export interface SeededPieceReport {
  finalUpDot: number;
  firstImpactMs: number;
  assistCount: number;
  maximumPenetration: number;
  finalContactGap: number;
}

export interface SeededThrowReport {
  seed: number;
  attemptCount: 1 | 2;
  retryReasons: string[];
  settledMs: number;
  pieces: [SeededPieceReport, SeededPieceReport];
  result: 'sheng' | 'xiao' | 'yin';
}
```

The harness must:

1. Seed the existing LCG with `Math.imul(seed + 1, 0x9e3779b1)`.
2. Reuse one Havok scene and static 14x14x0.4 ground across seeds.
3. Create new pieces and per-piece assist state for each attempt.
4. Step physics at 60Hz and sample settlement every two frames.
5. Apply the exact production impulse plan for `tip` actions.
6. Dispose pieces and collision observers after every attempt.
7. Compute every visible world vertex Y after ground contact; accumulate `max(0, -minY)` as penetration and use `max(0, finalMinY)` as final contact gap.
8. Return the first successful attempt or throw with seed, both retry reasons, and final dots after attempt two.

- [ ] **Step 2: Replace the old 512-seed proxy test with acceptance tests that initially fail**

Add:

```ts
test('exact hull settles 512 seeded throws with clear faces and bounded contact error', async () => {
  const reports = await runSeededThrows(512);
  for (const report of reports) {
    assert.ok(report.pieces.every((piece) => Math.abs(piece.finalUpDot) >= 0.90));
    assert.ok(report.pieces.every((piece) => piece.firstImpactMs <= 1200));
    assert.ok(report.pieces.every((piece) => piece.assistCount <= report.attemptCount));
    assert.ok(report.pieces.every((piece) => piece.maximumPenetration <= 0.01));
    assert.ok(report.pieces.every((piece) => piece.finalContactGap <= 0.01));
  }
});

test('1024 seeded throws meet timing retry distribution and fairness gates', async () => {
  const reports = await runSeededThrows(1024);
  const times = reports.map((report) => report.settledMs).sort((a, b) => a - b);
  const p95 = times[Math.ceil(times.length * 0.95) - 1];
  const retries = reports.filter((report) => report.attemptCount === 2).length;
  const dots = reports.flatMap((report) => report.pieces.map((piece) => piece.finalUpDot));
  const positiveRatio = dots.filter((dot) => dot > 0).length / dots.length;
  const results = new Set(reports.map((report) => report.result));

  assert.ok(p95 <= 2600, `p95 ${p95}ms`);
  assert.ok(times.at(-1)! <= 3200, `max ${times.at(-1)}ms`);
  assert.ok(retries / reports.length <= 0.02, `retry ratio ${retries / reports.length}`);
  assert.ok(positiveRatio >= 0.35 && positiveRatio <= 0.65, `positive ratio ${positiveRatio}`);
  assert.deepEqual([...results].sort(), ['sheng', 'xiao', 'yin']);
});
```

- [ ] **Step 3: Run the 512-seed test and capture RED or first calibration evidence**

```bash
node --experimental-strip-types --test --test-name-pattern='exact hull settles 512' tests/jiaobei-physics-runtime.test.ts
```

Expected before final calibration: the exact hull exposes the historical edge-stall seeds, proving the new test observes the real failure instead of the removed proxy.

- [ ] **Step 4: Calibrate one constant at a time from 1024-seed evidence**

Run the 1024 report with `0.24 / 0.38`. If a gate fails, change only the magnitude for the failing destination face, rerun 512, then rerun 1024. Do not change thresholds, damping, launch velocities, mesh vertices, or center of mass during this calibration. Accept a constant only when the report includes:

```text
clearFaceFailures=0
completeThrowFailures=0
retryRatio<=0.02
p95Ms<=2600
maxMs<=3200
positiveRatio=0.35..0.65
maxAssistPerPiecePerAttempt=1
maxPenetration<=0.01
maxFinalContactGap<=0.01
```

- [ ] **Step 5: Run both acceptance sizes and capture GREEN**

```bash
node --experimental-strip-types --test tests/jiaobei-physics-runtime.test.ts
```

Expected: both 512 and 1024 gates pass with three result types present and no complete throw failure.

- [ ] **Step 6: Record the calibration checkpoint**

Write the locked positive/negative constants and the complete metrics line into the task notes. Preserve the initial failed metrics so the RED-to-GREEN evidence remains auditable.

---

### Task 5: Query-Gated Runtime Diagnostics and Reliable CDP Acceptance

**Files:**
- Create: `src/games/shantou-jiaobei/physics/jiaobeiE2eDiagnostics.ts`
- Create: `tests/jiaobei-e2e-diagnostics.test.ts`
- Modify: `src/games/shantou-jiaobei/physics/JiaobeiThrower.ts`
- Modify: `aios/temp/jiaobei_cdp_e2e.mjs`

**Interfaces:**
- Normal URLs expose no global and allocate no event history.
- `?e2e=<run-id>` exposes `window.__JIAOBEI_E2E__.snapshot()` as read-only data.
- Snapshot contains attempt/retry identity, ordered events, active physics timing, settlement sample/still counters, per-piece dots/positions/landed/assist counts, and projected screen bounds.

- [ ] **Step 1: Write failing diagnostics-store tests**

Create a pure store test for this public shape:

```ts
test('diagnostics preserve ordered attempt impact assist and settle evidence', () => {
  const diagnostics = createJiaobeiE2eDiagnostics('run-17');
  diagnostics.startThrow(100);
  diagnostics.startAttempt(1, 110);
  diagnostics.impact(0, 640);
  diagnostics.assist(0, 1210, 0.24);
  diagnostics.settle(1720, 1610);
  const snapshot = diagnostics.snapshot();
  assert.equal(snapshot.runId, 'run-17');
  assert.equal(snapshot.attemptCount, 1);
  assert.equal(snapshot.retryCount, 0);
  assert.deepEqual(snapshot.events.map((event) => event.type), [
    'throw-start', 'attempt-start', 'impact', 'assist', 'settled',
  ]);
  assert.deepEqual(snapshot.events.map((event) => event.sequence), [1, 2, 3, 4, 5]);
  assert.equal(snapshot.activePhysicsElapsedMs, 1610);
  assert.equal(snapshot.settlementSampleCount, 0);
  assert.equal(snapshot.stillChecks, 0);
});
```

- [ ] **Step 2: Implement the diagnostics store and query gate**

Define serializable interfaces and a bounded event array of at most 64 items. `installJiaobeiE2eDiagnostics()` must return `null` when `window` is absent or the URL lacks `e2e`; otherwise it installs the global and returns the store. `dispose()` removes the global only when it still points to the same store. Do not import React or write to DOM.

- [ ] **Step 3: Feed diagnostics from Thrower lifecycle boundaries**

Record:

```text
throw-start: before attempt loop
attempt-start: after pieces and assist state exist
impact: from each first ground collision
assist: immediately after applyAngularImpulse
retry: when an attempt returns retry, with reason
settled: before detectResult, with activePhysicsElapsedMs
dispose: when an active controller is destroyed
```

Update each snapshot piece from live bodies only while queried. Its screen bounds are the min/max viewport coordinates obtained by projecting the eight world bounding-box corners through the active camera. Increment `settlementSampleCount` only after the visible-page early return and mirror the current group `stillChecks` after each decision, so a background test can prove that neither changed while hidden. This is read-only; do not alter body or mesh state.

- [ ] **Step 4: Upgrade the CDP script to assert rather than only print**

Make `openGame()` use a unique run token and wait for URL, complete document, visible state, and two active RAFs. Before clicking, install a page-side `MutationObserver` that records the first `.offering__pop` time with `performance.now()`, plus a `visibilitychange` timeline whose `hiddenAt` and `visibleAt` values also come from page-side `performance.now()` rather than Node command-return times.

For desktop and mobile, require:

```js
assert(summary.visibility === 'visible', 'target page must be foreground');
assert(snapshot.status === 'settled', 'physics must settle before UI result');
assert(snapshot.pieces.length === 2, 'two physical pieces are required');
assert(snapshot.pieces.every((piece) => Math.abs(piece.upDot) >= 0.90), 'edge result');
assert(!rectsOverlap(snapshot.pieces[0].screenBounds, snapshot.pieces[1].screenBounds), 'pieces overlap');
assert(resultVisibleAfterMs <= 2600, `slow result ${resultVisibleAfterMs}ms`);
```

For mobile, additionally require non-zero stage/camera sizes, `cameraInsideStage === false`, overlap area `=== 0`, camera top at or below stage bottom within `0.5px`, a live enabled video track, `readyState >= 2`, positive video dimensions, and advancing `currentTime` or one `requestVideoFrameCallback`.

For background mode, assert this exact sequence:

```text
visible + throwing + attemptCount=1
hidden event
actualHiddenMs>=4200
while hidden: status=throwing, same event sequence, same activePhysicsElapsedMs, same settlementSampleCount, same stillChecks
visible + two resumed RAFs
settled with attemptCount=1 and retryCount=0
```

Use `try/catch/finally` so console/runtime errors and the timeline always print. Set `process.exitCode = 1` on any assertion failure. Store screenshots and JSON beneath `aios/temp/jiaobei-e2e/<run-id>/` to prevent stale-file reuse.

- [ ] **Step 5: Run diagnostics tests and static script validation**

```bash
node --experimental-strip-types --test tests/jiaobei-e2e-diagnostics.test.ts tests/jiaobei-thrower-runtime.test.ts
node --check aios/temp/jiaobei_cdp_e2e.mjs
npx tsc --noEmit
```

Expected: diagnostics ordering and disposal pass, the CDP script parses, and the query-gated window type is valid.

- [ ] **Step 6: Run fresh desktop, mobile, and background evidence**

With the static server and foreground CDP browser running:

```bash
MODE=desktop node aios/temp/jiaobei_cdp_e2e.mjs
MODE=mobile node aios/temp/jiaobei_cdp_e2e.mjs
MODE=background node aios/temp/jiaobei_cdp_e2e.mjs
```

Expected: all modes exit 0; final dots are clear; pieces do not overlap; desktop/mobile UI result is within 2.6s; mobile camera is outside the stage and live; hidden time is at least 4.2s with no hidden sampling or retry.

- [ ] **Step 7: Visually inspect the evidence frames**

Inspect the final pre-result and settled frame from desktop and mobile plus the resumed background frame. Reject any frame showing two merged pieces, a side-standing result, visible penetration above 0.01, or unexplained hovering above 0.01 even when automated assertions pass.

---

### Task 6: Full Regression and Completion Evidence

**Files:**
- Modify only files required by a reproduced failure from this task.
- Evidence: `aios/temp/jiaobei-e2e/<run-id>/report.json` and the plan task notes.

**Interfaces:**
- Consumes all production and test changes from Tasks 1-5.
- Produces one final verification record with command exit codes and browser evidence paths.

- [ ] **Step 1: Run the complete Node test suite**

```bash
npm test
```

Expected: zero failures, including 4096 support directions, 512/1024 seeded physics, lifecycle, hidden-page, and diagnostics tests.

- [ ] **Step 2: Run TypeScript validation**

```bash
npx tsc --noEmit
```

Expected: exit code 0.

- [ ] **Step 3: Run the production build**

```bash
npm run build
```

Expected: exit code 0 and successful static output. Existing unrelated Next metadata warnings may remain but new warnings are failures to investigate.

- [ ] **Step 4: Repeat the three browser modes against the built output**

Run desktop, mobile, and background commands from Task 5 against a fresh server process. Expected: all exit 0 and write new run-id directories.

- [ ] **Step 5: Perform the completion review**

Use `superpowers:verification-before-completion`. Compare every design requirement to a test or browser field, confirm no dependency changed, confirm no page/camera/gesture file changed, and inspect all touched files for proxy geometry, direct transforms, result preselection, or more than one assist per piece per attempt.

- [ ] **Step 6: Deliver the evidence-backed result**

Report the exact locked impulse constants, test count, 1024-seed retry ratio/distribution/p95/max/contact error, desktop/mobile result times and dots, background hidden/resume metrics, and clickable evidence paths. Do not claim completion if any metric is missing or stale.

---

## Plan Self-Review

- Spec coverage: exact hull, natural mass properties, 0.90 classifier, explicit tip, one assist per piece/attempt, roll-direction continuation, late retry, hidden no-op, two attempts, seed fairness, contact error, E2E visibility, camera separation, and lifecycle disposal each map to an explicit task.
- Placeholder scan: every code-changing step includes an exact interface, implementation rule, command, and expected signal.
- Type consistency: `ThrowPieceAssistState`, `ThrowAction`, `ThrowSettlementStep`, `RollSign`, and the edge-assist function names are consistent across Tasks 1, 3, and 4.
- Scope: camera and layout source remain untouched; diagnostics are query-gated and live in a focused module because `JiaobeiThrower.ts` already exceeds 500 lines.
- Environment: no Git/worktree/commit step is required because `/Users/rex/codes/rex-game` is not a Git repository.
