/**
 * MediaPipe HandLandmarker 封装。
 *
 * 资源（WASM runtime + 模型）从 Google CDN 加载 —— 这是 MediaPipe 官方推荐方式，
 * 避免把 ~10MB 资源打进静态产物。静态部署到 Gitee Pages 时，CDN 仍可访问。
 *
 * 浏览器 API：仅在客户端调用。
 */
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

const WASM_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

interface ClosableDetector {
  close(): void;
}

export interface DetectorLease<T> {
  ready: Promise<T>;
  release(): void;
}

export class SharedDetectorPool<T extends ClosableDetector> {
  private detectorPromise: Promise<T> | null = null;
  private detector: T | null = null;
  private consumers = 0;
  private readonly createDetector: () => Promise<T>;

  constructor(createDetector: () => Promise<T>) {
    this.createDetector = createDetector;
  }

  acquire(): DetectorLease<T> {
    this.consumers++;
    let released = false;
    return {
      ready: this.getOrCreateDetector(),
      release: () => {
        if (released) return;
        released = true;
        this.consumers--;
        this.closeDetectorIfUnused();
      },
    };
  }

  private getOrCreateDetector(): Promise<T> {
    if (this.detectorPromise) return this.detectorPromise;

    let pending: Promise<T>;
    pending = Promise.resolve().then(this.createDetector).then(
      (detector) => {
        this.detector = detector;
        this.closeDetectorIfUnused();
        return detector;
      },
      (error: unknown) => {
        if (this.detectorPromise === pending) this.detectorPromise = null;
        throw error;
      },
    );
    this.detectorPromise = pending;
    return pending;
  }

  private closeDetectorIfUnused(): void {
    if (this.consumers !== 0 || !this.detector) return;

    const detector = this.detector;
    this.detector = null;
    this.detectorPromise = null;
    detector.close();
  }
}

const handLandmarkerPool = new SharedDetectorPool(async () => {
  const fileset = await FilesetResolver.forVisionTasks(WASM_BASE);
  return HandLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
    runningMode: 'VIDEO',
    numHands: 2,
  });
});

export type HandLandmarkerLease = DetectorLease<HandLandmarker>;

export function acquireHandLandmarker(): HandLandmarkerLease {
  return handLandmarkerPool.acquire();
}

export type { HandLandmarker };
