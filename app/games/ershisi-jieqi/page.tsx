import type { Metadata } from 'next';
import Link from 'next/link';

import { JieqiGame } from '@/games/ershisi-jieqi/JieqiGame';
import { getCulturePage } from '@/content/culture/registry';
import { buildFaqJsonLd } from '@/core/seo/jsonld';

const PAGE_URL = 'https://game.rexai.top/games/ershisi-jieqi/';
const COVER_URL = 'https://game.rexai.top/assets/jieqi/cover.svg';
const hub = getCulturePage('jieqi');

export const metadata: Metadata = {
  title: '二十四节气 · 农时拼图｜排序、物候配对与节气问答',
  description:
    '跟着太阳走完一年：时序排序认识二十四节气，翻牌配对物候，农事问答巩固常识。浏览器即开即玩的民俗文化小游戏，含节气图鉴与本地进度。',
  keywords: [
    '二十四节气',
    '节气游戏',
    '农时',
    '物候',
    '立春',
    '冬至',
    '春分',
    '秋分',
    '非遗',
    '传统文化',
    'HTML5游戏',
    '农时拼图',
  ],
  openGraph: {
    title: '二十四节气 · 农时拼图',
    description: '排序、配对、问答，把一年拆成 24 段可玩的时间。',
    url: PAGE_URL,
    type: 'website',
    images: [{ url: COVER_URL, width: 1200, height: 630, alt: '二十四节气·农时拼图主视觉' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '二十四节气 · 农时拼图',
    description: '排序、配对、问答，把一年拆成 24 段可玩的时间。',
    images: [COVER_URL],
  },
  alternates: { canonical: '/games/ershisi-jieqi/' },
};

const faq = hub?.faq ?? [
  {
    question: '二十四节气是什么？',
    answer:
      '二十四节气是中国古人根据太阳在黄道上的位置，把一年划分为 24 个时间节点的知识体系，用于指导农事与生活节律。',
  },
  {
    question: '游戏能替代历书吗？',
    answer: '不能。本作是文化互动教学，公历日期为约数，物候与农事为通识再创作，非正式天文历书。',
  },
];

export default function ErshisiJieqiPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'VideoGame',
        name: '二十四节气 · 农时拼图',
        url: PAGE_URL,
        image: COVER_URL,
        description:
          '浏览器节气文化游戏：时序排序、物候翻牌配对、农事问答，并附二十四节气图鉴。',
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
        name: '二十四节气在线互动与文化说明',
        inLanguage: 'zh-CN',
        dateModified: '2026-07-25',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'rex-game', item: 'https://game.rexai.top/' },
          { '@type': 'ListItem', position: 2, name: '二十四节气', item: PAGE_URL },
        ],
      },
      buildFaqJsonLd(faq),
    ],
  };

  return (
    <main className="jq-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <JieqiGame />

      <article className="jq-guide">
        <div className="jq-guide__inner">
          <div className="jq-guide__rail">
            <p className="jq-guide__label">文化说明</p>
            <h2>二十四节气怎样划分一年</h2>
            <p>
              二十四节气依据太阳周年运动划分时间，用来观察季节变化并安排农事。游戏先帮助你记住先后顺序，再通过物候和问答补充常识。
            </p>
            <Link href="/culture/jieqi/">查看完整文化导读</Link>
          </div>

          <div className="jq-guide__grid">
            <section>
              <h3>游戏规则</h3>
              <ol>
                <li>
                  <strong>时序排序</strong><span>按春夏秋冬或全年，把节气放回正确顺序。</span>
                </li>
                <li>
                  <strong>物候配对</strong><span>翻牌连接节气名与代表物候，如立春与东风解冻。</span>
                </li>
                <li>
                  <strong>节气问答</strong><span>8 题小考，答完看讲解，顺便点亮图鉴。</span>
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

          <p className="jq-guide__note">
            娱乐与公共教育展示，不作人生裁决；日期为约数，细节因地域而异。资料口径见文化导读页来源列表。
          </p>
        </div>
      </article>

      <style>{`
        .jq-page {
          min-height: 100dvh;
          background: #f4f5ef;
        }
        .jq-guide {
          padding: clamp(3.5rem, 8vw, 6.5rem) 1rem;
          color: #626b64;
          border-top: 1px solid #c8cec6;
          background: #eaede6;
          line-height: 1.75;
        }
        .jq-guide__inner {
          width: min(100%, 1180px);
          margin: 0 auto;
        }
        .jq-guide h2, .jq-guide h3 {
          color: #202622;
          font-family: 'Noto Serif SC', 'Songti SC', serif;
          font-weight: 600;
        }
        .jq-guide__rail {
          display: grid;
          grid-template-columns: 11rem minmax(0, 1fr);
          gap: 0.75rem 3rem;
          padding-bottom: clamp(2.5rem, 6vw, 4.5rem);
          border-bottom: 2px solid #202622;
        }
        .jq-guide__label {
          grid-row: 1 / span 3;
          margin: 0.35rem 0 0;
          color: #a83d35;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.12em;
        }
        .jq-guide__rail h2 {
          max-width: 20em;
          margin: 0;
          font-size: clamp(1.8rem, 4vw, 3rem);
          letter-spacing: 0.02em;
          line-height: 1.35;
        }
        .jq-guide__rail > p:not(.jq-guide__label) {
          max-width: 44rem;
          margin: 0;
        }
        .jq-guide__rail a {
          justify-self: start;
          margin-top: 0.5rem;
          color: #202622;
          border-bottom: 1px solid currentColor;
          text-decoration: none;
          font-weight: 700;
        }
        .jq-guide__rail a:hover {
          color: #a83d35;
        }
        .jq-guide__grid {
          display: grid;
          grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
          gap: 0;
          padding-top: clamp(2.5rem, 6vw, 4.5rem);
        }
        .jq-guide__grid > section {
          padding-right: clamp(2rem, 6vw, 5rem);
        }
        .jq-guide__grid > section + section {
          padding-right: 0;
          padding-left: clamp(2rem, 6vw, 5rem);
          border-left: 1px solid #c8cec6;
        }
        .jq-guide h3 {
          margin: 0 0 1.5rem;
          font-size: 1.3rem;
        }
        .jq-guide ol {
          display: grid;
          gap: 0;
          margin: 0;
          padding: 0 0 0 1.2rem;
        }
        .jq-guide li {
          display: grid;
          gap: 0.2rem;
          padding: 0.85rem 0;
          border-top: 1px solid #c8cec6;
        }
        .jq-guide li strong {
          color: #202622;
        }
        .jq-guide li span {
          color: #626b64;
        }
        .jq-guide dl {
          margin: 0;
        }
        .jq-guide dl div {
          padding: 0.9rem 0;
          border-top: 1px solid #c8cec6;
        }
        .jq-guide dt {
          color: #202622;
          font-weight: 700;
        }
        .jq-guide dd {
          margin: 0.45rem 0 0;
        }
        .jq-guide__note {
          margin: 3rem 0 0;
          padding-top: 1.25rem;
          color: #7b847d;
          border-top: 1px solid #c8cec6;
          font-size: 0.78rem;
        }
        @media (max-width: 720px) {
          .jq-guide__rail,
          .jq-guide__grid {
            grid-template-columns: minmax(0, 1fr);
          }
          .jq-guide__rail {
            gap: 1rem;
          }
          .jq-guide__label {
            grid-row: auto;
          }
          .jq-guide__grid {
            gap: 3rem;
          }
          .jq-guide__grid > section,
          .jq-guide__grid > section + section {
            padding: 0;
            border-left: 0;
          }
        }
      `}</style>
    </main>
  );
}
