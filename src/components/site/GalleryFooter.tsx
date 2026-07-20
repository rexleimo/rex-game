import Link from 'next/link';
import { games } from '@/core/gamesRegistry';
import { listCultureHubs } from '@/content/culture/registry';
import { SITE_DISCLAIMER, SITE_ORIGIN } from '@/content/site';

export function GalleryFooter() {
  const hubs = listCultureHubs();

  return (
    <footer className="gf">
      <div className="g-container">
        <p className="gf__wordmark">REX-GAME · 民艺馆</p>
        <div className="gf__grid">
          <nav aria-label="展品导航">
            <h3>展品</h3>
            <ul>
              {games.map((g) => (
                <li key={g.id}>
                  <Link href={g.href}>{g.name}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="文化馆导航">
            <h3>文化馆</h3>
            <ul>
              <li>
                <Link href="/culture/">索引</Link>
              </li>
              {hubs.map((h) => (
                <li key={h.path}>
                  <Link href={h.path}>{h.h1.replace(/？$/, '').slice(0, 12)}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="关于导航">
            <h3>关于</h3>
            <ul>
              <li>
                <Link href="/about/">本站说明</Link>
              </li>
              <li>
                <a href={SITE_ORIGIN}>{SITE_ORIGIN.replace('https://', '')}</a>
              </li>
            </ul>
          </nav>
        </div>
        <p className="gf__disclaimer">{SITE_DISCLAIMER}</p>
      </div>
    </footer>
  );
}
