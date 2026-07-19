import type { Metadata } from 'next';

import { JianzhiGame } from '@/games/jianzhi/JianzhiGame';

const PAGE_URL = 'https://game.rexai.top/games/jianzhi/';
const COVER_URL = 'https://game.rexai.top/assets/jianzhi/cover.svg';

export const metadata: Metadata = {
  title: '纸上生花｜中国剪纸文化游戏',
  description:
    '在浏览器里折、剪、拼、展，亲手把纹样拼成一句吉话：莲配鱼是连年有余，蝠配桃是福寿双全。读懂剪纸「看图说吉话」的谐音与象征，边玩边学的非遗小游戏。',
  keywords: ['中国剪纸', '剪纸游戏', '非遗游戏', '窗花', '团花', '看图说吉话', '谐音吉语', '连年有余', '传统文化', 'HTML5游戏', '纸上生花'],
  openGraph: {
    title: '纸上生花｜中国剪纸文化游戏',
    description: '折一折、剪一刀、展开见花——在对称与镂空之间认识中国剪纸。',
    url: PAGE_URL,
    type: 'website',
    images: [{ url: COVER_URL, width: 1200, height: 630, alt: '纸上生花：中国剪纸文化游戏主视觉' }],
  },
};

export default function JianzhiPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: '纸上生花：剪纸文化游戏',
    url: PAGE_URL,
    image: COVER_URL,
    description: '以折叠、落剪、展开为核心交互的浏览器剪纸游戏，融入中国剪纸纹样寓意与地域文化。',
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
              古人用谐音与象征，把说不出口的心愿，剪成看得见的句子。
            </p>
            <p>
              本作把这套「语法」做成玩法：每章先<strong>读帖</strong>识源流与技法，再在工坊里<strong>折 → 剪 → 拼</strong>出目标吉语——纹样一凑齐，系统就点破它的成句原理；章末再用一道<strong>理解题</strong>把谐音或象征讲透。拼成的吉话都会收进「吉语图谱」。
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
