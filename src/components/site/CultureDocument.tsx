import Link from 'next/link';
import type { CulturePage } from '@/content/culture/types';
import { getCulturePageByPath } from '@/content/culture/registry';
import { SITE_DISCLAIMER } from '@/content/site';
import { buildCulturePageGraph, cultureBreadcrumbItems } from '@/core/seo/jsonld';

function labelForPath(path: string): string {
  const page = getCulturePageByPath(path);
  if (page) return page.h1;
  if (path.startsWith('/games/')) return '进入对应游戏';
  if (path === '/about/') return '关于本站';
  if (path === '/culture/') return '文化馆索引';
  return path;
}

import { Breadcrumb } from './Breadcrumb';
import { CultureTermGrid } from './CultureTermGrid';
import { FaqList } from './FaqList';
import { JsonLd } from './JsonLd';
import { PlayCta } from './PlayCta';
import { QuickAnswer } from './QuickAnswer';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';
import { SourceList } from './SourceList';

export function CultureDocument({ page }: { page: CulturePage }) {
  const crumbs = cultureBreadcrumbItems(page);

  return (
    <div className="theme-museum site-root">
      <JsonLd data={buildCulturePageGraph(page)} />
      <SiteHeader ctaHref={page.gameHref} ctaLabel="开始游玩" />
      <main className="culture-doc">
        <Breadcrumb items={crumbs} />
        <h1>{page.h1}</h1>
        <QuickAnswer sentences={page.quickAnswer} />
        <PlayCta
          href={page.gameHref}
          label={`现在体验：${page.gameName}`}
          secondaryHref="/culture/"
          secondaryLabel="返回文化馆"
        />
        {page.sections.map((section) => (
          <section key={section.id} id={section.id}>
            <h2>{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </section>
        ))}
        {page.terms?.length ? (
          <section aria-labelledby="terms-heading">
            <h2 id="terms-heading">关键术语</h2>
            <CultureTermGrid terms={page.terms} />
          </section>
        ) : null}
        <FaqList items={page.faq} />
        <SourceList sources={page.sources} />
        {page.relatedPaths.length ? (
          <nav className="culture-doc__related" aria-label="相关阅读">
            <h2>相关阅读</h2>
            <ul>
              {page.relatedPaths.map((path) => (
                <li key={path}>
                  <Link href={path}>{labelForPath(path)}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
        <p className="culture-doc__disclaimer">{SITE_DISCLAIMER}</p>
      </main>
      <SiteFooter />
    </div>
  );
}
