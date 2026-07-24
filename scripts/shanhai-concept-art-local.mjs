/**
 * Local fallback art for remaining concept cards (no RexAI).
 * Produces refined SVG→WebP educational cards with region palettes + theme glyphs.
 *
 * Usage: node scripts/shanhai-concept-art-local.mjs
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outRoot = join(root, 'public/assets/shanhai/artifacts');
const artPath = join(root, 'src/games/shanhai-shiyi/content/artifactArt.ts');
const SIZE = 1024;

const REGION = {
  R01: { name: '中原', c1: '#3d4a3a', c2: '#c4a574', c3: '#6b7f6a', paper: '#f3ebe0' },
  R02: { name: '楚地', c1: '#4a1f1f', c2: '#c9a227', c3: '#8b2e2e', paper: '#f6efe6' },
  R03: { name: '巴蜀', c1: '#2a3338', c2: '#d4af37', c3: '#5c6b73', paper: '#efe8dc' },
  R04: { name: '江南', c1: '#2f4f4f', c2: '#7eb8b0', c3: '#5a8f7b', paper: '#f2f4ef' },
  R05: { name: '塞北', c1: '#3a3f2e', c2: '#b08968', c3: '#6d7a55', paper: '#efe9df' },
  R06: { name: '仙山', c1: '#3a2f4a', c2: '#c9b48a', c3: '#6b5b8a', paper: '#f0eaf4' },
  R07: { name: '岁时', c1: '#6b1f1f', c2: '#e0b04a', c3: '#a33b3b', paper: '#faf3e8' },
  R08: { name: '海丝', c1: '#1f3a4a', c2: '#7aa7c7', c3: '#3d6b8a', paper: '#eef3f6' },
};

function loadCards() {
  const dir = join(root, 'src/games/shanhai-shiyi/content');
  const files = readdirSync(dir).filter((f) => f.startsWith('artifacts') && f.endsWith('.ts'));
  const cards = [];
  for (const f of files) {
    const t = readFileSync(join(dir, f), 'utf8');
    for (const b of t.split(/\{\s*\n\s*id:/).slice(1)) {
      const id = b.match(/^\s*'([^']+)'/)?.[1];
      const name = b.match(/name:\s*'([^']+)'/)?.[1];
      const rarity = b.match(/rarity:\s*'([^']+)'/)?.[1];
      const one = b.match(/oneLiner:\s*'([^']+)'/)?.[1] || '';
      const types = b.match(/types:\s*\[([^\]]+)\]/)?.[1] || '';
      const region = b.match(/region:\s*'([^']+)'/)?.[1] || 'R01';
      if (id && name) cards.push({ id, name, rarity, one, types, region });
    }
  }
  return cards;
}

/** Central glyph path(s) by theme keywords — pure geometry, no text. */
function glyphFor(card) {
  const n = card.name + card.one + card.types;
  // 1024 viewBox center ~512
  if (/小谱/.test(card.name)) {
    return `
      <g fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round">
        <rect x="320" y="280" width="384" height="480" rx="18" />
        <line x1="360" y1="360" x2="664" y2="360" />
        <line x1="360" y1="430" x2="620" y2="430" />
        <line x1="360" y1="500" x2="640" y2="500" />
        <line x1="360" y1="570" x2="580" y2="570" />
        <circle cx="512" cy="680" r="28" fill="currentColor" stroke="none" opacity="0.85"/>
      </g>`;
  }
  if (/知一张/.test(card.name)) {
    return `
      <g fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round">
        <rect x="300" y="300" width="424" height="424" rx="24" />
        <circle cx="512" cy="470" r="70" />
        <path d="M420 620 Q512 560 604 620" />
      </g>`;
  }
  if (/鼎|礼器|方鼎|圆鼎|组合/.test(n)) {
    return `<g fill="none" stroke="currentColor" stroke-width="12" stroke-linejoin="round">
      <path d="M360 420 h304 l-30 200 h-244 z"/>
      <path d="M400 420 v-50 h-30 v50"/><path d="M624 420 v-50 h30 v50"/>
      <line x1="430" y1="620" x2="430" y2="700"/><line x1="512" y1="620" x2="512" y2="700"/><line x1="594" y1="620" x2="594" y2="700"/>
    </g>`;
  }
  if (/玉|璧|圭|璋|比德/.test(n)) {
    return `<g fill="none" stroke="currentColor" stroke-width="14">
      <circle cx="512" cy="500" r="160"/><circle cx="512" cy="500" r="55"/>
    </g>`;
  }
  if (/乐|钟|磬|音乐|长调|礼乐/.test(n)) {
    return `<g fill="none" stroke="currentColor" stroke-width="10">
      <line x1="300" y1="360" x2="724" y2="360"/>
      <path d="M360 360 v180 q0 40 40 40 h20"/><path d="M460 360 v200 q0 40 40 40 h20"/>
      <path d="M560 360 v160 q0 40 40 40 h20"/><path d="M660 360 v140 q0 40 40 40 h10"/>
    </g>`;
  }
  if (/铭文|字|拓|子子孙孙/.test(n)) {
    return `<g fill="none" stroke="currentColor" stroke-width="10">
      <ellipse cx="512" cy="500" rx="150" ry="180"/>
      <path d="M450 440 h120 M450 500 h100 M450 560 h110" stroke-linecap="round"/>
    </g>`;
  }
  if (/范铸|工艺|窑|craft|手艺|传承/.test(n)) {
    return `<g fill="none" stroke="currentColor" stroke-width="10">
      <path d="M380 620 L512 300 L644 620 Z"/>
      <path d="M430 540 h164" /><circle cx="512" cy="420" r="28"/>
    </g>`;
  }
  if (/凤|楚|漆|楚辞|屈原|香草/.test(n)) {
    return `<g fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round">
      <path d="M360 560 Q512 240 664 560"/>
      <path d="M420 500 Q512 360 604 500"/>
      <circle cx="512" cy="420" r="18" fill="currentColor" stroke="none"/>
    </g>`;
  }
  if (/面具|三星堆|巴蜀|纵目|神树|栈道|蜀道/.test(n)) {
    return `<g fill="none" stroke="currentColor" stroke-width="10">
      <rect x="380" y="340" width="264" height="320" rx="40"/>
      <circle cx="450" cy="460" r="22"/><circle cx="574" cy="460" r="22"/>
      <line x1="450" y1="420" x2="450" y2="360"/><line x1="574" y1="420" x2="574" y2="360"/>
      <path d="M450 560 Q512 600 574 560"/>
    </g>`;
  }
  if (/瓷|青花|茶|紫砂|江南|园林|扇|书画|烟雨|市镇|雅集|丝与绣|绣/.test(n)) {
    return `<g fill="none" stroke="currentColor" stroke-width="10">
      <path d="M430 360 h164 q40 0 40 40 v200 q0 80 -122 80 q-122 0 -122 -80 v-200 q0 -40 40 -40z"/>
      <ellipse cx="512" cy="360" rx="82" ry="24"/>
    </g>`;
  }
  if (/马|驼|关|长城|塞北|丝路|边|互市|皮毛|玉门|阳关|粟特/.test(n)) {
    return `<g fill="none" stroke="currentColor" stroke-width="10" stroke-linejoin="round">
      <path d="M300 620 L300 420 L380 420 L420 340 L500 340 L540 420 L700 420 L700 620 Z"/>
      <rect x="470" y="460" width="70" height="100"/>
    </g>`;
  }
  if (/昆仑|仙|异兽|精卫|夸父|西王母|烛龙|九尾|山海|山经|海经|神话|经载/.test(n)) {
    return `<g fill="none" stroke="currentColor" stroke-width="10" stroke-linejoin="round">
      <path d="M280 640 L420 360 L512 480 L620 300 L760 640 Z"/>
      <circle cx="620" cy="280" r="36"/>
    </g>`;
  }
  if (/春|元宵|端|中秋|清明|七夕|重阳|冬至|节气|岁时|灯|月|粽|联/.test(n)) {
    return `<g fill="none" stroke="currentColor" stroke-width="10">
      <path d="M512 300 C420 300 360 380 360 470 C360 590 512 700 512 700 C512 700 664 590 664 470 C664 380 604 300 512 300 Z"/>
      <line x1="512" y1="300" x2="512" y2="260"/>
      <circle cx="512" cy="240" r="14" fill="currentColor" stroke="none"/>
    </g>`;
  }
  if (/海|船|港|罗盘|季风|郑和|沉船|瓷|茶瓷|侨批|通事|互鉴|航/.test(n)) {
    return `<g fill="none" stroke="currentColor" stroke-width="10" stroke-linejoin="round">
      <path d="M300 560 L724 560 L680 640 L340 640 Z"/>
      <path d="M512 300 L512 560"/><path d="M512 320 L640 480 L512 480 Z"/>
      <path d="M280 700 Q512 660 744 700" />
    </g>`;
  }
  if (/考古|伦理|证据|边界|勿迷信|再创作|盗掘|敬畏|生态/.test(n)) {
    return `<g fill="none" stroke="currentColor" stroke-width="10">
      <circle cx="512" cy="480" r="140"/>
      <path d="M512 380 v120"/><circle cx="512" cy="560" r="12" fill="currentColor" stroke="none"/>
    </g>`;
  }
  if (/看展|今日|对照|合图|五区|四区|七区/.test(n)) {
    return `<g fill="none" stroke="currentColor" stroke-width="10">
      <rect x="280" y="360" width="180" height="240" rx="12"/>
      <rect x="420" y="320" width="180" height="240" rx="12"/>
      <rect x="560" y="360" width="180" height="240" rx="12"/>
    </g>`;
  }
  if (/熊猫/.test(n)) {
    return `<g fill="none" stroke="currentColor" stroke-width="10">
      <circle cx="512" cy="520" r="120"/><circle cx="430" cy="400" r="40"/><circle cx="594" cy="400" r="40"/>
      <circle cx="470" cy="500" r="16" fill="currentColor" stroke="none"/><circle cx="554" cy="500" r="16" fill="currentColor" stroke="none"/>
    </g>`;
  }
  if (/日用|食器|酒器|水器/.test(n)) {
    return `<g fill="none" stroke="currentColor" stroke-width="10">
      <ellipse cx="400" cy="520" rx="70" ry="50"/><path d="M330 520 v80 h140 v-80"/>
      <path d="M520 400 h140 v200 h-140 z"/><ellipse cx="700" cy="560" rx="60" ry="30"/><path d="M640 560 v60 h120"/>
    </g>`;
  }
  // default open book
  return `<g fill="none" stroke="currentColor" stroke-width="10" stroke-linejoin="round">
    <path d="M300 360 L512 420 L724 360 L724 680 L512 620 L300 680 Z"/>
    <path d="M512 420 V620"/>
  </g>`;
}

