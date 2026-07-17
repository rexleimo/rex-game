import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import sharp from 'sharp';

const root = join(process.cwd(), 'public', 'assets', 'yingge', 'game', 'enemies');
const enemyKinds = ['ash-wisp', 'flanker', 'pouncer', 'swarm', 'tile-guard', 'miasma-chief'];

for (const kind of enemyKinds) {
  const input = join(root, kind, 'idle-source', 'rexai-1.png');
  const output = join(root, kind, 'idle.webp');
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  for (let offset = 0; offset < data.length; offset += info.channels) {
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    const magentaDistance = Math.hypot(255 - red, green, 255 - blue);
    const magentaBias = red + blue - green * 2;
    if (magentaDistance < 205 || (red > 90 && blue > 90 && magentaBias > 60)) {
      data[offset + 3] = 0;
    }
  }

  await mkdir(dirname(output), { recursive: true });
  await sharp(data, { raw: info })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize({ width: 512, height: 512, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82, alphaQuality: 92, effort: 6 })
    .toFile(output);
}
