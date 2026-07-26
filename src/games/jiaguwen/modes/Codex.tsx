'use client';

import { useMemo, useState } from 'react';
import { GLYPHS, GLYPH_BY_ID } from '../content/glyphs';
import type { JiaguProgress } from '../core/types';
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

  const active = selectedId ? GLYPH_BY_ID[selectedId] : null;
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
          <h2>{active ? active.modern : '24 字甲骨图鉴'}</h2>
          <p className={styles.lead}>
            {active ? '点选左侧可切换其他字。' : '点击任意字查看释义、造字思路与来源说明。'}
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
                    <svg viewBox={g.viewBox} role="img" aria-hidden="true">
                      <path
                        d={g.svgPath}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
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
                <svg viewBox={active.viewBox} role="img" aria-label={active.modern}>
                  <path
                    d={active.svgPath}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className={styles.shapeHint}>
                <strong>{active.modern}</strong> · {active.gloss}
              </p>
              <p className={styles.lore}>{active.shapeHint}</p>
              <p className={styles.lore}>{active.lore}</p>
              <p className={styles.sourceNote}>
                来源：{active.sourcesNote}
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
