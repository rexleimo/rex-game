// 幕场景 SVG:场景大图上线前的默认视觉;四幕各一组几何意象(暗场金红)
export function SceneArt({ art }: { art: 'newyear' | 'wedding' | 'silk' | 'reunion' }) {
  if (art === 'newyear') {
    return (
      <svg className="th-scene-art" viewBox="0 0 800 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <radialGradient id="sa-warm" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#F2C879" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#F2C879" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="800" height="240" fill="#120B07" />
        <rect width="800" height="240" fill="url(#sa-warm)" />
        <rect x="330" y="40" width="140" height="110" fill="#C98A3D" stroke="#33200F" strokeWidth="8" />
        <line x1="400" y1="40" x2="400" y2="150" stroke="#33200F" strokeWidth="6" />
        <line x1="330" y1="95" x2="470" y2="95" stroke="#33200F" strokeWidth="6" />
        <rect x="376" y="71" width="48" height="48" fill="#C82E21" transform="rotate(45 400 95)" />
        <g fill="#FFF8EC" opacity="0.7">
          <circle cx="120" cy="60" r="2.5" />
          <circle cx="220" cy="120" r="2" />
          <circle cx="620" cy="80" r="2.5" />
          <circle cx="700" cy="150" r="2" />
          <circle cx="80" cy="160" r="1.8" />
          <circle cx="540" cy="40" r="1.8" />
        </g>
      </svg>
    );
  }
  if (art === 'wedding') {
    return (
      <svg className="th-scene-art" viewBox="0 0 800 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <radialGradient id="sa-candle" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#E8452F" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#E8452F" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="800" height="240" fill="#140B07" />
        <rect width="800" height="240" fill="url(#sa-candle)" />
        <g stroke="#C9A24B" strokeWidth="3" fill="none">
          <path d="M360 150 v-40 M440 150 v-40" />
          <path d="M350 150 h20 M430 150 h20" />
        </g>
        <ellipse cx="360" cy="100" rx="8" ry="14" fill="#F2C879" opacity="0.9" />
        <ellipse cx="440" cy="100" rx="8" ry="14" fill="#F2C879" opacity="0.9" />
        <rect x="356" y="70" width="88" height="88" fill="#C82E21" transform="rotate(45 400 114)" />
        <text x="400" y="126" textAnchor="middle" fontSize="40" fill="#F5D9A0" fontFamily="serif" fontWeight="700">
          囍
        </text>
      </svg>
    );
  }
  if (art === 'silk') {
    return (
      <svg className="th-scene-art" viewBox="0 0 800 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <radialGradient id="sa-lamp" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#E8CF9A" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#E8CF9A" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="800" height="240" fill="#100B07" />
        <rect width="800" height="240" fill="url(#sa-lamp)" />
        <ellipse cx="400" cy="70" rx="46" ry="56" fill="#C82E21" />
        <ellipse cx="400" cy="70" rx="46" ry="56" fill="none" stroke="#E8CF9A" strokeWidth="2" />
        <line x1="400" y1="14" x2="400" y2="126" stroke="#E8CF9A" strokeWidth="2" opacity="0.6" />
        <line x1="354" y1="70" x2="446" y2="70" stroke="#E8CF9A" strokeWidth="2" opacity="0.6" />
        <path d="M388 130 h24 l-4 18 h-16 z" fill="#C9A24B" />
        <g stroke="#8A6B2F" strokeWidth="3" fill="none" opacity="0.8">
          <path d="M120 200 q30 -24 60 0 q30 24 60 0" />
          <path d="M560 200 q30 -24 60 0 q30 24 60 0" />
        </g>
      </svg>
    );
  }
  return (
    <svg className="th-scene-art" viewBox="0 0 800 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="sa-home" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#F2C879" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#F2C879" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="240" fill="#120B07" />
      <rect width="800" height="240" fill="url(#sa-home)" />
      <circle cx="400" cy="150" r="60" fill="none" stroke="#C9A24B" strokeWidth="3" />
      <circle cx="400" cy="150" r="60" fill="#C82E21" opacity="0.18" />
      <g fill="#E8CF9A">
        <circle cx="400" cy="110" r="8" />
        <circle cx="370" cy="150" r="8" />
        <circle cx="430" cy="150" r="8" />
        <circle cx="400" cy="186" r="8" />
      </g>
      <path d="M120 60 q40 -20 80 0 M600 60 q40 -20 80 0" stroke="#8A6B2F" strokeWidth="3" fill="none" opacity="0.7" />
    </svg>
  );
}
