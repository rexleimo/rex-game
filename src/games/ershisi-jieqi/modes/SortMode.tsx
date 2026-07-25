'use client';

import { useMemo, useState } from 'react';
import type { SeasonId } from '../core/types';
import { SEASON_META } from '../core/types';
import { termsBySeason, termsInOrder, getTerm } from '../content/terms';
import { shuffle } from '../core/progress';
import styles from '../JieqiGame.module.css';

export interface SortModeProps {
  onComplete: (payload: {
    season: SeasonId | 'year';
    correct: boolean;
    score: number;
    targetIds: string[];
  }) => void;
  onBack: () => void;
}

type Level = SeasonId | 'year';

export function SortMode({ onComplete, onBack }: SortModeProps) {
  const [level, setLevel] = useState<Level | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [pool, setPool] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [feedback, setFeedback] = useState<boolean[]>([]);

  const targetIds = useMemo(() => {
    if (!level) return [] as string[];
    if (level === 'year') return termsInOrder().map((t) => t.id);
    return termsBySeason(level).map((t) => t.id);
  }, [level]);

  const start = (lv: Level) => {
    const ids =
      lv === 'year' ? termsInOrder().map((t) => t.id) : termsBySeason(lv).map((t) => t.id);
    setLevel(lv);
    setSlots(Array(ids.length).fill(''));
    setPool(shuffle(ids));
    setSelected(null);
    setChecked(false);
    setFeedback([]);
  };

  const place = (slotIndex: number) => {
    if (checked || !selected) return;
    setSlots((prev) => {
      const next = [...prev];
      // 若槽位已有，退回池
      const existing = next[slotIndex];
      setPool((p) => {
        let np = p.filter((id) => id !== selected);
        if (existing) np = [...np, existing];
        return np;
      });
      next[slotIndex] = selected;
      return next;
    });
    setSelected(null);
  };

  const takeFromSlot = (slotIndex: number) => {
    if (checked) return;
    const id = slots[slotIndex];
    if (!id) return;
    setSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = '';
      return next;
    });
    setPool((p) => [...p, id]);
    setSelected(id);
  };

  const pickFromPool = (id: string) => {
    if (checked) return;
    setSelected((cur) => (cur === id ? null : id));
  };

  const autoFillEmpty = (id: string) => {
    if (checked) return;
    const empty = slots.findIndex((s) => !s);
    if (empty < 0) {
      pickFromPool(id);
      return;
    }
    setSelected(id);
    // 直接放入第一个空位
    setSlots((prev) => {
      const next = [...prev];
      const i = next.findIndex((s) => !s);
      if (i >= 0) {
        next[i] = id;
        setPool((p) => p.filter((x) => x !== id));
      }
      return next;
    });
    setSelected(null);
  };

  const check = () => {
    if (!level || slots.some((s) => !s)) return;
    const fb = slots.map((id, i) => id === targetIds[i]);
    const correctCount = fb.filter(Boolean).length;
    const score = Math.round((correctCount / targetIds.length) * 100);
    setFeedback(fb);
    setChecked(true);
    onComplete({
      season: level,
      correct: correctCount === targetIds.length,
      score,
      targetIds,
    });
  };

  const reset = () => {
    if (!level) return;
    start(level);
  };

  if (!level) {
    return (
      <div className={styles.mode}>
        <div className={styles.modeHead}>
          <button type="button" className={styles.ghostBtn} onClick={onBack}>
            返回
          </button>
          <div>
            <p className={styles.eyebrow}>选择练习范围</p>
            <h2>按时间排好节气</h2>
            <p className={styles.lead}>可从一季开始，也可直接练习全年二十四节气。</p>
          </div>
        </div>
        <div className={styles.levelGrid}>
          {(Object.keys(SEASON_META) as SeasonId[]).map((s) => (
            <button key={s} type="button" className={styles.levelCard} onClick={() => start(s)}>
              <span className={styles.levelTint}>六个节气</span>
              <strong>{SEASON_META[s].name}季六节</strong>
              <span>{SEASON_META[s].blurb}</span>
              <em>{termsBySeason(s).map((t) => t.name).join('、')}</em>
            </button>
          ))}
          <button type="button" className={`${styles.levelCard} ${styles.levelCardHard}`} onClick={() => start('year')}>
            <span className={styles.levelTint}>二十四个节气</span>
            <strong>全年挑战</strong>
            <span>按正确顺序排出全部 24 个节气</span>
            <em>适合完整复习，题量较大</em>
          </button>
        </div>
      </div>
    );
  }

  const title =
    level === 'year' ? '全年二十四节气' : `${SEASON_META[level].name}季六节气`;

  return (
    <div className={styles.mode}>
      <div className={styles.modeHead}>
        <button type="button" className={styles.ghostBtn} onClick={() => setLevel(null)}>
          重选范围
        </button>
        <div>
          <p className={styles.eyebrow}>正在排序</p>
          <h2>{title}</h2>
          <p className={styles.lead}>点击下方节气牌，自动填入时间轴空位；点时间轴可取回重排。</p>
        </div>
      </div>

      <ol className={styles.timeline}>
        {slots.map((id, i) => {
          const term = id ? getTerm(id) : null;
          const ok = checked ? feedback[i] : null;
          return (
            <li key={i}>
              <button
                type="button"
                className={`${styles.slot} ${term ? styles.slotFilled : ''} ${
                  ok === true ? styles.slotOk : ok === false ? styles.slotBad : ''
                }`}
                onClick={() => (term ? takeFromSlot(i) : place(i))}
              >
                <span className={styles.slotIndex}>{String(i + 1).padStart(2, '0')}</span>
                {term ? (
                  <>
                    <span className={styles.slotGlyph} aria-hidden>
                      {String(term.order).padStart(2, '0')}
                    </span>
                    <span className={styles.slotName}>{term.name}</span>
                  </>
                ) : (
                  <span className={styles.slotEmpty}>空位</span>
                )}
              </button>
            </li>
          );
        })}
      </ol>

      <div className={styles.pool}>
        <p className={styles.poolLabel}>待排序</p>
        <div className={styles.poolGrid}>
          {pool.map((id) => {
            const term = getTerm(id)!;
            return (
              <button
                key={id}
                type="button"
                className={`${styles.chip} ${selected === id ? styles.chipActive : ''}`}
                onClick={() => autoFillEmpty(id)}
                style={{ ['--chip' as string]: term.tint }}
              >
                <span aria-hidden>{String(term.order).padStart(2, '0')}</span>
                {term.name}
              </button>
            );
          })}
          {!pool.length && <p className={styles.poolDone}>已全部放入时间轴</p>}
        </div>
      </div>

      <div className={styles.modeActions}>
        <button type="button" className={styles.ghostBtn} onClick={reset}>
          打乱重来
        </button>
        <button
          type="button"
          className={styles.primaryBtn}
          disabled={slots.some((s) => !s) || checked}
          onClick={check}
        >
          核对时序
        </button>
      </div>

      {checked && (
        <div className={styles.inlineResult}>
          <p>
            正确 {feedback.filter(Boolean).length}/{slots.length}，得分{' '}
            {Math.round((feedback.filter(Boolean).length / slots.length) * 100)}
          </p>
          <div className={styles.answerKey}>
            {targetIds.map((id, i) => {
              const t = getTerm(id)!;
              return (
                <span key={id} className={feedback[i] ? styles.keyOk : styles.keyBad}>
                  {t.name}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
