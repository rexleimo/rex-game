import {
  CARD_COLORS,
  CARD_HEIGHT,
  CARD_WIDTH,
  createCardSurface,
  loadImage,
  paintBackdrop,
  paintEyebrow,
  paintWatermark,
  surfaceToBlob,
} from '@/core/share/cardCanvas';

export { downloadBlob } from '@/core/share/cardCanvas';

/** 作品分享卡：暗场金框 + 作品 + 吉语 + 水印。底子与护照卡共用 core/share 原语。 */
export async function buildShareCard({
  workPng,
  title,
  phrase,
}: {
  workPng: string;
  title: string;
  phrase?: string | null;
}): Promise<Blob> {
  const { canvas, ctx } = createCardSurface();
  const W = CARD_WIDTH;
  const H = CARD_HEIGHT;

  paintBackdrop(ctx, W, H);
  paintEyebrow(ctx, '纸 上 生 花 · 剪 纸 剧 场', W);

  // 金框 + 作品
  const work = await loadImage(workPng);
  const frame = 16;
  const boxSize = 880;
  const bx = (W - boxSize) / 2;
  const by = 190;
  ctx.fillStyle = CARD_COLORS.paper;
  ctx.fillRect(bx - frame, by - frame, boxSize + frame * 2, boxSize + frame * 2);
  ctx.strokeStyle = CARD_COLORS.gold;
  ctx.lineWidth = 3;
  ctx.strokeRect(bx - frame - 6, by - frame - 6, boxSize + frame * 2 + 12, boxSize + frame * 2 + 12);
  ctx.drawImage(work, bx, by, boxSize, boxSize);

  // 标题与吉语
  ctx.textAlign = 'center';
  ctx.fillStyle = CARD_COLORS.textHi;
  ctx.font = '700 64px serif';
  ctx.fillText(title, W / 2, by + boxSize + 130);
  if (phrase) {
    ctx.fillStyle = CARD_COLORS.cinnabarHi;
    ctx.font = '700 54px serif';
    ctx.fillText(phrase, W / 2, by + boxSize + 215);
  }

  paintWatermark(ctx, '纸上生花', W, H);
  return surfaceToBlob(canvas);
}