function buildSvg(card) {
  const reg = REGION[card.region] || REGION.R01;
  const isSpectrum = /小谱/.test(card.name);
  const isKnow = /知一张/.test(card.name);
  const accent = isSpectrum ? reg.c2 : isKnow ? reg.c3 : reg.c2;
  const glyph = glyphFor(card).replace(/currentColor/g, accent);

  // Decorative corners + soft paper texture simulation via circles
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <radialGradient id="spot" cx="50%" cy="38%" r="65%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
      <stop offset="55%" stop-color="${reg.paper}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${reg.c1}" stop-opacity="0.18"/>
    </radialGradient>
    <linearGradient id="frame" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${reg.c2}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${reg.c3}" stop-opacity="0.35"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="${reg.paper}"/>
  <rect width="100%" height="100%" fill="url(#spot)"/>
  <!-- soft grain -->
  <g opacity="0.06" fill="${reg.c1}">
    ${Array.from({ length: 40 }, (_, i) => {
      const x = (i * 97 + 40) % 1000;
      const y = (i * 53 + 30) % 1000;
      const r = 8 + (i % 5) * 3;
      return `<circle cx="${x}" cy="${y}" r="${r}"/>`;
    }).join('')}
  </g>
  <!-- outer frame -->
  <rect x="48" y="48" width="928" height="928" rx="28" fill="none" stroke="url(#frame)" stroke-width="3"/>
  <rect x="72" y="72" width="880" height="880" rx="20" fill="none" stroke="${reg.c1}" stroke-opacity="0.12" stroke-width="2"/>
  <!-- corners -->
  <g stroke="${accent}" stroke-width="6" fill="none" stroke-linecap="square" opacity="0.75">
    <path d="M110 170 V110 H170"/><path d="M854 110 H914 V170"/>
    <path d="M110 854 V914 H170"/><path d="M854 914 H914 V854"/>
  </g>
  <!-- top seal disc -->
  <circle cx="512" cy="168" r="36" fill="none" stroke="${accent}" stroke-width="4" opacity="0.7"/>
  <circle cx="512" cy="168" r="10" fill="${accent}" opacity="0.55"/>
  <!-- glyph -->
  <g transform="translate(0,20)" opacity="0.92">
    ${glyph}
  </g>
  <!-- bottom rule -->
  <line x1="320" y1="860" x2="704" y2="860" stroke="${accent}" stroke-width="3" opacity="0.45"/>
  <circle cx="512" cy="860" r="6" fill="${accent}" opacity="0.6"/>
</svg>`;
}

async function renderCard(card) {
  const dest = join(outRoot, `${card.id}.webp`);
  if (existsSync(dest)) return { id: card.id, skipped: true };
  const svg = Buffer.from(buildSvg(card));
  await sharp(svg)
    .resize(SIZE, SIZE)
    .webp({ quality: 84, effort: 5 })
    .toFile(dest);
  return { id: card.id, skipped: false };
}

function writeArtifactArtTs(ids) {
  const byRegion = {};
  for (const id of [...ids].sort()) {
    const reg = id.match(/A-(R\d+)/)?.[1] || 'RX';
    (byRegion[reg] ||= []).push(id);
  }
  const labels = {
    R01: '中原',
    R02: '楚地',
    R03: '巴蜀',
    R04: '江南',
    R05: '塞北',
    R06: '仙山',
    R07: '岁时',
    R08: '海丝',
  };
  let body = `/**
 * 名物级插画映射（RexAI + 本地概念卡 → WebP）
 * 路径：public/assets/shanhai/artifacts/{id}.webp
 */

export const ARTIFACT_ART: Record<string, string> = {\n`;
  for (const reg of Object.keys(byRegion).sort()) {
    body += `  // ${reg} ${labels[reg] || ''}\n`;
    for (const id of byRegion[reg]) {
      body += `  '${id}': '/assets/shanhai/artifacts/${id}.webp',\n`;
    }
  }
  body += `};

export function getArtifactArt(id: string): string | undefined {
  return ARTIFACT_ART[id];
}

export function artifactArtCount(): number {
  return Object.keys(ARTIFACT_ART).length;
}
`;
  writeFileSync(artPath, body, 'utf8');
}

