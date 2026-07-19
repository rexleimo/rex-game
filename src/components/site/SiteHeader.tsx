import Link from 'next/link';
import { games } from '@/core/gamesRegistry';
import { SITE_NAV } from '@/content/site';

export function SiteHeader({ ctaHref, ctaLabel }: { ctaHref?: string; ctaLabel?: string }) {
  const href = ctaHref ?? games[0]?.href ?? '/';
  const label = ctaLabel ?? '开始游玩';

  return (
    <header className="site-header">
      <Link className="site-header__brand" href="/" aria-label="rex-game 首页">
        <span className="site-header__wordmark">REX GAME</span>
        <span className="site-header__sub">趣玩民俗</span>
      </Link>
      <nav className="site-header__nav" aria-label="主导航">
        {SITE_NAV.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
        <Link className="btn-primary" href={href}>
          {label}
        </Link>
      </nav>
    </header>
  );
}
