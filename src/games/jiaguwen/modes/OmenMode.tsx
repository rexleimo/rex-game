'use client';

import { useState } from 'react';
import type { OmenItem } from '../core/types';
import { getGlyph } from '../content/glyphs';
import { OMENS } from '../content/omens';
import { GlyphImage } from '../components/GlyphImage';
import { shuffle } from '../core/progress';
import styles from '../JiaguGame.module.css';

export interface OmenModeProps {
  items?: OmenItem[];
  itemCount?: number;
  onComplete: (payload: { correct: number; total: number; knownIds: string[]; missedIds?: string[] }) => void;
  onBack: () => void;
}

export function pickOmens(itemCount: number): OmenItem[] {
  return shuffle([...OMENS]).slice(0, itemCount);
}

export function OmenMode({ items, itemCount = 3, onComplete, onBack }: OmenModeProps) {
  const [started, setStarted] = useState(false);
  const [deck, setDeck] = useState<OmenItem[]>(() => items ?? pickOmens(itemCount));
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<Array<number | null>>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const current = deck[index];

  const start = () => {
    const next = items ?? pickOmens(itemCount);
    setDeck(next);
    setIndex(0);
    setPicks([]);
    setPicked(null);
    setRevealed(false);
    setStarted(true);
  };

  const choose = (optIndex: number) => {
    if (revealed) return;
    setPicked(optIndex);
    setRevealed(true);
    setPicks((prev) => {
      const next = [...prev];
      next[index] = optIndex;
      return next;
    });
  };

  const next = () => {
    const finalPicks = [...picks];
    finalPicks[index] = picked;
    if (index + 1 >= deck.length) {
      const correct = finalPicks.filter((p, i) => p === deck[i].answer).length;
      const knownIds = deck.filter((_, i) => finalPicks[i] === deck[i].answer).map((d) => d.blankId);
      const missedIds = deck.filter((_, i) => finalPicks[i] !== deck[i].answer).map((d) => d.blankId);
      onComplete({ correct, total: deck.length, knownIds, missedIds });
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
    setRevealed(false);
  };

  const scoredSoFar = picks.reduce<number>((n, p, i) => {
    if (i >= index) return n;
    return n + (p !== null && p === deck[i]?.answer ? 1 : 0);
  }, 0);

  if (!started) {
    return (
      <div className={styles.mode}>
        <div className={styles.modeHead}>
          <button type="button" className={styles.ghostBtn} onClick={onBack}>
            返回
          </button>
          <div>
            <p className={styles.eyebrow}>卜辞</p>
            <h2>读一句三千年前的问话</h2>
            <p className={styles.lead}>卜辞是古人刻在甲骨上的问句。选一个甲骨字，把问话补完整。</p>
          </div>
        </div>
        <div className={styles.modeHeroCard}>
          <p>每题一句。先猜大意，再揭晓翻译，最后了解「古人为什么问这个」。</p>
          <button type="button" className={styles.primaryBtn} onClick={start}>
            开始卜辞
          </button>
        </div>
      </div>
    );
  }

  const glyph = getGlyph(current.blankId);
  const isRight = picked !== null && picked === current.answer;

  return (
    <div className={styles.mode}>
      <div className={styles.modeHeadRow}>
        <button type="button" className={styles.ghostBtn} onClick={onBack}>
          返回
        </button>
        <div className={styles.stats}>
          <span>
            第 <strong>{index + 1}</strong> / {deck.length} 题
          </span>
          <span>
            已对 <strong>{scoredSoFar + (revealed && isRight ? 1 : 0)}</strong>
          </span>
        </div>
      </div>

      <article className={styles.omenCard}>
        <p className={styles.omenOracle}>{current.oracleText}</p>
        <p className={styles.omenHint}>选一个甲骨字形填入「□」</p>

        <div className={styles.omenOptions}>
          {current.options.map((opt, i) => {
            const optGlyph = getGlyph(opt);
            let cls = styles.omenOpt;
            if (revealed) {
              if (i === current.answer) cls += ` ${styles.omenOptRight}`;
              else if (i === picked) cls += ` ${styles.omenOptWrong}`;
            } else if (i === picked) {
              cls += ` ${styles.omenOptActive}`;
            }
            return (
              <button key={opt + i} type="button" className={cls} onClick={() => choose(i)} disabled={revealed}>
                {optGlyph ? (
                  <GlyphImage glyph={optGlyph} alt={optGlyph.modern} />
                ) : (
                  <span className={styles.omenOptText}>{opt}</span>
                )}
              </button>
            );
          })}
        </div>

        {revealed && (
          <div className={styles.quizExplain}>
            <p className={isRight ? styles.okText : styles.badText}>{isRight ? '补对了' : '是另一个字'}</p>
            <p>{current.vernacular}</p>
            <p className={styles.quizTermHint}>{current.whyAsked}</p>
            {glyph && (
              <p className={styles.quizTermHint}>
                「{glyph.modern}」{glyph.gloss}：{glyph.shapeHint}
              </p>
            )}
            <button type="button" className={styles.primaryBtn} onClick={next}>
              {index + 1 >= deck.length ? '查看成绩' : '下一题'}
            </button>
          </div>
        )}
      </article>
    </div>
  );
}
