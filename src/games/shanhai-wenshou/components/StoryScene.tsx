'use client';

import { useCallback, useEffect, useState } from 'react';
import type { StoryBeat } from '../core/types';
import styles from '../ShanhaiWenshouGame.module.css';

/**
 * 剧情播放器：逐条演出 beats，点击/回车推进。
 * aside（旁白）与对话分两种排版。
 */
export function StoryScene({ beats, onDone }: { beats: StoryBeat[]; onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const beat = beats[Math.min(index, beats.length - 1)];

  const advance = useCallback(() => {
    if (index >= beats.length - 1) onDone();
    else setIndex((i) => i + 1);
  }, [index, beats.length, onDone]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance]);

  if (!beat) {
    return (
      <div className={styles.storyRoot}>
        <button type="button" className={styles.primaryBtn} onClick={onDone}>
          继续
        </button>
      </div>
    );
  }

  return (
    <div className={`${styles.storyRoot} ${beat.aside ? styles.storyAside : ''}`} onClick={advance}>
      <div className={styles.storyStage} aria-live="polite">
        <p className={styles.storyIndex}>
          {beat.aside ? '· 幕间 ·' : '· 对话 ·'} {index + 1} / {beats.length}
        </p>
        {!beat.aside && <p className={styles.storySpeaker}>{beat.speaker}</p>}
        <p className={beat.aside ? styles.storyAsideText : styles.storyText}>{beat.text}</p>
        <button type="button" className={styles.primaryBtn} onClick={advance}>
          {index >= beats.length - 1 ? '合上这一页' : '继续 ▸'}
        </button>
        <p className={styles.storyHint}>回车 / 空格 / 点击任意处继续</p>
      </div>
    </div>
  );
}
