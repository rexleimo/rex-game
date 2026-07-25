import { SITE_ORIGIN } from '../../content/site.ts';
import type { CulturePage, FaqItem } from '../../content/culture/types.ts';

export function buildFaqJsonLd(faq: FaqItem[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export function buildBreadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_ORIGIN}${item.path.startsWith('/') ? item.path : `/${item.path}`}`,
    })),
  };
}

export function buildWebPageJsonLd(
  page: Pick<CulturePage, 'path' | 'title' | 'description' | 'dateModified'>,
) {
  const url = `${SITE_ORIGIN}${page.path}`;
  return {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: page.title,
    description: page.description,
    inLanguage: 'zh-CN',
    dateModified: page.dateModified,
    isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
    mainEntity: { '@id': `${url}#article` },
  };
}

export function buildCultureArticleJsonLd(page: CulturePage) {
  const url = `${SITE_ORIGIN}${page.path}`;
  const image =
    page.ogImage ??
    (page.kind === 'hub'
      ? `/assets/og/culture-${page.hub}.png`
      : `/assets/og/culture-${page.hub}-${page.slug}.png`);

  return {
    '@type': 'Article',
    '@id': `${url}#article`,
    mainEntityOfPage: { '@id': `${url}#webpage` },
    headline: page.h1,
    description: page.description,
    abstract: page.quickAnswer.join(''),
    image: `${SITE_ORIGIN}${image}`,
    inLanguage: 'zh-CN',
    dateModified: page.dateModified,
    keywords: page.keywords.join('，'),
    articleSection: page.sections.map((section) => section.title),
    author: {
      '@type': 'Organization',
      name: 'rex-game',
      url: SITE_ORIGIN,
    },
    publisher: {
      '@type': 'Organization',
      name: 'rex-game',
      url: SITE_ORIGIN,
    },
    about: (page.terms ?? []).map((term) => ({
      '@type': 'DefinedTerm',
      name: term.name,
      description: term.meaning,
    })),
    citation: page.sources.map((source) => ({
      '@type': 'CreativeWork',
      name: source.name,
      url: source.href,
    })),
  };
}

export function buildHowToJsonLd(name: string, steps: { name: string; text: string }[]) {
  return {
    '@type': 'HowTo',
    name,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

const HUB_LABEL: Record<string, string> = {
  jiaobei: '潮汕掷筊',
  yingge: '潮汕英歌',
  jianzhi: '中国剪纸',
  jieqi: '二十四节气',
};

export function cultureBreadcrumbItems(page: CulturePage): { name: string; path: string }[] {
  const crumbs = [
    { name: 'rex-game', path: '/' },
    { name: '文化馆', path: '/culture/' },
  ];
  if (page.kind === 'topic') {
    crumbs.push({
      name: HUB_LABEL[page.hub] ?? page.hub,
      path: `/culture/${page.hub}/`,
    });
  }
  crumbs.push({ name: page.h1, path: page.path });
  return crumbs;
}

export function buildCulturePageGraph(page: CulturePage) {
  const graph: object[] = [
    buildWebPageJsonLd(page),
    buildCultureArticleJsonLd(page),
    buildBreadcrumbJsonLd(cultureBreadcrumbItems(page)),
    buildFaqJsonLd(page.faq),
  ];
  if (page.howToSteps?.length) {
    graph.push(buildHowToJsonLd(page.h1, page.howToSteps));
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}
