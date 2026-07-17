'use client';

import { useEffect, useState } from 'react';
import type { CupResult, GameState, WishCategory } from '../JiaobeiGame';
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

type VerdictKey = 'all-sheng' | 'mostly-sheng' | 'all-xiao' | 'mostly-yin' | 'mixed';

const DEFAULT_CATEGORY: WishCategory = '其他';

/** 解读文案：verdict × 心愿类别。 */
const TEXT: Record<VerdictKey, Record<WishCategory, (wish: string) => string>> = {
  'all-sheng': {
    感情: (wish) =>
      wish
        ? `三圣齐鸣。心意相通，若是关于「${wish}」，不妨把话说明白，给对方一个回应的机会。`
        : '三圣齐鸣。心意相通，把话说明白，关系自然更进一步。',
    事业: (wish) =>
      wish
        ? `三圣齐鸣。势头正好，关于「${wish}」，可趁势推进，但仍要脚踏实地。`
        : '三圣齐鸣。势头正好，可趁势推进，仍需脚踏实地。',
    学业: (wish) =>
      wish
        ? `三圣齐鸣。用功终有回响，关于「${wish}」，保持节奏，结果不会辜负你。`
        : '三圣齐鸣。用功终有回响，保持节奏，结果不会辜负你。',
    财运: (wish) =>
      wish
        ? `三圣齐鸣。财气渐顺，关于「${wish}」，可小步尝试，但别忘了风险。`
        : '三圣齐鸣。财气渐顺，可小步尝试，别忘了风险。',
    健康: (wish) =>
      wish
        ? `三圣齐鸣。身体正在恢复或保持稳定，关于「${wish}」，继续保持规律作息。`
        : '三圣齐鸣。身体正在恢复或保持稳定，继续保持规律作息。',
    其他: (wish) =>
      wish
        ? `三圣齐鸣。所问之事，可趁势而行。关于「${wish}」，请仍以自己的判断为准。`
        : '三圣齐鸣。所问之事，可趁势而行。',
  },
  'mostly-sheng': {
    感情: (wish) =>
      wish
        ? `两圣相应。方向已现，但别急着下结论。关于「${wish}」，给彼此多一点时间。`
        : '两圣相应。方向已现，但别急着下结论，给彼此多一点时间。',
    事业: (wish) =>
      wish
        ? `两圣相应。整体向好，但仍有变数。关于「${wish}」，一步一步来更稳。`
        : '两圣相应。整体向好，但仍有变数，一步一步来更稳。',
    学业: (wish) =>
      wish
        ? `两圣相应。努力已有回报，关于「${wish}」，继续保持，不要轻易放松。`
        : '两圣相应。努力已有回报，继续保持，不要轻易放松。',
    财运: (wish) =>
      wish
        ? `两圣相应。有机会，但不稳。关于「${wish}」，见好就收，留足余地。`
        : '两圣相应。有机会，但不稳，见好就收，留足余地。',
    健康: (wish) =>
      wish
        ? `两圣相应。趋势向好，关于「${wish}」，继续保持良好习惯，定期关注。`
        : '两圣相应。趋势向好，继续保持良好习惯，定期关注。',
    其他: (wish) =>
      wish
        ? `两圣相应。方向已现，仍需亲自走稳。关于「${wish}」，不妨一步一步来。`
        : '两圣相应。方向已现，仍需亲自走稳。',
  },
  'all-xiao': {
    感情: (wish) =>
      wish
        ? `三笑未明。问题还没说清楚，关于「${wish}」，先把念头沉淀，再择时相问。`
        : '三笑未明。问题还没说清楚，先把念头沉淀，再择时相问。',
    事业: (wish) =>
      wish
        ? `三笑未明。时机未到，关于「${wish}」，先观察形势，不要急于行动。`
        : '三笑未明。时机未到，先观察形势，不要急于行动。',
    学业: (wish) =>
      wish
        ? `三笑未明。方向尚不清晰，关于「${wish}」，先回归基础，再重新规划。`
        : '三笑未明。方向尚不清晰，先回归基础，再重新规划。',
    财运: (wish) =>
      wish
        ? `三笑未明。财路未开，关于「${wish}」，先守住本金，等待更明确信号。`
        : '三笑未明。财路未开，先守住本金，等待更明确信号。',
    健康: (wish) =>
      wish
        ? `三笑未明。状态还不够明朗，关于「${wish}」，建议多观察、多咨询，别大意。`
        : '三笑未明。状态还不够明朗，建议多观察、多咨询，别大意。',
    其他: (wish) =>
      wish
        ? `三笑未明。将问题放回心里，再择时相问。关于「${wish}」，先让念头沉一沉。`
        : '三笑未明。将问题放回心里，再择时相问。',
  },
  'mostly-yin': {
    感情: (wish) =>
      wish
        ? `阴意偏重。此刻不宜强求，关于「${wish}」，先把脚步放慢，给彼此空间。`
        : '阴意偏重。此刻不宜强求，先把脚步放慢，给彼此空间。',
    事业: (wish) =>
      wish
        ? `阴意偏重。阻力较大，关于「${wish}」，暂缓推进，先处理眼前更急的事。`
        : '阴意偏重。阻力较大，暂缓推进，先处理眼前更急的事。',
    学业: (wish) =>
      wish
        ? `阴意偏重。方法或时机不对，关于「${wish}」，调整策略后再出发。`
        : '阴意偏重。方法或时机不对，调整策略后再出发。',
    财运: (wish) =>
      wish
        ? `阴意偏重。求财不急一时，关于「${wish}」，先守后攻，避免冲动。`
        : '阴意偏重。求财不急一时，先守后攻，避免冲动。',
    健康: (wish) =>
      wish
        ? `阴意偏重。身体在提醒你要更谨慎，关于「${wish}」，建议尽快咨询专业意见。`
        : '阴意偏重。身体在提醒你要更谨慎，建议尽快咨询专业意见。',
    其他: (wish) =>
      wish
        ? `阴意偏重。此刻不必强求，静待合适时机。关于「${wish}」，先把脚步放慢。`
        : '阴意偏重。此刻不必强求，静待合适时机。',
  },
  mixed: {
    感情: (wish) =>
      wish
        ? `杯象未齐。答案还在路上，关于「${wish}」，先照顾好彼此日常，过段时间再问。`
        : '杯象未齐。答案还在路上，先照顾好彼此日常，过段时间再问。',
    事业: (wish) =>
      wish
        ? `杯象未齐。局势还在变化，关于「${wish}」，先把手头事做扎实。`
        : '杯象未齐。局势还在变化，先把手头事做扎实。',
    学业: (wish) =>
      wish
        ? `杯象未齐。结果尚不稳定，关于「${wish}」，坚持当前节奏，静待明朗。`
        : '杯象未齐。结果尚不稳定，坚持当前节奏，静待明朗。',
    财运: (wish) =>
      wish
        ? `杯象未齐。财象起伏，关于「${wish}」，先稳住基本盘，不追涨杀跌。`
        : '杯象未齐。财象起伏，先稳住基本盘，不追涨杀跌。',
    健康: (wish) =>
      wish
        ? `杯象未齐。身体信号混杂，关于「${wish}」，保持观察，必要时就医。`
        : '杯象未齐。身体信号混杂，保持观察，必要时就医。',
    其他: (wish) =>
      wish
        ? `杯象未齐。答案仍在路上，过些时候再问。关于「${wish}」，先照顾好眼前的事。`
        : '杯象未齐。答案仍在路上，过些时候再问。',
  },
};

