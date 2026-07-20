import type { FoldMode, PaperMark } from '../core/types';
import { getFoldConfig, ROSETTE_N, type FoldConfig, type Pt } from './fold';
import { getMotif } from '../content/motifs';

const PAPER_FILL_TOP = '#c8342b';
const PAPER_FILL_BOTTOM = '#a5281f';
const PAPER_EDGE = 'rgba(80, 18, 14, 0.55)';
/** 折面戳印尺度：略放大，便于在红纸上辨认镂空轮廓 */
const MOTIF_SCALE = 0.46;
const CUT_WIDTH = 0.032;
/** Unfold reveal duration when motion is allowed (ms). */
const UNFOLD_DURATION_MS = 1050;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  life: number;
  size: number;
}

/** Static paper grain: sparse warm noise, generated once and reused. */
function makeGrain(size: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const img = g.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 220 + Math.random() * 35;
    img.data[i] = v;
    img.data[i + 1] = v * 0.25;
    img.data[i + 2] = v * 0.2;
    img.data[i + 3] = Math.random() > 0.92 ? 28 : 0;
  }
  g.putImageData(img, 0, 0);
  return c;
}

export type PaperTool = { type: 'motif'; motifId: string } | { type: 'cut' };

export interface PaperCanvasHandle {
  setFold: (fold: FoldMode) => void;
  setTool: (tool: PaperTool) => void;
  setReducedMotion: (value: boolean) => void;
  undo: () => void;
  clear: () => void;
  /** 重新折回，继续在折面上剪 */
  fold: () => void;
  /** 展开成完整团花，含粒子动画；返回展开完成的 Promise */
  unfold: () => Promise<void>;
  isFolded: () => boolean;
  exportPNG: (scale?: number) => string;
  placedMotifIds: () => string[];
  onChange: (cb: () => void) => void;
  onReject: (cb: () => void) => void;
  destroy: () => void;
}

