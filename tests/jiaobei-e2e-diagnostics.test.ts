import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createJiaobeiE2eDiagnostics,
  installJiaobeiE2eDiagnostics,
} from '../src/games/shantou-jiaobei/physics/jiaobeiE2eDiagnostics.ts';

test('diagnostics preserve ordered attempt impact assist and settle evidence', () => {
  const diagnostics = createJiaobeiE2eDiagnostics('run-17');
  diagnostics.startThrow(100);
  diagnostics.startAttempt(1, 110);
  diagnostics.impact(0, 640);
  diagnostics.assist(0, 1210, 0.24);
  diagnostics.settle(1720, 1610);
  const snapshot = diagnostics.snapshot();

  assert.equal(snapshot.runId, 'run-17');
  assert.equal(snapshot.status, 'settled');
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

test('diagnostics snapshots are detached and event history is bounded', () => {
  const diagnostics = createJiaobeiE2eDiagnostics('bounded');
  diagnostics.startThrow(0);
  for (let index = 0; index < 80; index++) diagnostics.impact(index % 2, index + 1);
  diagnostics.updateSettlement(1200, 7);
  diagnostics.updatePieces([{ index: 0, landed: true, assistCount: 1, upDot: 0.95,
    position: { x: 1, y: 2, z: 3 }, screenBounds: { left: 1, top: 2, right: 3, bottom: 4 } }]);

  const first = diagnostics.snapshot();
  first.events.length = 0;
  first.pieces[0].position.x = 99;
  const second = diagnostics.snapshot();

  assert.equal(second.events.length, 64);
  assert.equal(second.pieces[0].position.x, 1);
  assert.equal(second.settlementSampleCount, 1);
  assert.equal(second.stillChecks, 7);
});

test('query gate installs and disposes only its own global', () => {
  const originalWindow = globalThis.window;
  const fakeWindow = { location: { href: 'https://example.test/game?e2e=run-42' } } as any;
  Object.defineProperty(globalThis, 'window', { configurable: true, value: fakeWindow });

  try {
    const diagnostics = installJiaobeiE2eDiagnostics();
    assert.ok(diagnostics);
    assert.equal(fakeWindow.__JIAOBEI_E2E__.snapshot().runId, 'run-42');
    diagnostics.dispose(50);
    assert.equal(fakeWindow.__JIAOBEI_E2E__, undefined);

    fakeWindow.location.href = 'https://example.test/game';
    assert.equal(installJiaobeiE2eDiagnostics(), null);
  } finally {
    if (originalWindow) {
      Object.defineProperty(globalThis, 'window', { configurable: true, value: originalWindow });
    } else {
      delete (globalThis as any).window;
    }
  }
});
