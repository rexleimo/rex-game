import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import HavokPhysics from '@babylonjs/havok';
import { HavokPlugin, PhysicsActivationControl, Scene, Vector3 } from '@babylonjs/core';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { JiaobeiThrower } from '../src/games/shantou-jiaobei/physics/JiaobeiThrower.ts';
import {
  createThrowPieceAssistState,
  THROW_FACE_CONTACT_ANGULAR_DAMPING,
  THROW_FACE_CONTACT_LINEAR_DAMPING,
  THROW_LANDING_ANGULAR_DAMPING,
  THROW_LANDING_LINEAR_DAMPING,
  THROW_SETTLEMENT_SAMPLE_MS,
} from '../src/games/shantou-jiaobei/physics/throwRuntime.ts';

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

async function createHavok() {
  const wasmBytes = readFileSync(new URL(
    '../node_modules/@babylonjs/havok/lib/esm/HavokPhysics.wasm',
    import.meta.url,
  ));
  return HavokPhysics({ wasmBinary: Uint8Array.from(wasmBytes).buffer });
}

class RecordingEngine extends NullEngine {
  readonly started: Array<() => void> = [];
  readonly stopped: Array<() => void> = [];
  deltaMs = 16.67;
  renderWidth = 1600;
  renderHeight = 1000;
  resizeCalls = 0;

  override runRenderLoop(callback: () => void): void {
    this.started.push(callback);
  }

  override stopRenderLoop(callback?: () => void): void {
    if (callback) this.stopped.push(callback);
  }

  override getDeltaTime(): number {
    return this.deltaMs;
  }

  override getRenderWidth(): number {
    return this.renderWidth;
  }

  override getRenderHeight(): number {
    return this.renderHeight;
  }

  override resize(): void {
    this.resizeCalls++;
  }
}

test('JiaobeiThrower uses one stable Babylon render-loop callback', () => {
  const engine = new RecordingEngine();
  const thrower = new JiaobeiThrower(null, engine);

  assert.equal(engine.started.length, 1);

  thrower.dispose();

  assert.equal(engine.stopped.length, 1);
  assert.equal(engine.stopped[0], engine.started[0]);
});

test('active attempts keep both bodies awake and settlement restores engine sleep control', async () => {
  const engine = new RecordingEngine();
  const thrower = new JiaobeiThrower(null, engine);
  const internals = thrower as any;
  const scene = internals.scene as Scene;
  const havok = await createHavok();
  scene.enablePhysics(new Vector3(0, -19.6, 0), new HavokPlugin(true, havok));
  const plugin = scene.getPhysicsEngine()!.getPhysicsPlugin() as HavokPlugin;
  const originalSetActivationControl = plugin.setActivationControl.bind(plugin);
  const calls: number[] = [];
  plugin.setActivationControl = ((body: any, control: PhysicsActivationControl) => {
    calls.push(control);
    originalSetActivationControl(body, control);
  }) as typeof plugin.setActivationControl;

  try {
    internals.createThrowAttempt(internals.lifecycleGeneration);
    assert.deepEqual(calls, [
      PhysicsActivationControl.ALWAYS_ACTIVE,
      PhysicsActivationControl.ALWAYS_ACTIVE,
    ]);

    internals.stopPieceMotion();
    assert.deepEqual(calls.slice(-2), [
      PhysicsActivationControl.SIMULATION_CONTROLLED,
      PhysicsActivationControl.SIMULATION_CONTROLLED,
    ]);
  } finally {
    thrower.dispose();
  }
});

test('the render callback records only physics time submitted by rendered frames', () => {
  const engine = new RecordingEngine();
  const thrower = new JiaobeiThrower(null, engine);
  const internals = thrower as any;

  internals.animating = true;
  internals.attemptElapsedMs = 0;
  internals.pieces = [{ mesh: { position: { x: 0, y: 2, z: 0 } } }];
  engine.deltaMs = 17;

  engine.started[0]();

  assert.equal(internals.attemptElapsedMs, 17);
  internals.pieces = [];
  thrower.dispose();
});

