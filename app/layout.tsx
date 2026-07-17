import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import '@/styles/home.css';
import '@/styles/jiaobei.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://game.rexai.top'),
  title: {
    default: 'rex-game · 趣玩小游戏站',
    template: '%s · rex-game',
  },
  description:
    'rex-game —— 浏览器即开即玩的静态民俗小游戏站。首个游戏：潮汕圣杯占卜，在线掷筊问愿，体验传统潮汕民俗仪式。',
  applicationName: 'rex-game',
  authors: [{ name: 'rexai', url: 'https://game.rexai.top' }],
  keywords: [
    '小游戏',
    '民俗游戏',
    '潮汕圣杯',
    '掷筊',
    '圣杯占卜',
    '在线占卜',
    '传统文化',
    '潮汕文化',
    'HTML5游戏',
  ],
  category: 'games',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: { icon: '/favicon.svg', apple: '/favicon.svg' },
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: 'rex-game',
    title: '潮汕圣杯占卜 · rex-game',
    description: '双手合十，掷筊问愿 —— 圣杯、笑杯、阴杯，神明如何回你？',
    url: 'https://game.rexai.top',
    images: [
      {
        url: '/assets/jiaobei-hero.png',
        width: 1200,
        height: 630,
        alt: '潮汕圣杯游戏中的两片真实 3D 筊杯落在木质台面上',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
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
