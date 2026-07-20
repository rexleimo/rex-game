import { Breadcrumb } from './Breadcrumb';
import type { CulturePage } from '@/content/culture/types';

const SYMBOL_LABEL = { jiaobei: '筊杯金月', yingge: '英歌双槌', jianzhi: '剪纸红菱' } as const;

function HeroSymbol({ symbol }: { symbol?: CulturePage['symbol'] }) {
  if (symbol === 'yingge') {
    return (
      <svg viewBox="0 0 80 56" role="img" aria-label={SYMBOL_LABEL.yingge}>
        <rect x="8" y="4" width="7" height="46" rx="3.5" fill="#E8CF9A" transform="rotate(18 11 27)" />
        <rect x="65" y="4" width="7" height="46" rx="3.5" fill="#E8CF9A" transform="rotate(-18 68 27)" />
        <circle cx="40" cy="34" r="16" fill="none" stroke="#C82E21" strokeWidth="4" />
        <circle cx="40" cy="34" r="5" fill="#C9A24B" />
      </svg>
    );
  }
  if (symbol === 'jianzhi') {
    return (
      <svg viewBox="0 0 64 64" role="img" aria-label={SYMBOL_LABEL.jianzhi}>
        <polygon points="32,2 62,32 32,62 2,32" fill="#C82E21" />
        <polygon points="32,14 50,32 32,50 14,32" fill="#0A0705" />
        <polygon points="32,22 42,32 32,42 22,32" fill="#D23627" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 70 46" role="img" aria-label={SYMBOL_LABEL.jiaobei}>
      <path d="M14 4 a26 26 0 0 0 0 38 a20 20 0 0 1 0 -38z" fill="#C9A24B" />
      <path d="M56 4 a26 26 0 0 1 0 38 a20 20 0 0 0 0 -38z" fill="#C9A24B" opacity="0.85" />
    </svg>
  );
}

export function CultureHero({
  page,
  crumbs,
}: {
  page: CulturePage;
  crumbs: { name: string; path: string }[];
}) {
  return (
    <header className="chero">
      <div className="g-container chero__inner">
        <div className="chero__crumb">
          <Breadcrumb items={crumbs} />
        </div>
        <h1 className="g-display chero__title">{page.h1}</h1>
        <p className="chero__meta">
          {page.readingMinutes ? `阅读 ${page.readingMinutes} 分钟 · ` : ''}
          {page.dateModified} 修订 · 常见说法整理
        </p>
        <div className="chero__symbol" aria-hidden="true">
          <HeroSymbol symbol={page.symbol} />
        </div>
      </div>
    </header>
  );
}