test('the render callback mirrors active physics time into query-gated diagnostics', () => {
  const engine = new RecordingEngine();
  const thrower = new JiaobeiThrower(null, engine);
  const internals = thrower as any;
  const elapsed: number[] = [];

  internals.e2eDiagnostics = {
    updateActivePhysics(value: number) {
      elapsed.push(value);
    },
    dispose() {},
  };
  internals.animating = true;
  internals.attemptElapsedMs = 0;
  internals.pieces = [{ mesh: { position: { x: 0, y: 2, z: 0 } } }];
  engine.deltaMs = 17;

  engine.started[0]();

  assert.deepEqual(elapsed, [17]);
  internals.pieces = [];
  thrower.dispose();
});

test('hidden render callbacks consume no active physics time or diagnostics time', () => {
  const originalDocument = globalThis.document;
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      visibilityState: 'hidden',
      addEventListener() {},
      removeEventListener() {},
    },
  });
  const engine = new RecordingEngine();
  const thrower = new JiaobeiThrower(null, engine);
  const internals = thrower as any;
  const elapsed: number[] = [];

  try {
    internals.e2eDiagnostics = {
      updateActivePhysics(value: number) {
        elapsed.push(value);
      },
      dispose() {},
    };
    internals.animating = true;
    internals.attemptElapsedMs = 100;
    internals.pieces = [{ mesh: { position: { x: 0, y: 2, z: 0 } } }];
    engine.deltaMs = 17;

    engine.started[0]();

    assert.equal(internals.attemptElapsedMs, 100);
    assert.deepEqual(elapsed, []);
  } finally {
    internals.pieces = [];
    thrower.dispose();
    if (originalDocument) {
      Object.defineProperty(globalThis, 'document', {
        configurable: true,
        value: originalDocument,
      });
    } else {
      delete (globalThis as any).document;
    }
  }
});

test('a one-second render frame only consumes Havok\'s submitted 100ms step', () => {
  const engine = new RecordingEngine();
  const thrower = new JiaobeiThrower(null, engine);
  const internals = thrower as any;

  internals.animating = true;
  internals.attemptElapsedMs = 0;
  internals.pieces = [{ mesh: { position: { x: 0, y: 2, z: 0 } } }];
  engine.deltaMs = 1000;

  engine.started[0]();

  assert.equal(internals.attemptElapsedMs, 100);
  internals.pieces = [];
  thrower.dispose();
});

test('a wall-clock stall cannot consume the throw simulation deadline', async () => {
  const engine = new RecordingEngine();
  const thrower = new JiaobeiThrower(null, engine);
  const internals = thrower as any;
  const originalPerformance = globalThis.performance;
  const originalSetInterval = globalThis.setInterval;
  const originalClearInterval = globalThis.clearInterval;
  let now = 0;
  let intervalCallback: (() => void) | undefined;
  let intervalMs: number | undefined;

  Object.defineProperty(globalThis, 'performance', {
    configurable: true,
    value: { now: () => now },
  });
  globalThis.setInterval = ((callback: TimerHandler, delay?: number) => {
    intervalCallback = callback as () => void;
    intervalMs = delay;
    return 1 as unknown as ReturnType<typeof setInterval>;
  }) as unknown as typeof setInterval;
  globalThis.clearInterval = (() => undefined) as typeof clearInterval;

  const stopped = { length: () => 0 };
  internals.pieces = [0, 1].map((index) => ({
    mesh: { position: { x: index === 0 ? -1 : 1, y: 2.8, z: 0 } },
    aggregate: {
      body: {
        getLinearVelocity: () => stopped,
        getAngularVelocity: () => stopped,
        setLinearDamping() {},
        setAngularDamping() {},
      },
    },
  }));
  internals.landed = [false, false];
  internals.pieceFaceBrakeActive = [false, false];
  internals.animating = true;
  internals.attemptElapsedMs = 100;
  internals.lastRenderAtMs = 0;
  internals.getCupFaceNormalWorld = () => Vector3.Up();

  let resolved = false;
  let resolvedBeforePhysicsDeadline = false;
  try {
    const settlement = internals.waitUntilSettled() as Promise<unknown>;
    void settlement.then(() => {
      resolved = true;
    });

    now = 4000;
    intervalCallback?.();
    await Promise.resolve();
    resolvedBeforePhysicsDeadline = resolved;

    internals.cancelSettling?.();
    await settlement;
  } finally {
    Object.defineProperty(globalThis, 'performance', {
      configurable: true,
      value: originalPerformance,
    });
    globalThis.setInterval = originalSetInterval;
    globalThis.clearInterval = originalClearInterval;
    internals.pieces = [];
    internals.landed = [];
    thrower.dispose();
  }

  assert.equal(resolvedBeforePhysicsDeadline, false);
  assert.equal(intervalMs, THROW_SETTLEMENT_SAMPLE_MS);
});

