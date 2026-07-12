# Jiaobei Physics and Camera Repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for every behavior change. This workspace is not a Git repository, so use file-level review checkpoints instead of commits.

**Goal:** Restore real-time Havok free fall, reliable ground contact and settling, a responsive high-angle director camera, and recoverable browser-camera access.

**Architecture:** Extend Babylon's native render loop and Havok collision observables instead of compensating with larger gravity or scripted mesh animation. Move camera math and camera-error classification into small pure modules so they can be tested without WebGL, MediaPipe, or a browser permission prompt.

**Tech Stack:** TypeScript, Babylon.js 7.54, Havok 1.3, React 19, Next.js 15, Node test runner.

## Global Constraints

- Do not add runtime or test dependencies.
- Do not change the three cup-result meanings, round state machine, or result copy.
- Do not manually tween cup positions; Havok remains authoritative after launch.
- Both bodies must contact the ground before a normal result can be returned.
- Camera and MediaPipe loops must read current state through stable callbacks/refs and clean up all listeners, RAFs, observers, streams, and physics observables.
- Use ASCII in new source files; retain existing Chinese comments only where already natural in touched files.
- Verification commands are `npm test`, `npx tsc --noEmit`, and `npm run build`.

---

### Task 1: Babylon Render Clock and Resize Lifecycle

**Files:**
- Create: `tests/jiaobei-thrower-runtime.test.ts`
- Modify: `src/games/shantou-jiaobei/physics/JiaobeiThrower.ts`

**Interfaces:**
- `new JiaobeiThrower(canvas: HTMLCanvasElement | null, engine?: Engine)` accepts a test engine while preserving the existing production call.
- A stable private `renderFrame` callback is registered with `engine.runRenderLoop()` and removed with `engine.stopRenderLoop(renderFrame)`.

- [ ] **Step 1: Write the failing render-loop contract test**

```ts
class RecordingEngine extends NullEngine {
  started: Array<() => void> = [];
  stopped: Array<() => void> = [];

  override runRenderLoop(callback: () => void) {
    this.started.push(callback);
  }

  override stopRenderLoop(callback?: () => void) {
    if (callback) this.stopped.push(callback);
  }
}

test('JiaobeiThrower uses the Babylon engine render loop with one stable callback', () => {
  const engine = new RecordingEngine();
  const thrower = new JiaobeiThrower(null, engine);

  assert.equal(engine.started.length, 1);
  thrower.dispose();
  assert.equal(engine.stopped[0], engine.started[0]);
});
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run: `node --experimental-strip-types --test tests/jiaobei-thrower-runtime.test.ts`

Expected: FAIL because the constructor does not accept an injected engine and the class still uses raw `requestAnimationFrame`.

- [ ] **Step 3: Implement the native engine loop and resize cleanup**

```ts
private readonly renderFrame = () => {
  this.updateFrame();
  this.scene.render();
};

private startRenderLoop() {
  this.engine.runRenderLoop(this.renderFrame);
}

private stopRenderLoop() {
  this.engine.stopRenderLoop(this.renderFrame);
}
```

The constructor uses the provided engine when present; production still constructs `new Engine(canvas, ...)`. Observe a non-null canvas with `ResizeObserver`, call `engine.resize()` on changes, and disconnect the observer during `dispose()`.

- [ ] **Step 4: Run the focused test and confirm GREEN**

Run: `node --experimental-strip-types --test tests/jiaobei-thrower-runtime.test.ts`

Expected: PASS with one registered callback and the same callback stopped on dispose.

### Task 2: Ground Collision, Bounds, and Settling State

**Files:**
- Create: `src/games/shantou-jiaobei/physics/throwRuntime.ts`
- Create: `tests/jiaobei-physics-runtime.test.ts`
- Modify: `src/games/shantou-jiaobei/physics/JiaobeiThrower.ts`

**Interfaces:**
- `THROW_GROUND_SIZE = 14`, `THROW_GROUND_THICKNESS = 0.4`.
- `isThrowOutOfBounds(position)` returns true below the recovery floor or outside the physical table margin.
- `isGroundCollision(eventType, collidedAgainst, groundBody)` accepts only `COLLISION_STARTED` against the saved ground body.
- `waitUntilSettled()` returns `'settled' | 'retry'`.

- [ ] **Step 1: Write failing pure-state and real-Havok tests**

```ts
test('only a started collision against the ground counts as landing', () => {
  assert.equal(isGroundCollision(PhysicsEventType.COLLISION_STARTED, ground, ground), true);
  assert.equal(isGroundCollision(PhysicsEventType.COLLISION_CONTINUED, ground, ground), false);
  assert.equal(isGroundCollision(PhysicsEventType.COLLISION_STARTED, other, ground), false);
});

