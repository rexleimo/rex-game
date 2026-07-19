import type { Metadata } from 'next';
import Link from 'next/link';

import { JianzhiGame } from '@/games/jianzhi/JianzhiGame';
import { getCulturePage } from '@/content/culture/registry';
import { buildFaqJsonLd } from '@/core/seo/jsonld';
import { SITE_DISCLAIMER } from '@/content/site';

const PAGE_URL = 'https://game.rexai.top/games/jianzhi/';
const COVER_URL = 'https://game.rexai.top/assets/jianzhi/cover.svg';
const hub = getCulturePage('jianzhi')!;

export const metadata: Metadata = {
  title: '纸上生花｜学徒工坊 · 中国剪纸',
  description:
    '跟纸灵学徒：在学徒工坊里读帖、折剪、展开读懂吉语。七课线性功课，亲手把纹样拼成一句吉话——莲配鱼是连年有余，蝠配桃是福寿双全。学「看图说吉话」的谐音与象征，边玩边学的非遗小游戏。',
  keywords: [
    '中国剪纸',
    '剪纸游戏',
    '非遗游戏',
    '学徒工坊',
    '折剪展读',
    '窗花',
    '团花',
    '看图说吉话',
    '谐音吉语',
    '连年有余',
    '传统文化',
    'HTML5游戏',
    '纸上生花',
  ],
  openGraph: {
    title: '纸上生花｜学徒工坊 · 中国剪纸',
    description: '读帖、折剪、展开——在学徒工坊里学「看图说吉话」，把纹样读成吉语。',
    url: PAGE_URL,
    type: 'website',
    images: [{ url: COVER_URL, width: 1200, height: 630, alt: '纸上生花：中国剪纸学徒工坊主视觉' }],
  },
  alternates: { canonical: '/games/jianzhi/' },
};

export default function JianzhiPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'VideoGame',
        name: '纸上生花：学徒工坊',
        url: PAGE_URL,
        image: COVER_URL,
        description:
          '以学徒工坊为核心的浏览器剪纸游戏：读帖识源流，折剪展读见对称，拼纹样读懂「看图说吉话」的谐音与象征。',
        genre: ['Puzzle', 'Educational game', 'Cultural game'],
        gamePlatform: ['Web browser', 'PWA'],
        inLanguage: 'zh-CN',
        applicationCategory: 'Game',
        isAccessibleForFree: true,
      },
      {
        '@type': 'WebPage',
        '@id': `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: '中国剪纸在线体验与文化说明',
        inLanguage: 'zh-CN',
      },
      buildFaqJsonLd(hub.faq),
    ],
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <JianzhiGame />
      <article className="jz-guide">
        <div className="jz-guide__rail">
          <p>快速回答</p>
          <h2>剪纸，是一门「看图说吉话」的语言</h2>
          <div>
            {hub.quickAnswer.map((sentence) => (
              <p key={sentence.slice(0, 24)}>{sentence}</p>
            ))}
            <p>
              <Link href="/culture/jianzhi/">阅读完整文化枢纽 →</Link>
              {' · '}
              <Link href="/culture/jianzhi/fold-and-cut/">对称折剪</Link>
              {' · '}
              <Link href="/culture/jianzhi/auspicious-motifs/">吉祥纹样</Link>
            </p>
          </div>
        </div>
        <div className="jz-guide__notice">
          <strong>常见问题</strong>
          <dl>
            {hub.faq.map((item) => (
              <div key={item.question}>
                <dt>{item.question}</dt>
                <dd>{item.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="jz-guide__notice">
          <strong>文化呈现原则</strong>
          <ul>
            <li>
              吉语组合基于民间通行的谐音与象征（莲=连、鱼=余、蝠=福、囍=双喜），成句原理逐条标注，分级为资料记载
              / 民间流传 / 游戏化演绎。
            </li>
            <li>南北流派、丝路团花等说法并列介绍，不宣称某一地版本代表全部剪纸。</li>
            <li>游戏是宣传与学习的入口，正式纹样与史料以中国非物质文化遗产网等权威来源为准。</li>
          </ul>
          <p>{SITE_DISCLAIMER}</p>
        </div>
      </article>
    </main>
  );
}
