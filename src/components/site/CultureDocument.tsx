import type { CulturePage } from '@/content/culture/types';
import { buildCulturePageGraph, cultureBreadcrumbItems } from '@/core/seo/jsonld';
import { CultureCtaBanner } from './CultureCtaBanner';
import { CultureHero } from './CultureHero';
import { CultureHubGallery } from './CultureHubGallery';
import { GalleryFooter } from './GalleryFooter';
import { GalleryHeader } from './GalleryHeader';
import { JsonLd } from './JsonLd';
import { QuickAnswerBar } from './QuickAnswerBar';
import { CultureSupplement } from './CultureSupplement';

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
                {/* CultureSupplement keeps the visible FaqList and SourceList aligned with JSON-LD. */}
                <CultureSupplement page={page} />
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
