import type { PassportState } from '../passport/types.ts';
import {
  CARD_COLORS,
  CARD_HEIGHT,
  CARD_WIDTH,
  createCardSurface,
  paintBackdrop,
  paintEyebrow,
  paintWatermark,
  surfaceToBlob,
} from './cardCanvas.ts';

/**
 * 护照分享卡。
 *
 * 分享的是"我在这座馆里做过什么"，所以卡面主体是已集卡名的清单，而不是一个
 * 空洞的百分比。没集到的卡一个都不列——分享出去的图不该是一张待办清单。
 */
export async function buildPassportShareCard(passport: PassportState): Promise<Blob> {
  const { canvas, ctx } = createCardSurface();
  const W = CARD_WIDTH;
  const H = CARD_HEIGHT;

  paintBackdrop(ctx, W, H);
  paintEyebrow(ctx, '文 化 护 照', W);

  // 主数字
  ctx.textAlign = 'center';
  ctx.fillStyle = CARD_COLORS.goldHi;
  ctx.font = '700 200px serif';
  ctx.fillText(String(passport.earnedCount), W / 2, 360);

  ctx.fillStyle = CARD_COLORS.textDim;
  ctx.font = '38px sans-serif';
  ctx.fillText(`/ ${passport.totalCount} 张文化卡`, W / 2, 420);

  // 进度条
  const barW = 720;
  const barX = (W - barW) / 2;
  const barY = 470;
  ctx.fillStyle = 'rgba(232,220,196,0.14)';
  ctx.fillRect(barX, barY, barW, 6);
  const pct = passport.totalCount ? passport.earnedCount / passport.totalCount : 0;
  const fill = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  fill.addColorStop(0, CARD_COLORS.cinnabar);
  fill.addColorStop(1, CARD_COLORS.gold);
  ctx.fillStyle = fill;
  ctx.fillRect(barX, barY, barW * pct, 6);

  // 分区清单：展品名 + 已集卡名
  let y = 590;
  ctx.textAlign = 'left';
  const left = 130;

  for (const section of passport.sections) {
    if (section.earnedCount === 0) continue;

    ctx.fillStyle = CARD_COLORS.gold;
    ctx.font = '34px serif';
    ctx.fillText(section.name, left, y);

    ctx.fillStyle = CARD_COLORS.textDim;
    ctx.font = '26px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${section.earnedCount}/${section.totalCount}`, W - left, y);
    ctx.textAlign = 'left';

    y += 44;

    ctx.fillStyle = CARD_COLORS.textHi;
    ctx.font = '28px sans-serif';
    const names = section.cards.filter((c) => c.earned).map((c) => c.name).join(' · ');
    // 单行放不下就截断加省略号：卡面高度固定，宁可少写也不能溢出
    let line = names;
    while (ctx.measureText(line).width > W - left * 2 && line.length > 4) {
      line = line.slice(0, -2);
    }
    ctx.fillText(line === names ? names : `${line}…`, left, y);

    y += 62;
  }

  if (passport.earnedCount === 0) {
    ctx.textAlign = 'center';
    ctx.fillStyle = CARD_COLORS.textDim;
    ctx.font = '30px sans-serif';
    ctx.fillText('还没有印记 —— 任选一件展品，开始第一局。', W / 2, 640);
  }

  paintWatermark(ctx, '可玩的民俗文化馆', W, H);
  return surfaceToBlob(canvas);
}
