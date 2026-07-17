export function scheduleDrumLoop(
  context: AudioContext,
  startAt: number,
  bpm: number,
  durationSeconds: number,
  muted: boolean,
) {
  if (muted) return;
  const beat = 60 / bpm;
  for (let at = 0; at < durationSeconds; at += beat) {
    const when = startAt + at;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const beatIndex = Math.round(at / beat);
    oscillator.type = beatIndex % 4 === 0 ? 'triangle' : 'sine';
    oscillator.frequency.setValueAtTime(beatIndex % 4 === 0 ? 92 : 132, when);
    oscillator.frequency.exponentialRampToValueAtTime(52, when + 0.085);
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(beatIndex % 4 === 0 ? 0.22 : 0.11, when + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.11);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(when);
    oscillator.stop(when + 0.12);
  }
}
