/** 展区装饰纹样（纯 SVG，随 accent 染色） */

export function RegionMotif({
  regionId,
  accent = '#6B7F6A',
  className,
}: {
  regionId: string;
  accent?: string;
  className?: string;
}) {
  const gold = '#C4A35A';
  switch (regionId) {
    case 'R02':
      return (
        <svg className={className} viewBox="0 0 120 80" aria-hidden>
          <path
            d="M20 50 Q40 10 60 35 Q80 10 100 50 Q80 40 60 55 Q40 40 20 50Z"
            fill="none"
            stroke={accent}
            strokeWidth="2.2"
          />
          <circle cx="60" cy="38" r="4" fill={gold} />
        </svg>
      );
    case 'R03':
      return (
        <svg className={className} viewBox="0 0 120 80" aria-hidden>
          <rect x="38" y="18" width="44" height="48" rx="4" fill="none" stroke={accent} strokeWidth="2" />
          <rect x="48" y="8" width="6" height="28" fill={gold} />
          <rect x="66" y="8" width="6" height="28" fill={gold} />
        </svg>
      );
    case 'R04':
      return (
        <svg className={className} viewBox="0 0 120 80" aria-hidden>
          <ellipse cx="60" cy="42" rx="28" ry="22" fill="none" stroke={accent} strokeWidth="2" />
          <path d="M40 42 Q60 22 80 42 Q60 48 40 42Z" fill={gold} opacity="0.45" />
        </svg>
      );
    case 'R05':
      return (
        <svg className={className} viewBox="0 0 120 80" aria-hidden>
          <path d="M18 55 L40 30 L55 48 L78 22 L102 55Z" fill="none" stroke={accent} strokeWidth="2" />
          <circle cx="30" cy="58" r="3" fill={gold} />
          <circle cx="90" cy="58" r="3" fill={gold} />
        </svg>
      );
    case 'R06':
      return (
        <svg className={className} viewBox="0 0 120 80" aria-hidden>
          <path d="M60 12 L88 58 L32 58Z" fill="none" stroke={accent} strokeWidth="2" />
          <path d="M28 48 Q45 38 60 48 Q75 38 92 48" fill="none" stroke={gold} strokeWidth="1.6" />
        </svg>
      );
    case 'R07':
      return (
        <svg className={className} viewBox="0 0 120 80" aria-hidden>
          <rect x="48" y="14" width="24" height="52" rx="2" fill="none" stroke={accent} strokeWidth="2" />
          <circle cx="60" cy="30" r="5" fill={gold} />
          <circle cx="60" cy="48" r="5" fill={gold} opacity="0.7" />
        </svg>
      );
    case 'R08':
      return (
        <svg className={className} viewBox="0 0 120 80" aria-hidden>
          <path d="M20 58 Q60 70 100 58" fill="none" stroke={accent} strokeWidth="2" />
          <path d="M55 50 L55 18 L82 28 L55 36Z" fill="none" stroke={gold} strokeWidth="2" />
        </svg>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 120 80" aria-hidden>
          <path
            d="M40 58 L48 28 L60 48 L72 22 L80 58 Q60 48 40 58Z"
            fill="none"
            stroke={accent}
            strokeWidth="2.2"
          />
          <circle cx="60" cy="52" r="3" fill={gold} />
        </svg>
      );
  }
}
