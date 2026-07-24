'use client';

import { getArtifactArt } from '../content/artifactArt';
import { AUTH_TAG_LABEL, RARITY_LABEL } from '../content/artifacts';
import type { LoreCard, RestoreGrade } from '../core/types';
import styles from '../ShanhaiGame.module.css';

interface CultureCardViewProps {
  card: LoreCard;
  grade?: RestoreGrade;
  showActions?: boolean;
  onAckRead?: () => void;
  onToMuseum?: () => void;
  onShare?: () => void;
  onBack?: () => void;
  requireAck?: boolean;
  acked?: boolean;
  accent?: string;
}

export function CultureCardView({
  card,
  grade = 'none',
  showActions,
  onAckRead,
  onToMuseum,
  onShare,
  onBack,
  requireAck,
  acked,
  accent = '#6B7F6A',
}: CultureCardViewProps) {
  const art = getArtifactArt(card.id);

  return (
    <article
      className={styles.card}
      aria-label={`文化卡片：${card.name}`}
      style={{ ['--card-accent' as string]: accent }}
    >
      <div className={styles.cardFrame} aria-hidden>
        <span className={styles.cardCorner} data-c="tl" />
        <span className={styles.cardCorner} data-c="tr" />
        <span className={styles.cardCorner} data-c="bl" />
        <span className={styles.cardCorner} data-c="br" />
      </div>

      {art && (
        <div className={styles.cardArtWrap}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.cardArt} src={art} alt="" width={640} height={640} />
          <div className={styles.cardArtFade} aria-hidden />
        </div>
      )}

      <header className={styles.cardHead}>
        <div className={styles.cardTags}>
          <span className={styles.tag}>{AUTH_TAG_LABEL[card.authTag]}</span>
          <span className={styles.tagMuted}>{RARITY_LABEL[card.rarity]}</span>
          {grade !== 'none' && <span className={styles.tagGrade}>修复 {grade}</span>}
        </div>
        <h2 className={styles.cardTitle}>{card.name}</h2>
        <p className={styles.cardOne}>{card.oneLiner}</p>
        <div className={styles.cardRule} aria-hidden />
      </header>

      <section
        className={`${styles.cardBlock} ${requireAck && !acked ? styles.cardBlockFocus : ''}`}
      >
        <h3>
          <span className={styles.cardBlockIcon} aria-hidden>
            识
          </span>
          核心知识点
        </h3>
        <p>{card.coreLore}</p>
      </section>

      <section className={styles.cardBlock}>
        <h3>
          <span className={styles.cardBlockIcon} aria-hidden>
            今
          </span>
          今日关联
        </h3>
        <p>{card.todayLink}</p>
      </section>

      <section className={styles.cardTell}>
        <h3>可讲述句</h3>
        <blockquote>「{card.tellable}」</blockquote>
        <div className={styles.seal} aria-hidden>
          拾遗
        </div>
      </section>

      <details className={styles.cardDetails}>
        <summary>出处与延伸</summary>
        <p>
          <strong>出处：</strong>
          {card.source}
        </p>
        {card.extraLore && (
          <p>
            <strong>延伸：</strong>
            {card.extraLore}
          </p>
        )}
      </details>

      {showActions && (
        <div className={styles.cardActions}>
          {requireAck && !acked && onAckRead && (
            <button type="button" className="gs-btn gs-btn--primary" onClick={onAckRead}>
              知道了，记住这一点
            </button>
          )}
          {(!requireAck || acked) && (
            <>
              {onToMuseum && (
                <button type="button" className="gs-btn gs-btn--primary" onClick={onToMuseum}>
                  收入藏馆
                </button>
              )}
              {onShare && (
                <button type="button" className="gs-btn gs-btn--ghost" onClick={onShare}>
                  复制可讲述句
                </button>
              )}
              {onBack && (
                <button type="button" className="gs-btn gs-btn--ghost" onClick={onBack}>
                  返回
                </button>
              )}
            </>
          )}
        </div>
      )}
    </article>
  );
}
