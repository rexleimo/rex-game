import type { Metadata } from 'next';

import { YinggeGame } from '@/games/chaoshan-yingge/YinggeGame';
import styles from '@/games/chaoshan-yingge/YinggeGame.module.css';

const PAGE_URL = 'https://game.rexai.top/games/chaoshan-yingge/';
const COVER_URL = 'https://game.rexai.top/assets/yingge/cover.svg';

export const metadata: Metadata = {
  title: '潮汕英歌横版动作游戏｜战舞传说',
  description: '在浏览器中带领英歌队巡游前进，以棍舞近战、队形切换和节奏奖励击散瘴气阻障，体验潮汕英歌的群体气势。',
  keywords: ['潮汕英歌', '英歌舞', '潮阳英歌', '普宁英歌', '非遗游戏', '横版动作游戏', 'HTML5游戏'],
  openGraph: {
    title: '战舞传说｜潮汕英歌横版动作游戏',
    description: '战舞开路，合槌成阵。用自由格斗、节奏奖励与队形协同认识潮汕英歌。',
    url: PAGE_URL,
    type: 'website',
    images: [{ url: COVER_URL, width: 1200, height: 630, alt: '潮汕英歌横版动作游戏战舞传说主视觉' }],
  },
};

export default function ChaoshanYinggePage() {
  const structuredData = {
    '@context': 'https://schema.org',
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
          <h2>什么是潮汕英歌？</h2>
          <div>
            <p>
              英歌是流传于广东潮汕地区的群体性民俗舞蹈，表演融合节奏、击槌、步法、脸谱与队形变化。
              潮阳、普宁等地的速度、动作、角色和表演结构各有特色，因此本作会明确标注地区与资料性质。
            </p>
            <p>
              游戏中的锣鼓循环与战斗节奏是为了浏览器交互重新编排的奖励机制，不等同于任何一支真实英歌队的完整鼓谱。
              后续正式动作与录音需经过当地表演者审核并取得授权。
            </p>
          </div>
        </div>
        <div className="yingge-guide__notice">
          <strong>文化呈现原则</strong>
          <ul>
            <li>主线以学艺、排练、巡游与会演为叙事；敌对形象仅表现抽象瘴气和阻障，不把真实神祇当作普通敌人。</li>
            <li>资料记载、民间流传和游戏化演绎分别标识。</li>
            <li>不同地方版本并列介绍，不宣称某一种版本代表全部英歌。</li>
          </ul>
        </div>
      </article>
    </main>
  );
}
