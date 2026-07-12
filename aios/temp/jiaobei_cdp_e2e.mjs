import { mkdirSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';

const mode = process.env.MODE || 'desktop';
const runId = `${mode}-${Date.now()}-${randomUUID().slice(0, 8)}`;
const evidenceDir = join(process.cwd(), 'aios', 'temp', 'jiaobei-e2e', runId);
mkdirSync(evidenceDir, { recursive: true });

const targets = await fetch('http://127.0.0.1:9222/json/list').then((response) => response.json());
const targetId = process.env.CDP_TARGET;
const target = targetId
  ? targets.find((candidate) => candidate.id === targetId)
  : targets.find((candidate) => candidate.type === 'page');
if (!target) throw new Error('No CDP page target was found');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function createClient(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  let messageId = 0;
  const pending = new Map();
  const events = [];

  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (!message.id) {
      events.push(message);
      return;
    }
    const waiter = pending.get(message.id);
    if (!waiter) return;
    pending.delete(message.id);
    if (message.error) waiter.reject(new Error(JSON.stringify(message.error)));
    else waiter.resolve(message.result);
  });

  return {
    socket,
    events,
    ready: new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve, { once: true });
      socket.addEventListener('error', reject, { once: true });
    }),
    send(method, params = {}) {
      const id = ++messageId;
      socket.send(JSON.stringify({ id, method, params }));
      return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
    },
    close() {
      socket.close();
    },
  };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function rectsOverlap(a, b) {
  return Math.min(a.right, b.right) > Math.max(a.left, b.left)
    && Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top);
}

function overlapArea(a, b) {
  return Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left))
    * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
}

function serializeError(error) {
  return error instanceof Error
    ? { name: error.name, message: error.message, stack: error.stack }
    : { message: String(error) };
}

const client = createClient(target.webSocketDebuggerUrl);
await client.ready;
const { send } = client;

async function evaluate(expression) {
  const result = await send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  }
  return result.result.value;
}

async function waitFor(predicate, timeoutMs = 15000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await evaluate(predicate)) return;
    await delay(50);
  }
  throw new Error(`Timed out waiting for ${predicate}`);
}

async function waitForTwoRafs() {
  await evaluate(`new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))`);
}

async function setE2eVisibility(state) {
  await evaluate(`(() => {
    const nextState = ${JSON.stringify(state)};
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => nextState,
    });
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => nextState === 'hidden',
    });
    document.dispatchEvent(new Event('visibilitychange'));
  })()`);
}

async function screenshotElement(selector, filename) {
  const rect = await evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return null;
    const bounds = element.getBoundingClientRect();
    return {
      x: bounds.left + scrollX,
      y: bounds.top + scrollY,
      width: bounds.width,
      height: bounds.height,
    };
  })()`);
  assert(rect && rect.width > 0 && rect.height > 0, `Missing screenshot element ${selector}`);
  const result = await send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
    clip: { ...rect, scale: 1 },
  });
  const path = join(evidenceDir, filename);
  writeFileSync(path, Buffer.from(result.data, 'base64'));
  return path;
}

async function summarize() {
  return evaluate(`(() => {
    const rect = (element) => {
      if (!element) return null;
      const value = element.getBoundingClientRect();
      return {
        left: value.left,
        top: value.top,
        right: value.right,
        bottom: value.bottom,
        width: value.width,
        height: value.height,
      };
    };
    const video = document.querySelector('video');
    const stream = video?.srcObject;
    const track = stream?.getVideoTracks?.()[0];
    const stage = rect(document.querySelector('.offering__stage'));
    const camera = rect(document.querySelector('.offering__cam'));
    return {
      visibility: document.visibilityState,
      hasFocus: document.hasFocus(),
      result: document.querySelector('.offering__pop')?.innerText || null,
      stage,
      camera,
      cameraInsideStage: Boolean(document.querySelector('.offering__stage .offering__cam')),
      video: video ? {
        readyState: video.readyState,
        currentTime: video.currentTime,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        paused: video.paused,
        streamActive: stream?.active ?? null,
        trackState: track?.readyState ?? null,
        trackEnabled: track?.enabled ?? null,
      } : null,
      timeline: window.__JIAOBEI_TIMELINE__ || null,
      snapshot: window.__JIAOBEI_E2E__?.snapshot() || null,
    };
  })()`);
}

async function openGame(width, height, mobile) {
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Log.enable');
  try {
    const { windowId } = await send('Browser.getWindowForTarget', { targetId: target.id });
    await send('Browser.setWindowBounds', {
      windowId,
      bounds: { windowState: 'normal', left: 40, top: 40, width, height },
    });
  } catch {
    // Headless CDP targets have no native browser window to resize.
  }
  await send('Page.bringToFront');
  await send('Page.setWebLifecycleState', { state: 'active' });
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile,
  });
  await send('Page.navigate', {
    url: `http://127.0.0.1:3030/games/shantou-jiaobei/?e2e=${encodeURIComponent(runId)}`,
  });
  await waitFor('document.readyState === "complete"');
  await send('Page.bringToFront');
  await send('Page.setWebLifecycleState', { state: 'active' });
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  await waitFor('document.visibilityState === "visible"');
  await waitForTwoRafs();
  await waitFor(`[...document.querySelectorAll('button')].some((button) => button.innerText.includes('开始这一问'))`);
  await evaluate(`[...document.querySelectorAll('button')].find((button) => button.innerText.includes('开始这一问')).click()`);
  await waitFor(`Boolean(document.querySelector('.offering__stage'))`);
  await waitFor(`(() => {
    const button = [...document.querySelectorAll('button')].find((candidate) => candidate.innerText.includes('掷 杯'));
    return Boolean(button && !button.disabled && window.__JIAOBEI_E2E__);
  })()`, 20000);
  await evaluate(`document.querySelector('.offering__visual').scrollIntoView({ block: 'center' })`);
  await waitForTwoRafs();
  await evaluate(`(() => {
    const timeline = {
      throwStartedAt: null,
      resultVisibleAt: null,
      visibility: [{ state: document.visibilityState, at: performance.now() }],
    };
    window.__JIAOBEI_TIMELINE__ = timeline;
    new MutationObserver(() => {
      if (timeline.resultVisibleAt === null && document.querySelector('.offering__pop')) {
        timeline.resultVisibleAt = performance.now();
      }
    }).observe(document.body, { childList: true, subtree: true });
    document.addEventListener('visibilitychange', () => {
      timeline.visibility.push({ state: document.visibilityState, at: performance.now() });
    });
  })()`);
}

