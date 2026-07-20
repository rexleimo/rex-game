import assert from 'node:assert/strict';
import test from 'node:test';
import { listCulturePages, getCulturePage, listCultureHubs } from '../src/content/culture/registry.ts';
import { SITE_DISCLAIMER, SITE_ORIGIN } from '../src/content/site.ts';

const REQUIRED_PATHS = [
  '/culture/jiaobei/',
  '/culture/jiaobei/sheng-yin-xiao/',
  '/culture/jiaobei/how-to-read/',
  '/culture/jiaobei/online-vs-ritual/',
  '/culture/yingge/',
  '/culture/yingge/rhythm-and-formation/',
  '/culture/yingge/faces-and-roles/',
  '/culture/jianzhi/',
  '/culture/jianzhi/fold-and-cut/',
  '/culture/jianzhi/auspicious-motifs/',
];

test('SITE_ORIGIN and disclaimer are set', () => {
  assert.equal(SITE_ORIGIN, 'https://game.rexai.top');
  assert.ok(SITE_DISCLAIMER.includes('娱乐') || SITE_DISCLAIMER.includes('文化'));
});

test('registry lists all first-batch culture pages with SEO minimums', () => {
  const pages = listCulturePages();
  const paths = new Set(pages.map((p) => p.path));
  for (const path of REQUIRED_PATHS) {
    assert.ok(paths.has(path), `missing ${path}`);
  }
  for (const page of pages) {
    assert.ok(page.quickAnswer.length >= 1, `${page.path} needs quickAnswer sentences`);
    assert.ok(
      page.quickAnswer.join('').length <= 80,
      `${page.path} quickAnswer should stay ≤80 chars (spec 2 GEO 规范)`,
    );
    assert.ok(page.faq.length >= 4, `${page.path} needs ≥4 FAQ`);
    assert.ok(page.sources.length >= 1, `${page.path} needs sources`);
    assert.ok(page.h1.length > 0);
    assert.ok(page.description.length >= 40);
    assert.ok(page.gameHref.startsWith('/games/'));
    assert.match(page.dateModified, /^\d{4}-\d{2}-\d{2}$/);
  }
  assert.equal(listCultureHubs().length, 3);
});

test('getCulturePage resolves hub and topic', () => {
  const hub = getCulturePage('jiaobei');
  assert.ok(hub);
  assert.equal(hub.kind, 'hub');
  const topic = getCulturePage('jiaobei', 'sheng-yin-xiao');
  assert.ok(topic);
  assert.equal(topic.path, '/culture/jiaobei/sheng-yin-xiao/');
});
