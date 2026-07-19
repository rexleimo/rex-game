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
    buildBreadcrumbJsonLd(cultureBreadcrumbItems(page)),
    buildFaqJsonLd(page.faq),
  ];
  if (page.howToSteps?.length) {
    graph.push(buildHowToJsonLd(page.h1, page.howToSteps));
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}
