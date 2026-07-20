// 每文化页 OG 卡:遍历 registry,按命名约定渲到 public/assets/og/
// 命名:hub → culture-<hub>.png;topic → culture-<hub>-<slug>.png
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';
import { listCulturePages } from '../src/content/culture/registry.ts';
import { buildOgSvg } from './generate-og.mjs';

await mkdir('public/assets/og', { recursive: true });

for (const page of listCulturePages()) {
  const name = page.kind === 'hub' ? `culture-${page.hub}` : `culture-${page.hub}-${page.slug}`;
  const svg = buildOgSvg({
    title: page.h1.replace(/[?？]$/, ''),
    subtitle: page.description.slice(0, 40),
    symbol: page.symbol ?? page.hub,
  });
  await sharp(Buffer.from(svg)).png().toFile(`public/assets/og/${name}.png`);
  console.log(`${name}.png`);
}
console.log('culture OG cards done');
