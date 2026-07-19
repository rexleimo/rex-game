import Link from 'next/link';
import type { Metadata } from 'next';
import { games } from '@/core/gamesRegistry';
import { ExhibitCard } from '@/components/site/ExhibitCard';
import { HeroBand } from '@/components/site/HeroBand';
import { JsonLd } from '@/components/site/JsonLd';
import { SectionHeader } from '@/components/site/SectionHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import { TrustStrip } from '@/components/site/TrustStrip';
import { SITE_DISCLAIMER, SITE_ORIGIN } from '@/content/site';

const CULTURE_BY_GAME: Record<string, string> = {
  'shantou-jiaobei': '/culture/jiaobei/',
  'chaoshan-yingge': '/culture/yingge/',
  jianzhi: '/culture/jianzhi/',
};

export const metadata: Metadata = {
  title: '趣玩民俗小游戏站',
  description:
    'rex-game —— 浏览器中的民俗文化馆。潮汕圣杯、潮汕英歌、中国剪纸：可玩展品 + 可检索文化导读。无需下载，即开即玩。',
  openGraph: {
    title: 'rex-game · 可玩的民俗文化馆',
    description: '掷筊、英歌、剪纸——在浏览器里把民俗玩成展品。',
    url: SITE_ORIGIN,
  },
};

export default function HomePage() {
  const featured = games[0];

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'rex-game',
        url: `${SITE_ORIGIN}/`,
        description: '浏览器即开即玩的静态民俗小游戏站与文化导读。',
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
    <div className="theme-museum site-root">
      <JsonLd data={structuredData} />
      <SiteHeader ctaHref={featured?.href} ctaLabel="开始游玩" />

      <HeroBand
        altar
        kicker="可玩的民俗文化馆"
        title="在浏览器里，把民俗玩成展品"
        lead="潮汕掷筊、潮汕英歌、中国剪纸——先动手感受，再读清称法、节奏与吉语。文化说明可检索，互动结果仅供娱乐。"
        primaryHref={featured?.href ?? '/culture/'}
        primaryLabel={featured ? `游玩：${featured.name.split('：')[0]}` : '进入文化馆'}
        secondaryHref="/culture/"
        secondaryLabel="逛文化馆"
      />

      <section className="site-section" id="exhibits" aria-labelledby="exhibits-title">
        <SectionHeader index="〇一" eyebrow="当前展品" title="三件可玩，三道门径" />
        <h2 id="exhibits-title" className="visually-hidden">
          展品列表
        </h2>
        <div className="exhibit-grid">
          {games.map((game) => (
            <ExhibitCard
              key={game.id}
              game={game}
              cultureHref={CULTURE_BY_GAME[game.id] ?? '/culture/'}
            />
          ))}
        </div>
      </section>

      <section className="site-section" aria-labelledby="why-title">
        <SectionHeader index="〇二" eyebrow="为何在此" title="在地、可玩、可查来源" />
        <h2 id="why-title" className="visually-hidden">
          为什么在浏览器里学民俗
        </h2>
        <div className="claim-grid">
          <article className="claim-card">
            <h3>在地线索</h3>
            <p>从潮汕掷筊、英歌到通行剪纸吉语，以地方常见说法为线索，并保留地区差异空间。</p>
          </article>
          <article className="claim-card">
            <h3>可玩展品</h3>
            <p>3D 筊杯、节奏合槌、折剪展读——用交互建立记忆，而不是只读长文。</p>
          </article>
          <article className="claim-card">
            <h3>可核来源</h3>
            <p>文化页提供快速回答、FAQ 与外链来源，并区分常见说法、口头传统与游戏设计。</p>
          </article>
        </div>
      </section>

      <section className="site-section" aria-labelledby="how-title">
        <SectionHeader index="〇三" eyebrow="怎么玩" title="摄像头可选，点击也能完成" />
        <h2 id="how-title" className="visually-hidden">
          游玩方式
        </h2>
        <div className="claim-grid">
          <article className="claim-card">
            <h3>即开即玩</h3>
            <p>静态站点，无需安装。部分展品支持手势，默认也可用按钮。</p>
          </article>
          <article className="claim-card">
            <h3>隐私默认</h3>
            <p>摄像头画面仅在本地浏览器处理；不需要时请直接关闭权限。</p>
          </article>
          <article className="claim-card">
            <h3>读完再深</h3>
            <p>
              玩过之后，可从{' '}
              <Link href="/culture/" style={{ color: 'var(--c-cyan)', textDecoration: 'underline' }}>
                文化馆
              </Link>{' '}
              进入枢纽与专题页。
            </p>
          </article>
        </div>
      </section>

      <section className="site-section" aria-labelledby="trust-title">
        <SectionHeader index="〇四" eyebrow="文化可信" title="娱乐展示，不作人生裁决" />
        <h2 id="trust-title" className="visually-hidden">
          信任与声明
        </h2>
        <p style={{ maxWidth: '38rem', lineHeight: 1.8, color: 'var(--c-ink-muted)', margin: '0 0 1.5rem' }}>
          {SITE_DISCLAIMER}
        </p>
        <TrustStrip />
      </section>

      <SiteFooter />
    </div>
  );
}
