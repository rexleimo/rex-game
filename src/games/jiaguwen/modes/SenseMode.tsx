'use client';

import { useState } from 'react';
import type { SenseItem, OracleGlyph } from '../core/types';
import { GLYPHS, getGlyph } from '../content/glyphs';
import { GlyphImage } from '../components/GlyphImage';
import { shuffle } from '../core/progress';
import styles from '../JiaguGame.module.css';

export interface SenseModeProps {
  pool: OracleGlyph[];
  items?: SenseItem[];
  itemCount?: number;
  onComplete: (payload: { correct: number; total: number; knownIds: string[]; missedIds?: string[] }) => void;
  onBack: () => void;
}

export function buildSenseItems(glyphs: OracleGlyph[], itemCount: number): SenseItem[] {
  const picks = shuffle(glyphs).slice(0, Math.min(itemCount, glyphs.length));
  return picks.map((target) => {
    const wrong = shuffle(
      GLYPHS.filter((g) => g.id !== target.id && !target.tags.some((t) => g.tags.includes(t))),
    ).slice(0, 2);
    const options = shuffle([target.gloss, ...wrong.map((g) => g.gloss)]);
    return {
      id: target.id,
      glyphId: target.id,
      prompt: '这个甲骨字形，通识认为是什么含义？',
      options,
      answer: options.indexOf(target.gloss),
      explain: target.shapeHint,
    };
  });
}

export function SenseMode({ pool, items, itemCount = 4, onComplete, onBack }: SenseModeProps) {
  const [started, setStarted] = useState(false);
  const [deck, setDeck] = useState<SenseItem[]>(() => items ?? buildSenseItems(pool, itemCount));
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<Array<number | null>>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const current = deck[index];

  const start = () => {
    const next = items ?? buildSenseItems(pool, itemCount);
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
      const knownIds = deck.filter((_, i) => finalPicks[i] === deck[i].answer).map((d) => d.glyphId);
      const missedIds = deck.filter((_, i) => finalPicks[i] !== deck[i].answer).map((d) => d.glyphId);
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
            <p className={styles.eyebrow}>契意</p>
            <h2>看形象，选字义</h2>
            <p className={styles.lead}>甲骨文字形是象形的：先看它像什么，再选它的含义。</p>
          </div>
        </div>
        <div className={styles.modeHeroCard}>
          <p>每局 {itemCount} 题。答对的字会加入已识字库。</p>
          <button type="button" className={styles.primaryBtn} onClick={start}>
            开始选义
          </button>
        </div>
      </div>
    );
  }

  const glyph = getGlyph(current.glyphId);
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

      <article className={styles.senseCard}>
        {glyph && (
          <div className={styles.senseGlyph}>
            <GlyphImage glyph={glyph} />
          </div>
        )}
        <p className={styles.quizPrompt}>{current.prompt}</p>
        <div className={styles.quizOptions}>
          {current.options.map((opt, i) => {
            let cls = styles.quizOpt;
            if (revealed) {
              if (i === current.answer) cls += ` ${styles.quizOptRight}`;
              else if (i === picked) cls += ` ${styles.quizOptWrong}`;
            } else if (i === picked) {
              cls += ` ${styles.quizOptActive}`;
            }
            return (
              <button key={opt + i} type="button" className={cls} onClick={() => choose(i)} disabled={revealed}>
                <span>{String.fromCharCode(65 + i)}</span>
                {opt}
              </button>
            );
          })}
        </div>

        {revealed && (
          <div className={styles.quizExplain}>
            <p className={isRight ? styles.okText : styles.badText}>{isRight ? '答对了' : '再记一次'}</p>
            <p>{current.explain}</p>
            {glyph && (
              <p className={styles.quizTermHint}>
                {glyph.modern}：{glyph.gloss}
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
