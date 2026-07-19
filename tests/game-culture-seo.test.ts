import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('yingge page has FAQ JSON-LD and culture hub link', () => {
  const src = readFileSync(new URL('../app/games/chaoshan-yingge/page.tsx', import.meta.url), 'utf8');
  assert.match(src, /FAQPage|faqItems|faq|buildFaqJsonLd/);
  assert.match(src, /\/culture\/yingge\//);
});

test('jianzhi page has FAQ JSON-LD and culture hub link', () => {
  const src = readFileSync(new URL('../app/games/jianzhi/page.tsx', import.meta.url), 'utf8');
  assert.match(src, /FAQPage|faqItems|faq|buildFaqJsonLd/);
  assert.match(src, /\/culture\/jianzhi\//);
});

test('jiaobei page links culture hub', () => {
  const src = readFileSync(new URL('../app/games/shantou-jiaobei/page.tsx', import.meta.url), 'utf8');
  assert.match(src, /\/culture\/jiaobei\//);
});
