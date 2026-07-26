/**
 * 分享卡通用原语。
 *
 * 静态站没有服务端出图，分享卡一律在离屏 canvas 上合成、零依赖。抽这一层是
 * 因为剪纸和护照两张卡的版式不同、底子却完全一样（暗场底、朱红光晕、金色眉头、
 * 站点水印）；各写一份会慢慢漂成两套视觉。
 *
 * 尺寸固定 1080×1350（4:5）—— 微信朋友圈与小红书的竖图安全比例。
 */

export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1350;

/** 与 tokens.css 的 --g-* 对齐；canvas 读不到 CSS 变量，只能在这里重述一次。 */
export const CARD_COLORS = {
  abyss: '#0A0705',
  paper: '#F7F1E6',
  gold: '#C9A24B',
  goldHi: '#E8CF9A',
  cinnabar: '#C82E21',
  cinnabarHi: '#E8452F',
  textHi: '#F5EDE0',
  textDim: 'rgba(232, 220, 196, 0.55)',
} as const;

export interface CardSurface {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}

export function createCardSurface(
  width = CARD_WIDTH,
  height = CARD_HEIGHT,
): CardSurface {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas unsupported');
  return { canvas, ctx };
}

/** 暗场底 + 右上朱红光晕。所有分享卡共用的底。 */
export function paintBackdrop(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = CARD_COLORS.abyss;
  ctx.fillRect(0, 0, width, height);
  const glow = ctx.createRadialGradient(width * 0.72, height * 0.12, 60, width * 0.72, height * 0.12, 620);
  glow.addColorStop(0, 'rgba(200,46,33,0.4)');
  glow.addColorStop(1, 'rgba(200,46,33,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
}

/** 顶部金色眉头，字间距用全角空格手工撑开。 */
export function paintEyebrow(
  ctx: CanvasRenderingContext2D,
  text: string,
  width: number,
  y = 110,
) {
  ctx.fillStyle = CARD_COLORS.gold;
  ctx.font = '30px serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, width / 2, y);
}

/** 底部站点水印。分享出去的图必须自带出处，否则传播等于白传。 */
export function paintWatermark(
  ctx: CanvasRenderingContext2D,
  label: string,
  width: number,
  height: number,
) {
  ctx.fillStyle = CARD_COLORS.gold;
  ctx.font = '26px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`REX-GAME · ${label} · game.rexai.top`, width / 2, height - 60);
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`image load failed: ${src.slice(0, 64)}`));
    img.src = src;
  });
}

export function surfaceToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
      'image/png',
    );
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  // 立刻 revoke 会让部分浏览器的下载中断，留一段窗口
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
