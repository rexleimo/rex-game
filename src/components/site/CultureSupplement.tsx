import Link from 'next/link';
import type { CulturePage } from '@/content/culture/types';
import { getCulturePageByPath } from '@/content/culture/registry';
import { SITE_DISCLAIMER } from '@/content/site';
import { CultureTermGrid } from './CultureTermGrid';
import { FaqList } from './FaqList';
import { SourceList } from './SourceList';

function labelForPath(path: string): string {
  const page = getCulturePageByPath(path);
  if (page) return page.h1;
  if (path.startsWith('/games/')) return '进入对应游戏';
  if (path === '/about/') return '关于本站';
  if (path === '/culture/') return '文化馆索引';
  return path;
}

/** Shared reference material stays visible wherever its JSON-LD is published. */
export function CultureSupplement({ page }: { page: CulturePage }) {
  return (
    <>
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
    </>
  );
}
