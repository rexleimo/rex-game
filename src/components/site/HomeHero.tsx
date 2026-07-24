import Link from 'next/link';
import { games } from '@/core/gamesRegistry';
import { HeroInstallation } from './HeroInstallation';

export function HomeHero() {
  const featured = games[0];

  return (
    <section className="hero">
      <div className="g-container hero__inner">
        <div className="hero__copy">
          <p className="g-label hero__eyebrow">可玩的民俗文化馆 · INTERACTIVE FOLK MUSEUM</p>
          <h1 className="g-display hero__title">
            一座可以玩的
            <br />
            中国<em>民艺馆</em>
          </h1>
          <p className="hero__lead">
            修器物读典故、掷筊问愿、英歌合槌、折剪生花——可玩文化展品,无需下载,即开即玩;边玩边了解背后的故事与称法。
          </p>
          <div className="hero__actions">
            <Link className="g-btn g-btn--primary" href={featured?.href ?? '/culture/'}>
              进入展厅
            </Link>
            <Link className="g-btn g-btn--ghost" href="/culture/">
              先去文化馆
            </Link>
          </div>
        </div>
        <HeroInstallation />
      </div>
      <p className="hero__scrollhint">向下滚动 · 逛展品</p>
    </section>
  );
}