test('the regression launch remains on the physical table and contacts it promptly', async () => {
  // Create a 14x14x0.4 static box, launch two real JiaobeiMesh bodies at 60Hz,
  // and collect collision-started events against the ground.
  assert.equal(landed.every(Boolean), true);
  assert.ok(lastLandingTime <= 1.2);
  assert.ok(pieces.every((piece) => piece.mesh.position.y > -0.5));
});
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run: `node --experimental-strip-types --test tests/jiaobei-physics-runtime.test.ts`

Expected: FAIL because `throwRuntime.ts` and collision-based state do not exist.

- [ ] **Step 3: Implement a thick static table and collision-driven landing**

Create the visible table with `MeshBuilder.CreateBox` at `y = -THROW_GROUND_THICKNESS / 2`, save its `PhysicsAggregate`, and enable each piece body's collision callback.

```ts
body.setCollisionCallbackEnabled(true);
body.getCollisionObservable().add((event) => {
  if (!isGroundCollision(event.type, event.collidedAgainst, groundBody) || this.landed[index]) return;
  this.landed[index] = true;
  body.setLinearDamping(0.08);
  body.setAngularDamping(0.55);
  this.shake = Math.max(this.shake, 0.13);
  this.onImpact?.();
});
```

Replace unconditional success timeout with `'retry'` when either piece never touched ground or moved out of bounds. If both pieces landed and only low residual motion remains at the safety deadline, zero both velocities before returning `'settled'`. Allow one automatic retry before surfacing a physics error.

- [ ] **Step 4: Run focused physics tests and confirm GREEN**

Run: `node --experimental-strip-types --test tests/jiaobei-physics-runtime.test.ts`

Expected: PASS; both bodies contact within 1.2 seconds and remain above the recovery floor.

### Task 3: High-Angle Dynamic Director Camera

**Files:**
- Create: `src/games/shantou-jiaobei/physics/cameraDirector.ts`
- Create: `tests/jiaobei-camera-director.test.ts`
- Modify: `src/games/shantou-jiaobei/physics/JiaobeiThrower.ts`

**Interfaces:**
- `computeCameraGoal(positions, aspect, landedCount)` returns `{ target, alpha, beta, radius }` using plain numeric objects.
- `cameraHeight(goal)` returns `target.y + radius * Math.cos(beta)` for assertions.

- [ ] **Step 1: Write failing camera-math tests**

```ts
test('launch camera is above both cups and uses a true high angle', () => {
  const goal = computeCameraGoal([
    { x: -0.76, y: 3.2, z: -0.24 },
    { x: 0.76, y: 3.38, z: 0.24 },
  ], 1.6, 0);

  assert.ok(goal.beta < Math.PI / 3);
  assert.ok(cameraHeight(goal) > 3.38);
});

test('narrow viewports widen the shot and preserve right-side safety space', () => {
  const desktop = computeCameraGoal(pair, 1.6, 0);
  const mobile = computeCameraGoal(pair, 0.98, 0);
  assert.ok(mobile.radius > desktop.radius);
  assert.ok(mobile.target.x > desktop.target.x);
});
```

- [ ] **Step 2: Run the focused camera test and confirm RED**

Run: `node --experimental-strip-types --test tests/jiaobei-camera-director.test.ts`

Expected: FAIL because `cameraDirector.ts` does not exist.

- [ ] **Step 3: Implement camera goals and integrate smoothing**

Use Babylon-correct beta values around `0.62rad` during flight and `0.84rad` after landing. Target the live midpoint, clamp target Y, add a positive X safety offset so the cups render left of the webcam overlay, and increase radius as pair spread grows or aspect narrows.

