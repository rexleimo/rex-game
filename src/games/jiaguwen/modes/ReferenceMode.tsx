'use client';

import { useState } from 'react';
import type { OracleCatalogForm } from '../core/types';
import { buildReferenceItems, type ReferenceItem } from '../core/referenceRound';
import styles from '../JiaguGame.module.css';

export interface ReferenceModeProps {
  forms: OracleCatalogForm[];
  itemCount?: number;
  onComplete: (payload: { correct: number; total: number }) => void;
  onBack: () => void;
}

export function ReferenceMode({ forms, itemCount = 6, onComplete, onBack }: ReferenceModeProps) {
  const [started, setStarted] = useState(false);
  const [deck, setDeck] = useState<ReferenceItem[]>(() => buildReferenceItems(forms, itemCount));
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<Array<number | null>>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const current = deck[index];

  const start = () => {
    setDeck(buildReferenceItems(forms, itemCount));
    setIndex(0);
    setPicks([]);
    setPicked(null);
    setRevealed(false);
    setStarted(true);
  };

  const choose = (option: number) => {
    if (revealed) return;
    setPicked(option);
    setRevealed(true);
    setPicks((previous) => {
      const next = [...previous];
      next[index] = option;
      return next;
    });
  };

  const next = () => {
    const finalPicks = [...picks];
    finalPicks[index] = picked;
    if (index + 1 >= deck.length) {
      onComplete({
        correct: finalPicks.filter((pick, itemIndex) => pick === deck[itemIndex].answer).length,
        total: deck.length,
      });
      return;
    }
    setIndex((value) => value + 1);
    setPicked(null);
    setRevealed(false);
  };

  if (!started) {
    return (
      <div className={styles.mode}>
        <div className={styles.modeHead}>
          <button type="button" className={styles.ghostBtn} onClick={onBack}>返回</button>
          <div>
            <p className={styles.eyebrow}>公开字形索引</p>
            <h2>字形寻踪</h2>
            <p className={styles.lead}>看一个公开字形样本，选择数据源给出的释读字头。这里只练形体辨认，不把上游标签当作释义定论。</p>
          </div>
        </div>
        <div className={styles.modeHeroCard}>
          <p>每局 {itemCount} 题，题目来自千字级公开字形样本；不影响课程字解锁或错题本。</p>
          <button type="button" className={styles.primaryBtn} onClick={start}>开始寻踪</button>
        </div>
      </div>
    );
  }

  const isRight = picked !== null && picked === current.answer;
  return (
    <div className={styles.mode}>
      <div className={styles.modeHeadRow}>
        <button type="button" className={styles.ghostBtn} onClick={onBack}>返回</button>
        <div className={styles.stats}>
          <span>第 <strong>{index + 1}</strong> / {deck.length} 题</span>
        </div>
      </div>
      <article className={styles.senseCard}>
        <div className={styles.senseGlyph}>
          <img src={current.form.image} alt="公开甲骨字形样本" />
        </div>
        <p className={styles.quizPrompt}>这个样本在公开索引中的释读字头是？</p>
        <div className={styles.quizOptions}>
          {current.options.map((option, optionIndex) => {
            let className = styles.quizOpt;
            if (revealed) {
              if (optionIndex === current.answer) className += ` ${styles.quizOptRight}`;
              else if (optionIndex === picked) className += ` ${styles.quizOptWrong}`;
            }
            return (
              <button key={option} type="button" className={className} onClick={() => choose(optionIndex)} disabled={revealed}>
                <span>{String.fromCharCode(65 + optionIndex)}</span>{option}
              </button>
            );
          })}
        </div>
        {revealed && (
          <div className={styles.quizExplain}>
            <p className={isRight ? styles.okText : styles.badText}>{isRight ? '与上游标签一致' : '查看上游标签'}</p>
            <p>上游标签：{current.form.modern}。不同材料、字例和学者的释读可能存在差异，建议到字库页继续比看。</p>
            <button type="button" className={styles.primaryBtn} onClick={next}>{index + 1 >= deck.length ? '查看成绩' : '下一题'}</button>
          </div>
        )}
      </article>
    </div>
  );
}
