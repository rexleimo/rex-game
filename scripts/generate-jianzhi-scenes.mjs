// 剧场场景图 + 纸纹理:SVG → sharp → webp(AI 生成不可用时的确定性回落)
// 产出:public/assets/jianzhi/scenes/scene-{newyear,wedding,silk,reunion}.webp + paper-red.webp
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const W = 1600;
const H = 460;

function frame(inner) {
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}

const glow = (cx, color, op) => `
  <defs><radialGradient id="g" cx="${cx}" cy="32%" r="75%">
    <stop offset="0%" stop-color="${color}" stop-opacity="${op}"/>
    <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
  </radialGradient></defs>
  <rect width="${W}" height="${H}" fill="#0A0705"/>
  <rect width="${W}" height="${H}" fill="url(#g)"/>`;

const SCENES = {
  'scene-newyear': frame(`${glow('50%', '#F2C879', 0.32)}
    <rect x="660" y="80" width="280" height="220" fill="#C98A3D" stroke="#33200F" stroke-width="14"/>
    <line x1="800" y1="80" x2="800" y2="300" stroke="#33200F" stroke-width="10"/>
    <line x1="660" y1="190" x2="940" y2="190" stroke="#33200F" stroke-width="10"/>
    <rect x="752" y="142" width="96" height="96" fill="#C82E21" transform="rotate(45 800 190)"/>
    <rect x="776" y="166" width="48" height="48" fill="#0A0705" transform="rotate(45 800 190)"/>
    <g fill="#FFF8EC" opacity="0.75">
      <circle cx="240" cy="120" r="5"/><circle cx="440" cy="240" r="4"/><circle cx="1240" cy="160" r="5"/>
      <circle cx="1400" cy="300" r="4"/><circle cx="160" cy="320" r="3.6"/><circle cx="1080" cy="80" r="3.6"/>
      <circle cx="700" cy="380" r="3.4"/><circle cx="960" cy="400" r="3.2"/>
    </g>`),
  'scene-wedding': frame(`${glow('50%', '#E8452F', 0.38)}
    <g stroke="#C9A24B" stroke-width="5" fill="none">
      <path d="M720 300 v-80 M880 300 v-80"/>
      <path d="M700 300 h40 M860 300 h40"/>
    </g>
    <ellipse cx="720" cy="200" rx="16" ry="28" fill="#F2C879" opacity="0.92"/>
    <ellipse cx="880" cy="200" rx="16" ry="28" fill="#F2C879" opacity="0.92"/>
    <rect x="712" y="140" width="176" height="176" fill="#C82E21" transform="rotate(45 800 228)"/>
    <rect x="746" y="174" width="108" height="108" fill="#140B07" transform="rotate(45 800 228)"/>
    <rect x="770" y="198" width="60" height="60" fill="#D23627" transform="rotate(45 800 228)"/>`),
  'scene-silk': frame(`${glow('50%', '#E8CF9A', 0.28)}
    <ellipse cx="800" cy="140" rx="92" ry="112" fill="#C82E21"/>
    <ellipse cx="800" cy="140" rx="92" ry="112" fill="none" stroke="#E8CF9A" stroke-width="4"/>
    <line x1="800" y1="28" x2="800" y2="252" stroke="#E8CF9A" stroke-width="3" opacity="0.6"/>
    <line x1="708" y1="140" x2="892" y2="140" stroke="#E8CF9A" stroke-width="3" opacity="0.6"/>
    <path d="M776 260 h48 l-8 36 h-32 z" fill="#C9A24B"/>
    <g stroke="#8A6B2F" stroke-width="5" fill="none" opacity="0.85">
      <path d="M240 400 q60 -48 120 0 q60 48 120 0"/>
      <path d="M1120 400 q60 -48 120 0 q60 48 120 0"/>
    </g>
    <path d="M0 430 q400 -30 800 0 q400 30 800 0 v30 H0 z" fill="#0d0906"/>`),
  'scene-reunion': frame(`${glow('50%', '#F2C879', 0.3)}
    <line x1="800" y1="0" x2="800" y2="90" stroke="#8A6B2F" stroke-width="5"/>
    <path d="M730 90 h140 l-20 60 h-100 z" fill="#C82E21" stroke="#8A6B2F" stroke-width="4"/>
    <ellipse cx="800" cy="150" rx="70" ry="14" fill="#F2C879" opacity="0.5"/>
    <circle cx="800" cy="300" r="120" fill="none" stroke="#C9A24B" stroke-width="5"/>
    <circle cx="800" cy="300" r="120" fill="#C82E21" opacity="0.16"/>
    <g fill="#E8CF9A">
      <circle cx="800" cy="220" r="16"/><circle cx="740" cy="300" r="16"/>
      <circle cx="860" cy="300" r="16"/><circle cx="800" cy="372" r="16"/>
    </g>
    <path d="M240 120 q80 -40 160 0 M1200 120 q80 -40 160 0" stroke="#8A6B2F" stroke-width="5" fill="none" opacity="0.7"/>`),
};

// 洒金红纸纹理(红底 + 金点,平铺)
const PAPER = `<svg width="420" height="420" viewBox="0 0 420 420" xmlns="http://www.w3.org/2000/svg">
  <rect width="420" height="420" fill="#B0231B"/>
  <rect width="420" height="420" fill="url(#pg)" opacity="0.5"/>
  <defs>
    <linearGradient id="pg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#D23627" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#8A160E" stop-opacity="0.6"/>
    </linearGradient>
  </defs>
  <g fill="#E8CF9A">
    ${Array.from({ length: 60 }, (_, i) => {
      const x = (i * 137) % 420;
      const y = (i * 211) % 420;
      const r = 1 + ((i * 7) % 3) * 0.5;
      const o = 0.25 + ((i * 13) % 10) * 0.04;
      return `<circle cx="${x}" cy="${y}" r="${r.toFixed(1)}" opacity="${o.toFixed(2)}"/>`;
    }).join('\n    ')}
  </g>
</svg>`;

await mkdir('public/assets/jianzhi/scenes', { recursive: true });

for (const [name, svg] of Object.entries(SCENES)) {
  await sharp(Buffer.from(svg)).webp({ quality: 82 }).toFile(`public/assets/jianzhi/scenes/${name}.webp`);
  console.log(`${name}.webp`);
}
await sharp(Buffer.from(PAPER)).webp({ quality: 82 }).toFile('public/assets/jianzhi/paper-red.webp');
console.log('paper-red.webp');
console.log('jianzhi scene assets done');
