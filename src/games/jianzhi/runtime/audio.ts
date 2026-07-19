type AudioCtor = typeof AudioContext;

function resolveAudioCtor(): AudioCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as Window & { webkitAudioContext?: AudioCtor };
  return window.AudioContext ?? w.webkitAudioContext ?? null;
}

/**
 * 剪纸音效的封装：惰性创建 AudioContext，对外只暴露两个语义化方法。
 * 静音由调用方（视图层）根据设置判断后传入，本模块不持有任何 UI 状态。
 */
export interface PaperAudio {
  /** 落剪的清脆"咔"声 */
  playSnip: (muted: boolean) => void;
  /** 展开完成的三音和弦 */
  playChime: (muted: boolean) => void;
}

export function createPaperAudio(): PaperAudio {
  let ctx: AudioContext | null = null;

  const ensure = (): AudioContext | null => {
    if (ctx) return ctx;
    const Ctor = resolveAudioCtor();
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
    } catch {
      return null;
    }
    return ctx;
  };

  return {
    playSnip(muted: boolean) {
      if (muted) return;
      const ac = ensure();
      if (!ac) return;
      void ac.resume();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(420, ac.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.12);
      osc.connect(gain).connect(ac.destination);
      osc.start();
      osc.stop(ac.currentTime + 0.13);
    },
    playChime(muted: boolean) {
      if (muted) return;
      const ac = ensure();
      if (!ac) return;
      void ac.resume();
      [523.25, 659.25, 783.99].forEach((f, i) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = 'sine';
        osc.frequency.value = f;
        const t0 = ac.currentTime + i * 0.06;
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.linearRampToValueAtTime(0.14, t0 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.6);
        osc.connect(gain).connect(ac.destination);
        osc.start(t0);
        osc.stop(t0 + 0.62);
      });
    },
  };
}
