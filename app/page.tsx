import Link from 'next/link';
import { games } from '@/core/gamesRegistry';

export default function HomePage() {
  const exhibit = games[0];

  return (
    <main className="home-exhibit">
      <header className="home-exhibit__rail rise">
        <Link className="home-exhibit__wordmark" href="/" aria-label="rex game 首页">REX GAME</Link>
        <span>浏览器中的民俗小游戏</span>
        <span className="home-exhibit__edition">展品 01 / 01</span>
      </header>

      <section className="home-exhibit__hero">
        <div className="home-exhibit__copy rise">
          <p className="home-exhibit__kicker">当前展品 / 潮汕掷筊</p>
          <h1>潮汕圣杯，一掷见心</h1>
          <p className="home-exhibit__lead">将心愿默念于双手之间，等两片筊杯落定。每一次落杯，都是给自己的一段停顿。</p>
          <Link className="home-exhibit__cta" href={exhibit.href}>开始这一问 <span aria-hidden>→</span></Link>
          <p className="home-exhibit__privacy">无需下载。摄像头画面仅在本地浏览器内处理。</p>
        </div>

        <figure className="home-exhibit__still rise" style={{ animationDelay: '100ms' }}>
          <img src="/assets/jiaobei-hero.png" alt="潮汕圣杯游戏中的两片真实 3D 筊杯落在木质台面上" />
          <figcaption>
            <span>实时 3D 场景静帧</span>
            <span>双杯 / 自由落体</span>
          </figcaption>
        </figure>
      </section>

      <section className="home-exhibit__record rise" style={{ animationDelay: '180ms' }} aria-label="展品资料">
        <p>当前展品</p>
        <h2>{exhibit.name}</h2>
        <p>{exhibit.tagline}</p>
        <dl>
          <div><dt>媒介</dt><dd>浏览器 / 实时物理</dd></div>
          <div><dt>交互</dt><dd>手势或手动掷杯</dd></div>
          <div><dt>提示</dt><dd>仅供娱乐，不构成建议</dd></div>
        </dl>
      </section>

      <footer className="home-exhibit__footer">REX GAME · 以轻巧的互动，留住片刻的好奇。</footer>
    </main>
  );
}
