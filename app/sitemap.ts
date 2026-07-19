import type { MetadataRoute } from 'next';
import { games } from '@/core/gamesRegistry';
import { listCulturePages } from '@/content/culture/registry';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date('2026-07-20');

  const routes: MetadataRoute.Sitemap = [
    {
      url: 'https://game.rexai.top/',
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://game.rexai.top/about/',
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: 'https://game.rexai.top/culture/',
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.85,
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

  for (const page of listCulturePages()) {
    routes.push({
      url: `https://game.rexai.top${page.path}`,
      lastModified: new Date(page.dateModified),
      changeFrequency: 'monthly',
      priority: page.kind === 'hub' ? 0.8 : 0.7,
    });
  }

  return routes;
}
