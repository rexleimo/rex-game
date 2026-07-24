'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import { allSnapped, scoreShapeRestore, type PlacedPiece } from '../core/restoreScore';
import type { ShapePiece } from '../core/types';
import styles from '../ShanhaiGame.module.css';

interface ShapePuzzleProps {
  pieces: ShapePiece[];
  board: { w: number; h: number };
  guide: boolean;
  onComplete: (score: number, hintsUsed: number) => void;
  accent?: string;
}

function lighten(hex: string, amount = 0.22): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return hex;
  const n = parseInt(h, 16);
  const r = Math.min(255, ((n >> 16) & 255) + Math.round(255 * amount));
  const g = Math.min(255, ((n >> 8) & 255) + Math.round(255 * amount));
  const b = Math.min(255, (n & 255) + Math.round(255 * amount));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function ShapePuzzle({
  pieces,
  board,
  guide,
  onComplete,
  accent = '#6B7F6A',
}: ShapePuzzleProps) {
  const [placed, setPlaced] = useState<PlacedPiece[]>(() =>
    pieces.map((p) => ({ id: p.id, x: p.start.x, y: p.start.y, snapped: false })),
  );
  const [hintsUsed, setHintsUsed] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [justSnapped, setJustSnapped] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const pieceMap = useMemo(() => new Map(pieces.map((p) => [p.id, p])), [pieces]);

  const clientToNorm = useCallback((clientX: number, clientY: number) => {
    const el = boardRef.current;
    if (!el) return { x: 0.5, y: 0.5 };
    const r = el.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (clientX - r.left) / r.width)),
      y: Math.min(1, Math.max(0, (clientY - r.top) / r.height)),
    };
  }, []);

  const trySnap = useCallback(
    (id: string, x: number, y: number): PlacedPiece => {
      const piece = pieceMap.get(id);
      if (!piece) return { id, x, y, snapped: false };
      const dist = Math.hypot(x - piece.target.x, y - piece.target.y);
      if (dist <= piece.snap) {
        return { id, x: piece.target.x, y: piece.target.y, snapped: true };
      }
      return { id, x, y, snapped: false };
    },
    [pieceMap],
  );

  const onPointerDown = (id: string, e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const cur = placed.find((p) => p.id === id);
    if (!cur) return;
    const norm = clientToNorm(e.clientX, e.clientY);
    dragOffset.current = { x: norm.x - cur.x, y: norm.y - cur.y };
    setActiveId(id);
    setPlaced((prev) => prev.map((p) => (p.id === id ? { ...p, snapped: false } : p)));
  };

  const onPointerMove = (id: string, e: React.PointerEvent) => {
    if (activeId !== id) return;
    const norm = clientToNorm(e.clientX, e.clientY);
    const x = Math.min(1, Math.max(0, norm.x - dragOffset.current.x));
    const y = Math.min(1, Math.max(0, norm.y - dragOffset.current.y));
    setPlaced((prev) => prev.map((p) => (p.id === id ? { ...p, x, y, snapped: false } : p)));
  };

  const onPointerUp = (id: string) => {
    if (activeId !== id) return;
    setPlaced((prev) => {
      const cur = prev.find((p) => p.id === id);
      if (!cur) return prev;
      const snapped = trySnap(id, cur.x, cur.y);
      if (snapped.snapped && !cur.snapped) {
        setJustSnapped(id);
        window.setTimeout(() => setJustSnapped(null), 420);
      }
      return prev.map((p) => (p.id === id ? snapped : p));
    });
    setActiveId(null);
  };

  const useHint = () => {
    const unsnapped = placed.find((p) => !p.snapped);
    if (!unsnapped) return;
    const piece = pieceMap.get(unsnapped.id);
    if (!piece) return;
    setHintsUsed((h) => h + 1);
    setJustSnapped(unsnapped.id);
    window.setTimeout(() => setJustSnapped(null), 420);
    setPlaced((prev) =>
      prev.map((p) =>
        p.id === unsnapped.id
          ? { id: p.id, x: piece.target.x, y: piece.target.y, snapped: true }
          : p,
      ),
    );
  };

  const finish = () => {
    const score = scoreShapeRestore(pieces, placed, hintsUsed);
    onComplete(score, hintsUsed);
  };

  const ready = allSnapped(pieces, placed);
  const aspect = board.w / board.h;
  const snappedCount = placed.filter((p) => p.snapped).length;

  return (
    <div className={styles.puzzle} style={{ ['--puzzle-accent' as string]: accent }}>
      <p className={styles.puzzleHint}>
        拖动残片靠近虚线轮廓，松手吸附。
        <span className={styles.puzzleProgress}>
          {' '}
          {snappedCount}/{pieces.length}
        </span>
      </p>
      <div ref={boardRef} className={styles.board} style={{ aspectRatio: String(aspect) }}>
        <div className={styles.boardTexture} aria-hidden />
        <svg className={styles.boardSvg} viewBox={`0 0 ${board.w} ${board.h}`}>
          <defs>
            <radialGradient id="boardGlow" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor={accent} stopOpacity="0.14" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width={board.w} height={board.h} fill="url(#boardGlow)" />
          <ellipse
            cx={board.w * 0.5}
            cy={board.h * 0.5}
            rx={board.w * 0.28}
            ry={board.h * 0.26}
            className={styles.targetSilhouette}
          />
          {guide &&
            pieces.map((piece) => (
              <path
                key={`ghost-${piece.id}`}
                d={piece.path}
                transform={`translate(${piece.target.x * board.w} ${piece.target.y * board.h})`}
                className={styles.ghostPath}
                fill="none"
              />
            ))}
        </svg>
        {placed.map((p) => {
          const piece = pieceMap.get(p.id);
          if (!piece) return null;
          const gid = `pf-${p.id}`;
          return (
            <button
              key={p.id}
              type="button"
              className={`${styles.piece} ${p.snapped ? styles.pieceSnapped : ''} ${
                activeId === p.id ? styles.pieceActive : ''
              } ${justSnapped === p.id ? styles.piecePop : ''}`}
              style={{
                left: `${p.x * 100}%`,
                top: `${p.y * 100}%`,
              }}
              aria-label={`拖动${piece.label}`}
              onPointerDown={(e) => onPointerDown(p.id, e)}
              onPointerMove={(e) => onPointerMove(p.id, e)}
              onPointerUp={() => onPointerUp(p.id)}
              onPointerCancel={() => onPointerUp(p.id)}
            >
              <svg width="80" height="80" viewBox="-42 -42 84 84" aria-hidden>
                <defs>
                  <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={lighten(piece.fill, 0.2)} />
                    <stop offset="50%" stopColor={piece.fill} />
                    <stop offset="100%" stopColor={piece.fill} stopOpacity="0.9" />
                  </linearGradient>
                </defs>
                <path
                  d={piece.path}
                  fill={`url(#${gid})`}
                  stroke={piece.stroke ?? '#2C3A2C'}
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />
              </svg>
              <span className={styles.pieceLabel}>{piece.label}</span>
            </button>
          );
        })}
        {ready && <div className={styles.boardComplete} aria-hidden />}
      </div>
      <div className={styles.puzzleActions}>
        <button type="button" className="gs-btn gs-btn--ghost" onClick={useHint}>
          册灵提示（已用 {hintsUsed}）
        </button>
        <button
          type="button"
          className="gs-btn gs-btn--primary"
          disabled={!ready}
          onClick={finish}
        >
          {ready ? '完成修复 · 观其完整' : '请拼合全部残片'}
        </button>
      </div>
    </div>
  );
}
