import type { CupResult } from '../JiaobeiGame';

type CupHalfProps = {
  rounded: boolean;
  transform: string;
};

function CupHalf({ rounded, transform }: CupHalfProps) {
  if (rounded) {
    return (
      <g transform={transform}>
        <path d="M5 42C8 20 30 5 49 38L43 49C29 36 13 38 5 49Z" fill="var(--c-primary)" />
        <path d="M43 49C31 37 16 37 5 49L8 54C21 48 34 48 43 54Z" fill="#71241e" />
        <path d="M13 36C20 20 31 16 40 29" fill="none" stroke="#e19a88" strokeLinecap="round" strokeWidth="2" opacity="0.72" />
      </g>
    );
  }

  return (
    <g transform={transform}>
      <path d="M5 44C8 19 31 6 49 44L43 51C31 45 17 45 5 51Z" fill="#b98f5d" />
      <path d="M5 51C18 45 31 45 43 51L40 55C28 51 16 51 7 55Z" fill="#6c432f" />
      <path d="M12 38C20 24 31 20 40 37" fill="none" stroke="#e2bd88" strokeLinecap="round" strokeWidth="1.8" opacity="0.72" />
    </g>
  );
}

/** A compact half-moon cup pair that matches the actual Babylon geometry. */
export function CupResultGlyph({ result, size = 64 }: { result: CupResult; size?: number }) {
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
      height={size * 0.56}
      viewBox="0 0 120 64"
      fill="none"
      aria-hidden="true"
    >
      <CupHalf rounded={leftRounded} transform="translate(4 4) rotate(-12 28 32)" />
      <CupHalf rounded={rightRounded} transform="translate(63 3) rotate(13 28 32)" />
    </svg>
  );
}
