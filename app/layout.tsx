import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import '@/styles/tokens.css';
import '@/styles/gallery.css';
import '@/styles/museum.css';
import '@/styles/jiaobei.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://game.rexai.top'),
  title: {
    default: 'rex-game · 可玩的民俗文化馆',
    template: '%s · rex-game',
  },
  description:
    '一座可以玩的中国民艺馆:潮汕圣杯占卜、潮汕英歌、中国剪纸——可玩展品与可检索文化导读,无需下载,即开即玩。',
  applicationName: 'rex-game',
  authors: [{ name: 'rexai', url: 'https://game.rexai.top' }],
  keywords: [
    '小游戏',
    '民俗游戏',
    '潮汕圣杯',
    '掷筊',
    '潮汕英歌',
    '中国剪纸',
    '传统文化',
    '潮汕文化',
    'HTML5游戏',
    '非遗',
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
    title: 'rex-game · 可玩的民俗文化馆',
    description: '一座可以玩的中国民艺馆:掷筊问愿、英歌合槌、折剪生花,即开即玩。',
    url: 'https://game.rexai.top',
    images: [
      {
        url: '/assets/og-home.png',
        width: 1200,
        height: 630,
        alt: 'rex-game 可玩的民俗文化馆:一座可以玩的中国民艺馆',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'rex-game · 可玩的民俗文化馆',
    description: '一座可以玩的中国民艺馆:掷筊问愿、英歌合槌、折剪生花,即开即玩。',
    images: ['/assets/og-home.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#0A0705',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        {/* 自托管字体子集(public/fonts,pnpm fonts 生成):preload 展示 serif,正文 sans 随 @font-face swap */}
        <link
          rel="preload"
          href="/fonts/NotoSerifSC-subset.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
