// 首页 OG 分享卡 1200×630:暗场 + 主张 + 三符号(SVG → sharp → PNG)
// 生成后人工目检一次(CJK 字形依赖本机字体);产物提交入库,线上无需再生成。
import sharp from 'sharp';

const W = 1200;
const H = 630;

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="72%" cy="16%" r="85%">
      <stop offset="0%" stop-color="#C82E21" stop-opacity="0.38"/>
      <stop offset="55%" stop-color="#C82E21" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#0A0705"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

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
