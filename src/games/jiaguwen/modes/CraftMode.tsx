'use client';

import { useMemo, useState } from 'react';
import type { CompoundRecipe, OracleGlyph } from '../core/types';
import { GLYPHS, getGlyph } from '../content/glyphs';
import { COMPOUNDS } from '../content/compounds';
import { GlyphImage } from '../components/GlyphImage';
import styles from '../JiaguGame.module.css';

export interface CraftModeProps {
  itemCount?: number;
  onComplete: (payload: { correct: number; total: number; knownIds: string[] }) => void;
  onBack: () => void;
}

export function CraftMode({ itemCount = 5, onComplete, onBack }: CraftModeProps) {
  const recipes = useMemo(() => shuffle(COMPOUNDS).slice(0, itemCount), [itemCount]);
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<string[]>([]);
  const [results, setResults] = useState<boolean[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const current = recipes[index];
  const partGlyphs = useMemo(() => current.parts.map((id) => getGlyph(id)).filter((g): g is OracleGlyph => Boolean(g)), [current]);

  // 候选部件：当前题所需部件 + 从字库中随机抽取的干扰项，共 8 个
  const candidates = useMemo(() => {
    const required = current.parts;
    const pool = GLYPHS.filter((g) => !required.includes(g.id));
    const distractors = shuffle(pool).slice(0, Math.max(2, 8 - required.length));
    const candidateIds = [...new Set([...required, ...distractors.map((g) => g.id)])];
    return shuffle(candidateIds);
  }, [current]);

  const isCorrect = (recipe: CompoundRecipe, selected: string[]) => {
    if (selected.length !== recipe.parts.length) return false;
    return selected.every((id, i) => id === recipe.parts[i]);
  };

  const onSubmit = () => {
    if (submitted) return;
    const ok = isCorrect(current, picks);
    setSubmitted(true);
    setResults((prev) => [...prev, ok]);
  };

  const onNext = () => {
    if (index + 1 >= recipes.length) {
      const correct = results.filter(Boolean).length + (submitted && isCorrect(current, picks) ? 1 : 0);
      const knownIds = recipes.filter((r, i) => (i < index ? results[i] : submitted && isCorrect(r, picks))).flatMap((r) => r.parts);
      onComplete({ correct, total: recipes.length, knownIds: [...new Set(knownIds)] });
      return;
    }
    setIndex((i) => i + 1);
    setPicks([]);
    setSubmitted(false);
  };

  const togglePart = (id: string) => {
    if (submitted) return;
    setPicks((prev) => {
      const pos = prev.indexOf(id);
      if (pos === -1) return [...prev, id];
      const next = [...prev];
      next.splice(pos, 1);
      return next;
    });
  };

  return (
    <div className={styles.modeWrapper}>
      <div className={styles.modeHead}>
        <button type="button" className={styles.ghostBtn} onClick={onBack}>
          返回
        </button>
        <div>
          <p className={styles.eyebrow}>部件造字</p>
          <h2>第 {index + 1}/{recipes.length} 题</h2>
        </div>
      </div>

      <div className={styles.craftTarget}>
        <span className={styles.craftTargetText}>{current.result}</span>
        <p className={styles.craftHint}>{current.hint}</p>
      </div>

      <div className={styles.craftPicks}>
        <p className={styles.craftPicksLabel}>已选部件：</p>
        <div className={styles.craftPicksRow}>
          {picks.length === 0 && <span className={styles.craftEmpty}>点击下面部件添加</span>}
          {picks.map((id) => {
            const g = getGlyph(id);
            if (!g) return null;
            return (
              <button key={`${id}-${picks.indexOf(id)}`} type="button" className={styles.craftPickChip} onClick={() => togglePart(id)} disabled={submitted}>
                <GlyphImage glyph={g} />
                <span>{g.modern}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.craftCandidates}>
        {candidates.map((id) => {
          const g = getGlyph(id);
          if (!g) return null;
          const selectedCount = picks.filter((p) => p === id).length;
          const neededCount = current.parts.filter((p) => p === id).length;
          const isActive = selectedCount > 0;
          const disabled = submitted || selectedCount >= neededCount;
          return (
            <button
              key={id}
              type="button"
              className={`${styles.craftCandidate} ${isActive ? styles.craftCandidateActive : ''} ${disabled ? styles.craftCandidateDisabled : ''}`}
              onClick={() => togglePart(id)}
              disabled={disabled}
            >
              <GlyphImage glyph={g} />
              <span>{g.modern}</span>
            </button>
          );
        })}
      </div>

      {submitted && (
        <div className={`${styles.craftFeedback} ${isCorrect(current, picks) ? styles.craftFeedbackGood : styles.craftFeedbackBad}`}>
          <p>{isCorrect(current, picks) ? '拼对啦！' : '差一点。'}</p>
          <p className={styles.craftLore}>{current.lore}</p>
          <p className={styles.craftParts}>
            正确部件：
            {partGlyphs.map((g) => g.modern).join(' + ')}
          </p>
        </div>
      )}

      <div className={styles.craftActions}>
        {!submitted ? (
          <button type="button" className={styles.primaryBtn} onClick={onSubmit} disabled={picks.length === 0}>
            提交
          </button>
        ) : (
          <button type="button" className={styles.primaryBtn} onClick={onNext}>
            {index + 1 >= recipes.length ? '查看结果' : '下一题'}
          </button>
        )}
        <button type="button" className={styles.ghostBtn} onClick={onBack}>
          退出
        </button>
      </div>
    </div>
  );
}

function shuffle<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
