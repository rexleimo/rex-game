'use client';

import { useEffect, useRef, useState } from 'react';
import type { CupResult, GameState, WishCategory } from '../JiaobeiGame';
import { CupResultGlyph } from '../components/CupResultGlyph';
import { CameraPosePanel } from '../vision/CameraPosePanel';
import { sfx } from '../audio/SfxManager';
import { WishSpeech } from '../voice/WishSpeech';

const RESULT_META: Record<CupResult, { label: string; color: string }> = {
  sheng: { label: '圣杯', color: 'var(--c-sheng)' },
  xiao: { label: '笑杯', color: 'var(--c-xiao)' },
  yin: { label: '阴杯', color: 'var(--c-yin)' },
};

const CATEGORIES: WishCategory[] = ['感情', '事业', '学业', '财运', '健康', '其他'];

/** 回合序数 → 汉字 */
const CN = ['', '一', '二', '三'];

/**
 * 请愿掷杯场景（M3 版：摄像头「双手合十」触发 + Babylon.js 物理掷杯）。
 *
 * 触发优先级：
 *   1. 摄像头双手合十持续 ~1.2s → 自动掷杯（首选）
 *   2. 摄像头不可用 → 显示「点击掷杯」按钮（降级）
 *   3. 物理引擎不可用 → 显示「随机掷杯」（最末降级）
 */