test('canvas resize updates the engine and immediately reapplies mobile framing', () => {
  const engine = new RecordingEngine();
  const thrower = new JiaobeiThrower(null, engine);
  const internals = thrower as any;
  const originalResizeObserver = globalThis.ResizeObserver;
  let resizeCallback: ResizeObserverCallback | undefined;

  class RecordingResizeObserver {
    constructor(callback: ResizeObserverCallback) {
      resizeCallback = callback;
    }

    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }

  Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    value: RecordingResizeObserver,
  });

  let targetBefore = 0;
  let targetAfter = 0;
  try {
    internals.canvas = {} as HTMLCanvasElement;
    internals.observeCanvasSize();
    targetBefore = internals.camera.target.x;
    engine.renderWidth = 390;
    engine.renderHeight = 398;
    resizeCallback?.([], internals.resizeObserver);
    targetAfter = internals.camera.target.x;
  } finally {
    if (originalResizeObserver) {
      Object.defineProperty(globalThis, 'ResizeObserver', {
        configurable: true,
        value: originalResizeObserver,
      });
    } else {
      delete (globalThis as any).ResizeObserver;
    }
    thrower.dispose();
  }

  assert.equal(engine.resizeCalls, 1);
  assert.ok(targetAfter > targetBefore);
});

test('visibility changes disarm the watchdog and dispose removes its listener', () => {
  const engine = new RecordingEngine();
  const originalDocument = globalThis.document;
  const originalPerformance = globalThis.performance;
  let visibilityHandler: EventListener | undefined;
  let removedVisibilityHandler = false;
  let now = 0;
  const fakeDocument = {
    visibilityState: 'hidden',
    addEventListener(type: string, handler: EventListenerOrEventListenerObject) {
      if (type === 'visibilitychange' && typeof handler === 'function') {
        visibilityHandler = handler;
      }
    },
    removeEventListener(_type: string, handler: EventListenerOrEventListenerObject) {
      if (handler === visibilityHandler) removedVisibilityHandler = true;
    },
  };

  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: fakeDocument,
  });
  Object.defineProperty(globalThis, 'performance', {
    configurable: true,
    value: { now: () => now },
  });

  let watchdogArmed = true;
  let registeredHandler: EventListener | undefined;
  try {
    const thrower = new JiaobeiThrower(null, engine);
    const internals = thrower as any;
    internals.lastRenderAtMs = 0;
    internals.renderWatchdogArmed = true;
    registeredHandler = visibilityHandler;
    now = 12000;
    fakeDocument.visibilityState = 'visible';
    visibilityHandler?.({ type: 'visibilitychange' } as Event);
    watchdogArmed = internals.renderWatchdogArmed;
    thrower.dispose();
  } finally {
    Object.defineProperty(globalThis, 'performance', {
      configurable: true,
      value: originalPerformance,
    });
    if (originalDocument) {
      Object.defineProperty(globalThis, 'document', {
        configurable: true,
        value: originalDocument,
      });
    } else {
      delete (globalThis as any).document;
    }
  }

  assert.ok(registeredHandler);
  assert.equal(watchdogArmed, false);
  assert.equal(removedVisibilityHandler, true);
});