async function seedRandom(sampleIndex) {
  await evaluate(`(() => {
    let state = Math.imul(${sampleIndex + 1}, 0x9e3779b1) >>> 0;
    Math.random = () => {
      state = (Math.imul(1664525, state) + 1013904223) >>> 0;
      return state / 4294967296;
    };
  })()`);
}

async function clickThrow() {
  await evaluate(`(() => {
    const button = [...document.querySelectorAll('button')].find((candidate) => candidate.innerText.includes('掷 杯'));
    if (!button || button.disabled) throw new Error('Throw button is not ready');
    window.__JIAOBEI_TIMELINE__.throwStartedAt = performance.now();
    button.click();
  })()`);
}

async function waitForSettled() {
  await waitFor(`(() => {
    const snapshot = window.__JIAOBEI_E2E__?.snapshot();
    return snapshot?.status === 'settled' && Boolean(document.querySelector('.offering__pop'));
  })()`, 10000);
  return summarize();
}

function assertSettled(summary) {
  const snapshot = summary.snapshot;
  assert(summary.visibility === 'visible', 'target page must be foreground');
  assert(snapshot?.status === 'settled', 'physics must settle before UI result');
  assert(snapshot.pieces.length === 2, 'two physical pieces are required');
  assert(snapshot.pieces.every((piece) => Math.abs(piece.upDot) >= 0.90), 'edge result');
  assert(!rectsOverlap(snapshot.pieces[0].screenBounds, snapshot.pieces[1].screenBounds), 'pieces overlap');
  const resultVisibleAfterMs = summary.timeline.resultVisibleAt - summary.timeline.throwStartedAt;
  assert(Number.isFinite(resultVisibleAfterMs), 'result visibility timing is unavailable');
  assert(resultVisibleAfterMs <= 2600, `slow result ${resultVisibleAfterMs}ms`);
  return resultVisibleAfterMs;
}

async function assertLiveVideo(before) {
  const after = await evaluate(`new Promise((resolve) => {
    const video = document.querySelector('video');
    if (!video) return resolve(null);
    const startedAt = video.currentTime;
    const finish = () => resolve({ startedAt, currentTime: video.currentTime });
    if (typeof video.requestVideoFrameCallback === 'function') {
      const timeout = setTimeout(finish, 1000);
      video.requestVideoFrameCallback(() => { clearTimeout(timeout); finish(); });
    } else {
      setTimeout(finish, 300);
    }
  })`);
  assert(before.video, 'camera video is missing');
  assert(before.video.trackState === 'live', 'camera video track is not live');
  assert(before.video.trackEnabled === true, 'camera video track is disabled');
  assert(before.video.readyState >= 2, `camera readyState ${before.video.readyState}`);
  assert(before.video.videoWidth > 0 && before.video.videoHeight > 0, 'camera has no decoded dimensions');
  assert(after && after.currentTime > after.startedAt, 'camera video did not advance');
  return after;
}