During a throw, detach controls and clear all ArcRotate inertial offsets. Every render frame, compute the current goal from both mesh positions and apply exponential smoothing based on `engine.getDeltaTime()`. After settling, apply the final goal and reattach restricted controls with panning disabled and beta/radius limits enforced.

- [ ] **Step 4: Run camera and runtime tests and confirm GREEN**

Run: `node --experimental-strip-types --test tests/jiaobei-camera-director.test.ts tests/jiaobei-thrower-runtime.test.ts`

Expected: PASS; launch height and responsive framing contracts hold.

### Task 4: Recoverable Browser-Camera Access and Fresh React State

**Files:**
- Create: `src/games/shantou-jiaobei/vision/cameraAccess.ts`
- Create: `tests/camera-access.test.ts`
- Modify: `src/games/shantou-jiaobei/vision/CameraPosePanel.tsx`
- Modify: `src/games/shantou-jiaobei/scenes/OfferingScene.tsx`

**Interfaces:**
- `getCameraPreflightFailure({ isSecureContext, hasMediaDevices })` returns a Chinese reason or null.
- `describeCameraAccessError(error)` distinguishes denied/policy, missing device, unsupported context, and general failure.
- `CameraPosePanel` adds optional `onAvailable?: () => void`.

- [ ] **Step 1: Write failing access-classification tests**

```ts
test('camera preflight distinguishes insecure and unsupported environments', () => {
  assert.match(getCameraPreflightFailure({ isSecureContext: false, hasMediaDevices: true })!, /HTTPS/);
  assert.match(getCameraPreflightFailure({ isSecureContext: true, hasMediaDevices: false })!, /不支持/);
});

test('camera errors distinguish permission and missing-device failures', () => {
  assert.match(describeCameraAccessError({ name: 'NotAllowedError' }), /权限|策略/);
  assert.match(describeCameraAccessError({ name: 'NotFoundError' }), /未找到/);
});
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run: `node --experimental-strip-types --test tests/camera-access.test.ts`

Expected: FAIL because `cameraAccess.ts` does not exist.

- [ ] **Step 3: Implement retryable camera lifecycle**

Keep the heavy HandLandmarker dynamic import. Load `detectPrayerPose` once rather than importing it per video frame. Store latest `enabled`, `onPrayer`, `onUnavailable`, and `onAvailable` values in refs read by the single RAF loop.

Expose one stable `startCamera()` callback that:

1. Stops prior tracks and invalidates stale attempts.
2. Runs preflight checks.
3. Starts model loading and `getUserMedia()` in parallel.
4. Binds and plays the video, sets ready state, and calls `onAvailable`.
5. Classifies failures, stops partial streams, and leaves a visible retry button.

When `enabledRef.current` is false, skip `detectForVideo` and reset hold state. Cleanup cancels RAF, invalidates pending starts, and stops all tracks.

In `OfferingScene`, clear `cameraDown` through `onAvailable`, move the compact preview outside the critical right-side flight area on narrow screens, and label the retry control clearly.

- [ ] **Step 4: Run focused access tests and TypeScript**

Run: `node --experimental-strip-types --test tests/camera-access.test.ts && npx tsc --noEmit`

Expected: PASS with no stale-prop or callback type errors.

### Task 5: Full Integration Verification

**Files:**
- Modify only files required by failures found in this task.

- [ ] **Step 1: Run the complete test suite**

Run: `npm test`

Expected: all geometry, runtime, Havok, camera, and access tests pass with zero failures.

- [ ] **Step 2: Run TypeScript validation**

Run: `npx tsc --noEmit`

Expected: exit code 0.

- [ ] **Step 3: Run the production static build**

Run: `npm run build`

Expected: exit code 0 and successful static export; the existing unrelated `metadataBase` warning may remain.

- [ ] **Step 4: Run fresh timing evidence**

Run the real Havok 60Hz regression simulation and record first contact, both-contact, maximum table radius, minimum Y, and settle time. Acceptance: both-contact `<= 1.2s`, minimum Y `> -0.5`, no out-of-bounds state, and normal result only after both contacts.

- [ ] **Step 5: Independent review**

Provide the design spec, this plan, modified file list, and fresh verification output to a read-only reviewer. Resolve every Critical or Important finding, rerun the covering tests, and repeat review until clean.
