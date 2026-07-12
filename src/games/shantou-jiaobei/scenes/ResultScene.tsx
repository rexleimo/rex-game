'use client';

import { useEffect, useState } from 'react';
import type { CupResult, GameState } from '../JiaobeiGame';
import { CupResultGlyph } from '../components/CupResultGlyph';

/** 三掷汇总判定 → 整体结论 */
function verdict(throws: CupResult[]): { key: string; tone: string } {
  const sheng = throws.filter((t) => t === 'sheng').length;
  const xiao = throws.filter((t) => t === 'xiao').length;
  if (sheng === 3) return { key: 'all-sheng', tone: 'sheng' };
  if (xiao === 3) return { key: 'all-xiao', tone: 'xiao' };
  if (sheng >= 2) return { key: 'mostly-sheng', tone: 'sheng' };
  if (throws.filter((t) => t === 'yin').length >= 2) return { key: 'mostly-yin', tone: 'yin' };
  return { key: 'mixed', tone: 'xiao' };
}

const TEXT: Record<string, (wish: string) => string> = {
  'all-sheng': (wish) =>
    wish ? `三圣齐鸣。所问之事，可趁势而行。关于「${wish}」，请仍以自己的判断为准。`
      : '三圣齐鸣。所问之事，可趁势而行。',
  'mostly-sheng': (wish) =>
    wish ? `两圣相应。方向已现，仍需亲自走稳。关于「${wish}」，不妨一步一步来。`
      : '两圣相应。方向已现，仍需亲自走稳。',
  'all-xiao': (wish) =>
    wish ? `三笑未明。将问题放回心里，再择时相问。关于「${wish}」，先让念头沉一沉。`
      : '三笑未明。将问题放回心里，再择时相问。',
  'mostly-yin': (wish) =>
    wish ? `阴意偏重。此刻不必强求，静待合适时机。关于「${wish}」，先把脚步放慢。`
      : '阴意偏重。此刻不必强求，静待合适时机。',
  mixed: (wish) =>
    wish ? `杯象未齐。答案仍在路上，过些时候再问。关于「${wish}」，先照顾好眼前的事。`
      : '杯象未齐。答案仍在路上，过些时候再问。',
};

const TONE_COLOR: Record<string, string> = {
  sheng: 'var(--c-sheng)',
  xiao: 'var(--c-xiao)',
  yin: 'var(--c-yin)',
};

const RESULT_LABEL: Record<CupResult, string> = { sheng: '圣杯', xiao: '笑杯', yin: '阴杯' };
const RESULT_TITLE: Record<string, string> = {
  'all-sheng': '三圣齐鸣',
  'mostly-sheng': '两圣相应',
  'all-xiao': '三笑未明',
  'mostly-yin': '阴意偏重',
  mixed: '杯象未齐',
};

export function ResultScene({ state, onRestart }: { state: GameState; onRestart: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const v = verdict(state.throws);
  const msg = TEXT[v.key](state.wish);
  const revealCup = state.throws.at(-1) ?? 'xiao';

  useEffect(() => {
    const timer = window.setTimeout(() => setExpanded(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className={`result result--${expanded ? 'expanded' : 'revealing'} rise`}>
      <div className="result__reveal" style={{ '--tone': TONE_COLOR[v.tone] } as React.CSSProperties}>
        <p className="result__eyebrow">三掷已定</p>
        <CupResultGlyph result={revealCup} size={142} />
        <h2 className="result__title">{RESULT_TITLE[v.key]}</h2>
        <p className="result__prompt">末掷为{RESULT_LABEL[revealCup]}，且听这一问的回音。</p>
        {!expanded ? (
          <button className="result__revealbutton" onClick={() => setExpanded(true)}>
            展开解读
          </button>
        ) : null}
      </div>

      {expanded ? (
        <div className="result__detail">
          <div className="result__cups" aria-label="三次掷杯结果">
            {state.throws.map((t, i) => (
              <div key={i} className="result__cup" style={{ '--tone': TONE_COLOR[t] } as React.CSSProperties}>
                <CupResultGlyph result={t} size={52} />
                <span>第 {i + 1} 掷</span>
                <strong>{RESULT_LABEL[t]}</strong>
              </div>
            ))}
          </div>

          <div className="result__interpretation" style={{ '--tone': TONE_COLOR[v.tone] } as React.CSSProperties}>
            <span className="result__seal" aria-hidden>问</span>
            <p>{msg}</p>
            {state.wish ? <p className="result__wish">所愿：{state.wish}</p> : null}
          </div>

          <p className="result__disclaimer">仅供娱乐，不构成任何建议。</p>
          <div className="result__actions">
            <button className="btn" onClick={onRestart}>再问一次</button>
            <a className="btn btn--ghost" href="/">回到展厅</a>
          </div>
        </div>
      ) : null}
    </section>
  );
}
