import type { ShapePiece } from './types';

export interface PlacedPiece {
  id: string;
  x: number;
  y: number;
  snapped: boolean;
}

/** 形状拼合得分：完整度 + 准确度 + 未使用提示加成 */
export function scoreShapeRestore(
  pieces: ShapePiece[],
  placed: PlacedPiece[],
  hintsUsed: number,
): number {
  if (pieces.length === 0) return 0;
  let snapped = 0;
  let accuracy = 0;
  for (const piece of pieces) {
    const p = placed.find((x) => x.id === piece.id);
    if (!p) continue;
    const dx = p.x - piece.target.x;
    const dy = p.y - piece.target.y;
    const dist = Math.hypot(dx, dy);
    const tol = piece.snap;
    if (p.snapped || dist <= tol) {
      snapped += 1;
      accuracy += 1;
    } else if (dist <= tol * 2) {
      accuracy += 0.5;
    }
  }
  const integrity = snapped / pieces.length;
  const acc = accuracy / pieces.length;
  const efficiency = Math.max(0, 1 - hintsUsed * 0.12);
  const raw = 0.5 * integrity + 0.4 * acc + 0.1 * efficiency;
  return Math.round(Math.min(100, Math.max(0, raw * 100)));
}

export function allSnapped(pieces: ShapePiece[], placed: PlacedPiece[]): boolean {
  return pieces.every((piece) => {
    const p = placed.find((x) => x.id === piece.id);
    if (!p) return false;
    if (p.snapped) return true;
    const dist = Math.hypot(p.x - piece.target.x, p.y - piece.target.y);
    return dist <= piece.snap;
  });
}

export function scoreQuiz(correct: boolean, hintsUsed: number): number {
  if (!correct) return 40;
  const base = 92;
  return Math.max(70, base - hintsUsed * 10);
}
