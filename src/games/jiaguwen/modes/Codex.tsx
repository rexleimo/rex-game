'use client';

import { useMemo, useState } from 'react';
import { CURRICULUM_GLYPH_COUNT, GLYPHS, getGlyph, SOURCES_NOTE } from '../content/glyphs';
import {
  ORACLE_CATALOG_FORMS,
  ORACLE_CATALOG_FORM_COUNT,
  ORACLE_CATALOG_HEAD_COUNT,
  ORACLE_SOURCES,
} from '../content/oracleCatalog';
import { REFERENCE_HEADWORD_BY_FORM_ID } from '../content/oracleCorpus';
import { GlyphImage } from '../components/GlyphImage';
import styles from '../JiaguGame.module.css';

const PAGE_SIZE = 36;

type Scope = 'reference' | 'curriculum' | 'known';

type Selected =
  | { kind: 'curriculum'; id: string }
  | { kind: 'reference'; id: string }
  | null;

export interface CodexProps {
  knownIds: string[];
  onRead: (id: string) => void;
  onBack: () => void;
}

function matchesQuery(value: string, query: string) {
  return value.includes(query.trim());
}

export function Codex({ knownIds, onRead, onBack }: CodexProps) {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<Scope>('reference');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Selected>(() => {
    const firstForm = ORACLE_CATALOG_FORMS[0];
    return firstForm ? { kind: 'reference', id: firstForm.id } : null;
  });
  const knownSet = useMemo(() => new Set(knownIds), [knownIds]);

  const filtered = useMemo(() => {
    const teaching = GLYPHS.filter((glyph) => matchesQuery(`${glyph.modern}${glyph.gloss}${glyph.tags.join('')}`, query));
    if (scope === 'curriculum') return teaching.map((glyph) => ({ kind: 'curriculum' as const, glyph }));
    if (scope === 'known') {
      return teaching
        .filter((glyph) => knownSet.has(glyph.id))
        .map((glyph) => ({ kind: 'curriculum' as const, glyph }));
    }
    const references = ORACLE_CATALOG_FORMS
      .filter((form) => matchesQuery(form.modern, query))
      .map((form) => ({ kind: 'reference' as const, form }));
    if (scope === 'reference') return references;
    return teaching.map((glyph) => ({ kind: 'curriculum' as const, glyph }));
  }, [knownSet, query, scope]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);
  const activeTeaching = selected?.kind === 'curriculum' ? getGlyph(selected.id) : undefined;
  const activeReference =
    selected?.kind === 'reference' ? ORACLE_CATALOG_FORMS.find((form) => form.id === selected.id) : undefined;
  const activeReferenceHeadword = activeReference ? REFERENCE_HEADWORD_BY_FORM_ID.get(activeReference.id) : undefined;
  const activeSource = activeReference
    ? ORACLE_SOURCES.find((source) => source.id === activeReference.sourceId)
    : ORACLE_SOURCES.find((source) => source.id === 'curriculum');

  const selectTeaching = (id: string) => {
    setSelected({ kind: 'curriculum', id });
    if (!knownSet.has(id)) onRead(id);
  };

  return (
    <div className={styles.codex}>
      <div className={styles.modeHead}>
        <button type="button" className={styles.ghostBtn} onClick={onBack}>
          返回
        </button>
        <div>
          <p className={styles.eyebrow}>甲骨文字库</p>
          <h2>{ORACLE_CATALOG_FORM_COUNT.toLocaleString()} 个公开甲骨字形样本</h2>
          <p className={styles.lead}>
            可浏览 {ORACLE_CATALOG_HEAD_COUNT.toLocaleString()} 个上游释读字头的异体；{CURRICULUM_GLYPH_COUNT} 个经过编写的课程字另列为教学精选。
          </p>
        </div>
      </div>

      <div className={styles.codexControls}>
        <label className={styles.codexSearch}>
          <span>检索公开字形的上游释读字头</span>
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(0);
            }}
            placeholder="例如：日、雨、王"
          />
        </label>
        <div className={styles.codexScopes} aria-label="字库范围">
          {([
            ['reference', `公开字形 ${ORACLE_CATALOG_FORM_COUNT.toLocaleString()}`],
            ['curriculum', `教学精选 ${CURRICULUM_GLYPH_COUNT}`],
            ['known', '已识字'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={scope === value ? styles.codexScopeActive : styles.codexScope}
              onClick={() => {
                setScope(value);
                setPage(0);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.codexSummary}>
        <span>当前 {filtered.length.toLocaleString()} 条</span>
        <span>第 {safePage + 1}/{pageCount} 页</span>
        <div className={styles.codexPager}>
          <button type="button" className={styles.ghostBtn} onClick={() => setPage((value) => Math.max(0, value - 1))} disabled={safePage === 0}>
            上一页
          </button>
          <button type="button" className={styles.ghostBtn} onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))} disabled={safePage >= pageCount - 1}>
            下一页
          </button>
        </div>
      </div>

      <div className={styles.codexBody}>
        <ul className={styles.glyphList}>
          {visible.map((entry) => {
            const id = entry.kind === 'curriculum' ? entry.glyph.id : entry.form.id;
            const isActive = selected?.id === id;
            const label = entry.kind === 'curriculum' ? entry.glyph.modern : entry.form.modern;
            return (
              <li key={id}>
                <button
                  type="button"
                  className={`${styles.glyphItem} ${isActive ? styles.glyphItemActive : ''}`}
                  onClick={() => (entry.kind === 'curriculum' ? selectTeaching(entry.glyph.id) : setSelected({ kind: 'reference', id: entry.form.id }))}
                  aria-label={label}
                >
                  <span className={styles.glyphItemSvg}>
                    {entry.kind === 'curriculum' ? <GlyphImage glyph={entry.glyph} alt={label} /> : <img src={entry.form.image} alt="" />}
                  </span>
                  <span className={styles.glyphItemLabel}>{label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className={styles.codexDetail}>
          {activeTeaching ? (
            <article>
              <div className={styles.glyphBig}>
                <GlyphImage glyph={activeTeaching} alt={`${activeTeaching.modern} 甲骨字形`} />
              </div>
              <p className={styles.shapeHint}>
                <strong>{activeTeaching.modern}</strong> · {activeTeaching.gloss}
              </p>
              <p className={styles.lore}>{activeTeaching.shapeHint}</p>
              <p className={styles.lore}>{activeTeaching.lore}</p>
              <p className={styles.sourceNote}>课程说明：{SOURCES_NOTE}</p>
            </article>
          ) : activeReference && activeSource ? (
            <article>
              <div className={styles.glyphBig}>
                <img src={activeReference.image} alt={`${activeReference.modern} 的公开甲骨字形样本`} />
              </div>
              <p className={styles.shapeHint}>
                <strong>{activeReference.modern}</strong> · 上游释读字头
              </p>
              <p className={styles.lore}>
                这是公开参考字形样本。它可用于比较形体，但不代表本站对字义、断代、字例或异体归并作出学术定论。
                {activeReferenceHeadword && ` 当前索引为同一上游字头保留了 ${activeReferenceHeadword.formIds.length} 个字形样本。`}
              </p>
              <p className={styles.sourceNote}>
                来源：<a href={activeSource.url} target="_blank" rel="noreferrer">{activeSource.name}</a>（{activeSource.license}）。{activeSource.note}
              </p>
            </article>
          ) : (
            <div className={styles.codexEmpty}>
              <p>先检索或点选一个字形。</p>
              <p>公开字形索引用于扩展浏览；只有经过教学编写的字才会进入玩法题库。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
