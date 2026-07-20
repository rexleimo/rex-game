import Link from 'next/link';
import type { CulturePage } from '@/content/culture/types';
import { listCulturePages } from '@/content/culture/registry';
import { Breadcrumb } from './Breadcrumb';
import { CultureCtaBanner } from './CultureCtaBanner';
import { CultureHero } from './CultureHero';
import { QuickAnswerBar } from './QuickAnswerBar';

export function CultureHubGallery({
  page,
  crumbs,
}: {
  page: CulturePage;
  crumbs: { name: string; path: string }[];
}) {
  const topics = listCulturePages().filter((p) => p.kind === 'topic' && p.hub === page.hub);

  return (
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
        </div>
      </div>
      <section className="g-section g-container" aria-labelledby="hub-topics">
        <div className="gsh">
          <span className="gsh__index">专题</span>
          <h2 className="gsh__title" id="hub-topics">
            继续读
          </h2>
          <span className="gsh__note">{topics.length} 篇专题</span>
        </div>
        <div className="chub__grid">
          {topics.map((topic) => (
            <Link className="chub__card" key={topic.path} href={topic.path}>
              <span className="chub__card-title">{topic.h1}</span>
              <span className="chub__card-teaser">{topic.quickAnswer.join('').slice(0, 48)}……</span>
              <span className="chub__card-meta">
                {topic.readingMinutes ? `阅读 ${topic.readingMinutes} 分钟` : '专题导读'} →
              </span>
            </Link>
          ))}
        </div>
      </section>
      <CultureCtaBanner page={page} />
    </>
  );
}