test('a hidden page disarms the watchdog until the first resumed render', () => {
  const engine = new RecordingEngine();
  const originalDocument = globalThis.document;
  let visibilityHandler: EventListener | undefined;
  const fakeDocument = {
    visibilityState: 'hidden',
    addEventListener(type: string, handler: EventListenerOrEventListenerObject) {
      if (type === 'visibilitychange' && typeof handler === 'function') visibilityHandler = handler;
    },
    removeEventListener() {},
  };

  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: fakeDocument,
  });

  try {
    const thrower = new JiaobeiThrower(null, engine);
    const internals = thrower as any;
    internals.renderWatchdogArmed = true;
    visibilityHandler?.({ type: 'visibilitychange' } as Event);
    assert.equal(internals.renderWatchdogArmed, false);

    fakeDocument.visibilityState = 'visible';
    visibilityHandler?.({ type: 'visibilitychange' } as Event);
    assert.equal(internals.renderWatchdogArmed, false);

    internals.animating = true;
    internals.pieces = [{ mesh: { position: { x: 0, y: 2, z: 0 } } }];
    engine.started[0]();
    assert.equal(internals.renderWatchdogArmed, true);
    internals.pieces = [];
    thrower.dispose();
  } finally {
    if (originalDocument) {
      Object.defineProperty(globalThis, 'document', {
        configurable: true,
        value: originalDocument,
      });
    } else {
      delete (globalThis as any).document;
    }
  }
});

test('disposing while physics initialization is pending cannot create an attempt', async () => {
  const engine = new RecordingEngine();
  const thrower = new JiaobeiThrower(null, engine);
  const internals = thrower as any;
  let releaseInitialization: () => void = () => {};
  let attemptsCreated = 0;

  internals.ensurePhysics = () => new Promise<void>((resolve) => {
    releaseInitialization = resolve;
  });
  internals.createThrowAttempt = async () => {
    attemptsCreated++;
  };
  internals.waitUntilSettled = async () => 'retry';

  const throwing = thrower.throwOnce();
  thrower.dispose();
  releaseInitialization();

  await assert.rejects(throwing, /disposed/i);
  assert.equal(attemptsCreated, 0);
  assert.equal(engine.started.length, 1);
  assert.equal(engine.stopped.length, 1);
});

test('disposing an active throw never runs camera-finish work afterward', async () => {
  const engine = new RecordingEngine();
  const thrower = new JiaobeiThrower(null, engine);
  const internals = thrower as any;
  let releaseSettlement: (progress: string) => void = () => {};
  let finishCalls = 0;

  internals.ensurePhysics = async () => undefined;
  internals.createThrowAttempt = async () => undefined;
  internals.waitUntilSettled = () => new Promise<string>((resolve) => {
    releaseSettlement = resolve;
  });
  internals.finishCameraMove = () => {
    finishCalls++;
  };

  const throwing = thrower.throwOnce();
  await Promise.resolve();
  await Promise.resolve();
  thrower.dispose();
  releaseSettlement('retry');

  await assert.rejects(throwing, /disposed/i);
  assert.equal(finishCalls, 0);
});

test('the registered render callback advances Havok through contact and settlement', async () => {
  const engine = new RecordingEngine();
  const thrower = new JiaobeiThrower(null, engine);
  const internals = thrower as any;
  const scene = internals.scene as Scene;
  const originalRandom = Math.random;
  const originalSetInterval = globalThis.setInterval;
  const originalClearInterval = globalThis.clearInterval;
  let intervalCallback: (() => void) | undefined;
  let currentFrame = 0;
  const impactFrames: number[] = [];
  let result: string | undefined;
  let failure: unknown;

  globalThis.setInterval = ((callback: TimerHandler) => {
    intervalCallback = callback as () => void;
    return 1 as unknown as ReturnType<typeof setInterval>;
  }) as unknown as typeof setInterval;
  globalThis.clearInterval = (() => undefined) as typeof clearInterval;

  try {
    const havok = await createHavok();
    scene.enablePhysics(new Vector3(0, -19.6, 0), new HavokPlugin(true, havok));
    Math.random = seededRandom(6);
    const throwing = thrower.throwOnce(() => impactFrames.push(currentFrame));
    void throwing.then(
      (value) => {
        result = value;
      },
      (error) => {
        failure = error;
      },
    );

    for (
      let spin = 0;
      spin < 20 && (internals.pieces.length < 2 || !intervalCallback);
      spin++
    ) {
      await Promise.resolve();
    }
    Math.random = originalRandom;

    assert.equal(internals.pieces.length, 2);
    assert.ok(intervalCallback);
    assert.equal(scene.getPhysicsEngine()!.getSubTimeStep(), 1000 / 960);

    for (currentFrame = 1; currentFrame <= 210 && !result && !failure; currentFrame++) {
      engine.started[0]();
      if (currentFrame % 2 === 0) intervalCallback?.();
      await Promise.resolve();
    }

    await Promise.resolve();
    assert.equal(failure, undefined);
    assert.ok(result === 'sheng' || result === 'xiao' || result === 'yin');
    assert.equal(impactFrames.length, 2);
    assert.ok(Math.max(...impactFrames) <= 72);
    assert.ok(currentFrame > Math.max(...impactFrames));
  } finally {
    Math.random = originalRandom;
    globalThis.setInterval = originalSetInterval;
    globalThis.clearInterval = originalClearInterval;
    thrower.dispose();
  }
});