export function OfferingScene({
  state,
  onThrow,
  onDone,
  onWishChange,
  onWishCategoryChange,
}: {
  state: GameState;
  onThrow: (r: CupResult) => void;
  onDone: () => void;
  /** 心愿在掷杯页内联编辑，向上同步到结果页展示 */
  onWishChange?: (wish: string) => void;
  /** 心愿类别选择 */
  onWishCategoryChange?: (category: WishCategory) => void;
}) {
  const round = state.throws.length + 1;
  const done = round > 3;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const throwerRef = useRef<import('../physics/JiaobeiThrower').JiaobeiThrower | null>(null);
  const [throwing, setThrowing] = useState(false);
  const [lastResult, setLastResult] = useState<CupResult | null>(null);
  const [physicsReady, setPhysicsReady] = useState(false);
  const [physicsError, setPhysicsError] = useState(false);
  const [cameraDown, setCameraDown] = useState<string | null>(null); // 摄像头降级原因
  const [listening, setListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const speechRef = useRef<WishSpeech | null>(null);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    (async () => {
      try {
        console.log('[physics] 动态加载 JiaobeiThrower 模块…');
        const { JiaobeiThrower } = await import('../physics/JiaobeiThrower');
        if (cancelled) return;
        console.log('[physics] 构造 JiaobeiThrower…');
        const thrower = new JiaobeiThrower(canvas);
        throwerRef.current = thrower;
        await thrower.initialize();
        if (cancelled) {
          thrower.dispose();
          if (throwerRef.current === thrower) throwerRef.current = null;
          return;
        }
        console.log('[physics] 就绪 ✓');
        setPhysicsReady(true);
      } catch (e) {
        if (!cancelled) {
          throwerRef.current?.dispose();
          throwerRef.current = null;
          console.error('[physics] 初始化失败', e);
          setPhysicsError(true);
        }
      }
    })();

    return () => {
      cancelled = true;
      throwerRef.current?.dispose();
      throwerRef.current = null;
    };
  }, []);

  const doThrow = async () => {
    if (throwing || !physicsReady || !throwerRef.current || physicsError) return;
    setThrowing(true);
    setLastResult(null);
    try {
      // 落地「嗒」声由物理引擎在每片真实触台时回调触发（声画对齐）
      const result = await throwerRef.current.throwOnce(() => sfx.playClack(0));
      setLastResult(result);
      sfx.playResult(result);
      onThrow(result);
      // 还有下一轮 → 轻提示音
      if (state.throws.length + 1 < 3) {
        window.setTimeout(() => sfx.playNextRound(), 900);
      }
    } catch (e) {
      console.error(e);
      setPhysicsError(true);
    } finally {
      setThrowing(false);
    }
  };

  // 摄像头合十触发 → 同样走物理掷杯
  const onPrayer = () => {
    sfx.unlock();
    void doThrow();
  };

  // 最末降级：物理也不可用时随机
  const fallbackThrow = (): CupResult => {
    const r = Math.random();
    return r < 0.5 ? 'sheng' : r < 0.75 ? 'xiao' : 'yin';
  };
  const doFallback = () => {
    if (throwing) return;
    sfx.playClack(0);
    const result = fallbackThrow();
    setLastResult(result);
    sfx.playResult(result);
    onThrow(result);
    if (state.throws.length + 1 < 3) {
      window.setTimeout(() => sfx.playNextRound(), 900);
    }
  };

  // 摄像头识别仅在物理可接收投掷时运行，避免加载期间误触发后锁死。
  const poseEnabled = physicsReady && !physicsError && !throwing && !done;

  const speechSupported = WishSpeech.isSupported();

  const toggleSpeech = () => {
    if (!speechSupported || listening) {
      speechRef.current?.stop();
      setListening(false);
      return;
    }
    setSpeechError(null);
    speechRef.current?.abort();
    speechRef.current = new WishSpeech(
      (result) => {
        onWishChange?.(result.transcript);
        if (result.isFinal) {
          setListening(false);
        }
      },
      (error) => {
        setSpeechError(error.message || '语音识别出错');
        setListening(false);
      },
      () => {
        setListening(false);
      },
    );
    speechRef.current.start();
    setListening(true);
  };

  useEffect(() => {
    return () => {
      speechRef.current?.abort();
    };
  }, []);

  return (
    <section className="offering rise">
      <header className="offering__rail">
        <div>
          <p className="offering__eyebrow">筊杯仪式 / 实时物理舞台</p>
          <h2 className="offering__title">
            第 <span className="offering__round">{CN[Math.min(round, 3)]}</span> 掷
            <span className="offering__of">共三掷</span>
          </h2>
        </div>
        <p className="offering__mode">先静心，后落杯</p>
      </header>

      <div className="offering__visual">
        <div className="offering__stage">
          <canvas ref={canvasRef} className="offering__canvas" />
          {!physicsReady && !physicsError && (
            <div className="offering__overlay">
              <span className="offering__spinner" aria-hidden />
              备杯中…
            </div>
          )}
          {physicsReady && !throwing && !lastResult && state.throws.length === 0 && !physicsError ? (
            <div className="offering__ready">
              <strong>筊杯已备</strong>
              <span>默念所愿，随时落杯</span>
            </div>
          ) : null}
          {lastResult && (
            <div className="offering__pop" style={{ color: RESULT_META[lastResult].color }}>
              <CupResultGlyph result={lastResult} size={34} />
              {RESULT_META[lastResult].label}
            </div>
          )}
        </div>

        <div className="offering__cam">
          <p className="offering__camlabel"><span>手势预览</span><span>本地处理</span></p>
          <CameraPosePanel
            enabled={poseEnabled}
            onPrayer={onPrayer}
            onUnavailable={(reason) => setCameraDown(reason)}
            onAvailable={() => setCameraDown(null)}
            compact
          />
        </div>
      </div>

      {physicsError ? (
        <p className="offering__err">
          物理引擎加载失败
          <button className="offering__fb" onClick={doFallback}>随机掷杯</button>
        </p>
      ) : null}

      <div className="offering__console">
        <div className="offering__categories" role="group" aria-label="心愿类别">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`offering__category ${state.wishCategory === cat ? 'offering__category--active' : ''}`}
              onClick={() => onWishCategoryChange?.(cat)}
              aria-pressed={state.wishCategory === cat}
            >
              {cat}
            </button>
          ))}
        </div>

        <label className="offering__wish">
          <span className="offering__wishlabel">所愿</span>
          <input
            className="offering__wishinput"
            placeholder="在此写下心愿，或点击右侧麦克风说话"
            value={state.wish}
            onChange={(e) => onWishChange?.(e.target.value)}
            maxLength={40}
            disabled={state.throws.length > 0}
          />
          {speechSupported && (
            <button
              type="button"
              className={`offering__mic ${listening ? 'offering__mic--active' : ''}`}
              onClick={toggleSpeech}
              aria-label={listening ? '停止语音识别' : '语音输入心愿'}
              aria-pressed={listening}
              disabled={state.throws.length > 0}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z" />
                <path d="M19 11v1a7 7 0 0 1-14 0v-1" />
                <path d="M12 19v3" />
              </svg>
            </button>
          )}
        </label>

        <div className="offering__action">
          <div className="offering__throws" aria-label="已完成的掷杯">
            {state.throws.map((t, i) => {
              const m = RESULT_META[t];
              return (
                <span key={i} className="throwchip" style={{ borderColor: m.color }}>
                  <CupResultGlyph result={t} size={30} />
                  <strong style={{ color: m.color }}>{m.label}</strong>
                </span>
              );
            })}
          </div>

          {done ? (
            <button className="gs-btn gs-btn--primary" onClick={onDone}>查看神明解答</button>
          ) : (
            <button
              className="gs-btn gs-btn--primary"
              onClick={doThrow}
              disabled={throwing || physicsError || !physicsReady}
            >
              {throwing ? '落杯中…' : '掷 杯'}
            </button>
          )}
        </div>

        {speechError ? (
          <p className="offering__hint offering__hint--error">{speechError}</p>
        ) : (
          <p className="offering__hint">
            {cameraDown
              ? `${cameraDown}，仍可点击掷杯完成这一问。`
              : '双手合十保持约 5 秒即可掷杯，也可随时使用手动掷杯。'}
          </p>
        )}
      </div>
    </section>
  );
}
