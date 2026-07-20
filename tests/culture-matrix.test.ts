import assert from 'node:assert/strict';
import test from 'node:test';

const NEW_SLUGS = [
  'jiaobei-vs-qiuqian',
  'how-to-throw',
  'cheatsheet',
  'when-not-to-throw',
  'why-war-dance',
  'faces-cheatsheet',
  'yingge-vs-others',
  'getting-started',
  'motifs-cheatsheet',
  'south-vs-north',
];

test('culture pages meet depth standard (800+ chars, 4+ sections, sources, quickAnswer<=80)', async () => {
  const { listCulturePages } = await import('../src/content/culture/registry.ts');
  const pages = listCulturePages();
  assert.ok(pages.length >= 20, `expected >= 20 pages, got ${pages.length}`);
  for (const page of pages) {
    const body = page.sections.flatMap((s) => s.paragraphs).join('');
    const isNew = NEW_SLUGS.includes(page.slug);
    const faqMin = isNew ? 5 : 6;
    assert.ok(body.length >= 800, `${page.path} body ${body.length} < 800`);
    assert.ok(page.sections.length >= 4, `${page.path} sections ${page.sections.length} < 4`);
    assert.ok(page.faq.length >= faqMin, `${page.path} faq ${page.faq.length} < ${faqMin}`);
    assert.ok(page.sources.length >= 3, `${page.path} sources < 3`);
    assert.ok(page.quickAnswer.join('').length <= 80, `${page.path} quickAnswer > 80 chars`);
    assert.ok(
      page.readingMinutes && page.readingMinutes >= 3,
      `${page.path} readingMinutes missing`,
    );
    assert.ok(page.symbol, `${page.path} symbol missing`);
  }
});

test('ten new long-tail topics registered with slugs', async () => {
  const { listCulturePages } = await import('../src/content/culture/registry.ts');
  const slugs = listCulturePages().map((p) => p.slug);
  for (const slug of NEW_SLUGS) {
    assert.ok(slugs.includes(slug), `missing new topic: ${slug}`);
  }
});
