import assert from 'node:assert/strict';
import test from 'node:test';
import { runSeededThrows } from './helpers/jiaobeiPhysicsHarness.ts';

test('seeded harness can capture per-attempt settlement traces on demand', async () => {
  const [report] = await runSeededThrows(1, 290, { captureAttemptTraces: true });

  assert.equal(report.attemptTraces?.length, 1);
  assert.equal(report.attemptTraces?.[0].attempt, 1);
  assert.equal(report.attemptTraces?.[0].reason, 'settled');
  assert.ok((report.attemptTraces?.[0].samples.length ?? 0) > 0);
  assert.equal(report.attemptTraces?.[0].samples.at(-1)?.pieces.length, 2);
  assert.ok(report.attemptTraces?.[0].samples.some((sample) => (
    sample.pieces.some((piece) => piece.landed && piece.assistCount === 0)
  )));
});

test('waking a sleeping body before edge assist lets the impulse advance its pose', async () => {
  const [report] = await runSeededThrows(1, 439, {
    captureAttemptTraces: true,
    wakeBeforeAssist: true,
    keepBodiesAwake: false,
  } as Parameters<typeof runSeededThrows>[2]);

  assert.equal(report.attemptCount, 1);
  assert.ok(report.settledMs <= 3200);
  const assistedPieceDots = report.attemptTraces?.[0].samples
    .filter((sample) => sample.pieces.some((piece) => piece.assistUsed))
    .map((sample) => sample.pieces[1].upDot) ?? [];
  assert.ok(new Set(assistedPieceDots.map((dot) => dot.toFixed(6))).size > 1);
});

test('keeping active-attempt bodies awake prevents a nonzero frozen edge state', async () => {
  const [report] = await runSeededThrows(1, 290, { captureAttemptTraces: true });

  assert.equal(report.attemptCount, 1);
  assert.ok(report.settledMs <= 3200);
  assert.ok(report.pieces.every((piece) => Math.abs(piece.finalUpDot) >= 0.9));
});

test('broad-face contact braking can catch a clear face before it rolls away', async () => {
  const [report] = await runSeededThrows(1, 296);

  assert.equal(report.attemptCount, 1);
  assert.ok(report.settledMs <= 3200);
});

test('face-brake hysteresis avoids tipping a face that only drifts below 0.90', async () => {
  const [report] = await runSeededThrows(1, 949);

  assert.equal(report.attemptCount, 1);
  assert.ok(report.settledMs <= 3200);
  assert.ok(report.pieces.every((piece) => Math.abs(piece.finalUpDot) >= 0.9));
});
