import type { Metadata } from 'next';
import Link from 'next/link';
import { GalleryFooter } from '@/components/site/GalleryFooter';
import { GalleryHeader } from '@/components/site/GalleryHeader';
import { QuickAnswer } from '@/components/site/QuickAnswer';
import { listCultureHubs, listCulturePages } from '@/content/culture/registry';
import { SITE_DISCLAIMER, SITE_ORIGIN } from '@/content/site';
import { JsonLd } from '@/components/site/JsonLd';

export const metadata: Metadata = {
  title: '文化馆｜民俗主题导读与资料',
  description:
    'rex-game 文化馆：潮汕掷筊、潮汕英歌、中国剪纸的可检索导读、术语与 FAQ，链向可玩展品。文化展示，娱乐体验。',
  alternates: { canonical: '/culture/' },
  openGraph: {
    title: '文化馆｜rex-game',
    description: '可玩的民俗文化导读：掷筊、英歌、剪纸。',
    url: `${SITE_ORIGIN}/culture/`,
  },
};

export default function CultureIndexPage() {
  const hubs = listCultureHubs();
  const topics = listCulturePages().filter((p) => p.kind === 'topic');

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'rex-game 文化馆',
    url: `${SITE_ORIGIN}/culture/`,
    description: '民俗主题导读与可玩展品入口。',
    inLanguage: 'zh-CN',
    hasPart: hubs.map((h) => ({
      '@type': 'WebPage',
      name: h.h1,
      url: `${SITE_ORIGIN}${h.path}`,
    })),
  };

  return (
    <div className="theme-gallery">
      <JsonLd data={structuredData} />
      <GalleryHeader />
      <main className="culture-index">
        <p className="g-label">文化馆</p>
        <h1 style={{ fontFamily: 'var(--g-font-display)', fontSize: 'clamp(1.9rem,4vw,2.6rem)', margin: '0.4rem 0 0' }}>
          可读、可核、可玩的民俗导读
        </h1>
        <QuickAnswer
          sentences={[
            '文化馆把三件展品背后的称法、形制、节奏与吉语写成可检索的说明页。',
            '每页提供快速回答、术语、FAQ 与来源链接，并标明常见说法、地区差异与游戏设计。',
            '说明页服务理解与收录；重要决定请勿依赖在线互动结果。',
            '准备好了就进入对应游戏，在浏览器里动手感受。',
          ]}
        />
        <h2 style={{ fontFamily: 'var(--g-font-display)', marginTop: '2rem' }}>主题枢纽</h2>
        <div className="gateway">
          {hubs.map((hub) => (
            <Link className="gateway__card" key={hub.path} href={hub.path}>
              <span className="gateway__q">{hub.h1}</span>
              <span className="gateway__teaser">{hub.description}</span>
              <span className="gateway__count">进入主题 →</span>
            </Link>
          ))}
        </div>
        <h2 style={{ fontFamily: 'var(--g-font-display)', marginTop: '2.5rem' }}>专题阅读</h2>
        <div className="gateway">
          {topics.map((topic) => (
            <Link className="gateway__card" key={topic.path} href={topic.path}>
              <span className="gateway__q">{topic.h1}</span>
              <span className="gateway__teaser">{topic.description}</span>
              <span className="gateway__count">专题导读 →</span>
            </Link>
          ))}
        </div>
        <p className="culture-doc__disclaimer">{SITE_DISCLAIMER}</p>
      </main>
      <GalleryFooter />
    </div>
  );
}
