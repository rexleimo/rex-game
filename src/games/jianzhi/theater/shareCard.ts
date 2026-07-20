// 作品分享卡:1080×1350 暗场金框 + 吉语 + 水印(离屏 canvas 合成,静态站零依赖)
export async function buildShareCard({
  workPng,
  title,
  phrase,
}: {
  workPng: string;
  title: string;
  phrase?: string | null;
}): Promise<Blob> {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas unsupported');

  // 暗场底 + 朱红光晕
  ctx.fillStyle = '#0A0705';
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W * 0.72, H * 0.12, 60, W * 0.72, H * 0.12, 620);
  glow.addColorStop(0, 'rgba(200,46,33,0.4)');
  glow.addColorStop(1, 'rgba(200,46,33,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // 眉头
  ctx.fillStyle = '#C9A24B';
  ctx.font = '30px serif';
  ctx.textAlign = 'center';
  ctx.fillText('纸 上 生 花 · 剪 纸 剧 场', W / 2, 110);

  // 金框 + 作品
  const work = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = workPng;
  });
  const frame = 16;
  const boxSize = 880;
  const bx = (W - boxSize) / 2;
  const by = 190;
  ctx.fillStyle = '#F7F1E6';
  ctx.fillRect(bx - frame, by - frame, boxSize + frame * 2, boxSize + frame * 2);
  ctx.strokeStyle = '#C9A24B';
  ctx.lineWidth = 3;
  ctx.strokeRect(bx - frame - 6, by - frame - 6, boxSize + frame * 2 + 12, boxSize + frame * 2 + 12);
  ctx.drawImage(work, bx, by, boxSize, boxSize);

  // 标题与吉语
  ctx.fillStyle = '#F5EDE0';
  ctx.font = '700 64px serif';
  ctx.fillText(title, W / 2, by + boxSize + 130);
  if (phrase) {
    ctx.fillStyle = '#E8452F';
    ctx.font = '700 54px serif';
    ctx.fillText(phrase, W / 2, by + boxSize + 215);
  }

  // 水印
  ctx.fillStyle = '#C9A24B';
  ctx.font = '26px sans-serif';
  ctx.fillText('REX-GAME · 纸上生花 · game.rexai.top', W / 2, H - 60);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))), 'image/png');
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
