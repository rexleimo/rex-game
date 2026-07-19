import type { FaqItem } from '@/content/culture/types';

export function FaqList({ items, title = '常见问题' }: { items: FaqItem[]; title?: string }) {
  return (
    <section aria-labelledby="faq-heading">
      <h2 id="faq-heading">{title}</h2>
      <div className="faq-list">
        {items.map((item) => (
          <article className="faq-item" key={item.question}>
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