let report = { mode, runId, evidenceDir };
let failure;
try {
  if (mode === 'desktop' || mode === 'mobile') {
    await openGame(mode === 'mobile' ? 390 : 1280, mode === 'mobile' ? 844 : 900, mode === 'mobile');
    await seedRandom(17);
    const before = await summarize();
    const readyScreenshot = await screenshotElement('.offering__visual', 'ready.png');
    await clickThrow();
    await delay(900);
    const throwingScreenshot = await screenshotElement('.offering__visual', 'throwing-900ms.png');
    const final = await waitForSettled();
    const settledScreenshot = await screenshotElement('.offering__visual', 'settled.png');
    const resultVisibleAfterMs = assertSettled(final);
    let videoProgress = null;

    if (mode === 'mobile') {
      assert(before.stage && before.stage.width > 0 && before.stage.height > 0, 'mobile stage has no size');
      assert(before.camera && before.camera.width > 0 && before.camera.height > 0, 'mobile camera has no size');
      assert(before.cameraInsideStage === false, 'camera DOM is inside the stage');
      assert(overlapArea(before.stage, before.camera) === 0, 'camera overlaps the stage');
      assert(before.camera.top >= before.stage.bottom - 0.5, 'camera is not below the stage');
      videoProgress = await assertLiveVideo(before);
    }
    report = {
      ...report,
      before,
      final,
      resultVisibleAfterMs,
      videoProgress,
      screenshots: { readyScreenshot, throwingScreenshot, settledScreenshot },
    };
  } else if (mode === 'background') {
    await openGame(1280, 900, false);
    await seedRandom(17);
    await clickThrow();
    await waitFor(`window.__JIAOBEI_E2E__?.snapshot().status === 'throwing' && window.__JIAOBEI_E2E__?.snapshot().attemptCount === 1`);
    const beforeHidden = await summarize();
    await send('Emulation.setFocusEmulationEnabled', { enabled: false });
    await setE2eVisibility('hidden');
    await waitFor(`document.visibilityState === 'hidden'`);
    await waitFor(`window.__JIAOBEI_TIMELINE__.visibility.some((event) => event.state === 'hidden')`);
    const hiddenStart = await summarize();
    await delay(4300);
    const whileHidden = await summarize();

    assert(whileHidden.snapshot.status === 'throwing', 'hidden throw settled unexpectedly');
    assert(whileHidden.snapshot.attemptCount === 1, 'hidden throw changed attempt');
    assert(whileHidden.snapshot.retryCount === 0, 'hidden throw retried');
    assert(JSON.stringify(whileHidden.snapshot.events) === JSON.stringify(hiddenStart.snapshot.events), 'hidden event sequence changed');
    assert(whileHidden.snapshot.activePhysicsElapsedMs === hiddenStart.snapshot.activePhysicsElapsedMs, 'hidden physics time advanced');
    assert(whileHidden.snapshot.settlementSampleCount === hiddenStart.snapshot.settlementSampleCount, 'hidden settlement sampling advanced');
    assert(whileHidden.snapshot.stillChecks === hiddenStart.snapshot.stillChecks, 'hidden still checks advanced');

    await send('Page.bringToFront');
    await send('Page.setWebLifecycleState', { state: 'active' });
    await send('Emulation.setFocusEmulationEnabled', { enabled: true });
    await setE2eVisibility('visible');
    await waitFor(`document.visibilityState === 'visible'`);
    await waitForTwoRafs();
    const final = await waitForSettled();
    const visibility = final.timeline.visibility;
    const hiddenEvent = visibility.find((event) => event.state === 'hidden');
    const visibleEvent = [...visibility].reverse().find((event) => event.state === 'visible');
    const actualHiddenMs = visibleEvent.at - hiddenEvent.at;
    assert(actualHiddenMs >= 4200, `hidden duration ${actualHiddenMs}ms`);
    assert(final.snapshot.attemptCount === 1, 'resumed throw changed attempt');
    assert(final.snapshot.retryCount === 0, 'resumed throw retried');
    const settledScreenshot = await screenshotElement('.offering__visual', 'resumed-settled.png');
    report = {
      ...report,
      beforeHidden,
      hiddenStart,
      whileHidden,
      final,
      actualHiddenMs,
      visibilityDriver: 'document-override',
      screenshots: { settledScreenshot },
    };
  } else {
    throw new Error(`Unknown MODE=${mode}`);
  }

  const errors = client.events.filter((event) => (
    event.method === 'Runtime.exceptionThrown'
    || (event.method === 'Log.entryAdded' && event.params?.entry?.level === 'error')
  ));
  assert(errors.length === 0, `browser emitted ${errors.length} runtime/console errors`);
  report.errors = errors;
} catch (error) {
  failure = serializeError(error);
  report.failure = failure;
  process.exitCode = 1;
} finally {
  report.browserErrors = client.events.filter((event) => (
    event.method === 'Runtime.exceptionThrown'
    || (event.method === 'Log.entryAdded' && event.params?.entry?.level === 'error')
  ));
  const reportPath = join(evidenceDir, 'report.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ ...report, reportPath }, null, 2));
  client.close();
}
