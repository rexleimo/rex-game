'use client';

import { useState } from 'react';

import { scoreQuiz } from '../core/restoreScore';
import type { QuizOption } from '../core/types';
import styles from '../ShanhaiGame.module.css';

interface QuizRestoreProps {
  prompt: string;
  options: QuizOption[];
  explain: string;
  onComplete: (score: number, hintsUsed: number) => void;
}

export function QuizRestore({ prompt, options, explain, onComplete }: QuizRestoreProps) {
  const [picked, setPicked] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  const selected = options.find((o) => o.id === picked);
  const correct = Boolean(selected?.correct);

  const hint = () => {
    setHintsUsed((h) => h + 1);
    const right = options.find((o) => o.correct);
    if (right) setPicked(right.id);
  };

  const submit = () => {
    if (!picked) return;
    setRevealed(true);
  };

  const finish = () => {
    onComplete(scoreQuiz(correct, hintsUsed), hintsUsed);
  };

  return (
    <div className={styles.quiz}>
      <p className={styles.quizPrompt}>{prompt}</p>
      <ul className={styles.quizOptions}>
        {options.map((opt) => {
          const isPick = picked === opt.id;
          let stateClass = '';
          if (revealed && opt.correct) stateClass = styles.quizCorrect;
          else if (revealed && isPick && !opt.correct) stateClass = styles.quizWrong;
          else if (isPick) stateClass = styles.quizPicked;
          return (
            <li key={opt.id}>
              <button
                type="button"
                className={`${styles.quizOption} ${stateClass}`}
                disabled={revealed}
                onClick={() => setPicked(opt.id)}
              >
                {opt.text}
              </button>
            </li>
          );
        })}
      </ul>
      {revealed && <p className={styles.quizExplain}>{explain}</p>}
      <div className={styles.puzzleActions}>
        {!revealed && (
          <>
            <button type="button" className="gs-btn gs-btn--ghost" onClick={hint}>
              需要提示
            </button>
            <button
              type="button"
              className="gs-btn gs-btn--primary"
              disabled={!picked}
              onClick={submit}
            >
              确认
            </button>
          </>
        )}
        {revealed && (
          <button type="button" className="gs-btn gs-btn--primary" onClick={finish}>
            {correct ? '收录知识点' : '先记下正确说法'}
          </button>
        )}
      </div>
    </div>
  );
}
