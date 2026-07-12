import assert from 'node:assert/strict';
import test from 'node:test';
import {
  requestCameraAccess,
  startCameraPreviewSession,
  stopCameraStream,
  type CameraAccessEnvironment,
} from '../src/games/shantou-jiaobei/vision/cameraAccess.ts';

function namedError(name: string): Error {
  return Object.assign(new Error(name), { name });
}

test('camera access reports an insecure page before requesting hardware', async () => {
  let requests = 0;
  const environment: CameraAccessEnvironment = {
    secureContext: false,
    mediaDevices: {
      async getUserMedia() {
        requests++;
        throw new Error('must not run');
      },
    },
  };

  const result = await requestCameraAccess(environment);

  assert.deepEqual(result, {
    ok: false,
    issue: {
      code: 'insecure-context',
      reason: '请使用 HTTPS 或本机地址开启摄像头',
      retryable: false,
    },
  });
  assert.equal(requests, 0);
});

test('camera access reports browsers without mediaDevices', async () => {
  const result = await requestCameraAccess({ secureContext: true });

  assert.deepEqual(result, {
    ok: false,
    issue: {
      code: 'unsupported',
      reason: '当前浏览器不支持摄像头访问',
      retryable: false,
    },
  });
});

test('camera access classifies browser failures with actionable reasons', async () => {
  const cases = [
    ['NotAllowedError', 'permission-denied', '摄像头权限被拒绝'],
    ['SecurityError', 'security-blocked', '摄像头被浏览器安全策略阻止'],
    ['NotFoundError', 'not-found', '未找到摄像头'],
    ['OverconstrainedError', 'not-found', '未找到符合要求的摄像头'],
    ['NotReadableError', 'busy', '摄像头正被其他应用占用'],
    ['AbortError', 'unavailable', '摄像头暂时不可用'],
    ['UnknownError', 'unavailable', '摄像头暂时不可用'],
  ] as const;

  for (const [name, code, reason] of cases) {
    const result = await requestCameraAccess({
      secureContext: true,
      mediaDevices: {
        async getUserMedia() {
          throw namedError(name);
        },
      },
    });

    assert.deepEqual(result, {
      ok: false,
      issue: { code, reason, retryable: true },
    });
  }
});

test('camera access can be retried after a rejected request', async () => {
  const stream = { getTracks: () => [] } as unknown as MediaStream;
  let attempts = 0;
  const environment: CameraAccessEnvironment = {
    secureContext: true,
    mediaDevices: {
      async getUserMedia() {
        attempts++;
        if (attempts === 1) throw namedError('NotAllowedError');
        return stream;
      },
    },
  };

  const first = await requestCameraAccess(environment);
  const second = await requestCameraAccess(environment);

  assert.equal(first.ok, false);
  assert.deepEqual(second, { ok: true, stream });
  assert.equal(attempts, 2);
});

test('stopping a camera stream releases every track', () => {
  let stopped = 0;
  const stream = {
    getTracks: () => [
      { stop: () => stopped++ },
      { stop: () => stopped++ },
    ],
  } as unknown as MediaStream;

  stopCameraStream(stream);

  assert.equal(stopped, 2);
});

test('gesture-model failure keeps an already playing camera preview alive', async () => {
  let played = false;
  let previewReady = 0;
  let stopped = 0;
  let rejectRecognizer: (error: Error) => void = () => undefined;
  const stream = {
    getTracks: () => [{ stop: () => stopped++ }],
  } as unknown as MediaStream;
  const video = {
    srcObject: null,
    async play() {
      played = true;
    },
  } as unknown as Pick<HTMLVideoElement, 'srcObject' | 'play'>;

  const startup = startCameraPreviewSession(
    video,
    stream,
    () => new Promise<never>((_resolve, reject) => {
      rejectRecognizer = reject;
    }),
    () => {
      previewReady++;
    },
  );

  await Promise.resolve();

  assert.equal(played, true);
  assert.equal(video.srcObject, stream);
  assert.equal(previewReady, 1);
  assert.equal(stopped, 0);

  rejectRecognizer(new Error('model unavailable'));
  const session = await startup;

  assert.equal(session.recognizer, null);
  assert.match(String(session.recognitionError), /model unavailable/);
  assert.equal(stopped, 0);
});