test('waitUntilSettled applies one angular impulse only to a tipped piece', async () => {
  const engine = new RecordingEngine();
  const thrower = new JiaobeiThrower(null, engine);
  const internals = thrower as any;
  const originalSetInterval = globalThis.setInterval;
  const originalClearInterval = globalThis.clearInterval;
  let intervalCallback: (() => void) | undefined;
  const impulses: Vector3[][] = [[], []];

  globalThis.setInterval = ((callback: TimerHandler) => {
    intervalCallback = callback as () => void;
    return 1 as unknown as ReturnType<typeof setInterval>;
  }) as unknown as typeof setInterval;
  globalThis.clearInterval = (() => undefined) as typeof clearInterval;

  const pieces = [0, 1].map((index) => ({
    mesh: { position: { x: index === 0 ? -1 : 1, y: 0.2, z: 0 } },
    aggregate: {
      body: {
        getLinearVelocity: () => Vector3.Zero(),
        getAngularVelocity: () => Vector3.Zero(),
        setLinearDamping() {},
        setAngularDamping() {},
        applyAngularImpulse: (impulse: Vector3) => impulses[index].push(impulse.clone()),
      },
    },
  }));
  internals.pieces = pieces;
  internals.landed = [true, true];
  internals.pieceFaceBrakeActive = [false, false];
  internals.pieceAssistStates = [
    createThrowPieceAssistState(1),
    createThrowPieceAssistState(-1),
  ];
  internals.attemptElapsedMs = 1200;
  internals.getCupFaceNormalWorld = (piece: unknown) => (
    piece === pieces[0]
      ? new Vector3(0, 0, 1)
      : new Vector3(0, 0.95, Math.sqrt(1 - 0.95 ** 2))
  );

  try {
    const settlement = internals.waitUntilSettled() as Promise<string>;
    assert.ok(intervalCallback);
    intervalCallback();
    intervalCallback();
    intervalCallback();

    assert.equal(impulses[0].length, 1);
    assert.equal(impulses[1].length, 0);
    assert.deepEqual(impulses[0][0].asArray(), [-0.24, 0, 0]);

    intervalCallback();
    intervalCallback();
    intervalCallback();
    assert.equal(await settlement, 'retry');
  } finally {
    globalThis.setInterval = originalSetInterval;
    globalThis.clearInterval = originalClearInterval;
    internals.pieces = [];
    internals.landed = [];
    thrower.dispose();
  }
});

