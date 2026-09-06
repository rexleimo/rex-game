import type { SoundCue } from './moves.ts';

/**
 * WebAudio 程序化音效（GDD §4.4 第 5 条：音效分层）。
 * 无外部音频文件；兽鸣=「音」轴的听音辨招签名，必须彼此可辨。
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;

export function setAudioMuted(m: boolean): void {
  muted = m;
  if (master && ctx) master.gain.setTargetAtTime(m ? 0 : 0.5, ctx.currentTime, 0.02);
}

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function env(gain: GainNode, t: number, attack: number, decay: number, peak: number): void {
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(peak, t + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}

function tone(freq: number, dur: number, type: OscillatorType, peak = 0.3, slideTo?: number): void {
  const c = ac();
  if (!c || !master) return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + dur);
  env(g, t, 0.005, dur, peak);
  osc.connect(g).connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

function noise(dur: number, freq: number, peak = 0.25, q = 1): void {
  const c = ac();
  if (!c || !master) return;
  const t = c.currentTime;
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  filter.Q.value = q;
  const g = c.createGain();
  env(g, t, 0.004, dur, peak);
  src.connect(filter).connect(g).connect(master);
  src.start(t);
}

/** 战斗层音效。 */
export type SfxKind =
  | 'swing' | 'swingHeavy' | 'hitLight' | 'hitHeavy' | 'parry' | 'hurt'
  | 'pickup' | 'clue' | 'heal' | 'tame' | 'slain' | 'death' | 'roll'
  | 'jump' | 'gate' | 'rite' | 'check';

export function playSfx(kind: SfxKind): void {
  switch (kind) {
    case 'swing': noise(0.09, 2400, 0.16, 0.8); break;
    case 'swingHeavy': noise(0.18, 900, 0.3, 0.7); tone(140, 0.16, 'sawtooth', 0.1, 70); break;
    case 'hitLight': noise(0.06, 500, 0.3, 1.4); tone(180, 0.07, 'square', 0.14, 90); break;
    case 'hitHeavy': noise(0.12, 260, 0.4, 1); tone(96, 0.16, 'sine', 0.4, 50); break;
    case 'parry': tone(1560, 0.1, 'triangle', 0.32, 2200); tone(2340, 0.22, 'sine', 0.16); break;
    case 'hurt': tone(220, 0.14, 'sawtooth', 0.22, 110); break;
    case 'pickup': tone(880, 0.08, 'sine', 0.2); tone(1320, 0.14, 'sine', 0.16); break;
    case 'clue': tone(660, 0.1, 'triangle', 0.2); tone(990, 0.2, 'triangle', 0.14); break;
    case 'heal': tone(520, 0.16, 'sine', 0.2, 780); break;
    case 'tame': [523, 659, 784, 1046].forEach((f, i) => window.setTimeout(() => tone(f, 0.3, 'sine', 0.22), i * 110)); break;
    case 'slain': tone(196, 0.4, 'sawtooth', 0.2, 98); break;
    case 'death': tone(160, 0.7, 'sine', 0.3, 60); break;
    case 'roll': noise(0.12, 700, 0.1, 0.6); break;
    case 'jump': tone(330, 0.1, 'sine', 0.1, 550); break;
    case 'gate': tone(392, 0.2, 'triangle', 0.2); tone(523, 0.3, 'triangle', 0.16); break;
    case 'rite': [392, 523, 659, 784, 1046].forEach((f, i) => window.setTimeout(() => tone(f, 0.5, 'sine', 0.18), i * 160)); break;
    case 'check': tone(784, 0.12, 'sine', 0.16); tone(1046, 0.24, 'sine', 0.14); break;
  }
}

/** 兽鸣声兆（GDD §4.3：每兽一个音频 signature）。 */
export function playCue(cue: SoundCue): void {
  switch (cue) {
    case 'thud': tone(90, 0.14, 'sine', 0.34, 55); noise(0.05, 300, 0.2); break;
    case 'whoosh': noise(0.16, 1400, 0.14, 0.7); break;
    case 'hiss': noise(0.22, 5200, 0.14, 2.4); break;
    case 'woodknock': tone(340, 0.05, 'square', 0.3, 300); window.setTimeout(() => tone(310, 0.06, 'square', 0.26, 280), 90); break;
    case 'cry': tone(720, 0.28, 'sine', 0.24, 560); window.setTimeout(() => tone(640, 0.2, 'sine', 0.2, 500), 160); break;
    case 'song': [440, 494, 554].forEach((f, i) => window.setTimeout(() => tone(f, 0.24, 'triangle', 0.14), i * 130)); break;
    case 'moo': tone(120, 0.4, 'sawtooth', 0.24, 82); break;
    case 'screech': noise(0.14, 3200, 0.2, 3); tone(980, 0.14, 'sawtooth', 0.16, 1240); break;
    case 'chirp': tone(1200, 0.06, 'sine', 0.14); window.setTimeout(() => tone(1500, 0.06, 'sine', 0.12), 70); break;
  }
}
