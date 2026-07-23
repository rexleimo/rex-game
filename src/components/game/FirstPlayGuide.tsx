'use client';

import { useEffect, useId, useState } from 'react';

import { completeFirstPlay, hasCompletedFirstPlay } from './FirstPlayGuideState';

export interface FirstPlayGuideProps {
  storageKey: string;
  title: string;
  description: string;
  steps: string[];
}

/** A small, reusable first-visit overlay. Closing it records completion per game. */
export function FirstPlayGuide({ storageKey, title, description, steps }: FirstPlayGuideProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    setOpen(!hasCompletedFirstPlay(window.localStorage, storageKey));
  }, [storageKey]);

  const close = () => {
    completeFirstPlay(window.localStorage, storageKey);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="gs-first-play" role="presentation">
      <section className="gs-first-play__dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <p className="gs-eyebrow">新手引导 / 第一次游玩</p>
        <h2 id={titleId}>{title}</h2>
        <p className="gs-first-play__intro">{description}</p>
        <ol className="gs-first-play__steps">
          {steps.map((step, index) => (
            <li key={step}>
              <span aria-hidden>{String(index + 1).padStart(2, '0')}</span>
              {step}
            </li>
          ))}
        </ol>
        <div className="gs-first-play__actions">
          <button className="gs-btn gs-btn--primary" type="button" onClick={close}>我知道了，开始游戏</button>
          <button className="gs-first-play__skip" type="button" onClick={close}>跳过引导</button>
        </div>
      </section>
    </div>
  );
}
