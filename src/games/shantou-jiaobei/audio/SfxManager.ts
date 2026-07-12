/**
 * 音效管理（Web Audio API，程序化合成 —— 无需下载音效文件即可用）。
 *
 * 当前用合成音占位，后续可替换为真实 CC0 音效（freesound.org 等）：
 *   加载 AudioBuffer 后，在对应方法里改为 bufferSource 播放即可。
 *
 * 浏览器 API，仅在客户端调用。首次播放需在用户交互后（autoplay 策略）。
 */
class SfxManager {
  private ctx: AudioContext | null = null;

  /** 懒加载 AudioContext（必须在用户手势内首次调用，否则被浏览器拦截） */
  private ensure(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  /** 用户交互时调用，解锁音频 */
  unlock() {
    this.ensure();
  }

  /** 准备音效：进入掷杯环境时 —— 低沉的「咚」+ 余韵，营造仪式感 */
  playPrepare() {
    const ctx = this.ensure();
    if (!ctx) return;
    this.tone(ctx, 110, 0, 0.5, 0.35, 'sine');
    this.tone(ctx, 165, 0.04, 0.4, 0.15, 'sine');
  }

  /** 筊杯落地「嗒」声（可指定延迟，两片先后落地）
   *  木质敲击 = 短促音调 + 宽带噪声爆破，更像木块互撞。 */
  playClack(delay = 0) {
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime + delay;

    // 1) 音调成分（木质共鸣）
    const osc = ctx.createOscillator();
    const og = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(900, t);
    osc.frequency.exponentialRampToValueAtTime(160, t + 0.09);
    og.gain.setValueAtTime(0.0001, t);
    og.gain.exponentialRampToValueAtTime(0.35, t + 0.004);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
    osc.connect(og).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);

    // 2) 噪声成分（撞击的「啪」）
    const noise = this.makeNoiseBuffer(ctx, 0.08);
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2200;
    bp.Q.value = 0.8;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.5, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    src.connect(bp).connect(ng).connect(ctx.destination);
    src.start(t);
    src.stop(t + 0.09);
  }

  /** 生成一段白噪声 buffer */
  private makeNoiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  /** 结果揭晓音效：圣杯=清亮、笑杯=俏皮、阴杯=低沉 */
  playResult(result: 'sheng' | 'xiao' | 'yin') {
    const ctx = this.ensure();
    if (!ctx) return;
    if (result === 'sheng') {
      // 清脆铃响：和弦上行
      [523, 659, 784].forEach((f, i) => this.tone(ctx, f, i * 0.06, 0.5, 0.18, 'sine'));
    } else if (result === 'xiao') {
      // 俏皮「噗嗤」：短促两声
      this.tone(ctx, 660, 0, 0.12, 0.2, 'square');
      this.tone(ctx, 880, 0.1, 0.12, 0.18, 'square');
    } else {
      // 低沉「咚」
      this.tone(ctx, 98, 0, 0.6, 0.3, 'sine');
      this.tone(ctx, 73, 0.05, 0.7, 0.2, 'sine');
    }
  }

  /** 进入下一轮的轻提示 */
  playNextRound() {
    const ctx = this.ensure();
    if (!ctx) return;
    this.tone(ctx, 440, 0, 0.12, 0.12, 'sine');
    this.tone(ctx, 587, 0.08, 0.16, 0.12, 'sine');
  }

  /** 基础正弦/方波音 */
  private tone(
    ctx: AudioContext,
    freq: number,
    delay: number,
    dur: number,
    vol: number,
    type: OscillatorType,
  ) {
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }
}

export const sfx = new SfxManager();
