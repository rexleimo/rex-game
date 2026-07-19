import type { Metadata } from 'next';

import { JianzhiGame } from '@/games/jianzhi/JianzhiGame';

const PAGE_URL = 'https://game.rexai.top/games/jianzhi/';
const COVER_URL = 'https://game.rexai.top/assets/jianzhi/cover.svg';

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
};

export default function JianzhiPage() {
  const structuredData = {
    '@context': 'https://schema.org',
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
          <h2>剪纸，是一门「看图说吉话」的语言</h2>
          <div>
            <p>
              剪纸是用剪刀或刻刀在纸上镂空造型的民间艺术。它的前身是早于纸张的金银箔镂空；东汉蔡伦改进造纸后，人们才把祈愿剪进薄薄的纸里。
              新疆吐鲁番阿斯塔那古墓出土的北朝「对马」「对猴」团花，是现存最早的剪纸实物。
            </p>
            <p>
              剪纸真正的底蕴，不在单个纹样，而在它们如何被拼成一句祝福：莲谐「连」、鱼谐「余」，一莲一鱼便是<strong>连年有余</strong>；蝠谐「福」、桃象征「寿」，合起来就是<strong>福寿双全</strong>。
              古人用谐音与象征，把说不出口的心愿，剪成看得见的句子——这就是「看图说吉话」。
            </p>
            <p>
              本作把你放进<strong>学徒工坊</strong>：跟纸灵<strong>读帖</strong>识源流与技法，再在工坊里<strong>折 → 剪 → 展</strong>（折剪展读），把纹样<strong>拼</strong>成目标吉语。
              纹样一凑齐，揭晓层点破成句原理；课后理解题把谐音或象征讲透。出师后可接时令委托，拼成的吉话都会收进图鉴。
            </p>
          </div>
        </div>
        <div className="jz-guide__notice">
          <strong>文化呈现原则</strong>
          <ul>
            <li>吉语组合基于民间通行的谐音与象征（莲=连、鱼=余、蝠=福、囍=双喜），成句原理逐条标注，分级为资料记载 / 民间流传 / 游戏化演绎。</li>
            <li>南北流派、丝路团花等说法并列介绍，不宣称某一地版本代表全部剪纸。</li>
            <li>游戏是宣传与学习的入口，正式纹样与史料以中国非物质文化遗产网等权威来源为准。</li>
          </ul>
        </div>
      </article>
    </main>
  );
}
