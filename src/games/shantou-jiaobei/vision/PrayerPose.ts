import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

/**
 * 「双手合十」(prayer pose) 判定。
 *
 * MediaPipe Hand 21 关键点索引（每只手）：
 *   0  = 手腕
 *   4  = 拇指尖  8=食指尖  12=中指尖  16=无名指尖  20=小指尖
 *   5  = 食指掌指关节(MCP)  17=小指掌指关节
 *
 * 合十判定（图像归一化坐标，左上角原点，y 向下）：
 *   1. 检测到 2 只手
 *   2. 两手都「指尖朝上」：各指尖 y < 手腕 y（图像中上方），且指尖高于掌指关节
 *   3. 两手水平贴近：两手手腕 x 距离占画面宽度较小（在中央区）
 *   4. 两手一左一右（handedness 互补，镜像后近似判断）
 *
 * 返回 0~1 的置信度；>= PRAYER_THRESHOLD 即视为合十。
 */
export const PRAYER_THRESHOLD = 0.5;

export interface PoseResult {
  isPrayer: boolean;
  score: number; // 0~1
  handCount: number;
  /** 给 UI 显示的进度提示用 */
  hint: string;
}

export function detectPrayerPose(
  landmarksList: NormalizedLandmark[][],
  handedness: string[], // 如 ['Left','Right']（每只手一个）
): PoseResult {
  if (landmarksList.length < 2) {
    return { isPrayer: false, score: 0, handCount: landmarksList.length, hint: '请把两只手都放到画面里' };
  }

  // 取置信度最高的两只手
  const a = landmarksList[0];
  const b = landmarksList[1];

  const score = computePrayerScore(a, b);
  const isPrayer = score >= PRAYER_THRESHOLD;
  let hint = '双手合十，指尖朝上，置于胸前';
  if (!isPrayer) {
    if (score < 0.2) hint = '让两只手掌心相对、指尖向上';
    else hint = '再靠近一点，让双手指尖朝上贴合';
  }
  return { isPrayer, score, handCount: 2, hint };
}

/** 计算 0~1 合十置信度 */
function computePrayerScore(a: NormalizedLandmark[], b: NormalizedLandmark[]): number {
  let score = 0;
  let parts = 0;

  // 1) 两手都指尖朝上：中指尖(12) y < 手腕(0) y（图像 y 向下，朝上=更小的 y）
  const aUp = fingerUpScore(a);
  const bUp = fingerUpScore(b);
  score += aUp; parts++;
  score += bUp; parts++;

  // 2) 两手水平贴近：手腕 x 距离要小（合十时两手腕几乎并排但分开约一个手掌宽）
  //    画面宽度 1.0，两手腕 x 差在 ~0.05~0.18 之间为「贴近但可分辨」
  const dx = Math.abs(a[0].x - b[0].x);
  const closeness = dx < 0.05 ? dx / 0.05 // 太近可能重叠/单手误判
    : dx <= 0.2 ? 1 - (dx - 0.05) / 0.15
    : 0;
  score += closeness; parts++;

  // 3) 两手位于画面中部偏上（胸前）：平均手腕 x 在 0.25~0.75，平均 y 在 0.1~0.6
  const avgX = (a[0].x + b[0].x) / 2;
  const avgY = (a[0].y + b[0].y) / 2;
  const center = (avgX > 0.25 && avgX < 0.75 ? 1 : 0.5) * (avgY > 0.1 && avgY < 0.65 ? 1 : 0.5);
  score += center; parts++;

  // 4) 两手高度接近（合十时两手大致齐平）
  const dy = Math.abs(a[0].y - b[0].y);
  const level = dy < 0.15 ? 1 - dy / 0.15 : 0;
  score += level; parts++;

  return score / parts;
}

/** 单只手「指尖朝上」程度 0~1：中指尖与手腕的高度差 */
function fingerUpScore(lm: NormalizedLandmark[]): number {
  const wrist = lm[0];
  const midTip = lm[12];
  const midMcp = lm[9]; // 中指掌指关节
  // 指尖明显高于手腕（y 更小），且高于掌指关节
  const aboveWrist = clamp01((wrist.y - midTip.y) / 0.25);
  const aboveMcp = clamp01((midMcp.y - midTip.y) / 0.08);
  return 0.6 * aboveWrist + 0.4 * aboveMcp;
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}
