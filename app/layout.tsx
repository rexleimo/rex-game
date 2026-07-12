import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import '@/styles/home.css';
import '@/styles/jiaobei.css';

export const metadata: Metadata = {
  title: 'rex-game · 趣玩小游戏站',
  description: 'rex-game —— 静态娱乐游戏站。首个游戏：潮汕圣杯占卜，掷筊问愿。',
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: '潮汕圣杯占卜 · rex-game',
    description: '双手合十，掷筊问愿 —— 圣杯、笑杯、阴杯，神明如何回你？',
    images: ['/assets/jiaobei-hero.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#17100b',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        {/* 中文字体：思源宋体（展示）+ 思源黑体（正文）—— 后续可本地化托管 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@500;700;900&family=Noto+Sans+SC:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
