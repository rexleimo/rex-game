'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { games } from '@/core/gamesRegistry';
import { SITE_NAV } from '@/content/site';

export function GalleryHeader({
  ctaHref,
  ctaLabel,
}: {
  ctaHref?: string;
  ctaLabel?: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const href = ctaHref ?? games[0]?.href ?? '/';
  const label = ctaLabel ?? '进入展厅';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`gh ${scrolled ? 'gh--scrolled' : ''}`}>
      <div className="gh__inner g-container">
        <Link className="gh__brand" href="/" aria-label="rex-game 首页">
          <span className="gh__wordmark">REX-GAME</span>
          <span className="gh__sub">民艺馆</span>
        </Link>
        <nav className="gh__nav" aria-label="主导航">
          {SITE_NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          <Link className="g-btn g-btn--primary gh__cta" href={href}>
            {label}
          </Link>
        </nav>
        <button
          type="button"
          className="gh__burger"
          aria-expanded={open}
          aria-label={open ? '关闭菜单' : '打开菜单'}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </div>
      {open ? (
        <nav className="gh__mobile" aria-label="移动端导航">
          {SITE_NAV.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link className="g-btn g-btn--primary" href={href} onClick={() => setOpen(false)}>
            {label}
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
