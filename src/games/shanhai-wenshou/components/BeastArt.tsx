'use client';

import type { BeastArtSpec } from '../core/types';

/**
 * 兽形剪影 —— 程序化 SVG，无外部资源。
 *
 * 美术方向：墨色剪影 + 兽色晕染 + 金线标记（九尾、三首等），与站点
 * Altar Dark 语言一致。所有 path 手绘坐标，viewBox 200×200。
 */

/** 兽形剪影 path（SVG viewBox 200×200）——图鉴与 Phaser 剪纸贴图共用。 */
export const SILHOUETTES: Record<BeastArtSpec['silhouette'], { body: string; head?: string; extra?: string }> = {
  ape: {
    body: 'M70 170 Q52 150 58 118 Q60 96 78 88 Q70 62 92 52 Q118 40 138 56 Q154 68 150 92 Q168 100 164 124 Q160 152 138 170 Z',
    head: 'M96 58 Q92 40 108 36 Q124 32 130 48 Q134 62 120 68 Q104 72 96 58 Z',
  },
  horse: {
    body: 'M40 150 Q36 118 62 104 Q96 88 132 96 Q162 102 166 126 Q168 146 148 152 L150 172 L136 172 L132 154 L96 156 L94 172 L80 172 L78 152 Q44 158 40 150 Z',
    head: 'M130 96 Q136 72 156 70 Q172 70 170 86 Q168 98 152 102 Z',
  },
  turtle: {
    body: 'M52 140 Q44 108 78 92 Q116 76 148 96 Q168 110 158 134 Q150 152 118 156 Q80 160 52 140 Z M66 138 L58 156 M148 138 L158 154',
    head: 'M150 96 Q162 74 176 80 Q184 86 176 98 Q168 106 154 104 Z',
  },
  fish: {
    body: 'M40 104 Q76 72 120 80 Q158 86 164 108 Q158 130 120 138 Q76 144 40 112 Z',
    head: 'M156 84 Q180 78 184 96 Q182 118 162 112 Z',
    extra: 'M118 80 L108 56 M132 82 L128 58 M96 86 L80 66',
  },
  cat: {
    body: 'M66 170 Q50 148 60 120 Q66 98 90 92 Q86 70 104 62 Q124 54 132 72 Q140 64 148 74 Q154 84 144 94 Q162 104 158 130 Q152 156 130 170 Z',
    head: 'M100 70 Q98 52 112 48 Q126 46 130 60 Q132 74 118 78 Q104 80 100 70 Z',
    extra: 'M112 46 L108 32 M124 46 L128 32',
  },
  ram: {
    body: 'M56 160 Q40 136 56 112 Q74 92 108 94 Q142 96 150 118 Q156 140 138 156 L142 172 L128 172 L124 158 L92 160 L90 172 L76 172 L76 158 Q60 166 56 160 Z',
    head: 'M108 94 Q104 68 124 62 Q144 58 146 76 Q146 92 128 96 Z',
  },
  bird: {
    body: 'M96 160 Q78 140 88 112 Q94 92 116 88 Q136 84 146 100 Q158 116 148 138 Q140 156 118 162 Z M118 88 L112 60 M132 88 L136 62 M108 92 L96 68',
    head: 'M112 60 Q108 42 124 40 Q140 40 140 54 Q138 66 124 66 Z',
  },
  serpent: {
    body: 'M48 164 Q40 138 64 130 Q92 122 96 100 Q100 78 124 76 Q148 74 152 92 Q156 112 132 116 Q110 120 112 138 Q114 158 140 164 Q150 166 156 158',
    head: 'M148 74 Q158 56 174 62 Q184 68 176 80 Q166 88 152 84 Z',
  },
  fox: {
    body: 'M70 166 Q52 146 60 118 Q68 94 94 90 Q90 66 108 58 Q126 52 132 70 Q136 64 142 72 Q148 82 140 92 Q158 102 152 128 Q146 154 124 166 Z',
    head: 'M102 64 Q98 46 114 42 Q130 40 134 56 Q136 70 122 74 Q106 76 102 64 Z',
  },
  humanface: {
    body: 'M64 166 Q48 142 58 116 Q66 94 92 90 Q92 72 110 66 Q130 60 136 78 Q140 94 124 102 Q148 110 150 134 Q150 154 132 166 Z',
    head: 'M100 74 Q100 54 116 52 Q132 52 132 68 Q130 82 114 82 Q100 82 100 74 Z',
  },
};

export function BeastArt({
  spec,
  size = 160,
  dim = false,
  title,
}: {
  spec: BeastArtSpec;
  size?: number;
  dim?: boolean;
  title?: string;
}) {
  const silhouette = SILHOUETTES[spec.silhouette];
  const marks = spec.marks ?? 0;
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label={title ?? '异兽剪影'}
      style={{ opacity: dim ? 0.35 : 1 }}
    >
      <defs>
        <radialGradient id={`glow-${spec.silhouette}-${spec.tint.slice(1)}`} cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor={spec.tint} stopOpacity="0.55" />
          <stop offset="100%" stopColor={spec.tint} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="96" r="72" fill={`url(#glow-${spec.silhouette}-${spec.tint.slice(1)})`} />
      {/* 九尾 / 多首等标记 */}
      {Array.from({ length: marks }).map((_, i) => {
        const angle = -70 + (140 / Math.max(1, marks - 1 || 1)) * i;
        const rad = (angle * Math.PI) / 180;
        const x1 = 100 + Math.cos(rad) * 34;
        const y1 = 96 + Math.sin(rad) * 34;
        const x2 = 100 + Math.cos(rad) * 58;
        const y2 = 96 + Math.sin(rad) * 58;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#e4c479"
            strokeWidth={2.4}
            strokeLinecap="round"
            opacity={0.85}
          />
        );
      })}
      <g>
        <path d={silhouette.body} fill={spec.tint} stroke="rgba(244,236,216,0.5)" strokeWidth={2} />
        {silhouette.head && <path d={silhouette.head} fill={spec.tint} stroke="rgba(244,236,216,0.5)" strokeWidth={2} />}
        {silhouette.extra && (
          <path d={silhouette.extra} fill="none" stroke={spec.tint} strokeWidth={3} strokeLinecap="round" />
        )}
      </g>
      {/* 底座印章 */}
      <rect x="62" y="176" width="76" height="10" rx="2" fill="rgba(201,162,75,0.28)" />
    </svg>
  );
}
