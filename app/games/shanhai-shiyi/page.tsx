import type { Metadata } from 'next';

import { ShanhaiGame } from '@/games/shanhai-shiyi/ShanhaiGame';
import { SITE_DISCLAIMER } from '@/content/site';

const PAGE_URL = 'https://game.rexai.top/games/shanhai-shiyi/';
const COVER_URL = 'https://game.rexai.top/assets/shanhai/cover.webp';

export const metadata: Metadata = {
  title: '山海拾遗｜修器物，读懂中国故事',
  description:
    '公益文化互动：在浏览器里修复青铜鼎、认识礼器与纹样，阅读有出处的文化卡片。无登录、无商城，边玩边了解传统文化。',
  keywords: [
    '山海拾遗',
    '传统文化',
    '青铜器',
    '礼器',
    '文化游戏',
    '博物馆',
    '山海经',
    '公益',
    '非遗教育',
    'HTML5',
  ],
  openGraph: {
    title: '山海拾遗｜修一件器物，读懂一段中国故事',
    description: '动手修复 · 阅读典故 · 收入藏馆。公益 Web 文化展，无需登录。',
    url: PAGE_URL,
    type: 'website',
    images: [{ url: COVER_URL, width: 1200, height: 630, alt: '山海拾遗主视觉' }],
  },
  alternates: { canonical: '/games/shanhai-shiyi/' },
};

export default function ShanhaiShiyiPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: '山海拾遗',
        url: PAGE_URL,
        image: COVER_URL,
        description:
          '公益向浏览器文化互动：通过修复与阅读了解中国古代器物、礼制印象与纹样知识。',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web browser',
        isAccessibleForFree: true,
        inLanguage: 'zh-CN',
      },
      {
        '@type': 'WebPage',
        '@id': `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: '山海拾遗：修器物学文化',
        inLanguage: 'zh-CN',
      },
    ],
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ShanhaiGame />
      <article className="sh-guide" style={{ maxWidth: 720, margin: '0 auto 3rem', padding: '0 1rem' }}>
        <h2 style={{ fontFamily: 'serif' }}>这是什么？</h2>
        <p style={{ lineHeight: 1.75 }}>
          《山海拾遗》把「修一件器物」做成可动手的数字文化展：你拼合器形或辨认概念，再读一张写清出处的文化卡片。目标不是抽卡养成，而是<strong>多了解一点传统文化</strong>。
        </p>
        <h2 style={{ fontFamily: 'serif' }}>当前可体验</h2>
        <ul style={{ lineHeight: 1.75 }}>
          <li>展区：中原·楚地·巴蜀·江南·塞北·仙山·岁时·海丝</li>
          <li>约 166 张文化卡；岁时专题 + 山海经想象 + 海上丝路</li>
          <li>山海册筛选、本地藏馆、进度导出</li>
        </ul>
        <p style={{ lineHeight: 1.75, opacity: 0.85 }}>{SITE_DISCLAIMER}</p>
        <p style={{ lineHeight: 1.75, opacity: 0.85 }}>
          史证类条目为通识再创作展示，便于学习器形与概念；正式展览与考古结论以博物馆与学术发布为准。
        </p>
      </article>
    </main>
  );
}
