import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SOLAR_TERMS, termsBySeason, termsInOrder } from '../src/games/ershisi-jieqi/content/terms.ts';
import { buildQuizDeck } from '../src/games/ershisi-jieqi/content/quiz.ts';
import {
  createInitialProgress,
  markSortCleared,
  parseProgress,
} from '../src/games/ershisi-jieqi/core/progress.ts';
import { games, getGame } from '../src/core/gamesRegistry.ts';
import { getCulturePage } from '../src/content/culture/registry.ts';
import { buildCulturePageGraph } from '../src/core/seo/jsonld.ts';

describe('ershisi-jieqi content', () => {
  it('has 24 ordered unique solar terms', () => {
    assert.equal(SOLAR_TERMS.length, 24);
    const orders = SOLAR_TERMS.map((t) => t.order).sort((a, b) => a - b);
    assert.deepEqual(orders, Array.from({ length: 24 }, (_, i) => i + 1));
    assert.equal(new Set(SOLAR_TERMS.map((t) => t.id)).size, 24);
    assert.equal(termsInOrder()[0].name, '立春');
    assert.equal(termsInOrder()[23].name, '大寒');
  });

  it('splits into four seasons of six', () => {
    for (const season of ['spring', 'summer', 'autumn', 'winter'] as const) {
      assert.equal(termsBySeason(season).length, 6);
    }
  });

  it('builds a quiz deck with valid answers', () => {
    const deck = buildQuizDeck(8);
    assert.equal(deck.length, 8);
    for (const item of deck) {
      assert.ok(item.options.length >= 2);
      assert.ok(item.answer >= 0 && item.answer < item.options.length);
    }
  });

  it('progress helpers work', () => {
    const p = markSortCleared(createInitialProgress(), 'spring');
    assert.deepEqual(p.sortCleared, ['spring']);
    const parsed = parseProgress(JSON.stringify(p));
    assert.equal(parsed.version, 1);
    assert.deepEqual(parsed.sortCleared, ['spring']);
  });
});

describe('registry wiring', () => {
  it('registers game and culture hub', () => {
    assert.ok(getGame('ershisi-jieqi'));
    assert.ok(games.some((g) => g.id === 'ershisi-jieqi'));
    assert.ok(getCulturePage('jieqi'));
    assert.equal(getCulturePage('jieqi')?.path, '/culture/jieqi/');
  });

  it('publishes concise answer-engine content and an article graph', () => {
    const hub = getCulturePage('jieqi');
    assert.ok(hub);
    assert.ok(hub.quickAnswer.length >= 3 && hub.quickAnswer.length <= 5);
    assert.ok(hub.quickAnswer.join('').length <= 80);

    const graph = buildCulturePageGraph(hub)['@graph'] as Array<Record<string, unknown>>;
    const article = graph.find((node) => node['@type'] === 'Article');
    assert.equal(article?.headline, hub.h1);
    assert.equal(article?.abstract, hub.quickAnswer.join(''));
    assert.equal(article?.inLanguage, 'zh-CN');
  });
});
