import { JiaobeiGame } from '@/games/shantou-jiaobei/JiaobeiGame';

/**
 * 潮汕圣杯占卜 —— 游戏入口页。
 * 整个游戏为客户端组件（Babylon / MediaPipe / Web Speech 均为浏览器 API）。
 */
export default function ShantouJiaobeiPage() {
  return <JiaobeiGame />;
}
