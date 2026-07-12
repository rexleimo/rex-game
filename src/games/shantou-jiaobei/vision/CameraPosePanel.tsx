'use client';

import { useEffect, useRef, useState } from 'react';
import { detectPrayerPose } from './PrayerPose';
import type { HandLandmarker, HandLandmarkerLease } from './HandsDetector';
import {
  requestCameraAccess,
  startCameraPreviewSession,
  stopCameraStream,
  type CameraAccessIssue,
} from './cameraAccess';

/**
 * 摄像头「双手合十」姿势识别面板。
 *
 * - 请求 getUserMedia 拿到摄像头流
 * - 用 MediaPipe HandLandmarker 逐帧 detectForVideo
 * - 用 PrayerPose 判定；持续合十 HOLD_MS 毫秒 → onPrayer() 触发掷杯
 * - 权限拒绝/无摄像头/不支持 → onUnavailable()，由父组件走按钮降级
 *
 * 隐私：视频流仅在本地浏览器处理，不上传。
 */
const HOLD_MS = 5000; // 持续合十多久才触发 —— 留足静心思考的仪式感

export function CameraPosePanel({
  enabled,
  onPrayer,
  onUnavailable,
  onAvailable,
  compact = false,
}: {
  enabled: boolean; // 父组件控制开启/暂停识别（如掷杯进行中应暂停）
  onPrayer: () => void;
  onUnavailable: (reason: string) => void;
  onAvailable: () => void;
  /** 缩小浮层模式（角落小窗）：隐藏长文本，缩小进度条/分数 */
  compact?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'loading' | 'preview' | 'ready' | 'denied' | 'error'>('loading');
  const [issue, setIssue] = useState<CameraAccessIssue | null>(null);
  const [hint, setHint] = useState('正在准备摄像头…');
  const [hold, setHold] = useState(0); // 0~1 合十保持进度
  const [score, setScore] = useState(0);
  const [retryKey, setRetryKey] = useState(0);

  const rafRef = useRef(0);
  const lastTsRef = useRef(0);
  const holdStartRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const firedRef = useRef(false);
  const enabledRef = useRef(enabled);
  const onPrayerRef = useRef(onPrayer);
  const onUnavailableRef = useRef(onUnavailable);
  const onAvailableRef = useRef(onAvailable);

  enabledRef.current = enabled;
  onPrayerRef.current = onPrayer;
  onUnavailableRef.current = onUnavailable;
  onAvailableRef.current = onAvailable;

  useEffect(() => {
    let cancelled = false;
    let recognizerLease: HandLandmarkerLease | null = null;

    const stopLoop = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
    const releaseStream = () => {
      const stream = streamRef.current;
      if (videoRef.current?.srcObject === stream) videoRef.current.srcObject = null;
      stopCameraStream(stream);
      streamRef.current = null;
    };
    const releaseRecognizer = () => {
      recognizerLease?.release();
      recognizerLease = null;
    };
    const startLoop = (
      video: HTMLVideoElement,
      landmarker: HandLandmarker,
    ) => {
      stopLoop();
      const tick = () => {
        if (cancelled) return;
        if (video.readyState >= 2 && enabledRef.current && !firedRef.current) {
          const ts = performance.now();
          if (ts !== lastTsRef.current) {
            lastTsRef.current = ts;
            try {
              const res = landmarker.detectForVideo(video, ts);
              const handedness = (res.handedness || []).map(
                (h) => h[0]?.categoryName || '',
              );
              const pose = detectPrayerPose(res.landmarks || [], handedness);
              setScore(pose.score);
              if (pose.isPrayer && enabledRef.current && !firedRef.current) {
                if (holdStartRef.current == null) holdStartRef.current = ts;
                const ratio = Math.min(1, (ts - holdStartRef.current) / HOLD_MS);
                setHold(ratio);
                const remain = Math.max(1, Math.ceil((1 - ratio) * HOLD_MS / 1000));
                setHint(`保持合十，静心许愿… 还需 ${remain} 秒`);
                if (ratio >= 1) {
                  firedRef.current = true;
                  onPrayerRef.current();
                }
              } else {
                holdStartRef.current = null;
                setHold(0);
                setHint(pose.hint);
              }
            } catch {
              /* 帧检测偶发错误，忽略 */
            }
          }
        } else if (!enabledRef.current && holdStartRef.current != null) {
          holdStartRef.current = null;
          setHold(0);
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    async function start() {
      setStatus('loading');
      setIssue(null);
      setHint('正在准备摄像头…');
      firedRef.current = false;
      holdStartRef.current = null;
      setHold(0);

      const access = await requestCameraAccess();
      if (cancelled) {
        if (access.ok) stopCameraStream(access.stream);
        return;
      }
      if (!access.ok) {
        const denied = access.issue.code === 'permission-denied'
          || access.issue.code === 'security-blocked'
          || access.issue.code === 'not-found';
        setStatus(denied ? 'denied' : 'error');
        setIssue(access.issue);
        setHint(access.issue.reason);
        onUnavailableRef.current(access.issue.reason);
        return;
      }

      streamRef.current = access.stream;
      try {
        const video = videoRef.current;
        if (!video) {
          releaseStream();
          return;
        }
        const session = await startCameraPreviewSession(
          video,
          access.stream,
          async () => {
            const { acquireHandLandmarker } = await import('./HandsDetector');
            if (cancelled) throw new Error('camera panel stopped');
            recognizerLease = acquireHandLandmarker();
            return recognizerLease.ready;
          },
          () => {
            if (cancelled) return;
            setStatus('preview');
            setIssue(null);
            setHint('摄像头已开启，正在准备手势识别…');
            onAvailableRef.current();
          },
        );
        if (cancelled) return;

        if (!session.recognizer) {
          releaseRecognizer();
          setStatus('preview');
          setIssue({
            code: 'unavailable',
            reason: '手势识别暂不可用',
            retryable: true,
          });
          setHint('摄像头已开启；手势识别暂不可用，可点击按钮掷杯');
          onUnavailableRef.current('手势识别暂不可用');
          return;
        }

        setStatus('ready');
        setIssue(null);
        setHint('双手合十，指尖朝上，置于胸前');
        startLoop(video, session.recognizer);
      } catch {
        if (cancelled) return;
        releaseStream();
        setStatus('error');
        setHint('摄像头预览启动失败');
        setIssue({
          code: 'unavailable',
          reason: '摄像头预览启动失败',
          retryable: true,
        });
        onUnavailableRef.current('摄像头预览启动失败');
      }
    }

    void start();

    return () => {
      cancelled = true;
      stopLoop();
      releaseRecognizer();
      releaseStream();
    };
  }, [retryKey]);

  // 父组件 enable 变化时重置触发态，允许下一次掷杯再识别
  useEffect(() => {
    if (enabled) {
      firedRef.current = false;
      holdStartRef.current = null;
      setHold(0);
    }
  }, [enabled]);

  const remainingSec = Math.max(1, Math.ceil((1 - hold) * HOLD_MS / 1000));
  const retryCamera = () => setRetryKey((key) => key + 1);

  return (
    <div className={`camp${compact ? ' camp--compact' : ''}`}>
      <div className="camp__frame">
        <video
          ref={videoRef}
          className="camp__video"
          playsInline
          muted
          // 镜像，体验更自然（像照镜子）
          style={{ transform: 'scaleX(-1)' }}
        />
        {/* 合十保持进度环 */}
        {status === 'ready' && (
          <div className="camp__hold" aria-hidden>
            <div className="camp__holdbar" style={{ width: `${hold * 100}%` }} />
          </div>
        )}
        {status === 'ready' && !compact && hold <= 0 && (
          <div className="camp__score">姿势匹配 {Math.round(score * 100)}%</div>
        )}
        {status === 'ready' && !compact && hold > 0 && (
          <div className="camp__counting">静心 {remainingSec}s</div>
        )}
        {status === 'ready' && compact && hold > 0 && (
          <div className="camp__badge">静心 {remainingSec}s</div>
        )}
        {status === 'preview' && issue?.retryable && (
          <button
            type="button"
            className="camp__retry camp__retry--preview"
            onClick={retryCamera}
            aria-label="重新加载手势识别"
          >
            {compact ? '重试手势' : '重新加载手势'}
          </button>
        )}
        {status === 'preview' && compact && !issue?.retryable && (
          <div className="camp__badge">仅预览</div>
        )}
        {status !== 'ready' && status !== 'preview' && (
          <div className="camp__status">
            {status === 'loading' ? (
              <span className="camp__spinner" aria-hidden />
            ) : status === 'denied' ? (
              <IconCameraOff />
            ) : (
              <IconWarn />
            )}
            {status !== 'loading' && issue?.retryable && (
              <button
                type="button"
                className="camp__retry"
                onClick={retryCamera}
                aria-label="重新开启摄像头"
              >
                {compact ? '重试' : '重新开启'}
              </button>
            )}
          </div>
        )}
      </div>
      {!compact && <p className="camp__hint">{hint}</p>}
      {!compact && (
        <p className="camp__privacy">
          <IconLock />
          画面仅本地处理，不上传
        </p>
      )}

      <style>{`
        .camp { margin-bottom: 0.8rem; }
        .camp__frame {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          background: #18100b;
          border: 1px solid var(--line-gold);
          border-radius: var(--r);
          overflow: hidden;
        }
        .camp__video { width: 100%; height: 100%; object-fit: contain; display: block; }
        .camp__hold {
          position: absolute; left: 8px; right: 8px; bottom: 8px;
          height: 8px; background: rgba(0,0,0,.5);
          border: 1px solid var(--line-gold); border-radius: 999px; overflow: hidden;
        }
        .camp__holdbar {
          height: 100%; background: linear-gradient(90deg, var(--c-gold), var(--c-sheng));
          transition: width .08s linear;
        }
        .camp__score, .camp__counting {
          position: absolute; top: 8px; left: 8px;
          font-family: var(--font-display); font-weight: 700;
          border-radius: 999px; padding: .12em .6em;
          -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px);
        }
        .camp__score {
          background: rgba(20,13,9,.6); color: var(--c-gold-bright);
          font-size: .78rem; border: 1px solid var(--line-gold);
        }
        .camp__counting {
          background: rgba(95,138,100,.85); color: #fff;
          font-size: .8rem; border: 1px solid var(--line-gold);
          animation: pulse 1.4s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
        .camp__status {
          position: absolute; inset: 0; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 6px;
          background: rgba(0,0,0,.48);
          color: rgba(228,196,121,.72);
        }
        .camp__status svg { width: 34px; height: 34px; }
        .camp__spinner {
          width: 26px; height: 26px; border-radius: 50%;
          border: 2.5px solid rgba(201,162,75,.3); border-top-color: var(--c-gold-bright);
          animation: spin .8s linear infinite;
        }
        .camp__retry {
          border: 1px solid var(--line-gold); border-radius: 999px;
          padding: .18em .65em; background: rgba(20,13,9,.82);
          color: var(--c-gold-bright); font: 700 .72rem var(--font-display);
          cursor: pointer;
        }
        .camp__retry:hover { border-color: var(--line-gold-strong); }
        .camp__retry--preview {
          position: absolute; top: 8px; right: 8px; z-index: 1;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .camp__hint {
          margin: .5rem 0 .2rem; font-size: .85rem;
          color: var(--c-text-soft); min-height: 1.2em; line-height: 1.5;
        }
        .camp__privacy {
          margin: 0 0 .6rem; font-size: .72rem; color: var(--c-text-faint);
          display: inline-flex; align-items: center; gap: .3rem;
        }
        .camp__privacy svg { flex-shrink: 0; }
        /* compact 角落小窗 */
        .camp--compact { margin-bottom: 0; }
        .camp--compact .camp__frame {
          border-radius: var(--r-sm);
          box-shadow: 0 4px 14px -6px rgba(0,0,0,.6);
        }
        .camp--compact .camp__hold { height: 5px; left: 4px; right: 4px; bottom: 4px; }
        .camp--compact .camp__status svg { width: 22px; height: 22px; }
        .camp--compact .camp__spinner { width: 18px; height: 18px; border-width: 2px; }
        .camp--compact .camp__retry--preview {
          top: 4px; right: 4px; padding: .12em .5em; font-size: .66rem;
        }
        .camp__badge {
          position: absolute; top: 4px; left: 4px;
          background: rgba(20,13,9,.65); color: var(--c-gold-bright);
          font-family: var(--font-display); font-weight: 700; font-size: .7rem;
          padding: .08em .45em; border-radius: 999px; border: 1px solid var(--line-gold);
          -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px);
        }
      `}</style>
    </div>
  );
}

/* 细金线图标：与宋体金漆语言统一，替代 emoji 状态 */
function IconCameraOff() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 3l18 18" />
      <path d="M15.5 10.5V7.5a1 1 0 0 0-1-1H9M4.5 6.5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h10" />
      <path d="M21 9l-4.5 3.2" />
    </svg>
  );
}

function IconWarn() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 4.5l8.5 15h-17z" />
      <path d="M12 10.5v4" />
      <circle cx="12" cy="17.4" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
