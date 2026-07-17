import { useId } from 'react';
import type { CupResult } from '../JiaobeiGame';

type CupHalfProps = {
  rounded: boolean;
  transform: string;
  lacquerId: string;
  baseId: string;
};

function CupHalf({ rounded, transform, lacquerId, baseId }: CupHalfProps) {
  const fill = rounded ? `url(#${lacquerId})` : `url(#${baseId})`;
  return (
    <g transform={transform}>
      <path
        d="M2 29C14 10 43 7 62 14C52 16 44 18 37 21C22 22 10 26 2 29Z"
        fill={fill}
      />
      <path
        d="M2 29C11 26 23 22 37 21C45 18 53 16 62 14L57 19C48 21 40 24 33 27C19 27 9 30 4 33Z"
        fill={rounded ? '#4b0010' : '#351314'}
        opacity="0.92"
      />
      <path
        d="M10 25C20 14 39 11 53 14"
        fill="none"
        stroke={rounded ? '#ffb4ad' : '#bd7365'}
        strokeLinecap="round"
        strokeWidth="2.2"
        opacity={rounded ? 0.7 : 0.34}
      />
      <path
        d="M5 30C18 26 34 22 57 18"
        fill="none"
        stroke={rounded ? '#210006' : '#1d0c0b'}
        strokeLinecap="round"
        strokeWidth="1.4"
        opacity="0.55"
      />
    </g>
  );
}

/** A polished crescent pair matching the Babylon jiaobei silhouette. */
export function CupResultGlyph({ result, size = 64 }: { result: CupResult; size?: number }) {
  const id = useId().replace(/:/g, '');
  const lacquerId = `lacquer-${id}`;
  const baseId = `base-${id}`;
  const faces: Record<CupResult, [boolean, boolean]> = {
    sheng: [false, true],
    xiao: [false, false],
    yin: [true, true],
  };
  const [leftRounded, rightRounded] = faces[result];

  return (
    <svg
      className="cup-glyph"
      width={size}
      height={size * 0.46}
      viewBox="0 0 132 58"
      data-profile="curved-blade"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={lacquerId} x1="8" y1="12" x2="48" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff5962" />
          <stop offset="0.34" stopColor="#b30b25" />
          <stop offset="0.72" stopColor="#720016" />
          <stop offset="1" stopColor="#310008" />
        </linearGradient>
        <linearGradient id={baseId} x1="8" y1="12" x2="48" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9c4239" />
          <stop offset="0.5" stopColor="#5c211f" />
          <stop offset="1" stopColor="#281010" />
        </linearGradient>
      </defs>
      <CupHalf rounded={leftRounded} transform="translate(2 4) rotate(-8 30 26)" lacquerId={lacquerId} baseId={baseId} />
      <CupHalf rounded={rightRounded} transform="translate(70 4) rotate(9 30 26)" lacquerId={lacquerId} baseId={baseId} />
    </svg>
  );
}