const TONE_COLOR: Record<string, string> = {
  sheng: 'var(--c-sheng)',
  xiao: 'var(--c-xiao)',
  yin: 'var(--c-yin)',
};

const RESULT_LABEL: Record<CupResult, string> = { sheng: '圣杯', xiao: '笑杯', yin: '阴杯' };
const RESULT_TITLE: Record<VerdictKey, string> = {
  'all-sheng': '三圣齐鸣',
  'mostly-sheng': '两圣相应',
  'all-xiao': '三笑未明',
  'mostly-yin': '阴意偏重',
  mixed: '杯象未齐',
};

export function ResultScene({ state, onRestart }: { state: GameState; onRestart: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const v = verdict(state.throws);
  const category = state.wishCategory || DEFAULT_CATEGORY;
  const categoryText = TEXT[v.key as VerdictKey][category] || TEXT[v.key as VerdictKey][DEFAULT_CATEGORY];
  const msg = categoryText(state.wish);
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
        <h2 className="result__title foil-text">{RESULT_TITLE[v.key as VerdictKey]}</h2>
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

          <div
            className="result__interpretation"
            style={{ '--tone': TONE_COLOR[v.tone] } as React.CSSProperties}
          >
            <span className="result__seal" aria-hidden>问</span>
            <p>{msg}</p>
            {state.wish ? <p className="result__wish">所愿：{state.wish}</p> : null}
            {state.wishCategory && state.wishCategory !== DEFAULT_CATEGORY ? (
              <p className="result__category">问及：{state.wishCategory}</p>
            ) : null}
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
