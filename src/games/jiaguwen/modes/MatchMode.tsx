'use client';

import { useCallback, useRef, useState } from 'react';
import type { MatchCard } from '../core/types';
import type { OracleGlyph } from '../core/types';
import { shuffle } from '../core/progress';
import { getGlyph } from '../content/glyphs';
import { GlyphImage } from '../components/GlyphImage';
import styles from '../JiaguGame.module.css';

export interface MatchModeProps {
  pool: OracleGlyph[];
  pairCount: number;
  onComplete: (payload: { moves: number; knownIds: string[]; missedIds?: string[] }) => void;
  onBack: () => void;
}

function buildCards(glyphs: OracleGlyph[], pairCount: number): MatchCard[] {
  const picks = shuffle(glyphs).slice(0, Math.min(pairCount, glyphs.length));
  const cards: MatchCard[] = [];
  for (const g of picks) {
    cards.push({
      key: `${g.id}-g`,
      pairId: g.id,
      face: 'glyph',
      label: g.modern,
      flipped: false,
      matched: false,
    });
    cards.push({
      key: `${g.id}-m`,
      pairId: g.id,
      face: 'modern',
      label: g.modern,
      flipped: false,
      matched: false,
    });
  }
  return shuffle(cards);
}

export function MatchMode({ pool, pairCount, onComplete, onBack }: MatchModeProps) {
  const [cards, setCards] = useState<MatchCard[]>(() => buildCards(pool, pairCount));
  const [flips, setFlips] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);
  const [matched, setMatched] = useState(0);
  const doneRef = useRef(false);
  const totalPairs = Math.min(pairCount, pool.length);

  const reset = useCallback(() => {
    doneRef.current = false;
    setCards(buildCards(pool, pairCount));
    setFlips([]);
    setMoves(0);
    setLock(false);
    setMatched(0);
  }, [pool, pairCount]);

  const flip = (key: string) => {
    if (lock || doneRef.current) return;
    const card = cards.find((c) => c.key === key);
    if (!card || card.flipped || card.matched) return;
    if (flips.length >= 2) return;

    const nextFlips = [...flips, key];
    const nextCards = cards.map((c) => (c.key === key ? { ...c, flipped: true } : c));
    setCards(nextCards);
    setFlips(nextFlips);

    if (nextFlips.length < 2) return;

    const nextMoves = moves + 1;
    setMoves(nextMoves);
    const [aKey, bKey] = nextFlips;
    const a = nextCards.find((c) => c.key === aKey)!;
    const b = nextCards.find((c) => c.key === bKey)!;
    const isMatch = a.pairId === b.pairId && a.face !== b.face;

    if (isMatch) {
      setLock(true);
      window.setTimeout(() => {
        setCards((prev) =>
          prev.map((c) => (c.pairId === a.pairId ? { ...c, matched: true, flipped: true } : c)),
        );
        setMatched((n) => {
          const value = n + 1;
          if (value >= totalPairs && !doneRef.current) {
            doneRef.current = true;
            const knownIds = [...new Set(cards.map((c) => c.pairId))].slice(0, totalPairs);
            onComplete({ moves: nextMoves, knownIds });
          }
          return value;
        });
        setFlips([]);
        setLock(false);
      }, 360);
    } else {
      setLock(true);
      window.setTimeout(() => {
        setCards((prev) =>
          prev.map((c) => (nextFlips.includes(c.key) ? { ...c, flipped: false } : c)),
        );
        setFlips([]);
        setLock(false);
      }, 700);
    }
  };

  return (
    <div className={styles.mode}>
      <div className={styles.modeHeadRow}>
        <button type="button" className={styles.ghostBtn} onClick={onBack}>
          返回
        </button>
        <div className={styles.stats}>
          <span>
            步数 <strong>{moves}</strong>
          </span>
          <span>
            配对 <strong>{matched}/{totalPairs}</strong>
          </span>
        </div>
        <button type="button" className={styles.ghostBtn} onClick={reset}>
          重开
        </button>
      </div>

      <div className={styles.matchGrid}>
        {cards.map((card) => {
          const open = card.flipped || card.matched;
          const glyph = card.face === 'glyph' ? getGlyph(card.pairId) : undefined;
          return (
            <button
              key={card.key}
              type="button"
              className={`${styles.matchCard} ${open ? styles.matchOpen : ''} ${
                card.matched ? styles.matchDone : ''
              } ${card.face === 'glyph' ? styles.matchGlyph : ''}`}
              onClick={() => flip(card.key)}
              disabled={lock || card.matched}
              aria-label={open ? card.label : '未翻开的牌'}
            >
              <span className={styles.matchInner}>
                {open ? (
                  <>
                    {glyph && card.face === 'glyph' ? (
                      <GlyphImage glyph={glyph} alt={glyph.modern} />
                    ) : (
                      <strong>{card.label}</strong>
                    )}
                  </>
                ) : (
                  <span className={styles.matchBack}>契</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