test('waitUntilSettled switches damping only while a clear face contacts the table', async () => {
  const engine = new RecordingEngine();
  const thrower = new JiaobeiThrower(null, engine);
  const internals = thrower as any;
  const originalSetInterval = globalThis.setInterval;
  const originalClearInterval = globalThis.clearInterval;
  let intervalCallback: (() => void) | undefined;
  const linearDamping: number[][] = [[], []];
  const angularDamping: number[][] = [[], []];
  let firstUpDot = 0.95;

  globalThis.setInterval = ((callback: TimerHandler) => {
    intervalCallback = callback as () => void;
    return 1 as unknown as ReturnType<typeof setInterval>;
  }) as unknown as typeof setInterval;
  globalThis.clearInterval = (() => undefined) as typeof clearInterval;

  const pieces = [0, 1].map((index) => ({
    mesh: { position: { x: index === 0 ? -1 : 1, y: 0.2, z: 0 } },
    aggregate: {
      body: {
        getLinearVelocity: () => new Vector3(index === 0 ? 0.5 : 0.8, 0, 0),
        getAngularVelocity: () => new Vector3(index === 0 ? 2.5 : 3.5, 0, 0),
        setLinearDamping: (value: number) => linearDamping[index].push(value),
        setAngularDamping: (value: number) => angularDamping[index].push(value),
      },
    },
  }));
  internals.pieces = pieces;
  internals.landed = [true, true];
  internals.pieceAssistStates = [
    createThrowPieceAssistState(1),
    createThrowPieceAssistState(-1),
  ];
  internals.pieceFaceBrakeActive = [false, false];
  internals.attemptElapsedMs = 1200;
  internals.getCupFaceNormalWorld = (piece: unknown) => (
    piece === pieces[0]
      ? new Vector3(0, firstUpDot, Math.sqrt(1 - firstUpDot ** 2))
      : new Vector3(0, 0, 1)
  );

  try {
    const settlement = internals.waitUntilSettled() as Promise<string>;
    assert.ok(intervalCallback);
    intervalCallback();
    assert.deepEqual(linearDamping, [[THROW_FACE_CONTACT_LINEAR_DAMPING], []]);
    assert.deepEqual(angularDamping, [[THROW_FACE_CONTACT_ANGULAR_DAMPING], []]);

    firstUpDot = 0.89;
    intervalCallback();
    assert.deepEqual(linearDamping[0], [
      THROW_FACE_CONTACT_LINEAR_DAMPING,
      THROW_LANDING_LINEAR_DAMPING,
    ]);
    assert.deepEqual(angularDamping[0], [
      THROW_FACE_CONTACT_ANGULAR_DAMPING,
      THROW_LANDING_ANGULAR_DAMPING,
    ]);

    internals.cancelSettling();
    await settlement;
  } finally {
    globalThis.setInterval = originalSetInterval;
    globalThis.clearInterval = originalClearInterval;
    internals.pieces = [];
    internals.landed = [];
    thrower.dispose();
  }
});

test('hidden interval ticks neither sample bodies nor resolve settlement', async () => {
  const originalDocument = globalThis.document;
  const originalSetInterval = globalThis.setInterval;
  const originalClearInterval = globalThis.clearInterval;
  let intervalCallback: (() => void) | undefined;
  const reads = { linear: 0, angular: 0 };
  const fakeDocument = {
    visibilityState: 'hidden',
    addEventListener() {},
    removeEventListener() {},
  };

  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: fakeDocument,
  });
  globalThis.setInterval = ((callback: TimerHandler) => {
    intervalCallback = callback as () => void;
    return 1 as unknown as ReturnType<typeof setInterval>;
  }) as unknown as typeof setInterval;
  globalThis.clearInterval = (() => undefined) as typeof clearInterval;

  const engine = new RecordingEngine();
  const thrower = new JiaobeiThrower(null, engine);
  const internals = thrower as any;
  internals.pieces = [0, 1].map((index) => ({
    mesh: { position: { x: index === 0 ? -1 : 1, y: 0.2, z: 0 } },
    aggregate: {
      body: {
        getLinearVelocity: () => {
          reads.linear++;
          return Vector3.Zero();
        },
        getAngularVelocity: () => {
          reads.angular++;
          return Vector3.Zero();
        },
      },
    },
  }));
  internals.landed = [true, true];
  internals.pieceAssistStates = [
    createThrowPieceAssistState(1),
    createThrowPieceAssistState(-1),
  ];
  internals.attemptElapsedMs = 3200;

  let resolved = false;
  try {
    const settlement = internals.waitUntilSettled() as Promise<string>;
    void settlement.then(() => {
      resolved = true;
    });
    assert.ok(intervalCallback);
    for (let tick = 0; tick < 8; tick++) intervalCallback();
    await Promise.resolve();

    assert.deepEqual(reads, { linear: 0, angular: 0 });
    assert.equal(resolved, false);

    internals.cancelSettling();
    await settlement;
  } finally {
    globalThis.setInterval = originalSetInterval;
    globalThis.clearInterval = originalClearInterval;
    if (originalDocument) {
      Object.defineProperty(globalThis, 'document', {
        configurable: true,
        value: originalDocument,
      });
    } else {
      delete (globalThis as any).document;
    }
    internals.pieces = [];
    internals.landed = [];
    thrower.dispose();
  }
});
