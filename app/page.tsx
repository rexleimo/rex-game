import type { Metadata } from 'next';
import { games } from '@/core/gamesRegistry';
import { CultureGateway } from '@/components/site/CultureGateway';
import { ExhibitSection } from '@/components/site/ExhibitSection';
import { GalleryFooter } from '@/components/site/GalleryFooter';
import { GalleryHeader } from '@/components/site/GalleryHeader';
import { GallerySectionHeader } from '@/components/site/GallerySectionHeader';
import { HomeClaims } from '@/components/site/HomeClaims';
import { HomeHero } from '@/components/site/HomeHero';
import { HomeTrust } from '@/components/site/HomeTrust';
import { JsonLd } from '@/components/site/JsonLd';
import { SITE_ORIGIN } from '@/content/site';

const CULTURE_BY_GAME: Record<string, string> = {
  'shantou-jiaobei': '/culture/jiaobei/',
  'chaoshan-yingge': '/culture/yingge/',
  jianzhi: '/culture/jianzhi/',
};

export const metadata: Metadata = {
  title: { absolute: 'rex-game · 可玩的民俗文化馆' },
  description:
    '一座可以玩的中国民艺馆:潮汕圣杯占卜、潮汕英歌、中国剪纸——三件民俗展品无需下载即开即玩,文化说明可检索。',
  openGraph: {
    title: 'rex-game · 可玩的民俗文化馆',
    description: '一座可以玩的中国民艺馆:掷筊问愿、英歌合槌、折剪生花。',
    url: SITE_ORIGIN,
  },
};

export default function HomePage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'rex-game',
        url: `${SITE_ORIGIN}/`,
        description: '一座可以玩的中国民艺馆:浏览器即开即玩的民俗互动展品与文化导读。',
        inLanguage: 'zh-CN',
        publisher: {
          '@type': 'Organization',
          name: 'rex-game',
          url: `${SITE_ORIGIN}/`,
          logo: { '@type': 'ImageObject', url: `${SITE_ORIGIN}/favicon.svg` },
        },
      },
      {
        '@type': 'ItemList',
        itemListElement: games.map((g, index) => {
          const href = g.href.endsWith('/') ? g.href : `${g.href}/`;
          return {
            '@type': 'ListItem',
            position: index + 1,
            url: `${SITE_ORIGIN}${href}`,
            name: g.name,
            description: g.tagline,
            image: `${SITE_ORIGIN}${g.cover}`,
          };
        }),
      },
    ],
  };

  return (
    <div className="theme-gallery">
      <JsonLd data={structuredData} />
      <GalleryHeader ctaHref={games[0]?.href} ctaLabel="进入展厅" />
      <main>
        <HomeHero />

        <section className="g-section g-container" id="exhibits" aria-labelledby="exhibits-title">
          <GallerySectionHeader index="〇一" title="三件可玩,三道门径" note="每个游戏 = 一件可玩展品" />
          <h2 id="exhibits-title" className="visually-hidden">
            展品列表
          </h2>
          {games.map((game, i) => (
            <ExhibitSection
              key={game.id}
              game={game}
              index={i}
              cultureHref={CULTURE_BY_GAME[game.id] ?? '/culture/'}
            />
          ))}
        </section>

        <section className="g-section g-container" aria-labelledby="why-title">
          <GallerySectionHeader index="〇二" title="为何在此" />
          <h2 id="why-title" className="visually-hidden">
            为什么在浏览器里学民俗
          </h2>
          <HomeClaims />
        </section>

        <section className="g-section g-container" aria-labelledby="gateway-title">
          <GallerySectionHeader index="〇三" title="玩完,读懂它" note="9 篇文化导读,持续扩充" />
          <h2 id="gateway-title" className="visually-hidden">
            文化馆入口
          </h2>
          <CultureGateway />
        </section>

        <section className="g-section g-container" aria-labelledby="trust-title">
          <GallerySectionHeader index="〇四" title="娱乐展示,不作人生裁决" />
          <h2 id="trust-title" className="visually-hidden">
            信任与声明
          </h2>
          <HomeTrust />
        </section>
      </main>
      <GalleryFooter />
    </div>
  );
}