async function main() {
  mkdirSync(outRoot, { recursive: true });

  // compress any leftover rexai png first
  const pngs = readdirSync(outRoot).filter((f) => f.endsWith('.png'));
  if (pngs.length) {
    console.log(`compressing ${pngs.length} leftover PNG...`);
    const { spawnSync } = await import('node:child_process');
    spawnSync('node', [join(root, 'scripts/shanhai-compress-webp.mjs'), '--delete-png'], {
      cwd: root,
      stdio: 'inherit',
    });
  }

  // cleanup temp dirs
  for (const d of readdirSync(outRoot, { withFileTypes: true })) {
    if (d.isDirectory()) rmSync(join(outRoot, d.name), { recursive: true, force: true });
  }

  const cards = loadCards();
  const missing = cards.filter((c) => !existsSync(join(outRoot, `${c.id}.webp`)));
  console.log(`cards=${cards.length} missing=${missing.length} (local concept art)`);

  let made = 0;
  for (const c of missing) {
    const r = await renderCard(c);
    if (!r.skipped) {
      made++;
      if (made % 20 === 0) console.log(`... ${made}/${missing.length}`);
    }
  }
  console.log(`local generated=${made}`);

  const onDisk = cards.filter((c) => existsSync(join(outRoot, `${c.id}.webp`))).map((c) => c.id);
  writeArtifactArtTs(onDisk);
  console.log(`artifactArt map entries=${onDisk.length}`);

  const still = cards.filter((c) => !existsSync(join(outRoot, `${c.id}.webp`)));
  console.log(`still_missing=${still.length}`);
  if (still.length) console.log(still.map((c) => c.id).join(', '));

  const { statSync } = await import('node:fs');
  const webps = readdirSync(outRoot).filter((f) => f.endsWith('.webp'));
  const totalBytes = webps.reduce((s, f) => s + statSync(join(outRoot, f)).size, 0);
  console.log(`webp_files=${webps.length} total_MB=${(totalBytes / 1024 / 1024).toFixed(2)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
