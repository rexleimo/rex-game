'use client';

import { useState } from 'react';
import type { WenshouSave } from '../core/types';
import { BEASTS } from '../content/beasts';
import { litCount, quoteCorpus } from '../content/quotes';
import { BeastArt } from './BeastArt';
import styles from '../ShanhaiWenshouGame.module.css';

type CodexTab = 'beasts' | 'quotes';

/** 图志：兽栏图鉴（灰卡见过未收）+ 引文拓印（原文逐条点亮）。 */
export function CodexScene({ save, onBack }: { save: WenshouSave; onBack: () => void }) {
  const [tab, setTab] = useState<CodexTab>('beasts');
  const [selected, setSelected] = useState<string>(BEASTS[0]!.id);
  const beast = BEASTS.find((b) => b.id === selected)!;
  const tamedCount = Object.values(save.beasts).reduce((sum, n) => sum + (n ?? 0), 0);
  const tamedKinds = BEASTS.filter((b) => (save.beasts[b.id] ?? 0) > 0).length;
  const corpus = quoteCorpus();
  const lit = litCount(save);

  return (
    <div className={styles.codexRoot}>
      <header className={styles.codexHead}>
        <h2>鹊山图志{tab === 'quotes' ? ' · 引文' : ' · 兽栏'}</h2>
        <p className={styles.codexMeta}>
          {tab === 'beasts'
            ? `已收 ${tamedKinds}/${BEASTS.length} 种 · 累计问兽 ${tamedCount} 次`
            : `拓印 ${lit}/${corpus.length} 条——兽句收服点亮，山段祠礼祭成点亮`}
        </p>
      </header>

      <div className={styles.menuTabs} role="tablist">
        {([['beasts', '兽栏'], ['quotes', '引文拓印']] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={`${styles.menuTab} ${tab === key ? styles.menuTabOn : ''}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'quotes' && (
        <div className={styles.craftList}>
          {corpus.map((q) => {
            const on = q.lit(save);
            return (
              <blockquote key={q.id} className={styles.quoteCard} style={{ opacity: on ? 1 : 0.42 }}>
                <p className={styles.quoteLabel}>{q.label}{on ? ' · 已拓' : ' · 未拓'}</p>
                <p className={styles.quoteText}>{on ? q.text : '（尚未拓印——去山里走一趟，把这句话带回来。）'}</p>
              </blockquote>
            );
          })}
        </div>
      )}

      {tab === 'beasts' && (

      <div className={styles.codexLayout}>
        <nav className={styles.codexList} aria-label="图鉴列表">
          {BEASTS.map((b) => {
            const tamed = (save.beasts[b.id] ?? 0) > 0;
            const seen = tamed || save.encountered.includes(b.id);
            return (
              <button
                key={b.id}
                type="button"
                className={`${styles.codexItem} ${b.id === selected ? styles.codexItemOn : ''} ${tamed ? styles.codexItemTamed : ''}`}
                onClick={() => setSelected(b.id)}
              >
                <span className={styles.codexDot} style={{ background: tamed ? b.art.tint : 'transparent', borderColor: b.art.tint }} />
                <strong>{seen || tamed ? b.name : '？？？'}</strong>
                <small>{tamed ? `×${save.beasts[b.id]}` : seen ? '见过未收' : '未遇'}</small>
              </button>
            );
          })}
        </nav>

        <article className={styles.codexDetail}>
          <div className={styles.codexArtRow}>
            <BeastArt
              spec={beast.art}
              size={140}
              dim={(save.beasts[beast.id] ?? 0) === 0}
              title={beast.name}
            />
            <div>
              <h3>
                {beast.name}
                {beast.pinyin && <small className={styles.pinyin}>（{beast.pinyin}）</small>}
              </h3>
              <p className={styles.codexEffect}>「{beast.effect}」</p>
              <p className={styles.codexNature}>性 · {beast.nature}</p>
            </div>
          </div>
          <blockquote className={styles.quoteCard}>
            <p className={styles.quoteLabel}>原文</p>
            <p className={styles.quoteText}>{beast.quote}</p>
            <p className={styles.quotePlain}>{beast.plain}</p>
          </blockquote>
          <dl className={styles.codexFacts}>
            <div>
              <dt>形</dt>
              <dd>{beast.shape}</dd>
            </div>
            <div>
              <dt>声</dt>
              <dd>{beast.sound}</dd>
            </div>
            <div>
              <dt>佩饰</dt>
              <dd>
                {beast.kit.passive}：{beast.kit.passiveDesc}
                {beast.kit.active ? ` / 主动·${beast.kit.active.name}：${beast.kit.active.desc}` : ''}
              </dd>
            </div>
          </dl>
        </article>
      </div>
      )}

      <button type="button" className={styles.ghostBtn} onClick={onBack}>
        合上图志
      </button>
    </div>
  );
}