export function createPaperCanvas(
  host: HTMLElement,
  opts: { reducedMotion?: boolean; onReady?: () => void } = {},
): PaperCanvasHandle {
  const size = 640;
  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = 'auto';
  canvas.style.display = 'block';
  canvas.style.touchAction = 'none';
  canvas.style.borderRadius = '10px';
  host.appendChild(canvas);

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法创建画布上下文');
  ctx.scale(dpr, dpr);

  const grain = makeGrain(size);

  let fold: FoldMode = 'book';
  let foldConfig: FoldConfig = getFoldConfig(fold);
  let tool: PaperTool = { type: 'motif', motifId: 'fish' };
  let reducedMotion = opts.reducedMotion ?? false;
  let marks: PaperMark[] = [];
  let folded = true;
  let revealT = 0;
  let currentStroke: { points: Pt[]; width: number } | null = null;
  let particles: Particle[] = [];
  let rafId = 0;
  let changeCb: (() => void) | null = null;
  let rejectCb: (() => void) | null = null;

  function toLogical(clientX: number, clientY: number): Pt {
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    return { x: Math.min(1, Math.max(0, x)), y: Math.min(1, Math.max(0, y)) };
  }

  function drawPaper(c: CanvasRenderingContext2D) {
    const grad = c.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0, PAPER_FILL_TOP);
    grad.addColorStop(1, PAPER_FILL_BOTTOM);
    c.fillStyle = grad;
    c.fillRect(0, 0, size, size);
    // Subtle static grain on red paper body
    c.save();
    c.globalCompositeOperation = 'multiply';
    c.globalAlpha = 0.45;
    c.drawImage(grain, 0, 0, size, size);
    c.restore();
    c.strokeStyle = 'rgba(255,255,255,0.04)';
    c.lineWidth = 1;
    for (let i = 0; i < 6; i += 1) {
      const y = (i + 1) * (size / 7);
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(size, y);
      c.stroke();
    }
    c.strokeStyle = PAPER_EDGE;
    c.lineWidth = 2;
    c.strokeRect(1, 1, size - 2, size - 2);
  }

  function applyClip(c: CanvasRenderingContext2D) {
    if (foldConfig.clip === 'rect' && foldConfig.rect) {
      const [x0, y0, x1, y1] = foldConfig.rect;
      const rx0 = x0 + (0 - x0) * revealT;
      const ry0 = y0 + (0 - y0) * revealT;
      const rx1 = x1 + (1 - x1) * revealT;
      const ry1 = y1 + (1 - y1) * revealT;
      c.beginPath();
      c.rect(rx0 * size, ry0 * size, (rx1 - rx0) * size, (ry1 - ry0) * size);
      c.clip();
    } else if (foldConfig.clip === 'sector') {
      const step = (2 * Math.PI) / ROSETTE_N;
      const half = step / 2 + (Math.PI - step / 2) * revealT;
      const R = size * 0.74;
      c.beginPath();
      c.moveTo(size / 2, size / 2);
      c.arc(size / 2, size / 2, R, -half, half);
      c.closePath();
      c.clip();
    } else if (foldConfig.clip === 'full' && revealT < 1) {
      const s = 0.92 + 0.08 * revealT;
      c.translate(size / 2, size / 2);
      c.scale(s, s);
      c.translate(-size / 2, -size / 2);
    }
  }

  /** Soft shadow + highlight along fold boundaries from foldConfig. */
  function drawCrease(c: CanvasRenderingContext2D) {
    const soft = 14;
    if (foldConfig.clip === 'rect' && foldConfig.rect) {
      const [x0, y0, x1, y1] = foldConfig.rect;
      // Vertical fold edge (book / four left boundary)
      if (x0 > 0 && x0 < 1) {
        const px = x0 * size;
        const g = c.createLinearGradient(px - soft, 0, px + soft, 0);
        g.addColorStop(0, 'rgba(0,0,0,0)');
        g.addColorStop(0.42, 'rgba(40, 8, 6, 0.22)');
        g.addColorStop(0.5, 'rgba(20, 4, 3, 0.32)');
        g.addColorStop(0.58, 'rgba(40, 8, 6, 0.14)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = g;
        c.fillRect(px - soft, y0 * size, soft * 2, (y1 - y0) * size);
        c.strokeStyle = 'rgba(255, 240, 225, 0.35)';
        c.lineWidth = 1.5;
        c.beginPath();
        c.moveTo(px, y0 * size);
        c.lineTo(px, y1 * size);
        c.stroke();
      }
      // Horizontal fold edge (four top boundary)
      if (y0 > 0 && y0 < 1) {
        const py = y0 * size;
        const g = c.createLinearGradient(0, py - soft, 0, py + soft);
        g.addColorStop(0, 'rgba(0,0,0,0)');
        g.addColorStop(0.42, 'rgba(40, 8, 6, 0.22)');
        g.addColorStop(0.5, 'rgba(20, 4, 3, 0.32)');
        g.addColorStop(0.58, 'rgba(40, 8, 6, 0.14)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = g;
        c.fillRect(x0 * size, py - soft, (x1 - x0) * size, soft * 2);
        c.strokeStyle = 'rgba(255, 240, 225, 0.35)';
        c.lineWidth = 1.5;
        c.beginPath();
        c.moveTo(x0 * size, py);
        c.lineTo(x1 * size, py);
        c.stroke();
      }
    } else if (foldConfig.clip === 'sector') {
      const step = (2 * Math.PI) / ROSETTE_N;
      const R = size * 0.74;
      const cx = size / 2;
      const cy = size / 2;
      // Soft radial fold-axis shadows
      for (let k = 0; k < ROSETTE_N; k += 1) {
        const a = k * step + step / 2;
        const cos = Math.cos(a);
        const sin = Math.sin(a);
        c.save();
        c.translate(cx, cy);
        c.rotate(a);
        const g = c.createLinearGradient(0, -soft, 0, soft);
        g.addColorStop(0, 'rgba(0,0,0,0)');
        g.addColorStop(0.45, 'rgba(40, 8, 6, 0.16)');
        g.addColorStop(0.5, 'rgba(20, 4, 3, 0.26)');
        g.addColorStop(0.55, 'rgba(40, 8, 6, 0.12)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = g;
        c.fillRect(0, -soft, R, soft * 2);
        c.restore();
        c.strokeStyle = 'rgba(255, 240, 225, 0.22)';
        c.lineWidth = 1.2;
        c.beginPath();
        c.moveTo(cx, cy);
        c.lineTo(cx + cos * R, cy + sin * R);
        c.stroke();
      }
    }
  }

  function drawMark(c: CanvasRenderingContext2D, mark: PaperMark) {
    for (const tf of foldConfig.transforms) {
      if (mark.type === 'motif') {
        const p = tf(mark.x, mark.y);
        c.save();
        c.translate(p.x * size, p.y * size);
        c.scale(mark.scale * size, mark.scale * size);
        c.fillStyle = '#000';
        mark.def.draw(c);
        c.restore();
      } else {
        c.save();
        c.lineWidth = mark.width * size;
        c.lineJoin = 'round';
        c.lineCap = 'round';
        c.strokeStyle = '#000';
        c.beginPath();
        mark.points.forEach((pt, i) => {
          const q = tf(pt.x, pt.y);
          if (i === 0) c.moveTo(q.x * size, q.y * size);
          else c.lineTo(q.x * size, q.y * size);
        });
        c.stroke();
        c.restore();
      }
    }
  }

  /** 折叠态未激活区域：盖上深红「折背」，勿用 destination-out（会把活动面红纸一起抠掉） */
  function drawFoldedBack(c: CanvasRenderingContext2D) {
    if (!folded || revealT >= 0.999) return;
    if (foldConfig.clip === 'rect' && foldConfig.rect) {
      const [x0, y0, x1, y1] = foldConfig.rect;
      const ax0 = x0 + (0 - x0) * revealT;
      const ay0 = y0 + (0 - y0) * revealT;
      const ax1 = x1 + (1 - x1) * revealT;
      const ay1 = y1 + (1 - y1) * revealT;
      const px = (v: number) => v * size;
      c.save();
      // 折背底色（比正面红纸更深）
      const back = c.createLinearGradient(0, 0, size, size);
      back.addColorStop(0, '#7a241c');
      back.addColorStop(1, '#5a1814');
      c.fillStyle = back;
      // 左 | 右 | 上（活动列内）| 下（活动列内）
      if (ax0 > 0.001) c.fillRect(0, 0, px(ax0), size);
      if (ax1 < 0.999) c.fillRect(px(ax1), 0, size - px(ax1), size);
      if (ay0 > 0.001) c.fillRect(px(ax0), 0, px(ax1 - ax0), px(ay0));
      if (ay1 < 0.999) c.fillRect(px(ax0), px(ay1), px(ax1 - ax0), size - px(ay1));
      // 轻压暗，增强「折到下面」
      c.fillStyle = 'rgba(20, 6, 4, 0.22)';
      if (ax0 > 0.001) c.fillRect(0, 0, px(ax0), size);
      if (ax1 < 0.999) c.fillRect(px(ax1), 0, size - px(ax1), size);
      if (ay0 > 0.001) c.fillRect(px(ax0), 0, px(ax1 - ax0), px(ay0));
      if (ay1 < 0.999) c.fillRect(px(ax0), px(ay1), px(ax1 - ax0), size - px(ay1));
      c.restore();
    } else if (foldConfig.clip === 'sector') {
      const step = (2 * Math.PI) / ROSETTE_N;
      const half = step / 2 + (Math.PI - step / 2) * revealT;
      const R = size * 0.74;
      const cx = size / 2;
      const cy = size / 2;
      c.save();
      // evenodd：整幅矩形减去扇形活动区 = 折背
      c.fillStyle = '#6a1f18';
      c.beginPath();
      c.rect(0, 0, size, size);
      c.moveTo(cx, cy);
      c.arc(cx, cy, R, -half, half, false);
      c.closePath();
      c.fill('evenodd');
      c.fillStyle = 'rgba(20, 6, 4, 0.22)';
      c.beginPath();
      c.rect(0, 0, size, size);
      c.moveTo(cx, cy);
      c.arc(cx, cy, R, -half, half, false);
      c.closePath();
      c.fill('evenodd');
      c.restore();
    }
  }

  function render() {
    const c = ctx!;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, size, size);
    // 1) 整张红纸（不 clip）— 折起后未剪面仍是纸，不是展台底色
    drawPaper(c);
    // 2) 折叠态：未激活面画成折背
    drawFoldedBack(c);
    // 3) 仅在活动折面镂空
    c.save();
    applyClip(c);
    c.globalCompositeOperation = 'destination-out';
    for (const mark of marks) drawMark(c, mark);
    if (currentStroke && currentStroke.points.length > 0) drawMark(c, { type: 'stroke', ...currentStroke });
    c.globalCompositeOperation = 'source-over';
    if (folded && revealT < 1) drawCrease(c);
    c.restore();
    if (particles.length) drawParticles(c);
    changeCb?.();
  }

  function drawParticles(c: CanvasRenderingContext2D) {
    for (const p of particles) {
      c.save();
      c.globalAlpha = Math.max(0, Math.min(1, p.life));
      c.translate(p.x, p.y);
      c.rotate(p.rot);
      c.fillStyle = '#c8342b';
      c.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      c.restore();
    }
  }

  function spawnParticles() {
    if (reducedMotion) return;
    const count = 30;
    for (let i = 0; i < count; i += 1) {
      const ang = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      const sp = 2 + Math.random() * 4;
      particles.push({
        x: size / 2,
        y: size / 2,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp - 1,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        life: 1,
        size: 6 + Math.random() * 8,
      });
    }
  }

  function stepParticles() {
    let alive = false;
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12;
      p.rot += p.vr;
      p.life -= 0.02;
      if (p.life > 0) alive = true;
    }
    particles = particles.filter((p) => p.life > 0);
    return alive;
  }

  function animateParticles() {
    if (!particles.length) return;
    const tick = () => {
      const alive = stepParticles();
      render();
      if (alive) rafId = requestAnimationFrame(tick);
      else particles = [];
    };
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(tick);
  }

  function placeMotif(p: Pt) {
    const active = foldConfig.toActive(p.x, p.y);
    if (!foldConfig.inActive(active.x, active.y)) {
      rejectCb?.();
      return;
    }
    const def = tool.type === 'motif' ? getMotif(tool.motifId) : undefined;
    if (!def) return;
    marks.push({ type: 'motif', id: def.id, def, x: active.x, y: active.y, scale: MOTIF_SCALE });
    render();
  }

  function refold() {
    folded = true;
    revealT = 0;
    render();
  }

  function onPointerDown(e: PointerEvent) {
    e.preventDefault();
    const p = toLogical(e.clientX, e.clientY);
    if (tool.type === 'motif') {
      if (!folded) refold();
      placeMotif(p);
    } else {
      if (!folded) refold();
      currentStroke = { points: [foldConfig.toActive(p.x, p.y)], width: CUT_WIDTH };
      canvas.setPointerCapture(e.pointerId);
    }
  }

  function onPointerMove(e: PointerEvent) {
    if (tool.type !== 'cut' || !currentStroke) return;
    const p = toLogical(e.clientX, e.clientY);
    const active = foldConfig.toActive(p.x, p.y);
    const last = currentStroke.points[currentStroke.points.length - 1];
    if (Math.hypot(active.x - last.x, active.y - last.y) > 0.006) {
      currentStroke.points.push(active);
      render();
    }
  }

  function onPointerUp() {
    if (tool.type === 'cut' && currentStroke) {
      if (currentStroke.points.length > 1) marks.push({ type: 'stroke', ...currentStroke });
      currentStroke = null;
      render();
    }
  }

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);

  render();
  opts.onReady?.();

  return {
    setFold(next: FoldMode) {
      fold = next;
      foldConfig = getFoldConfig(fold);
      folded = true;
      revealT = 0;
      render();
    },
    setTool(next: PaperTool) {
      tool = next;
    },
    setReducedMotion(value: boolean) {
      reducedMotion = value;
    },
    undo() {
      if (currentStroke) currentStroke = null;
      else marks = marks.slice(0, -1);
      render();
    },
    clear() {
      marks = [];
      currentStroke = null;
      render();
    },
    fold: refold,
    unfold() {
      folded = false;
      revealT = 0;
      spawnParticles();
      animateParticles();
      if (reducedMotion) {
        revealT = 1;
        render();
        return Promise.resolve();
      }
      return new Promise<void>((resolve) => {
        const start = performance.now();
        const dur = UNFOLD_DURATION_MS;
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / dur);
          revealT = t;
          render();
          if (t < 1) rafId = requestAnimationFrame(tick);
          else {
            revealT = 1;
            render();
            resolve();
          }
        };
        rafId = requestAnimationFrame(tick);
      });
    },
    isFolded() {
      return folded;
    },
    exportPNG(scale = 2) {
      const off = document.createElement('canvas');
      off.width = size * scale;
      off.height = size * scale;
      const octx = off.getContext('2d');
      if (!octx) return '';
      octx.scale(scale, scale);
      octx.clearRect(0, 0, size, size);
      drawPaper(octx);
      octx.globalCompositeOperation = 'destination-out';
      for (const mark of marks) drawMark(octx, mark);
      octx.globalCompositeOperation = 'source-over';
      octx.strokeStyle = PAPER_EDGE;
      octx.lineWidth = 2;
      octx.strokeRect(1, 1, size - 2, size - 2);
      return off.toDataURL('image/png');
    },
    placedMotifIds() {
      const ids = new Set<string>();
      for (const m of marks) if (m.type === 'motif') ids.add(m.id);
      return [...ids];
    },
    onChange(cb: () => void) {
      changeCb = cb;
    },
    onReject(cb: () => void) {
      rejectCb = cb;
    },
    destroy() {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.remove();
    },
  };
}
