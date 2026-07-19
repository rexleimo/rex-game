import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCulturePageGraph, buildFaqJsonLd } from '../src/core/seo/jsonld.ts';
import { getCulturePage } from '../src/content/culture/registry.ts';

test('FAQ JSON-LD maps questions', () => {
  const ld = buildFaqJsonLd([{ question: 'Q1', answer: 'A1' }]) as {
    '@type': string;
    mainEntity: { name: string; acceptedAnswer: { text: string } }[];
  };
  assert.equal(ld['@type'], 'FAQPage');
  assert.equal(ld.mainEntity[0].name, 'Q1');
  assert.equal(ld.mainEntity[0].acceptedAnswer.text, 'A1');
});

test('culture page graph includes WebPage FAQ Breadcrumb', () => {
  const page = getCulturePage('jiaobei');
  assert.ok(page);
  const graph = buildCulturePageGraph(page) as { '@graph': { '@type': string }[] };
  const types = new Set(graph['@graph'].map((n) => n['@type']));
  assert.ok(types.has('WebPage'));
  assert.ok(types.has('BreadcrumbList'));
  assert.ok(types.has('FAQPage'));
});
