import Link from 'next/link';
import type { CulturePage } from '@/content/culture/types';
import { getCulturePageByPath } from '@/content/culture/registry';
import { SITE_DISCLAIMER } from '@/content/site';
import { buildCulturePageGraph, cultureBreadcrumbItems } from '@/core/seo/jsonld';
import { CultureCtaBanner } from './CultureCtaBanner';
import { CultureHero } from './CultureHero';
import { CultureHubGallery } from './CultureHubGallery';
import { CultureTermGrid } from './CultureTermGrid';
import { FaqList } from './FaqList';
import { GalleryFooter } from './GalleryFooter';
import { GalleryHeader } from './GalleryHeader';
import { JsonLd } from './JsonLd';
import { QuickAnswerBar } from './QuickAnswerBar';
import { SourceList } from './SourceList';

function labelForPath(path: string): string {
  const page = getCulturePageByPath(path);
  if (page) return page.h1;
  if (path.startsWith('/games/')) return '进入对应游戏';
  if (path === '/about/') return '关于本站';
  if (path === '/culture/') return '文化馆索引';
  return path;
}

export function CultureDocument({ page }: { page: CulturePage }) {
  const crumbs = cultureBreadcrumbItems(page);

  return (
    <div className="theme-gallery">
      <JsonLd data={buildCulturePageGraph(page)} />
      <GalleryHeader ctaHref={page.gameHref} ctaLabel="开始游玩" />
      <main>
        {page.kind === 'hub' ? (
          <CultureHubGallery page={page} crumbs={crumbs} />
        ) : (
          <>
            <CultureHero page={page} crumbs={crumbs} />
            <QuickAnswerBar sentences={page.quickAnswer} />
            <div className="culture-paper">
              <div className="culture-doc culture-paper__inner">
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
              </div>
            </div>
            <CultureCtaBanner page={page} />
          </>
        )}
      </main>
      <GalleryFooter />
    </div>
  );
}
