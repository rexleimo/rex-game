import type { MetadataRoute } from 'next';
import { games } from '@/core/gamesRegistry';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date('2026-07-17');

  const routes: MetadataRoute.Sitemap = [
    {
      url: 'https://game.rexai.top/',
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];

  for (const game of games) {
    const href = game.href.endsWith('/') ? game.href : `${game.href}/`;
    routes.push({
      url: `https://game.rexai.top${href}`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    });
  }

  return routes;
}
