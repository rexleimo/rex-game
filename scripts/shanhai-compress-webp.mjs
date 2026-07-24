/**
 * Compress shanhai artifact PNGs to WebP and optionally remove sources.
 * Usage: node scripts/shanhai-compress-webp.mjs [--delete-png] [--dir public/assets/shanhai/artifacts]
 */
import { readdirSync, statSync, unlinkSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';
import sharp from 'sharp';

const args = process.argv.slice(2);
const deletePng = args.includes('--delete-png');
const dirArg = args.find((a) => a.startsWith('--dir='));
const dir = dirArg ? dirArg.slice('--dir='.length) : 'public/assets/shanhai/artifacts';
const maxEdge = 1024;
const quality = 82;

const files = readdirSync(dir).filter((f) => /\.png$/i.test(f));
if (!files.length) {
  console.log('No PNG files in', dir);
  process.exit(0);
}

let before = 0;
let after = 0;

for (const f of files) {
  const src = join(dir, f);
  const id = basename(f, extname(f));
  const dest = join(dir, `${id}.webp`);
  const srcStat = statSync(src);
  before += srcStat.size;

  await sharp(src)
    .rotate()
    .resize({
      width: maxEdge,
      height: maxEdge,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality, effort: 5 })
    .toFile(dest);

  const destStat = statSync(dest);
  after += destStat.size;
  const ratio = ((1 - destStat.size / srcStat.size) * 100).toFixed(1);
  console.log(
    `OK ${id}.webp  ${(srcStat.size / 1024).toFixed(0)}KB → ${(destStat.size / 1024).toFixed(0)}KB  (-${ratio}%)`,
  );

  if (deletePng) {
    unlinkSync(src);
    console.log(`  removed ${f}`);
  }
}

console.log(
  `\nSUMMARY files=${files.length} before=${(before / 1024 / 1024).toFixed(2)}MB after=${(after / 1024 / 1024).toFixed(2)}MB saved=${(((before - after) / before) * 100).toFixed(1)}%`,
);
if (existsSync(dir)) {
  console.log('dir', dir);
}
