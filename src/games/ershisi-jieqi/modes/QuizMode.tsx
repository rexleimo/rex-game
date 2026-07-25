'use client';

import { useState } from 'react';
import { buildQuizDeck } from '../content/quiz';
import { getTerm } from '../content/terms';
import styles from '../JieqiGame.module.css';

export interface QuizModeProps {
  onComplete: (payload: { score: number; total: number; correct: number }) => void;
  onBack: () => void;
}

export function QuizMode({ onComplete, onBack }: QuizModeProps) {
  const [started, setStarted] = useState(false);
  const [items, setItems] = useState(() => buildQuizDeck(8));
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<Array<number | null>>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const current = items[index];
  const scoredSoFar = picks.reduce<number>((n, p, i) => {
    if (i >= index) return n;
    return n + (p !== null && p === items[i]?.answer ? 1 : 0);
  }, 0);

  const start = () => {
    const deck = buildQuizDeck(8);
    setItems(deck);
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
    if (index + 1 >= items.length) {
      const finalPicks = [...picks];
      finalPicks[index] = picked;
      const correct = finalPicks.filter((p, i) => p === items[i].answer).length;
      onComplete({
        score: Math.round((correct / items.length) * 100),
        total: items.length,
        correct,
      });
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
    setRevealed(false);
  };

  if (!started) {
    return (
      <div className={styles.mode}>
        <div className={styles.modeHead}>
          <button type="button" className={styles.ghostBtn} onClick={onBack}>
            返回
          </button>
          <div>
            <p className={styles.eyebrow}>答题说明</p>
            <h2>八题节气问答</h2>
            <p className={styles.lead}>题目包括物候、农事和节令常识，作答后会显示讲解。</p>
          </div>
        </div>
        <div className={styles.modeHeroCard}>
          <p>没有倒计时。每局随机抽取八题，答完即可查看成绩。</p>
          <button type="button" className={styles.primaryBtn} onClick={start}>
            开始答题
          </button>
        </div>
      </div>
    );
  }

  const term = current.termId ? getTerm(current.termId) : null;
  const isRight = picked !== null && picked === current.answer;

  return (
    <div className={styles.mode}>
      <div className={styles.modeHeadRow}>
        <button type="button" className={styles.ghostBtn} onClick={onBack}>
          返回
        </button>
        <div className={styles.stats}>
          <span>
            第 <strong>{index + 1}</strong> / {items.length} 题
          </span>
          <span>
            已对 <strong>{scoredSoFar + (revealed && isRight ? 1 : 0)}</strong>
          </span>
        </div>
      </div>

      <article className={styles.quizCard}>
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
            <p className={isRight ? styles.okText : styles.badText}>
              {isRight ? '答对了' : '再记一次'}
            </p>
            <p>{current.explain}</p>
            {term && (
              <p className={styles.quizTermHint}>
                {term.name}：{term.oneLiner}
              </p>
            )}
            <button type="button" className={styles.primaryBtn} onClick={next}>
              {index + 1 >= items.length ? '查看成绩' : '下一题'}
            </button>
          </div>
        )}
      </article>
    </div>
  );
}
