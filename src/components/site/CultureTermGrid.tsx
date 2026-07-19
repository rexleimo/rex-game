import type { CultureTerm } from '@/content/culture/types';

export function CultureTermGrid({ terms }: { terms: CultureTerm[] }) {
  return (
    <div className="term-grid">
      {terms.map((term) => (
        <div className="term-card" key={term.name}>
          <strong>{term.name}</strong>
          <span>{term.meaning}</span>
        </div>
      ))}
    </div>
  );
}
