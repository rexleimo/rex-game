import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import * as detectorModule from '../src/games/shantou-jiaobei/vision/HandsDetector.ts';

const cameraPanelSource = readFileSync(new URL(
  '../src/games/shantou-jiaobei/vision/CameraPosePanel.tsx',
  import.meta.url,
), 'utf8');

interface FakeDetector {
  close(): void;
}

interface DetectorLease {
  ready: Promise<FakeDetector>;
  release(): void;
}

type DetectorPoolConstructor = new (
  createDetector: () => Promise<FakeDetector>,
) => { acquire(): DetectorLease };

function detectorPoolConstructor(): DetectorPoolConstructor {
  const Pool = (detectorModule as unknown as {
    SharedDetectorPool?: DetectorPoolConstructor;
  }).SharedDetectorPool;

  if (!Pool) assert.fail('HandsDetector must expose SharedDetectorPool');
  return Pool;
}

test('the production hand detector is acquired through a releasable lease', () => {
  const acquire = (detectorModule as unknown as {
    acquireHandLandmarker?: () => DetectorLease;
  }).acquireHandLandmarker;

  assert.equal(typeof acquire, 'function');
});

test('camera panel cleanup releases its hand detector lease', () => {
  const cleanupStart = cameraPanelSource.lastIndexOf('return () => {');
  assert.ok(cleanupStart >= 0);
  const cleanup = cameraPanelSource.slice(cleanupStart, cleanupStart + 220);

  assert.match(cleanup, /releaseRecognizer\(\)/);
});

test('camera panel releases a failed hand detector acquisition immediately', () => {
  const failureStart = cameraPanelSource.indexOf('if (!session.recognizer)');
  assert.ok(failureStart >= 0);
  const failureBranch = cameraPanelSource.slice(failureStart, failureStart + 320);

  assert.match(failureBranch, /releaseRecognizer\(\)/);
});

test('a hand model failure explicitly preserves a retryable preview state', () => {
  const failureStart = cameraPanelSource.indexOf('if (!session.recognizer)');
  assert.ok(failureStart >= 0);
  const failureBranch = cameraPanelSource.slice(failureStart, failureStart + 520);

  assert.match(failureBranch, /setStatus\('preview'\)/);
  assert.match(failureBranch, /retryable:\s*true/);
});

test('a retryable preview renders a gesture-model retry action', () => {
  const retryStart = cameraPanelSource.indexOf("status === 'preview' && issue?.retryable");
  assert.ok(retryStart >= 0);
  const retryMarkup = cameraPanelSource.slice(retryStart, retryStart + 520);

  assert.match(retryMarkup, /<button/);
  assert.match(retryMarkup, /onClick=\{retryCamera\}/);
});

test('a failed detector creation is not cached for the next acquisition', async () => {
  const detector = { close() {} };
  let attempts = 0;
  const Pool = detectorPoolConstructor();
  const pool = new Pool(async () => {
    attempts++;
    if (attempts === 1) throw new Error('model unavailable');
    return detector;
  });

  const failedLease = pool.acquire();
  await assert.rejects(failedLease.ready, /model unavailable/);
  failedLease.release();

  const retryLease = pool.acquire();
  assert.equal(await retryLease.ready, detector);
  assert.equal(attempts, 2);
  retryLease.release();
});

test('the shared detector closes only after its last consumer releases it', async () => {
  let creations = 0;
  let closes = 0;
  const Pool = detectorPoolConstructor();
  const pool = new Pool(async () => {
    creations++;
    return { close: () => closes++ };
  });

  const first = pool.acquire();
  const second = pool.acquire();
  assert.equal(await first.ready, await second.ready);
  assert.equal(creations, 1);

  first.release();
  first.release();
  assert.equal(closes, 0);

  second.release();
  assert.equal(closes, 1);

  const replacement = pool.acquire();
  await replacement.ready;
  assert.equal(creations, 2);
  replacement.release();
  assert.equal(closes, 2);
});

test('a detector that finishes loading after every consumer leaves is closed', async () => {
  let closeCount = 0;
  let resolveDetector: (detector: FakeDetector) => void = () => undefined;
  const detector = { close: () => closeCount++ };
  const Pool = detectorPoolConstructor();
  const pool = new Pool(() => new Promise<FakeDetector>((resolve) => {
    resolveDetector = resolve;
  }));

  const lease = pool.acquire();
  await Promise.resolve();
  lease.release();
  resolveDetector(detector);

  assert.equal(await lease.ready, detector);
  assert.equal(closeCount, 1);
});

test('a shared pending detector is closed once when all pending consumers leave', async () => {
  let closeCount = 0;
  let resolveDetector: (detector: FakeDetector) => void = () => undefined;
  const detector = { close: () => closeCount++ };
  const Pool = detectorPoolConstructor();
  const pool = new Pool(() => new Promise<FakeDetector>((resolve) => {
    resolveDetector = resolve;
  }));

  const first = pool.acquire();
  const second = pool.acquire();
  await Promise.resolve();
  first.release();
  second.release();
  resolveDetector(detector);

  await Promise.all([first.ready, second.ready]);
  assert.equal(closeCount, 1);
});
