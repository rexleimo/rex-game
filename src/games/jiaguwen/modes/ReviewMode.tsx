'use client';

import { useMemo, useState } from 'react';
import type { SenseItem } from '../core/types';
import { GLYPHS, getGlyph } from '../content/glyphs';
import { GlyphImage } from '../components/GlyphImage';
import styles from '../JiaguGame.module.css';

export interface ReviewModeProps {
  mistakeIds: string[];
  itemCount?: number;
  onComplete: (payload: { correct: number; total: number; knownIds: string[]; clearedIds: string[] }) => void;
  onBack: () => void;
}

export function ReviewMode({ mistakeIds, itemCount = 5, onComplete, onBack }: ReviewModeProps) {
  const items = useMemo(() => buildReviewItems(mistakeIds, itemCount), [mistakeIds, itemCount]);
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<Array<number | null>>(() => items.map(() => null));
  const [submitted, setSubmitted] = useState(false);

  const current = items[index];
  const currentGlyph = getGlyph(current.glyphId);

  const select = (i: number) => {
    if (submitted) return;
    setPicks((prev) => {
      const next = [...prev];
      next[index] = i;
      return next;
    });
  };

  const onSubmit = () => {
    if (submitted || picks[index] == null) return;
    setSubmitted(true);
  };

  const onNext = () => {
    if (index + 1 >= items.length) {
      const correct = items.reduce((acc, it, i) => acc + (picks[i] === it.answer ? 1 : 0), 0);
      const knownIds = items.filter((it, i) => picks[i] === it.answer).map((it) => it.glyphId);
      const clearedIds = knownIds;
      onComplete({ correct, total: items.length, knownIds, clearedIds });
      return;
    }
    setIndex((i) => i + 1);
    setSubmitted(false);
  };

  const isCorrect = picks[index] === current.answer;

  return (
    <div className={styles.modeWrapper}>
      <div className={styles.modeHead}>
        <button type="button" className={styles.ghostBtn} onClick={onBack}>
          返回
        </button>
        <div>
          <p className={styles.eyebrow}>错题复习</p>
          <h2>第 {index + 1}/{items.length} 题</h2>
        </div>
      </div>

      {currentGlyph && (
        <div className={styles.reviewGlyph}>
          <GlyphImage glyph={currentGlyph} />
        </div>
      )}

      <p className={styles.reviewPrompt}>{current.prompt}</p>

      <div className={styles.senseOptions}>
        {current.options.map((opt, i) => {
          const picked = picks[index] === i;
          const showResult = submitted;
          const isAnswer = i === current.answer;
          let stateClass = '';
          if (showResult) {
            if (isAnswer) stateClass = styles.optionCorrect;
            else if (picked) stateClass = styles.optionWrong;
          } else if (picked) {
            stateClass = styles.optionSelected;
          }
          return (
            <button
              key={opt}
              type="button"
              className={`${styles.senseOption} ${stateClass}`}
              onClick={() => select(i)}
              disabled={submitted}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {submitted && (
        <div className={`${styles.senseExplain} ${isCorrect ? styles.senseExplainGood : ''}`}>
          {isCorrect ? '答对了，已移出错题本。' : `正确答案是：${current.options[current.answer]}`}
          <p>{current.explain}</p>
        </div>
      )}

      <div className={styles.modeActions}>
        {!submitted ? (
          <button type="button" className={styles.primaryBtn} onClick={onSubmit} disabled={picks[index] == null}>
            提交
          </button>
        ) : (
          <button type="button" className={styles.primaryBtn} onClick={onNext}>
            {index + 1 >= items.length ? '查看结果' : '下一题'}
          </button>
        )}
        <button type="button" className={styles.ghostBtn} onClick={onBack}>
          退出
        </button>
      </div>
    </div>
  );
}

function buildReviewItems(mistakeIds: string[], count: number): SenseItem[] {
  const uniqueMistakes = [...new Set(mistakeIds)];
  const poolIds = uniqueMistakes.length >= count ? uniqueMistakes : [...uniqueMistakes, ...GLYPHS.filter((g) => !uniqueMistakes.includes(g.id)).map((g) => g.id)];
  const selected = shuffle(poolIds).slice(0, count);

  return selected.map((id, idx) => {
    const glyph = getGlyph(id) ?? GLYPHS[0];
    const options = buildOptions(glyph.gloss);
    return {
      id: `review-${idx}`,
      glyphId: glyph.id,
      prompt: `「${glyph.modern}」字的字义是什么？`,
      options,
      answer: options.indexOf(glyph.gloss),
      explain: `${glyph.modern}：${glyph.gloss}。${glyph.shapeHint}`,
    };
  });
}

function buildOptions(answer: string): string[] {
  const distractors = shuffle(GLYPHS.filter((g) => g.gloss !== answer)).slice(0, 2).map((g) => g.gloss);
  return shuffle([answer, ...distractors]);
}

function shuffle<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
