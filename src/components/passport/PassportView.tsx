'use client';

/**
 * 文化护照。
 *
 * 五个展品各自为政的时候，玩完一个没有任何理由去玩第二个。护照是把它们缝成
 * 一座馆的那条线：未集到的卡显示获取提示，提示本身就是去下一个展品的动机。
 *
 * 进度只存在于玩家浏览器，服务端一无所知——所以首帧渲染的是空护照，
 * 挂载后才替换成真实数据。
 */

import { useEffect, useState } from 'react';

import { usePassport } from '@/core/passport';
import { trackShareClick, trackStepComplete } from '@/core/analytics';
import { downloadBlob } from '@/core/share/cardCanvas';
import { buildPassportShareCard } from '@/core/share/passportCard';
import type { PassportGameSection } from '@/core/passport';

import styles from './PassportView.module.css';

function Stamp({ earned, accent }: { earned: boolean; accent: string }) {
  return (
    <span
      className={earned ? styles.stampEarned : styles.stampBlank}
      style={earned ? { borderColor: accent, color: accent } : undefined}
      aria-hidden
    >
      {earned ? '✦' : '·'}
    </span>
  );
}

function Section({ section, hydrated }: { section: PassportGameSection; hydrated: boolean }) {
  const complete = section.earnedCount === section.totalCount;

  return (
    <section className={styles.section}>
      <header className={styles.sectionHead}>
        <div>
          <h2 className={styles.sectionTitle}>{section.name}</h2>
          <p className={styles.sectionCount}>
            {hydrated ? (
              <>
                {section.earnedCount} / {section.totalCount}
                {complete && <span className={styles.complete}> · 已集齐</span>}
              </>
            ) : (
              <span className={styles.loading}>读取本机进度…</span>
            )}
          </p>
        </div>
        <a className={styles.sectionLink} href={section.href} style={{ color: section.accent }}>
          {section.earnedCount === 0 ? '去体验' : '继续'} →
        </a>
      </header>

      <ul className={styles.cards}>
        {section.cards.map((card) => (
          <li
            key={card.id}
            className={card.earned ? styles.cardEarned : styles.cardBlank}
            style={card.earned ? { borderColor: `${section.accent}55` } : undefined}
          >
            <Stamp earned={card.earned} accent={section.accent} />
            <div className={styles.cardBody}>
              <h3 className={styles.cardName}>{card.earned ? card.name : '未解锁'}</h3>
              <p className={styles.cardText}>{card.earned ? card.blurb : card.hint}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

const PASSPORT_COMPLETE_TRACKED_KEY = 'rex-game:passport:complete-tracked:v1';

export function PassportView() {
  const { passport, hydrated } = usePassport();
  const [shareState, setShareState] = useState<'idle' | 'working' | 'failed'>('idle');

  // 集齐全馆是目前最深状态；只报一次，避免每次打开护照页都刷 step_complete
  useEffect(() => {
    if (!hydrated || passport.totalCount <= 0) return;
    if (passport.earnedCount !== passport.totalCount) return;
    try {
      if (window.localStorage.getItem(PASSPORT_COMPLETE_TRACKED_KEY) === '1') return;
      window.localStorage.setItem(PASSPORT_COMPLETE_TRACKED_KEY, '1');
    } catch {
      /* 隐私模式：仍上报，最多重报 */
    }
    trackStepComplete('passport', 'collection', 'passport-complete');
  }, [hydrated, passport.earnedCount, passport.totalCount]);

  const handleShare = async () => {
    setShareState('working');
    try {
      const blob = await buildPassportShareCard(passport);
      downloadBlob(blob, `我的文化护照-${passport.earnedCount}张.png`);
      trackShareClick('passport', 'passport-page');
      setShareState('idle');
    } catch {
      setShareState('failed');
    }
  };

  const pct = passport.totalCount
    ? Math.round((passport.earnedCount / passport.totalCount) * 100)
    : 0;

  return (
    <div className={styles.root}>
      <div className={styles.summary}>
        <div className={styles.summaryNumbers}>
          <strong className={styles.big}>{hydrated ? passport.earnedCount : '—'}</strong>
          <span className={styles.of}>/ {passport.totalCount} 张文化卡</span>
        </div>
        <div className={styles.meter} role="img" aria-label={`已集 ${pct}%`}>
          <div className={styles.meterFill} style={{ width: hydrated ? `${pct}%` : '0%' }} />
        </div>
        <p className={styles.summaryText}>
          {!hydrated
            ? '正在读取本机进度…'
            : passport.earnedCount === 0
              ? '还没有印记。任选一件展品玩一局，第一张卡就会落在这里。'
              : `已走过 ${passport.visitedGames} / ${passport.sections.length} 件展品。`}
        </p>

        {hydrated && passport.earnedCount > 0 && (
          <div className={styles.shareRow}>
            <button
              type="button"
              className={styles.shareBtn}
              onClick={handleShare}
              disabled={shareState === 'working'}
            >
              {shareState === 'working' ? '生成中…' : '生成护照分享卡'}
            </button>
            {shareState === 'failed' && (
              <span className={styles.shareError}>生成失败，请重试。</span>
            )}
          </div>
        )}
      </div>

      {passport.sections.map((section) => (
        <Section key={section.game} section={section} hydrated={hydrated} />
      ))}

      <p className={styles.note}>
        护照只存在这台设备的浏览器里，不上传、不跨设备同步。清空浏览器数据会一并清空。
      </p>
    </div>
  );
}
