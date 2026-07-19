import type { SourceLink } from '@/content/culture/types';

export function SourceList({ sources, title = '资料来源' }: { sources: SourceLink[]; title?: string }) {
  return (
    <section aria-labelledby="sources-heading">
      <h2 id="sources-heading">{title}</h2>
      <ul className="source-list">
        {sources.map((source) => (
          <li key={source.href}>
            <a href={source.href} target="_blank" rel="noopener noreferrer">
              {source.name}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
