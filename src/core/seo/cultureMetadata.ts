import type { Metadata } from 'next';
import type { CulturePage } from '@/content/culture/types';
import { SITE_ORIGIN } from '@/content/site';

export function buildCultureMetadata(page: CulturePage, ogImage?: string): Metadata {
  const resolvedOgImage =
    ogImage ??
    page.ogImage ??
    (page.kind === 'hub'
      ? `/assets/og/culture-${page.hub}.png`
      : `/assets/og/culture-${page.hub}-${page.slug}.png`);
  const url = `${SITE_ORIGIN}${page.path}`;

  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    category: '文化教育',
    alternates: {
      canonical: page.path,
      languages: { 'zh-CN': page.path },
    },
    openGraph: {
      type: 'article',
      locale: 'zh_CN',
      siteName: 'rex-game',
      title: page.title,
      description: page.description,
      url,
      modifiedTime: page.dateModified,
      images: [{ url: resolvedOgImage, width: 1200, height: 630, alt: page.h1 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description,
      images: [resolvedOgImage],
    },
  };
}
