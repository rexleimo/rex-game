import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SITE_DISCLAIMER, SITE_ORIGIN } from '@/content/site';
import { JsonLd } from '@/components/site/JsonLd';

export const metadata: Metadata = {
  title: '关于本站｜娱乐声明与隐私要点',
  description:
    'rex-game 是浏览器中的民俗小游戏站：可玩展品 + 文化导读。说明娱乐边界、摄像头本地处理与资料态度。',
  alternates: { canonical: '/about/' },
  openGraph: {
    title: '关于 rex-game',
    description: '可玩的民俗文化馆：娱乐声明与隐私要点。',
    url: `${SITE_ORIGIN}/about/`,
  },
};

export default function AboutPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: '关于 rex-game',
    url: `${SITE_ORIGIN}/about/`,
    inLanguage: 'zh-CN',
    description: SITE_DISCLAIMER,
  };

  return (
    <div className="theme-museum site-root">
      <JsonLd data={structuredData} />
      <SiteHeader />
      <main className="culture-doc">
        <p className="site-hero__kicker">关于</p>
        <h1>rex-game · 可玩的民俗文化馆</h1>
        <p>
          本站把潮汕掷筊、潮汕英歌、中国剪纸等主题做成浏览器即可打开的互动展品，并辅以可检索的文化说明页。目标是
          <strong>好玩、可读、可核来源</strong>，而不是替代真实仪式、师承或社区实践。
        </p>
        <section>
          <h2>娱乐与非决策声明</h2>
          <p>{SITE_DISCLAIMER}</p>
        </section>
        <section>
          <h2>摄像头与隐私</h2>
          <p>
            部分展品（如圣杯）可选用摄像头识别抬手与落手，以增强仪式感。画面在
            <strong>本地浏览器</strong>中处理，本站设计不上传影像流。你也可以关闭摄像头，改用按钮操作。
          </p>
        </section>
        <section>
          <h2>文化表述原则</h2>
          <p>
            说明文字尽量区分「常见说法 / 地区差异 / 本游戏设计」，并列出可点击的资料来源。地方传统丰厚而多样，任何网页都无法穷尽。
          </p>
        </section>
        <section>
          <h2>继续探索</h2>
          <p>
            <Link href="/">返回首页</Link>
            {' · '}
            <Link href="/culture/">进入文化馆</Link>
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
