import type { Metadata } from 'next';

import { GalleryFooter } from '@/components/site/GalleryFooter';
import { GalleryHeader } from '@/components/site/GalleryHeader';
import { JsonLd } from '@/components/site/JsonLd';
import { PassportView } from '@/components/passport/PassportView';
import { PASSPORT_CARDS } from '@/core/passport';
import { SITE_ORIGIN } from '@/content/site';

export const metadata: Metadata = {
  title: '文化护照｜集齐五件展品的文化卡',
  description:
    '一本记录你在 rex-game 走过哪些展品的护照：节气、山海、圣杯、英歌、剪纸共 22 张文化卡，进度只存在本机浏览器。',
  alternates: { canonical: '/passport/' },
  openGraph: {
    title: '文化护照 · rex-game',
    description: '集齐五件展品的文化卡，进度只存在本机浏览器。',
    url: `${SITE_ORIGIN}/passport/`,
  },
};

export default function PassportPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '文化护照',
    url: `${SITE_ORIGIN}/passport/`,
    inLanguage: 'zh-CN',
    description: `记录在 rex-game 五件可玩展品中收集到的 ${PASSPORT_CARDS.length} 张文化卡。`,
  };

  return (
    <div className="theme-gallery">
      <JsonLd data={structuredData} />
      <GalleryHeader ctaHref="/#exhibits" ctaLabel="回展厅" />
      <main className="g-doc">
        <p className="g-label">收藏</p>
        <h1>文化护照</h1>
        <p>
          每件展品都会留下几张文化卡。集卡不是为了刷完，是为了记住——
          一张卡就是一件你亲手做过、因而记得住的事：掷出过的杯象、剪出过的吉语、修复过的器物。
        </p>
        <PassportView />
      </main>
      <GalleryFooter />
    </div>
  );
}
