'use client';

import { useMemo, useState } from 'react';
import { GLYPHS, getGlyph, SOURCES_NOTE } from '../content/glyphs';
import type { JiaguProgress } from '../core/types';
import { GlyphImage } from '../components/GlyphImage';
import styles from '../JiaguGame.module.css';

export interface CodexProps {
  knownIds: string[];
  readIds: string[];
  onRead: (id: string) => void;
  onBack: () => void;
}

export function Codex({ knownIds, readIds, onRead, onBack }: CodexProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const knownSet = useMemo(() => new Set(knownIds), [knownIds]);
  const readSet = useMemo(() => new Set(readIds), [readIds]);

  const active = selectedId ? getGlyph(selectedId) ?? null : null;
  if (active) {
    if (!readSet.has(active.id)) onRead(active.id);
  }

  return (
    <div className={styles.codex}>
      <div className={styles.modeHead}>
        <button type="button" className={styles.ghostBtn} onClick={onBack}>
          返回
        </button>
        <div>
          <p className={styles.eyebrow}>字图鉴</p>
          <h2>{active ? active.modern : '60 字甲骨图鉴'}</h2>
          <p className={styles.lead}>
            {active ? '点选左侧可切换其他字。' : '点击任意字查看释义、造字思路与字形演变。'}
          </p>
        </div>
      </div>

      <div className={styles.codexBody}>
        <ul className={styles.glyphList}>
          {GLYPHS.map((g) => {
            const locked = !knownSet.has(g.id);
            const isActive = selectedId === g.id;
            return (
              <li key={g.id}>
                <button
                  type="button"
                  className={[
                    styles.glyphItem,
                    isActive ? styles.glyphItemActive : '',
                    locked ? styles.glyphItemLocked : '',
                  ].join(' ')}
                  onClick={() => !locked && setSelectedId(g.id)}
                  disabled={locked}
                  aria-label={locked ? `${g.modern}（未解锁）` : g.modern}
                >
                  <span className={styles.glyphItemSvg}>
                    <GlyphImage glyph={g} />
                  </span>
                  <span className={styles.glyphItemLabel}>
                    {locked ? '？' : g.modern}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className={styles.codexDetail}>
          {active ? (
            <article>
              <div className={styles.glyphBig}>
                <GlyphImage glyph={active} alt={`${active.modern} 甲骨字形`} />
              </div>
              <p className={styles.shapeHint}>
                <strong>{active.modern}</strong> · {active.gloss}
              </p>
              <p className={styles.lore}>{active.shapeHint}</p>
              <p className={styles.lore}>{active.lore}</p>
              <div className={styles.evolutionRow}>
                <div className={styles.evolutionCell}>
                  <span className={styles.evolutionLabel}>甲骨文</span>
                  <GlyphImage glyph={active} alt="甲骨文" />
                </div>
                <div className={styles.evolutionCell}>
                  <span className={styles.evolutionLabel}>金文</span>
                  {active.evolution?.jinwen ? <img src={active.evolution.jinwen} alt="金文" className={styles.evolutionImg} /> : <span className={styles.evolutionMissing}>—</span>}
                </div>
                <div className={styles.evolutionCell}>
                  <span className={styles.evolutionLabel}>小篆</span>
                  {active.evolution?.xiaozhuan ? <img src={active.evolution.xiaozhuan} alt="小篆" className={styles.evolutionImg} /> : <span className={styles.evolutionMissing}>—</span>}
                </div>
                <div className={styles.evolutionCell}>
                  <span className={styles.evolutionLabel}>楷书</span>
                  <span className={styles.evolutionKaishu}>{active.evolution?.kaishu ?? active.modern}</span>
                </div>
              </div>
              <p className={styles.sourceNote}>
                来源：{SOURCES_NOTE}
              </p>
            </article>
          ) : (
            <p className={styles.lead}></p>
          )}
        </div>
      </div>

      <style jsx>{`
        .${styles.codexBody} {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(280px, 1fr);
          gap: 1.5rem;
          align-items: start;
        }
        @media (max-width: 640px) {
          .${styles.codexBody} {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
