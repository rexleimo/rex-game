import type { Metadata } from 'next';
import { ShanhaiWenshouGame } from '@/games/shanhai-wenshou/ShanhaiWenshouGame';

const PAGE_URL = 'https://game.rexai.top/games/shanhai-wenshou/';
const COVER_URL = 'https://game.rexai.top/assets/shanhai-wenshou/cover.svg';

export const metadata: Metadata = {
  title: '山海问兽 · 南山经问兽之旅｜横版动作 RPG',
  description:
    '一部可以玩的《山海经·南山经》：横版动作闯过鹊山首脉十座山，读招、识破三印、问名收服异兽，或了断取材行祭礼。键鼠触屏双操作，浏览器即开即玩，进度只存本机。',
  keywords: [
    '山海经',
    '山海经游戏',
    '南山经',
    '异兽图鉴',
    '动作RPG',
    '横版动作',
    '弹反',
    '网页游戏',
    '传统文化游戏',
    '九尾狐',
    '神话游戏',
    'HTML5游戏',
  ],
  openGraph: {
    title: '山海问兽 · 南山经问兽之旅',
    description: '十座山，十三种异兽，一篇祭礼——以杖问兽，以名定形，读招识破走完《南山经》第一脉。',
    url: PAGE_URL,
    type: 'website',
    images: [{ url: COVER_URL, width: 1200, height: 630, alt: '山海问兽主视觉' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '山海问兽 · 南山经问兽之旅',
    description: '十座山，十三种异兽，一篇祭礼——以杖问兽，以名定形，读招识破走完《南山经》第一脉。',
    images: [COVER_URL],
  },
  alternates: { canonical: '/games/shanhai-wenshou/' },
};

const faq = [
  {
    question: '山海问兽是什么游戏？',
    answer:
      '一款以《山海经·南山经》为蓝本的横版动作 RPG。你沿鹊山首脉从招摇之山走到箕尾之山加失载的第十山，实时走位、翻滚、弹反与异兽过招；看预备动作读招，集齐形/声/性三印、压低兽血后「问名」即可收服它同行，或了断取材。',
  },
  {
    question: '游戏里的异兽和引文可靠吗？',
    answer:
      '十三种异兽的原文引文、白话直译与功效（食之／佩之）均逐字取自《山海经·南山经》鹊山首脉；山川、水系与篇末祭祀礼同样照录原文，每山知识机关门的门额即原文锚。「狂化」「瘴化」等设定为游戏化演绎，游戏内已明确标注。',
  },
  {
    question: '不打暴力行不行？',
    answer:
      '问兽的功课是「识其性，不惧其名」。读招弹反攒三印即可问名收服，了断只为取材；倒下会回到最近山祠歇脚，无死亡惩罚。驯多杀少，山望更高，终章按驯向与山望进入三款差分结局。',
  },
  {
    question: '进度会保存吗？要下载吗？',
    answer:
      '无需下载、无需登录，浏览器打开即玩，键鼠与触屏双操作，简明/标准/辅助三档难度。进度、图鉴与兽伴只保存在本机浏览器（localStorage），不上传任何数据；通关后可开二周目重问十山。',
  },
];

export default function ShanhaiWenshouPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'VideoGame',
        name: '山海问兽',
        url: PAGE_URL,
        image: COVER_URL,
        description:
          '横版动作问兽 RPG：沿《山海经·南山经》首脉走完十座山，读招识破、问名收服、祭礼走山，完成祭山大典。',
        genre: ['RPG', 'Educational game', 'Cultural game'],
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
        name: '山海问兽 · 南山经问兽之旅',
        inLanguage: 'zh-CN',
        dateModified: '2026-09-05',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'rex-game', item: 'https://game.rexai.top/' },
          { '@type': 'ListItem', position: 2, name: '山海问兽', item: PAGE_URL },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  };

  return (
    <main className="ws-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ShanhaiWenshouGame />

      <article className="ws-guide">
        <div className="ws-guide__inner">
          <div className="ws-guide__rail">
            <p className="ws-guide__label">文化说明</p>
            <h2>《南山经》本身就是一条向东的巡山路</h2>
            <p>
              《南山经》首脉以「又东三百里」「又东三百八十里」串联十座山——原文的叙事结构就是一次行旅。本作把这条路线原样搬进游戏：每座山的引文逐字照录，异兽的「食之」「佩之」功效成为道具与佩饰系统，篇末「其祠之礼」成为终章的祭山大典。原文说「凡十山」，有名可考者九——第十山的失载，被写成了游戏的终章。
            </p>
          </div>
          <div className="ws-guide__grid">
            <section>
              <h3>玩法循环</h3>
              <ol>
                <li>
                  <strong>探索山野</strong>
                  <span>五拍过一山：山脚村听闻，采集径备草木金玉，变奏段走水攀崖，精英门前迎战。</span>
                </li>
                <li>
                  <strong>读招识破</strong>
                  <span>看红闪听声兆，弹反攒形/声/性三印；每山一道原文知识机关门，不答题，照着原文做即过。</span>
                </li>
                <li>
                  <strong>收服编队</strong>
                  <span>三印齐 plus 兽血低于两成半，按 Q 问名收服；或了断取材炼佩饰，最多三只兽伴同行。</span>
                </li>
                <li>
                  <strong>祭礼走山</strong>
                  <span>打过山主行三献祭礼，此山才算走完；十山之后是祭山大典与差分结局，通关开二周目。</span>
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
          <p className="ws-guide__note">
            引文出《山海经·南山经》（鹊山首脉），白话为帮助理解的直译；「狂化」「瘴化」等战斗设定为游戏化演绎。若需学术引用，请核对上海古籍出版社等正式整理本。
          </p>
        </div>
      </article>

      <style>{`
        .ws-page { min-height: 100dvh; background: #17100b; }
        .ws-guide {
          padding: clamp(3.5rem, 8vw, 6.5rem) 1rem;
          color: rgba(244, 236, 216, 0.72);
          border-top: 1px solid rgba(201, 162, 75, 0.35);
          background: #12100c;
          line-height: 1.75;
        }
        .ws-guide__inner { width: min(100%, 1180px); margin: 0 auto; }
        .ws-guide h2, .ws-guide h3 {
          color: #f4ecd8;
          font-family: 'Noto Serif SC', 'Songti SC', serif;
          font-weight: 600;
        }
        .ws-guide__rail {
          display: grid;
          grid-template-columns: 11rem minmax(0, 1fr);
          gap: 0.75rem 3rem;
          padding-bottom: clamp(2.5rem, 6vw, 4.5rem);
          border-bottom: 2px solid rgba(201, 162, 75, 0.5);
        }
        .ws-guide__label {
          grid-row: 1 / span 3;
          margin: 0.35rem 0 0;
          color: #e4c479;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.12em;
        }
        .ws-guide__rail h2 {
          max-width: 20em;
          margin: 0;
          font-size: clamp(1.8rem, 4vw, 3rem);
          letter-spacing: 0.02em;
          line-height: 1.35;
        }
        .ws-guide__rail > p:not(.ws-guide__label) { max-width: 44rem; margin: 0; }
        .ws-guide__grid {
          display: grid;
          grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
          padding-top: clamp(2.5rem, 6vw, 4.5rem);
        }
        .ws-guide__grid > section { padding-right: clamp(2rem, 6vw, 5rem); }
        .ws-guide__grid > section + section {
          padding-right: 0;
          padding-left: clamp(2rem, 6vw, 5rem);
          border-left: 1px solid rgba(244, 236, 216, 0.18);
        }
        .ws-guide h3 { margin: 0 0 1.5rem; font-size: 1.3rem; }
        .ws-guide ol { display: grid; gap: 0; margin: 0; padding: 0 0 0 1.2rem; }
        .ws-guide li { display: grid; gap: 0.2rem; padding: 0.85rem 0; border-top: 1px solid rgba(244, 236, 216, 0.14); }
        .ws-guide li strong { color: #f4ecd8; }
        .ws-guide li span { color: rgba(244, 236, 216, 0.66); }
        .ws-guide dl { margin: 0; }
        .ws-guide dl div { padding: 0.9rem 0; border-top: 1px solid rgba(244, 236, 216, 0.14); }
        .ws-guide dt { color: #f4ecd8; font-weight: 700; }
        .ws-guide dd { margin: 0.45rem 0 0; }
        .ws-guide__note {
          margin: 3rem 0 0;
          padding-top: 1.25rem;
          color: rgba(244, 236, 216, 0.45);
          border-top: 1px solid rgba(244, 236, 216, 0.14);
          font-size: 0.78rem;
        }
        @media (max-width: 720px) {
          .ws-guide__rail, .ws-guide__grid { grid-template-columns: minmax(0, 1fr); }
          .ws-guide__rail { gap: 1rem; }
          .ws-guide__label { grid-row: auto; }
          .ws-guide__grid > section { padding: 0; border-left: 0; }
          .ws-guide__grid > section + section { margin-top: 2.5rem; }
        }
      `}</style>
    </main>
  );
}
