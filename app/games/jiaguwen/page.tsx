import type { Metadata } from 'next';
import { CultureLink } from '@/components/site/CultureLink';
import { JiaguGame } from '@/games/jiaguwen/JiaguGame';
import { getCulturePage } from '@/content/culture/registry';
import { buildFaqJsonLd } from '@/core/seo/jsonld';

const PAGE_URL = 'https://game.rexai.top/games/jiaguwen/';
const COVER_URL = 'https://game.rexai.top/assets/jiaguwen/cover.svg';
const hub = getCulturePage('jiagu');

export const metadata: Metadata = {
  title: '甲骨问契 · 字与卜｜辨形、契意、卜辞填空',
  description:
    '从象形的甲骨线条里认出 24 个常用甲骨字，再通过短卜辞理解「古人为什么要问」。浏览器即开即玩的文字文化小游戏，含字图鉴与本地进度。',
  keywords: [
    '甲骨文',
    '甲骨文字',
    '甲骨文游戏',
    '字与卜',
    '甲骨问契',
    '占卜',
    '殷墟',
    '汉字起源',
    '非遗',
    '传统文化',
    'HTML5游戏',
  ],
  openGraph: {
    title: '甲骨问契 · 字与卜',
    description: '辨形象、选字义、读卜辞——亲手摸到刻在骨头上的字。',
    url: PAGE_URL,
    type: 'website',
    images: [{ url: COVER_URL, width: 1200, height: 630, alt: '甲骨问契·字与卜主视觉' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '甲骨问契 · 字与卜',
    description: '辨形象、选字义、读卜辞——亲手摸到刻在骨头上的字。',
    images: [COVER_URL],
  },
  alternates: { canonical: '/games/jiaguwen/' },
};

const faq = hub?.faq ?? [
  {
    question: '甲骨文是什么？',
    answer:
      '甲骨文是商代晚期刻写在龟甲和兽骨上的文字遗存，多与王事占卜、祭祀、田猎、气象等有关，是汉字已知最早成体系的形态之一。',
  },
  {
    question: '游戏里的甲骨字形是文物原片吗？',
    answer:
      '不是。本站字形为基于通识教材与公开图录绘制的几何化教学示意，便于初学者理解象形关系，不替代博物馆拓片或学术摹本。',
  },
];

export default function JiaguwenPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'VideoGame',
        name: '甲骨问契 · 字与卜',
        url: PAGE_URL,
        image: COVER_URL,
        description:
          '浏览器甲骨文文化游戏：辨形象配对、选字义、读卜辞填空，并附 24 字甲骨图鉴。',
        genre: ['Puzzle', 'Educational game', 'Cultural game'],
        gamePlatform: ['Web browser'],
        inLanguage: 'zh-CN',
        applicationCategory: 'Game',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
      },
      {
        '@type': 'WebPage',
        '@id': `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: '甲骨文在线互动与文化说明',
        inLanguage: 'zh-CN',
        dateModified: '2026-07-26',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'rex-game', item: 'https://game.rexai.top/' },
          { '@type': 'ListItem', position: 2, name: '甲骨问契', item: PAGE_URL },
        ],
      },
      buildFaqJsonLd(faq),
    ],
  };

  return (
    <main className="jg-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <JiaguGame />

      <article className="jg-guide">
        <div className="jg-guide__inner">
          <div className="jg-guide__rail">
            <p className="jg-guide__label">文化说明</p>
            <h2>甲骨文为什么是「问出来的字」</h2>
            <p>
              商代人先灼烧甲骨，观察裂纹以判断吉凶，再把问的内容刻在骨片上。因此甲骨文里不仅有象形字，也保留了大量「贞：……？」的问句格式。字义与卜事缠绕在一起，是最早期的文字应用场景之一。
            </p>
            <CultureLink from="jiaguwen" href="/culture/jiagu/">
              查看完整文化导读
            </CultureLink>
          </div>

          <div className="jg-guide__grid">
            <section>
              <h3>游戏规则</h3>
              <ol>
                <li>
                  <strong>今日三契</strong>
                  <span>一局串起辨形、契意、卜辞，适合初次体验。</span>
                </li>
                <li>
                  <strong>辨形配对</strong>
                  <span>翻牌把甲骨字形与对应汉字连起来。</span>
                </li>
                <li>
                  <strong>契意三选一</strong>
                  <span>看形象，从三个义项里选出最贴合的。</span>
                </li>
                <li>
                  <strong>卜辞填空</strong>
                  <span>读一句短卜辞，从甲骨字形里补上缺的字。</span>
                </li>
              </ol>
            </section>

            <section>
              <h3>常见问题</h3>
              <dl>
                {faq.map((item) => (
                  <div key={item.question}>
                    <dt>{item.question}</dt>
                    <dd>{item.answer}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>

          <p className="jg-guide__note">
            本站内容为公共教育展示，甲骨字形为教学示意；若需学术引用，请核对正式考古报告与博物馆公开图录。
          </p>
        </div>
      </article>

      <style>{`
        .jg-page {
          min-height: 100dvh;
          background: #f5f3ed;
        }
        .jg-guide {
          padding: clamp(3.5rem, 8vw, 6.5rem) 1rem;
          color: #5c554d;
          border-top: 1px solid #d6d0c4;
          background: #e8e4da;
          line-height: 1.75;
        }
        .jg-guide__inner {
          width: min(100%, 1180px);
          margin: 0 auto;
        }
        .jg-guide h2, .jg-guide h3 {
          color: #3a3530;
          font-family: 'Noto Serif SC', 'Songti SC', serif;
          font-weight: 600;
        }
        .jg-guide__rail {
          display: grid;
          grid-template-columns: 11rem minmax(0, 1fr);
          gap: 0.75rem 3rem;
          padding-bottom: clamp(2.5rem, 6vw, 4.5rem);
          border-bottom: 2px solid #3a3530;
        }
        .jg-guide__label {
          grid-row: 1 / span 3;
          margin: 0.35rem 0 0;
          color: #a03028;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.12em;
        }
        .jg-guide__rail h2 {
          max-width: 20em;
          margin: 0;
          font-size: clamp(1.8rem, 4vw, 3rem);
          letter-spacing: 0.02em;
          line-height: 1.35;
        }
        .jg-guide__rail > p:not(.jg-guide__label) {
          max-width: 44rem;
          margin: 0;
        }
        .jg-guide__rail a {
          justify-self: start;
          margin-top: 0.5rem;
          color: #3a3530;
          border-bottom: 1px solid currentColor;
          text-decoration: none;
          font-weight: 700;
        }
        .jg-guide__rail a:hover {
          color: #a03028;
        }
        .jg-guide__grid {
          display: grid;
          grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
          gap: 0;
          padding-top: clamp(2.5rem, 6vw, 4.5rem);
        }
        .jg-guide__grid > section {
          padding-right: clamp(2rem, 6vw, 5rem);
        }
        .jg-guide__grid > section + section {
          padding-right: 0;
          padding-left: clamp(2rem, 6vw, 5rem);
          border-left: 1px solid #d6d0c4;
        }
        .jg-guide h3 {
          margin: 0 0 1.5rem;
          font-size: 1.3rem;
        }
        .jg-guide ol {
          display: grid;
          gap: 0;
          margin: 0;
          padding: 0 0 0 1.2rem;
        }
        .jg-guide li {
          display: grid;
          gap: 0.2rem;
          padding: 0.85rem 0;
          border-top: 1px solid #d6d0c4;
        }
        .jg-guide li strong {
          color: #3a3530;
        }
        .jg-guide li span {
          color: #5c554d;
        }
        .jg-guide dl {
          margin: 0;
        }
        .jg-guide dl div {
          padding: 0.9rem 0;
          border-top: 1px solid #d6d0c4;
        }
        .jg-guide dt {
          color: #3a3530;
          font-weight: 700;
        }
        .jg-guide dd {
          margin: 0.45rem 0 0;
        }
        .jg-guide__note {
          margin: 3rem 0 0;
          padding-top: 1.25rem;
          color: #7a7268;
          border-top: 1px solid #d6d0c4;
          font-size: 0.78rem;
        }
        @media (max-width: 720px) {
          .jg-guide__rail,
          .jg-guide__grid {
            grid-template-columns: minmax(0, 1fr);
          }
          .jg-guide__rail {
            gap: 1rem;
          }
          .jg-guide__label {
            grid-row: auto;
          }
          .jg-guide__grid {
            gap: 3rem;
          }
          .jg-guide__grid > section,
          .jg-guide__grid > section + section {
            padding: 0;
            border-left: 0;
          }
        }
      `}</style>
    </main>
  );
}
