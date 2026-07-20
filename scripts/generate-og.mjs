// 参数化 OG 模板(1200×630,方向 C 暗场)
// 首页卡:pnpm og;文化页卡:pnpm og:culture(见 generate-culture-og.mjs)
// 生成后人工目检(CJK 字形依赖本机字体);产物提交入库。
import sharp from 'sharp';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const SYMBOLS = {
  home: `<g transform="translate(860,150)"><polygon points="120,0 240,120 120,240 0,120" fill="#C82E21"/><polygon points="120,48 192,120 120,192 48,120" fill="#0A0705"/><polygon points="120,82 158,120 120,158 82,120" fill="#D23627"/></g><path d="M884 486 a42 42 0 0 0 0 72 a32 32 0 0 1 0 -72z" fill="#C9A24B"/><path d="M952 486 a42 42 0 0 1 0 72 a32 32 0 0 0 0 -72z" fill="#C9A24B" opacity="0.85"/>`,
  jiaobei: `<path d="M900 220 a90 90 0 0 0 0 150 a68 68 0 0 1 0 -150z" fill="#C9A24B"/><path d="M1030 220 a90 90 0 0 1 0 150 a68 68 0 0 0 0 -150z" fill="#C9A24B" opacity="0.85"/>`,
  yingge: `<g transform="translate(880,150)"><rect x="30" y="0" width="16" height="200" rx="8" fill="#E8CF9A" transform="rotate(18 38 100)"/><rect x="170" y="0" width="16" height="200" rx="8" fill="#E8CF9A" transform="rotate(-18 178 100)"/><circle cx="120" cy="150" r="66" fill="none" stroke="#C82E21" stroke-width="14"/><circle cx="120" cy="150" r="20" fill="#C9A24B"/></g>`,
  jianzhi: `<g transform="translate(860,150)"><polygon points="120,0 240,120 120,240 0,120" fill="#C82E21"/><polygon points="120,48 192,120 120,192 48,120" fill="#0A0705"/><polygon points="120,82 158,120 120,158 82,120" fill="#D23627"/></g>`,
};

export function buildOgSvg({ title, subtitle, symbol = 'home' }) {
  const safeTitle = esc(title);
  const safeSubtitle = esc(subtitle);
  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="72%" cy="16%" r="85%">
      <stop offset="0%" stop-color="#C82E21" stop-opacity="0.38"/>
      <stop offset="55%" stop-color="#C82E21" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#0A0705"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <text x="80" y="150" font-family="serif" font-size="26" letter-spacing="10" fill="#C9A24B">rex-game · 可玩的民俗文化馆</text>
  <text x="80" y="330" font-family="serif" font-weight="700" font-size="76" fill="#F5EDE0">${safeTitle}</text>
  <text x="80" y="420" font-family="sans-serif" font-size="28" fill="#E8DCC4" opacity="0.72">${safeSubtitle}</text>
  ${SYMBOLS[symbol] ?? SYMBOLS.home}
  <text x="80" y="586" font-family="sans-serif" font-size="22" letter-spacing="6" fill="#C9A24B">REX-GAME · game.rexai.top</text>
</svg>`;
}

// 直接执行(pnpm og):渲首页 OG 卡
if (process.argv[1] && process.argv[1].endsWith('generate-og.mjs')) {
  const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="72%" cy="16%" r="85%">
      <stop offset="0%" stop-color="#C82E21" stop-opacity="0.38"/>
      <stop offset="55%" stop-color="#C82E21" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#0A0705"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <text x="80" y="140" font-family="serif" font-size="28" letter-spacing="12" fill="#C9A24B">可玩的民俗文化馆</text>
  <text x="80" y="290" font-family="serif" font-weight="700" font-size="96" fill="#F5EDE0">一座可以玩的</text>
  <text x="80" y="412" font-family="serif" font-weight="700" font-size="96" fill="#F5EDE0">中国<tspan fill="#E8452F">民艺馆</tspan></text>
  <text x="80" y="492" font-family="sans-serif" font-size="26" fill="#E8DCC4" opacity="0.72">掷筊问愿 · 英歌合槌 · 折剪生花 — 即开即玩</text>

  <g transform="translate(860,150)">
    <polygon points="120,0 240,120 120,240 0,120" fill="#C82E21"/>
    <polygon points="120,48 192,120 120,192 48,120" fill="#0A0705"/>
    <polygon points="120,82 158,120 120,158 82,120" fill="#D23627"/>
  </g>
  <path d="M884 486 a42 42 0 0 0 0 72 a32 32 0 0 1 0 -72z" fill="#C9A24B"/>
  <path d="M952 486 a42 42 0 0 1 0 72 a32 32 0 0 0 0 -72z" fill="#C9A24B" opacity="0.85"/>

  <text x="80" y="586" font-family="sans-serif" font-size="22" letter-spacing="6" fill="#C9A24B">REX-GAME · game.rexai.top</text>
</svg>`;

  await sharp(Buffer.from(svg)).png().toFile('public/assets/og-home.png');
  console.log('public/assets/og-home.png (1200x630) generated');
}
