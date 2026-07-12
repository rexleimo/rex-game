export type CameraAccessIssueCode =
  | 'insecure-context'
  | 'unsupported'
  | 'permission-denied'
  | 'security-blocked'
  | 'not-found'
  | 'busy'
  | 'unavailable';

export interface CameraAccessIssue {
  code: CameraAccessIssueCode;
  reason: string;
  retryable: boolean;
}

export interface CameraAccessEnvironment {
  secureContext: boolean;
  mediaDevices?: Pick<MediaDevices, 'getUserMedia'>;
}

export type CameraAccessResult =
  | { ok: true; stream: MediaStream }
  | { ok: false; issue: CameraAccessIssue };

export interface CameraPreviewSession<T> {
  recognizer: T | null;
  recognitionError: unknown | null;
}

const CAMERA_CONSTRAINTS: MediaStreamConstraints = {
  video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
  audio: false,
};

export function getBrowserCameraEnvironment(): CameraAccessEnvironment {
  return {
    secureContext: window.isSecureContext,
    mediaDevices: navigator.mediaDevices,
  };
}

export async function requestCameraAccess(
  environment: CameraAccessEnvironment = getBrowserCameraEnvironment(),
): Promise<CameraAccessResult> {
  if (!environment.secureContext) {
    return failure('insecure-context', '请使用 HTTPS 或本机地址开启摄像头', false);
  }
  if (!environment.mediaDevices?.getUserMedia) {
    return failure('unsupported', '当前浏览器不支持摄像头访问', false);
  }

  try {
    const stream = await environment.mediaDevices.getUserMedia(CAMERA_CONSTRAINTS);
    return { ok: true, stream };
  } catch (error) {
    return { ok: false, issue: classifyCameraAccessError(error) };
  }
}

export function stopCameraStream(stream: MediaStream | null | undefined): void {
  stream?.getTracks().forEach((track) => track.stop());
}

export async function startCameraPreviewSession<T>(
  video: Pick<HTMLVideoElement, 'srcObject' | 'play'>,
  stream: MediaStream,
  loadRecognizer: () => Promise<T>,
  onPreviewReady: () => void,
): Promise<CameraPreviewSession<T>> {
  video.srcObject = stream;
  await video.play();
  onPreviewReady();

  try {
    return { recognizer: await loadRecognizer(), recognitionError: null };
  } catch (recognitionError) {
    return { recognizer: null, recognitionError };
  }
}

function classifyCameraAccessError(error: unknown): CameraAccessIssue {
  const name = typeof error === 'object' && error !== null && 'name' in error
    ? String(error.name)
    : '';

  switch (name) {
    case 'NotAllowedError':
      return issue('permission-denied', '摄像头权限被拒绝');
    case 'SecurityError':
      return issue('security-blocked', '摄像头被浏览器安全策略阻止');
    case 'NotFoundError':
      return issue('not-found', '未找到摄像头');
    case 'OverconstrainedError':
      return issue('not-found', '未找到符合要求的摄像头');
    case 'NotReadableError':
    case 'TrackStartError':
      return issue('busy', '摄像头正被其他应用占用');
    default:
      return issue('unavailable', '摄像头暂时不可用');
  }
}

function issue(code: CameraAccessIssueCode, reason: string): CameraAccessIssue {
  return { code, reason, retryable: true };
}

function failure(
  code: CameraAccessIssueCode,
  reason: string,
  retryable: boolean,
): CameraAccessResult {
  return { ok: false, issue: { code, reason, retryable } };
}
