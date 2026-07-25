'use client';

import { useCallback, useRef, useState } from 'react';
import type { MatchCard } from '../core/types';
import { SOLAR_TERMS } from '../content/terms';
import { shuffle } from '../core/progress';
import styles from '../JieqiGame.module.css';

export interface MatchModeProps {
  onComplete: (payload: { moves: number; pairs: number }) => void;
  onBack: () => void;
}

function buildCards(pairCount = 6): MatchCard[] {
  const picks = shuffle(SOLAR_TERMS).slice(0, pairCount);
  const cards: MatchCard[] = [];
  for (const t of picks) {
    cards.push({
      key: `${t.id}-n`,
      pairId: t.id,
      face: 'name',
      label: t.name,
      flipped: false,
      matched: false,
    });
    cards.push({
      key: `${t.id}-p`,
      pairId: t.id,
      face: 'phenology',
      label: t.phenology,
      flipped: false,
      matched: false,
    });
  }
  return shuffle(cards);
}

export function MatchMode({ onComplete, onBack }: MatchModeProps) {
  const [cards, setCards] = useState<MatchCard[]>([]);
  const [flips, setFlips] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);
  const [matched, setMatched] = useState(0);
  const [started, setStarted] = useState(false);
  const doneRef = useRef(false);
  const totalPairs = 6;

  const start = useCallback(() => {
    doneRef.current = false;
    setCards(buildCards(totalPairs));
    setFlips([]);
    setMoves(0);
    setLock(false);
    setMatched(0);
    setStarted(true);
  }, []);

  const flip = (key: string) => {
    if (lock || !started || doneRef.current) return;
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
            onComplete({ moves: nextMoves, pairs: totalPairs });
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

  if (!started) {
    return (
      <div className={styles.mode}>
        <div className={styles.modeHead}>
          <button type="button" className={styles.ghostBtn} onClick={onBack}>
            返回
          </button>
          <div>
            <p className={styles.eyebrow}>配对规则</p>
            <h2>节气名和物候</h2>
            <p className={styles.lead}>
              共六组配对。记住牌面位置，把节气名和相应物候连起来。
            </p>
          </div>
        </div>
        <div className={styles.modeHeroCard}>
          <p>每两次翻牌计一步。步数越少，成绩越好，最佳记录保存在本机。</p>
          <button type="button" className={styles.primaryBtn} onClick={start}>
            开始翻牌
          </button>
        </div>
      </div>
    );
  }

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
            配对 <strong>
              {matched}/{totalPairs}
            </strong>
          </span>
        </div>
        <button type="button" className={styles.ghostBtn} onClick={start}>
          重开
        </button>
      </div>

      <div className={styles.matchGrid}>
        {cards.map((card) => {
          const open = card.flipped || card.matched;
          return (
            <button
              key={card.key}
              type="button"
              className={`${styles.matchCard} ${open ? styles.matchOpen : ''} ${
                card.matched ? styles.matchDone : ''
              } ${card.face === 'phenology' ? styles.matchPhen : ''}`}
              onClick={() => flip(card.key)}
              disabled={lock || card.matched}
              aria-label={open ? card.label : '未翻开的牌'}
            >
              <span className={styles.matchInner}>
                {open ? (
                  <>
                    <small>{card.face === 'name' ? '节气' : '物候'}</small>
                    <strong>{card.label}</strong>
                  </>
                ) : (
                  <span className={styles.matchBack}>节</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
