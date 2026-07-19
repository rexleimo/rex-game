import type { Metadata } from 'next';
import Link from 'next/link';

import { YinggeGame } from '@/games/chaoshan-yingge/YinggeGame';
import styles from '@/games/chaoshan-yingge/YinggeGame.module.css';
import { getCulturePage } from '@/content/culture/registry';
import { buildFaqJsonLd } from '@/core/seo/jsonld';
import { SITE_DISCLAIMER } from '@/content/site';

const PAGE_URL = 'https://game.rexai.top/games/chaoshan-yingge/';
const COVER_URL = 'https://game.rexai.top/assets/yingge/cover.svg';
const hub = getCulturePage('yingge')!;

export const metadata: Metadata = {
  title: '潮汕英歌横版动作游戏｜战舞传说',
  description:
    '在浏览器中带领英歌队巡游前进，以棍舞近战、队形切换和节奏奖励击散瘴气阻障，体验潮汕英歌的群体气势。了解锣鼓、队形与文化边界。',
  keywords: ['潮汕英歌', '英歌舞', '潮阳英歌', '普宁英歌', '非遗游戏', '横版动作游戏', 'HTML5游戏'],
  openGraph: {
    title: '战舞传说｜潮汕英歌横版动作游戏',
    description: '战舞开路，合槌成阵。用自由格斗、节奏奖励与队形协同认识潮汕英歌。',
    url: PAGE_URL,
    type: 'website',
    images: [{ url: COVER_URL, width: 1200, height: 630, alt: '潮汕英歌横版动作游戏战舞传说主视觉' }],
  },
  alternates: { canonical: '/games/chaoshan-yingge/' },
};

export default function ChaoshanYinggePage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'VideoGame',
        name: '合槌成阵：潮汕英歌',
        url: PAGE_URL,
        image: COVER_URL,
        description: '以英歌槌法近战、横向巡游、队形协同和非强制节奏奖励为核心的浏览器动作游戏。',
        genre: ['Side-scrolling action game', 'Beat em up', 'Cultural game'],
        gamePlatform: ['Web browser', 'PWA'],
        inLanguage: 'zh-CN',
        applicationCategory: 'Game',
        isAccessibleForFree: true,
      },
      {
        '@type': 'WebPage',
        '@id': `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: '潮汕英歌在线体验与文化说明',
        inLanguage: 'zh-CN',
      },
      buildFaqJsonLd(hub.faq),
    ],
  };

  return (
    <main className={styles.root}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <YinggeGame />
      <article className="yingge-guide">
        <div className="yingge-guide__rail">
          <p>快速回答</p>
          <h2>什么是潮汕英歌？</h2>
          <div>
            {hub.quickAnswer.map((sentence) => (
              <p key={sentence.slice(0, 24)}>{sentence}</p>
            ))}
            <p>
              <Link href="/culture/yingge/">阅读完整文化枢纽 →</Link>
              {' · '}
              <Link href="/culture/yingge/rhythm-and-formation/">鼓点与队形</Link>
              {' · '}
              <Link href="/culture/yingge/faces-and-roles/">脸谱与角色</Link>
            </p>
          </div>
        </div>
        <div className="yingge-guide__notice">
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
        <div className="yingge-guide__notice">
          <strong>文化呈现原则</strong>
          <ul>
            <li>主线以学艺、排练、巡游与会演为叙事；敌对形象仅表现抽象瘴气和阻障，不把真实神祇当作普通敌人。</li>
            <li>资料记载、民间流传和游戏化演绎分别标识。</li>
            <li>不同地方版本并列介绍，不宣称某一种版本代表全部英歌。</li>
          </ul>
          <p>{SITE_DISCLAIMER}</p>
        </div>
      </article>
    </main>
  );
}
