'use client';

import type { OracleGlyph } from '../core/types';
import styles from '../JiaguGame.module.css';

export function GlyphImage({ glyph, alt }: { glyph: OracleGlyph; alt?: string }) {
  if (glyph.image) {
    return (
      <img
        src={glyph.image}
        alt={alt ?? `${glyph.modern} 甲骨字形`}
        className={styles.glyphImg}
        loading="lazy"
        decoding="async"
      />
    );
  }
  if (!glyph.svgPath || !glyph.viewBox) return null;
  return (
    <svg viewBox={glyph.viewBox} className={styles.glyphSvg} role="img" aria-hidden>
      <path
        d={glyph.svgPath}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
