import Link from 'next/link';
import type { GameMeta } from '@/core/gamesRegistry';

export function ExhibitCard({
  game,
  cultureHref,
}: {
  game: GameMeta;
  cultureHref: string;
}) {
  return (
    <article className="exhibit-card">
      <img className="exhibit-card__cover" src={game.cover} alt="" />
      <div className="exhibit-card__body">
        {game.badge ? <span className="exhibit-card__badge">{game.badge}</span> : null}
        <h3>{game.name}</h3>
        <p>{game.tagline}</p>
        <div className="exhibit-card__actions">
          <Link className="btn-primary" href={game.href}>
            开始游玩
          </Link>
          <Link className="btn-secondary" href={cultureHref}>
            读文化
          </Link>
        </div>
      </div>
    </article>
  );
}
